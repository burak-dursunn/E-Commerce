const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.get_orders);
router.get('/:id', orderController.get_order_details);
router.post('/', orderController.post_order); //* user
router.put('/:id', orderController.update_order);
router.delete('/:id', orderController.delete_order);
//! Aggragation Functions
router.get('/get/user-orders/:user_id', orderController.get_user_orders);
router.get('/get/total-sales', orderController.get_totalSales);
router.get('/get/best-seller', orderController.best_seller); //* user
router.get('/get/most-profitable', orderController.most_profitable);
router.get('/get/category-profits', orderController.category_profits);
router.get('/get/user-spendings', orderController.user_spendings);
router.get('/cancel-order/:id', orderController.cancel_order);



module.exports = router;