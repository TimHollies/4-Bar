var
    express = require('express'),
    wkhtmltopdf = require('wkhtmltopdf');
    //engine = require("../engine/engine");
   // clientSideRoutes = require('./config.route'),
    //_ = require('lodash');

wkhtmltopdf.command = "D:/TimTech/WebABC/jar-bin/wkhtmltopdf.exe";

var clientSideRoutes = ['', '/editor', '/user', '/viewer', '/tutorial', '/tunebook', '/tunebook/view'];

module.exports = function(root) {
    var router = express.Router();

    /* GET home page. */

    clientSideRoutes.forEach(function(route) {
        router.get(route, function(req, res) {
            res.sendfile(root + '/public/index.html');
        });
    }); 

    router.get('/pdf', function(req, res) {
        console.log("body", req.query.tune);

        var dispatcher = require("../engine/dispatcher");

        var parser = engine.parser(dispatcher),
        layout = engine.layout(dispatcher),
        render = engine.render(dispatcher, true);

        var diffed = engine.diff({
             newValue: req.query.tune,
            oldValue: ""
        });

        var parsed = diffed.map(parser);
        var done = parsed.reduce(layout, 0);

        var datastring = render(done);

        console.log("GENERATED HTML", datastring);

        wkhtmltopdf(datastring, { pageSize: 'letter' }).pipe(res);
    });

    router.use(express['static'](root + '/public'));

    return router;
}