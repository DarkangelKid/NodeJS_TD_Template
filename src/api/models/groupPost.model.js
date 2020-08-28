const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
