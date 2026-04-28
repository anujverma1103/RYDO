import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import DriverTracker from '../../components/map/DriverTracker';
import OTPDisplay from '../../components/ui/OTPDisplay';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/shared/Spinner';
import api from '../../services/api';
import { getRoute } from '../../services/orsService';
import { RideContext } from '../../context/RideContext';
import { formatCurrency } from '../../utils/formatters';

const timeline = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'started', label: 'Started' },
  { key: 'completed', label: 'Completed' }
];

/**
 * Passenger live ride tracking page with status, OTP, and rating.
 *
 * @returns {JSX.Element}
 */
const RideTracking = () => {
  const { id } = useParams();
  const { currentRide, driverLocation, setCurrentRide } = useContext(RideContext);
  const [ride, setRide] = useState(null);
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const loadRide = async () => {
      try {
        const { data } = await api.get(`/rides/${id}`);
        setRide(data.ride);
        setCurrentRide(data.ride);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Ride not found');
      } finally {
        setLoading(false);
      }
    };

    loadRide();
  }, [id, setCurrentRide]);

  useEffect(() => {
    if (currentRide?._id === id) {
      setRide(currentRide);
    }
  }, [currentRide, id]);

  useEffect(() => {
    const loadRoute = async () => {
      if (!ride?.pickup || !ride?.drop) {
        return;
      }

      try {
        const routeResult = await getRoute([ride.pickup.lng, ride.pickup.lat], [ride.drop.lng, ride.drop.lat]);
        setRoute(routeResult.coordinates);
      } catch (error) {
        setRoute([]);
      }
    };

    loadRoute();
  }, [ride?.drop, ride?.pickup]);

  const activeIndex = useMemo(() => {
    if (!ride) {
      return 0;
    }

    if (ride.status === 'cancelled') {
      return -1;
    }

    return timeline.findIndex((item) => item.key === ride.status);
  }, [ride]);

  const cancelRide = async () => {
    try {
      const { data } = await api.put(`/rides/${id}/cancel`);
      setRide(data.ride);
      setCurrentRide(data.ride);
      toast.success('Ride cancelled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel ride');
    }
  };

  const submitRating = async () => {
    try {
      setSubmittingRating(true);
      const { data } = await api.post(`/rides/${id}/rate`, { rating });
      setRide(data.ride);
      toast.success('Rating submitted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <Spinner fullscreen label="Loading ride" />;
  }

  if (!ride) {
    return <div className="p-6 text-sm font-semibold text-slate-600">Ride not found</div>;
  }

  const liveDriverLocation = driverLocation || ride.driverId?.currentLocation || null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="h-[55vh] p-4">
        <DriverTracker pickup={ride.pickup} drop={ride.drop} route={route} driverLocation={liveDriverLocation} className="h-full min-h-full w-full" />
      </div>

      <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Ride Tracking</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">{formatCurrency(ride.fare)} · {ride.vehicleType}</p>
            </div>
            <StatusBadge status={ride.status} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {timeline.map((item, index) => (
              <div key={item.key} className={`rounded-lg border p-3 ${index <= activeIndex ? 'border-rydo-accent bg-rydo-accent/5' : 'border-slate-200 bg-white'}`}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Step {index + 1}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{item.label}</p>
              </div>
            ))}
          </div>

          {ride.driverId ? (
            <div className="mt-6 rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Driver</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-slate-900">{ride.driverId.name}</p>
                  <p className="text-sm font-semibold text-slate-500">{ride.driverId.vehicleNumber}</p>
                </div>
                <p className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <FaStar />
                  {ride.driverId.rating?.average || 0}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="grid gap-4">
          {ride.status !== 'completed' && ride.status !== 'cancelled' ? <OTPDisplay otp={ride.otp} /> : null}

          {ride.status === 'pending' ? (
            <button type="button" onClick={cancelRide} className="secondary-btn border-red-200 text-red-600 hover:bg-red-50">
              Cancel Ride
            </button>
          ) : null}

          {ride.status === 'completed' && !ride.passengerRating ? (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-black text-slate-900">Rate Driver</p>
              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className={star <= rating ? 'text-2xl text-amber-400' : 'text-2xl text-slate-300'} aria-label={`${star} stars`}>
                    <FaStar />
                  </button>
                ))}
              </div>
              <button type="button" disabled={submittingRating} onClick={submitRating} className="primary-btn mt-4 w-full">
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

export default RideTracking;
