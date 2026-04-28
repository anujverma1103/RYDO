import { useEffect, useState } from 'react';
import { searchAddress } from '../services/nominatimService';

/**
 * Debounced Nominatim address search hook.
 *
 * @param {string} query - Address query.
 * @param {number} delay - Debounce delay in milliseconds.
 * @returns {{results:Array, loading:boolean, error:string}}
 */
export const useNominatim = (query, delay = 800) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setResults([]);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        setResults(await searchAddress(trimmedQuery));
      } catch (searchError) {
        setError(searchError.message);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay, query]);

  return {
    results,
    loading,
    error
  };
};
