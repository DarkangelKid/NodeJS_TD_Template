/* eslint-disable camelcase */
/* eslint-disable consistent-return */
const httpStatus = require('http-status');
const { omit } = require('lodash');
const multer = require('multer');

const _ = require('lodash');
const APIError = require('../utils/APIError');
const db = require('../../config/mssql');

const storageAvatar = require('../utils/storageAvatar');

const User = db.users;
const ChatGroup = db.chatGroups;
const User_ChatGroup = db.user_chatGroup;
const Message = db.message;

const avatarUploadFile = multer(storageAvatar).single('avatar');

const { Op } = db.Sequelize;

exports.createMessage = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { type, message, conversationType } = req.body;

    // Nếu tin nhắn group thì conversation id = group id
    let conversationId = null;
    if (conversationType === 'ChatGroup') {
      // check group có tồn tại không?
      const group = await ChatGroup.findOne({ where: { id: req.body.receiver } });

      // check user hiện tại có phải là member hay không?
      // if (group && group.members.includes(req.user.id)) conversationId = req.body.receiver;
      if (group) conversationId = req.body.receiver;
    } else if (conversationType === 'User') {
      // check người dùng tồn tại hay không
      const user = await User.findOne({ where: { id: req.body.receiver } });
      if (user) conversationId = req.body.receiver;
    }

    if (!conversationId) {
      throw new APIError({
        message: 'Something went wrong',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const dataItem = { type, message, conversationType };

    const messageCreated = await Message.create(dataItem);

    const user = await User.findByPk(currentUser.id);
    messageCreated.senderId = user.id;

    // console.log(user);

    // await messageCreated.createSender(user);

    if (conversationType === 'ChatGroup') {
      const group = await ChatGroup.findOne({ where: { id: req.body.receiver } });
      messageCreated.chatGroupId = group.id;

      // await messageCreated.createChatGroup(group);
    } else if (conversationType === 'User') {
      // check người dùng tồn tại hay không
      const user_ = await User.findOne({ where: { id: req.body.receiver } });
      // await messageCreated.createReceiver(user_);
      messageCreated.receiverId = user_.id;
    }

    await messageCreated.save();

    return res.json(messageCreated);
  } catch (error) {
    next(error);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { id, conversationType } = req.query;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              { conversationType },
              {
                [Op.or]: [
                  { [Op.and]: [{ senderId: currentUser.id }, { receiverId: id }] },
                  { [Op.and]: [{ senderId: id }, { receiverId: currentUser.id }] },
                ],
              },
            ],
          },
          {
            [Op.and]: [{ conversationType }, { chatGroupId: id }],
          },
        ],
      },
      order: [['updatedAt', 'DESC']],

      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        },
        {
          model: ChatGroup,
          as: 'chatGroup',
          include: {
            model: User,
            as: 'users',
            attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
          },
        },
      ],
    });

    return res.json(messages);
  } catch (error) {
    next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const mess_tmp = await Message.findAll({
      where: {
        [Op.and]: [{ conversationType: 'User' }, { [Op.or]: [{ senderId: currentUser.id }, { receiverId: currentUser.id }] }],
      },
      order: [['updatedAt', 'DESC']],

      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        },
      ],
    });

    const mess = _.groupBy(mess_tmp, (sub) => {
      let key = `${sub.senderId}_${sub.receiverId}`;
      if (sub.senderId > sub.receiverId) key = `${sub.receiverId}_${sub.senderId}`;
      return key;
    });

    console.log(mess);

    let personalMessages = [];

    _.mapKeys(mess, (value, key) => personalMessages.push(value[0]));

    const chatGroups = await ChatGroup.findAll({
      include: {
        model: User,
        as: 'users',
        attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        required: true,
        where: {
          id: currentUser.id,
        },
      },
    });

    const groupMessages = [];
    await Promise.all(
      chatGroups.map(async (i) => {
        const item = await Message.findAll({
          where: { chatGroupId: i.id },
          limit: 1,
          order: [['updatedAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
            },
            {
              model: ChatGroup,
              as: 'chatGroup',
              include: {
                model: User,
                as: 'users',
                attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
              },
            },
          ],
        });
        console.log(item);
        groupMessages.push(item[0]);
      }),
    );

    const messages = personalMessages.concat(groupMessages);
    return res.json(messages);
  } catch (error) {
    next(error);
  }
};

exports.getThongTin = async (req, res, next) => {
  try {
    const { id } = req.params;

    ChatGroup.findOne({
      where: { id },
      attributes: ['id', 'name', 'avatarUrl', 'description'],
      include: {
        model: User,
        as: 'users',
        attributes: ['id', 'username', 'email', 'fullName'],
      },
    })
      .then((results) => res.json(results))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { name, description, users } = req.body;

    const dataItem = { name, description };

    const chatGroup = await ChatGroup.create(dataItem);

    const user = await User.findByPk(currentUser.id);
    chatGroup.addUser(user, { through: { type: 1 } });

    await Promise.all(
      users.map(async (i) => {
        if (i !== currentUser.id) {
          try {
            const user_ = await User.findByPk(i);
            chatGroup.addUser(user_, { through: { type: 0 } });
          } catch (error_) {
            console.log(error_);
          }
        }
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json(chatGroup);
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { users, id } = req.body;

    const item_tmp = await User_ChatGroup.findOne({
      where: {
        userId: currentUser.id,
        chatGroupId: id,
      },
    });

    if (item_tmp.type !== 1) {
      throw new APIError({
        message: 'Không có quyền.',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const chatGroup = await ChatGroup.findByPk(id);

    await Promise.all(
      users.map(async (i) => {
        if (i !== currentUser.id) {
          try {
            const user_ = await User.findByPk(i);
            chatGroup.addUser(user_, { through: { type: 0 } });
          } catch (error_) {
            console.log(error_);
          }
        }
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json(chatGroup);
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { users, id } = req.body;

    const item_tmp = await User_ChatGroup.findOne({
      where: {
        userId: currentUser.id,
        chatGroupId: id,
      },
    });

    if (item_tmp.type !== 1) {
      throw new APIError({
        message: 'Không có quyền.',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const chatGroup = await ChatGroup.findByPk(id);

    await Promise.all(
      users.map(async (i) => {
        try {
          await User_ChatGroup.destroy({
            where: {
              userId: i,
              chatGroupId: id,
            },
          });
        } catch (error_) {
          console.log(error_);
        }
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json(chatGroup);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { id } = req.params;

    const item_tmp = await User_ChatGroup.findOne({
      where: {
        userId: currentUser.id,
        chatGroupId: id,
      },
    });

    if (item_tmp.type !== 1) {
      throw new APIError({
        message: 'Không có quyền sửa.',
        status: httpStatus.BAD_REQUEST,
      });
    }

    let item = await ChatGroup.findByPk(id);
    const updatedItem = omit(req.body, ['id']);

    item = Object.assign(item, updatedItem);
    item
      .save()
      .then((data) => res.json(data))
      .catch((e) => next(e));
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  const currentUser = req.user;
  const { id } = req.params;

  const item_tmp = await User_ChatGroup.findOne({
    where: {
      userId: currentUser.id,
      chatGroupId: id,
    },
  });

  if (item_tmp.type !== 1) {
    throw new APIError({
      message: 'Không có quyền.',
      status: httpStatus.BAD_REQUEST,
    });
  }

  ChatGroup.destroy({
    where: {
      id,
    },
  })
    .then((data) => res.json(data))
    .catch((e) => next(e));
};

exports.danhsachnhomchat = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { page, perpage } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    const chatGroups = await ChatGroup.findAndCountAll({
      /* where: {
        [Op.and]: [{ status: 1 }, { [Op.or]: [{ userOneId: currentUser.id }, { userTwoId: currentUser.id }] }],
      }, */
      include: {
        model: User,
        as: 'users',
        attributes: ['id', 'username'],
        required: true,
        where: {
          id: currentUser.id,
        },
      },
      limit,
      offset,
    });

    const dataUsers = [];
    await Promise.all(
      chatGroups.rows.map(async (i) => {
        let user = await ChatGroup.findByPk(i.id, {
          attributes: ['id', 'name', 'avatarUrl', 'description'],
          include: {
            model: User,
            as: 'users',
            attributes: ['id', 'username', 'email', 'fullName'],
          },
        });
        user = user.toJSON();
        dataUsers.push(user);
      }),
    );

    const response = getPagingData(Object.assign(chatGroups, { rows: dataUsers }), page, limit);

    return res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.updateAvatar = (req, res, next) => {
  avatarUploadFile(req, res, async (err) => {
    try {
      if (!req.file) {
        throw new APIError({
          message: 'Please select a file.',
          status: httpStatus.BAD_REQUEST,
        });
      }
      const { id } = req.params;
      let item = await ChatGroup.findByPk(id);
      item = Object.assign(item, { avatarUrl: req.file.filename });

      await item.save();

      // update user
      // let chatGroupUpdate = await ChatGroup.findOneAndUpdate({ _id: req.params.chatGroupId }, { picture: req.file.filename });
      // Delete old user picture
      /*  if (chatGroupUpdate.picture) {
        await fsExtra.remove(`${avatarDirectory}/${chatGroupUpdate.picture}`); // return old item after updated
      } */

      const result = {
        message: 'success',
        picture: `${req.file.filename}`,
      };
      return res.send(result);
    } catch (error) {
      next(error);
    }
  });
};

const getPagination = (page, perpage) => {
  const limit = perpage ? +perpage : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: listItems } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    meta: {
      total: totalItems,
      pages: totalPages,
      page: currentPage,
      perpage: limit,
    },
    data: listItems,
  };
};
