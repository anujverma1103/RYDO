import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaArrowRight, FaCar, FaCarSide, FaIndianRupeeSign, FaMoneyBillWave, FaTaxi } from 'react-icons/fa6';
import LocationSearch from '../../components/map/LocationSearch';
import RouteMap from '../../components/map/RouteMap';
import VehicleCard from '../../components/ui/VehicleCard';
import api from '../../services/api';
import { getRoute } from '../../services/orsService';
import { calculateFare } from '../../utils/fareCalculator';
import { formatCurrency, shortAddress } from '../../utils/formatters';

const vehicleOptions = [
  { name: 'Auto', rate: '₹8/km', icon: FaTaxi },
  { name: 'Sedan', rate: '₹12/km', icon: FaCarSide },
  { name: 'SUV', rate: '₹18/km', icon: FaCar }
];

const steps = ['Locations', 'Vehicle', 'Payment'];

/**
 * Loads the Razorpay checkout script once.
 *
 * @returns {Promise<boolean>}
 */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Passenger ride booking wizard.
 *
 * @returns {JSX.Element}
 */
const BookRide = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [route, setRoute] = useState([]);
  const [routeMeta, setRouteMeta] = useState(null);
  const [vehicleType, setVehicleType] = useState('Auto');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [booking, setBooking] = useState(false);

  const selectedFare = useMemo(() => calculateFare(vehicleType, routeMeta?.distance_km || 0), [routeMeta?.distance_km, vehicleType]);

  const updateRoute = async (nextPickup, nextDrop) => {
    if (!nextPickup || !nextDrop) {
      return;
    }

    try {
      setLoadingRoute(true);
      const routeResult = await getRoute([nextPickup.lng, nextPickup.lat], [nextDrop.lng, nextDrop.lat]);
      setRoute(routeResult.coordinates);
      setRouteMeta(routeResult);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingRoute(false);
    }
  };

  const handlePickupSelect = (address, lat, lng) => {
    const nextPickup = { address, lat, lng };
    setPickup(nextPickup);
    updateRoute(nextPickup, drop);
  };

  const handleDropSelect = (address, lat, lng) => {
    const nextDrop = { address, lat, lng };
    setDrop(nextDrop);
    updateRoute(pickup, nextDrop);
  };

  const canContinueFromLocations = pickup && drop && routeMeta;

  const createRide = async () => {
    const payload = {
      pickup,
      drop,
      vehicleType,
      fare: selectedFare,
      distance: routeMeta.distance_km,
      duration: routeMeta.duration_min,
      paymentMethod
    };
    const { data } = await api.post('/rides/book', payload);
    return data.ride;
  };

  const handleOnlinePayment = async (ride) => {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      throw new Error('Razorpay checkout could not be loaded');
    }

    const { data: order } = await api.post('/payment/create-order', { rideId: ride._id });

    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'RYDO',
        description: `${vehicleType} ride payment`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        prefill: {
          name: 'RYDO Passenger'
        },
        theme: {
          color: '#6C63FF'
        }
      });

      checkout.on('payment.failed', () => reject(new Error('Payment failed')));
      checkout.open();
    });
  };

  const handleConfirm = async () => {
    if (!canContinueFromLocations) {
      toast.error('Select pickup and drop locations first');
      return;
    }

    try {
      setBooking(true);
      const ride = await createRide();

      if (paymentMethod === 'online') {
        await handleOnlinePayment(ride);
        toast.success('Payment successful');
      } else {
        toast.success('Ride booked successfully');
      }

      navigate(`/passenger/ride/${ride._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[430px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-rydo-accent">Book Ride</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">{steps[step]}</h1>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-2">
            {steps.map((item, index) => (
              <div key={item} className={`h-2 rounded-full ${index <= step ? 'bg-rydo-accent' : 'bg-slate-200'}`} />
            ))}
          </div>

          {step === 0 ? (
            <div className="grid gap-4">
              <LocationSearch label="Pickup" placeholder="Search pickup location" onSelect={handlePickupSelect} defaultValue={pickup?.address || ''} />
              <LocationSearch label="Drop" placeholder="Search drop location" onSelect={handleDropSelect} defaultValue={drop?.address || ''} />
              {routeMeta ? (
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Distance</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{routeMeta.distance_km} km</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Time</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{routeMeta.duration_min} min</p>
                  </div>
                </div>
              ) : null}
              {loadingRoute ? <p className="text-sm font-semibold text-slate-500">Calculating route...</p> : null}
              <button type="button" disabled={!canContinueFromLocations} onClick={() => setStep(1)} className="primary-btn w-full py-3">
                Continue
                <FaArrowRight />
              </button>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-3">
              {vehicleOptions.map((vehicle) => (
                <VehicleCard
                  key={vehicle.name}
                  vehicle={vehicle.name}
                  rate={vehicle.rate}
                  fare={calculateFare(vehicle.name, routeMeta?.distance_km || 0)}
                  eta={routeMeta?.duration_min}
                  selected={vehicleType === vehicle.name}
                  onSelect={() => setVehicleType(vehicle.name)}
                  icon={vehicle.icon}
                />
              ))}
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="secondary-btn flex-1 py-3">
                  <FaArrowLeft />
                  Back
                </button>
                <button type="button" onClick={() => setStep(2)} className="primary-btn flex-1 py-3">
                  Continue
                  <FaArrowRight />
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-900">{shortAddress(pickup?.address)}</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{shortAddress(drop?.address)}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <span className="rounded-lg bg-slate-100 px-3 py-2 font-bold text-slate-700">{vehicleType}</span>
                  <span className="rounded-lg bg-slate-100 px-3 py-2 font-bold text-slate-700">{routeMeta?.distance_km} km</span>
                  <span className="rounded-lg bg-slate-100 px-3 py-2 font-bold text-slate-700">{routeMeta?.duration_min} min</span>
                </div>
                <p className="mt-4 text-3xl font-black text-slate-900">{formatCurrency(selectedFare)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`rounded-lg border p-4 text-left transition ${paymentMethod === 'online' ? 'border-rydo-accent bg-rydo-accent/5' : 'border-slate-200 bg-white'}`}
                >
                  <FaIndianRupeeSign className="text-rydo-accent" />
                  <span className="mt-3 block text-sm font-black text-slate-900">Online</span>
                  <span className="text-xs font-semibold text-slate-500">Razorpay Test</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`rounded-lg border p-4 text-left transition ${paymentMethod === 'cod' ? 'border-rydo-accent bg-rydo-accent/5' : 'border-slate-200 bg-white'}`}
                >
                  <FaMoneyBillWave className="text-green-600" />
                  <span className="mt-3 block text-sm font-black text-slate-900">Cash</span>
                  <span className="text-xs font-semibold text-slate-500">After ride</span>
                </button>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="secondary-btn flex-1 py-3">
                  <FaArrowLeft />
                  Back
                </button>
                <button type="button" disabled={booking} onClick={handleConfirm} className="primary-btn flex-1 py-3">
                  {booking ? 'Processing...' : paymentMethod === 'online' ? `Pay ${formatCurrency(selectedFare)}` : 'Confirm Booking'}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="h-[520px] lg:h-[calc(100vh-3rem)]">
          <RouteMap pickup={pickup} drop={drop} route={route} className="h-full min-h-full w-full" />
        </section>
      </div>
    </div>
  );
};

export default BookRide;
