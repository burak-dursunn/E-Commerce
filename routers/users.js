const expresss = require('express');
const mongoose = require('mongoose');
const router = expresss.Router();
const User = require('../models/user');


router.get('/', async (req,res) => {
    try {
        const users = await User.find().sort({ dateCreated: -1});
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
})

router.post('/', async (req,res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: req.body.passwordHash,
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
})

router.delete('/:id', async (req,res) => {
    try {
        const id = req.params.id;
        const deletedUser = await User.findByIdAndDelete(id);
        res.status(201).json({
            success: true,
            message: `DELETE: User "${id}" was deleted`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

})

module.exports = router;
