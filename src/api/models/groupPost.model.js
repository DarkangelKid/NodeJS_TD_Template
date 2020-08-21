const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
	const GroupPost = sequelize.define(
		'groupPost',
		{
			content: {
				type: DataTypes.STRING,
			},
			attachments: {
				type: DataTypes.STRING,
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false
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

	return GroupPost;
};
