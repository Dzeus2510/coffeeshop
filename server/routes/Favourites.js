const express = require('express');
const router = express.Router();
const { Favourite } = require("../models");
const { validateToken} = require("../middleware/AuthMiddleware")

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