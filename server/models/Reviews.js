const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Reviews = sequelize.define("Review", {
        reviewBody: {
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