const express = require('express')
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const adminAuth = require('../helpers/adminAuth');


router.get('/', categoryController.category_create_get); //* user
router.post('/', adminAuth, categoryController.category_create_post);
router.get('/:id', categoryController.category_get_details);  //* user
router.get('/get/ids', adminAuth, categoryController.only_ids);
router.put('/:id', adminAuth, categoryController.category_update);
router.delete('/:id', adminAuth, categoryController.category_delete);
module.exports = router;