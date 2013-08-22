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
  var cbhost = "http://prototypejungle.org";
  if (util.isDev) {
    cbhost += ":8000";
  }
  var cburl = cbhost + "/api/twitter_callback"
  util.log("twitter","callback url",cburl);
  return new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	keys.consumer_key,
	keys.consumer_secret,
	"1.0",
	cburl,
	"HMAC-SHA1"
);
}

exports.mkOauth  = mkOauth;

var http = require('http');


exports.getRequestToken= function (request,response) {
  var oa = mkOauth();
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    util.log("twitter","token",oauth_token);
		if (error) {
			util.log("twitter",error);
			response.send("yeah no. didn't work.")
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
                  response.writeHead(302,
                    {Location: 'https://twitter.com/oauth/authenticate?oauth_token='+oauth_token});
                  response.end();
                }

	});
}



exports.getAccessToken= function (response,token,secret,verifier) {
  var oa = mkOauth();
  oa.getOAuthAccessToken(token,secret,verifier, 
      function(error, oauth_access_token, oauth_access_token_secret, results){
	if (error){
	  util.log("twitter",error);
	  response.send("yeah something broke.");
	} else {
          util.log("twitter","Got access token",oauth_access_token);
          oa.get("http://api.twitter.com/1.1/account/settings.json",oauth_access_token,
                  oauth_access_token_secret,function (e,d) {
                    util.log("twitter","USER DATA ",d);
                    var jsd = JSON.parse(d);
                    var uname = "twitter_T3"+jsd.screen_name;
                    user.signIn(response,uname);                   
                  });
          return;
          util.log("twitter","RESULTS",results);
          page.serveSession(response,'abcd55');
          return;
          page.serve(response,page.pages["/"]);
          return;
          response.write('<html><body>OK!</body></html>');
          response.end();
        }
      });
  };

exports.getUserInfo = function (response,token,secret) {
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
        page.servePage(response,"denied.html");
        return;
      }
      if ((typeof token)!="string") {
        page.servePage(response,"bad.html");
      }
      pjdb.get(token,{valueEncoding:"json"},function (e,v) {
        if (!v) {
          page.servePage(response,"denied.html");
          return;
        }
        var secret = v.secret;
        util.log("twitter","secret from db ",secret);
        var verifier = qr.oauth_verifier;
        exports.getAccessToken(response,token,secret,verifier);
      });
    }
    
//twitterGetToken();