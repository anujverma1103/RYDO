const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Searches Indian addresses with Nominatim and returns compact result objects.
 *
 * @param {string} query - User-entered address text.
 * @returns {Promise<Array<{display_name:string, lat:number, lon:number}>>}
 */
export const searchAddress = async (query) => {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    format: 'json',
    limit: '5',
    countrycodes: 'in',
    addressdetails: '1'
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'RYDO-App'
    }
  });

  if (!response.ok) {
    throw new Error('Unable to search addresses right now');
  }

  const data = await response.json();

  return data.map((item) => ({
    display_name: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon)
  }));
};

/**
 * Reverse geocodes a latitude/longitude pair into a readable address.
 *
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @returns {Promise<string>}
 */
export const reverseGeocode = async (lat, lng) => {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json'
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'RYDO-App'
    }
  });

  if (!response.ok) {
    throw new Error('Unable to detect this address');
  }

  const data = await response.json();
  return data.display_name || 'Selected location';
};
