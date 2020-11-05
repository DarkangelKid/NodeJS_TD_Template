const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/comment.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

//router.param('userId', controller.load);

router.route('/CreateComment').post(authorize(), controller.CreateComment);
router.route('/DeleteComment').post(authorize(), controller.DeleteComment);
router.route('/EditComment').post(authorize(), controller.EditComment);
router.route('/GetListComment').get(authorize(), controller.GetListComment);

module.exports = router;
