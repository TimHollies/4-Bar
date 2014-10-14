var express = require('express');
var router = express.Router();
var db = require('../data/database');

/* GET home page. */
router.get('/tunes', function(req, res) {
  res.type('json');
  db.getTunes(res);
  //res.send("hurray");
});

router.get('/user/current', function(req, res){
  if(req.user === undefined) res.send("");
  res.type('json');
  res.send(req.user);
});

module.exports = router;
