const Joi = require('@hapi/joi');
const ChatGroup = require('../models/chatGroup.model');

module.exports = {
  // GET /v1/chatGroups
  listChatGroup: {
    query: Joi.object({
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    }),
  },

  // POST /v1/chatGroups
  createChatGroup: {
    body: Joi.object({
      members: Joi.array()
        .min(2)
        .max(50)
        .items(
          Joi.string()
            .regex(/^[a-fA-F0-9]{24}$/)
            .required(),
        ),
      name: Joi.string().min(1).max(50).required(),
    }),
  },

  // PATCH /v1/chatGroups/:chatGroupId
  updateChatGroup: {
    body: Joi.object({
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
      name: Joi.string().min(1).max(50).required(),
    }),
  },
  deleteChatGroup: {
    query: Joi.object({
      chatGroupId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }),
  },

  removeMember: {
    query: Joi.object({
      group: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
      user: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }),
  },

  addMember: {
    body: Joi.object({
      members: Joi.array()
        .items(
          Joi.string()
            .regex(/^[a-fA-F0-9]{24}$/)
            .required(),
        )
        .min(1)
        .max(50),
      groupId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }),
  },
};
