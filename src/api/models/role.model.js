const { DataTypes, Sequelize, Model } = require('sequelize');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

module.exports = (sequelize, Sequelize) => {
  class Role extends Model {
    static async get(id) {
      try {
        const item = await Role.findByPk(id);

        if (item) {
          return item;
        }

        throw new APIError({
          message: 'Role does not exist',
          status: httpStatus.NOT_FOUND,
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }

  Role.init(
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
      code: { type: DataTypes.STRING, allowNull: false },
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'role',
      freezeTableName: true,
    },
  );

  

  return Role;
};
