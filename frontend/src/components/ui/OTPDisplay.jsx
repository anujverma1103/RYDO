/**
 * Displays the passenger ride OTP in a large readable format.
 *
 * @param {{otp: string}} props - OTP props.
 * @returns {JSX.Element}
 */
const OTPDisplay = ({ otp }) => (
  <div className="rounded-lg border border-dashed border-rydo-accent bg-rydo-accent/5 p-4 text-center">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Share with driver</p>
    <p className="mt-2 font-mono text-4xl font-black tracking-[0.25em] text-rydo-accent">{otp}</p>
  </div>
);

export default OTPDisplay;
