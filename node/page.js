  /**
     * This is our Node.JS code, running server-side.
     * from http://arguments.callee.info/2010/04/20/running-apache-and-node-js-together/
     */
 
// this is needed for just one purpose: serving a page with a session embedded
var util = require('./util.js');
var fs = require('fs');
var s3 = require('./s3');
var user = require('./user');
var persona = require('./persona');
var twitter = require('./twitter');
var session = require('./session');

var pages  = {}
exports.pages = pages;

var pageHeader =
'<!DOCTYPE html>\
<html>\
<head>\
<meta charset="UTF-8">\
<title>Prototype Jungle</title>\
</head>\
<body>\
<script>\
';


// for supporting the log in process from twitter
exports.serveSession = function (response,sessionId,uname,handle) {
  util.log("twitter","SERVE SESSION with handle",handle)
  response.write(pageHeader);
  response.write(
'localStorage.sessionId = "'+sessionId+'";\
localStorage.userName = "'+uname+'";\
');
  if (handle) {
    response.write(
'localStorage.handle = "'+handle+'";\
location.href = "/";\n');
  } else {
    response.write('location.href = "/handle";\n');
  }
  response.write(
'</script>\
Redirecting ...\
</body>\
</html>\
');
  response.end();
}

  var staticPages = ["style.css","images/twitter.png","favicon.ico"];
  
  staticPages.forEach(function (p) {pages["/"+p] = "static";});
  pages["/"] = "static";

  
  var htmlPages = ["missing","denied","tech","about","inspect","index","build","view","sign_in",
                "handle","logout","build_results"];
  
  htmlPages.forEach(function (p) {pages["/"+p] = "html";});
 
// for debugging
pages["/api/check"]  = function (request,response,cob) {
    util.log("web","api check");
    session.check(cob,function (sval) {
      if (sval) {
            util.log("web","api check sval",sval);

        if (typeof sval == "string") {
          exports.failResponse(response,sval);
        } else {
          exports.okResponse(response);
        }
      } else {
        exports.failResponse(response);
      }
    }); 
}

pages["/api/toS3"] = s3.saveHandler;
pages["/api/postCanvas"] = s3.saveHandler;
pages["/api/setHandle"] = user.setHandleHandler;

  pages['/api/logOut'] = user.logoutHandler;
  
  pages['/api/personaLogin'] = persona.login;
    pages["/api/twitterRequestToken"] = twitter.getRequestToken;
    pages["/api/twitter_callback"] = twitter.callback;
  util.log("pages",pages);
  
  
  
  
  exports.failResponse = function (res,msg) {
    var rs = {status:"fail"};
    if (msg) {
      rs.msg = msg;
    }
    var ors = JSON.stringify(rs);
    res.write(ors);
    res.end();
  }
    

  exports.okResponse = function (res,vl) {
    var rs = {status:"ok"};
    if (vl) {
      rs.value = vl;
    }
    var ors = JSON.stringify(rs);
    res.write(ors);
    res.end();
  }
  
  
    // for missing or error, which will not go through the usual send machinery
exports.servePage = function (response,pg) {
  util.log("web","Serving page ",pg);
      var mf = util.docroot + pg;
      var m = fs.readFileSync(mf);
      response.write(m);
      response.end();
    }

  