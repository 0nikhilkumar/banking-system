const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

/**
* - POST /api/accounts/
* - Create a new account
* - Protected Route
*/
router.route("/").post(authMiddleware.authMiddleware, accountController.createAccount);

/**
 * - GET /api/accounts/
 * - Get all accounts of the authenticated user
 * - Protected Route
 */

router.route("/").get(authMiddleware.authMiddleware, accountController.getUserAccounts);

/**
 * - GET /api/accounts/balance/:accountId
 * - Get balance of a specific account
 * - Protected Route
 */

router.route("/balance/:accountId").get(authMiddleware.authMiddleware, accountController.getAccountBalance);

/**
 * - GET /api/accounts/all
 * - Get all accounts except system accounts
 * - Protected Route
 */

router.route("/all").get(authMiddleware.authMiddleware, accountController.getAllAccountsExceptSystem);

module.exports = router;