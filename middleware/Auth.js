const { verify } = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    const accessToken = req.header("accessToken");
    const message = {};


    if(!accessToken) {
        message.userError = "Ooops! not logged in";
        return res.json(message);
    }

    try {
        const validToken = verify(accessToken, "myUserName");
        req.user = validToken.username;
        if(validToken) {
            next();
        } else {
            message.tokenError = "Ooops! Not logged in";
            return res.json(message);
        }
    }catch(e) {
        console.log(e);
        message.validationError = e;
        return res.json(message);
    }
}

module.exports = { validateToken }