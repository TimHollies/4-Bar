var
    monk = require('monk'),
    db = monk('localhost/webabc'),
    Q = require('q'),
    moment = require('moment');

db.get("tunes").drop();

var p = true,
  tunesToAdd = 200;

var request = require('request');

var getTitle = / *T: *([\w ']*) */;

var addedTunes = 0;

var deferred = Q.defer();

for (var i = 1; i <= tunesToAdd; i++) {
    request('http://thesession.org/tunes/' + i + '/abc/1', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var tune = body.trim();

            var title = getTitle.exec(tune)[1];

            console.log("  - Adding: " + title);

            var tunes = db.get("tunes");
            tunes.insert({
                name: title,
                raw: tune,
                type: "tune",

                settings: {
                    type: "Reel",
                    key: "Gm"
                },
                
                metadata: {
                    owner: "108345118415232097428", 
                    public: true,
                    createdOn: moment().format('DD/MM/YYYY'),
                    lastEdited: moment().format('DD/MM/YYYY')
                }                
            });

            addedTunes++;
            if(addedTunes === tunesToAdd) {
              deferred.resolve();
            }
        }
    })
}

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

deferred.promise.then(function() {
  console.log("\nDatabase Seeded\n");
  process.exit(0);
});

