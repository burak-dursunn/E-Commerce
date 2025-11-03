const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.get_orders);
router.get('/:id', orderController.get_order_details);
router.post('/', orderController.post_order);
router.put('/:id', orderController.update_order);
router.delete('/:id', orderController.delete_order);


module.exports = router;