const express = require('express');
const { body, param } = require('express-validator');
const {
  acceptRide,
  bookRide,
  cancelRide,
  completeRide,
  getMyRides,
  getRideById,
  rateRide,
  startRide,
  validateRideId
} = require('../controllers/rideController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const locationValidation = (field) => [
  body(`${field}.address`).trim().isLength({ min: 3 }).withMessage(`${field} address is required`),
  body(`${field}.lat`).isFloat({ min: -90, max: 90 }).withMessage(`${field} latitude is invalid`),
  body(`${field}.lng`).isFloat({ min: -180, max: 180 }).withMessage(`${field} longitude is invalid`)
];

const rideIdValidation = [
  param('id').isMongoId().withMessage('Invalid ride id')
];

router.use(authMiddleware);

router.post(
  '/book',
  roleCheck('passenger'),
  [
    ...locationValidation('pickup'),
    ...locationValidation('drop'),
    body('vehicleType').isIn(['Auto', 'Sedan', 'SUV']).withMessage('Vehicle type is invalid'),
    body('fare').isFloat({ min: 1 }).withMessage('Fare must be greater than zero'),
    body('distance').isFloat({ min: 0 }).withMessage('Distance must be zero or more'),
    body('duration').isFloat({ min: 0 }).withMessage('Duration must be zero or more'),
    body('paymentMethod').isIn(['online', 'cod']).withMessage('Payment method is invalid')
  ],
  validateRequest,
  bookRide
);

router.get('/my', roleCheck('passenger'), getMyRides);

router.get('/:id', rideIdValidation, validateRequest, validateRideId, getRideById);

router.put('/:id/cancel', roleCheck('passenger'), rideIdValidation, validateRequest, validateRideId, cancelRide);

router.post(
  '/:id/rate',
  roleCheck('passenger'),
  [
    ...rideIdValidation,
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')
  ],
  validateRequest,
  validateRideId,
  rateRide
);

router.put('/:id/accept', roleCheck('driver'), rideIdValidation, validateRequest, validateRideId, acceptRide);

router.put(
  '/:id/start',
  roleCheck('driver'),
  [
    ...rideIdValidation,
    body('otp').trim().matches(/^\d{4}$/).withMessage('Enter the 4-digit OTP')
  ],
  validateRequest,
  validateRideId,
  startRide
);

router.put('/:id/complete', roleCheck('driver'), rideIdValidation, validateRequest, validateRideId, completeRide);

module.exports = router;
