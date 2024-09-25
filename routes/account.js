const express = require('express');
const connection = require('../config');
const router = express.Router();
const { validateToken } = require('../middleware/Auth');
const path = require('path');
const admin = require('firebase-admin');
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

router.post('/my', validateToken, (req, res) => {
  console.log(req.body)
  const query = "SELECT r_image from recipients WHERE r_id = ?";
  const values =  [req.body.id];

  connection.query(query, values, (err, result) => {
      if(err) {
          console.log(err);
          return res.json("Could not complete operation");
      }

      if(result[0].length > 5) {
            const deleteImage = async (imagePath) => {
                  try {
                      await bucket.file(imagePath).delete();
                      console.log("Successfully deleted image");
                  } catch (error) {
                      console.error("Failed to delete image");
                  }
            }

            deleteImage(result[0].r_image);
      }
      const query1 = "DELETE FROM recipients WHERE r_id = ?;";
      const values1 = [req.body.id];
  
      connection.query(query1, values1, (err) => {
          if(err) {
              console.log(err);
              return res.json("Could not delete Item");
          }
  
          return res.json({success: "delete success"});
      })
  })

})
module.exports = router;
