const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    profilePic: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['driver'],
      default: 'driver'
    },
    vehicleType: {
      type: String,
      enum: ['Auto', 'Sedan', 'SUV'],
      required: true
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    currentLocation: {
      lat: {
        type: Number,
        default: 28.6139
      },
      lng: {
        type: Number,
        default: 77.209
      }
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

driverSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

/**
 * Compares a plain-text password with the stored bcrypt password hash.
 *
 * @param {string} candidatePassword - Password provided during login.
 * @returns {Promise<boolean>}
 */
driverSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

driverSchema.methods.toJSON = function toJSON() {
  const driver = this.toObject();
  delete driver.password;
  return driver;
};

module.exports = mongoose.model('Driver', driverSchema);
