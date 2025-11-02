const orderController = require('../controllers/orderController');

app.post('/', orderController.post_order);