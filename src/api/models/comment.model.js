module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define(
    'comment',
    {
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      published: {
        type: Sequelize.BOOLEAN,
      },
    },
    {
      freezeTableName: true,
    },
  );

  return Comment;
};
