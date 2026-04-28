const express = require('express');
const { body } = require('express-validator');
const {
  getEarnings,
  getHistory,
  getProfile,
  toggleOnlineStatus,
  updateProfile
} = require('../controllers/driverController');
const { getAvailableRides } = require('../controllers/rideController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware, roleCheck('driver'));

router.get('/profile', getProfile);
router.put(
  '/profile',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('phone')
      .trim()
      .matches(/^[0-9+\-\s]{10,15}$/)
      .withMessage('Enter a valid phone number')
  ],
  validateRequest,
  updateProfile
);
router.put('/toggle-status', toggleOnlineStatus);
router.get('/available-rides', getAvailableRides);
router.get('/earnings', getEarnings);
router.get('/history', getHistory);

module.exports = router;
