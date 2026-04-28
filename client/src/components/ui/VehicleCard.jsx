import { formatCurrency } from '../../utils/formatters';

/**
 * Selectable vehicle option card used in the booking wizard.
 *
 * @param {{vehicle:string, rate:string, fare:number, eta:number, selected:boolean, onSelect:Function, icon: import('react').ComponentType}} props - Card props.
 * @returns {JSX.Element}
 */
const VehicleCard = ({ vehicle, rate, fare, eta, selected, onSelect, icon: Icon }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`flex w-full items-center gap-4 rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${
      selected ? 'border-rydo-accent ring-2 ring-rydo-accent/20' : 'border-slate-200'
    }`}
  >
    <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-xl text-rydo-accent">
      <Icon />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-base font-bold text-slate-900">{vehicle}</span>
      <span className="block text-sm text-slate-500">{rate}</span>
      <span className="block text-xs font-semibold text-slate-500">{eta || 1} min ETA</span>
    </span>
    <span className="text-lg font-black text-slate-900">{formatCurrency(fare)}</span>
  </button>
);

export default VehicleCard;
