const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class User_Group extends Model {}

  //inspector nguoi kiem duyet
  //member
  //..admin

  User_Group.init(
    {
      type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'member',
      },
    },
    {
      sequelize,
      modelName: 'user_group',
      freezeTableName: true,
    },
  );

  return User_Group;
};
