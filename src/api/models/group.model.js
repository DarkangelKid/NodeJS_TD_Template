const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Group extends Model {}

  Group.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'group',
      freezeTableName: true,
    },
  );

  return Group;
};
