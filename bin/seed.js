#!/usr/bin/env node

var databaseSetup = require('../data/database');
var q = require('q');

databaseSetup.drop();

["Tam Lin", "Catharsis", "Shards of Foula", "Kitchen Girl", "Woo"].forEach(databaseSetup.addTune);

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