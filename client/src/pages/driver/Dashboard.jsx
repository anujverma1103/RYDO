import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaLocationDot, FaPowerOff, FaRoute } from 'react-icons/fa6';
import api from '../../services/api';
import CountdownBar from '../../components/ui/CountdownBar';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/shared/Spinner';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { formatCurrency, shortAddress } from '../../utils/formatters';

/**
 * Driver home screen with online toggle and live incoming ride requests.
 *
 * @returns {JSX.Element}
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, updateStoredUser } = useContext(AuthContext);
  const { on, off } = useSocket();
  const [profile, setProfile] = useState(user);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const isOnline = Boolean(profile?.isOnline);

  const loadAvailableRides = useCallback(async () => {
    if (!isOnline) {
      setRequests([]);
      return;
    }

    const { data } = await api.get('/driver/available-rides');
    setRequests(data.rides.map((ride) => ({ ...ride, receivedAt: Date.now() })));
  }, [isOnline]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/driver/profile');
        setProfile(data.user);
        updateStoredUser(data.user);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [updateStoredUser]);

  useEffect(() => {
    loadAvailableRides().catch(() => {});
  }, [loadAvailableRides]);

  useEffect(() => {
    const handleNewRide = ({ ride }) => {
      if (!isOnline || !ride) {
        return;
      }

      setRequests((current) => {
        if (current.some((item) => item._id === ride._id)) {
          return current;
        }

        return [{ ...ride, receivedAt: Date.now() }, ...current];
      });
      toast.success('New ride request');
    };

    on?.('new-ride-request', handleNewRide);

    return () => {
      off?.('new-ride-request', handleNewRide);
    };
  }, [isOnline, off, on]);

  const toggleStatus = async () => {
    try {
      setToggling(true);
      const { data } = await api.put('/driver/toggle-status');
      setProfile(data.user);
      updateStoredUser(data.user);
      toast.success(data.isOnline ? 'You are online' : 'You are offline');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update status');
    } finally {
      setToggling(false);
    }
  };

  const removeRequest = useCallback((rideId) => {
    setRequests((current) => current.filter((ride) => ride._id !== rideId));
  }, []);

  const acceptRide = async (rideId) => {
    try {
      const { data } = await api.put(`/rides/${rideId}/accept`);
      toast.success('Ride accepted');
      navigate(`/driver/ride/${data.ride._id}`);
    } catch (error) {
      removeRequest(rideId);
      toast.error(error.response?.data?.message || 'Ride is no longer available');
    }
  };

  if (loading) {
    return <Spinner fullscreen label="Loading driver dashboard" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-rydo-accent">Driver</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">Welcome, {profile?.name?.split(' ')[0]}</h1>
            </div>
            <button
              type="button"
              disabled={toggling}
              onClick={toggleStatus}
              className={`inline-flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-black text-white transition ${isOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-500 hover:bg-slate-600'}`}
            >
              <FaPowerOff />
              {toggling ? 'Updating...' : isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </section>

        {!isOnline ? (
          <section className="mt-6 grid min-h-[55vh] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-100 p-8 text-center">
            <div>
              <p className="text-2xl font-black text-slate-800">You are offline.</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">Go online to receive ride requests.</p>
            </div>
          </section>
        ) : (
          <section className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Incoming requests</h2>
              <StatusBadge status="online" label="Receiving" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {requests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center font-semibold text-slate-500 md:col-span-2">Waiting for ride requests</div>
              ) : null}
              {requests.map((ride) => (
                <article key={ride._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-slate-900">{ride.passengerId?.name?.split(' ')[0] || 'Passenger'}</p>
                      <p className="mt-1 text-sm font-bold text-rydo-accent">{ride.vehicleType}</p>
                    </div>
                    <p className="text-xl font-black text-slate-900">{formatCurrency(ride.fare)}</p>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-700">
                    <p className="flex items-start gap-2">
                      <FaLocationDot className="mt-1 shrink-0 text-green-600" />
                      {shortAddress(ride.pickup?.address)}
                    </p>
                    <p className="flex items-start gap-2">
                      <FaRoute className="mt-1 shrink-0 text-red-600" />
                      {shortAddress(ride.drop?.address)}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <span className="rounded-lg bg-slate-100 px-3 py-2 font-bold text-slate-700">{ride.distance} km</span>
                    <span className="rounded-lg bg-slate-100 px-3 py-2 font-bold text-slate-700">{ride.duration} min</span>
                  </div>
                  <div className="mt-4">
                    <CountdownBar seconds={30} onExpire={() => removeRequest(ride._id)} />
                  </div>
                  <button type="button" onClick={() => acceptRide(ride._id)} className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-700">
                    Accept
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
