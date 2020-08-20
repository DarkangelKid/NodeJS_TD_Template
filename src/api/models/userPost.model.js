const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
	const UserPost = sequelize.define(
		'userPost',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true
			},
			content: {
				type: DataTypes.STRING,
			},
			attachments: {
				type: DataTypes.STRING,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
		},
		{
			freezeTableName: true,
		},
	);

	return UserPost;
};
