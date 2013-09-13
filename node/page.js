  /**
     * This is our Node.JS code, running server-side.
     * from http://arguments.callee.info/2010/04/20/running-apache-and-node-js-together/
     */
 
// this is needed for just one purpose: serving a page with a session embedded
var pjutil = require('./util.js');
var util = require('util');
var fs = require('fs');
var s3 = require('./s3');
var user = require('./user');
var persona = require('./persona');
var twitter = require('./twitter');
var session = require('./session');
pjutil.activeTags.push("s3");
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
  pjutil.log("twitter","SERVE SESSION with handle",handle)
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
  pjutil.log("web","session check");
  session.check(cob,function (sval) {
    if (sval) {
      pjutil.log("web","api check sval",sval);
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

var checkSaveInputs = function (response,cob,cb) {
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
        pjutil.log("web","Wrong handle for ",path," expected ",h);
        fail("wrongHandle");//  you can only store to your own tree
        return;
      }
      cb(path);
    });
  });
}

var saveImageHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function () {exports.okResponse(response);}
  checkSaveInputs(response,cob, function(path) {
    var imageData = cob.jpeg;
    console.log("imageData Length",imageData.length);
    var ctp = "image/jpeg";
    var encoding = "binary";
    var cm = imageData.indexOf(",")
    var jpeg64 = imageData.substr(cm+1);
    vl = new Buffer(jpeg64,"base64").toString("binary");
    s3.save(path,vl,ctp, encoding,function (x) {
      pjutil.log("s3","FROM s3 image save of ",path);
        if ((typeof x=="number")) {
          succeed();
        } else {
          fail(x);
        }
      });
  });
}

var saveHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function () {exports.okResponse(response);}
  checkSaveInputs(response,cob, function(path) {
 
  
 /* session.check(cob,function (sval) {
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
        pjutil.log("web","Wrong handle for ",path," expected ",h);
        fail("wrongHandle");//  you can only store to your own tree
        return;
      }
      //var vl = cob.value;// for images, currently
      */
      var data= cob.data; // for an item save
      var code = cob.code;
      var source = cob.source;
      if ((!source) && (!data || !code)) {
        fail("noContent");
        return;
      }
      //var vwf = cob["viewFile"];
      var isPublic = cob["public"];
      isPublic = 1;
    
    /*  if (jpeg) {
        var ctp = "image/jpeg";
        var encoding = "binary";
        var cm = jpeg.indexOf(",")
        var jpeg64 = jpeg.substr(cm+1);
        vl = new Buffer(jpeg64,"base64").toString("binary");
      }
    */
      var jctp = "application/javascript";
      var encoding = "utf8"
      pjutil.log("s3"," s3 save of Item",path);
      
      var saveFile = function (path,vl,ctp,cb) {
        s3.save(path,vl,ctp, encoding,function (x) {
          pjutil.log("s3","FROM s3 save of ",path,x);
          if ((typeof x=="number")) {
            if (cb) {
              cb();
            } else {
              succeed();
            }
          } else {
            fail(x);
          }
        });
      }
      
      var saveDataFile = function (cb) {
        saveFile(path+"/data.js",data,jctp,cb);
      }
      
      var saveCodeFile = function (cb) {
        saveFile(path+"/code.js",code,jctp,cb);
      }
      
      var saveViewFile = function (cb) {
        s3.viewToS3(path+"/view",function (x) {
            pjutil.log("s3","FROM viewTOS3",x);
            if ((typeof x=="number")) {
              if (cb) {
                cb();
              } else {
                succeed();
              }
            } else {
              fail(x);
            }
          });
      }
      
      
      var saveSourceFile = function (cb) {
        saveFile(path+"/source.js",source,jctp,cb);
      }
      
      // save the marker file that this is public
      var savePublicFile = function () {
        if (isPublic) {
          saveFile(path+" public","This is a public item","text/plain");
        }
      }
      if (source) {
        saveSourceFile(savePublicFile);
      } else {
        saveDataFile(function (){
          saveCodeFile(function () {
            saveViewFile();
          });
        });
      }
    });
}
    
      


listHandler = function (request,response,cob) {
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
      var prefixes = cob.prefixes;
      if (!prefixes) {
        fail("noPrefix");
        return;
      }
      if (!Array.isArray(prefixes)) {
        console.log("PREFIXES",prefixes);
        fail("Prefixes is not an array");
      }
      // todo , make 
      /*
      if (!beginsWith(prefix,h+"/")) {
        fail("wrongHandle");//  you can only store to your own tree
        return;
      }
      */
      var include = cob["include"]; // extensions to include 
      var exclude = cob["exclude"]; // extensions to exclude 
      var publicOnly = cob["publicOnly"];
      pjutil.log("s3"," s3 list",prefixes);
      s3.list(prefixes,include, exclude,function (e,keys) {
        var rs = [];
        var kp = {};
        keys.forEach(function (k) {
          if (pjutil.endsIn(k," public")) {
            if (publicOnly) {
              
              kp[pjutil.beforeChar(k," ")] = 1;
            }
          } else {
            if (!publicOnly) {
              rs.push(k);
            }
          }
        });
        if (publicOnly) {
          keys.forEach(function (k) {
            if (!pjutil.endsIn(k," public")) {
              if (kp[k]) {
                rs.push(k);
              }
            }
          });
        }
        exports.okResponse(response,rs);
      });
    });
  });
}



pages["/api/checkSession"]  = checkSessionHandler;
pages["/api/toS3"] = saveHandler;
pages["/api/saveImage"] = saveImageHandler;
pages["/api/listS3"] = listHandler;
pages["/api/setHandle"] = user.setHandleHandler;
pages['/api/logOut'] = user.logoutHandler;
pages['/api/personaLogin'] = persona.login;
pages["/api/twitterRequestToken"] = twitter.getRequestToken;
pages["/api/twitter_callback"] = twitter.callback;
pjutil.log("pages",pages);
  
  
  
  
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
  pjutil.log("web","Serving page ",pg);
  var mf = pjutil.docroot + pg;
  var m = fs.readFileSync(mf);
  response.write(m);
  response.end();
}

  