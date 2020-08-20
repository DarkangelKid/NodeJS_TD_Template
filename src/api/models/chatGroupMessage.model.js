const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const ChatGroupMessage = sequelize.define(
        'chatGroupMessage',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
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
