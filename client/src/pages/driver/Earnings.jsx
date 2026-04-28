import { useEffect, useState } from 'react';
import api from '../../services/api';
import Spinner from '../../components/shared/Spinner';
import RideCard from '../../components/ui/RideCard';
import { formatCurrency } from '../../utils/formatters';

/**
 * Driver earnings dashboard with totals and recent completed rides.
 *
 * @returns {JSX.Element}
 */
const Earnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const { data } = await api.get('/driver/earnings');
        setEarnings(data.earnings);
        setRecentRides(data.recentRides);
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, []);

  if (loading) {
    return <Spinner fullscreen label="Loading earnings" />;
  }

  const stats = [
    ['Today', earnings?.today || 0],
    ['This Week', earnings?.week || 0],
    ['This Month', earnings?.month || 0],
    ['Total Rides', earnings?.totalRides || 0]
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-rydo-accent">Driver</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">Earnings</h1>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value], index) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{index === 3 ? value : formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-black text-slate-900">Recent rides</h2>
          <div className="mt-4 grid gap-4">
            {recentRides.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center font-semibold text-slate-500">No completed rides yet</div> : null}
            {recentRides.map((ride) => (
              <RideCard key={ride._id} ride={ride} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Earnings;
