/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
const { DataTypes, Sequelize, Model } = require('sequelize');
const jwt = require('jwt-simple');
const moment = require('moment-timezone');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');
const APIError = require('../utils/APIError');

const roles = ['user', 'admin'];

module.exports = (sequelize, Sequelize) => {
  class User extends Model {
    getFullname() {
      return [this.firstName, this.lastName].join(' ');
    }

    transform() {
      const transformed = {};
      const fields = ['id', 'username', 'email', 'fullName', 'avatarUrl', 'displayName'];

      fields.forEach((field) => {
        transformed[field] = this[field];
      });

      return transformed;
    }

    publicInfoTransform() {
      const transformed = {};
      const fields = ['id', 'username', 'email', 'firstName', 'lastName', 'avatarUrl', 'officeId', 'position'];

      fields.forEach((field) => {
        transformed[field] = this[field];
      });

      return transformed;
    }

    token() {
      const playload = {
        exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
        iat: moment().unix(),
        sub: this.username,
        context: {
          user: {
            userName: this.username,
            displayName: this.displayName,
          },
        },
      };
      return jwt.encode(playload, jwtSecret);
    }

    async passwordMatches(password) {
      return bcrypt.compare(password, this.password);
    }

    static async get(id) {
      try {
        const user = await User.findByPk(id, {
          attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName'],
          include: ['office'],
        });

        if (user) {
          return user;
        }

        throw new APIError({
          message: 'User does not exist',
          status: httpStatus.NOT_FOUND,
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }

    static async findAndGenerateToken(options) {
      const { username, password, refreshObject } = options;
      if (!username) {
        throw new APIError({
          message: 'An email is required to generate a token',
        });
      }

      const user = await User.findOne({
        where: {
          username,
        },
      });

      const err = {
        status: httpStatus.BAD_REQUEST,
        isPublic: true,
      };
      if (password) {
        if (user && (await user.passwordMatches(password))) {
          return { user, accessToken: user.token() };
        }
        err.message = 'Incorrect email or password';
      } else if (refreshObject && refreshObject.username === username) {
        if (moment(refreshObject.expires).isBefore()) {
          err.message = 'Invalid refresh token.';
        } else {
          return { user, accessToken: user.token() };
        }
      } else {
        err.message = 'Incorrect email or refreshToken';
      }
      throw new APIError(err);
    }

    static async findAndGenerateTokenSSO(options) {
      const { username, password, refreshObject } = options;
      if (!username) {
        throw new APIError({
          message: 'An email is required to generate a token',
        });
      }

      const user = await User.findOne({
        where: {
          username,
        },
      });

      const err = {
        status: httpStatus.BAD_REQUEST,
        isPublic: true,
      };
      if (user) {
        return { user, accessToken: user.token() };
      }
      throw new APIError(err);
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        /* set(value) {
          const rounds = 10;
          this.setDataValue('password', bcrypt.hash(value, rounds));
        }, */
      },
      fullName: {
        type: DataTypes.STRING,
      },
      displayName: {
        type: DataTypes.STRING,
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
      phoneNumber: {
        type: DataTypes.STRING,
      },
      sex: {
        type: DataTypes.STRING,
      },
      birthday: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      address: {
        type: DataTypes.STRING(1000),
      },
    },
    {
      sequelize,
      modelName: 'user',
      freezeTableName: true,
    },
  );

  return User;
};
