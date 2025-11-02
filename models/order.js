const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true,
    }],
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    shippingAdress1: {
        type: String,
        required: true,
    },
    shippingAdress2: {
        type: String,
        required: true
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dataOrdered: {
        type: Date,
        default: Date.now
    }

})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

orderSchema.set('toJSON', {
    virtuals: true,
})


exports.Order = mongoose.model('order', orderSchema);