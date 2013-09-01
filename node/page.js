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


var staticPages = ["style.css","images/twitter.png","favicon.ico","sitemap.xml"];

staticPages.forEach(function (p) {pages["/"+p] = "static";});
pages["/"] = "static";


var htmlPages = ["missing","denied","tech","about","inspect","inspectd","index","build","buildd",
                 "view","viewd","sign_in","sign_ind",
              "handle","handled","logout","logoutd","build_results","build_resultsd","twoarcs"];

htmlPages.forEach(function (p) {pages["/"+p] = "html";});
 


checkSessionHandler = function (request,response,cob) {
  util.log("web","session check");
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


var beginsWith = function (s,p) {
  var ln = p.length;
  return s.substr(0,ln)==p;
}


var saveHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  session.check(cob,function (sval) {
    if (typeof sval == "string") {
      fail(sval);
      return;
    }
    var uname = sval.user;
    user.get(uname,function (u) {
      var h = u.handle;
      if (!h) {
        fail("noHandle");
        return;
      }
      var path = cob.path;
      if (!path) {
        fail("noPath");
        return;
      }
      if (!beginsWith(path,"/"+h+"/")) {
        fail(response,"wrongHandle");//  you can only store to your own tree
        return;
      }
      var vl = cob.value;
      var jpeg = cob.jpeg; // might be an image
      if (!vl && !jpeg) {
        fail("noContent");
        return;
      }
      
      if (jpeg) {
        var ctp = "image/jpeg";
        var encoding = "binary";
        var cm = jpeg.indexOf(",")
        var jpeg64 = jpeg.substr(cm+1);
        vl = new Buffer(jpeg64,"base64").toString("binary");
      } else {
        ctp = "application/javascript";
        var encoding = "utf8"
      }
      util.log("s3"," s3 save",path,ctp,encoding);

      s3.save(path,vl,ctp, encoding,function (x) {
        util.log("s3","FROM s3 save",x);
        if ((typeof x!="number")) {
          exports.failResponse(response,x);
          return;
        }
        vwf = cob.viewFile;
        if (vwf) {
          s3.viewToS3(vwf,function (x) {
            util.log("s3","FROM viewTOS3",x);
            if ((typeof x=="number")) {
              exports.okResponse(response);
            } else {
              exports.failResponse(response,x);
            }
          });
        } else {
          exports.okResponse(response);
        }
      });
    });
  });
}

 
pages["/api/checkSession"]  = checkSessionHandler;
pages["/api/toS3"] = saveHandler;
pages["/api/postCanvas"] = saveHandler;
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

  