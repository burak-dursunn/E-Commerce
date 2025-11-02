const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.get_orders);
router.get('/:id', orderController.get_order_details);
router.post('/', orderController.post_order);


module.exports = router;