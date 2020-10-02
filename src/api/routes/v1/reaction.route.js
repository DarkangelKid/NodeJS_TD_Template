const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/reaction.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

router.route('/CreateReaction').post(authorize(), controller.CreateReaction);
router.route('/DeleteReaction').post(authorize(), controller.DeleteReaction);

module.exports = router;
