const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { photoDirectory, photoTypes, photoLimitSize } = require('../../config/vars');

module.exports = {
  storage: new multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, photoDirectory);
    },
    filename: (req, file, callback) => {
      const math = photoTypes;
      if (math.indexOf(file.mimetype) === -1) {
        return callback('Only .png, .jpg and .jpeg format allowed!', null);
      }
      const imageName = `${Date.now()}-${uuidv4()}`;
      //   .${file.originalname.split(".").pop()}
      callback(null, imageName);
    },
  }),
  limits: { fileSize: photoLimitSize },
};
