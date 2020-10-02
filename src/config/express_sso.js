const express = require('express');
var session = require('express-session');

const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const routes = require('../api/routes/v1');
const { logs } = require('./vars');
const strategies = require('./passport');
const error = require('../api/middlewares/error');
const initSockets = require('../api/sockets');

var CASAuthentication = require('../api/controllers/CASAuthentication');

/**
 * Express instance
 * @public
 */

const app = express();

app.use(
  session({
    secret: '11091991',
    resave: false,
    saveUninitialized: true,
  }),
);

// Create a new instance of CASAuthentication.
var cas = new CASAuthentication({
  cas_url: 'https://dangnhap.hanhchinhcong.net',
  service_url: 'https://chat.hanhchinhcong.net',
  return_to: 'http://localhost:3000',
});

// Unauthenticated clients will be redirected to the CAS login and then back to
// this route once authenticated.
app.get('/app', cas.bounce, function (req, res) {
  res.send('<html><body>Hello!</body></html>');
});

// Unauthenticated clients will receive a 401 Unauthorized response instead of
// the JSON data.
app.get('/api', cas.block, function (req, res) {
  res.json({ success: true });
});

app.get('/api/user', cas.block, function (req, res) {
  res.json({ cas_user: req.session[cas.session_name] });
});

// Unauthenticated clients will be redirected to the CAS login and then to the
// provided "redirectTo" query parameter once authenticated.
app.get('/authenticate', cas.bounce_redirect);

// This route will de-authenticate the client with the Express server and then
// redirect the client to the CAS logout page.
app.get('/logout', cas.logout);

// static file
app.use('/public', express.static(path.join(__dirname, '../../public')));

app.use(express.static(path.join(__dirname, '../../build')));

// Init server with socket.io and express app
const server = http.createServer(app);
const io = socketio(server, { path: '/chat/socket.io' });

// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable authentication
app.use(passport.initialize());
passport.use('jwt', strategies.jwt);

// mount api v1 routes
app.use('/v1', routes);
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});
// Init all sockets
initSockets(io);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = server;
