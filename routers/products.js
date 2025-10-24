const express =  require('express');
const router = express.Router();
const productController = require('../controllers/productController')

router.get(`/`, productController.product_create_get);
router.post(`/`, productController.product_create_post);
router.get('/:id', productController.product_get_details);
router.put('/:id', productController.product_update);
router.delete(`/:id`, productController.product_delete);

module.exports = router;