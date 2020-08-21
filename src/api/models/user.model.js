const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define(
		'user',
		{
			userName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false
			},
			firstName: {
				type: DataTypes.STRING
			},
			lastName: {
				type: DataTypes.STRING
			},
			avatarUrl: {
				type: DataTypes.STRING
			},
			position: {
				type: DataTypes.STRING
			},
			officeId: {
				type: DataTypes.INTEGER
			}
		},
		{
			freezeTableName: true,
		},
	);

	return User;
};
