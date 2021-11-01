const functions = require("firebase-functions");
const admin = require("firebase-admin")
const serviceAccount = require("./config-species-firebase.json")
const cors = require('cors')
const express = require('express')
require("firebase-functions/lib/logger/compat");

const app = express()

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore()
const corsOptions = {
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
};

app.use(cors())

app.get('/', cors(corsOptions), async (req,res) => {
  try {
    const lugar = req.query.lugar
    if(lugar){
      const query = db.collection("Locs").doc(lugar)
      const doc = await query.get()
      const lugarInfo = doc.data()
      return res.status(200).json(JSON.stringify(lugarInfo))
    } else {
      const querySnapshot = db.collection("Locs").orderBy('count', 'desc').limit(20)
      const allDoc = await querySnapshot.get()
      const lugarInfoArr = allDoc.docs.map(doc => ({
        lugar: doc.id,
        count: doc.data().count
      }))
      console.log(lugarInfoArr)
      return res.status(200).json(JSON.stringify(lugarInfoArr))
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

app.post('/', cors(corsOptions), async (req,res) => {
  //try {
  const species = req.body.species
  if(species){
    //const allSpData = []
    const refs = species.map(id => db.collection("Species").doc(`${id}`))
    const users = await db.getAll(...refs)
    const dataResp = users.map(doc => doc.data())
    /*
    for(let spName of species){
      const doc = await db.collection("Species").doc(spName).get()
      const spData = doc.data()
      if(spData && spData !== null){
        allSpData.push(spData)
      }
    }
    */
    return res.status(200).json(JSON.stringify(dataResp))
  }
  /*
  } catch (error) {
    return res.status(500).send(error)
  }
  */
})

app.post('/random', cors(corsOptions), async (req,res) => {
  //try {
  const strings = req.body.strings
  try{
    if(strings && strings.length){
      console.log("strings: ", strings)
      const data = []
      for(const string of strings){
        const querySnapshot = db.collection("Species")
          .where("scientific_name", ">=" ,string)
          .orderBy("scientific_name")
          .limit(1)
        const allDoc = await querySnapshot.get()
        const lugarInfoArr = allDoc.docs.map(doc => doc)
        console.log()
        data.push(lugarInfoArr[0])
      }
      //return res.status(200).json(JSON.stringify( await db.get(refs[0]))) NO FUNCIONA
      console.log("data: ",data)
      //const speciesData = await db.getAll(...refs)
      //console.log("speciesData: ",speciesData)
      const dataResp = data.map(doc => doc.data())
      console.log("dataResp: ",dataResp)
      console.log("dataResp STRING: ",JSON.stringify(dataResp))
      return res.status(200).json(JSON.stringify(dataResp))
    }
    return res.status(200).json(JSON.stringify("STRINGS VACIO"))
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
})

exports.app = functions.https.onRequest(app)
