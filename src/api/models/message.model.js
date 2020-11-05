const { DataTypes, Sequelize, Model } = require('sequelize');

// const messageTypes = ['text', 'image', 'file', 'notification'];
// const conversationTypes = ['User', 'Group'];

module.exports = (sequelize, Sequelize) => {
  class Message extends Model {}

  Message.init(
    {
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      conversationType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'message',
      freezeTableName: true,
    },
  );

  return Message;
};
