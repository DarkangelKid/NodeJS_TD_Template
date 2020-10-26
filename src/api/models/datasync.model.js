const { DataTypes, Sequelize, Model } = require('sequelize');
const httpStatus = require('http-status');
const { MAX } = require('mssql');
const APIError = require('../utils/APIError');

module.exports = (sequelize, Sequelize) => {
  class Datasync extends Model {}

  Datasync.init(
    {
      appType: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      data: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'datasync',
      freezeTableName: true,
    },
  );

  return Datasync;
};
