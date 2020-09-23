const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Post extends Model {}

  Post.init(
    {
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contentType: {
        type: DataTypes.STRING,
        defaultValue: 'text',
      },
      commentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      reactionCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      shareCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'post',
      freezeTableName: true,
    },
  );

  return Post;
};
