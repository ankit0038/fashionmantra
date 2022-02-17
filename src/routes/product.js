const express = require('express');
const router = express.Router();

const { addProduct, getAllProducts, getProductDetails,adminUpdateProduct,adminDeleteProduct } = require('../controllers/productController');
const { isLoggedIn, validateRole } = require('../middlewares/user');

router.route('/admin/product/add').post(isLoggedIn, validateRole('admin'), addProduct);
router.route('/products').get(getAllProducts);
router.route('/product/:id').get(getProductDetails);
router.route('/admin/product/:id')
        .put(isLoggedIn, validateRole('admin'), adminUpdateProduct)
        .delete(isLoggedIn, validateRole('admin'), adminDeleteProduct);

module.exports = router;