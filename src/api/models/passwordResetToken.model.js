const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
	const PasswordRefreshToken = sequelize.define(
		'passwordRefreshToken',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true
			},
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