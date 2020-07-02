const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/auth.controller');
const {
  login, register, refresh, sendPasswordReset, passwordReset,
} = require('../../validations/auth.validation');

const router = express.Router();

router
  .route('/register')
  // Đăng kí
  .post(/* validate(register),  */controller.register);

router
  .route('/login')
  // Đăng nhập
  .post(validate(login), controller.login);

/**
 * @api {post} v1/auth/refresh-token Refresh Token
 * @apiDescription Refresh expired accessToken
 * @apiVersion 1.0.0
 * @apiName RefreshToken
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  email         User's email
 * @apiParam  {String}  refreshToken  Refresh token aquired when user logged in
 *
 * @apiSuccess {String}  tokenType     Access Token's type
 * @apiSuccess {String}  accessToken   Authorization Token
 * @apiSuccess {String}  refreshToken  Token to get a new accessToken after expiration time
 * @apiSuccess {Number}  expiresIn     Access Token's expiration time in miliseconds
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized     Incorrect email or refreshToken
 */
router.route('/refresh-token').post(validate(refresh), controller.refresh);

router.route('/send-password-reset').post(validate(sendPasswordReset), controller.sendPasswordReset);

router.route('/reset-password').post(validate(passwordReset), controller.resetPassword);

module.exports = router;
