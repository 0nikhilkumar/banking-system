const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware");
const transactionController = require('../controllers/transaction.controller');

const router = express.Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */

router.route("/").post(authMiddleware.authMiddleware, transactionController.createTransaction);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system account to a user account
*/

router.route("/system/initial-funds").post(authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);

module.exports = router;