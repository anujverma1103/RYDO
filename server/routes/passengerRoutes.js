const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile } = require('../controllers/passengerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware, roleCheck('passenger'));

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

module.exports = router;
