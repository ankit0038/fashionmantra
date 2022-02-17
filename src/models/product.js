const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
        name: {
                type: String,
                required: [true, 'please provide a product name'],
                trim: true,
                maxlength: [120, 'product name should not be more than 120 characters long']
        },
        price: {
                type: Number,
                required: [true, 'please provide a product price'],
                maxlength: [6, 'product price should not be more than 6 digits long']
        },
        description: {
                type: String,
                required: [true, 'please provide a product description']
        },
        photos: [
                {
                        id: {
                                type: String,
                                required: [true, 'Please provide a photo of your product']
                        },
                        secureUrl: {
                                type: String,
                                required: [true, 'Please provide a photo of your product']
                        }
                }
        ],
        category: {
                type: String,
                required: [true, 'Please select a category of your product from : short-sleeves, long-sleeves, sweat-shirts, hoodies'],
                enum: {
                        values: [
                                'shortsleeves',
                                'longsleeves',
                                'sweatshirts',
                                'hoodies'
                        ],
                        message: 'Please select a category of your product ONLY from : short-sleeves, long-sleeves, sweat-shirts and hoodies'
                }
        },
        brand: {
                type: String,
                required: [true, 'Please provide a brand for your product'],
                maxlength: [50, 'Brand name can not be more than 50 characters']
        },
        stock: {
                type: Number,
                required: [true, 'Please provide volume of stocks of your product']
        },
        averageRating: {
                type: Number,
                default: 0
        },
        numOfReviews: {
                type: Number,
                default: 0
        },
        reviews : [
                {
                        user : {
                                type: mongoose.Schema.ObjectId,
                                ref: 'User',
                                required: true
                        },
                        name: {
                                type: String,
                                required: true
                        },
                        rating: {
                                type: Number,
                                required: true
                        },
                        comment: {
                                type: String
                        }
                }
        ],
        user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
        },
        createdAt: {
                type: Date,
                default: Date.now
        }
});

module.exports = mongoose.model('Product', productSchema);

// name
// price
// description
// photos[]
// category
// brand
// stock
// ratings
// numOfReviews
// reviews [user, name, rating, comment]
// user
// createdAt