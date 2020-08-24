const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { omit } = require('lodash');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const jwt = require('jwt-simple');
const APIError = require('../utils/APIError');
const { jwtSecret, jwtExpirationInterval } = require('../../config/vars');

const db = require('../../config/mssql');

const RefreshToken = db.refreshTokens;
const User = db.users;

function generateToken(user) {
  const playload = {
    exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
    iat: moment().unix(),
    sub: user.userName,
  };
  return jwt.encode(playload, jwtSecret);
}

const createRefreshToken = async (user) => {
  const userId = user.id;
  const { userName } = user;
  const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
  const expires = moment().add(30, 'days').toDate();

  const tmp = await RefreshToken.create({
    token,
    userId,
    userName,
    expires,
  });

  return tmp;
};

const generateTokenResponse = async (user, accessToken) => {
  const tokenType = 'Bearer';
  const tmp = await createRefreshToken(user);
  const refreshToken = tmp.token;

  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
};

exports.register = async (req, res, next) => {
  try {
    const userData = omit(req.body, 'role');

    const rounds = 10;

    const hash = await bcrypt.hash(userData.password, rounds);
    userData.password = hash;

    const user = await User.create(userData)
      .then((result) => result)
      .catch((err) => next(err));

    const token = await generateTokenResponse(user, generateToken(user));

    res.status(httpStatus.CREATED);
    return res.json({ token });
  } catch (error) {
    console.log(error);
    // return next(User.checkDuplicateEmail(error));
  }
};

const passwordMatches = async (password, password2) => bcrypt.compare(password, password2);

const findAndGenerateToken = async (options) => {
  const { userName, password, refreshObject } = options;

  if (!userName) {
    throw new APIError({
      message: 'An userName is required to generate a token',
    });
  }

  const user = await User.findOne({
    where: {
      userName,
    },
  });

  const err = {
    status: httpStatus.BAD_REQUEST,
    isPublic: true,
  };

  if (password) {
    if (user && (await passwordMatches(password, user.password))) {
      return { user, accessToken: generateToken(user) };
    }

    err.message = 'Incorrect email or password';
  } else if (refreshObject && refreshObject.userName === userName) {
    if (moment(refreshObject.expires).isBefore()) {
      err.message = 'Invalid refresh token.';
    } else {
      return { user, accessToken: generateToken(user) };
    }
  } else {
    err.message = 'Incorrect email or refreshToken';
  }
  throw new APIError(err);
};

exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await findAndGenerateToken(req.body);

    const token = await generateTokenResponse(user, accessToken);

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { userName, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOne({
      where: {
        userName,
        token: refreshToken,
      },
    });
    const { user, accessToken } = await findAndGenerateToken({ userName, refreshObject });
    const response = await generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
