const httpStatus = require('http-status');
const { omit } = require('lodash');

const db = require('../../config/mssql');
const Note = db.note;
const User = db.users;

const { Op } = db.Sequelize;

exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.query;
    const attributes = ['id', 'title', 'contentData'];

    Note.findOne({
      where: { id },
      attributes,
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
      },
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

    const itemData = omit(req.body, 'id');
    itemData.userId = currentUser.id;

    console.log('vaoday');
    console.log(itemData);

    const item = await Note.create(itemData);

    //res.status(httpStatus.CREATED);
    return res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.body;
    let item = await Note.findByPk(id);

    const updatedItem = omit(req.body, ['id']);
    item = Object.assign(item, updatedItem);
    item
      .save()
      .then((data) => res.json(data))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.remove = (req, res, next) => {
  try {
    const { id } = req.body;

    Note.destroy({
      where: {
        id,
      },
    })
      .then((data) => res.json(data))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const currentUser = req.user;

    let userId = currentUser.id;

    const { q, page, perpage } = req.query;
    const { limit, offset } = getPagination(page, perpage);
    const condition = q ? { name: { [Op.like]: `%${q}%` } } : null;
    const attributes = ['id', 'title', 'contentData'];

    Note.findAndCountAll({
      where: condition,

      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
        required: true,
        where: {
          id: userId,
        },
      },
      limit,
      offset,
      attributes,
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
