import { useEffect, useState } from 'react';

/**
 * Shows a depleting countdown bar and calls onExpire when time runs out.
 *
 * @param {{seconds?: number, onExpire?: Function}} props - Countdown props.
 * @returns {JSX.Element}
 */
const CountdownBar = ({ seconds = 30, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const interval = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          onExpire?.();
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [onExpire, seconds]);

  const width = `${(remaining / seconds) * 100}%`;

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
        <span>Accept window</span>
        <span>{remaining}s</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-red-100">
        <div className="h-full rounded-full bg-red-500 transition-all duration-1000" style={{ width }} />
      </div>
    </div>
  );
};

export default CountdownBar;
