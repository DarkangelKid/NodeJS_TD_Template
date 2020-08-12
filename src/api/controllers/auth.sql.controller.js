const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { omit } = require('lodash');
const sql = require('mssql');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { jwtExpirationInterval } = require('../../config/vars');

function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

exports.register = async (req, res, next) => {
  try {
    const userData = omit(req.body, 'role');
    console.log(userData);

    const value = 1;
    const request = new sql.Request();

    /*  const result1 = await request
      .input('input_parameter', sql.Int, value)
      .query('select [name], [id] from sanpham where id = @input_parameter'); */

    /*  const result1 = await request.query(`select [name], [id] from sanpham where id = ${value}`);
    console.log(result1.recordset); */

    /* Object.keys(params).forEach((key) => {
      req.input(key, params[key]);
    });

    return req
      .query(query)
      .then((result) => {
        return result.recordset;
      })
      .catch((err) => {
        console.log(err);
        return null;
      }); */

    const tmp = `if not exists (select * from sysobjects where name='eventss' and xtype='U')
    create table eventss (
       id int IDENTITY(1, 1) PRIMARY KEY CLUSTERED NOT NULL, userId nvarchar(50) NOT NULL, title nvarchar(200) NOT NULL, description nvarchar(1000) NULL, startDate date NOT NULL, startTime time(0) NULL, endDate date NULL, endTime time(0) NULL, INDEX idx_events_userId ( userId )
    )`;

    const result1 = await request.query(tmp);
    console.log(result1);

    return res.json({ data: userData });

    /* const userData = omit(req.body, 'role');
    const user = await new User(userData).save();
    const userTransformed = user.transform();
    const token = generateTokenResponse(user, user.token());
    res.status(httpStatus.CREATED);
    return res.json({ token, user: userTransformed }); */
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);

    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
