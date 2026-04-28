import { useEffect, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import RouteMap, { driverIcon } from './RouteMap';

/**
 * Route map with an animated driver marker.
 *
 * @param {{pickup?: object, drop?: object, route?: Array, driverLocation?: {lat:number,lng:number}, className?: string}} props - Tracker props.
 * @returns {JSX.Element}
 */
const DriverTracker = ({ pickup, drop, route = [], driverLocation, className }) => {
  const [animatedLocation, setAnimatedLocation] = useState(driverLocation || null);
  const previousLocation = useRef(driverLocation || null);

  useEffect(() => {
    if (!driverLocation?.lat || !driverLocation?.lng) {
      return undefined;
    }

    if (!previousLocation.current) {
      previousLocation.current = driverLocation;
      setAnimatedLocation(driverLocation);
      return undefined;
    }

    const start = previousLocation.current;
    const end = driverLocation;
    const duration = 700;
    let frameId = 0;
    let startedAt = 0;

    const animate = (time) => {
      if (!startedAt) {
        startedAt = time;
      }

      const progress = Math.min((time - startedAt) / duration, 1);
      setAnimatedLocation({
        lat: start.lat + (end.lat - start.lat) * progress,
        lng: start.lng + (end.lng - start.lng) * progress
      });

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        previousLocation.current = end;
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [driverLocation?.lat, driverLocation?.lng]);

  return (
    <RouteMap pickup={pickup} drop={drop} route={route} className={className}>
      {animatedLocation?.lat && animatedLocation?.lng ? (
        <Marker position={[animatedLocation.lat, animatedLocation.lng]} icon={driverIcon}>
          <Popup>Driver location</Popup>
        </Marker>
      ) : null}
    </RouteMap>
  );
};

export default DriverTracker;
