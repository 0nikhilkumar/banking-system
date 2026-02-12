const { Schema, model } = require("mongoose");
const Ledger = require("./ledger.model");

const accountSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Account must be accociated with a user"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status must be either ACTIVE, FROZEN or CLOSED",
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required for account"],
        default: "INR"
    },
    //! remember balance cannot be hardcoded in database, that's why we use ledger collection to calculate balance
}, {timestamps: true});

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function() {
    const balanceData = await Ledger.aggregate([
        {
            $match: {account: this._id}
        },
        {
            $group: {
                _id: null,
                totalDebits: {
                    $sum: {
                        $cond: [
                            {$eq: ["$type", "DEBIT"]},
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredits: {
                    $sum: {
                        $cond: [
                            {$eq: ["$type", "CREDIT"]},
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: {
                    $subtract: ["$totalCredits", "$totalDebits"]
                }
            }
        }
    ]);

    if(balanceData.length === 0) return 0;
    return balanceData[0].balance;
}

const Account = model("Account", accountSchema);

module.exports = Account;