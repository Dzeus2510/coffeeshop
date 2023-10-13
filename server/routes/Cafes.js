const express = require("express")
const router = express.Router()
const { sequelize, coffeeplaces, Favourite } = require("../models")

router.get("/", async (req, res) => {
    const page = req.query.page
    // const query = "SELECT `coffeeplaces`.`id`, `coffeeplaces`.`name`, `coffeeplaces`.`address`, `coffeeplaces`.`cat`, `coffeeplaces`.`phone`, `coffeeplaces`.`website`, `coffeeplaces`.`stars`, `coffeeplaces`.`review`, `coffeeplaces`.`image`, `coffeeplaces`.`createdAt`, `coffeeplaces`.`updatedAt`, `Favourites`.`id` AS `Favourites.id`, `Favourites`.`createdAt` AS `Favourites.createdAt`, `Favourites`.`updatedAt` AS `Favourites.updatedAt`, `Favourites`.`coffeeplaceId` AS `Favourites.coffeeplaceId`, `Favourites`.`UserId` AS `Favourites.UserId` FROM `coffeeplaces` AS `coffeeplaces` LEFT OUTER JOIN `Favourites` AS `Favourites` ON `coffeeplaces`.`id` = `Favourites`.`coffeeplaceId` LIMIT 5,5;"
    const listOfCafe = await coffeeplaces.findAll({include: [Favourite], limit: 5, offset: (page-1)*5 })
    // const listOfCafe = await sequelize.query(query)
    // console.log(req.user)
    // const favouriteCafes = await Favourite.findAll({ where: { UserId: req.user.id} })
    // res.json({ listOfCafe: listOfCafe, favouriteCafes: favouriteCafes });
    // console.log(listOfCafe)
    console.log(req.query.page)
    res.json({listOfCafe: listOfCafe})
});

router.get('/byId/:id', async (req, res) => {
    const id = req.params.id
    const cafe = await coffeeplaces.findByPk(id)
    res.json(cafe)
})

// router.put()

module.exports = router