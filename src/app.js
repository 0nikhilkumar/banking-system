const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

/**
* - Routes Required
*/
const authRoute = require('./routes/auth.routes.js');
const accountRoute = require('./routes/account.routes.js');
const transactionRoute = require('./routes/transaction.routes.js');

/**
* - Use Routes
*/

app.get("/", (req, res) => {
    return res.send("Banking Service is up and running!");
})

app.use("/api/auth", authRoute);
app.use("/api/accounts", accountRoute);
app.use("/api/transactions", transactionRoute);


module.exports = app;