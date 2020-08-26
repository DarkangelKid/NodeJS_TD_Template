const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const RolePermission = sequelize.define(
    'role_permission',
    {},
    {
      freezeTableName: true,
    },
  );

  return RolePermission;
};
