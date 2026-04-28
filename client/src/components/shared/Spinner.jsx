/**
 * Renders a compact loading indicator or a full-screen loading state.
 *
 * @param {{fullscreen?: boolean, label?: string}} props - Spinner props.
 * @returns {JSX.Element}
 */
const Spinner = ({ fullscreen = false, label = 'Loading' }) => {
  const content = (
    <div className="flex items-center justify-center gap-3 text-sm font-semibold text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-rydo-accent" />
      <span>{label}</span>
    </div>
  );

  if (fullscreen) {
    return <div className="fixed inset-0 z-[1000] grid place-items-center bg-white/80">{content}</div>;
  }

  return content;
};

export default Spinner;
