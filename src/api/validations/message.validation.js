const Joi = require('@hapi/joi');

module.exports = {
  createMessage: {
    body: Joi.object({
      text: Joi.string(),
      receiver: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
      conversationType: Joi.string().required(),
      type: Joi.string(),
      message: Joi.string(),
      images: Joi.array().max(50),
      files: Joi.array().max(50),
    }),
  },
  getConversation: {
    params: Joi.object({
      receiverId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }),
    query: Joi.object({
      skip: Joi.number().min(0),
      limit: Joi.number().min(1).max(50),
    }),
  },
  imagesList: {
    query: Joi.object({
      skip: Joi.number().min(0),
      limit: Joi.number().min(1).max(50),
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }),
  },
  filesList: {
    query: Joi.object({
      skip: Joi.number().min(0),
      limit: Joi.number().min(1).max(50),
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }),
  },
};
