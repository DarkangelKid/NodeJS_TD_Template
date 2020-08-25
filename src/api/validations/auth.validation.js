const Joi = require('@hapi/joi');

module.exports = {
  // POST /v1/auth/register
  register: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(6).max(128),
      firstname: Joi.string().required().min(2).max(20),
      lastname: Joi.string().required().min(2).max(20),
    }),
  },

  // POST /v1/auth/login
  login: {
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required().max(128),
    }),
  },

  // POST /v1/auth/facebook
  // POST /v1/auth/google
  oAuth: {
    body: Joi.object({
      access_token: Joi.string().required(),
    }),
  },

  // POST /v1/auth/refresh
  refresh: {
    body: Joi.object({
      username: Joi.string().required(),
      refreshToken: Joi.string().required(),
    }),
  },

  // POST /v1/auth/refresh
  sendPasswordReset: {
    body: Joi.object({
      email: Joi.string().required(),
    }),
  },

  // POST /v1/auth/password-reset
  passwordReset: {
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required().min(6).max(128),
      resetToken: Joi.string().required(),
    }),
  },
};
