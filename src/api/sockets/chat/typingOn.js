const { emitNotifyToArray } = require('../helper');

const typingOn = (io, data, clients, user) => {
  console.log(clients);
  if (data.conversationType === 'ChatGroup') {
    // lọc danh sách, bỏ id của người hiện tại
    const receivers = data.receiver.users.filter((item) => item.id !== data.info.id);
    receivers.forEach((item) => {
      if (clients[item.id]) {
        emitNotifyToArray(clients, item.id, io, 'res-typing-on', data);
      }
    });
  } else if (data.conversationType === 'User') {
    if (clients[data.receiver.id]) {
      emitNotifyToArray(clients, data.receiver.id, io, 'res-typing-on', data);
    }
  }
};
module.exports = typingOn;
