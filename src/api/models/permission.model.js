const { DataTypes, Sequelize, Model } = require('sequelize');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

module.exports = (sequelize, Sequelize) => {
  class Permission extends Model {
    static async get(id) {
      try {
        const item = await Permission.findByPk(id);

        if (item) {
          return item;
        }

        throw new APIError({
          message: 'Permision does not exist',
          status: httpStatus.NOT_FOUND,
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }

  Permission.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      code: { type: DataTypes.STRING, allowNull: false, unique: true },
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'permission',
      freezeTableName: true,
    },
  );

  return Permission;
};
