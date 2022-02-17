const express = require('express');
const router = express.Router();

const {
        signup,
        login, 
        logout, 
        forgotPassword,
        resetPassword,
        getUserDashboard,
        changePassword,
        updateUserDetails,
        getAllUsers,
        getAllUsersForManager,
        getUserAdmin,
        updateUserDetailsByAdmin,
        deleteUserByAdmin
} = require('../controllers/userController');
const { isLoggedIn } = require('../middlewares/user');
const { validateRole } = require('../middlewares/user');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
//get request first will go to 'isLoggedIn' and then to 'getUserDashboard'
router.route('/userDashboard').get(isLoggedIn, getUserDashboard);
router.route('/password/update').post(isLoggedIn, changePassword);
router.route('/userDashboard/update').post(isLoggedIn, updateUserDetails);
//this path should only be accessible to admin, so we need to validate role
router.route('/admin/users').get(isLoggedIn, validateRole('admin'), getAllUsers);
router.route('/admin/user/:id')
        .get(isLoggedIn, validateRole('admin'), getUserAdmin)
        .put(isLoggedIn, validateRole('admin'), updateUserDetailsByAdmin)
        .delete(isLoggedIn, validateRole('admin'), deleteUserByAdmin) ;
//this path should only be accessible to manager
router.route('/manager/users').get(isLoggedIn, validateRole('manager'), getAllUsersForManager);

module.exports = router;