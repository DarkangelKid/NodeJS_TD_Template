const httpStatus = require('http-status');
const { omit } = require('lodash');

const db = require('../../config/mssql');

const Datasync = db.datasync;

const { Op } = db.Sequelize;

exports.createCamera = async (req, res, next) => {
  try {
    const item = await Datasync.create({
      appType: 'Camera',
      data: JSON.stringify(req.body),
    });

    res.status(httpStatus.CREATED);
    return res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.createCybersecurity = async (req, res, next) => {
  try {
    const item = await Datasync.create({
      appType: 'Cybersecurity',
      data: JSON.stringify(req.body),
    });

    res.status(httpStatus.CREATED);
    return res.json(item);
  } catch (error) {
    next(error);
  }
};
