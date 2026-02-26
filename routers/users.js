const expresss = require('express');
const router = expresss.Router();
const userController = require('../controllers/userController')
const adminAuth = require('../helpers/adminAuth');


router.get('/', adminAuth, userController.user_get);
router.post('/', userController.user_post);

router.get('/get/ids', adminAuth, userController.user_get_ids);
router.get('/get/count', adminAuth, userController.count_of_users);

router.post('/forgot-password', userController.forgot_password);
router.post('/reset-password', userController.reset_password);

router.post('/login', userController.user_login);

router.delete('/soft-delete/:id', adminAuth, userController.user_soft_delete);
router.delete('/:id', adminAuth, userController.delete_user);

router.get('/:id', userController.get_user_details); // ⬅ EN SON

module.exports = router;
