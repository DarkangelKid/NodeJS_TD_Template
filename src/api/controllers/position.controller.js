const httpStatus = require('http-status');
const { omit } = require('lodash');

const db = require('../../config/mssql');

const Position = db.positions;

const { Op } = db.Sequelize;
const Datas = require('../data/ChucVu_NamDinh.json');

exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attributes = ['id', 'name', 'code', 'description'];

    Position.findOne({
      where: { id },
      attributes,
    })
      .then((results) => res.json(results))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.ImportPosition = async (req, res, next) => {
  try {
    let count = 0;
    await Promise.all(
      Datas.result.map(async (item) => {
        let OfGroup = item.OfGroup;
        let ParentGroupCode = OfGroup?.GroupCode ?? '';

        let itemData = {
          name: item.Name,
          description: '',
          code: item.Code,
        };
        const itemCreated = await Position.create(itemData);
        if (itemCreated) count++;
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json({ status: count });
  } catch (error) {
    console.log(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const itemData = omit(req.body, 'id');

    const item = await Position.create(itemData)
      .then((result) => result)
      .catch((err) => next(err));

    res.status(httpStatus.CREATED);
    return res.json(item);
  } catch (error) {
    console.log(error);
  }
};

exports.update = async (req, res, next) => {
  const { id } = req.params;
  let item = await Position.findByPk(id);

  const updatedItem = omit(req.body, ['role', 'password']);
  item = Object.assign(item, updatedItem);
  item
    .save()
    .then((data) => res.json(data))
    .catch((e) => next(e));
};

exports.remove = (req, res, next) => {
  const { id } = req.params;

  Position.destroy({
    where: {
      id,
    },
  })
    .then((data) => res.json(data))
    .catch((e) => next(e));
};

exports.findAll = async (req, res, next) => {
  const { q, page, perpage } = req.query;
  const { limit, offset } = getPagination(page, perpage);
  const condition = q ? { name: { [Op.like]: `%${q}%` } } : null;
  const attributes = ['id', 'name', 'code', 'description'];

  Position.findAndCountAll({
    where: condition,
    limit,
    offset,
    attributes,
  })
    .then((data) => {
      const response = getPagingData(data, page, limit);
      res.json(response);
    })
    .catch((e) => next(e));
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
