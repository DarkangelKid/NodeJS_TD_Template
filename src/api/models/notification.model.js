const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define(
    'notification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      receiverId: {
        type: DataTypes.INTEGER,
      },
      content: {
        type: DataTypes.STRING
      },
    },
    {
      freezeTableName: true,
    },
  );

  return Notification;
};
