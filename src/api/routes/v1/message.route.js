const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/message.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

console.log('aaavaoady');
router.route('/photos').post(authorize(), controller.addPhotos);
router.route('/files').post(authorize(), controller.addFiles);

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

router
  .route('/:conversationId')

  // Lấy thông tin cuộc trò chuyện dựa vào id
  .get(authorize(LOGGED_USER), controller.getMessage);

module.exports = router;
