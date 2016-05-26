var
    express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    compress = require('compression'),
    //GoogleStrategy = require('passport-google').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,

    routes = require('./routes/routes')(__dirname),
    apiroutes = require('./routes/api'),
    config = require('./config/app.config'),
    monk = require('monk'),
    db = monk('localhost/webabc'),
    debug = require('debug')('ABC'),

    app = express();

app.use(compress());
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
/*app.use(session({
    secret: 'something'
}));*/

//Authentication

passport.serializeUser(function(user, done) {
    done(null, user.googleId);
});

passport.deserializeUser(function(obj, done) {
    var usersDb = db.get("users");
    usersDb.findOne({
        googleId: obj
    }, function(e, docs) {
        done(e, docs);
    });
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
        clientID: "438333756179-uurf1parlk4nfu57dalcct5potg4kq2i.apps.googleusercontent.com",
        clientSecret: "f58fMfasIVmWpYTJRoFgPawL",
        callbackURL: "http://" + config.url + ":" + config.port + "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {

        var usersDb = db.get("users");

        console.log("DOING")

        
        usersDb.findOne({
                googleId: profile.id
            },
            function(e, docs) {
                var user = docs;
                if (user === null) {
                    user = {
                        googleId: profile.id,
                        name: profile.name.givenName,
                        picture: profile._json.picture
                    };
                    usersDb.insert(user);
                }
                console.log("DONE")
                return done(e, user);
            });

    }
));

app.use('/', routes);

app.use('/api', apiroutes);

app.use('/experiments', express.static(path.join(__dirname, 'experiments')));

app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }),
    function(req, res) {
        res.redirect('/');
        // The request will be redirected to Google for authentication, so
        // this function will not be called.
    });

app.get('/auth/google/callback',
    function(req, res, next) {
        console.log("HERE!!", next)
        try {
            passport.authenticate('google', {
                failureRedirect: '/'
            })(req,res,next);
        } catch(err) {
            console.log("ERR", err);
        }
        console.log("DONE2")
        // Successful authentication, redirect home.
        res.redirect('/');
    });

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
// 
/*
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}*/

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });

//start the server

app.set('port', config.port);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});