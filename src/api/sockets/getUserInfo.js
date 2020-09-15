const db = require('../../config/mssql');

const User = db.users;

const getUserInfo = async (id) => {
  try {
    const user = await User.findOne({
      where: {
        username: id,
      },
    });

    if (user) return user.transform();
    return null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = getUserInfo;
