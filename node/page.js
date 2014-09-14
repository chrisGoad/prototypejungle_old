  
 
var pjutil = require('./util.js');
var util = require('util');
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
<title>PrototypeJungle</title>\
</head>\
<body>\
<script>\
';


// for supporting the log in process from twitter
exports.serveSession = function (response,sessionId,userName,handle,err) {
  response.write(pageHeader);
  if (err) { // the only error is maxUsersExceeded
    response.write('location.href = "http://prototypejungle.org/limit.html";\n');
  } else {
    pjutil.log("twitter","SERVE SESSION with handle",handle)
    response.write('localStorage.sessionId = "'+sessionId+'";\
localStorage.userName = "'+userName+'";\
localStorage.lastSessionTime = "'+(pjutil.seconds())+'";\
');
    if (handle) {
      var rsp = 'localStorage.handle = "'+handle+'";\
location.href= "http://prototypejungle.org'+(pjutil.homePage)+'#signedIn=1&handle='+handle+'";\n';
      pjutil.log("twitter","RESPONSE ",rsp);
      response.write(rsp);
    } else {
      response.write('location.href = "/handle";\n');
    }
  }
  response.write(
'</script>\
Redirecting ...\
</body>\
</html>\
');
  response.end();
}


var staticPages = ["style.css","spectrum.css","images/twitter.png","favicon.ico","sitemap.xml"];

staticPages.forEach(function (p) {pages["/"+p] = "static";});
pages["/"] = "static";


var htmlPages = ["missing","denied","tech","choosedoc","userguide","about","inspect","inspectd","inspectc","index","edit","editd",
                 "view","viewd","sign_in","sign_ind","view_datad","view_data","barchartLinks","example_build",
              "handle","handled","logout","logoutd","build_results","build_resultsd","twoarcs"];

htmlPages.forEach(function (p) {pages["/"+p] = "html";});
 
 
exports.failResponse = function (response,msg) {
  var rs = {status:"fail"};
  if (msg) {
    rs.msg = msg;
  }
  var ors = JSON.stringify(rs);
  response.write(ors);
  response.end();
}
    

exports.okResponse = function (response,vl,otherProps) {
  var rs = {status:"ok"};
  if (vl) {
    rs.value = vl;
  }
  if (otherProps) {
    for (var k in otherProps) {
      rs[k] = otherProps[k];
    }
  }
  var ors = JSON.stringify(rs);
  response.write(ors);
  response.end();
}


checkSessionHandler = function (request,response,inputs) {
  pjutil.log("web","session check");
  session.check(inputs,function (sessionObject) {
    if (sessionObject) {
      pjutil.log("web","api check sessionObject",sessionObject);
      if (typeof sessionObject === "string") {
        exports.failResponse(response,sessionObject);
      } else {
        exports.okResponse(response);
      }
    } else {
      pjutil.log("main","SESSION FAILED");
      exports.failResponse(response);
    }
  }); 
}

// just a no-op verifying that the system is alive. Used in sign_in
var checkUpHandler = function (request,response) {
  pjutil.log("web","check up");
  exports.okResponse(response);
}
  


var beginsWith = function (string,prefix) {
  var ln = prefix.length;
  return string.substr(0,ln)===prefix;
}
// argToCheck is a path that should be owned  by the current signed in user

var checkInputs = function (response,inputs,argToCheck,cb) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  session.check(inputs,function (sessionObject) {
    if (typeof sessionObject === "string") {
      fail(sessionObject);
      return;
    }
    var userName = sessionObject.user;
    user.get(userName,function (e,u) {
      var h = u.handle;
      if (!h) {
        fail("noHandle");
        return;
      }
      var path = inputs[argToCheck];;
      if (!path) {
        fail("noArg "+argToCheck);
        return;
      }
      if (!(beginsWith(path,"/"+h+"/")|| beginsWith(path,h+"/"))) {
        pjutil.log("web","Wrong handle for ",path," expected ",h);
        fail("wrongHandle");//  you can only store to your own tree
        return;
      }
      cb(path);
    });
  });
}


var deleteItemHandler = function (request,response,inputs) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function () {exports.okResponse(response);}
  checkInputs(response,inputs, 'path',function(path) {
    s3.deleteItem(path,function (e,d) {
      if (e) {
        fail(e);
      } else {
        s3.listHandle(pjutil.handleFromPath(path),succeed);
      }
    });
  });
}

  
    

// the general purpose saver for items.
//The inputs.files  should be an array of objects of the form {name:,value:,contentType:} (eg {name:"item",value:<serialized item>}
// value is saved at files.path/name for each name,value in this array,  using the given  content type
var saveHandler = function (request,response,inputs) {
  var cb = function (e) {
    pjutil.log("page","SAVEN COMPLETE");
    if (e) {
      exports.failResponse(response,"Save Failed");
    } else {
      s3.listHandle(pjutil.handleFromPath(inputs.path),function () {
        exports.okResponse(response);
      });
    }
  }
  checkInputs(response,inputs,'path', function() {
    var path = inputs.path;
    if (inputs.force) {
      s3.saveFiles(path,inputs.files,cb,"utf8");
    } else {
      s3.getObject(path+"/item.js",function (e,d) {
        if (d) {
          exports.failResponse(response,"alreadyExists");
        } else {
          s3.saveFiles(path,inputs.files,cb,"utf8");
        }
      });
    }
  });
}

var newItemHandler = function (request,response,inputs) {
  checkInputs(response,inputs, 'path',function(path) {
    // check if already present
    var cntu = function () {
      var item = 'prototypeJungle.om.assertItemLoaded({"value":{"__prototype__":"/svg/g"}});';
      var source = "//New item\n";
      util.log("page","NEW ITEM ",path);
      s3.saveFiles(path,[{name:"item.js",value:item,contentType:"application/javascript"},
                                  {name:"source.js",value:source,contentType:"application/javascript"},
                                  {name:"kind codebuilt",value:"An item built by code",contentType:"text/plain"}],
                   function (e) {
                    util.log("page","New item done");
                    if (e) {
                      exports.failResponse(response,"new Item failure");
                    } else {
                      s3.listHandle(pjutil.handleFromPath(path),function () {
                        exports.okResponse(response);
                      });
                    }
                   },
                    "utf-8"
                  );
    }
    if (inputs.force) {
      cntu();
    } else {
      s3.getObject(path+"/item.js",function (e,d) {
        if (d) {
          exports.failResponse(response,"alreadyExists");
        } else {
          cntu();
        }
      });
    }
  });
}



    
copyItemHandler = function (request,response,inputs) {
  var ncb = function (e) {
    if (e) {
      exports.failResponse(response,"copy failed");
    } else {
      s3.listHandle(pjutil.handleFromPath(inputs.dest),function () {
        exports.okResponse(response);
      });
    }
  }
  checkInputs(response,inputs, 'dest',function() {
    var src = inputs.src; // source path
    var dst = inputs.dest;
    if (inputs.force) {
      s3.copyItem(src,dst,ncb);
    } else {
      s3.getObject(dst+"/item.js",function (e,d) {
        if (d) {
          exports.failResponse(response,"alreadyExists");
        } else {
          s3.copyItem(src,dst,ncb);
        }
      });
    }
  });
}




pages["/api/checkSession"]  = checkSessionHandler;
pages["/api/checkUp"]  = checkUpHandler;
pages["/api/toS3"] = saveHandler; 
pages["/api/deleteItem"] = deleteItemHandler;
pages["/api/newItem"] = newItemHandler;
pages["/api/setHandle"] = user.setHandleHandler;
pages['/api/logOut'] = user.logoutHandler;
pages['/api/personaLogin'] = persona.login;
pages["/api/twitterRequestToken"] = twitter.getRequestToken;
pages["/api/twitter_callback"] = twitter.callback;
pages["/api/copyItem"] = copyItemHandler;
pjutil.log("pages",pages);
  
  
  
  

// for missing or error, which will not go through the usual send machinery
exports.servePage = function (response,pg) {
  pjutil.log("web","Serving page ",pg);
  var mf = pjutil.docroot + pg;
  var m = fs.readFileSync(mf);
  response.write(m);
  response.end();
}

  