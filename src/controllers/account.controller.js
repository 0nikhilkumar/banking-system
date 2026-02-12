const Account = require('../models/account.model.js');

async function createAccount(req, res) {
    try {
        const user = req.user;
        const account = await Account.create({
            user: user._id,
        });

        res.status(201).json({
            account
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

async function getUserAccounts(req, res) {
    try {
        const accounts = await Account.find({ user: req.user._id });
        return res.status(200).json({
            accounts
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

async function getAccountBalance(req, res) {
    const { accountId } = req.params;

    try {
        const account = await Account.findOne({ _id: accountId, user: req.user._id });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        const balance = await account.getBalance();

        return res.status(200).json({
            accountId: account._id,
            balance
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

async function getAllAccountsExceptSystem(req, res) {
    try {
        const accounts = await Account.find()
            .populate({
                path: 'user',
                match: { systemUser: false },
                select: '+systemUser'
            });

        // Filter out accounts where user is null (systemUser: true)
        const filteredAccounts = accounts.filter(account => account.user !== null);

        return res.status(200).json({ accounts: filteredAccounts });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    createAccount,
    getUserAccounts,
    getAccountBalance,
    getAllAccountsExceptSystem
}