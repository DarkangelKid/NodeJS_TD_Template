const httpStatus = require('http-status');
const { omit } = require('lodash');
const fsExtra = require('fs-extra');
const multer = require('multer');

const APIError = require('../utils/APIError');
const db = require('../../config/mssql');

const storageAvatar = require('../utils/storageAvatar');

const User = db.users;
const ChatGroup = db.chatGroups;
const User_ChatGroup = db.user_chatGroup;
const Group = db.groups;
const Office = db.offices;

const avatarUploadFile = multer(storageAvatar).single('avatar');
const { avatarDirectory, avatarTypes, avatarLimitSize } = require('../../config/vars');

const { Op } = db.Sequelize;

exports.ImportGroup = async (req, res, next) => {
  try {
    const offices = await Office.findAll();

    await Promise.all(
      offices.map(async (item) => {
        let itemData = {
          name: item.name,
          code: item.code,
          description: '',
        };

        const itemGroup = await Group.create(itemData);

        let users = await User.findAll({ where: { [Op.or]: [{ nhomId: item.id }, { officeId: item.id }] } });

        users.map(async (itemUser) => {
          try {
            await itemGroup.addUser(itemUser);
          } catch (error_) {
            console.log(error_);
          }
        });
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json({ status: true });
  } catch (error) {
    next(error);
  }
};

exports.GetListGroup1 = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { page, perpage } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    res.status(httpStatus.CREATED);
    return res.json({ status: true });
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

exports.GetInforGroup = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { id } = req.query;

    const groups = await Group.findOne({
      where: { id: id },
      include: {
        model: User,
        as: 'users',
        attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
      },
    });

    return res.json(groups);
  } catch (error) {
    next(error);
  }
};

exports.GetListGroup = async (req, res, next) => {
  try {
    const currentUser = req.user;
    console.log(currentUser);

    const { page, perpage } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    const groups = await Group.findAndCountAll({
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
      groups.rows.map(async (i) => {
        let user = await Group.findByPk(i.id, {
          attributes: ['id', 'name', 'avatarUrl', 'description', 'code'],
          include: {
            model: User,
            as: 'users',
            attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
          },
        });
        user = user.toJSON();
        dataUsers.push(user);
      }),
    );

    const response = getPagingData(Object.assign(groups, { rows: dataUsers }), page, limit);

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
