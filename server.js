var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;


var routes = require('./routes/api');
var databaseSetup = require('./data/database');

var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret:'something'}));


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
      .then(function(user){
        console.log("USER", user);
        if(!user) databaseSetup.addUser(profile);
        return done(null, profile);        
      });
  }
));


app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

app.get('/auth/google',
  passport.authenticate('google'),
  function(req, res){
    res.redirect('/');
    // The request will be redirected to Google for authentication, so
    // this function will not be called.
  });

app.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
 });

app.get('/logout', function(req, res){
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