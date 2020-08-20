const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
	const Group = sequelize.define(
		'group',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true
			},
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

	return Group;
};
