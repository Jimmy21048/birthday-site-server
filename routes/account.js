const express = require('express');
const connection = require('../config');
const router = express.Router();
const { validateToken } = require('../middleware/Auth');
const path = require('path');
require('dotenv').config();

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})
const upload = multer({storage: storage});

// firebase
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.PROJECT_ID,
      privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.CLIENT_EMAIL
    }),
    storageBucket: process.env.STORAGE_BUCKET
  });
  
  const bucket = admin.storage().bucket();
// firebase

router.post('/', validateToken, upload.single('recipientImage'), (req, res) => {
    
    const data = req.body;
    const filePath = path.join(path.resolve(__dirname, '..'), req.file.path);
    const imagePath = `images/${req.file.originalname}`


    const query = "INSERT INTO recipients (r_name, date_of_birth, open_date, gifts, r_image, message, username) VALUES (?,?,?,?,?,?,?);";
    const values = [data.recipientName, data.birthDate, data.openDate, data.enableGift, imagePath, data.bdayMessage, req.user];
    connection.query(query, values, async (err) => {
      if(err) {
        console.log(err);
        return res.json({error: "Could not complete operation"});
      }
      console.log("success");
      try {
        await bucket.upload(filePath, {
          destination: `images/${req.file.originalname}`, // Path in Firebase Storage
          metadata: {
            contentType: req.file.mimetype
          }
        });
    
        res.send('File uploaded to Firebase Storage successfully.');
      } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file.');
    }
    })
})


router.get('/', validateToken, (req, res) => {
    const data = req.user;
    const query = "SELECT username FROM users WHERE username = ?;";
    const values = [data];
    connection.query(query, values, (err, results) => {
        if(err) {
            console.log(err);
            return res.json({error: "Could not complete operation"});
        }
        if(results.length === 0) {
            console.log("User could not be found");
            return res.json({error: "Error fetching the results"});
        }

        return res.json(results[0]);
    })
})
module.exports = router;