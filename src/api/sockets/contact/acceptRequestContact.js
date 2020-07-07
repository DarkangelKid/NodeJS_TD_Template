const { emitNotifyToArray } = require("../helper");
/**
 * @param {*} io from socket.io library
 */

let acceptRequestContact = (io, data, clients, user) => {
  let notif = {
    message: `${user.fullname} đã đồng ý kết bạn`,
    picture: user.picture,
    firstname: user.firstname,
    lastname: user.lastname,
    fullname: user.fullname,
  };

  console.log('DONG Y KET BAN')

  // emit notifications
  if (clients[data.id]) {
    emitNotifyToArray(
      clients,
      data.id,
      io,
      "res-accept-request-contact",
      notif
    );
  }
};

module.exports = acceptRequestContact;
