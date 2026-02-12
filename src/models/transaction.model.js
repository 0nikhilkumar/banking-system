const { Schema, model } = require("mongoose")

const transactionSchema = new Schema({
    fromAccount: {
        type: Schema.Types.ObjectId,
        ref: "Account", 
        required: [true, "Transaction must be associated with a from account"],
        index: true
    },
    toAccount: {
        type: Schema.Types.ObjectId,
        ref: "Account", 
        required: [true, "Transaction must be associated with a to account"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status must be either PENDING, COMPLETED, FAILED or REVERSED",
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for creating a transaction"],
        min: [0, "Transaction Amount cannot be negative"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required for creating a transaction"],
        unique: true,
        index: true
    },
}, {timestamps: true});

const Transaction = model("Transaction", transactionSchema);

module.exports = Transaction;