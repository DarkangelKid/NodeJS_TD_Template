const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
	const UserGroup = sequelize.define(
		'userGroup',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			groupId: {
				type: DataTypes.INTEGER
			}
		},
		{
			freezeTableName: true,
		},
	);

	return UserGroup;
};
