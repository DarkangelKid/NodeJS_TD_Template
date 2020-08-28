const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Comment = sequelize.define(
		'comment',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			parentId: {
				type: DataTypes.INTEGER,
			},
			postId: {
				type: DataTypes.INTEGER
			},
			postType: {
				type: DataTypes.INTEGER
			},
			content: {
				type: DataTypes.STRING,
			},

		},
		{
			freezeTableName: true,
		},
	);

	return Comment;
};
