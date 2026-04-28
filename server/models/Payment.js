const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    method: {
      type: String,
      enum: ['online', 'cod'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    razorpayOrderId: {
      type: String,
      default: ''
    },
    razorpayPaymentId: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
