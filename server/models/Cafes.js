const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Cafes = sequelize.define("coffeeplaces", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
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
        image: {
            type: DataTypes.STRING,
        }
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