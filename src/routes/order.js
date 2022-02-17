const express = require('express');
const { createOrder, getOneOrder, getMyOrders, getAdminAllOrders } = require('../controllers/orderController');

const router = express.Router();

const {isLoggedIn, validateRole} = require('../middlewares/user');

router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/order/myorders').get(isLoggedIn, getMyOrders);
router.route('/admin/orders').get(isLoggedIn, validateRole('admin'), getAdminAllOrders);
router.route('/order/:id').get(isLoggedIn, getOneOrder);

module.exports = router;