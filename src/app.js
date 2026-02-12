const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
* - Routes Required
*/
const authRoute = require('./routes/auth.routes.js');
const accountRoute = require('./routes/account.routes.js');
const transactionRoute = require('./routes/transaction.routes.js');

/**
* - Use Routes
*/
app.use("/api/auth", authRoute);
app.use("/api/accounts", accountRoute);
app.use("/api/transactions", transactionRoute);


module.exports = app;