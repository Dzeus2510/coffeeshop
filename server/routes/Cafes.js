const express = require("express")
const router = express.Router()
const { sequelize, coffeeplaces, Favourite } = require("../models")

router.get("/", async (req, res) => {
    const page = req.query.page
    const listOfCafe = await coffeeplaces.findAll({include: [Favourite], limit: 5, offset: (page-1)*5 })
    // console.log(req.user)
    // const favouriteCafes = await Favourite.findAll({ where: { UserId: req.user.id} })
    // res.json({ listOfCafe: listOfCafe, favouriteCafes: favouriteCafes });
    // console.log(listOfCafe)
    console.log(req.query.page)
    res.json({listOfCafe: listOfCafe})
});

router.post("/", async (req, res) => {
    const searchword = req.body
    console.log(searchword)
    const listOfSearchedCafe = await coffeeplaces.findAll({where: {[Op.substring]: [searchword]}})
    res.json({listOfSearchedCafe: listOfSearchedCafe})
})

router.get('/byId/:id', async (req, res) => {
    const id = req.params.id
    const cafe = await coffeeplaces.findByPk(id)
    res.json(cafe)
})

// router.put()

module.exports = router