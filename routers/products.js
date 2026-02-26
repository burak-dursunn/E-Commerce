const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController')
const adminAuth = require('../helpers/adminAuth');

router.get(`/`, productController.product_create_get);
router.post(`/`, adminAuth, productController.product_create_post); //* admin
router.get('/:id', productController.product_get_details);
router.put('/:id', adminAuth, productController.product_update);   //* admin
router.delete(`/:id`, adminAuth, productController.product_delete);//* admin
router.delete(`/soft-delete/:id`, adminAuth, productController.soft_delete);   //* admin
//! Soft Delete: The Product for the given ID is not actually deleted from the database. 
//? Instead, We are set the isDeleted field to true. So that it's mark as deleted. If we need te soft-deleted product in the future, we can restore it from our database
router.get('/get/count', adminAuth, productController.count_of_products);//* admin
router.get('/get/featured{/:count}', adminAuth, productController.get_featured_products) //* admin
router.get('/get/ids', adminAuth, productController.product_get_ids); //* admin
router.get('/get/accumulator', adminAuth, productController.accumulator);

module.exports = router;