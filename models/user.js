const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    countInStock: {
        type: Number,
        default: 0
    },
})

const User = mongoose.model('User', productSchema);

module.exports = User;