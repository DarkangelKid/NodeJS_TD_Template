const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
	const UserChatGroup = sequelize.define(
		'userChatGroup',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			chatGroupId: {
				type: DataTypes.INTEGER
			}
		},
		{
			freezeTableName: true,
		},
	);

	return UserChatGroup;
};
