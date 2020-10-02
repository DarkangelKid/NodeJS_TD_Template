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

const storagePhoto = require('../utils/storagePhoto');
const storageFile = require('../utils/storageFile');

const Attachment = db.attachment;

const { Op } = db.Sequelize;

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

      const temp = {
        uid: uuidv4(),
        name: `${req.file.filename}.jpg`,
        path: `/images/message/${req.file.filename}.jpg`,
        status: 'done',
        response: { status: 'success' },
        linkProps: { download: 'image' },
        thumbUrl: `${staticUrl}/images/message/${req.file.filename}.jpg`,
      };

      const dataItem = {
        type: 'image',
        name: `${req.file.filename}.jpg`,
        path: `public/images/${req.file.filename}.jpg`,
        userId: currentUser.id,
      };

      const messageCreated = await Attachment.create(dataItem);
      await messageCreated.save();

      return res.json(messageCreated);
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

      const temp = {
        uid: uuidv4(),
        name: req.file.filename,
        path: `/files/${req.file.filename}`,
        status: 'done',
        response: { status: 'success' },
        linkProps: { download: 'file' },
      };

      const dataItem = {
        type: 'file',
        name: req.file.filename,
        path: `public/files/${req.file.filename}`,
        userId: currentUser.id,
      };

      const messageCreated = await Attachment.create(dataItem);
      await messageCreated.save();

      return res.json(messageCreated);
    } catch (error) {
      next(error);
    }
  });
};
