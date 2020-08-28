const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const PasswordRefreshToken = sequelize.define(
		'passwordRefreshToken',
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

	return PasswordRefreshToken;
};