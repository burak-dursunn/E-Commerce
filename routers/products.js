const express =  require('express');
const router = express.Router();
const productController = require('../controllers/productController')

router.get(`/`, productController.product_create_get);
router.post(`/`, productController.product_create_post);
router.delete(`/:id`, productController.product_delete);

module.exports = router;