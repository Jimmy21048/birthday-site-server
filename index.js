const express = require('express');
const cors = require('cors');
const connection = require('./config');

const app = express();

app.use(cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

connection.connect((err) => {
    if(err) {
        console.log(" DB Connection failed " + err);
        return;
    }
    console.log("DB up and running ... server?");
    app.listen( process.env.SERVER_PORT, (err) => {
        console.log("Server is up and running ... everything good");
    })
})

