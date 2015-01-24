var
    express = require('express'),
    router = express.Router(),
    monk = require('monk'),
    db = monk('localhost/webabc');

/* GET home page. */
router.get('/tunes', function(req, res) {

    var collection = db.get("tunes");

    collection.find({
        'metadata.public': true
    }, "_id name settings metadata", function(e, docs) {
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

router.post('/tunes/publish', function(req, res) {
    //only the owner can publish a tune
   res.send(req.body.tuneId);
   db.get("tunes").updateById(req.body.tuneId, {
        $set: {public: true}
   });
});

router.get('/user', function(req, res) {
    if (req.user === undefined) res.send("");
    res.type('json');
    res.send(req.user);
});

router.get('/user/tunes', function(req, res) {
    if (req.user === undefined) res.send("");
    res.type('json');
    var collection = db.get("tunes");

    collection.find({
        owner: req.user.googleId
    },
    function(e, docs) {
        res.json(docs);
    });
});



module.exports = router;