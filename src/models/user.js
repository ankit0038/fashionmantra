const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
        name: {
                type: String,
                required: [true, "Please enter a name"],
                maxlength: [40, "Name could not be more than 40 characters long"]
        },
        email: {
                type: String,
                required: [true, "Please enter an email"],
                validate: [validator.isEmail, "Please enter a valid email"],
                unique: true
        },
        password: {
                type: String,
                required: [true, "Please enter a password"],
                minlength: [8, "Password should be atleast 8 characters long"],
                select: false
        },
        role: {
                type: String,
                default: 'user'
        },
        photo: {
                id: {
                        type: String,
                        required: true
                },
                secureURL: {
                        type: String,
                        required: true
                }
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
        createdAt: {
                type: Date,
                default: [new Date(Date.now())]
        }
});

//encrypting password before saving it to the database
userSchema.pre('save', async function(next) {
        //if the password is not being modified then we do not need to encrypt it, so we can pass request to next
        if(!this.isModified('password')) {
                return next();
        }
        this.password = await bcrypt.hash(this.password, 10);
});

//comparing user password with db stored password
userSchema.methods.validatePassword = async function(userPassword) {
        console.log(userPassword, this.password);
        return await bcrypt.compare(userPassword, this.password);
};

//create and return a jwt token
userSchema.methods.getJwtToken = function(){
        return jwt.sign({id : this._id}, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRY
        });
};

//generate token for forgot password - a randomly generated string
userSchema.methods.getForgotPasswordToken = function() {
        //generating a long  and random string
        const forgotPasswordToken = crypto.randomBytes(20).toString('hex');

        //encoding random generated string
        this.forgotPasswordToken = crypto.createHash('sha256').update(forgotPasswordToken).digest('hex');

        console.log("forgotPasswordToken : ", forgotPasswordToken);
        console.log("encrypted forgotPasswordToken : ", this.forgotPasswordToken);


        this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

        return forgotPasswordToken;
};


module.exports = mongoose.model('User', userSchema);