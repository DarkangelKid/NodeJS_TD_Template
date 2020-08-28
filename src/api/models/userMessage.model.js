const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const UserMessage = sequelize.define(
        'userMessage',
        {
            senderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            receiverId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            content: {
                type: DataTypes.STRING
            }
        },
        {
            freezeTableName: true,
        },
    );

    return UserMessage;
};
