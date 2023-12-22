const express = require("express")
const router = express.Router()
const { coffeeplaces, Favourite, User } = require("../models")
const { Op } = require("sequelize")
const { validateToken } = require("../middleware/AuthMiddleware")

/**
 * @swagger
 * components:
 *   schemas:
 *     Coffeeshop:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - id
 *       properties:
 *         id:
 *           type: int
 *           description: The auto-generated id of the cafe
 *         name:
 *           type: string
 *           description: The name of the cafe
 *         address:
 *           type: string
 *           description: The address of the cafe
 *         cat:
 *           type: string
 *           description: the category of the cafe
 *         phone:
 *           type: string
 *           description: cafe's contact phone number
 *         website:
 *           type: string
 *           description: cafe's website
 *         star:
 *           type: string
 *           description: cafe's average stars rating
 *         review:
 *           type: string
 *           description: number of cafe's reviews
 *         image:
 *           type: string
 *           description: The cafe's image url
 *         UserId:
 *           type: int
 *           description: The cafe's owner id
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the cafe was added
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the cafe was updated
 *       example:
 *         id: 21
 *         name: Coffee 37
 *         address: '37 Đ. Nguyễn Chí Thanh, Ngọc Khánh, Ba Đình, Hà Nội'
 *         cat: Coffee Shop
 *         phone: '0989 669 669'
 *         website: No Website
 *         stars: 3.7
 *         review: 13
 *         image: 'https://lh5.googleusercontent.com/p/AF1QipMhjhWutjqMtdIrY1G73wMwtcYeIkSyCfVL2hbj=w426-h240-k-no'
 *         UserId: 1
 *         createdAt: '2023-10-11 03:52:36'
 *         updatedAt: '2023-11-06 06:34:33'
 */

router.get("/", validateToken, async (req, res) => {
    console.log("---------------BEGIN SEARCH--------------")
    console.log(req.query)
    console.log("---------------------------------------")

    const listOfCafe = await coffeeplaces.findAll({
        include: [{
            model: Favourite,
            where: { UserId: req.user.id },
            required: false
        },
        {
            model: User,
            required: false
        },],
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
    const cafe = await coffeeplaces.findByPk(id, { include: [{ model: Favourite, where: { UserId: req.user.id }, required: false }, { model: User, required: false }] })
    console.log(cafe.Favourites.length)
    res.json(cafe)
})

router.post('/claimcoffee/:id', validateToken, async (req, res) => {
    const id = req.params.id
    const cafe = await coffeeplaces.findByPk(id)
    await cafe.update({ UserId: req.user.id })
    console.log("claimed the coffee shop ")
})

router.post('/disclaim/:id', validateToken, async (req, res) => {
    const id = req.params.id
    const cafe = await coffeeplaces.findByPk(id)
    await cafe.update({ UserId: null })
    console.log("disclaimed the coffee shop ")
})

router.post('/createcoffee', validateToken, async (req, res) => {
    var { name, address, category, phone, website, image } = req.body;
    console.log(category)
    console.log(req.body)
    const phonenum = (phone == "" ? "No Phone" : phone)
    const coffeewebsite = (website == "" ? "No Website" : website)
    const coffeeimage = (image == "" ? "No Img xD" : image)

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

/**
 * @swagger
 * tags:
 *   name: Cafes
 *   description: The cafes managing API
 * components:
 *   securitySchemes:
 *     apiKey:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 * /cafes/?page={page}&searchword={searchword}:
 *   get:
 *     summary: Lists all the cafes
 *     tags: [Cafes]
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: string
 *         required: false
 *         description: The page number
 *       - in: path
 *         name: searchword
 *         schema:
 *           type: string
 *         required: false
 *         description: The searchword
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: The list of the cafes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 * /cafes/favourite?page={page}&searchword={searchword}:
 *   get:
 *     summary: Lists all the cafes favourited by the user
 *     tags: [Cafes]
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: string
 *         required: true
 *         description: The page number
 *       - in: path
 *         name: searchword
 *         schema:
 *           type: string
 *         required: true
 *         description: The searchword
 *     responses:
 *       200:
 *         description: The list of the cafes favourited by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cafe'
 * /cafes/byId/{id}:
 *   get:
 *     summary: Get the cafe by id
 *     tags: [Cafes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The cafe id
 *     responses:
 *       200:
 *         description: The cafe response by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cafe'
 *       404:
 *         description: The cafe was not found
 * /cafes/claimcoffee/{id}:
 *   post:
 *    summary: Claim the cafe by the id
 *    tags: [Cafes]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The cafe id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Cafe'
 *    responses:
 *      200:
 *        description: The cafe was claimed
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Cafe'
 *      404:
 *        description: The cafe was not found
 *      500:
 *        description: Some error happened
 * /cafes/disclaimcoffee/{id}:
 *   post:
 *    summary: Disclaim the cafe by the id
 *    tags: [Cafes]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The cafe id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Cafe'
 *    responses:
 *      200:
 *        description: The cafe was disclaimed
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Cafe'
 *      404:
 *        description: The cafe was not found
 *      500:
 *        description: Some error happened
 * /cafes/create:
 *   post:
 *     summary: Create a new cafe
 *     tags: [Cafes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cafe'
 *     responses:
 *       200:
 *         description: The created cafe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cafe'
 *       500:
 *         description: Some server error
 */