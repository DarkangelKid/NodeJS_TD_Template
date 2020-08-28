const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const UserGroup = sequelize.define(
		'userGroup',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			groupId: {
				type: DataTypes.INTEGER,
				allowNull: false
			}
		},
		{
			freezeTableName: true,
		},
	);

	return UserGroup;
};
