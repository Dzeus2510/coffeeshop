const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Reviews = sequelize.define("Review", {
        commentBody: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    })
    return Reviews;
}