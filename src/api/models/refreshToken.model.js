const { DataTypes, Sequelize, Model } = require('sequelize');
const crypto = require('crypto');
const moment = require('moment-timezone');

module.exports = (sequelize, Sequelize) => {
  class RefreshToken extends Model {
    static async generate(user) {
      const userId = user.id;
      const { username } = user;
      const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
      const expires = moment().add(30, 'days').toDate();

      const tmp = await RefreshToken.create({
        token,
        userId,
        username,
        expires,
      });

      return tmp;
    }
  }
  RefreshToken.init(
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
      },
      expires: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'refreshToken',
      freezeTableName: true,
    },
  );

  return RefreshToken;
};
