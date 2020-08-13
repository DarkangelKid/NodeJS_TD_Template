const sql = require('mssql');
const logger = require('./logger');
const { sqlconfig, env } = require('./vars');

sql.Promise = Promise;
sql.on('error', (err) => {
  logger.error(`SQL Server connection error: ${err}`);
  process.exit(-1);
});

exports.connect = () => {
  sql.connect(sqlconfig).then(() => console.log('SQL Server connected...'));
  return sql.on;
};
