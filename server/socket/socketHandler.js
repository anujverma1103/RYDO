const Driver = require('../models/Driver');
const Ride = require('../models/Ride');

let ioInstance = null;

/**
 * Registers Socket.io connection handlers used by passengers and drivers.
 *
 * @param {import('socket.io').Server} io - Socket.io server instance.
 * @returns {void}
 */
const socketHandler = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('join-room', (userId) => {
      if (userId) {
        socket.join(userId.toString());
      }
    });

    socket.on('driver-location', async ({ rideId, lat, lng, driverId }) => {
      try {
        const ride = await Ride.findById(rideId).select('passengerId driverId status');

        if (!ride || !ride.passengerId) {
          return;
        }

        if (driverId && ride.driverId?.toString() === driverId.toString()) {
          await Driver.findByIdAndUpdate(driverId, {
            currentLocation: {
              lat,
              lng
            }
          });
        }

        io.to(ride.passengerId.toString()).emit('location-update', {
          rideId,
          lat,
          lng
        });
      } catch (error) {
        socket.emit('socket-error', { message: 'Unable to share driver location' });
      }
    });
  });
};

/**
 * Returns the initialized Socket.io instance for controller-level emits.
 *
 * @returns {import('socket.io').Server}
 */
const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized');
  }

  return ioInstance;
};

module.exports = socketHandler;
module.exports.getIO = getIO;
