const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { jwtSecret } = require('./vars');
// const User = require('../api/models/user.model');
const db = require('./mssql');

const User = db.users;

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  ignoreExpiration: true,
};

const jwt = async (payload, done) => {
  try {
    /* const user = await User.findOne({
      where: {
        userName: payload.sub,
      },
    }); */

    const user = await User.findOne({
      where: {
        userName: payload.context.user.userName,
      },
    });

    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

exports.jwt = new JwtStrategy(jwtOptions, jwt);
