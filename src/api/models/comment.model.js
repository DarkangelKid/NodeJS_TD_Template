const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Comment extends Model {}

  Comment.init(
    {
      contentData: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      contentType: {
        type: DataTypes.STRING,
        defaultValue: 'text',
      },
    },
    {
      sequelize,
      modelName: 'comment',
      freezeTableName: true,
    },
  );

  return Comment;
};
