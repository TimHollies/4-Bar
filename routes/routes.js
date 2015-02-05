var
    express = require('express'),
    wkhtmltopdf = require('wkhtmltopdf');
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
        wkhtmltopdf('<h1>Test</h1><p>Hello world</p>', { pageSize: 'letter' }).pipe(res);
    });

    router.use(express['static'](root + '/public'));

    return router;
}