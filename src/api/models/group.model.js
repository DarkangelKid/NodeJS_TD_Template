const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Group = sequelize.define(
		'group',
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

	return Group;
};
