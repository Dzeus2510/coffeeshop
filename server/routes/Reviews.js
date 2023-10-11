const express = require('express');
const router = express.Router();
const { Review } = require("../models");
const { validateToken} = require('../middleware/AuthMiddleware')

router.get('/:cafeId', async (req,res) => {
    const cafeId = req.params.cafeId
    const reviews = await Review.findAll({where: {coffeeplaceId: cafeId}})
    res.json(reviews)
})
//get postId from frontend param, then find all comments that have the same postId to show 

router.post("/", validateToken, async(req, res) => {
    const review = req.body
    const username = req.user.username
    review.username = username
    await Review.create(review)
    res.json(review)
})
//Post a comment

router.delete("/:reviewId", validateToken, async(req,res) => {
    const reviewId = req.params.reviewId

    await Review.destroy({where: {
        id: reviewId
    }})
    res.json("deleted")
})
//Find the comment with the commentId, then delete it from the database


module.exports = router