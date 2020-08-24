const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/auth.controller');
const {
  login, register, refresh, sendPasswordReset, passwordReset,
} = require('../../validations/auth.validation');

const router = express.Router();

router
  .route('/register')
  .post(/* validate(register),  */controller.register);

router
  .route('/login')
  .post(validate(login), controller.login);

router.route('/refresh-token').post(validate(refresh), controller.refresh);

router.route('/send-password-reset').post(validate(sendPasswordReset), controller.sendPasswordReset);

router.route('/reset-password').post(validate(passwordReset), controller.resetPassword);

module.exports = router;
