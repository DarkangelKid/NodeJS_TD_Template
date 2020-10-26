const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/datasync.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

router.route('/camera').post(authorize(), controller.createCamera);
router.route('/cybersecurity').post(authorize(), controller.createCybersecurity);

module.exports = router;
