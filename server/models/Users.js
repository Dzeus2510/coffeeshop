const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("User", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

    })

    Users.associate = (models) => {
        Users.hasMany(models.Favourite, {
            onDelete: "cascade",
        });
    }


    return Users
}