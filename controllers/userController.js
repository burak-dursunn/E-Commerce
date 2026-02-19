const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); //! for password hashing.
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');



const user_get = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ dateCreated: -1 });

        const countOfUsers = await User.countDocuments();
        res.status(200).json({
            success: true,
            totalNumberOfUsers: countOfUsers,
            users: users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const user_post = async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: await bcrypt.hash(req.body.password, 10),

        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        country: req.body.country,
        city: req.body.city,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
    })
    try {
        const savedUser = await user.save()
        //* User Creation Successful
        res.status(201).json({
            success: true,
            user: savedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

const get_user_details = async (req, res) => {
    try {
        const details = await User.findById(req.params.id).select('-passwordHash');
        res.send(details)
    } catch (error) {
        res.status(404).json({ success: false, message: error.message })

    }

}

const forgot_password = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
    
        if (!user)
            return res.status(200).json({
                succes: false,
                message: "If this email exists, a reset link has been sent."
            })
    
        console.log(user);
    
        if (user.resetPasswordToken &&
            user.resetPasswordExpires > Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Reset Link already sent. Please check your inbox."
            })
        }
    
        //! Token Hashing is required for security reasons. 
        //! Saving token in database without hashing is a security risk.
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');
    
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    
        await user.save();
    
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            }
        })
    
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Reset Password',
            text: `You are receiving this email because you (or someone else) has requested to reset the password for your account.
            If you did not request this, please ignore this email.
            To reset your password, click on the following link:
            ${process.env.CLIENT_URL}/reset-password/${rawToken}
            This link will expire in 15 minutes.
            `
        }
        await transporter.sendMail(mailOptions);
    
        return res.status(200).json({
            success: true,
            message: "If this email exists, a reset link has been sent."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
        
    }

}

const reset_password = async (req, res) => {
    try {
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token and password are required"
            });
        }
    
        const { token, password } = req.body;
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        })
    
        if (!user)
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });
    
        user.passwordHash = await bcrypt.hash(password, 12);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
    
        await user.save();
    
        console.log(`Password reset for user ${user._id} at ${new Date().toISOString()}`);
    
        return res.status(200).json({
            success: true,
            message: "Password reset successful. You can now login with your new password."
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
        
    }
}

const delete_user = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: `User with id: "${id}" not found`
            });
        }

        res.status(200).json({
            success: true,
            message: `DELETE: User "${id}" was deleted`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

const user_soft_delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findById(id);
        if (!deletedUser || deletedUser.$isDeleted) {
            return res.status(404).json({
                success: false,
                message: `User with id: "${id}" not found`
            });
        }

        deletedUser.$isDeleted = true;
        deletedUser.deletedAt = Date.now();

        res.status(200).json({
            success: true,
            message: `DELETE: User "${id}" has been soft deleted`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//! Login
const user_login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        const secret = process.env.JWT_SECRET;

        if (!user)
            return res.status(400).send("User not found")

        const passwordIsValid = await bcrypt.compare(req.body.password, user.passwordHash)
        if (user && passwordIsValid) {
            //! jwt.sign() işlemi
            const token = jwt.sign({
                userId: user.id,
                isAdmin: user.isAdmin
            },
                secret,
                { expiresIn: '1d' })

            res.status(200).send({
                name: user.name,
                email: user.email,
                id: user.id,
                isAdmin: user.isAdmin,
                token: token
            })
        } else {
            res.status(400).send('the password you entered it is wrong')
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }
}

const user_get_ids = async (req, res) => {
    try {
        const users = await User.find().select('id name');

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Empty List"
            })
        }

        res.status(200).json({
            success: true,
            users: users
        });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
}

const count_of_users = async (req, res) => {
    const userCount = await User.countDocuments();

    if (!userCount) return res.status(500).json(

        {
            success: false,
            messagge: "Count of User could not taken"
        })

    res.send({ success: true, userCount: userCount });
}



module.exports = {
    user_get,
    get_user_details,
    user_post,
    delete_user,
    user_soft_delete,
    user_login,
    user_get_ids,
    count_of_users,
    forgot_password,
    reset_password
}