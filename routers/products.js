const express =  require('express');
const router = express.Router();
const productController = ('../controllers/productController')

router.get(`/`, productController.product_create_get);

router.post(`/`, productController.product_create_post);

module.exports = router;