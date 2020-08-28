const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
