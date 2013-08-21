  /**
     * This is our Node.JS code, running server-side.
     * from http://arguments.callee.info/2010/04/20/running-apache-and-node-js-together/
     */
var util = require('./util.js');

var dyno = require('./dynamo.js');

var pjdb = require('./db.js').pjdb;

var page = require('./page.js');

var session = require('./session');

var user = require('./user');

var OAuth= require('oauth').OAuth;

var keys = require('./keys/twitter.js');

var mkOauth = function () {
  util.log("twitter","GRABBING KEYS");
  return new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	keys.consumer_key,
	keys.consumer_secret,
	"1.0",
	"http://prototypejungle.org:8000/api/twitter_callback",
	"HMAC-SHA1"
);
}

exports.mkOauth  = mkOauth;

var http = require('http');


exports.getRequestToken= function (res) {
  var oa = mkOauth();
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    util.log("twitter","token",oauth_token);
		if (error) {
			util.log("twitter",error);
			res.send("yeah no. didn't work.")
		}
		else {
                  util.log("twitter","TOKEN FROM REQUEST",oauth_token);
                  util.log("twitter","SECRET FROM REQUEST",oauth_token_secret);
                  util.log("twitter","RESULTS",results);
                  pjdb.put(oauth_token,{secret:oauth_token_secret},{valueEncoding:'json'});
                 // exports.requestToken = oauth_token;
                  //req =  http.request({'host':'twitter.com','port':80,path:method:'GET'},
		//	req.session.oauth = {};
		//	req.session.oauth.token = oauth_token;
		//	util.log("twitter",'oauth.token: ' + req.session.oauth.token);
		//	req.session.oauth.token_secret = oauth_token_secret;
		//	util.log("twitter",'oauth.token_secret: ' + req.session.oauth.token_secret);
                  res.writeHead(302,
                    {Location: 'https://twitter.com/oauth/authenticate?oauth_token='+oauth_token});
                  res.end();
                }

	});
}



exports.getAccessToken= function (res,token,secret,verifier) {
  var oa = mkOauth();
  oa.getOAuthAccessToken(token,secret,verifier, 
      function(error, oauth_access_token, oauth_access_token_secret, results){
	if (error){
	  util.log("twitter",error);
	  res.send("yeah something broke.");
	} else {
          util.log("twitter","Got access token",oauth_access_token);
          oa.get("http://api.twitter.com/1.1/account/settings.json",oauth_access_token,
                  oauth_access_token_secret,function (e,d) {
                    util.log("twitter","USER DATA ",d);
                    var jsd = JSON.parse(d);
                    var uname = "twitter_T3"+jsd.screen_name;
                    user.signIn(res,uname);                   
                  });
          return;
          util.log("twitter","RESULTS",results);
          page.serveSession(res,'abcd55');
          return;
          page.serve(res,page.pages["/"]);
          return;
          res.write('<html><body>OK!</body></html>');
          res.end();
        }
      });
  };

exports.getUserInfo = function (res,token,secret) {
  var oa = mkOauth();
  oa.get("http://api.twitter.com/1.1/account/settings.json",token,secret,function (e,d) {
    util.log("twitter","USER DATA ",d);
  });
}


 exports.callback = function(request,response,purl) {
      util.log("twitter","CALLBACKS");
    //  util.log("twitter","REQUEST",request);
            util.log("twitter","REQUESTF",request.foob);

      var qr = purl.query;
      var denied = qr.denied;
      var token = qr.oauth_token;
      if (denied) {
        response.write('<html><body>DENIED</body></html');
        response.end();
        return;
      }
      pjdb.get(token,{valueEncoding:"json"},function (e,v) {
        var secret = v.secret;
        util.log("twitter","secret from db ",secret);
        var verifier = qr.oauth_verifier;
        exports.getAccessToken(response,token,secret,verifier);
      });
    }
    
//twitterGetToken();
