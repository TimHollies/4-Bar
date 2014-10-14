var monk = require("monk"),
    Q = require("q");

var exports = {};

exports.addTune = function(tuneName) {
    
    var db = monk('localhost/webabc');
    
    var tunes = db.get("tunes");
    tunes.insert({name: tuneName});

    db.close();
}

exports.addUser = function(user) {
    
    var db = monk('localhost/webabc');
    
    var users = db.get("userData");
    var newUser = users.insert(user);

    db.close();
    return newUser;
}

exports.getUser = function(identifier) {
    
    var deferred = Q.defer();

    var db = monk('localhost/webabc');
    db.get("userData").findOne({identifier : identifier}, function(err, data) {
        deferred.resolve(data);
        db.close();
    });    

    return deferred.promise;
}

exports.getTunes = function(res) {	
    var db = monk('localhost/webabc');
    
    var tunes = db.get("tunes");
    tunes.find({},{limit:20},function(e,docs){
    	res.json(docs);
    	db.close();
  });

    
}

exports.drop = function() {
	var db = monk('localhost/webabc');
	db.get("tunes").drop();
    db.get("userData").drop();
	db.close();
}

module.exports = exports;
