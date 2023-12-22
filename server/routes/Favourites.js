const express = require('express');
const router = express.Router();
const { Favourite } = require("../models");
const { validateToken} = require("../middleware/AuthMiddleware")

/**
 * @swagger
 * components:
 *   schemas:
 *     Favourite:
 *       type: object
 *       required:
 *         - id
 *         - coffeeplaceId
 *         - UserId
 *       properties:
 *         id:
 *           type: int
 *           description: The auto-generated id of the favourite
 *         coffeeplaceId:
 *           type: string
 *           description: The id of the favourited cafe
 *         UserId:
 *           type: string
 *           description: The id of the user
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the favourite was added
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the favourite was updated
 *       example:
 *         id: 70
 *         coffeeplaceId: 76
 *         UserId: 2
 *         createdAt: '2023-10-17 07:58:55'
 *         updatedAt: '2023-10-17 07:58:55'
 */

router.post("/", validateToken, async(req, res) => {
    const {CafeId} = req.body;
    const UserId = req.user.id

    const found = await Favourite.findOne({
        where:{coffeeplaceId: CafeId,  UserId: UserId   }
    })
    //const found, to check in the Favs database, does it have any with the same Coffeeshopid and UserId
    if (!found){
        await Favourite.create({coffeeplaceId: CafeId, UserId: UserId })
        res.json({fav: true})
        //if there are none, the post action will "fav", create a new Fav in the database with the Coffeeshopid and userId
        //return the faved to true
    } else {
        await Favourite.destroy({
            where:{coffeeplaceId: CafeId,  UserId: UserId   }
        })
        res.json({fav: false})
        //if there is a Fav in the database, the post action will "disfav", delete the Fav from the database 
        //return the faved to false
    }
    
})

router.post("/cafe", validateToken, async(req, res) => {
    console.log(req.body.coffeeplaceId)
    const CafeId = req.body.coffeeplaceId
    const UserId = req.user.id

    const found = await Favourite.findOne({
        where:{coffeeplaceId: CafeId,  UserId: UserId   }
    })
    //const found, to check in the Favs database, does it have any with the same Coffeeshopid and UserId
    if (!found){
        await Favourite.create({coffeeplaceId: CafeId, UserId: UserId })
        res.json({fav: true})
        //if there are none, the post action will "fav", create a new Fav in the database with the Coffeeshopid and userId
        //return the faved to true
    } else {
        await Favourite.destroy({
            where:{coffeeplaceId: CafeId,  UserId: UserId   }
        })
        res.json({fav: false})
        //if there is a Fav in the database, the post action will "disfav", delete the Fav from the database 
        //return the faved to false
    }
    
})

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Favourites
 *   description: The favourites managing API
 * /cafes/favourite:
 *   get:
 *     summary: Favourite/Disfavourite the cafes
 *     tags: [Favourites]
 *     responses:
 *       200:
 *         description: The favourites managing API
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cafe'
 * /cafes/favourite?page=&searchword=:
 *   get:
 *     summary: Lists all the cafes favourited by the user
 *     tags: [Favourites]
 *     responses:
 *       200:
 *         description: The list of the cafes favourited by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cafe'
 */