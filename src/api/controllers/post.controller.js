const httpStatus = require('http-status');
const { omit } = require('lodash');

const APIError = require('../utils/APIError');
const db = require('../../config/mssql');
const nofitiController = require('./notification.controller');
const DataDonVi = require('../data/DonVi_NamDinh.json');

const Post = db.post;
const Office = db.offices;
const Attachment = db.attachment;
const User = db.users;
const Group = db.groups;
const Comment = db.comment;
const Reaction = db.reactions;

const { Op } = db.Sequelize;

exports.CreatePost = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const itemData = omit(req.body, 'id', 'attachments');
    itemData.userId = currentUser.id;

    const itemPost = await Post.create(itemData);

    const attachments = req.body?.attachments ?? [];
    await Promise.all(
      attachments.map(async (itemAttachment) => {
        try {
          const itemFile = await Attachment.findByPk(itemAttachment.id);
          await itemPost.addAttachment(itemFile);
        } catch (error) {
          console.log('error');
          console.log(error);
        }
      }),
    );

    let groupId = itemPost?.groupId ?? null;
    if (groupId) {
      let group = await Group.findOne({
        where: { id: groupId },
        attributes: ['id', 'name', 'avatarUrl', 'description'],
        include: {
          model: User,
          as: 'users',
          attributes: ['id', 'username', 'email', 'fullName'],
        },
      });
      let arr_user = [];
      try {
        let users = group.users;
        users.map((i) => {
          if (currentUser.username !== i.username) {
            arr_user.push(i.username);
          }
        });
      } catch (error) {
        console.log(error);
      }

      let dataSend = {
        topics: arr_user,
        registrationTokens: [],
        notification: {
          title: `Thông báo mới trong nhóm ${group.name}`,
          body: `${currentUser.fullName} đã đăng thông báo ${itemPost.contentData}`,
        },
        appType: 'TTNB_Drawer',
        data: {
          id: `${itemPost.id}`,
          code: 'ttnb',
          function: 'ChiTiet',
        },
      };

      let resultnotifi = await nofitiController.sendtoTopicLocal(dataSend);
    }

    res.status(httpStatus.CREATED);
    return res.json(itemPost);
  } catch (error) {
    next(error);
  }
};




exports.GetListPostUser = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { page, perpage, user } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    let userId = currentUser.id;

    if (user) {
      let userObj = await User.findOne({
        where: {
          username: user,
        },
      });
      console.log(userObj);
      if (userObj) {
        userId = userObj.id;
      } else {
        throw new APIError({
          message: 'Không tồn tại tài khoản',
          status: httpStatus.BAD_REQUEST,
        });
      }
    }

    //let userId = user||currentUser.id;

    const groups = await Post.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: Comment,
          as: 'comments',
        },
        {
          model: Reaction,
          as: 'reactions',
        },
        {
          model: Group,
          as: 'group',
          include: {
            model: User,
            as: 'users',
            attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
            required: true,
            where: {
              id: userId,
            },
          },
        },
        {
          model: Attachment,
          as: 'attachments',
          attributes: ['id', 'name', 'path', 'fileUrl', 'type'],
        },
      ],
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
    });

    const response = getPagingData(groups, page, limit);

    return res.json(response);
  } catch (error) {
    next(error);
  }
};



exports.GetListPost = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { page, perpage, user } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    let userId = currentUser.id;

    if (user) {
      let userObj = await User.findOne({
        where: {
          username: user,
        },
      });
      if (userObj) {
        userId = userObj.id;
      } else {
        throw new APIError({
          message: 'Không tồn tại tài khoản',
          status: httpStatus.BAD_REQUEST,
        });
      }
    }

    //let userId = user||currentUser.id;

    const groups = await Post.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: Comment,
          as: 'comments',
        },
        {
          model: Reaction,
          as: 'reactions',
        },
        {
          model: Group,
          as: 'group',
          include: {
            model: User,
            as: 'users',
            attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
            required: true,
            where: {
              id: userId,
            },
          },
        },
        {
          model: Attachment,
          as: 'attachments',
          attributes: ['id', 'name', 'path', 'fileUrl', 'type'],
        },
      ],
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
    });

    const response = getPagingData(groups, page, limit);

    return res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.GetListPostInGroup = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { page, perpage, groupId } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    const groups = await Post.findAndCountAll({
      where: { groupId: groupId },
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: Comment,
          as: 'comments',
        },
        {
          model: Reaction,
          as: 'reactions',
        },
        {
          model: Group,
          as: 'group',
          include: {
            model: User,
            as: 'users',
            attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
          },
        },
        {
          model: Attachment,
          as: 'attachments',
          attributes: ['id', 'name', 'path', 'fileUrl', 'type'],
        },
      ],
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
    });

    const response = getPagingData(groups, page, limit);

    return res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.ImportOffice = async (req, res, next) => {
  try {
    let count = 0;
    await Promise.all(
      DataDonVi.results.map(async (item) => {
        let OfGroup = item.OfGroup;
        let ParentGroupCode = OfGroup?.GroupCode ?? '';

        let itemData = {
          name: item.GroupName,
          description: '',
          code: item.GroupCode.replace(/-/g, '.'),
          parentCode: ParentGroupCode.replace(/-/g, '.'),
        };
        const itemOffice = await Office.create(itemData);
        if (itemOffice) count++;
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json({ status: count });
  } catch (error) {
    console.log(error);
  }
};

exports.AddParentId = async (req, res, next) => {
  try {
    let count = 0;
    /* await Promise.all(
      DataDonVi.results.map(async (item) => {
        let OfGroup = item.OfGroup;
        let ParentGroupCode = OfGroup?.GroupCode ?? '';

        let itemData = {
          name: item.GroupName,
          description: '',
          code: item.GroupCode.replace(/-/g, '.'),
          parentCode: ParentGroupCode.replace(/-/g, '.'),
        };
        const itemOffice = await Office.create(itemData);
        if (itemOffice) count++;
      }),
    ); */

    let arr = await Office.findAll();
    await Promise.all(
      arr.map(async (item) => {
        let parentCode = item.parentCode;
        if (parentCode.length > 1) {
          let parentOffice = await Office.findOne({ where: { code: parentCode } });
          if (parentOffice) {
            item.parentId = parentOffice.id;
            await item.save();
          }
        }
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json({ status: count });
  } catch (error) {
    console.log(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const itemData = omit(req.body, 'id');

    const item = await Office.create(itemData)
      .then((result) => result)
      .catch((err) => next(err));

    res.status(httpStatus.CREATED);
    return res.json(item);
  } catch (error) {
    console.log(error);
  }
};

exports.update = async (req, res, next) => {
  const { id } = req.params;
  let item = await Office.findByPk(id);

  const updatedItem = omit(req.body, ['role', 'password']);
  item = Object.assign(item, updatedItem);
  item
    .save()
    .then((data) => res.json(data))
    .catch((e) => next(e));
};

exports.remove = (req, res, next) => {
  const { id } = req.params;

  Office.destroy({
    where: {
      id,
    },
  })
    .then((data) => res.json(data))
    .catch((e) => next(e));
};

exports.findAll = async (req, res, next) => {
  const { q, page, perpage } = req.query;
  const { limit, offset } = getPagination(page, perpage);
  const condition = q ? { name: { [Op.like]: `%${q}%` } } : null;
  const attributes = ['id', 'name', 'code', 'description', 'parentId'];

  Office.findAndCountAll({
    where: condition,
    limit,
    offset,
    attributes,
  })
    .then((data) => {
      const response = getPagingData(data, page, limit);
      res.json(response);
    })
    .catch((e) => next(e));
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
