const sql = require('mssql');
const Sequelize = require('sequelize');
const { sqlconfig, env } = require('./vars');
const logger = require('./logger');

const sequelize = new Sequelize(sqlconfig.database, sqlconfig.user, sqlconfig.password, {
  host: sqlconfig.server,
  port: sqlconfig.port,
  dialect: 'mssql',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.chatGroup = require('../api/models/chatGroup.model')(sequelize, Sequelize);
db.chatGroupMessage = require('../api/models/chatGroupMessage.model')(sequelize, Sequelize);
db.comments = require('../api/models/comment.model')(sequelize, Sequelize);
db.contact = require('../api/models/contact.model')(sequelize, Sequelize);
db.group = require('../api/models/group.model')(sequelize, Sequelize);
db.groupPost = require('../api/models/groupPost.model')(sequelize, Sequelize);
db.notification = require('../api/models/notification.model')(sequelize, Sequelize);
db.office = require('../api/models/office.model')(sequelize, Sequelize);
db.passwordResetToken = require('../api/models/passwordResetToken.model')(sequelize, Sequelize);
db.refreshToken = require('../api/models/refreshToken.model')(sequelize, Sequelize);
db.tutorial = require('../api/models/tutorial.model')(sequelize, Sequelize);
db.user = require('../api/models/user.model')(sequelize, Sequelize);
db.userChatGroup = require('../api/models/userChatGroup.model')(sequelize, Sequelize);
db.userMessage = require('../api/models/userMessage.model')(sequelize, Sequelize);
db.userPost = require('../api/models/userPost.model')(sequelize, Sequelize);


module.exports = db;
