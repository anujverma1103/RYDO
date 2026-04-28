import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

export const RideContext = createContext(null);

/**
 * Tracks the active ride and live driver location from Socket.io events.
 *
 * @param {{children: import('react').ReactNode}} props - Provider props.
 * @returns {JSX.Element}
 */
export const RideProvider = ({ children }) => {
  const { on, off } = useSocket();
  const [currentRide, setCurrentRide] = useState(null);
  const [rideStatus, setRideStatus] = useState('');
  const [driverLocation, setDriverLocation] = useState(null);

  const updateRide = useCallback((ride) => {
    if (!ride) {
      return;
    }

    setCurrentRide(ride);
    setRideStatus(ride.status);

    if (ride.driverId?.currentLocation) {
      setDriverLocation(ride.driverId.currentLocation);
    }
  }, []);

  useEffect(() => {
    const handleRideAccepted = ({ ride }) => updateRide(ride);
    const handleRideStarted = ({ ride }) => updateRide(ride);
    const handleRideCompleted = ({ ride }) => updateRide(ride);
    const handleLocationUpdate = ({ lat, lng }) => setDriverLocation({ lat, lng });

    on?.('ride-accepted', handleRideAccepted);
    on?.('ride-started', handleRideStarted);
    on?.('ride-completed', handleRideCompleted);
    on?.('location-update', handleLocationUpdate);

    return () => {
      off?.('ride-accepted', handleRideAccepted);
      off?.('ride-started', handleRideStarted);
      off?.('ride-completed', handleRideCompleted);
      off?.('location-update', handleLocationUpdate);
    };
  }, [off, on, updateRide]);

  const clearRide = useCallback(() => {
    setCurrentRide(null);
    setRideStatus('');
    setDriverLocation(null);
  }, []);

  const value = useMemo(
    () => ({
      clearRide,
      currentRide,
      driverLocation,
      rideStatus,
      setCurrentRide: updateRide
    }),
    [clearRide, currentRide, driverLocation, rideStatus, updateRide]
  );

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};
