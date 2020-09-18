const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { omit } = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const axios = require('axios');
const convert = require('xml-js');
const { jwtExpirationInterval } = require('../../config/vars');

const parseXML = require('xml2js').parseString;
const XMLprocessors = require('xml2js/lib/processors');

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

exports.loginsso = async (req, res, next) => {
  try {
    const { ticket } = req.query;

    const str = `https://dangnhap.namdinh.gov.vn/p3/serviceValidate?ticket=${ticket}&service=https://chat.namdinh.gov.vn/v1/auth/login`;
    // console.log(str);
    // return res.redirect(str);
    /*  const dataUser = await axios.get(str)
      .then((response) => {
        const jsonData = JSON.parse(convert.xml2json(response.data, { compact: true, spaces: 2 }));
        console.log(jsonData);
        return jsonData;
        // return res.send(jsonData);
      })
      .catch((error) => {
        console.log('error');
        console.log(error);
        return null;
      })
      .then(() => null);
 */
    let dataUser = null;
    const result_ = await axios.get(str);

    parseXML(result_.data, {
      trim: true,
      normalize: true,
      explicitArray: false,
      tagNameProcessors: [XMLprocessors.normalize, XMLprocessors.stripPrefix],
    }, (err, result) => {
      if (err) {
        return ('Response from CAS server was bad.');
      }
      try {
        const failure = result.serviceresponse.authenticationfailure;
        if (failure) {
          return (`CAS authentication failed (${failure.$.code}).`);
        }
        const success = result.serviceresponse.authenticationsuccess;
        if (success) {
          dataUser = (success.user);
          // console.log(success.attributes);
        }

        return ('CAS authentication failed.');
      } catch (er) {
        return ('CAS authentication failed.');
      }
    });

    if (dataUser) {
      const { user, accessToken } = await User.findAndGenerateTokenSSO({ username: dataUser });

      const token = await generateTokenResponse(user, accessToken);
      const user_ = await User.get(user.id);

      return res.redirect(`https://chat.namdinh.gov.vn/loginwithtoken&token=${token.accessToken}`);

      // return res.json({ token, user: user.transform() });
    }

    return res.redirect('https://chat.namdinh.gov.vn');
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
