const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Note extends Model {}

  Note.init(
    {
      contentData: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
    },
    {
      sequelize,
      modelName: 'note',
      freezeTableName: true,
    },
  );

  return Note;
};
