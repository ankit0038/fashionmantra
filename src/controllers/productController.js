const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const Product = require('../models/product');
const WhereClause = require('../utils/whereClause');
const product = require('../models/product');

exports.addProduct = BigPromise(async (req, res, next) => {
        if(!req.files) return next(new CustomError("Please provide atleast one photo of your product", 400));

        let imageArray = [];

        for(let i = 0; i < req.files.photos.length; i++){
                let result = await cloudinary.v2.uploader.upload(
                        req.files.photos[i].tempFilePath, 
                        {
                                folder: 'products'
                        }
                );

                imageArray.push({
                        id: result.public_id,
                        secureUrl: result.secure_url
                });
        }

        req.body.photos = imageArray;
        req.body.user = req.user.id;

        const product = await Product.create(req.body);

        res.status(200).json({
                success: true,
                message: "Product has been added successfully"
        });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {

        const resultPerPage = 6;

        const productsObj = new WhereClause(Product.find(), req.query).search().filter();

        let products = await productsObj.base;

        const filteredProductCount = products.length;

        productsObj.pager(resultPerPage);
        products = await productsObj.base.clone();


        res.status(200).json({
                success: true,
                filteredProductCount,
                products
        });
});

exports.getProductDetails = BigPromise(async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if(!product) return next(new CustomError("Product not found!", 404));

        res.status(200).json({
                success: true,
                product
        });
});

exports.addReview = BigPromise(async (req, res, next) => {
        const {rating, comment, productId} = req.body;

        const review = {
                user: req.user._id,
                name: req.user.name,
                rating: Number(rating),
                comment
        };

        const product = await Product.findById(productId);

        const alreadyReviewed = product.reviews.find(
                (rev) => rev.user.toString() === req.user._id.toString()
        );

        if(alreadyReviewed){
                product.reviews.forEach((review) => {
                        if(review.user.toString() === req.user._id.toString()){
                                review.comment = comment;
                                review.rating = rating;
                        }
                });
        }else{
                product.reviews.push(review);
                product.numOfReviews = product.reviews.length;
        }

        //calculate average rating
        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        //save
        await product.save({validateBeforeSave: false});

        res.status(200).json({
                success: true,
                message: "Review added successfully!"
        });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
        const {productId} = req.query;

        const product = await Product.findById(productId);

        product.reviews = product.reviews.filter(
                (rev) => rev.user.toString() === req.user._id.toString()
        );

        product.numOfReviews = product.reviews.length;

        //calculate average rating
        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        //update product in DB

        await product.save({validateBeforeSave: false});

        res.status(200).json({
                success: true,
                message: "Review deleted successfully!"
        });
});

exports.adminUpdateProduct = BigPromise(async (req, res, next) => {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
                useFindAndModify: false
        });

        res.status(200).json({
                success: true,
                message: "product details updated successfully!",
                product
        });
});

exports.adminDeleteProduct = BigPromise(async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if(!product) return next(new CustomError("Product not found!", 404));

        for(let i = 0; i < product.photos.length; i++) {
                await cloudinary.v2.uploader.destroy(product.photos[i].id);
        }

        await product.remove();

        res.status(200).json({
                success: true,
                message: "Product deleted successfully!"
        });
});