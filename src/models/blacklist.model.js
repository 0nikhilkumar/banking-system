const { Schema, model } = require("mongoose")

const tokenBlacklistSchema = new Schema({
    token: {
        type: String,
        required: [true, "Token is required to blacklist"],
        unique: [true, "Token is already blacklisted"],
    },
}, { timestamps: true });

tokenBlacklistSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 3
});

const TokenBlacklist = model("TokenBlacklist", tokenBlacklistSchema);

module.exports = TokenBlacklist;