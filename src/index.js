// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const server = require('./config/express');
const db = require('./config/mssql');

db.sequelize.sync();

//db.sequelize.sync({ force: true });

// listen to requests
server.listen(port, () => logger.info(`server started on port ${port} (${env})`));

/**
 * Exports express
 * @public
 */
module.exports = server;
