const express = require("express")
const router = express.Router()
const { Shop, Favourite } = require("../models")

router.get("/", async (req, res) => {
    const listOfShops = await Shop.findAll({include: [Favourite] })
    const likedShops = await Favourite.findAll({ where: { UserId: req.user.id } })
    res.json({ listOfShops: listOfShops, likedShops: likedShops });
});

router.get('/byId/:id', async (req, res) => {
    const id = req.params.id
    const shop = await Shop.findByPk(id)
    res.json(shop)
})

router.put()

module.exports = router