const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Builds a Razorpay client from environment credentials.
 *
 * @returns {Razorpay}
 */
const createRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

/**
 * Creates a Razorpay test-mode order for an online ride payment.
 */
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({
    _id: req.body.rideId,
    passengerId: req.user.id
  });

  if (!ride) {
    return res.status(404).json({ message: 'Ride not found' });
  }

  if (ride.paymentMethod !== 'online') {
    return res.status(400).json({ message: 'Razorpay orders are only for online payments' });
  }

  const razorpay = createRazorpayClient();
  const order = await razorpay.orders.create({
    amount: Math.round(ride.fare * 100),
    currency: 'INR',
    receipt: `ride_${ride._id.toString().slice(-24)}`,
    notes: {
      rideId: ride._id.toString(),
      passengerId: ride.passengerId.toString()
    }
  });

  ride.razorpayOrderId = order.id;
  await ride.save();

  await Payment.findOneAndUpdate(
    { rideId: ride._id },
    {
      rideId: ride._id,
      passengerId: ride.passengerId,
      driverId: ride.driverId,
      amount: ride.fare,
      method: 'online',
      status: 'pending',
      razorpayOrderId: order.id
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return res.status(201).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID
  });
});

/**
 * Verifies Razorpay's HMAC signature and marks the ride/payment as paid.
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  const ride = await Ride.findOneAndUpdate(
    {
      razorpayOrderId,
      passengerId: req.user.id
    },
    {
      paymentStatus: 'paid',
      razorpayPaymentId
    },
    {
      new: true
    }
  );

  if (!ride) {
    return res.status(404).json({ message: 'Ride not found for payment order' });
  }

  const payment = await Payment.findOneAndUpdate(
    {
      razorpayOrderId
    },
    {
      rideId: ride._id,
      passengerId: ride.passengerId,
      driverId: ride.driverId,
      amount: ride.fare,
      method: 'online',
      status: 'paid',
      razorpayOrderId,
      razorpayPaymentId
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  return res.json({
    message: 'Payment verified successfully',
    ride,
    payment
  });
});

module.exports = {
  createRazorpayOrder,
  verifyPayment
};
