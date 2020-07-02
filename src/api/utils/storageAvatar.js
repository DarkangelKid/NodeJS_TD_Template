const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { avatarTypes, avatarDirectory, avatarLimitSize } = require('../../config/vars');

module.exports = {
  storage: new multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, avatarDirectory);
    },
    filename: (req, file, callback) => {
      const math = avatarTypes;
      if (math.indexOf(file.mimetype) === -1) {
        return callback('Only .png, .jpg and .jpeg format allowed!', null);
      }
      const avatarName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
      callback(null, avatarName);
    },
  }),
  limits: { fileSize: avatarLimitSize },
};
