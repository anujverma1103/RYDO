import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import RideCard from '../../components/ui/RideCard';
import Spinner from '../../components/shared/Spinner';

const filters = ['all', 'completed', 'cancelled'];

/**
 * Passenger ride history with status filters.
 *
 * @returns {JSX.Element}
 */
const History = () => {
  const [rides, setRides] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRides = async () => {
      try {
        const { data } = await api.get('/rides/my');
        setRides(data.rides);
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, []);

  const filteredRides = useMemo(() => (filter === 'all' ? rides : rides.filter((ride) => ride.status === filter)), [filter, rides]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-rydo-accent">Passenger</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Ride History</h1>
          </div>
          <div className="flex rounded-lg bg-white p-1 shadow-sm">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-md px-3 py-2 text-sm font-bold capitalize ${filter === item ? 'bg-rydo-accent text-white' : 'text-slate-500'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {loading ? <Spinner label="Loading history" /> : null}
          {!loading && filteredRides.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center font-semibold text-slate-500">No rides found</div> : null}
          {filteredRides.map((ride) => (
            <RideCard key={ride._id} ride={ride} to={`/passenger/ride/${ride._id}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
