const cloudinary = require('cloudinary');
const fileUpload = require('express-fileupload');
const crypto = require('crypto');

const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const mailHelper = require('../utils/emailHelper');


exports.signup = BigPromise(async (req, res, next) => {

        const {name, email, password} = req.body;

       if( !name ) {
               return next(new CustomError('Please enter a name!', 400));
       }
       if(!email){
               return next(new CustomError('Please enter an email!', 400));
       }
       if(!password){
               return next(new CustomError('Please enter a password!', 400));
       }

       if( !req.files ) {
                return next(new CustomError('A photo is required to signup on Fashion Mantra'));
       }

        let result;
        let file = req.files.photo;
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: 'users',
                width: 150,
                crop: 'scale'
        })

       const user = await User.create({
                name,
                email,
                password,
                photo: {
                        id: result.public_id,
                        secureURL: result.secure_url
                }
        });

        cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
        const { email, password } = req.body;

        if( !email ) return next(new CustomError("Please provide an email", 400));
        if( !password ) return next(new CustomError( "Please provide password", 400));

        const user = await User.findOne( { email } ).select( "+password" );

        if( !user ) return next( new CustomError( "This email is not register, Please sign up.", 400 ));

        if( ! await user.validatePassword( password ) ) return next( new CustomError( "Password is Incorrect", 400) );

        cookieToken( user, res );
});

exports.logout = BigPromise( async ( req, res, next ) => {
        res.cookie('token', null, {
                expires: new Date( Date.now() ),
                httpOnly: true
        });

        res.status(200).json({
                success: true,
                message: "You have been logged out successfully!"
        });
});

exports.forgotPassword = BigPromise( async ( req, res, next ) => {
        const {email} = req.body;

        if(!email) return next(new CustomError("Please provide an email", 400));

        const user = await User.findOne({email});

        if(!user) return next(new CustomError("this email is not registered!", 400));

        //generating forgot password token
        const forgotToken = user.getForgotPasswordToken();

        //console.log(user, "saving...");
        //since we have generated forgot token so we also need to save this in DB
        await user.save({validateBeforeSave: false});

        //console.log(user, "saved success");

        const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

        const message = `To reset your password please copy this link in your browser \n\n ${myUrl}`;

        try {

                // sending email to user for reseting their password
                await mailHelper({
                        emailTo: user.email,
                        subject: 'Fashion Mantra, password reset request',
                        message
                });

                res.status(200).json({
                        success: true,
                        message: 'Email sent successfully'
                });
        } catch(error) {

                //since we encounter an error while sending email for resetting password
                //so we also need to flush token and it's expiry from DB which we have saved earlier
                user.forgotPasswordToken = undefined;
                user.forgotPasswordExpiry = undefined;

                await user.save({validateBeforeSave: false});

                return next(new CustomError(error.message, 500));
        }
});

exports.resetPassword = BigPromise( async ( req, res, next ) => {
        const token = req.params.token;

        if(!token) return next(new CustomError("Invalid request", 400));

        const encryptedToken = crypto.createHash('sha256').update(token).digest('hex');

        console.log("token : ", token);
        console.log("encryptedToken : ", encryptedToken);


        const user = await User.findOne({
                forgotPasswordToken: encryptedToken,
                forgotPasswordExpiry: {$gt: Date.now()}
        });

        if(!user) return next(new CustomError("Token is invalid or has expired", 400));

        console.log("user token : ", user.forgotPasswordToken);
        console.log("expiry date : ", user.forgotPasswordExpiry);

        if(req.body.newPassword !== req.body.confirmPassword) return next(new CustomError("confimr password should be same as new password", 400));

        user.password = req.body.newPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        await user.save({validateBeforeSave: false});

        cookieToken(user, res);
});

exports.getUserDashboard = BigPromise(async (req, res, next) => {
        const user = await User.findById(req.user.id);

        res.status(200).json({
                success: true,
                user
        });
});

exports.changePassword = BigPromise(async (req, res, next) => {

        const user = await User.findById(req.user.id).select("+password");

        const oldPasswordMatches = await user.validatePassword(req.body.oldPassword);

        if(!oldPasswordMatches) return next(new CustomError("old password is incorrect!", 400));

        user.password = req.body.password;

        await user.save({validateBeforeSave: false});

        cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
        const {email, name} = req.body;

        if(!email) return next(new CustomError("please provide an email", 400));

        if(!name) return next(new CustomError("Please provide a name", 400));

        const newData = {
                email,
                name
        };

        if(req.files) {
                const user = await User.findById(req.user.id);

                const imageId = user.photo.id;

                //delete photo on clodinary
                const resp = await cloudinary.v2.uploader.destroy(imageId);

                //upload new photo on cloudinary
                const result = await cloudinary.v2.uploader.upload(
                        req.files.photo.tempFilePath,
                        {
                                folder: 'users',
                                width: 150,
                                crop: 'scale'
                        }
                );

                newData.photo = {
                        id: result.public_id,
                        secureURL: result.secure_url
                };
        }

        const user = await User.findByIdAndUpdate(req.user.id, newData, {
                new: true,
                runValidators: true,
                useFindAndModify: false
        });

        res.status(200).json({
                success: true,
                message: "User details updated successfully!"
        });
});

exports.getAllUsers = BigPromise(async (req, res, next) => {
        const users = await User.find();

        res.status(200).json({
                success: true,
                users
        });
});

// we will be showing only those users to manager whose role is 'user'
exports.getAllUsersForManager = BigPromise(async (req, res, next) => {
        const users = await User.find({role : 'user'});

        res.status(200).json({
                success: true,
                users
        });
});

exports.getUserAdmin = BigPromise(async (req, res, next) => {
        const user = await User.findById(req.params.id);

        if(!user) return next(new CustomError("No user found!", 400));

        res.status(200).json({
                success: true,
                user
        });
});

exports.updateUserDetailsByAdmin = BigPromise(async (req, res, next) => {
        const newData = {
                name: req.body.name,
                email: req.body.email,
                role: req.body.role
        };

        const user = await User.findByIdAndUpdate(req.user.id, newData, {
                new: true,
                runValidators: true,
                useFindAndModify: false
        });

        res.status(200).json({
                success: true,
                message: "User details updated successfully!"
        });
});

exports.deleteUserByAdmin = BigPromise(async (req, res, next) => {
        const user = await User.findById(req.params.id);

        if(!user) return next(new CustomError("No such user found!", 401));

        const imageId = user.photo.id;

        await cloudinary.v2.uploader.destroy(imageId);

        await user.remove();

        res.status(200).json({
                success: true,
                message: "user has been deleted!"
        });

});