const express = require('express')
const router = express.Router();
const categoryController = require('../controllers/categoryController');


router.get('/', categoryController.category_create_get);
router.post('/', categoryController.category_create_post);

module.exports = router;