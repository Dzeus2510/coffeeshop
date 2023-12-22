const express = require('express');
const router = express.Router();
const { Review } = require("../models");
const { validateToken} = require('../middleware/AuthMiddleware')

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - id
 *         - coffeeplaceId
 *         - UserId
 *         - reviewBody
 *       properties:
 *         id:
 *           type: int
 *           description: The auto-generated id of the review
 *         coffeeplaceId:
 *           type: string
 *           description: The id of the reviewed cafe
 *         UserId:
 *           type: string
 *           description: The id of the reviewer
 *         username:
 *           type: string
 *           description: The name of the reviewer
 *         reviewBody:
 *           type: string
 *           description: The content of the review
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the review was added
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the review was updated
 *       example:
 *         id: 7
 *         coffeeplaceId: 73
 *         UserId: 1
 *         username: vudn
 *         reviewBody: 'asad'
 *         createdAt: '2023-10-13 02:58:22'
 *         updatedAt: '2023-10-13 02:58:22'
 */

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

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: The reviews managing API
 * /reviews/{id}:
 *   get:
 *     summary: get the cafe's reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The cafe id
 *     responses:
 *       200:
 *         description: The reviews managing API
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cafe'
 *   post:
 *     summary: Lists all the cafes favourited by the user
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The review id
 *     responses:
 *       200:
 *         description: The list of the cafes favourited by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cafe'
 *   delete:
 *     summary: Lists all the cafes favourited by the user
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The review id
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