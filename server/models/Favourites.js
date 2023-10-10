module.exports = (sequelize, DataTypes) => {
    const Favourites = sequelize.define("Favourite");

    return Favourites;
};