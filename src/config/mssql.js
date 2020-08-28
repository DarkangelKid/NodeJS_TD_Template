const Sequelize = require('sequelize');
const { sqlconfig } = require('./vars');
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

db.sequelize = sequelize;

db.chatGroups = require('../api/models/chatGroup.model')(sequelize);
db.chatGroupMessages = require('../api/models/chatGroupMessage.model')(sequelize);
db.comments = require('../api/models/comment.model')(sequelize);
db.contacts = require('../api/models/contact.model')(sequelize);
db.groups = require('../api/models/group.model')(sequelize);
db.groupPosts = require('../api/models/groupPost.model')(sequelize);
db.notifications = require('../api/models/notification.model')(sequelize);
db.offices = require('../api/models/office.model')(sequelize);
db.passwordResetTokens = require('../api/models/passwordResetToken.model')(sequelize);
db.refreshTokens = require('../api/models/refreshToken.model')(sequelize);
db.tutorials = require('../api/models/tutorial.model')(sequelize);
db.users = require('../api/models/user.model')(sequelize);
db.userChatGroups = require('../api/models/userChatGroup.model')(sequelize);
db.userMessages = require('../api/models/userMessage.model')(sequelize);
db.userPosts = require('../api/models/userPost.model')(sequelize);

module.exports = db;
