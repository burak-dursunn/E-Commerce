const express =  require('express');
const router = express.Router();
const productController = require('../controllers/productController')

router.get(`/`, productController.product_create_get);
router.post(`/`, productController.product_create_post); //* admin
router.get('/:id', productController.product_get_details);
router.put('/:id', productController.product_update);   //* admin
router.delete(`/:id`, productController.product_delete);//* admin
router.delete(`/soft-delete/:id`, productController.soft_delete);   //* admin
//! Soft Delete: The Product for the given ID is not actually deleted from the database. 
//? Instead, We are set the isDeleted field to true. So that it's mark as deleted. If we need te soft-deleted product in the future, we can restore it from our database
router.get('/get/count', productController.count_of_products);//* admin
router.get('/get/featured{/:count}', productController.get_featured_products) //* admin
router.get('/get/ids', productController.product_get_ids); //* admin
router.get('/get/accumulator', productController.accumulator); 

module.exports = router;