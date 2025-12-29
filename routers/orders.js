const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.get_orders);
router.get('/:id', orderController.get_order_details);
router.post('/', orderController.post_order); //* user
router.put('/:id', orderController.update_order);
router.delete('/:id', orderController.delete_order);
router.delete("/cancel-order/:id", orderController.cancel_order);
router.delete('/soft-delete/:id', orderController.order_soft_delete);

//! Aggragation Functions
router.get('/get/total-sales', orderController.get_totalSales);
router.get('/get/status', orderController.get_orders_status);
router.get('/get/best-seller', orderController.best_seller); //* user
router.get('/get/most-profitable', orderController.most_profitable);
router.get('/get/category-profits', orderController.category_profits);
router.get('/get/user-spendings', orderController.user_spendings);
router.get('/cancel-order/:id', orderController.cancel_order);
router.get('/get/user-orders/:id', orderController.user_orders);
router.get('/get/:id', orderController.user_orders);



module.exports = router;