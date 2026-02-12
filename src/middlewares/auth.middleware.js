const TokenBlacklist = require('../models/blacklist.model.js');
const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
    
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if(!token) {
            return res.status(401).json({
                message: "Unauthorized access, token is missing",
            });
        }

        const isBlacklisted = await TokenBlacklist.findOne({ token });
        if(isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized access, token is invalid",
            });
        }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, invalid token",
        });
    }
};

async function authSystemUserMiddleware(req, res, next) {
    
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if(!token) {
            return res.status(401).json({
                message: "Unauthorized access, token is missing",
            });
        }

        const isBlacklisted = await TokenBlacklist.findOne({ token });
        if(isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized access, token is invalid",
            });
        }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("+systemUser");

        if(!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, user is not a system user",
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, invalid token",
        });
    }
};

module.exports = { authMiddleware, authSystemUserMiddleware };