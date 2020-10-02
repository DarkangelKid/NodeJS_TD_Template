const httpStatus = require('http-status');
const { omit } = require('lodash');
const admin = require('firebase-admin');
const APIError = require('../utils/APIError');

const db = require('../../config/mssql');

const { Op } = db.Sequelize;

const { firebase_service_accout_key_Path, firebase_service_url } = require('../../config/vars');

const serviceAccount = require(firebase_service_accout_key_Path);

const Notification = db.notification;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebase_service_url,
});

exports.sendtoTopic = async (req, res, next) => {
  try {
    const data = req.body;

    const { topics } = data;
    const { registrationTokens } = data;
    const { appType } = data;

    const { notification } = data;
    const dataNotifi = data.data;

    if (topics.length < 1) {
      throw new APIError({
        message: 'Something went wrong',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const messages = [];

    registrationTokens.map((registrationToken) => {
      messages.push({
        data: {},
        notification,
        token: registrationToken,
      });
    });

    await Promise.all(
      topics.map(async (topic) => {
        const notifi = {
          data: dataNotifi,
          notification,
          topic,
        };
        messages.push(notifi);

        if (appType !== 'CHAT_Drawer' || appType !== 'TT_HOP') {
          /* const notifi = new Notification({
            data: dataNotifi,
            notification,
            topic,
            appType,
          });
          const savedNotifi = await notifi.save(); */

          const item = await Notification.create({
            username: topic,
            title: notification.title,
            body: notification.body,
            appType,
            data: JSON.stringify(dataNotifi),
          });
        }
      }),
    );

    const result = await admin
      .messaging()
      .sendAll(messages)
      .then((response) => response)
      .catch((error) => next(error));
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
    const currentUserId = req.user.username;
    const key = req.user.email;
    const type = req.query.type ? req.query.type : '';
    const { skip, limit } = req.query;
    const notifis = await Notification.list({
      type,
      key,
      skip,
      limit,
    });
    res.json(notifis);
  } catch (error) {
    next(error);
  }
};

exports.getVoiceNotifi = async (req, res, next) => {
  try {
    const currentUserId = req.user.username;
    console.log(currentUserId);

    const notifis = await Notification.findAll({
      where: { username: currentUserId, isRead: false },
    });

    let value_str = '';
    if (notifis.length < 1) {
      value_str = 'Hiện tại bạn không có thông báo nào.';
    } else {
      let QLVB_Drawer = [];
      let DVC_Drawer = [];
      let CDDH_Drawer = [];
      let QLCB_Drawer = [];
      let KNTC_Drawer = [];
      let TLCH_Drawer = [];
      let PAKN_Drawer = [];

      notifis.map((item) => {
        console.log('item item');
        console.log(item.appType);

        let appType = item.appType;
        switch (appType) {
          case 'QLVB_Drawer':
            QLVB_Drawer.push(item.body);
            break;
          case 'DVC_Drawer':
            DVC_Drawer.push(item.body);
            break;
          case 'CDDH_Drawer':
            CDDH_Drawer.push(item.body);
            break;
          case 'QLCB_Drawer':
            QLCB_Drawer.push(item.body);
            break;
          case 'KNTC_Drawer':
            KNTC_Drawer.push(item.body);
            break;
          case 'PAKN_Drawer':
            PAKN_Drawer.push(item.body);
            break;
          case 'TLCH_Drawer':
            TLCH_Drawer.push(item.body);
            break;
          default:
            break;
        }
      });

      if (QLVB_Drawer.length > 0) {
        value_str += ` quản lý văn bản có ${QLVB_Drawer.length} thông báo. `;
        QLVB_Drawer.map((value, index) => {
          value_str += `Thông báo thứ ${index + 1} ${value}. `;
        });
      }
      if (DVC_Drawer.length > 0) {
        value_str += ` dịch vụ công có ${DVC_Drawer.length} thông báo. `;
        DVC_Drawer.map((value, index) => {
          value_str += `Thông báo thứ ${index + 1} ${value}. `;
        });
      }
      if (CDDH_Drawer.length > 0) {
        value_str += ` theo dõi thực hiện nhiệm vụ có ${CDDH_Drawer.length} thông báo, `;
        CDDH_Drawer.map((value, index) => {
          value_str += `Thông báo thứ ${index + 1} ${value}. `;
        });
      }
      if (QLCB_Drawer.length > 0) {
        value_str += ` quản lý cán bộ có ${QLCB_Drawer.length} thông báo. `;
        QLCB_Drawer.map((value, index) => {
          value_str += `Thông báo thứ ${index + 1} ${value}. `;
        });
      }
      if (KNTC_Drawer.length > 0) {
        value_str += ` khiếu nại tố cáo có ${KNTC_Drawer.length} thông báo. `;
        KNTC_Drawer.map((value, index) => {
          value_str += `Thông báo thứ ${index + 1} ${value}. `;
        });
      }
      if (TLCH_Drawer.length > 0) {
        value_str += ` quản lý cuộc họp có ${TLCH_Drawer.length} thông báo. `;
        TLCH_Drawer.map((value, index) => {
          value_str += `Thông báo thứ ${index + 1} ${value}. `;
        });
      }
      if (PAKN_Drawer.length > 0) {
        value_str += ` phản ánh kiến nghị có ${PAKN_Drawer.length} thông báo. `;
        PAKN_Drawer.map((value, index) => {
          value_str += `Thông báo thứ ${index + 1} ${value}. `;
        });
      }
    }

    res.json({ data: value_str });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { id } = req.query;
    const notifi = await Notification.destroy({
      where: { id, username: currentUser.username },
    });
    res.json({ data: notifi });
  } catch (error) {
    next(error);
  }
};

exports.isRead = async (req, res, next) => {
  try {
    const { id } = req.query;

    const notifi = await Notification.findOne({
      where: { id },
    });

    notifi.isRead = true;
    await notifi.save();

    res.json({ data: notifi });
  } catch (error) {
    next(error);
  }
};

exports.ChiTietThongBao = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { id } = req.query;

    const notifi = await Notification.findOne({
      where: { id: id, username: currentUser.username },
    });

    notifi.isRead = true;
    await notifi.save();

    res.json({ data: notifi });
  } catch (error) {
    next(error);
  }
};

exports.GetListNotifi = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { q, page, perpage, appType } = req.query;
    const { limit, offset } = getPagination(page, perpage);
    const condition = appType ? { appType: appType, username: currentUser.username } : { username: currentUser.username };
    const attributes = ['id', 'name', 'code', 'description', 'parentId'];

    Notification.findAndCountAll({
      where: condition,
      limit,
      offset,
    })
      .then((data) => {
        const response = getPagingData(data, page, limit);
        res.json(response);
      })
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};
exports.findAll = async (req, res, next) => {
  const { q, page, perpage, username, appType } = req.query;
  const { limit, offset } = getPagination(page, perpage);
  const condition = appType ? { appType: appType, username: username } : { username: username };
  const attributes = ['id', 'name', 'code', 'description', 'parentId'];

  Notification.findAndCountAll({
    where: condition,
    limit,
    offset,
  })
    .then((data) => {
      const response = getPagingData(data, page, limit);
      res.json(response);
    })
    .catch((e) => next(e));
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

exports.isReadAll = async (req, res, next) => {
  try {
    const currentUser = req.user;

    await Notification.update(
      { username: currentUser.username },
      {
        where: {
          isRead: true,
        },
      },
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const currentUser = req.user;

    await Notification.destroy({ username: currentUser.username });
  } catch (error) {
    next(error);
  }
};

const getPagination = (page, perpage) => {
  const limit = perpage ? +perpage : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: listItems } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    meta: {
      total: totalItems,
      pages: totalPages,
      page: currentPage,
      perpage: limit,
    },
    data: listItems,
  };
};
