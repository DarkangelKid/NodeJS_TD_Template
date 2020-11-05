/* eslint-disable camelcase */
/* eslint-disable consistent-return */
const httpStatus = require('http-status');
const { omit } = require('lodash');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const APIError = require('../utils/APIError');
const db = require('../../config/mssql');
const { staticUrl } = require('../../config/vars');

const storageAvatar = require('../utils/storageAvatar');
const storagePhoto = require('../utils/storagePhoto');
const storageFile = require('../utils/storageFile');
const nofitiController = require('./notification.controller');

const User = db.users;
const ChatGroup = db.chatGroups;
const User_ChatGroup = db.user_chatGroup;
const Message = db.message;
const Attachment = db.attachment;

const avatarUploadFile = multer(storageAvatar).single('avatar');

const { Op } = db.Sequelize;

exports.createMessage = async (req, res, next) => {
  try {
    const currentUser = req.user;

    let { type, message, conversationType, files } = req.body;

    if (!type) type = 'text';

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

    if (type === 'text') {
    } else if (type === 'file') {
      await Promise.all(
        files.map(async (i) => {
          const itemFile = await Attachment.findByPk(i.id);

          console.log(itemFile);

          await messageCreated.addAttachment(itemFile);
        }),
      );
    } else if (type === 'image') {
      await Promise.all(
        files.map(async (i) => {
          const itemFile = await Attachment.findByPk(i.id);
          await messageCreated.addAttachment(itemFile);
        }),
      );
    }

    const user = await User.findByPk(currentUser.id);
    messageCreated.senderId = user.id;

    // console.log(user);

    // await messageCreated.createSender(user);

    if (conversationType === 'ChatGroup') {
      // const group = await ChatGroup.findOne({ where: { id: req.body.receiverId } });
      messageCreated.chatGroupId = conversationId;

      // await messageCreated.createChatGroup(group);
    } else if (conversationType === 'User') {
      // check người dùng tồn tại hay không
      // const user_ = await User.findOne({ where: { id: req.body.receiverId } });
      // await messageCreated.createReceiver(user_);
      messageCreated.receiverId = conversationId;
    }

    await messageCreated.save();

    const messageRes = await Message.findOne({
      where: {
        id: messageCreated.id,
      },

      include: [
        {
          model: Attachment,
          as: 'attachments',
          attributes: ['id', 'name', 'path', 'fileUrl', 'type'],
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
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        },
      ],
    });
    if (conversationType === 'User') {
      let dataSend = {
        topics: [messageRes.receiver.username],
        registrationTokens: [],
        notification: {
          title: `${currentUser.fullName} đã gửi tin nhắn cho bạn`,
          body: `${messageRes.message}`,
        },
        appType: 'CHAT_Drawer',
        data: {
          id: `${currentUser.username}`,
          messageId: `${messageCreated.id}`,
          code: 'chat',
          function: 'GuiTinNhan',
        },
      };

      let resultnotifi = nofitiController.sendtoTopicLocal(dataSend);
    }
    return res.json(messageRes);
  } catch (error) {
    next(error);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { id } = req.query;

    const message = await Message.findByPk(id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        },
      ],
    });

    if (currentUser.username === message.sender.username) {
      let tmp = await message.destroy();
      return res.json({ data: tmp });
    }

    return res.json({ data: false });
  } catch (error) {
    next(error);
  }
};

exports.listPhotos = async (req, res, next) => {
  try {
    const conversationId = req.query?.id ?? '';

    const currentUser = req.user;
    const offset_ = req.query?.skip ?? 0;
    const limit_ = req.query?.limit ?? 20;

    const offset = +offset_;
    const limit = +limit_;

    const responeData = {};

    let messages = [];

    if (!conversationId) {
      throw new APIError({
        message: 'Không tồn tại conversationId',
        status: httpStatus.BAD_REQUEST,
      });
    }

    let receiverInfo = await User.findOne({
      where: { username: conversationId },
      attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
    });

    if (!receiverInfo) {
      receiverInfo = await ChatGroup.findOne({
        where: { id: conversationId },
        attributes: ['id', 'name', 'avatarUrl', 'description'],
        include: {
          model: User,
          as: 'users',
          attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        },
      });
      if (!receiverInfo) {
        throw new APIError({
          message: 'Something went wrong',
          status: httpStatus.BAD_REQUEST,
        });
      }
      messages = await Message.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [{ conversationType: 'ChatGroup' }, { chatGroupId: conversationId }],
            },
          ],
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],

        include: [
          {
            model: Attachment,
            as: 'attachments',
            where: {
              type: 'image',
            },
          },
        ],
      });
      responeData.conversationType = 'ChatGroup';
      responeData.receiver = receiverInfo;
      // const response = getPagingData(Object.assign(contacts, { rows: messages }), page, limit);
    } else {
      messages = await Message.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { conversationType: 'User' },
                {
                  [Op.or]: [
                    { [Op.and]: [{ senderId: currentUser.id }, { receiverId: receiverInfo.id }] },
                    { [Op.and]: [{ senderId: receiverInfo.id }, { receiverId: currentUser.id }] },
                  ],
                },
              ],
            },
          ],
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],

        include: [
          {
            model: Attachment,
            as: 'attachments',
            where: {
              type: 'image',
            },
          },
        ],
      });
      responeData.conversationType = 'User';
      responeData.receiver = receiverInfo;
    }
    //responeData.messages = messages.reverse();

    let attachments = [];

    messages.map((i) => {
      //attachments.push(i.attachments[0]);
      attachments = _.concat(attachments, i.attachments);
    });

    return res.json(attachments);
    //return res.json(responeData);
  } catch (error) {
    next(error);
  }
};

exports.listFiles = async (req, res, next) => {
  try {
    const conversationId = req.query?.id ?? '';

    const currentUser = req.user;
    const offset_ = req.query?.skip ?? 0;
    const limit_ = req.query?.limit ?? 20;

    const offset = +offset_;
    const limit = +limit_;

    const responeData = {};

    let messages = [];

    if (!conversationId) {
      throw new APIError({
        message: 'Không tồn tại conversationId',
        status: httpStatus.BAD_REQUEST,
      });
    }

    let receiverInfo = await User.findOne({
      where: { username: conversationId },
      attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
    });

    if (!receiverInfo) {
      receiverInfo = await ChatGroup.findOne({
        where: { id: conversationId },
        attributes: ['id', 'name', 'avatarUrl', 'description'],
        include: {
          model: User,
          as: 'users',
          attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        },
      });
      if (!receiverInfo) {
        throw new APIError({
          message: 'Something went wrong',
          status: httpStatus.BAD_REQUEST,
        });
      }
      messages = await Message.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [{ conversationType: 'ChatGroup' }, { chatGroupId: conversationId }],
            },
          ],
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],

        include: [
          {
            model: Attachment,
            as: 'attachments',
            where: {
              type: 'file',
            },
          },
        ],
      });
      responeData.conversationType = 'ChatGroup';
      responeData.receiver = receiverInfo;
      // const response = getPagingData(Object.assign(contacts, { rows: messages }), page, limit);
    } else {
      messages = await Message.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { conversationType: 'User' },
                {
                  [Op.or]: [
                    { [Op.and]: [{ senderId: currentUser.id }, { receiverId: receiverInfo.id }] },
                    { [Op.and]: [{ senderId: receiverInfo.id }, { receiverId: currentUser.id }] },
                  ],
                },
              ],
            },
          ],
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],

        include: [
          {
            model: Attachment,
            as: 'attachments',
            where: {
              type: 'file',
            },
          },
        ],
      });
      responeData.conversationType = 'User';
      responeData.receiver = receiverInfo;
    }
    //responeData.messages = messages.reverse();

    let attachments = [];

    messages.map((i) => {
      // attachments.push(i.attachments[0]);
      attachments = _.concat(attachments, i.attachments);
    });

    return res.json(attachments);
    //return res.json(responeData);
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

      order: [['createdAt', 'DESC']],

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

exports.getMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const currentUser = req.user;
    const offset_ = req.query?.skip ?? 0;
    const limit_ = req.query?.limit ?? 20;

    const offset = +offset_;
    const limit = +limit_;

    const responeData = {};

    let messages = [];

    if (!conversationId) {
      throw new APIError({
        message: 'Không tồn tại conversationId',
        status: httpStatus.BAD_REQUEST,
      });
    }

    let receiverInfo = await User.findOne({
      where: { username: conversationId },
      attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
    });

    if (!receiverInfo) {
      receiverInfo = await ChatGroup.findOne({
        where: { id: conversationId },
        attributes: ['id', 'name', 'avatarUrl', 'description'],
        include: {
          model: User,
          as: 'users',
          attributes: ['id', 'username', 'email', 'fullName', 'avatarUrl'],
        },
      });
      if (!receiverInfo) {
        throw new APIError({
          message: 'Something went wrong',
          status: httpStatus.BAD_REQUEST,
        });
      }
      messages = await Message.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [{ conversationType: 'ChatGroup' }, { chatGroupId: conversationId }],
            },
          ],
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],

        include: [
          {
            model: Attachment,
            as: 'attachments',
            attributes: ['id', 'name', 'path', 'fileUrl', 'type'],
          },
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
      responeData.conversationType = 'ChatGroup';
      responeData.receiver = receiverInfo;
      // const response = getPagingData(Object.assign(contacts, { rows: messages }), page, limit);
    } else {
      messages = await Message.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { conversationType: 'User' },
                {
                  [Op.or]: [
                    { [Op.and]: [{ senderId: currentUser.id }, { receiverId: receiverInfo.id }] },
                    { [Op.and]: [{ senderId: receiverInfo.id }, { receiverId: currentUser.id }] },
                  ],
                },
              ],
            },
          ],
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],

        include: [
          {
            model: Attachment,
            as: 'attachments',
            attributes: ['id', 'name', 'path', 'fileUrl', 'type'],
          },
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
      responeData.conversationType = 'User';
      responeData.receiver = receiverInfo;
    }
    responeData.messages = messages.reverse();
    return res.json(responeData);
  } catch (error) {
    next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { gskip, pskip } = req.query;

    if ((gskip && gskip > 0) || (pskip && pskip > 0)) return res.json([]);

    const mess_tmp = await Message.findAll({
      where: {
        [Op.and]: [{ conversationType: 'User' }, { [Op.or]: [{ senderId: currentUser.id }, { receiverId: currentUser.id }] }],
      },
      order: [['createdAt', 'DESC']],

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

    const personalMessages = [];

    _.mapKeys(mess, (value) => personalMessages.push(value[0]));

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
          order: [['createdAt', 'DESC']],
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
  avatarUploadFile(req, res, async () => {
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

const photosUploadFile = multer(storagePhoto).single('photos');

exports.addPhotos = (req, res, next) => {
  const currentUser = req.user;
  photosUploadFile(req, res, async (err) => {
    try {
      if (!req.file) {
        console.log(err);
        throw new APIError({
          message: err,
          status: httpStatus.BAD_REQUEST,
        });
      }
      const outputFile = `${req.file.path}.jpg`;

      await sharp(req.file.path).jpeg({ quality: 80 }).toFile(outputFile);

      // delete old file
      fs.unlinkSync(req.file.path);

      const dataItem = {
        type: 'image',
        name: `${req.file.filename}.jpg`,
        path: `/public/images/${req.file.filename}.jpg`,
        userId: currentUser.id,
      };

      const messageCreated = await Attachment.create(dataItem);
      await messageCreated.save();

      const temp = {
        id: messageCreated.id,
        uid: uuidv4(),
        name: `${req.file.filename}.jpg`,
        path: `/public/images/${req.file.filename}.jpg`,
        status: 'done',
        response: { status: 'success' },
        linkProps: { download: 'image' },
        thumbUrl: `${staticUrl}/public/images/${req.file.filename}.jpg`,
      };
      return res.json(temp);
    } catch (error) {
      next(error);
    }
  });
};

const filesUpload = multer(storageFile).single('files');

exports.addFiles = (req, res, next) => {
  const currentUser = req.user;

  filesUpload(req, res, async (err) => {
    try {
      if (!req.file) {
        console.log(err);
        throw new APIError({
          message: err,
          status: httpStatus.BAD_REQUEST,
        });
      }

      const dataItem = {
        type: 'file',
        name: req.file.filename,
        path: `${req.file.filename}`,
        userId: currentUser.id,
      };

      const messageCreated = await Attachment.create(dataItem);
      await messageCreated.save();

      const temp = {
        id: messageCreated.id,
        uid: uuidv4(),
        name: req.file.filename,
        path: `/files/${req.file.filename}`,
        status: 'done',
        response: { status: 'success' },
        linkProps: { download: 'file' },
      };

      return res.json(temp);
    } catch (error) {
      next(error);
    }
  });
};
