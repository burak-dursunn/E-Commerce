const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); //! for password hashing.
const jwt = require('jsonwebtoken');



const user_get = async (req, res) => {
    try {
        const users = await User.find().sort({ dateCreated: -1 });
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
        passwordHash: bcrypt.hashSync(req.body.password, 10),
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

const get_user_details = async(req,res) => {
    try {
        const details = await User.findById(req.params.id).select('-passwordHash');
        res.send(details)
    } catch (error) {
        res.status(404).json({success: false, message: error.message})
        
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
const user_login = async (req,res) => {
    try {
        const user = await User.findOne({ email: req.body.email});
        const secret = process.env.JWT_SECRET;

        if(!user)
            return res.status(400).send("User not found")
        
        const passwordIsValid = await bcrypt.compare(req.body.password, user.passwordHash)
        if(user && passwordIsValid) {
            //! jwt.sign() işlemi
            const token = jwt.sign({
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'})

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
        res.status(505).json({success: false, message: error.message});
    }
}

const user_get_ids = async (req, res) => {
    try {
        const users = await User.find().select('id name');

        if(users.length === 0) {
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

const count_of_users = async (req,res) => {
    const userCount = await User.countDocuments();

    if(!userCount) res.status(500).json(
        {
            success: false ,
            messagge: "Count of User could not taken"
        })

    res.send({success: true, userCount: userCount});
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
}