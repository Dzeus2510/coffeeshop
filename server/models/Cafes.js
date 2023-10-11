const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Cafes = sequelize.define("coffeeplaces", {
        name: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING,
        },
        cat: {
            type: DataTypes.STRING,
        },
        phone: {
            type: DataTypes.STRING,
        },
        website: {
            type: DataTypes.STRING,
        },
        stars: {
            type: DataTypes.STRING,
        },
        review: {
            type: DataTypes.STRING,
        },
    })

    Cafes.associate = (models) => {
        Cafes.hasMany(models.Review, {
            onDelete: "cascade",
        });
    
        Cafes.hasMany(models.Favourite, {
            onDelete: "cascade",
        });
    }
    return Cafes
}