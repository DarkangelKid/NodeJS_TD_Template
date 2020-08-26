const Sequelize = require('sequelize');
const { sqlconfig, env } = require('./vars');

const sequelize = new Sequelize(sqlconfig.database, sqlconfig.user, sqlconfig.password, {
  host: sqlconfig.server,
  port: sqlconfig.port,
  dialect: 'mssql',

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

db.users = require('../api/models/user.model')(sequelize, Sequelize);
db.positions = require('../api/models/position.model')(sequelize, Sequelize);
db.offices = require('../api/models/office.model')(sequelize, Sequelize);
db.passwordResetTokens = require('../api/models/passwordResetToken.model')(sequelize, Sequelize);
db.refreshTokens = require('../api/models/refreshToken.model')(sequelize, Sequelize);

db.roles = require('../api/models/role.model')(sequelize, Sequelize);
db.permissions = require('../api/models/permission.model')(sequelize, Sequelize);
db.role_permission = require('../api/models/role_permission.model')(sequelize, Sequelize);

const User = db.users;
const Position = db.positions;
const Office = db.offices;
const Role = db.roles;
const Permission = db.permissions;

Position.hasMany(User, { as: 'users' });
User.belongsTo(Position, {
  foreignKey: 'positionId',
  as: 'position',
});

Office.hasMany(User, { as: 'users' });
User.belongsTo(Office, {
  foreignKey: 'officeId',
  as: 'office',
});

Permission.belongsToMany(Role, {
  through: 'role_permission',
  as: 'roles',
  foreignKey: 'permissionId',
});

Role.belongsToMany(Permission, {
  through: 'role_permission',
  as: 'permissions',
  foreignKey: 'roleId',
});

module.exports = db;
