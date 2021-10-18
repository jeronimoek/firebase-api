const functions = require("firebase-functions");
const admin = require("firebase-admin")
const serviceAccount = require("./config-species-firebase.json")
//const cors = require('cors')
const express = require('express')

const app = express()

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore()

app.get('/', async (req,res) => {
  try {
    const lugar = req.query.lugar
    if(lugar){
      const query = db.collection("Locs").doc(lugar)
      const doc = await query.get()
      const lugarInfo = doc.data()
      return res.status(200).json(lugarInfo)
    } else {
      const querySnapshot = db.collection("Locs").orderBy('count', 'desc').limit(5)
      const allDoc = await querySnapshot.get()
      const lugarInfoArr = allDoc.docs.map(doc => ({
        lugar: doc.id,
        count: doc.data().count
      }))
      console.log(lugarInfoArr)
      return res.status(200).json(lugarInfoArr)
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

exports.app = functions.https.onRequest(app)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
