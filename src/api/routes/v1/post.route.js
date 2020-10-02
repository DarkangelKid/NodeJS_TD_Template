const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/post.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

//router.param('userId', controller.load);

router.route('/CreatePost').post(authorize(), controller.CreatePost);
router.route('/GetListPost').get(authorize(), controller.GetListPost);
router.route('/GetListPostInGroup').get(authorize(), controller.GetListPostInGroup);

module.exports = router;
