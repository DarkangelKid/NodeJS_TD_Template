const httpStatus = require('http-status');
const { omit } = require('lodash');

const db = require('../../config/mssql');

const Permission = db.permissions;
const Role = db.roles;
const RolePermission = db.role_permission;

const { Op } = db.Sequelize;

exports.createCamera = async (req, res, next) => {
  try {
    res.status(httpStatus.CREATED);
    return res.json({ status: true });
  } catch (error) {
    next(error);
  }
};

exports.createCybersecurity = async (req, res, next) => {
  try {
    res.status(httpStatus.CREATED);
    return res.json({ status: true });
  } catch (error) {
    next(error);
  }
};
