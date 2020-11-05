const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const UserPost = sequelize.define(
    'userPost',
    {
      content: {
        type: DataTypes.STRING,
      },
      attachments: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    },
  );

  return UserPost;
};
