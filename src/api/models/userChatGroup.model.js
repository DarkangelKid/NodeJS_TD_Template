const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
	const UserChatGroup = sequelize.define(
		'userChatGroup',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			chatGroupId: {
				type: DataTypes.INTEGER,
				allowNull: false
			}
		},
		{
			freezeTableName: true,
		},
	);

	return UserChatGroup;
};
