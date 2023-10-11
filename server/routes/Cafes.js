const express = require("express")
const router = express.Router()
const { coffeeplaces, Favourite } = require("../models")

router.get("/", async (req, res) => {
    const listOfCafe = await coffeeplaces.findAll({include: [Favourite] })
    const favouriteCafes = await Favourite.findAll({ where: { UserId: req.user.id } })
    res.json({ listOfCafe: listOfCafe, favouriteCafes: favouriteCafes });
});

router.get('/byId/:id', async (req, res) => {
    const id = req.params.id
    const cafe = await coffeeplaces.findByPk(id)
    res.json(cafe)
})

// router.put()

module.exports = router