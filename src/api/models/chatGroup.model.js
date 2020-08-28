const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
