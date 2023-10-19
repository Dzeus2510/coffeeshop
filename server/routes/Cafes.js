const express = require("express")
const router = express.Router()
const { coffeeplaces, Favourite } = require("../models")
const { Op } = require("sequelize")
const { validateToken} = require("../middleware/AuthMiddleware")

router.get("/", validateToken, async (req, res) => {
    const page = req.query.page
    const searchword = req.query.searchword
    console.log(req.query)
    console.log("---------------BEGIN SEARCH--------------")
    console.log(req.query.searchword)
    console.log(searchword)
    console.log(req.query.page)

    const listOfCafe = await coffeeplaces.findAll({
        include: [{
            model: Favourite,
            where: {UserId: req.user.id},
            required: false
            }],
        where: {
                [Op.or]: [
                {
                    name: {
                        [Op.like]: '%' + searchword + '%'
                    }
                }, {
                    address: {
                        [Op.like]: '%' + searchword + '%'
                    }
                }
            ]
        },
        order: [[Favourite, 'UserId', 'DESC']],
        limit: 5, offset: (page - 1) * 5,
        subQuery: false});
    const favouriteCafes = await Favourite.findAll({ where: { UserId: req.user.id} })
    // res.json({ listOfCafe: listOfCafe, favouriteCafes: favouriteCafes });
    // console.log(listOfCafe)
    
    const countOfResult = await coffeeplaces.count({ include: [{model: Favourite, where: {UserId: req.user.id}, required: false}],
        where: {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: '%' + searchword + '%'
                    }
                }, {
                    address: {
                        [Op.like]: '%' + searchword + '%'
                    }
                }
            ]
        }});
    console.log("---------------ENDED SEARCH--------------")
    const maxPage =  Math.ceil(countOfResult / 5);
    console.log(req.query.searchword)
    console.log(searchword)
    console.log(req.query.page)
    console.log(countOfResult)
    console.log(maxPage)
    console.log("---------------END--------------")
    res.json({ listOfCafe: listOfCafe, maxPage: maxPage, favouriteCafes: favouriteCafes})
});

router.get("/favourite", validateToken, async (req, res) => {
    const page = req.query.page
    const searchword = req.query.searchword || ''

    const listOfCafe = await coffeeplaces.findAll({
        include: [{
            model: Favourite,
            where: {UserId: req.user.id},
            required: true
            }],
        where: {
                [Op.or]: [
                {
                    name: {
                        [Op.like]: '%' + searchword + '%'
                    }
                }, {
                    address: {
                        [Op.like]: '%' + searchword + '%'
                    }
                }
            ]
        },
        order: [[Favourite, 'UserId', 'DESC']],
        limit: 5, offset: (page - 1) * 5,
        subQuery: false});
    const favouriteCafes = await Favourite.findAll({ where: { UserId: req.user.id} })
    // res.json({ listOfCafe: listOfCafe, favouriteCafes: favouriteCafes });
    // console.log(listOfCafe)
    
    const countOfResult = await coffeeplaces.count({ include: [{model: Favourite, where: {UserId: req.user.id}, required: true}],
        where: {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: '%' + searchword + '%'
                    }
                }, {
                    address: {
                        [Op.like]: '%' + searchword + '%'
                    }
                }
            ]
        }});

    const maxPage =  Math.ceil(countOfResult / 5);
    console.log(req.query.searchword)
    console.log(searchword)
    console.log(req.query.page)
    console.log(countOfResult)
    console.log(maxPage)
    console.log("---------------END--------------")
    res.json({ listOfCafe: listOfCafe, maxPage: maxPage, favouriteCafes: favouriteCafes})
});

router.get('/byId/:id', validateToken, async (req, res) => {
    const id = req.params.id
    const cafe = await coffeeplaces.findByPk(id, {include:[{model: Favourite, where: {UserId: req.user.id}, required: false}]})
    console.log(cafe.Favourites.length)
    res.json(cafe)
})

// router.put()

module.exports = router