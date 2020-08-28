const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    'notification',
    {
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false
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
