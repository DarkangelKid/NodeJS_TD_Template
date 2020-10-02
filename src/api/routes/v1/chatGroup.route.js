const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/chatGroup.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

router
  .route('/')
  // tạo mới
  .post(authorize(LOGGED_USER), controller.create);
  router.route('/ImportGroup').post(authorize(LOGGED_USER), controller.ImportGroup);

router
  .route('/')
  // danh sách
  .get(authorize(LOGGED_USER), controller.danhsachnhomchat);

router.route('/member').post(authorize(LOGGED_USER), controller.addMember).delete(authorize(), controller.removeMember);

router.route('/avatar/:id').post(authorize(LOGGED_USER), controller.updateAvatar);

router
  .route('/:id')
  // lấy thông tin
  .get(authorize(), controller.getThongTin)
  // sửa thông tin
  .patch(authorize(), controller.update)
  // xóa thông tin
  .delete(authorize(), controller.remove);

module.exports = router;
