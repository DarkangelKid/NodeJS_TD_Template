const httpStatus = require('http-status');
const { omit } = require('lodash');

const APIError = require('../utils/APIError');
const db = require('../../config/mssql');

const Contact = db.contacts;
const User = db.users;
const { Op } = db.Sequelize;

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
