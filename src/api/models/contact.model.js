const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Contact = sequelize.define(
		'contact',
		{
			senderId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			receiverId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING
			}
		},
		{
			freezeTableName: true,
		},
	);

	return Contact;
};
