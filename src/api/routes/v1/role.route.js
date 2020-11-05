const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/role.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

router
  .route('/')
  // tìm kiếm
  .get(authorize(LOGGED_USER), controller.findAll)
  // tạo mới
  .post(authorize(LOGGED_USER), controller.create);

router
  .route('/:id')
  // lấy thông tin
  .get(authorize(), controller.findOne)
  // sửa thông tin
  .patch(authorize(), controller.update)
  // xóa thông tin
  .delete(authorize(), controller.remove);

module.exports = router;
