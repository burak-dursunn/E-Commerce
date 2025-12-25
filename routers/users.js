const expresss = require('express');
const router = expresss.Router();
const userController = require('../controllers/userController')


router.get('/', userController.user_get)
router.post('/', userController.user_post) //* user
router.get('/:id', userController.get_user_details)
router.delete('/:id',userController.delete_user);
router.delete('/soft-delete/:id', userController.user_soft_delete);
router.get('/get/ids', userController.user_get_ids);
router.get('/get/count', userController.count_of_users);

//! Login
router.post('/login', userController.user_login);

module.exports = router;
