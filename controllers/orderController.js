const { Order } = require('../models/order');
const OrderItem = require('../models/order-item');

const get_orders = async (req, res) => {
    try {
        const order = await Order.find().populate({
            path: 'orderItems',
            select: '-quantity',
            populate: {
                path: 'product',
                select: 'name price'
            }
        });
        res.status(200).send(order);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }
}


const get_order_details = async (req, res) => {
    try {
        const orderDetails = await Order.findById(req.params.id);
        res.status(200).send(orderDetails);

    } catch (error) {
        res.status(404).json({succes: false, message: error.message})
    }
}
const post_order = async (req, res) => {

    try {
        //! Save each order item individually.
        const orderItemsIds = await Promise.all(
            req.body.orderItems.map(async orderItem => {
                let newOrderItem = new OrderItem({
                    quantity: orderItem.quantity,
                    product: orderItem.product
                })
                newOrderItem = await newOrderItem.save();

                return newOrderItem._id;
            }))

        //! Create the order.
        const order = new Order({
            orderItems: orderItemsIds,
            status: req.body.status,
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
        if (!savedOrder) {
            return res.status(500).send('the order could not be saved')
        }
        //* Order Creation Successfull
        res.status(201).send(savedOrder);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    get_orders,
    get_order_details,
    post_order
}