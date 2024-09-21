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
    let imagePath = '';
    if(req.file) {
      const filePath = path.join(path.resolve(__dirname, '..'), req.file.path);
      imagePath = `images/${req.file.originalname}`

      const recipientId = data.recipientName + Date.now();

      const query = "INSERT INTO recipients (r_name, event_type, date_of_birth, open_date, r_image, message, username, recipientId) VALUES (?,?,?,?,?,?,?,?);";
      const values = [data.recipientName, data.eventType, data.birthDate, data.openDate, imagePath, data.bdayMessage, req.user, recipientId];
      connection.query(query, values, async (err) => {
        if(err) {
          console.log(err);
          return res.json({error: "Could not complete operation"});
        }
  
        res.json({success: recipientId});
        if(req.file) {
          try {
            await bucket.upload(filePath, {
              destination: `images/${req.file.originalname}`, // Path in Firebase Storage
              metadata: {
                contentType: req.file.mimetype
              }
            });
        
          } catch (error) {
            console.error('Error uploading file:', error);
            // res.status(500).send('Error uploading file.');
          }
        }
      })
    } else {
      const recipientId = data.recipientName + Date.now();

      const query = "INSERT INTO recipients (r_name, event_type, date_of_birth, open_date, r_image, message, username, recipientId) VALUES (?,?,?,?,?,?,?,?);";
      const values = [data.recipientName, data.eventType, data.birthDate, data.openDate, imagePath, data.bdayMessage, req.user, recipientId];
      connection.query(query, values, async (err) => {
        if(err) {
          console.log(err);
          return res.json({error: "Could not complete operation"});
        }
  
        res.json({success: recipientId});
        if(req.file) {
          try {
            await bucket.upload(filePath, {
              destination: `images/${req.file.originalname}`, // Path in Firebase Storage
              metadata: {
                contentType: req.file.mimetype
              }
            });
        
          } catch (error) {
            console.error('Error uploading file:', error);
            // res.status(500).send('Error uploading file.');
          }
        }
      })
    }
})


router.get('/', validateToken, (req, res) => {
    const data = req.user;
    const query = "SELECT username FROM bdayUsers WHERE username = ?;";
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
