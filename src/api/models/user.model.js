const { DataTypes, Sequelize } = require('sequelize');
const jwt = require('jwt-simple');
const moment = require('moment-timezone');
const bcrypt = require('bcryptjs');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    'user',
    {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        /* set(value) {
          const rounds = 10;
          this.setDataValue('password', bcrypt.hash(value, rounds));
        }, */
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      avatarUrl: {
        type: DataTypes.STRING,
      },
      position: {
        type: DataTypes.STRING,
      },
      officeId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      freezeTableName: true,
    },
  );

  return User;
};
