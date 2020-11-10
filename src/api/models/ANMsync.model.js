const { DataTypes, Sequelize, Model } = require('sequelize');
const httpStatus = require('http-status');
const { MAX } = require('mssql');
const APIError = require('../utils/APIError');

module.exports = (sequelize, Sequelize) => {
  class ANMsync extends Model {}

  ANMsync.init(
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
      srcip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      srcip_geo_countryCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      srcip_geo_countryName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      srcip_geo_city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      srcip_geo_latitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      srcip_geo_longitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      dstip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dstip_geo_countryCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dstip_geo_countryName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dstip_geo_city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dstip_geo_latitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dstip_geo_longitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      timestamp: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      alert_time: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      timestamp_utc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      event_category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      event_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      event_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ANMsync',
      freezeTableName: true,
    },
  );

  return ANMsync;
};
