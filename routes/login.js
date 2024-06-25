const express = require('express');
const connection = require('../config');
const router = express.Router();

router.post('/', (req, res) => {
    const data = req.body;

    //check if username exists
    const query = "SELECT username, pwd FROM users WHERE username = ?;";
    const values = [data.username];

    connection.query(query, values, async (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json("Could not complete operation");
        }
        console.log(result);
    })
})

module.exports = router;