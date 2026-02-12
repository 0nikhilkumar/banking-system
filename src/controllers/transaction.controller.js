const Transaction = require('../models/transaction.model');
const Ledger = require('../models/ledger.model');
const Account = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');


/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

async function createTransaction(req, res) {

        /**
         * 1. Validate request
         */
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
        if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "fromAccount, toAccount, amount and idempotencyKey are required fields"
            });
        }

        const fromUserAccount = await Account.findOne({
            _id: fromAccount,
        });

        const toUserAccount = await Account.findOne({
            _id: toAccount,
        });

        if(!fromUserAccount || !toUserAccount) {
            return res.status(400).json({
                message: "Invalid fromAccount or toAccount"
            });
        }

        /**
         * 2. Validate idempotency key
        */

        const isTransactionAlreadyExists = await Transaction.findOne({ idempotencyKey: idempotencyKey });
        if(isTransactionAlreadyExists) {
            if(isTransactionAlreadyExists.status === "COMPLETED") return res.status(200).json({
                    message: "Transaction already completed",
                    transaction: isTransactionAlreadyExists
            });

            if(isTransactionAlreadyExists.status === "PENDING") { return res.status(200).json({
                    message: "Transaction is still processing"
                })
            }

            if(isTransactionAlreadyExists.status === "FAILED") { return res.status(500).json({
                    message: "Transaction processing failed, please retry",
                })
            }

            if(isTransactionAlreadyExists.status === "REVERSED") { return res.status(500).json({
                    message: "Transaction was reversed, please retry",
                })
            }
        }

        /**
         * 3. Check account status
        */

        if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            return res.status(400).json({
                message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
            })
        }

        /**
         * 4. Derive sender balance from ledger
        */
        const balance = await fromUserAccount.getBalance();
        if(balance < amount) {
            return res.status(400).json({
                message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
            })
        }

        let transaction;

        try {

        /**
         * 5. Create transaction (PENDING)
        */

        const session = await mongoose.startSession();
        session.startTransaction();

        transaction = (await Transaction.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0];

        const debitLedgerEntry = await Ledger.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session });

        // await (()=> {
        //     return new Promise((resolve, reject) => setTimeout(resolve, 15 * 1000));
        // })()

        const creditLedgerEntry = await Ledger.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session });

        
        await Transaction.findOneAndUpdate({ _id: transaction._id }, { status: "COMPLETED" }, { session });

        await session.commitTransaction();
        session.endSession();

        } catch (error) {
            console.error('Error creating transaction:', error);
            res.status(500).json({
                message: "Transaction is Pending due to some issue, please retry after some time",
            });
        }

    /**
     * 10. Send email notification
     */
        await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, fromAccount, toAccount);

        res.status(201).json({
            message: "Transaction completed successfully",
            transaction: transaction
        });

    
};

async function createInitialFundsTransaction(req, res) {
    try {
        const { toAccount, amount, idempotencyKey } = req.body;

        if(!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "toAccount, amount and idempotencyKey are required fields"
            });
        }

        const toUserAccount = await Account.findOne({
            _id: toAccount,
        });

        if(!toUserAccount) {
            return res.status(400).json({
                message: "Invalid toAccount"
            });
        }

        const fromUserAccount = await Account.findOne({
            user: req.user._id
        });

        if(!fromUserAccount) {
            return res.status(400).json({
                message: "System account not found for the user"
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        const transaction = new Transaction({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        });

        const debitLedgerEntry = await Ledger.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session });
        

        const creditLedgerEntry = await Ledger.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session });

        transaction.status = "COMPLETED";
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction
        });

    } catch (error) {
        return res.status(500).json({
            message: "An error occurred while processing the initial funds transaction",
            error: error.message
        });
    }
}

module.exports = { createTransaction, createInitialFundsTransaction };