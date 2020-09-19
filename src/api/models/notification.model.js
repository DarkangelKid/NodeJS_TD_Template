const { DataTypes, Sequelize, Model } = require('sequelize');
const httpStatus = require('http-status');
const { MAX } = require('mssql');
const APIError = require('../utils/APIError');

module.exports = (sequelize, Sequelize) => {
  class Notification extends Model {
    static async get(id) {
      try {
        const item = await Notification.findByPk(id);

        if (item) {
          return item;
        }

        throw new APIError({
          message: 'Notification does not exist',
          status: httpStatus.NOT_FOUND,
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }

    static async getbyUsername(username) {
      try {
        const item = await Notification.findAll({
          where: {
            username,
          },
        });

        if (item) {
          return item;
        }

        throw new APIError({
          message: 'Notification does not exist',
          status: httpStatus.NOT_FOUND,
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }

  Notification.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      appType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data: {
        type: DataTypes.STRING(MAX),
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'notification',
      freezeTableName: true,
    },
  );

  return Notification;
};
