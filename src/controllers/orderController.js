const Order = require('../models/order');
const Product = require('../models/product');
const CustomError = require('../utils/customError');

const BigPromise = require('../middlewares/bigPromise');

exports.createOrder = BigPromise(async (req, res, next) => {
        const orderOptions = {
                shippingInfo,
                orderItems,
                paymentInfo,
                taxAmount,
                shippingAmount,
                totalAmount
        } = req.body;

        orderOptions.user = req.user._id;
        const order = await Order.create(orderOptions);

        res.status(200).json({
                success: true,
                message: "Order placed successfully",
                order
        });

});

exports.getOneOrder = BigPromise(async (req, res, next) => {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if(!order){
                return next(new CustomError("Order not found with this id", 401));
        }

        res.status(200).json({
                success: true,
                order
        });
});


exports.getMyOrders = BigPromise(async (req, res, next) => {
        const orders = await Order.find({user: req.user._id});

        if(!orders) return next(CustomError("No orders found for this user", 401));

        res.status(200).json({
                success: true,
                orders
        });
});

exports.getAdminAllOrders = BigPromise(async (req, res, next) => {
        const orders = await Order.find();

        if(!orders) return next(new CustomError("There are no orders!", 401));

        res.status(200).json({
                success: true,
                orders
        });
})