import { useCallback, useState } from 'react';

const DELHI_CENTER = { lat: 28.6139, lng: 77.209 };

/**
 * Provides browser geolocation with a New Delhi fallback.
 *
 * @returns {{location:{lat:number,lng:number}, loading:boolean, error:string, detectLocation:Function}}
 */
export const useLocation = () => {
  const [location, setLocation] = useState(DELHI_CENTER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser');
      return;
    }

    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      () => {
        setError('Unable to detect current location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }, []);

  return {
    location,
    loading,
    error,
    detectLocation
  };
};
