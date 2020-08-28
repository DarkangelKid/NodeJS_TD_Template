const httpStatus = require('http-status');
const { omit } = require('lodash');
const Contact = require('../models/contact.model');
const _ = require('lodash');
const multer = require('multer');
const fsExtra = require('fs-extra');
const APIError = require('../utils/APIError');
const storageAvatar = require('../utils/storageAvatar');
const { avatarDirectory, avatarTypes, avatarLimitSize } = require('../../config/vars');

const db = require('../../config/mssql');
const User = db.users;

exports.load = async (req, res, next, id) => {
  try {
    const user = await User.findByPk(id);
    /*  const user = await User.findOne({
      where: {
        userName,
      },
    }); */
    req.locals = { user };
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.user);

exports.getCurrentUser = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  return res.json(user);
};

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = (req, res) => {
  return res.json(req.user.transform());
};

/**
 * Update existing user
 * @public
 */
exports.update = async (req, res, next) => {
  let user = await User.get(req.user.id);
  // const ommitRole = user.role !== "admin" ? "role" : "";
  // const ommitPassword = req.body.password !== "admin" ? "role" : "";

  const updatedUser = omit(req.body, ['role', 'password']);
  user = Object.assign(user, updatedUser);
  user
    .save()
    .then((savedUser) => res.json(savedUser.transform()))
    .catch((e) => next(User.checkDuplicateUsername(e)));
};

/**
 * Update existing user
 * @public
 */
exports.updatePassword = async (req, res, next) => {
  try {
    let user = await User.get(req.user.id);

    console.log(user);

    const { oldPassword, newPassword } = req.body;
    const passwordMatch = await user.passwordMatches(oldPassword);
    if (passwordMatch) {
      user = Object.assign(user, { password: newPassword });
      return user
        .save()
        .then(() => res.json({ message: 'update succesfully' }))
        .catch((e) => next(e));
    }
    throw new APIError({
      message: "Passwords don't match",
      status: httpStatus.NOT_FOUND,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    // search user to add contact
    let currentUserId = req.user.id;
    let users = await User.list({ ...req.query });
    // get userids list
    let usersId = [];
    users.forEach((item) => {
      usersId.push(item.id);
    });
    let contacts = await Contact.find({
      $or: [
        {
          $and: [{ userId: { $in: usersId } }, { contactId: currentUserId }],
        },
        {
          $and: [{ userId: currentUserId }, { contactId: { $in: usersId } }],
        },
      ],
    });
    let responseUsers = [];
    // users = users.map((user) => user.publicInfoTransform());

    users.forEach((userItem) => {
      let tempItem = { ...userItem, type: 'notContact' };
      if (userItem.id == currentUserId) {
        tempItem.type = 'you';
      } else {
        contacts.forEach((contactItem) => {
          if (userItem.id.toString() == contactItem.userId.toString()) {
            // request sent
            if (!!contactItem.status) {
              // accepted
              tempItem.type = 'contact';
              return;
            } else {
              tempItem.type = 'request';
              return;
            }
          } else if (userItem.id.toString() == contactItem.contactId.toString()) {
            // request
            if (!!contactItem.status) {
              // accepted
              tempItem.type = 'contact';
              return;
            } else {
              tempItem.type = 'requestSent';
              return;
            }
          }
        });
      }
      responseUsers.push(tempItem);
    });

    // const transformedUsers = users.map(user => user.transform());
    res.json(responseUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const { user } = req.locals;

  user
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch((e) => next(e));
};

// let avatarUploadFile = multer({
//   storage: storageAvatar,
//   limits: { fileSize: avatarLimitSize },
// }).single("avatar");

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
