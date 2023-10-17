const express = require('express');
const router = express.Router();
const { User } = require("../models");
const bcrypt = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middleware/AuthMiddleware')
const { Op } = require("sequelize")

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

    res.json(basicInfo)
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