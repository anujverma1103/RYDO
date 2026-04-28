import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { formatCurrency, formatDate, shortAddress } from '../../utils/formatters';
import StatusBadge from './StatusBadge';

/**
 * Compact ride summary for dashboards and history lists.
 *
 * @param {{ride: object, to?: string, actionLabel?: string}} props - Card props.
 * @returns {JSX.Element}
 */
const RideCard = ({ ride, to, actionLabel = 'View' }) => {
  const content = (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">{formatDate(ride.createdAt)}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{ride.vehicleType}</p>
        </div>
        <StatusBadge status={ride.status} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="min-w-0 truncate">{shortAddress(ride.pickup?.address)}</span>
        <FaArrowRight className="shrink-0 text-slate-400" />
        <span className="min-w-0 truncate">{shortAddress(ride.drop?.address)}</span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-500">{ride.paymentMethod === 'cod' ? 'Cash' : 'Online'} payment</span>
        <span className="font-black text-slate-900">{formatCurrency(ride.fare)}</span>
      </div>
    </div>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} aria-label={actionLabel} className="block transition hover:-translate-y-0.5">
      {content}
    </Link>
  );
};

export default RideCard;
