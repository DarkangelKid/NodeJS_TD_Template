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

      fidelity: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      fidelity_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      countryName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      geo_latitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      geo_longitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      event_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      violate_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      time: {
        type: DataTypes.DATE,
        allowNull: true,
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
