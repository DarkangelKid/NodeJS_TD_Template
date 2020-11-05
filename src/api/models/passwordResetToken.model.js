const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const PasswordRefreshToken = sequelize.define(
    'passwordRefreshToken',
    {
      resetToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
      },
      userEmail: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
    },
  );

  return PasswordRefreshToken;
};
