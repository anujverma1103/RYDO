const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { serializeAccount } = require('./authController');

/**
 * Returns the authenticated passenger profile.
 */
const getProfile = asyncHandler(async (req, res) => {
  const passenger = await User.findById(req.user.id);

  if (!passenger) {
    return res.status(404).json({ message: 'Passenger not found' });
  }

  return res.json({ user: serializeAccount(passenger) });
});

/**
 * Updates editable passenger fields.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const passenger = await User.findByIdAndUpdate(
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

  if (!passenger) {
    return res.status(404).json({ message: 'Passenger not found' });
  }

  return res.json({ user: serializeAccount(passenger) });
});

module.exports = {
  getProfile,
  updateProfile
};
