const Joi = require('@hapi/joi');

module.exports = {

  // POST /v1/contacts
  createContact: {
    query: Joi.object({
      user: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }),
  },

  // PUT /v1/contacts/:contactId
  // replaceContact: {
  //   body: {
  //     email: Joi.string()
  //       .email()
  //       .required(),
  //     password: Joi.string()
  //       .min(6)
  //       .max(128)
  //       .required(),
  //     name: Joi.string().max(128),
  //     role: Joi.string().valid(Contact.roles)
  //   },
  //   params: {
  //     contactId: Joi.string()
  //       .regex(/^[a-fA-F0-9]{24}$/)
  //       .required()
  //   }
  // },

  // PATCH /v1/contacts/:contactId
  updateContact: {
    query: Joi.object({
      user: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }),
  },
  deleteContact: {
    query: Joi.object({
      user: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }),
  },
};
