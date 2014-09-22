var util = require('./util.js');
var dyno = require('./dynamo.js');
var pjdb = require('./db.js').pjdb;
var api = require('./api.js');
var session = require('./session');
var user = require('./user');
var OAuth= require('oauth').OAuth;
var keys = require('./keys/twitter.js');
util.activeTags.push("twitter");

//For the prototypejungle twitter app, sign in as prototypejungle at dev.twitter.com
var mkOauth = function () {
  util.log("twitter","GRABBING KEYS");
  var cbhost = "http://prototype-jungle.org";
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
            util.log("twitter",JSON.stringify(error));
            response.send("yeah no. didn't work.")
    }
    else {
      util.log("twitter","TOKEN FROM REQUEST",oauth_token);
      util.log("twitter","SECRET FROM REQUEST",oauth_token_secret);
      util.log("twitter","RESULTS",JSON.stringify(results));
      pjdb.put(oauth_token,{secret:oauth_token_secret},{valueEncoding:'json'});
      response.writeHead(302,
        {Location: 'https://api.twitter.com/oauth/authenticate?oauth_token='+oauth_token});
      response.end();
    }
  });
}



exports.getAccessToken= function (response,token,secret,verifier) {
  util.log("twitter","getAccessToken")
  var oa = mkOauth();
  oa.getOAuthAccessToken(token,secret,verifier, 
    function(error, oauth_access_token, oauth_access_token_secret, results) {
      if (error){
        util.log("twitter",error);
        response.send("yeah something broke.");
      } else {
        util.log("twitter","Got access token",oauth_access_token);
        oa.get("https://api.twitter.com/1.1/account/settings.json",oauth_access_token,
                oauth_access_token_secret,function (e,d) {
                  util.log("twitter","USER DATA [",JSON.stringify(e),"][",d,"]");
                  var jsd = JSON.parse(d);
                  var uname = "twitter_"+jsd.screen_name;
                  user.signIn(response,uname);                   
                });
        return;
      }
    });
}


exports.getUserInfo = function (response,token,secret) {
  var oa = mkOauth();
  oa.get("https://api.twitter.com/1.1/account/settings.json",token,secret,function (e,d) {
    util.log("twitter","USER DATA ",d);
  });
}


exports.callback = function(request,response,purl) {
  util.log("twitter","CALLBACKS");
        util.log("twitter","REQUESTF",request.foob);

  var qr = purl.query;
  var denied = qr.denied;
  var token = qr.oauth_token;
  if (denied) {
    api.servePage(response,"denied.html");
    return;
  }
  if ((typeof token)!="string") {
    api.servePage(response,"bad.html");
  }
  pjdb.get(token,{valueEncoding:"json"},function (e,v) {
    if (!v) {
      api.servePage(response,"denied.html");
      return;
    }
    var secret = v.secret;
    util.log("twitter","secret from db ",secret);
    var verifier = qr.oauth_verifier;
    exports.getAccessToken(response,token,secret,verifier);
  });
}
