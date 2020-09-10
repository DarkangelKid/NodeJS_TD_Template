const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/message.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

router
  .route('/')
  // Lấy danh sách cuộc trò chuyện và tin nhắn cuối cùng
  .get(authorize(LOGGED_USER), /* validate(list), */ controller.getConversations)
  // Tạo mới tin nhắn
  .post(authorize(LOGGED_USER), controller.createMessage);

router
  .route('/getConversation')
  // lấy thông tin
  .get(authorize(), controller.getConversation);

module.exports = router;
