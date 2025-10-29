const expresss = require('express');
const router = expresss.Router();
const userController = require('../controllers/userController')


router.get('/', userController.user_get)

router.post('/', userController.user_post)
router.get('/:id', userController.get_user_details)

router.delete('/:id',userController.delete_user);

module.exports = router;
