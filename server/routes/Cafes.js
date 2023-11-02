const express = require("express")
const router = express.Router()
const { coffeeplaces, Favourite } = require("../models")
const { Op } = require("sequelize")
const { validateToken } = require("../middleware/AuthMiddleware")

router.get("/", validateToken, async (req, res) => {
    console.log("---------------BEGIN SEARCH--------------")
    console.log(req.query)
    console.log("---------------------------------------")

    const listOfCafe = await coffeeplaces.findAll({
        include: [{
            model: Favourite,
            where: { UserId: req.user.id },
            required: false
        }],
        //include the favourite, not required, work like a left join
        where: {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: '%' + req.query.searchword + '%'
                    }
                }, {
                    address: {
                        [Op.like]: '%' + req.query.searchword + '%'
                    }
                }
            ]
        },
        //where name or adress have %name%
        order: [[Favourite, 'UserId', 'DESC']],
        //order by favourite to push all user favourite to the top
        limit: 12, offset: (req.query.page - 1) * 12,
        //paginator: 5 coffee per page
        subQuery: false
    });
    //subquery false to let the query to run following the order
    const favouriteCafes = await Favourite.findAll({ where: { UserId: req.user.id } })

    const countOfResult = await coffeeplaces.count({
        include: [{ model: Favourite, where: { UserId: req.user.id }, required: false }],
        where: {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: '%' + req.query.searchword + '%'
                    }
                }, {
                    address: {
                        [Op.like]: '%' + req.query.searchword + '%'
                    }
                }
            ]
        }
    });
    //count all coffee places
    console.log("----------------------------------------")
    const maxPage = Math.ceil(countOfResult / 12);
    //set maxPage as count / 5
    console.log(req.query.searchword)
    console.log(req.query.page)
    console.log(countOfResult)
    console.log(maxPage)
    console.log("------------------END-----------------")
    res.json({ listOfCafe: listOfCafe, maxPage: maxPage, favouriteCafes: favouriteCafes })
});

router.get("/favourite", validateToken, async (req, res) => {
    const page = req.query.page
    const searchword = req.query.searchword || ''

    const listOfCafe = await coffeeplaces.findAll({
        include: [{
            model: Favourite,
            where: { UserId: req.user.id },
            required: true
        }],
        //get all user's favourite cafe
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
        limit: 12, offset: (page - 1) * 12,
        subQuery: false
    });
    //search function, paginator, etc
    const favouriteCafes = await Favourite.findAll({ where: { UserId: req.user.id } })
    //set favouriteCafes as all favourite of user

    const countOfResult = await coffeeplaces.count({
        include: [{ model: Favourite, where: { UserId: req.user.id }, required: true }],
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
        }
    });
    //count all coffeeplace of users favourite then / 5 to find max pages

    const maxPage = Math.ceil(countOfResult / 12);
    console.log(req.query.searchword)
    console.log(searchword)
    console.log(req.query.page)
    console.log(countOfResult)
    console.log(maxPage)
    console.log("---------------END--------------")
    res.json({ listOfCafe: listOfCafe, maxPage: maxPage, favouriteCafes: favouriteCafes })
});

router.get('/byId/:id', validateToken, async (req, res) => {
    const id = req.params.id
    const cafe = await coffeeplaces.findByPk(id, { include: [{ model: Favourite, where: { UserId: req.user.id }, required: false }] })
    console.log(cafe.Favourites.length)
    res.json(cafe)
})

router.post('/claimcoffee/:id', validateToken, async (req, res) => {
    const id = req.params.id
    const cafe = await coffeeplaces.findByPk(id)
    await cafe.update({ UserId: req.user.id })
    console.log("claimed the coffee shop ")
})

router.post('/createcoffee', validateToken, async (req, res) => {
    var { name, address, category, phone, website, image } = req.body;
    console.log(category)
    console.log(req.body)
    const phonenum = (phone == "" ? "No Phone": phone)
    const coffeewebsite = (website == "" ? "No Website": website)
    const coffeeimage = (image == "" ? "No Img xD": image)
    
    const stars = "No Stars"
    const review = "No Reviews"

    const checkExistPlace = await coffeeplaces.count({
        where: {
            address: address
        }
    });
    console.log(checkExistPlace)
    if (checkExistPlace === 0) {
        try {
            coffeeplaces.create({
                name: name,
                address: address,
                cat: category,
                phone: phonenum,
                website: coffeewebsite,
                stars: stars,
                review: review,
                image: coffeeimage,
                UserId: req.user.id,
            })
            res.json("Success")
            console.log("created")
        } catch (err) {
            res.json(err)
            console.log(err)
        }
    }
    else {
        res.json("This Place is already Taken")
        console.log("wtf")
    }
})

module.exports = router