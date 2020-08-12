// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const server = require('./config/express');
const mongoose = require('./config/mongoose');

const mssql = require('./config/mssql');

// open mongoose connection
mongoose.connect();

mssql.connect();

// listen to requests
server.listen(port, () => logger.info(`server started on port ${port} (${env})`));

/**
 * Exports express
 * @public
 */
module.exports = server;
