const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Contact = sequelize.define(
    'contact',
    {
      userOneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userTwoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      actionUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    },
  );

  return Contact;
};
/*
Status
0	Đang chờ xử lý
1	Đã được chấp nhận
2	Từ chối
3	Bị chặn
*/
