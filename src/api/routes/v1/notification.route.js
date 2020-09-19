const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/notification.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

/** * Load notification when API with notifiId route parameter is hit */
router.param('notifiId', controller.load);

router.route('/sendtoTopic').post(controller.sendtoTopic);
router.route('/deleteAll').delete(authorize(LOGGED_USER), controller.removeAll);
router.route('/isReadAll').put(authorize(LOGGED_USER), controller.isReadAll);

router
  .route('/')
  .get(authorize(LOGGED_USER), controller.list);

router
  .route('/:notifiId')
  .get(authorize(LOGGED_USER), controller.get)
  .delete(authorize(LOGGED_USER), controller.remove)
  .put(authorize(LOGGED_USER), controller.replace);

module.exports = router;
