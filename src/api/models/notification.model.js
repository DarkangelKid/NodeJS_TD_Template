const mongoose = require('mongoose');
const httpStatus = require('http-status');

const APIError = require('../utils/APIError');


const notificationSchema = new mongoose.Schema(
  {
    notification: {
    },
    data: {
    },
    topic: String,
    appType: String,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);


notificationSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'notification', 'data', 'topic', 'appType', 'isRead'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

notificationSchema.statics = {

  async get(id) {
    try {
      let item;

      if (mongoose.Types.ObjectId.isValid(id)) {
        item = await this.findById(id).exec();
      }
      if (item) {
        return item;
      }

      throw new APIError({
        message: 'Notification does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },


  async list({ key, type, skip = 0, limit = 30 }) {
    let options = {};

    if (type.length > 1) {
      options = {
        $and: [{ topic: key }, { appType: type }],
      };
    } else {
      options = {
        $and: [{ topic: key }],
      };
    }

    return this.find(options)
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
};

/**
 * @typedef Notification
 */
module.exports = mongoose.model('Notification', notificationSchema);
