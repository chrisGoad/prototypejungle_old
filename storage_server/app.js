var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var passport = require('passport');
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

app.get('/', function (req, res) {
  res.send('Hello World!');
});
console.log('hoob');

app.use(express.static('www'));


app.post('/api/anonSave', function (req, res) {
  console.log("POST to API");
  api.extractData(req,function (err,postData) {
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
  api.extractData(req,function (err,postData) {
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