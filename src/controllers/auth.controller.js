const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');
const emailService = require("../services/email.service.js");
const TokenBlackList = require('../models/blacklist.model.js');


/**
* - user register controller
* - POST /api/auth/register
*/
const userRegister = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        
        const isExists = await User.findOne({ email });
        if(isExists) {
            return res.status(422).json({
                message: "User already exists with email.",
                status: "failed"
            });
        }

        const user = await User.create({
            email,
            name,
            password
        });

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, { expiresIn: '3d' });
        res.cookie("token", token);
        
        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
        await emailService.sendRegistrationEmail(user.email, user.name);
    } catch (error) {
        console.log(error);
    }
};

/**
* - user login controller
* - POST /api/auth/login 
*/

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if(!user) {
            return res.status(401).json({
                message: "Email or password is INVALID.",
                status: "failed"
            })
        }

        const isValidPassword = await user.comparePassword(password);
        if(!isValidPassword) {
            return res.status(401).json({
                message: "Email or password is INVALID.",
                status: "failed"
            })
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, { expiresIn: '3d' });
        res.cookie("token", token);

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {
        console.log(error);
    }
};

/**
* - user logout controller
* - POST /api/auth/logout 
*/


const userLogout = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token) {
        return res.status(200).json({
            message: "User logged out successfully",
        });
    }

    try {
        res.clearCookie("token");
        await TokenBlackList.create({ token });

        return res.status(200).json({
            message: "User logged out successfully",
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }

};

/**
* - user profile controller
* - GET /api/auth/profile
*/
const checkSystem = async (req, res) => {
    try {
        // req.user should be set by auth.middleware.js after JWT verification
        const { id } = req.user;

        const user = await User.findById(id).select("+systemUser");
        let genUser = false;
        if(user.systemUser) {
            genUser = true;
        }
        return res.status(200).json({ id: user._id, genUser});
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    userRegister, userLogin, userLogout, checkSystem}