const express = require('express');
const router = express.Router();
const { Favourite } = require("../models");
const { validateToken} = require("../middleware/AuthMiddleware")

router.post("/", validateToken, async(req, res) => {
    const {CafeId} = req.body;
    const UserId = req.user.id

    const found = await Like.findOne({
        where:{CafeId: CafeId,  UserId: UserId   }
    }) 
    //const found, to check in the Likes database, does it have any with the same PostId and UserId
    if (!found){
        await Favourite.create({CafeId: CafeId, UserId: UserId })
        res.json({fav: true})
        //if there are none, the post action will "like", create a new Like in the database with the postId and userId
        //return the liked to true
    } else {
        await Favourite.destroy({
            where:{CafeId: CafeId,  UserId: UserId   }
        })
        res.json({fav: false})
        //if there is a Like in the database, the post action will "dislike", delete the Like from the database 
        //return the liked to false
    }

    

})

module.exports = router