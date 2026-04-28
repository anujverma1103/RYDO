import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCarSide, FaLocationCrosshairs } from 'react-icons/fa6';
import api from '../../services/api';
import RouteMap from '../../components/map/RouteMap';
import RideCard from '../../components/ui/RideCard';
import Spinner from '../../components/shared/Spinner';
import { AuthContext } from '../../context/AuthContext';
import { useLocation } from '../../hooks/useLocation';

/**
 * Passenger dashboard with current map view and recent rides.
 *
 * @returns {JSX.Element}
 */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { location, detectLocation, loading: locating } = useLocation();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  useEffect(() => {
    const loadRides = async () => {
      try {
        const { data } = await api.get('/rides/my');
        setRides(data.rides.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, []);

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[420px_1fr]">
      <section className="order-2 border-r border-slate-200 bg-white p-4 lg:order-1 lg:p-6">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-rydo-accent">Passenger</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">Hi, {user?.name?.split(' ')[0]}</h1>
        </div>

        <Link to="/passenger/book" className="block rounded-lg border border-slate-200 bg-rydo-navy p-5 text-white shadow-soft transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/10 text-xl">
              <FaCarSide />
            </span>
            <FaArrowRight />
          </div>
          <h2 className="mt-5 text-2xl font-black">Book a Ride</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Search pickup and drop, choose a vehicle, and confirm payment.</p>
        </Link>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Recent rides</h2>
          <Link to="/passenger/history" className="text-sm font-bold text-rydo-accent">
            View all
          </Link>
        </div>

        <div className="mt-4 grid gap-3">
          {loading ? <Spinner label="Loading rides" /> : null}
          {!loading && rides.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm font-semibold text-slate-500">No rides yet</div>
          ) : null}
          {rides.map((ride) => (
            <RideCard key={ride._id} ride={ride} to={`/passenger/ride/${ride._id}`} />
          ))}
        </div>
      </section>

      <section className="order-1 h-[46vh] p-4 lg:order-2 lg:h-screen lg:p-6">
        <div className="relative h-full">
          <RouteMap
            pickup={{
              address: 'Current location',
              lat: location.lat,
              lng: location.lng
            }}
            className="h-full min-h-full w-full"
          />
          <button
            type="button"
            onClick={detectLocation}
            className="absolute right-4 top-4 z-[500] inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-soft"
          >
            <FaLocationCrosshairs />
            {locating ? 'Detecting' : 'Locate me'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
