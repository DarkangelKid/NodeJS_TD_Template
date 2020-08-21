const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
	const ChatGroup = sequelize.define(
		'chatGroup',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			avatarUrl: {
				type: DataTypes.STRING
			},
			description: {
				type: DataTypes.STRING
			}
		},
		{
			freezeTableName: true,
		},
	);

	return ChatGroup;
};
