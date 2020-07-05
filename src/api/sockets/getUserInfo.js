const User = require('../models/user.model');

const getUserInfo = async (id) => {
  try {
    const user = await User.findById(id);

    if (user) return user.transform();
    return null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = getUserInfo;
