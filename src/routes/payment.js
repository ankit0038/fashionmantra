const express = require('express');
const router = express.Router();

const {
        sendRazorpayKey, 
        sendStripeKey,
        captureRazorpayPayment,
        captureStripePayment
} = require('../controllers/paymentController');
const { isLoggedIn, validateRole } = require('../middlewares/user');

router.route('/stripekey').get(isLoggedIn, sendStripeKey);
router.route('/razorpay').get(isLoggedIn, sendRazorpayKey);

router.route('/payment/stripe').post(isLoggedIn, captureStripePayment);
router.route('/payment/razorpay').post(isLoggedIn, captureRazorpayPayment);

module.exports = router;