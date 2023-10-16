const express = require("express")
const router = express.Router()
const { sequelize, coffeeplaces, Favourite } = require("../models")
const { Op } = require("sequelize")

router.get("/", async (req, res) => {
    const page = req.query.page
    const searchword = req.query.searchword || ''

    const listOfCafe = await coffeeplaces.findAll({ include: [Favourite],
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
        limit: 5, offset: (page - 1) * 5 });
    // console.log(req.user)
    // const favouriteCafes = await Favourite.findAll({ where: { UserId: req.user.id} })
    // res.json({ listOfCafe: listOfCafe, favouriteCafes: favouriteCafes });
    // console.log(listOfCafe)
    
    const countOfResult = await coffeeplaces.count({ include: [Favourite],
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
    console.log(req.query.page)
    console.log(countOfResult)
    console.log(maxPage)
    res.json({ listOfCafe: listOfCafe, maxPage: maxPage})
});

// router.get("/search/:searchword", async (req, res) => {
//     const searchword = req.params
//     console.log(searchword.searchword)
//     if(searchword.searchword !== null && searchword.searchword !== ""){
//         const listOfSearchedCafe = await coffeeplaces.findAll({
//             where: {
//                 [Op.or]: [
//                     {
//                         name: {
//                             [Op.like]: '%' + searchword.searchword + '%'
//                         }
//                     }, {
//                         address: {
//                             [Op.like]: '%' + searchword.searchword + '%'
//                         }
//                     }
//                 ]
//             }
//         })
//         res.json({ listOfSearchedCafe: listOfSearchedCafe })
//     }
//     else{
//         const listOfCafe = await coffeeplaces.findAll({ include: [Favourite]})
//         res.json({ listOfSearchedCafe: listOfCafe })
//     }
// })

router.get('/byId/:id', async (req, res) => {
    const id = req.params.id
    const cafe = await coffeeplaces.findByPk(id)
    res.json(cafe)
})

// router.put()

module.exports = router