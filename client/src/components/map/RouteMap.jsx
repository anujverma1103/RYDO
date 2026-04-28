import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

export const DEFAULT_CENTER = [28.6139, 77.209];

export const pickupIcon = L.divIcon({
  className: '',
  html: '<div class="rydo-pin rydo-pin-pickup"></div>',
  iconSize: [28, 28],
  iconAnchor: [11, 22]
});

export const dropIcon = L.divIcon({
  className: '',
  html: '<div class="rydo-pin rydo-pin-drop"></div>',
  iconSize: [28, 28],
  iconAnchor: [11, 22]
});

export const driverIcon = L.divIcon({
  className: '',
  html: '<div class="driver-car"><span class="driver-car-window"></span></div>',
  iconSize: [38, 28],
  iconAnchor: [19, 14]
});

/**
 * Keeps the Leaflet viewport focused on route and marker bounds.
 *
 * @param {{pickup?: object, drop?: object, route?: Array}} props - Bounds props.
 * @returns {null}
 */
export const FitToRoute = ({ pickup, drop, route = [] }) => {
  const map = useMap();

  useEffect(() => {
    const points = [];

    if (pickup?.lat && pickup?.lng) {
      points.push([pickup.lat, pickup.lng]);
    }

    if (drop?.lat && drop?.lng) {
      points.push([drop.lat, drop.lng]);
    }

    if (route.length > 0) {
      points.push(...route);
    }

    if (points.length === 1) {
      map.setView(points[0], 14);
    }

    if (points.length > 1) {
      map.fitBounds(points, {
        padding: [40, 40],
        maxZoom: 15
      });
    }
  }, [drop, map, pickup, route]);

  return null;
};

/**
 * Displays pickup/drop markers and a route polyline using OpenStreetMap tiles.
 *
 * @param {{pickup?: object, drop?: object, route?: Array<[number, number]>, className?: string, children?: import('react').ReactNode}} props - Map props.
 * @returns {JSX.Element}
 */
const RouteMap = ({ pickup, drop, route = [], className = 'h-full min-h-[360px] w-full', children }) => {
  const center = pickup?.lat && pickup?.lng ? [pickup.lat, pickup.lng] : DEFAULT_CENTER;

  return (
    <div className={`overflow-hidden rounded-lg border border-slate-200 ${className}`}>
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap contributors" />
        <FitToRoute pickup={pickup} drop={drop} route={route} />
        {pickup?.lat && pickup?.lng ? (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>{pickup.address || 'Pickup'}</Popup>
          </Marker>
        ) : null}
        {drop?.lat && drop?.lng ? (
          <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
            <Popup>{drop.address || 'Drop'}</Popup>
          </Marker>
        ) : null}
        {route.length > 0 ? <Polyline positions={route} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.82 }} /> : null}
        {children}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
