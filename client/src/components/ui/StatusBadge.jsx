import { statusLabels } from '../../utils/formatters';

const styles = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  started: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  online: 'bg-green-100 text-green-700',
  offline: 'bg-slate-200 text-slate-600'
};

/**
 * Displays a status value as a colored pill.
 *
 * @param {{status: string, label?: string}} props - Badge props.
 * @returns {JSX.Element}
 */
const StatusBadge = ({ status, label }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
    {label || statusLabels[status] || status}
  </span>
);

export default StatusBadge;
