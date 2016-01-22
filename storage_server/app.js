var express = require('express');
var session = require('express-session');
var fileStore = require('session-file-store')(session);
var https = require('https');
var http = require('http');
var fs = require('fs');
var passport = require('passport');

var twitter = require('./keys/twitter.js');
var facebook = require('./keys/facebook.js');
var session_secret = require('./keys/session_secret.js').session_secret;
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function(user, done) {
  console.log("SERIALIZING USER",JSON.stringify(user));
  done(null, user.name);
});

passport.deserializeUser(function(id, done) {
  console.log("DESERIALIZING USER name",id);
  user.get(id, function(err, user) {
    console.log("DESERIALIZEDUSER",JSON.stringify(user));
    
    done(err, user);
  });
});





passport.use(new FacebookStrategy({
    clientID: facebook.appId,
    clientSecret: facebook.appSecret,
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    user.findOrCreateFromFacebook(profile, function(err, user) {
      console.log("USER!!",user);
      if (err) { return done(err); }
      done(null, user);
    });
  }
));
passport.use(new TwitterStrategy({
    consumerKey: twitter.consumer_key,
    consumerSecret: twitter.consumer_secret,
    callbackURL: "/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log(JSON.stringify(profile));
    user.findOrCreateFromTwitter(profile, function(err, user) {
      console.log("USER!!",user);
      if (err) { return done(err); }
      done(null, user);
    });
  }
));
var ssutil = require('./ssutil');

ssutil.activateTag("main");
//ssutil.activateTag("all");
//pjutil.activateTag("web");
//pjutil.activateTag("count");
//pjutil.activateTagForDev("http");
//pjutil.activateTag("web");

var api = require('./api.js');
//var user = require('./user.js');
var s3 = require('./s3');
var user = require('./user.js');

var privateKey  = fs.readFileSync('keys/server-key.pem', 'utf8');
var certificate = fs.readFileSync('keys/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var app = express();

console.log('hoob');
//console.log(new fileStore());

console.log(session_secret);
app.use(express.static('www'));

var theSession = session({
  resave:false,
  saveUninitialized:false,
  store:new fileStore(),
  //genid: function(req) {
  //  return genuuid() // use UUIDs for session IDs
  //},
  secret:session_secret
});
app.use(theSession);

app.use(passport.initialize());
app.use(passport.session());


app.get('/', function (req, res) {
  console.log("/",JSON.stringify(req.user));
  res.send('Hello World!');
});

app.get('/logout', function (req, res) {
  console.log("logout");
  req.session.destroy();
  res.send('Logged out');
});


app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: 'http://openchart.net/uid',
                                     failureRedirect: '/login' }));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));
// after login,the worker calls aboutme to retrieve user data
app.post('/api/aboutme',function (req,res) {
  console.log("ABOUT ME");
  var user = req.user;
  var rs = user?{name:user.name,handle:user.handle}:undefined;
  console.log('RS',JSON.stringify(rs));
  api.okResponse(res,undefined,rs)
});

app.post('/api/list',function (req,res) {
  console.log("LIST");
  api.extractData(req,function (err,prefix) {
    console.log("LIST",prefix);
    s3.list([prefix],function (err,keys) {
      console.log("KEYS",keys);
     api.okResponse(res,keys);
    });
  });
});



app.post('/api/anonSave', function (req, res) {
  console.log("POST to API");
  api.extractJSON(req,function (err,postData) {
    var remoteAddress = req.connection.remoteAddress;
    console.log("ZUB");
    api.anonSaveHandler(remoteAddress,postData,function (err,path) {

      if (err) {
        console.log("Save failed:",err);
        api.failResponse(res,err);
        return;
      }
      api.okResponse(res,path);
      //res.send('{"a":234}');
      console.log("result sent");
    });
  });
});

app.post('/login',function (req, res) {
  //passport.authenticate('local'),
  api.extractJSON(req,function (err,postData) {
    debugger;
    console.log(JSON.stringify(postData));
        api.okResponse(res);

    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    //res.redirect('/users/' + req.user.username);
  });
});

var httpServer,httpsServer,host,port;

if (ssutil.isDev) {
  console.log("DEV!!!");
  httpsServer = https.createServer(credentials,app).listen(3001, function () {
  host = httpsServer.address().address;
  port = httpsServer.address().port; 
  console.log('Example app listening at http://%s:%s', host, port);
});
} else {
  httpServer = http.createServer(app).listen(3000, function () {
    host = httpServer.address().address;
    port = httpServer.address().port; 
    console.log('Example app listening at http://%s:%s', host, port);
   });
}

/*
var httpsServer = https.createServer(credentials,app).listen(3001, function () {
  var host = httpsServer.address().address;
  var port = httpsServer.address().port;

//var server = app.listen(3000, function () {
 
  console.log('Example app listening at http://%s:%s', host, port);
});
*/