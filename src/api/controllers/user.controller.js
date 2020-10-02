const httpStatus = require('http-status');
const { omit } = require('lodash');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const multer = require('multer');
const fsExtra = require('fs-extra');
const APIError = require('../utils/APIError');
const storageAvatar = require('../utils/storageAvatar');
const { avatarDirectory, avatarTypes, avatarLimitSize } = require('../../config/vars');

const db = require('../../config/mssql');
const User = db.users;
const Contact = db.contacts;
const Position = db.positions;
const Office = db.offices;

const { Op } = db.Sequelize;

const DataNguoiDung = require('../data/NguoiDung_NamDinh.json');

exports.ImportUser = async (req, res, next) => {
  try {
    let count = 0;

    console.log('AAAAA');

    let arr = DataNguoiDung.data;
    console.log(arr.length);

    await Promise.all(
      arr.map(async (item) => {
        const rounds = 10;
        //const hash = await bcrypt.hash('Tandan123', rounds);

        let positon = item.Position?.Name ?? null;
        let groupCode = item.Group?.GroupCode ?? null;
        let officeCode = item.UserOffice?.GroupCode ?? null;

        let positionId = null;
        let officeId = null;
        let nhomId = null;

        if (groupCode) {
          groupCode = groupCode.replace(/-/g, '.');

          let officeItem = await Office.findOne({ where: { code: groupCode } });

          if (officeItem) {
            nhomId = officeItem.id;
          }
        }

        if (officeCode) {
          officeCode = officeCode.replace(/-/g, '.');

          let officeItem = await Office.findOne({ where: { code: officeCode } });

          if (officeItem) {
            officeId = officeItem.id;
          }
        }

        if (positon) {
          let officeItem = await Position.findOne({ where: { name: positon } });

          if (officeItem) {
            positionId = officeItem.id;
          }
        }

        let itemData = {
          username: item.UserProfile.Account,
          fullName: item.UserProfile.FullName,
          displayName: item.UserProfile.FullName,
          sex: item.UserProfile.Sex,
          birthday: item.UserProfile.Birthday,
          email: item.UserProfile.Email,
          phoneNumber: item.UserProfile.Phone,
          password: '$2a$10$J/870qRZ8o7TitXS4yoziul0COW0GgeN7D143eZkMx.Q0mh8um6/m',
          positionId: positionId,
          officeId: officeId,
          nhomId: nhomId,
        };

        try {
          const itemUser = await User.create(itemData);
          if (itemUser) count++;
        } catch (error__) {
          console.log('LOI');
          console.log(error__);
        }
      }),
    );

    res.status(httpStatus.CREATED);
    return res.json({ status: count });
  } catch (error) {
    console.log(error);
  }
};
exports.GetUserInfo = async (req, res, next) => {
  try {
    const { id, username } = req.query;
    const condition = id ? { id: id } : username ? { username: username } : { id: req.user.id };

    const user = await User.findOne({
      where: condition,
      attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'],
      include: ['office', 'position'],
    });

    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

exports.ListUser = async (req, res, next) => {
  try {
    let currentUserId = req.user.id;

    const { q, page, perpage } = req.query;
    const { limit, offset } = getPagination(page, perpage);
    const condition = q ? { fullName: { [Op.like]: `%${q}%` } } : null;
    const attributes = ['id', 'username', 'fullName', 'email', 'avatarUrl', 'address', 'displayName', 'birthday', 'sex'];
    const include = ['office', 'position'];

    const users = await User.findAndCountAll({
      where: condition,
      limit,
      offset,
      attributes,
      include,
    });

    let queryContact = {
      [Op.and]: [{ [Op.or]: [{ userOneId: currentUserId }, { userTwoId: currentUserId }] }],
    };

    const contacts = await Contact.findAll({ where: queryContact });

    let responseUsers = [];
    users.rows.forEach((userItem) => {
      let tempItem = { ...userItem.toJSON(), type: 'notContact' };
      if (userItem.id == currentUserId) {
        tempItem.type = 'you';
      } else {
        console.log(contacts);
        contacts.forEach((contactItem) => {
          if (userItem.id === contactItem.userOneId || userItem.id === contactItem.userTwoId) {
            if (contactItem.status === 1) {
              tempItem.type = 'contact';
              tempItem.datacontact = contactItem;
              return;
            } else if (contactItem.status === 2) {
              tempItem.type = 'notContact';
              tempItem.datacontact = contactItem;
              return;
            } else if (contactItem.actionUserId === currentUserId) {
              tempItem.type = 'requestsent';
              tempItem.datacontact = contactItem;
              return;
            } else {
              tempItem.type = 'request';
              tempItem.datacontact = contactItem;
              return;
            }
          }
        });
      }

      responseUsers.push(tempItem);
    });

    const response = getPagingData({ count: users.count, rows: responseUsers }, page, limit);

    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

let avatarUploadFile = multer(storageAvatar).single('avatar');

exports.UploadProfilePicture = (req, res, next) => {
  avatarUploadFile(req, res, async (err) => {
    try {
      if (!req.file) {
        throw new APIError({
          message: 'Please select a file.',
          status: httpStatus.BAD_REQUEST,
        });
      }

      let updateUserItem = {
        picture: req.file.filename,
        updatedAt: Date.now(),
      };

      let user = await User.get(req.user.id);

      user = Object.assign(user, { avatarUrl: req.file.filename });

      await user.save();

      let result = {
        message: 'success',
        picture: `${updateUserItem.picture}`,
      };
      return res.send(result);
    } catch (error) {
      next(error);
    }
  });
};

const getPagination = (page, perpage) => {
  const limit = perpage ? +perpage : 100;
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
