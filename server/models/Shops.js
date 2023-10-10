const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Shops = sequelize.define("coffeeplaces", {
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

    Shops.associate = (models) => {
        Shops.hasMany(models.Review, {
            onDelete: "cascade",
        });
    
        Shops.hasMany(models.Favourite, {
            onDelete: "cascade",
        });
    }
    return Shops
}