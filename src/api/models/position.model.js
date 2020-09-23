const { DataTypes, Sequelize, Model } = require('sequelize');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

module.exports = (sequelize, Sequelize) => {
  class Position extends Model {
    transform() {
      const transformed = {};
      const fields = ['id', 'name', 'code', 'description'];

      fields.forEach((field) => {
        transformed[field] = this[field];
      });

      return transformed;
    }

    static async get(id) {
      try {
        const item = await Position.findByPk(id);

        if (item) {
          return item;
        }

        throw new APIError({
          message: 'Position does not exist',
          status: httpStatus.NOT_FOUND,
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }

  Position.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
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
      modelName: 'position',
      freezeTableName: true,
    },
  );

  return Position;
};
