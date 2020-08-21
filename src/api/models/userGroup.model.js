const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
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
