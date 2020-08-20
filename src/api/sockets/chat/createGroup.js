const { emitNotifyToArray } = require('../helper');

const createGroup = (io, data, clients, user) => {
  data.members.forEach((item) => {
    if (clients[item]) {
      emitNotifyToArray(clients, item, io, 'res-create-group', data);
    }
  });
};
module.exports = createGroup;
