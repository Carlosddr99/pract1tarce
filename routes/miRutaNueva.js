var express = require('express');
var router = express.Router();

const statics = __dirname.replace("routes", "public")
router.use(express.static(statics))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});


module.exports = router;
