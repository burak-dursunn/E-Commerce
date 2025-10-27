const express =  require('express');
const router = express.Router();
const productController = require('../controllers/productController')

router.get(`/`, productController.product_create_get);
router.post(`/`, productController.product_create_post);
router.get('/:id', productController.product_get_details);
router.put('/:id', productController.product_update);
router.delete(`/:id`, productController.product_delete);
router.get('/get/count', productController.count_of_products);
router.get('/get/featured{/:count}', productController.get_featured_products)

module.exports = router;