import { useEffect, useRef, useState } from 'react';
import { FaLocationDot } from 'react-icons/fa6';
import { searchAddress } from '../../services/nominatimService';

/**
 * Address input with debounced Nominatim autocomplete.
 *
 * @param {{placeholder:string, onSelect:Function, defaultValue?: string, label?: string}} props - Search props.
 * @returns {JSX.Element}
 */
const LocationSearch = ({ placeholder, onSelect, defaultValue = '', label }) => {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const ignoreNextSearch = useRef(false);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (ignoreNextSearch.current) {
      ignoreNextSearch.current = false;
      return undefined;
    }

    if (query.trim().length < 3) {
      setResults([]);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const suggestions = await searchAddress(query);
        setResults(suggestions);
        setOpen(true);
      } catch (searchError) {
        setError(searchError.message);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [query]);

  const handleSelect = (result) => {
    ignoreNextSearch.current = true;
    setQuery(result.display_name);
    setOpen(false);
    setResults([]);
    onSelect(result.display_name, result.lat, result.lon);
  };

  return (
    <div className="relative">
      {label ? <label className="form-label">{label}</label> : null}
      <div className="relative">
        <FaLocationDot className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="form-input pl-9"
        />
      </div>
      {loading ? <p className="mt-1 text-xs font-semibold text-slate-500">Searching...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {open && results.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-[1001] mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-soft">
          {results.map((result) => (
            <button
              key={`${result.lat}-${result.lon}-${result.display_name}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(result)}
              className="w-full border-b border-slate-100 px-3 py-3 text-left text-sm font-medium text-slate-700 last:border-b-0 hover:bg-slate-50"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default LocationSearch;
