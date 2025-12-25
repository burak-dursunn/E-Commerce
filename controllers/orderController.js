const { Order } = require('../models/order');
const OrderItem = require('../models/order-item');
const Product = require('../models/product');
const mongoose = require('mongoose');

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
                    select: 'name price',
                    populate: {
                        path: 'category',
                        select: '-__v -color'
                    }
                }
            }).populate('user', 'name').
            sort({ dataOrdered: -1 });
        res.status(200).json({
            success: true,
            //todo we can use Order.countDocument instead of length for the length of orders
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
        if (!orderDetails) {
            return res.status(404).json({
                success: false,
                message: 'Order with givin ID could not be found'
            })
        }
        res.status(200).send(orderDetails);

    } catch (error) {
        res.status(404).json({ succes: false, message: error.message })
    }
}

const post_order = async (req, res) => {

    try {
        //! Stock Check
        const orderItems = req.body.orderItems;
        const productIds = orderItems.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map();
        products.forEach(p => {
            productMap.set(p._id.toString(), p);
        })
        const stockErrors = [];
        for (const item of orderItems) {
            const product = productMap.get(item.product.toString());
            if(!product) {
                stockErrors.push({
                    productId: item.product,
                    error: "Product has not found"
                })
            }

            if (item.quantity > product.countInStock) {
                stockErrors.push({
                    productId: product._id,
                    productName: product.name,
                    requestedQuantity: item.quantity,
                    countInStock: product.countInStock
                })
            }
        }
        //! Display the error if there is an problem with the stock.
        if (stockErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock problem for some products",
                stockErrors
            })
        }

        //! Save each order item individually firstly.
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

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

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
        //! Updating stock
        await Promise.all(
            orderItems.map(item => {
                const products = productMap.get(item.product.toString());
                console.log(`Product ${item.product}  Stock Update: ${products.countInstock} --> ${products.CountInStock - item.quantity}`)
                Product.findByIdAndUpdate(item.product,
                    { $inc : { countInStock: -item.quantity } }
                )
            })
        )
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

const cancel_order = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await Order.findById(id);
        if (!order) {
            re.status(404).json({
                success: false,
                message: "Order not found"
            })
        }
        //todo Ask the customer if he/she is sure he/she really want to cancel his/her order on frontend.
        for (const itemId of order.orderItems) {
            try {
                const deletedOrderItem = await OrderItem.findByIdAndDelete(itemId);
                console.log(`Order Item ${itemId} has deleted!!`);
            } catch (error) {
                console.error('OrderItem silme hatası:', error.message);
                return res.status(500).json({
                    success: false,
                    message: 'OrderItems: Sunucu tarafında silme işlemi sırasında hata oluştu',
                    details: error.message
                });
            }
        }

        const deletedOrder = await Order.findByIdAndDelete(id)
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

const order_soft_delete = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order || order.isDeleted) {
            return es.status(404).json({
                success: false,
                message: "Order with givin ID could not be found"
            })
        }

        for (const itemId of order.orderItems) {
            const deletedOrderItem = await OrderItem.findById(itemId);
            deletedOrderItem.$isDeleted = true;
            deletedOrderItem.deletedAt = Date.now();

            await deletedOrderItem.save();
        }

        order.isDeleted = true;
        order.deletedAt = Date.now();

        await order.save();

        return res.status(200).json({
            success: true,
            message: "The Order has been soft deleted"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const get_totalSales = async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ])

    if (!totalSales || totalSales.length === 0) res.status(400).send('the order sales cannot be generated');

    res.send({ totalSales: totalSales });


}

const best_seller = async (req, res) => {
    try {
        const bestSeller = await Order.aggregate([
            { $unwind: '$orderItems' },
            { $lookup: { from: 'orderitems', localField: 'orderItems', foreignField: '_id', as: 'itemData' } },
            { $unwind: '$itemData' },
            { $lookup: { from: 'products', localField: 'itemData.product', foreignField: '_id', as: 'productData' } },
            { $unwind: '$productData' },
            { $group: { _id: '$productData.name', totalSold: { $sum: '$itemData.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $project: { _id: 1, product: '$productData.name', totalSold: 1 } },
        ])
        if (bestSeller.length === 0) {
            return res.status(400).send('Empty List');
        }
        res.send(bestSeller)
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const most_profitable = async (req, res) => {
    try {
        const profitableProducts = await Order.aggregate([
            { $unwind: '$orderItems' },
            { $lookup: { from: 'orderitems', localField: 'orderItems', foreignField: '_id', as: 'itemData' } },
            { $unwind: '$itemData' },
            { $lookup: { from: 'products', localField: 'itemData.product', foreignField: '_id', as: 'productData' } },
            { $unwind: '$productData' },
            {
                $group: {
                    _id: '$productData.name', totalProfit: { $sum: { $multiply: ['$productData.price', '$itemData.quantity'] } },
                    price: { $sum: '$productData.price' },
                    totalSold: { $sum: '$itemData.quantity' }
                }
            },
            { $sort: { totalProfit: -1 } },
            {
                $project: {
                    _id: 1,
                    Price: '$price',
                    Sold: '$totalSold',
                    Profit: { $round: ["$totalProfit", 2] }
                }
            }
        ])
        if (profitableProducts.length === 0) {
            return res.status(400).send('Empty List');
        }

        res.send(profitableProducts);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

const category_profits = async (req, res) => {
    try {
        const profits = await Order.aggregate([
            { $unwind: '$orderItems' },
            { $lookup: { from: 'orderitems', localField: 'orderItems', foreignField: '_id', as: 'itemData' } },
            { $unwind: '$itemData' },
            { $lookup: { from: 'products', localField: 'itemData.product', foreignField: '_id', as: 'productData' } },
            { $unwind: '$productData' },
            { $lookup: { from: 'categories', localField: 'productData.category', foreignField: '_id', as: 'categoryData' } },
            { $unwind: '$categoryData' },
            {
                $group: {
                    _id: '$categoryData.name', totalProfit: { $sum: { $multiply: ['$productData.price', '$itemData.quantity'] } },
                    totalSold: { $sum: '$itemData.quantity' }, products: { $addToSet: '$productData.name' },
                }
            },
            {
                $project: {
                    _id: 0,
                    Category: '$_id',
                    totalProfit: { $round: ['$totalProfit', 2] }, //! round   
                    Sold: '$totalSold',
                    Products: '$products',
                }
            }
        ])
        if (profits.length == 0) {
            return res.status(400).send('Empty List');
        }

        res.send(profits);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const user_spendings = async (req, res) => {
    const spendings = await Order.aggregate([
        { $group: { _id: '$user', totalSpend: { $sum: '$totalPrice' }, orderCount: { $sum: 1 } } },
        { $sort: { totalSpend: -1 } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userData' } },
        { $unwind: '$userData' },
        {
            $project: {
                _id: 0,
                customer: '$userData.name',
                orderCount: '$orderCount',
                totalSpend: '$totalSpend'
            }
        }
    ])
    if (spendings.length === 0) {
        return res.status(400).send('Empty List')
    }

    res.send(spendings);
}

const user_orders = async (req, res) => {
    const { id } = req.params;
    const userOrders = await Order.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(id) } },
        { $lookup: { from: 'orderitems', localField: 'orderItems', foreignField: '_id', as: 'orderItemData' } },
        { $unwind: '$orderItemData' },
        { $lookup: { from: 'products', localField: 'orderItemData.product', foreignField: '_id', as: 'productData' } },
        { $unwind: '$productData' },
        { $lookup: { from: 'categories', localField: 'productData.category', foreignField: '_id', as: 'categoryData' } },
        { $unwind: '$categoryData' },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userData'}},
        { $unwind: '$userData'},

        { $group: { _id: '$_id', orderItems: { $push: {
                        quantity: '$orderItemData.quantity',
                        productName: '$productData.name',
                        category: '$categoryData.name'
                    } }, userName: { $first: "$userData.name"}}},
                    
        { $group: { _id: "$userName", orderCount: { $sum: 1 }, orders: { $push: {
                    orderId: '$_id',
                    orderItems: '$orderItems'} }}},
        {
            $project: {
                _id: 0,
                userId: '$_id',
                countOfOrders: '$orderCount',
                orderItems: '$orders'
            }
        }

    ])
    res.send(userOrders);

}

const get_user_orders = async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await Order.find({ user: id }).populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        });
        if (!orders) {
            return res.status(404).json({
                success: false,
                message: "User orders has not found."
            })
        }
        res.status(200).json({
            success: true,
            orderLength: orders.length,
            orders: orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    get_orders,
    get_order_details,
    get_user_orders,
    post_order,
    update_order,
    delete_order,
    cancel_order,
    order_soft_delete,
    get_totalSales,
    best_seller,
    most_profitable,
    category_profits,
    user_spendings,
    user_orders
}