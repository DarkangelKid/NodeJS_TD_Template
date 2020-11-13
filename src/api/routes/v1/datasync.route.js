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

router.route('/handlecybersecurity').post(controller.HandleCybersecurity);
router.route('/handlecamera').post(controller.HandleCamera);
router.route('/CybersecurityIPBiTanCong').get(controller.CybersecurityIPBiTanCong);
router.route('/CybersecurityIPTanCong').get(controller.CybersecurityIPTanCong);
router.route('/CybersecurityQuocGiaTanCong').get(controller.CybersecurityQuocGiaTanCong);
router.route('/CybersecurityTongHopCuocTanCong').get(controller.CybersecurityTongHopCuocTanCong);
router.route('/CybersecurityDoTinCay').get(controller.CybersecurityDoTinCay);
router.route('/FixData').get(controller.FixData);


//

//router.route('/autojob').get(controller.autoJob);

module.exports = router;
