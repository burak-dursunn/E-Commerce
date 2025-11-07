const express = require('express')
const router = express.Router();
const categoryController = require('../controllers/categoryController');


router.get('/', categoryController.category_create_get);
router.post('/', categoryController.category_create_post);
router.get('/:id', categoryController.category_get_details);
router.get('/get/id', categoryController.only_ids);
router.put('/:id', categoryController.category_update);
router.delete('/:id', categoryController.category_delete);
module.exports = router;