var
    express = require('express'),
    wkhtmltopdf = require('wkhtmltopdf');

wkhtmltopdf.command = "D:/TimTech/WebABC/jar-bin/wkhtmltopdf.exe";

module.exports = function(root) {
    var router = express.Router();

    /* GET home page. */
    router.get('', function(req, res) {
        res.sendfile(root + '/public/index.html');
    });

    router.get('/editor', function(req, res) {
        res.sendfile(root + '/public/index.html');
    });

    router.get('/user', function(req, res) {
        res.sendfile(root + '/public/index.html');
    });

    router.get('/pdf', function(req, res) {
        wkhtmltopdf('<h1>Test</h1><p>Hello world</p>', { pageSize: 'letter' }).pipe(res);
    });

    router.use(express['static'](root + '/public'));

    return router;
}