const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { omit } = require('lodash');
const bcrypt = require('bcryptjs');
const { jwtExpirationInterval } = require('../../config/vars');
const jwt = require('jwt-simple');

const db = require('../../config/mssql');

const RefreshToken = db.refreshTokens;
const User = db.users;

const generateTokenResponse = async (user, accessToken) => {
  const tokenType = 'Bearer';
  const tmp = await RefreshToken.generate(user);
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

    const token = await generateTokenResponse(user, user.token());

    res.status(httpStatus.CREATED);
    return res.json({ token, user: user.transform() });
  } catch (error) {
    console.log(error);
    // return next(User.checkDuplicateEmail(error));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);

    const token = await generateTokenResponse(user, accessToken);
    const user_ = await User.get(user.id);

    return res.json({ token, user: user.transform() });
  } catch (error) {
    return next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { username, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOne({
      where: {
        username,
        token: refreshToken,
      },
    });
    const { user, accessToken } = await User.findAndGenerateToken({ username, refreshObject });

    const response = await generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
