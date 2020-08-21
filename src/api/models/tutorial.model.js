const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const Tutorial = sequelize.define(
        'tutorial', {
        title: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
        published: {
            type: DataTypes.BOOLEAN,
        },
    });

    return Tutorial;
};
