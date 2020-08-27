const { DataTypes, Sequelize, Model } = require('sequelize');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

module.exports = (sequelize, Sequelize) => {
  class Office extends Model {
    static async get(id) {
      try {
        const item = await Office.findByPk(id);

        if (item) {
          return item;
        }

        throw new APIError({
          message: 'Office does not exist',
          status: httpStatus.NOT_FOUND,
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }

  Office.init(
    {
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: { type: DataTypes.STRING, allowNull: false },
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'office',
      freezeTableName: true,
    },
  );

  return Office;
};