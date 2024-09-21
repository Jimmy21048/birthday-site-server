const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const connection = require('../config');

router.post('/', (req, res) => {
    const data = req.body;
    console.log(data);
    const signupMessage = {};

    const sendResponse = (message) => {
        return res.json(message);
    }
    if(data.username.length < 5) {
        signupMessage.usernameError = "Username must be 5 characters or more";
        return sendResponse(signupMessage);
    }

    if(data.password.length < 5) {
        signupMessage.passwordError = "Password must be 5 characters or more";
        return sendResponse(signupMessage);
    }

    //check if username is already registered
    const query = "SELECT username FROM bdayUsers WHERE username = ?;";
    const values = [data.username];

    connection.query(query, values, async ( err, results) => {
        if(err) {
            console.log(err);
            return sendResponse("Could not complete operation");
        }

        if(results.length > 0) {
            signupMessage.userExists = "Username already exists";
            return sendResponse(signupMessage);
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(data.password, 10);
        //insert user into database
        const query1 = "INSERT INTO bdayUsers (username, pwd) VALUES (?,?);";
        const values1 = [data.username, hashedPassword];

            connection.query(query1, values1, (err) => {
                if(err) {
                    console.log(err);
                    return sendResponse("Could not complete operation");
                }
                signupMessage.signupSuccess = "Signup successful, login";
                return sendResponse(signupMessage);                   
            })
            
    })

})

module.exports = router;
