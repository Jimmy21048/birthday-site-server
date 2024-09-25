const express = require('express');
const connection = require('../config');
const router = express.Router();
const { validateToken } = require('../middleware/Auth');

router.post('/', (req, res) => {
    const data = req.body.id;

    const query = "SELECT r_id, r_name, event_type, date_of_birth, open_date, r_image, message, username, recipientId FROM recipients WHERE recipientId = ?;";
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

router.get('/my', validateToken, (req, res) => {
    const user = req.user;
    const query = "SELECT r_id, r_name, event_type, open_date, recipientId, r_response FROM recipients WHERE username = ?;";
    const values = [user];

    connection.query(query, values, (err, results) => {
        if(err) {
            console.log(err);
            return res.json("Could not fetch data");
        }

        return res.json(results);
    })
})

router.post('/feedback', (req, res) => {
    const data = req.body;
    const query = "UPDATE recipients SET r_response = ? WHERE r_id = ?;";
    const values = [data.userResponse, data.id];

    connection.query(query, values, (err) => {
        if(err) {
            console.log(err);
            return res.json("Could not send message");
        }
        return res.json("Feedback Sent");
    })
})

module.exports = router;