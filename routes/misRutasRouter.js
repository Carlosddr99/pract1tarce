var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");

var serviceAccount = require("../webrtc-5b40d-firebase-adminsdk-lbjx6-54fb1282a2.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://webrtc-5b40d-default-rtdb.firebaseio.com"
});


const db = admin.database();


const statics = __dirname.replace("routes", "public")
router.use(express.static(statics))

router.get('/help', function(req, res, next) {
    res.render('help', { title: 'Help Page' });
});
router.get('/register', function(req, res, next) {
    res.render('register');
});
router.get('/mensajes', function(req, res, next) {
    res.render('mensajes');
});

router.get('/getMensajes', async function(req, res){
    const dbMensajes = db.ref('mensajes');
    dbMensajes.once('value').
    then((data)=>res.send({mensajes:data.val()}))
})

router.post('/addMensaje',  function(req, res){
    const dbMensajes = db.ref('mensajes');
    dbMensajes.push(req.body)
    .then((response)=>{
        res.send({mensaje: "Correcto"})
    })
    .catch((error)=>{
        console.log("Error:" + error)
        res.send({mensaje: "Incorrecto"})
    })
    
})


module.exports = router;
