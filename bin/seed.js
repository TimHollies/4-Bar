#!/usr/bin/env node

var 
  databaseSetup = require('../data/database'),
  q = require('q'),
  moment = require('moment');

databaseSetup.drop();

var p = true;

["Tam Lin", "Catharsis", "Shards of Foula", "Kitchen Girl", "Woo", "Meh"].forEach(function(tuneName) {
  databaseSetup.action(function(db) {
    var tunes = db.get("tunes");
    tunes.insert({
      name: tuneName,
      owner: "108345118415232097428",
      createdOn: moment().format('DD/MM/YYYY'),
      lastEdited: moment().format('DD/MM/YYYY'),
      metadata: {
        type: "Reel",
        key: "Gm"
      },
      public: p,
      data: "X: 1\nT: Farewell To Chernobyl\nR: reel\nM: 4/4\nL: 1/8\nK: Dmin\nD3F ADFA|DFAF GFED|A,3C EA,CE|A,CEC c=BAF|\nD3F ADFA|DFAF FGA=B|c2Gc EcGe|fedc d3c:|\n|d2fd gdfd|d2fd gfec|d2fd gdfd|e2ef edcA|\nd2fd gdfd|d2fd gfeg|a4 afef|e2ef edcA|\nd2fd gdfd|d2fd efec|d2fd gdfd|e2ef edcA|\nAdfd Adfd|Bdfd Bdfd|cege agfe|fedc dBAF||"
    });
  });
  p = !p;
});

//var regex = /T: *[^\n]*/;
/*
var http = require('http');

function getABCTune(id) {
    var deferred = q.defer();
    http.get('http://thesession.org/tunes/' + id + '/abc/', function(res) {

    var body = "";

      res.on('data', function(d) {
        body += d;
      });

      res.on('end', function() {
        console.log(body);
        deferred.resolve(body);
      });

    }).on('error', function(e) {
      console.error("Failed to load tune");
    });
    return deferred.promise;
}

for(var i=0; i<10; i++) {
    getABCTune(i)
    .then(function(data) {
        console.log(data);
    });
}*/

console.log("Database Seeded");
return 0;