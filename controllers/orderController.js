const { multiply } = require('lodash');
const { Order } = require('../models/order');
const OrderItem = require('../models/order-item');
const Product = require('../models/product');

const get_orders = async (req, res) => {
    try {
        //! http://localhost:3000/api/v1/orders?products=1234,53438,...
        let filter = {};
        let productNames = [];
        if (req.query.products) {
            const productIds = req.query.products.split(',').map(e => e.trim())
            const orderItems = await OrderItem.find({ product: { $in: productIds } }).select('_id');
            console.log("Items that include the products that givin on the query:\n", orderItems);
            filter = { orderItems: { $in: orderItems.map(item => item._id) } };

            const products = await Product.find({ _id: { $in: productIds } }).select('name');
            productNames = products.map(p => p.name)
        }

        const orders = await Order.find(filter)
        
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    select: 'name price'
                }
            }).populate('user', 'name').
            sort({ dataOrdered: -1 });
        res.status(200).json({
            success: true,
            orderLength: orders.length,
            searchedProductNames: productNames,
            Orders: orders
        });

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
            const totalPrices = await Promise.all(
                orderItemsIds.map(async orderItemId => {
                    const order = await OrderItem.findById(orderItemId).populate('product', 'price');
                    return order.product.price * order.quantity;
            }))

            const totalPrice = totalPrices.reduce((a,b) => a+b, 0);

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
            totalPrice: totalPrice,
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
        const id = req.params.id;
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        //! OrderItems deletion proccess || Deleting the OrderItems that inside the Orders
        for (const itemId of order.orderItems) {
            try {
                await OrderItem.findByIdAndDelete(itemId);
                console.log(`OrderItem ${itemId} has deleted`)
            } catch (error) {
                console.error('OrderItem silme hatası:', error.message);
                return res.status(500).json({
                    success: false,
                    message: 'OrderItems: Sunucu tarafında silme işlemi sırasında hata oluştu',
                    details: error.message
                });
            }
        }

        //! Deleting the order
        const deletedOrder = await Order.findByIdAndDelete(id);  
        console.log(`DELETE: Requested Order "${id}" was deleted`);
        res.status(200).json({ success: true, message: `DELETE: Order "${id}" was deleted` })

    } catch (error) {
        return res.status(404).json({
            error: 'ORDER: Sunucu tarafında silme işlemi sırasında hata oluştu',
            details: error.message,
            success: false,
        })
    }
}

const get_totalSales = async (req,res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice'}}}
    ])

    if(!totalSales || totalSales.length === 0) res.status(400).send('the order sales cannot be generated');
    
    res.send({ totalSales: totalSales});


}

const best_seller = async (req,res) => {
    try {
        const bestSeller = await Order.aggregate([
            { $unwind: '$orderItems'},
            { $lookup: { from: 'orderitems', localField: 'orderItems', foreignField: '_id', as: 'itemData'}},
            { $unwind: '$itemData'},
            { $lookup: { from: 'products', localField: 'itemData.product', foreignField: '_id', as: 'productData'}},
            { $unwind: '$productData'},
            { $group: { _id: '$productData.name', totalSold: { $sum: '$itemData.quantity'}}},
            { $sort: { totalSold: -1}},
            { $project: { _id: 1, product: '$productData.name', totalSold: 1}},
        ])
        if(bestSeller.length === 0){
            return res.status(400).send('Empty List');
        }
        res.send(bestSeller)
    } catch (error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

module.exports = {
    get_orders,
    get_order_details,
    post_order,
    update_order,
    delete_order,
    get_totalSales,
    best_seller
}