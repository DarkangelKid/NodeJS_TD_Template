const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Group extends Model {}
  /*
    privacy Quyen rieng tu  0 Nhom cong khai : Bat ki ai cung co the nhin thay moi nguoi trong nhom va nhung gi ho dang
    1 : Nhom rieng tu  : Bat ky ai cung co the tim nhom, xem thanh vien cua nhom, Chi thanh vien moi xem dc bai viet
    2 : Nhom bi mat: Chi thanh vien cua nhom moi co the tim duoc nhom va xem bai viet

    configJoinMember  0 Bat ki ai cung co the tham gia ma khong can phe duyet
    1:  Bat ki thanh vien nao cung co the them, chap thuan thanh vien moi
    2:  Moi thanh vien deu co the them thanh vien, nhung quan tri vien hoac nguoi kiem duyet phai phe duyet
    3:

    configPost  0   Moi thanh vien deu co the dang bai, tu dong duyet bai
                1   Moi thanh vien deu co the dang bai, Quan tri, nguoi kiem duyet bai dang
                2   Chi quan tri, nguoi kiem duyet moi duoc dang bai

*/
  Group.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      privacy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      configPost: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      configJoinMember: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'group',
      freezeTableName: true,
    },
  );

  return Group;
};
