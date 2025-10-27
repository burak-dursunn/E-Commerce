const mongoose = require('mongoose');

const productSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        default: ''
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 100
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        default: 0,
        min: 0,
        max: 255
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dataCreated: {
        type: Date,
        default: Date.now,
    }
})

//todo try to create a virtual ID for frontend compatibility.
//todo for better API/frontend integration.

const Product = mongoose.model('Product', productSchema);

module.exports = Product;