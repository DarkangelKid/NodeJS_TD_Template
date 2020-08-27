const httpStatus = require('http-status');
const { omit } = require('lodash');

const db = require('../../config/mssql');

const Permission = db.permissions;
const Role = db.roles;
const RolePermission = db.role_permission;

const { Op } = db.Sequelize;

exports.findOne = async (req, res, next) => {
  const { id } = req.params;
  const attributes = ['id', 'name', 'code', 'description'];

  Role.findOne({
    where: { id },
    attributes,
    include: [
      {
        model: Permission,
        as: 'permissions',
        attributes: ['id', 'name', 'code', 'description'],
        through: {
          attributes: ['permissionId', 'roleId'],
        },
      },
    ],
  })
    .then((results) => res.json(results))
    .catch((e) => next(e));
};

exports.create = async (req, res, next) => {
  try {
    const { role, grantedPermissionCodes } = req.body;
    const itemData = omit(role, 'id');

    const item = await Role.create(itemData);

    await RolePermission.destroy({
      where: {
        roleId: item.id,
      },
    });

    await Promise.all(
      grantedPermissionCodes.map(async (i) => {
        const permissionItem = await Permission.findOne({ where: { code: i } });

        if (permissionItem) await item.addPermission(permissionItem);
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    let item = await Role.findByPk(id);

    if (item) {
      const { role, grantedPermissionCodes } = req.body;
      const itemData = omit(role, 'id');

      item = Object.assign(item, itemData);

      const itemnew = await item.save();

      await RolePermission.destroy({
        where: {
          roleId: itemnew.id,
        },
      });

      await Promise.all(
        grantedPermissionCodes.map(async (i) => {
          const permissionItem = await Permission.findOne({ where: { code: i } });

          if (permissionItem) await itemnew.addPermission(permissionItem);
        }),
      );

      res.json(item);
    } else {
      res.json(item);
    }
  } catch (error) {
    next(error);
  }
};

exports.remove = (req, res, next) => {
  try {
    const { id } = req.params;

    Role.destroy({
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
  const { q, page, perpage } = req.query;
  const { limit, offset } = getPagination(page, perpage);
  const condition = q ? { name: { [Op.like]: `%${q}%` } } : null;
  const attributes = ['id', 'name', 'code', 'description'];

  Role.findAndCountAll({
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
