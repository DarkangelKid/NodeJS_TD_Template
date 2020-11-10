const { DataTypes, Sequelize, Model } = require('sequelize');
const httpStatus = require('http-status');
const { MAX } = require('mssql');
const APIError = require('../utils/APIError');

module.exports = (sequelize, Sequelize) => {
  class CAMERAsync extends Model {}

  CAMERAsync.init(
    {
      appType: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      data: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      violate_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      camera_location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      camera_location_latitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      camera_location_longitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      time_txt: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      time: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'CAMERAsync',
      freezeTableName: true,
    },
  );

  return CAMERAsync;
};
