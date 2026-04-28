const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const asyncHandler = require('../utils/asyncHandler');
const { serializeAccount } = require('./authController');

/**
 * Returns the authenticated driver's profile.
 */
const getProfile = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.user.id);

  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  return res.json({ user: serializeAccount(driver) });
});

/**
 * Flips the driver's online status and returns the updated driver profile.
 */
const toggleOnlineStatus = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.user.id);

  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  driver.isOnline = !driver.isOnline;
  await driver.save();

  return res.json({
    isOnline: driver.isOnline,
    user: serializeAccount(driver)
  });
});

/**
 * Aggregates completed ride earnings for today, this week, this month, and all
 * time for the authenticated driver.
 */
const getEarnings = asyncHandler(async (req, res) => {
  const driverObjectId = new mongoose.Types.ObjectId(req.user.id);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totals, byDate, recentRides] = await Promise.all([
    Ride.aggregate([
      {
        $match: {
          driverId: driverObjectId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          today: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', todayStart] }, '$fare', 0]
            }
          },
          week: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', weekStart] }, '$fare', 0]
            }
          },
          month: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', monthStart] }, '$fare', 0]
            }
          },
          total: {
            $sum: '$fare'
          },
          totalRides: {
            $sum: 1
          }
        }
      }
    ]),
    Ride.aggregate([
      {
        $match: {
          driverId: driverObjectId,
          status: 'completed',
          createdAt: {
            $gte: monthStart
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          total: {
            $sum: '$fare'
          },
          rides: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]),
    Ride.find({
      driverId: req.user.id,
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('passengerId', 'name')
  ]);

  const summary = totals[0] || {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    totalRides: 0
  };

  return res.json({
    earnings: {
      today: summary.today,
      week: summary.week,
      month: summary.month,
      total: summary.total,
      totalRides: summary.totalRides,
      byDate: byDate.map((entry) => ({
        date: entry._id,
        total: entry.total,
        rides: entry.rides
      }))
    },
    recentRides
  });
});

/**
 * Returns completed ride history for the authenticated driver.
 */
const getHistory = asyncHandler(async (req, res) => {
  const rides = await Ride.find({
    driverId: req.user.id,
    status: 'completed'
  })
    .sort({ createdAt: -1 })
    .populate('passengerId', 'name phone profilePic');

  return res.json({ rides });
});

/**
 * Updates editable driver profile fields.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      phone: req.body.phone
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  return res.json({ user: serializeAccount(driver) });
});

module.exports = {
  getEarnings,
  getHistory,
  getProfile,
  toggleOnlineStatus,
  updateProfile
};
