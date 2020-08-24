const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Office = sequelize.define(
    'office',
    {
      parentId: {
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
    },
  );

  return Office;
};
