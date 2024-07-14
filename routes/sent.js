const express = require('express');
const connection = require('../config');
const router = express.Router();
const { validateToken } = require('../middleware/Auth');

router.post('/', (req, res) => {
    const data = req.body.id;

    const query = "SELECT r_name, event_type, date_of_birth, open_date, r_image, message, username, recipientId FROM recipients WHERE recipientId = ?;";
    const values = [data];

    connection.query(query, values, (err, result) => {
        if(err) {
            console.log(err);
            return res.send("Could not complete operation");
        }

        if(result.length < 1) {
            return res.json({error: "invalid recipient ID"});
        }

        return res.json({message: result});
    })
})

module.exports = router;