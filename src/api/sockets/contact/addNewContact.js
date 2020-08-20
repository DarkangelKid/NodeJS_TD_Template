const { emitNotifyToArray } = require('../helper');
/**
 * @param {*} io from socket.io library
 */

const addNewContact = (io, data, clients, user) => {
  const notif = {
    message: `${user.fullname} muốn thêm bạn làm bạn bè`,
    picture: user.picture,
    firstname: user.firstname,
    lastname: user.lastname,
    fullname: user.fullname,
    id: user.id,
  };
  console.log(notif);
  // emit notifications
  if (clients[data.contactId]) {
    emitNotifyToArray(
      clients,
      data.contactId,
      io,
      'res-add-new-contact',
      notif,
    );
  }
};

module.exports = addNewContact;
