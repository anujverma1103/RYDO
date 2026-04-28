import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getRoute = async (pickupLngLat, dropLngLat) => {
  const response = await axios.post(`${API_URL}/api/map/route`, {
    pickup: pickupLngLat,
    drop: dropLngLat
  });

  const data = response.data;
  const segment = data.routes?.[0];
  if (!segment) throw new Error('Route not found');

  // Decode polyline geometry
  const coords = decodePolyline(segment.geometry);

  return {
    coordinates: coords,
    rawCoordinates: coords.map(([lat, lng]) => [lng, lat]),
    distance_km: Number((segment.summary.distance / 1000).toFixed(2)),
    duration_min: Math.max(1, Math.round(segment.summary.duration / 60))
  };
};

// Polyline decoder
function decodePolyline(encoded) {
  let index = 0, lat = 0, lng = 0;
  const coords = [];
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}