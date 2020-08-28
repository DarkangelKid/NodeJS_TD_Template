const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const RefreshToken = sequelize.define(
		'refreshToken',
		{
			token: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			userEmail: {
				type: DataTypes.STRING
			}
		},
		{
			freezeTableName: true,
		},
	);

	return RefreshToken;
};