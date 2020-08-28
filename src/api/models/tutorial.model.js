const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
