var express = require('express');
var router = express.Router();

const statics = __dirname.replace("routes", "public")
router.use(express.static(statics))

router.get('/help', function(req, res, next) {
    res.render('help', { title: 'Help Page' });
});
router.get('/register', function(req, res, next) {
    res.render('register');
});

module.exports = router;
