const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class User_ChatGroup extends Model {}

  User_ChatGroup.init(
    {
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'user_chatGroup',
      freezeTableName: true,
    },
  );

  return User_ChatGroup;
};
