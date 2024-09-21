const express = require('express');
const cors = require('cors');
const connection = require('./config');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});


const app = express();

app.use(cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "accessToken"]
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));



// requests
const signupRequest = require('./routes/signup');
app.use('/signup', signupRequest);

const loginRequest = require('./routes/login');
app.use('/login', loginRequest);

const accountRequest = require('./routes/account');
app.use('/account', accountRequest);

const sentRequest = require('./routes/sent');
app.use('/sent', sentRequest);

// requests



connection.connect((err) => {
    if(err) {
        console.log(" DB Connection failed " + err);
        return;
    }
    console.log("DB up and running ... server?");
    app.listen( process.env.SERVER_PORT || 3000, (err) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log("Server is up and running ... everything good");
    })
})

