var
    express = require('express'),
    router = express.Router(),
    monk = require('monk'),
    db = monk('localhost/webabc');

/* GET home page. */
router.get('/tunes', function(req, res) {

    var collection = db.get("tunes");

    collection.find({}, {
        limit: 20
    }, function(e, docs) {
        res.json(docs);
    })

});



router.get('/tune/:id', function(req, res) {
    var collection = db.get("tunes");
    collection.findById(req.params.id,
        function(e, docs) {
            res.json(docs);
        });
});

router.post('/tunes/add', function(req, res) {
   res.send(req.body.tune);
});

router.get('/user', function(req, res) {
    if (req.user === undefined) res.send("");
    res.type('json');
    res.send(req.user);
});

router.get('/user/tunes', function(req, res) {
    if (req.user === undefined) res.send("");
    res.type('json');
    res.send(req.user);
});



module.exports = router;