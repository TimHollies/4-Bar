var
    express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,

    routes = require('./routes/routes')(__dirname),
    apiroutes = require('./routes/api'),
    databaseSetup = require('./data/database'),

    app = express();

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: 'something'
}));


passport.serializeUser(function(user, done) {
    done(null, user.identifier);
});

passport.deserializeUser(function(obj, done) {
    databaseSetup.getUser(obj)
        .then(function(user) {
            done(null, user);
        });

});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
        returnURL: 'http://localhost:3000/auth/google/return',
        realm: 'http://localhost:3000/'
    },
    function(identifier, profile, done) {
        //process.nextTick(function () {

        // To keep the example simple, the user's Google profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Google account with a user record in your database,
        // and return that user instead.
        profile.identifier = identifier;
        console.log(profile);

        databaseSetup.getUser(identifier)
            .then(function(user) {
                console.log("USER", user);
                if (!user) databaseSetup.addUser(profile);
                return done(null, profile);
            });
    }
));


app.use('/', routes);

app.use('/api', apiroutes);

app.use('/experiments', express.static(path.join(__dirname, 'experiments')));

app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

app.get('/auth/google',
    passport.authenticate('google'),
    function(req, res) {
        res.redirect('/');
        // The request will be redirected to Google for authentication, so
        // this function will not be called.
    });

app.get('/auth/google/return',
    passport.authenticate('google', {
        failureRedirect: '/login'
    }),
    function(req, res) {
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
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;