const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/attachment.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

router.route('/photos').post(authorize(), controller.addPhotos);
router.route('/files').post(authorize(), controller.addFiles);


module.exports = router;
