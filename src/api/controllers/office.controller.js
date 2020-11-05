const httpStatus = require('http-status');
const { omit } = require('lodash');

const db = require('../../config/mssql');

const DataDonVi = require('../data/DonVi_NamDinh.json');

const Office = db.offices;

const { Op } = db.Sequelize;

exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attributes = ['id', 'name', 'code', 'description', 'parentId'];

    Office.findOne({
      where: { id },
      attributes,
    })
      .then((results) => res.json(results))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.ImportOffice = async (req, res, next) => {
  try {
    let count = 0;
    await Promise.all(
      DataDonVi.data.map(async (item) => {
        let OfGroup = item.OfGroup;
        let ParentGroupCode = OfGroup?.GroupCode ?? '';

        let itemData = {
          name: item.GroupName,
          description: '',
          code: item.GroupCode.replace(/-/g, '.'),
          parentCode: ParentGroupCode.replace(/-/g, '.'),
        };

        try {
          const itemOffice = await Office.create(itemData);
          if (itemOffice) count++;
        } catch (error__) {
          console.log('LOI');
          console.log(error__);
        }
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json({ status: count });
  } catch (error) {
    console.log(error);
  }
};

exports.AddParentId = async (req, res, next) => {
  try {
    let count = 0;
    let arr = await Office.findAll();
    await Promise.all(
      arr.map(async (item) => {
        let parentCode = item.parentCode;
        if (parentCode.length > 1) {
          let parentOffice = await Office.findOne({ where: { code: parentCode } });
          if (parentOffice) {
            item.parentId = parentOffice.id;

            try {
              await item.save();
              count++;
            } catch (error__) {
              console.log('LOI');
              console.log(error__);
            }
          }
        }
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

    const item = await Office.create(itemData)
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
  let item = await Office.findByPk(id);

  const updatedItem = omit(req.body, ['role', 'password']);
  item = Object.assign(item, updatedItem);
  item
    .save()
    .then((data) => res.json(data))
    .catch((e) => next(e));
};

exports.remove = (req, res, next) => {
  const { id } = req.params;

  Office.destroy({
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
  const attributes = ['id', 'name', 'code', 'description', 'parentId'];

  Office.findAndCountAll({
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
