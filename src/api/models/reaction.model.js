const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Reaction extends Model {}

  Reaction.init(
    {
      type: {
        type: DataTypes.STRING,
        defaultValue: 'like',
      },
    },
    {
      sequelize,
      modelName: 'reaction',
      freezeTableName: true,
    },
  );

  return Reaction;
};
