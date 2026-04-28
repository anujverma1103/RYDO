const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const asyncHandler = require('../utils/asyncHandler');
const { getIO } = require('../socket/socketHandler');

/**
 * Emits a Socket.io event. It becomes a no-op during non-server contexts such
 * as seed scripts where Socket.io has not been initialized.
 *
 * @param {string|null} room - Socket room or null for broadcast.
 * @param {string} event - Event name.
 * @param {object} payload - Event payload.
 * @returns {void}
 */
const emitRideEvent = (room, event, payload) => {
  try {
    const io = getIO();

    if (room) {
      io.to(room.toString()).emit(event, payload);
      return;
    }

    io.emit(event, payload);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`Socket emit skipped: ${event}`);
    }
  }
};

/**
 * Loads a ride with passenger and driver profile fields.
 *
 * @param {string} rideId - MongoDB ride id.
 * @returns {Promise<object|null>}
 */
const getPopulatedRide = (rideId) =>
  Ride.findById(rideId)
    .populate('passengerId', 'name phone profilePic')
    .populate('driverId', 'name phone profilePic vehicleType vehicleNumber rating currentLocation');

/**
 * Creates a pending ride and broadcasts the request to connected drivers.
 */
const bookRide = asyncHandler(async (req, res) => {
  const ride = await Ride.create({
    passengerId: req.user.id,
    pickup: req.body.pickup,
    drop: req.body.drop,
    vehicleType: req.body.vehicleType,
    fare: req.body.fare,
    distance: req.body.distance,
    duration: req.body.duration,
    paymentMethod: req.body.paymentMethod,
    otp: Math.floor(1000 + Math.random() * 9000).toString()
  });

  const populatedRide = await getPopulatedRide(ride._id);
  emitRideEvent(null, 'new-ride-request', { ride: populatedRide });

  return res.status(201).json({ ride: populatedRide });
});

/**
 * Allows a driver to accept a pending ride.
 */
const acceptRide = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.user.id);

  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  const ride = await Ride.findOneAndUpdate(
    {
      _id: req.params.id,
      status: 'pending'
    },
    {
      driverId: req.user.id,
      status: 'accepted'
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!ride) {
    return res.status(400).json({ message: 'Ride is no longer available' });
  }

  const populatedRide = await getPopulatedRide(ride._id);
  emitRideEvent(ride.passengerId, 'ride-accepted', { ride: populatedRide, driver });

  return res.json({ ride: populatedRide });
});

/**
 * Starts an accepted ride after validating the passenger-provided OTP.
 */
const startRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({
    _id: req.params.id,
    driverId: req.user.id
  });

  if (!ride) {
    return res.status(404).json({ message: 'Ride not found' });
  }

  if (ride.status !== 'accepted') {
    return res.status(400).json({ message: 'Only accepted rides can be started' });
  }

  if (ride.otp !== req.body.otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  ride.status = 'started';
  await ride.save();

  const populatedRide = await getPopulatedRide(ride._id);
  emitRideEvent(ride.passengerId, 'ride-started', { ride: populatedRide });

  return res.json({ ride: populatedRide });
});

/**
 * Completes an in-progress ride, updates driver earnings, and marks COD rides
 * as paid after cash collection.
 */
const completeRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({
    _id: req.params.id,
    driverId: req.user.id
  });

  if (!ride) {
    return res.status(404).json({ message: 'Ride not found' });
  }

  if (ride.status !== 'started') {
    return res.status(400).json({ message: 'Only started rides can be completed' });
  }

  ride.status = 'completed';

  if (ride.paymentMethod === 'cod') {
    ride.paymentStatus = 'paid';
  }

  await ride.save();

  await Driver.findByIdAndUpdate(req.user.id, {
    $inc: {
      totalEarnings: ride.fare
    }
  });

  if (ride.paymentMethod === 'cod') {
    await Payment.findOneAndUpdate(
      { rideId: ride._id },
      {
        rideId: ride._id,
        passengerId: ride.passengerId,
        driverId: req.user.id,
        amount: ride.fare,
        method: 'cod',
        status: 'paid'
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
  }

  const populatedRide = await getPopulatedRide(ride._id);
  emitRideEvent(ride.passengerId, 'ride-completed', {
    ride: populatedRide,
    fareSummary: {
      fare: ride.fare,
      paymentMethod: ride.paymentMethod,
      paymentStatus: ride.paymentStatus
    }
  });

  return res.json({ ride: populatedRide });
});

/**
 * Cancels a pending ride owned by the authenticated passenger.
 */
const cancelRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({
    _id: req.params.id,
    passengerId: req.user.id
  });

  if (!ride) {
    return res.status(404).json({ message: 'Ride not found' });
  }

  if (ride.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending rides can be cancelled' });
  }

  ride.status = 'cancelled';
  await ride.save();

  const populatedRide = await getPopulatedRide(ride._id);

  if (ride.driverId) {
    emitRideEvent(ride.driverId, 'ride-cancelled', { ride: populatedRide });
  }

  return res.json({ ride: populatedRide });
});

/**
 * Returns a ride when it belongs to the current passenger or driver.
 */
const getRideById = asyncHandler(async (req, res) => {
  const ride = await getPopulatedRide(req.params.id);

  if (!ride) {
    return res.status(404).json({ message: 'Ride not found' });
  }

  const isPassenger = ride.passengerId?._id?.toString() === req.user.id;
  const isDriver = ride.driverId?._id?.toString() === req.user.id;
  const canSeePendingDriverRide = req.user.role === 'driver' && ride.status === 'pending';

  if (!isPassenger && !isDriver && !canSeePendingDriverRide) {
    return res.status(403).json({ message: 'You cannot access this ride' });
  }

  return res.json({ ride });
});

/**
 * Returns rides booked by the authenticated passenger.
 */
const getMyRides = asyncHandler(async (req, res) => {
  const rides = await Ride.find({ passengerId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('driverId', 'name phone profilePic vehicleType vehicleNumber rating currentLocation');

  return res.json({ rides });
});

/**
 * Returns all pending ride requests for online drivers.
 */
const getAvailableRides = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.user.id);

  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  if (!driver.isOnline) {
    return res.json({ rides: [] });
  }

  const rides = await Ride.find({
    status: 'pending'
  })
    .sort({ createdAt: -1 })
    .populate('passengerId', 'name phone profilePic');

  return res.json({ rides });
});

/**
 * Adds a passenger rating to a completed ride and updates the driver's rating
 * average.
 */
const rateRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({
    _id: req.params.id,
    passengerId: req.user.id
  });

  if (!ride) {
    return res.status(404).json({ message: 'Ride not found' });
  }

  if (ride.status !== 'completed') {
    return res.status(400).json({ message: 'Only completed rides can be rated' });
  }

  if (!ride.driverId) {
    return res.status(400).json({ message: 'This ride has no assigned driver' });
  }

  const previousRating = ride.passengerRating;
  ride.passengerRating = req.body.rating;
  await ride.save();

  const driver = await Driver.findById(ride.driverId);

  if (driver) {
    const currentTotal = driver.rating.average * driver.rating.count;
    const nextCount = previousRating ? driver.rating.count : driver.rating.count + 1;
    const nextTotal = previousRating
      ? currentTotal - previousRating + req.body.rating
      : currentTotal + req.body.rating;

    driver.rating.average = Number((nextTotal / nextCount).toFixed(1));
    driver.rating.count = nextCount;
    await driver.save();
  }

  const populatedRide = await getPopulatedRide(ride._id);
  return res.json({ ride: populatedRide });
});

/**
 * Ensures a provided id is a valid MongoDB ObjectId before route handlers run.
 */
const validateRideId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ride id' });
  }

  return next();
};

module.exports = {
  acceptRide,
  bookRide,
  cancelRide,
  completeRide,
  getAvailableRides,
  getMyRides,
  getRideById,
  rateRide,
  startRide,
  validateRideId
};
