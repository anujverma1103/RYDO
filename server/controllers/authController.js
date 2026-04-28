const Driver = require('../models/Driver');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

/**
 * Converts a mongoose account document into the public profile shape.
 *
 * @param {object} account - Passenger or driver document.
 * @returns {object}
 */
const serializeAccount = (account) => {
  const data = account.toObject ? account.toObject() : account;
  delete data.password;
  return data;
};

/**
 * Registers a passenger or driver after checking email uniqueness across both
 * account collections.
 */
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    vehicleType,
    vehicleNumber,
    licenseNumber
  } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const [existingPassenger, existingDriver] = await Promise.all([
    User.exists({ email: normalizedEmail }),
    Driver.exists({ email: normalizedEmail })
  ]);

  if (existingPassenger || existingDriver) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const account =
    role === 'driver'
      ? await Driver.create({
          name,
          email: normalizedEmail,
          password,
          phone,
          vehicleType,
          vehicleNumber,
          licenseNumber
        })
      : await User.create({
          name,
          email: normalizedEmail,
          password,
          phone
        });

  return res.status(201).json({
    token: generateToken(account),
    user: serializeAccount(account)
  });
});

/**
 * Authenticates a passenger or driver by email and password.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  let account = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!account) {
    account = await Driver.findOne({ email: normalizedEmail }).select('+password');
  }

  if (!account || !(await account.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.json({
    token: generateToken(account),
    user: serializeAccount(account)
  });
});

/**
 * Returns the current passenger or driver from the JWT payload.
 */
const getMe = asyncHandler(async (req, res) => {
  const Model = req.user.role === 'driver' ? Driver : User;
  const account = await Model.findById(req.user.id);

  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }

  return res.json({ user: serializeAccount(account) });
});

module.exports = {
  getMe,
  login,
  register,
  serializeAccount
};
