const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/datasync.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

router.route('/camera').post(controller.createCamera);
router.route('/cybersecurity').post(controller.createCybersecurity);

module.exports = router;
