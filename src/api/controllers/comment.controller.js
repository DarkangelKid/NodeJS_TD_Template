const httpStatus = require('http-status');
const { omit } = require('lodash');

const db = require('../../config/mssql');

const DataDonVi = require('../data/DonVi_NamDinh.json');

const Post = db.post;
const Comment = db.comment;
const Office = db.offices;
const Attachment = db.attachment;
const User = db.users;
const Group = db.groups;

const { Op } = db.Sequelize;

exports.CreateComment = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const itemData = omit(req.body, 'id', 'attachments');
    itemData.userId = currentUser.id;

    const itemPost = await Comment.create(itemData);

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

    res.status(httpStatus.CREATED);
    return res.json(itemPost);
  } catch (error) {
    next(error);
  }
};

exports.EditComment = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { id, contentData } = req.body;

    let itemPost = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (itemPost && currentUser.username === itemPost.user.username) {
      itemPost = Object.assign(itemPost, { contentData: contentData });

      await itemPost.save();
    } else {
      throw new APIError({
        message: 'Lỗi',
      });
    }

    res.status(httpStatus.CREATED);
    return res.json(itemPost);
  } catch (error) {
    next(error);
  }
};

exports.DeleteComment = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const itemData = omit(req.body, 'id', 'attachments');
    itemData.userId = currentUser.id;

    const { id } = req.body;

    let itemPost = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (itemPost && currentUser.username === itemPost.user.username) {
      await itemPost.destroy();
    } else {
      throw new APIError({
        message: 'Lỗi',
      });
    }

    res.status(httpStatus.CREATED);
    return res.json(itemPost);
  } catch (error) {
    next(error);
  }
};

exports.GetListComment = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { page, perpage, postId } = req.query;
    const { limit, offset } = getPagination(page, perpage);

    const groups = await Comment.findAndCountAll({
      where: { postId: postId, parentId: null },
      raw: true,
      nest: true,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
        },
        {
          model: Post,
          as: 'post',
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
          },
        },
        /* {
          model: Comment,
          as: 'comments',
        }, */
        {
          model: Attachment,
          as: 'attachments',
          attributes: ['id', 'name', 'path', 'fileUrl', 'type'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    let response = getPagingData(groups, page, limit);

    let datatmp = response.data;

    await Promise.all(
      datatmp.map(async (item) => {
        let comments = [];
        const childComment = await Comment.findAll({
          where: {
            parentId: item.id,
          },
          raw: true,
          nest: true,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
            },
            {
              model: Post,
              as: 'post',
              include: {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
              },
            },

            {
              model: Attachment,
              as: 'attachments',
              attributes: ['id', 'name', 'path', 'fileUrl', 'type'],
            },
          ],
        });

        item.comments = [...childComment];
        return item;
      
      }),
    );

    return res.json({ data: datatmp });
  } catch (error) {
    next(error);
  }
};

exports.GetCommentInPost = async (req, res, next) => {
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
      order: [['createdAt', 'DESC']],
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
