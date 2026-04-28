const express = require('express');
const { body } = require('express-validator');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware, roleCheck('passenger'));

router.post(
  '/create-order',
  [
    body('rideId').isMongoId().withMessage('Valid ride id is required')
  ],
  validateRequest,
  createRazorpayOrder
);

router.post(
  '/verify',
  [
    body('razorpayOrderId').trim().notEmpty().withMessage('Razorpay order id is required'),
    body('razorpayPaymentId').trim().notEmpty().withMessage('Razorpay payment id is required'),
    body('razorpaySignature').trim().notEmpty().withMessage('Razorpay signature is required')
  ],
  validateRequest,
  verifyPayment
);

module.exports = router;
