const express = require('express');
const authController = require('../controllers/auth.controller.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const router = express.Router();

/* POST /api/auth/register */
router.route("/register").post(authController.userRegister);

/* POST /api/auth/login */
router.route("/login").post(authController.userLogin);

/* POST /api/auth/logout */
router.route("/logout").post(authController.userLogout);

module.exports = router;