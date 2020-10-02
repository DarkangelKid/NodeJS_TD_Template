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
const Reaction = db.reactions;

const { Op } = db.Sequelize;

exports.CreateReaction = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const itemData = omit(req.body, 'id');
    itemData.userId = currentUser.id;

    const itemPost = await Reaction.create(itemData);

    res.status(httpStatus.CREATED);
    return res.json(itemPost);
  } catch (error) {
    next(error);
  }
};

exports.DeleteReaction = async (req, res, next) => {
  try {
    try {
      const currentUser = req.user;
      const itemData = omit(req.body, 'id');
      let postId = itemData.postId;
      let commentId = itemData.commentId;

      const itemPost = await Reaction.destroy({
        where: {
          userId: currentUser.id,
          postId: postId,
          commentId: commentId,
        },
      });

      res.status(httpStatus.CREATED);
      return res.json(itemPost);
    } catch (error) {
      next(error);
    }
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
