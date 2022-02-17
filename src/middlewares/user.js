const jwt = require('jsonwebtoken');

const User = require('../models/user');
const CustomError = require('../utils/customError');
const BigPromise = require('../middlewares/bigPromise');

exports.isLoggedIn = BigPromise(async (req, res, next) => {
        const token = req.cookies.token || req.header('Authorization').replace('Bearer ', '');

        if(!token) return next(new CustomError("You are not logged In, Please login", 401));

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        //injecting our own field 'user' in the request
        req.user = await User.findById(decodedToken.id);

        next();
});


//this function will validate role of a user
exports.validateRole = (...roles) => {
        return (req, res, next) => {
                if(!roles.includes(req.user.role)){
                        return next(new CustomError("You are not authorized to access this resource", 402));
                }
                next();
        }
};