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
        res.status(404).json({ succes: false, message: error.message })
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

const update_order = async (req, res) => {
    try {
        const orderItemsIds = await Promise.all(
            req.body.orderItems.map(async orderItem => {
                let updatedOrderItem = await OrderItem.findByIdAndUpdate(orderItem._id,
                    {
                        quantity: orderItem.quantity,
                        product: orderItem.product
                    }, { new: true })

                return updatedOrderItem._id;
            })
        )

        const updatedOrder = await Order.findByIdAndUpdate(req.params.id,
            {
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
            }, { new: true }); //? "new : true" line ensure the showing the updated product details in the console
            res.status(200).send(updatedOrder);

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'There is no order that you searched it'
        }) 

    }
}


const delete_order = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        console.log(`DELETE: Requested Order "${id}" was deleted`);
        res.status(201).json({ success: true, message: `DELETE: Order "${id}" was deleted` })
    } catch (error) {
        return res.status(404).json({
            error: 'Sunucu tarafında silme işlemi sırasında hata oluştu',
            details: error.details,
            success: false,
        })

    }


}

module.exports = {
    get_orders,
    get_order_details,
    post_order,
    update_order,
    delete_order
}