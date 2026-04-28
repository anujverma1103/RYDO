import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import DriverTracker from '../../components/map/DriverTracker';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/shared/Spinner';
import api from '../../services/api';
import { getRoute } from '../../services/orsService';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { formatCurrency, shortAddress } from '../../utils/formatters';

/**
 * Driver active ride page with OTP start, completion, and location emitting.
 *
 * @returns {JSX.Element}
 */
const ActiveRide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { emit } = useSocket();
  const [ride, setRide] = useState(null);
  const [route, setRoute] = useState([]);
  const [otp, setOtp] = useState('');
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadRide = async () => {
      try {
        const { data } = await api.get(`/rides/${id}`);
        setRide(data.ride);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load ride');
      } finally {
        setLoading(false);
      }
    };

    loadRide();
  }, [id]);

  useEffect(() => {
    const loadRoute = async () => {
      if (!ride?.pickup || !ride?.drop) {
        return;
      }

      try {
        const start = ride.status === 'started' ? ride.pickup : ride.pickup;
        const end = ride.status === 'started' ? ride.drop : ride.pickup;
        const routeResult =
          start === end
            ? await getRoute([ride.pickup.lng, ride.pickup.lat], [ride.drop.lng, ride.drop.lat])
            : await getRoute([start.lng, start.lat], [end.lng, end.lat]);
        setRoute(routeResult.coordinates);
      } catch (error) {
        setRoute([]);
      }
    };

    loadRoute();
  }, [ride?.drop, ride?.pickup, ride?.status]);

  useEffect(() => {
    if (!ride || !['accepted', 'started'].includes(ride.status)) {
      return undefined;
    }

    const shareLocation = () => {
      if (!navigator.geolocation) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setDriverLocation(nextLocation);
          emit('driver-location', {
            rideId: ride._id,
            driverId: user?._id,
            ...nextLocation
          });
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 8000
        }
      );
    };

    shareLocation();
    const interval = window.setInterval(shareLocation, 5000);
    return () => window.clearInterval(interval);
  }, [emit, ride, user?._id]);

  const startRide = async () => {
    try {
      setActionLoading(true);
      const { data } = await api.put(`/rides/${id}/start`, { otp });
      setRide(data.ride);
      toast.success('Ride started');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setActionLoading(false);
    }
  };

  const completeRide = async () => {
    try {
      setActionLoading(true);
      const { data } = await api.put(`/rides/${id}/complete`);
      setRide(data.ride);
      toast.success('Ride completed');
      navigate('/driver/earnings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to complete ride');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Spinner fullscreen label="Loading active ride" />;
  }

  if (!ride) {
    return <div className="p-6 text-sm font-semibold text-slate-600">Ride not found</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="h-[55vh] p-4">
        <DriverTracker pickup={ride.pickup} drop={ride.drop} route={route} driverLocation={driverLocation || user?.currentLocation} className="h-full min-h-full w-full" />
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-rydo-accent">Active Ride</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">{ride.status === 'started' ? 'Ride in Progress' : 'Navigate to Pickup'}</h1>
            </div>
            <StatusBadge status={ride.status} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Passenger</p>
              <p className="mt-1 text-lg font-black text-slate-900">{ride.passengerId?.name || 'Passenger'}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{ride.passengerId?.phone}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Fare</p>
              <p className="mt-1 text-lg font-black text-slate-900">{formatCurrency(ride.fare)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{ride.paymentMethod === 'cod' ? 'Cash' : 'Online'} · {ride.paymentStatus}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <p className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700">{shortAddress(ride.pickup?.address)}</p>
            <p className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700">{shortAddress(ride.drop?.address)}</p>
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {ride.status === 'accepted' ? (
            <>
              <label className="form-label">Passenger OTP</label>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))}
                className="form-input text-center font-mono text-2xl font-black tracking-[0.25em]"
                placeholder="0000"
                inputMode="numeric"
              />
              <button type="button" disabled={actionLoading || otp.length !== 4} onClick={startRide} className="primary-btn mt-4 w-full py-3">
                {actionLoading ? 'Starting...' : 'Start Ride'}
              </button>
            </>
          ) : null}

          {ride.status === 'started' ? (
            <>
              {ride.paymentMethod === 'cod' ? (
                <div className="mb-4 rounded-lg bg-amber-100 p-4 text-sm font-black text-amber-800">Collect {formatCurrency(ride.fare)} cash</div>
              ) : null}
              <button type="button" disabled={actionLoading} onClick={completeRide} className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-700">
                {actionLoading ? 'Completing...' : 'Complete Ride'}
              </button>
            </>
          ) : null}

          {ride.status === 'completed' ? (
            <div className="rounded-lg bg-green-100 p-4 text-sm font-black text-green-700">Ride completed successfully</div>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

export default ActiveRide;
