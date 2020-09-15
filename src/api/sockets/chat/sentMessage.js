const { emitNotifyToArray } = require('../helper');
const db = require('../../../config/mssql');

const User = db.users;
const ChatGroup = db.chatGroups;

const sentMessage = async (io, data, clients, user) => {
  if (data.conversationType === 'ChatGroup') {
    /* data.receiver.members.forEach((item) => {
      if (clients[item]) {
        emitNotifyToArray(clients, item, io, 'res-sent-message', data);
      }
    }); */

    const receiverInfo = await ChatGroup.findOne({
      where: { id: data.chatGroupId },
      attributes: ['id', 'name', 'avatarUrl', 'description'],
      include: {
        model: User,
        as: 'users',
        attributes: ['id', 'username', 'email', 'fullName'],
      },
    });

    receiverInfo.users.map((item) => {
      if (clients[item.id]) {
        emitNotifyToArray(clients, item.id, io, 'res-sent-message', data);
      }
    });
  } else if (data.conversationType === 'User') {
    if (clients[data.receiverId]) {
      emitNotifyToArray(clients, data.receiverId, io, 'res-sent-message', data);
    }
    if (clients[data.senderId]) {
      emitNotifyToArray(clients, data.senderId, io, 'res-sent-message', data);
    }
  }
};
module.exports = sentMessage;
