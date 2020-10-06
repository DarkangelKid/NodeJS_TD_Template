const httpStatus = require('http-status');
const { omit } = require('lodash');

const APIError = require('../utils/APIError');
const db = require('../../config/mssql');
const nofitiController = require('./notification.controller');

const Contact = db.contacts;
const User = db.users;
const ChatGroup = db.chatGroups;

const { Op } = db.Sequelize;

exports.GetContacts = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const queryType = req.query.type ? req.query.type : '';

    const type = ['request', 'contact', 'requestsent'].includes(queryType.toLowerCase()) ? queryType.toLowerCase() : 'contact';
    // console.log(`TYPE: ${type}`);

    let status = 1;
    let query = {};

    switch (type) {
      case 'contact':
        status = 1;
        query = {
          [Op.and]: [{ status }, { [Op.or]: [{ userOneId: currentUser.id }, { userTwoId: currentUser.id }] }],
        };
        break;
      case 'requestsent':
        status = 0;
        query = {
          [Op.and]: [
            { status },
            { [Op.or]: [{ userOneId: currentUser.id }, { userTwoId: currentUser.id }] },
            { actionUserId: currentUser.id },
          ],
        };
        break;
      case 'request':
        status = 0;
        query = {
          [Op.and]: [
            { status },
            { [Op.or]: [{ userOneId: currentUser.id }, { userTwoId: currentUser.id }] },
            { actionUserId: { [Op.ne]: currentUser.id } },
          ],
        };
        break;

      default:
        break;
    }

    const { page, perpage } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    const contacts = await Contact.findAndCountAll({
      where: query,
      limit,
      offset,
    });

    const dataUsers = [];
    await Promise.all(
      contacts.rows.map(async (i) => {
        let user = await User.findByPk(i.userOneId !== currentUser.id ? i.userOneId : i.userTwoId, {
          attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
          include: ['office', 'position'],
        });
        user = user.toJSON();
        user.datacontact = i;
        dataUsers.push(user);
      }),
    );

    const response = getPagingData(Object.assign(contacts, { rows: dataUsers }), page, limit);

    return res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    Contact.findOne({
      where: { id },
    })
      .then((results) => res.json(results))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.CreateContact = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const contactUsername = req.body.username;

    const contactUser = await User.findOne({ where: { username: contactUsername } });
    if (!contactUser) {
      throw new APIError({
        message: 'Không tồn tại người dùng',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const contactUserId = contactUser.id;

    const userOneId = currentUser.id < contactUserId ? currentUser.id : contactUserId;
    const userTwoId = currentUser.id > contactUserId ? currentUser.id : contactUserId;

    if (!userOneId || !userTwoId || userOneId === userTwoId) {
      throw new APIError({
        message: 'Something went wrong',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const checkContact = await Contact.findOne({
      where: {
        [Op.and]: [{ userOneId }, { userTwoId }],
      },
    });

    if (checkContact && checkContact.status !== 2) {
      throw new APIError({
        message: 'Contact already exist',
        status: httpStatus.BAD_REQUEST,
      });
    }

    if (checkContact && checkContact.status === 2) {
      checkContact.status = 0;
      checkContact.actionUserId = currentUser.id;
      await checkContact.save();

      let dataSend = {
        topics: [contactUser.username],
        registrationTokens: [],
        notification: {
          title: `${currentUser.fullName} đã gửi lời mời kết bạn`,
          body: `${currentUser.fullName} đã gửi lời mời kết bạn`,
        },
        appType: 'TTNB_Drawer',
        data: {
          id: `${currentUser.username}`,
          code: 'ttnb',
          function: 'KetBan',
        },
      };

      let resultnotifi = await nofitiController.sendtoTopicLocal(dataSend);
      console.log(resultnotifi);

      return res.json(checkContact);
    }

    const item = await Contact.create({
      userOneId,
      userTwoId,
      status: 0,
      actionUserId: currentUser.id,
    });

    let dataSend = {
      topics: [contactUser.username],
      registrationTokens: [],
      notification: {
        title: `${currentUser.fullName} đã gửi lời mời kết bạn`,
        body: `${currentUser.fullName} đã gửi lời mời kết bạn`,
      },
      appType: 'TTNB_Drawer',
      data: {
        id: `${currentUser.username}`,
        code: 'ttnb',
        function: 'KetBan',
      },
    };

    let resultnotifi = await nofitiController.sendtoTopicLocal(dataSend);

    console.log(resultnotifi);

    res.status(httpStatus.CREATED);
    return res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const contactUserId = req.body.id;

    const userOneId = currentUser.id < contactUserId ? currentUser.id : contactUserId;
    const userTwoId = currentUser.id > contactUserId ? currentUser.id : contactUserId;

    if (!userOneId || !userTwoId || userOneId === userTwoId) {
      throw new APIError({
        message: 'Something went wrong',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const checkContact = await Contact.findOne({
      where: {
        [Op.and]: [{ userOneId }, { userTwoId }],
      },
    });

    if (checkContact) {
      throw new APIError({
        message: 'Contact already exist',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const item = await Contact.create({
      userOneId,
      userTwoId,
      status: 0,
      actionUserId: currentUser.id,
    })
      .then((result) => result)
      .catch((err) => next(err));

    res.status(httpStatus.CREATED);
    return res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.HandleContact = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { status, id } = req.body;

    if (!status || !id) {
      throw new APIError({
        message: 'Something went wrong',
        status: httpStatus.BAD_REQUEST,
      });
    }
    let item = await Contact.findByPk(id);

    item = Object.assign(item, { status, actionUserId: currentUser.id });
    item
      .save()
      .then((data) => res.json(data))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    let item = await Contact.findByPk(id);

    const { status } = req.body;

    if (!status || !id) {
      throw new APIError({
        message: 'Something went wrong',
        status: httpStatus.BAD_REQUEST,
      });
    }

    item = Object.assign(item, { status, actionUserId: currentUser.id });
    item
      .save()
      .then((data) => res.json(data))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.remove = (req, res, next) => {
  const { id } = req.params;

  Contact.destroy({
    where: {
      id,
    },
  })
    .then((data) => res.json(data))
    .catch((e) => next(e));
};

exports.yeucauchoxl = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { page, perpage } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    const contacts = await Contact.findAndCountAll({
      where: {
        [Op.and]: [{ status: 0 }, { [Op.or]: [{ userOneId: currentUser.id }, { userTwoId: currentUser.id }] }],
      },
      limit,
      offset,
    });

    const dataUsers = [];
    await Promise.all(
      contacts.rows.map(async (i) => {
        let user = await User.findByPk(i.userOneId !== currentUser.id ? i.userOneId : i.userTwoId, {
          attributes: ['id', 'fullName', 'username', 'avatarUrl', 'phoneNumber'],
        });
        user = user.toJSON();
        dataUsers.push(user);
      }),
    );

    const response = getPagingData(Object.assign(contacts, { rows: dataUsers }), page, limit);

    return res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.GetContactsChatGroup = async (req, res, next) => {
  try {
    const currentUser = req.user;

    let status = 1;
    let query = {
      [Op.and]: [{ status }, { [Op.or]: [{ userOneId: currentUser.id }, { userTwoId: currentUser.id }] }],
    };

    const contacts = await Contact.findAndCountAll({
      where: query,
    });

    const dataUsers = [];
    await Promise.all(
      contacts.rows.map(async (i) => {
        let user = await User.findByPk(i.userOneId !== currentUser.id ? i.userOneId : i.userTwoId, {
          attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
          include: ['office', 'position'],
        });
        user = user.toJSON();
        //user.datacontact = i;
        user.type = 'User';

        dataUsers.push(user);
      }),
    );

    const groups = await ChatGroup.findAndCountAll({
      include: {
        model: User,
        as: 'users',
        attributes: ['id', 'username'],
        required: true,
        where: {
          id: currentUser.id,
        },
      },
    });

    groups.rows.map(async (i) => {
      user = i.toJSON();
      user.type = 'ChatGroup';
      user.fullName = user.name;
      user.username = user.id;
      dataUsers.push(user);
    });

    return res.json(dataUsers);
  } catch (error) {
    next(error);
  }
};

exports.danhsachbanbe = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { page, perpage } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    const contacts = await Contact.findAndCountAll({
      where: {
        [Op.and]: [{ status: 1 }, { [Op.or]: [{ userOneId: currentUser.id }, { userTwoId: currentUser.id }] }],
      },
      limit,
      offset,
    });

    const dataUsers = [];
    await Promise.all(
      contacts.rows.map(async (i) => {
        let user = await User.findByPk(i.userOneId !== currentUser.id ? i.userOneId : i.userTwoId, {
          attributes: ['id', 'fullName', 'username', 'avatarUrl', 'phoneNumber'],
        });
        user = user.toJSON();
        dataUsers.push(user);
      }),
    );

    const response = getPagingData(Object.assign(contacts, { rows: dataUsers }), page, limit);

    return res.json(response);
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
