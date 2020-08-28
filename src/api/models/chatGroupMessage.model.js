const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ChatGroupMessage = sequelize.define(
        'chatGroupMessage',
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            chatGroupId: {
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

    return ChatGroupMessage;
};
