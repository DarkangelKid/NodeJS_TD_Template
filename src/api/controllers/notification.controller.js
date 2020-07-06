const httpStatus = require('http-status');
const { omit } = require('lodash');
const Notification = require('../models/notification.model');
const APIError = require('../utils/APIError');

var admin = require("firebase-admin");
const { firebase_service_accout_key_Path, firebase_service_url } = require('../../config/vars');
var serviceAccount = require(firebase_service_accout_key_Path);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebase_service_url,
});


exports.sendtoTopic = async (req, res, next) => {
  try {

    const data = req.body;
    const topics = data.topics;
    const registrationTokens = data.registrationTokens;
    const appType = data.appType;

    const notification = data.notification;
    const dataNotifi = data.data;

    var message = {
      data: dataNotifi,
      notification: data.notification,
      tokens: data.registrationTokens,
    };

    const messages = [];

    registrationTokens.map((registrationToken) => {
      messages.push({
        data: dataNotifi,
        notification: notification,
        token: registrationToken,
      });
    });

    await Promise.all(
      topics.map(async (topic) => {
        let notifi = {
          data: dataNotifi,
          notification: notification,
          topic: topic,
        };
        messages.push(notifi);

        if (appType !== "CHAT_Drawer") {
          const notifi = new Notification({
            data: dataNotifi,
            notification: notification,
            topic: topic,
            appType: appType,
          });
          const savedNotifi = await notifi.save();
        }
      })
    );

    var result = await admin
      .messaging()
      .sendAll(messages)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return next(error);
      });
    res.json(result);
  } catch (error) {
    return next(error);
  }
};

exports.load = async (req, res, next, id) => {
  try {
    const notification = await Notification.get(id);
    req.locals = { notification };
    return next();
  } catch (error) {
    return next(error);
  }
};


exports.get = (req, res) => res.json(req.locals.notification.transform());


exports.loggedIn = (req, res) => res.json(req.notification.transform());


exports.replace = async (req, res, next) => {
  try {
    const { notification } = req.locals;
    const newItem = new Notification(req.body);
    const newObject = omit(newItem.toObject(), '_id');

    await notification.updateOne(newObject, { override: true, upsert: true });
    const savedNotification = await Notification.findById(notification._id);

    res.json(savedNotification.transform());
  } catch (error) {
    next(error);
  }
};


exports.list = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    let key = req.user.email;
    const type = req.query.type ? req.query.type : '';
    let { skip, limit } = req.query;
    const notifis = await Notification.list({ type, key, skip, limit });
    res.json(notifis);
  } catch (error) {
    next(error);
  }
};


exports.remove = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { notification } = req.locals;

    if (notification && notification.topic === currentUser.email) {
      notification
        .remove()
        .then(() => res.status(httpStatus.OK).end())
        .catch((e) => next(e));
    } else {
      throw new APIError({
        message: 'Notification does not exist',
        status: httpStatus.BAD_REQUEST,
      });
    }
  } catch (error) {
    next(error);
  }
};


exports.removeAll = async (req, res, next) => {
  try {
    const currentUser = req.user;

    Notification.remove({ topic: currentUser.email }).then(() => res.status(httpStatus.OK).end())
      .catch((e) => next(e));;
  } catch (error) {
    next(error);
  }
};

exports.isReadAll = async (req, res, next) => {
  try {
    const currentUser = req.user;

    Notification.update({ topic: currentUser.email }, { isRead: true }).then(() => res.status(httpStatus.OK).end())
      .catch((e) => next(e));;
  } catch (error) {
    next(error);
  }
};
