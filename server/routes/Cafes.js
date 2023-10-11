const express = require("express")
const router = express.Router()
const { Shop, Favourite } = require("../models")

router.get("/", async (req, res) => {
    const listOfCafes = await Shop.findAll({include: [Favourite] })
    const favouriteCafes = await Favourite.findAll({ where: { UserId: req.user.id } })
    res.json({ listOfCafes: listOfCafes, favouriteCafes: favouriteCafes });
});

router.get('/byId/:id', async (req, res) => {
    const id = req.params.id
    const cafe = await Shop.findByPk(id)
    res.json(cafe)
})

// router.put()

module.exports = router