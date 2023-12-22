const express = require('express');
const router = express.Router();
const { User, coffeeplaces } = require("../models");
const bcrypt = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middleware/AuthMiddleware')
const { Op } = require("sequelize")

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - password
 *       properties:
 *         id:
 *           type: int
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The name of the user
 *         password:
 *           type: string
 *           description: The password of the user (hashed)
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the account was added
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the account was updated
 *       example:
 *         id: 1
 *         username: vudn
 *         password: '$2a$10$ANbjYjZw84gKPxQ7Tp8G0.uSzJ9fWPc0lEnk03aOCeJYR99hSkVpi'
 *         createdAt: '2023-10-11 03:52:36'
 *         updatedAt: '2023-10-11 03:52:36'
 */

router.post("/", async (req, res) => {
    const { username, password } = req.body;
    const checkExistAccount = await User.count({where: {
                username: username
    }});
    console.log(checkExistAccount)
    if (checkExistAccount === 0){
        bcrypt.hash(password, 10).then((hash) => {
            User.create({
                username: username,
                password: hash,
            })
            res.json("Success")
        })
    }
    else{
        res.json("Failed")
    }
});
//Registration, create a new account, then return json "Success"

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username: username } });

    if (!user) res.json({ error: "User doesnt exist" });
    else {
        bcrypt.compare(password, user.password).then((match) => {
            if (!match) res.json({ error: "Wrong username or password (or both)" });
            else {
                const accessToken = sign({ username: user.username, id: user.id }, "important")
                res.json({ token: accessToken, username: user.username, id: user.id })
            }
        });
    }
})
//Login, find the user with the same username in database, change the input password to hash, then compare the hash'ed password with the hash in database to check if the user input correct password

router.get('/auth', validateToken, async (res, req) => {
    req.json(res.user)
})
//get validateToken to check if the user is logged in

router.get("/basicinfo/:id", async (req, res) => {
    const id = req.params.id

    const basicInfo = await User.findByPk(id, { attributes: { exclude: ["password", "updatedAt"] } })

    const listOfCafe = await coffeeplaces.findAll({
        include: [
        {
            model: User,
        },],
        where: {
            UserId: id,
        },
        //where name or adress have %name%
        order: [[ 'UserId', 'DESC']],
        //order by favourite to push all user favourite to the top
        subQuery: false})

    res.json({ listOfCafe: listOfCafe, basicInfo: basicInfo})
})
//get user info based on their id, exluding the password and updatedAt

router.put('/changepassword', validateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findOne({ where: { username: req.user.username } });

    bcrypt.compare(oldPassword, user.password).then((match) => {
        if (!match){ res.json({ error: "Wrong Old Password" });}
        else {
            bcrypt.hash(newPassword, 10).then((hash) => {
                User.update({ password: hash }, { where: { username: req.user.username } })
                res.json("Success Changed password")
            })
        }
    });
})
//Change password, compare user input password to current password in database, if they match, continue to update the password

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 * /auth/:
 *   post:
 *     summary: create account
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username
 *       - in: path
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: The password
 *     responses:
 *       200:
 *         description: The users managing API
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cafe'
 * /auth/login:
 *   post:
 *     summary: login
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username
 *       - in: path
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: The password
 *     responses:
 *       200:
 *         description: The users managing API
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cafe'
 * /auth/basicinfo/{id}:
 *   get:
 *     summary: check user info
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's id
 *     responses:
 *       200:
 *         description: The users managing API
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cafe'
 * /auth/changepassword:
 *   put:
 *     summary: change password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username
 *       - in: path
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: The password
 *     responses:
 *       200:
 *         description: The users managing API
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cafe'
 */