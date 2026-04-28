const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const rideSchema = new mongoose.Schema(
  {
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
    pickup: {
      type: locationSchema,
      required: true
    },
    drop: {
      type: locationSchema,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'started', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    vehicleType: {
      type: String,
      enum: ['Auto', 'Sedan', 'SUV'],
      required: true
    },
    fare: {
      type: Number,
      required: true,
      min: 1
    },
    distance: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
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
    otp: {
      type: String,
      required: true,
      default: () => Math.floor(1000 + Math.random() * 9000).toString()
    },
    passengerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('Ride', rideSchema);
