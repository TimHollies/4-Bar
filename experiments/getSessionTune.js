/*var
    q = require('q'),
    http = require('http');

var express = require('express'),
  jsdom = require('jsdom-nogyp'),
  request = require('request'),
  url = require('url');

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

module.exports = getABCTune;*/

var request = require('request');

var getTitle = / *T: *([\w ']*) */;

for(var i=1; i<20; i++) {
  request('http://thesession.org/tunes/' + i + '/abc/1', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var tune = body.trim();

      var title = getTitle.exec(tune)[1];

      console.log(title);

      //console.log() // Print the google web page.
    }
  })
}