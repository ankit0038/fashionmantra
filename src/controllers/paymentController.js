const BigPromise = require('../middlewares/bigPromise');
const Razorpay = require('razorpay');
const {v4 : uuidv4} = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey = BigPromise(async (req, res, next) => {
        res.status(200).json({
                stripekey: process.env.STRIPE_API_KEY
        });
});

exports.captureStripePayment = BigPromise(async (req, res, next) => {
        const paymentIntent = await stripe.paymentIntents.create({
                amount: req.body.amount,
                currency: 'inr',

                //optional
                metadata : {integration_check: 'accept_a_payment'}
        });

        res.status(200).json({
                success: true,
                client_secret: paymentIntent.client_secret
        });
});

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
        res.status(200).json({
                stripekey: process.env.RAZORPAY_API_KEY
        });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
        const amount = req.body.amount;
        var instance = new Razorpay({
                key_id: process.env.RAZORPAY_API_KEY,
                key_secret: process.env.RAZORPAY_SECRET
        });
 
        const order = await instance.orders.create({
                amount: amount * 100 ,
                currency: "INR",
                receipt: uuidv4()
        });

        //console.log(order.id);
        res.status(200).send({
                success: true,
                amount,
                order
        });
});

