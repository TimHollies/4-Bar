var
    monk = require('monk'),
    mongojs = require('mongojs'),
    db = mongojs("127.0.0.1:27017/webabc", ['tunes']);
    tunes = db.collection('tunes'),
    Q = require('q'),
    moment = require('moment');

tunes.drop();

var p = true,
  tunesToAdd = 1;

var request = require('request');

var getTitle = / *T: *([\w ']*) */;

var addedTunes = 0;

var deferreds = [];

var engine = require("./engine/engine");

//for (var i = 1; i <= tunesToAdd; i++) {
function loadTune(i) {
    var deferred = Q.defer();

    deferred.promise.then(function() {
        if(i > 1) {
            loadTune(i-1);
        } else {
            process.exit(0);
        }
    });

    request('http://thesession.org/tunes/' + i + '/abc/1', function(error, response, body) {        

        if (!error && response.statusCode == 200) {

            try {

            var tune = body.trim();

            console.log(tune);

           // var title = getTitle.exec(tune)[1];

            //console.log("  - Adding: " + title);
            
            var dispatcher = require("./engine/dispatcher");

            var parser = engine.parser(dispatcher),
            layout = engine.layout(dispatcher);


            //var logger = console.log;
            //console.log = function(a) {};

            var diffed = engine.diff({
                newValue: tune,
                oldValue: ""
            });

            var parsed = diffed.map(parser);
            var done = parsed.reduce(layout, 0);

            //console.log = logger;

            tunes.insert({
                name: done.tuneSettings.title,
                raw: tune,
                type: "tune",

                settings: done.tuneSettings,
                
                metadata: {
                    owner: "108345118415232097428", 
                    public: true,
                    createdOn: moment().format('DD/MM/YYYY'),
                    lastEdited: moment().format('DD/MM/YYYY')
                }                
            });

            deferred.resolve("hurray");

            } catch(exception) {
                console.log("Failed to get " + i, exception);
                deferred.resolve("ah");
            }

            /*addedTunes++;
            if(addedTunes === tunesToAdd) {
              deferred.resolve();
            }*/

        }

        deferred.resolve("oh well");
    })
}

loadTune(1);

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
/*
Q.all(deferreds).then(function() {
  console.log("\nDatabase Seeded\n");
  process.exit(0);
});
*/
