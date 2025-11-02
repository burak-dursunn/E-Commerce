const Order = require('../models/order');
const OrderItem = require('../models/order-item');


const post_order = async (req,res) => {

    try {
        //! Order İtemleri tek tek kaydet
        const orderItemsIds = req.body.orderItems.map(async orderItems => {
            let newOrderItem =new OrderItem({
                quantity: req.body.quantity,
                product: req.body.product
            })
            newOrderItem = await newOrderItem.save();
    
            return newOrderItem._id;
            
        })
    
        //! Siparişi oluştur.
        const order = new Order({
            orderItems: orderItemsIds,
            satutus: req.body.status,
            shippingAdress1: req.body.shippingAdress1,
            shippingAdress2: req.body.shippingAdress2,
            country: req.body.country,
            city: req.body.city,
            zip: req.body.zip,
            phone: req.body.phone,
            totalPrice: req.body.totalPrice,
            user: req.body.user,
        })
    
        const savedOrder = await order.save();
        if(!savedOrder) {
            return res.status(500).send('the order could not be saved')
    
        }
        //* Order Creation Successfull
        res.status(201).send(savedOrder);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message});
    }
}

module.exports = {
    post_order
}