const express = require('express');
const controller = require('../../controllers/auth.sql.controller');

const router = express.Router();

router.route('/register').post(controller.register);
router.route('/login').post(controller.login);
router.route('/refresh-token').post(controller.refresh);

module.exports = router;
