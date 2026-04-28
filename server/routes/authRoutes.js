const express = require('express');
const { body } = require('express-validator');
const { getMe, login, register } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const phoneValidation = body('phone')
  .trim()
  .matches(/^[0-9+\-\s]{10,15}$/)
  .withMessage('Enter a valid phone number');

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    phoneValidation,
    body('role').isIn(['passenger', 'driver']).withMessage('Role must be passenger or driver'),
    body('vehicleType')
      .if(body('role').equals('driver'))
      .isIn(['Auto', 'Sedan', 'SUV'])
      .withMessage('Vehicle type must be Auto, Sedan, or SUV'),
    body('vehicleNumber')
      .if(body('role').equals('driver'))
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Vehicle number is required'),
    body('licenseNumber')
      .if(body('role').equals('driver'))
      .trim()
      .isLength({ min: 4, max: 30 })
      .withMessage('License number is required')
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  login
);

router.get('/me', authMiddleware, getMe);

module.exports = router;
