const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/message.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

router.route('/photos').post(authorize(), controller.addPhotos).get(authorize(), controller.listPhotos);
router.route('/files').post(authorize(), controller.addFiles).get(authorize(), controller.listFiles);

router
  .route('/getConversations')
  // lấy thông tin
  .get(authorize(), controller.getConversations);

router
  .route('/createMessage')
  // lấy thông tin
  .post(authorize(), controller.createMessage);

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
  .route('/deleteMessage')
  // lấy thông tin
  .delete(authorize(), controller.deleteMessage);

router
  .route('/:conversationId')

  // Lấy thông tin cuộc trò chuyện dựa vào id
  .get(authorize(LOGGED_USER), controller.getMessage);

module.exports = router;
