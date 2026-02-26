const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const adminAuth = require('../helpers/adminAuth');

router.get('/', adminAuth, orderController.get_orders);
router.get('/:id', adminAuth, orderController.get_order_details);
router.post('/', orderController.post_order); //* user
router.put('/:id', adminAuth, orderController.update_order);
router.delete('/:id', adminAuth, orderController.delete_order);
router.delete("/cancel-order/:id", adminAuth, orderController.cancel_order);
router.delete('/soft-delete/:id', adminAuth, orderController.order_soft_delete);

//! Aggragation Functions
router.get('/get/total-sales', adminAuth, orderController.get_totalSales);
router.get('/get/status', adminAuth, orderController.get_orders_status);
router.get('/get/best-seller', orderController.best_seller); //* user
router.get('/get/most-profitable', adminAuth, orderController.most_profitable);
router.get('/get/category-profits', adminAuth, orderController.category_profits);
router.get('/get/user-spendings', adminAuth, orderController.user_spendings);
router.get('/cancel-order/:id', adminAuth, orderController.cancel_order);
router.get('/get/user-orders/:id', orderController.user_orders);
router.get('/get/:id', orderController.user_orders);



module.exports = router;