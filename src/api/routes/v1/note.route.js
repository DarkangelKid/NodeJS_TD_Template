const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/note.controller');
const { authorize, LOGGED_USER, ADMIN } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

//router.param('userId', controller.load);

router.route('/GetChiTiet').get(authorize(), controller.findOne);
router.route('/Create').post(authorize(), controller.create);
router.route('/Delete').delete(authorize(), controller.remove);
router.route('/Edit').post(authorize(), controller.update);
router.route('/GetList').get(authorize(), controller.findAll);


module.exports = router;
