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

db.chatGroups = require('../api/models/chatGroup.model')(sequelize, Sequelize);
db.chatGroupMessages = require('../api/models/chatGroupMessage.model')(sequelize, Sequelize);
db.comments = require('../api/models/comment.model')(sequelize, Sequelize);
db.contacts = require('../api/models/contact.model')(sequelize, Sequelize);
db.groups = require('../api/models/group.model')(sequelize, Sequelize);
db.groupPosts = require('../api/models/groupPost.model')(sequelize, Sequelize);
db.notifications = require('../api/models/notification.model')(sequelize, Sequelize);
db.offices = require('../api/models/office.model')(sequelize, Sequelize);
db.passwordResetTokens = require('../api/models/passwordResetToken.model')(sequelize, Sequelize);
db.refreshTokens = require('../api/models/refreshToken.model')(sequelize, Sequelize);
db.tutorials = require('../api/models/tutorial.model')(sequelize, Sequelize);
db.users = require('../api/models/user.model')(sequelize, Sequelize);
db.userChatGroups = require('../api/models/userChatGroup.model')(sequelize, Sequelize);
db.userMessages = require('../api/models/userMessage.model')(sequelize, Sequelize);
db.userPosts = require('../api/models/userPost.model')(sequelize, Sequelize);


module.exports = db;
