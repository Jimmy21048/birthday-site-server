const express = require('express');
const connection = require('../config');
const router = express.Router();
const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');

router.post('/', (req, res) => {
    const data = req.body;
    const message = {};
    
    const query = "SELECT username, pwd FROM bdayUsers WHERE username = ?;";
    const values = [data.username];

    connection.query(query, values, async (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json("Could not complete operation");
        }

        //check if username exists
        if(result.length === 0) {
            message.loginError = "incorrect username or password!";
            return res.json(message);
        }

        const matchPassword = await bcrypt.compare(data.password, result[0].pwd);

        //check password correctness
        if(!matchPassword) {
            message.loginError = "incorrect username or password!";
            return res.json(message);
        }

        //generate access token
        const accessToken = sign({username: result[0].username}, "myUserName", {expiresIn: 1800});
        message.loginSuccess = accessToken;
        return res.json(message);
    })
})

module.exports = router;
