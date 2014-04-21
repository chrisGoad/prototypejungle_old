  
 
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
location.href = "http://prototypejungle.org'+(util.homePage)+'#signedIn=1&handle='+handle+'";\n');
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


var staticPages = ["style.css","spectrum.css","images/twitter.png","favicon.ico","sitemap.xml"];

staticPages.forEach(function (p) {pages["/"+p] = "static";});
pages["/"] = "static";


var htmlPages = ["missing","denied","tech","choosedoc","userguide","about","inspect","inspectd","index","edit","editd",
                 "view","viewd","sign_in","sign_ind","view_datad","view_data","barchartLinks","example_build",
              "handle","handled","logout","logoutd","build_results","build_resultsd","twoarcs"];

htmlPages.forEach(function (p) {pages["/"+p] = "html";});
 


checkSessionHandler = function (request,response,cob) {
  pjutil.log("web","session check");
  session.check(cob,function (sval) {
    if (sval) {
      pjutil.log("web","api check sval",sval);
      if (typeof sval === "string") {
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
  return s.substr(0,ln)===p;
}
// argToCheck is a path that should be owned  by the current signed in user

var checkInputs = function (response,cob,argToCheck,cb) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  session.check(cob,function (sval) {
    if (typeof sval === "string") {
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
      var path = cob[argToCheck];;
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


var deleteItemHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function () {exports.okResponse(response);}
  checkInputs(response,cob, 'path',function(path) {
    s3.deleteItem(path,function (e,d) {
      if (e) {
        fail(e);
      } else {
        succeed();
      }
    });
  });
}


var saveImageHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function () {exports.okResponse(response);}
  checkInputs(response,cob,'path', function(path) {
    var imageData = cob.jpeg;
    pjutil.log("s3","imageData Length",imageData.length);
    var ctp = "image/jpeg";
    var encoding = "binary";
    var cm = imageData.indexOf(",")
    var jpeg64 = imageData.substr(cm+1);
    vl = new Buffer(jpeg64,"base64").toString("binary");
    s3.save(path,vl,ctp, encoding,function (e) {
      pjutil.log("s3","FROM s3 image save of ",path);
        if (e) {
          fail(e);
        } else {
          succeed();
        }
      });
  });
}


var saveDataHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function () {exports.okResponse(response);}
  checkInputs(response,cob, 'path',function(path) {
    var data = cob.data;
    //console.log("SAVING DATA ",data);
    //succeed();
    //return;
    var ctp = "application/json";
    var encoding = "utf8";
    s3.save(path,"callback("+JSON.stringify(data)+")",ctp, encoding,function (e) {
      pjutil.log("s3","FROM s3 data save of ",path);
        if (e) {
          fail(e);
        } else {
          succeed();
        }
      });
  });
}

var saveFile = function (response,path,vl,ctp,cb) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function () {exports.okResponse(response);}
  var encoding = "utf8";

  //console.log("S3save",path,vl===undefined);
  if (vl===undefined) {
    if (cb) {
      cb();
    } else {
      succeed();
    }
    return;
  }
  s3.save(path,vl,ctp, encoding,function (e) {
    pjutil.log("s3","FROM s3 save of ",path,e);
    if (e) {
      fail(e);
    } else {
      if (cb) {
        cb();
      } else {
        succeed();
      }
    } 
  });
}
    
// path should start with "/"
var saveFiles = function (response,path,item,code,kind,source,data) {
  var sti = (path[0]==="/")?1:0;
  var hnd = path.substring(sti,path.indexOf("/",sti));
  console.log("HANDLE ",sti,hnd,path);
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function () {exports.okResponse(response);}
  var jctp = "application/javascript";
  var saveItemFile = function (cb) {
    if (item)  {
      //console.log("SAVING ITEM",path,item);
      saveFile(response,path+"/item.js",item,jctp,cb);

    }else  {
      console.log("NO ITEM");
      cb();
      
    }
  }
  
  var saveCodeFile = function (cb) {
    if (code) {
      saveFile(response,path+"/code.js",code,jctp,cb);
    } else {
      cb();
    }
  }
  /* OBSOLETE 
  var saveViewFile = function (cb) {
    s3.viewToS3(path+"/view",function (x) {
        pjutil.log("s3","FROM viewTOS3",x);
        if ((typeof x==="number")) {
          if (cb) {
            s3.listHandle(hnd,cb);
          } else {
            s3.listHandle(hnd,succeed);
          }
        } else {
          s3.listHandle(hnd,function () {fail(x);});
        }
      });
    }
    
  */
  var saveSourceFile = function (cb) {
    saveFile(response,path+"/source.js",source,jctp,cb);
  }
  
  
  var saveDataFile = function (cb) {
    saveFile(response,path+"/data.js",data,jctp,cb);
  }
  // save the marker file that this is public
  var saveKindFile = function (cb) {
    if (kind) {
      pjutil.log("s3","SAVING KIND ",kind);
      saveFile(response,path+"/kind "+kind,"This is a file of kind "+kind,"text/plain",cb);
    } else if (cb) {
      cb();
    } else {
      succeed();
    }
  }
  //console.log("AAAAAAAA");
   saveSourceFile(function () {
    saveItemFile(function (){
      saveCodeFile(function () {
        saveKindFile(function () {
          saveDataFile(function () {
            s3.listHandle(hnd,succeed);
          });
        });
      });
    });
  });
}
  
var saveHandler = function (request,response,cob) {
 // var fail = function (msg) {exports.failResponse(response,msg);}
 // var succeed = function () {exports.okResponse(response);}
   var fail = function (msg) {exports.failResponse(response,msg);}

  checkInputs(response,cob,'path', function(path) {
    //console.log("SAVED FROM ",cob.savedFrom);
    if (cob.data) {
      var item = "prototypeJungle.om.assertItemLoaded("+JSON.stringify(cob.data)+")"
    } else {
      item = undefined;
    }
    var code = cob.code;
    var source = cob.source;
   // console.log("SAVINGGGGGGGGGG ",JSON.stringify(data),source);

    if (!source && !item && !code) {
      fail("noContent");
      return;
    }
    //var vwf = cob["viewFile"];
    var kind = cob["kind"];
    function doSave(err,dt) {
      if (err) {
        console.log("DATA COPY FAILED");
        fail("Data copy failed");
      } else {
        saveFiles(response,path,item,code,kind,source);
      }

    }
    console.log(cob.savedFrom, " VS ",path);
    if ((cob.savedFrom && cob.ownDataSource) && (cob.savedFrom  !== path)) { // need to copy the data.js file
      s3.copy(cob.savedFrom+"/data.js",path+"/data.js",doSave);
    } else {
      doSave();
    }
  });
}
    
    /*
    var saveFile = function (path,vl,ctp,cb) {
      console.log("S3save",path,vl===undefined);

      if (vl===undefined) {
        if (cb) {
          cb();
        } else {
          succeed();
        }
        return;
      }
      s3.save(path,vl,ctp, encoding,function (x) {
        pjutil.log("s3","FROM s3 save of ",path,x);
        if ((typeof x==="number")) {
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
    
    */
    /*
    var saveDataFile = function (cb) {
      if (data)  {
        console.log("SAVING DATA",path,JSON.stringify(data));
      }else  {
        console.log("NO DATA");
      }
      saveFile(response,path+"/item.js",data,jctp,cb);
    }
    
    var saveCodeFile = function (cb) {
      saveFile(response,path+"/code.js",code,jctp,cb);
    }
    
    var saveViewFile = function (cb) {
      s3.viewToS3(path+"/view",function (x) {
          pjutil.log("s3","FROM viewTOS3",x);
          if ((typeof x==="number")) {
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
      saveFile(response,path+"/source.js",source,jctp,cb);
    }
    
    // save the marker file that this is public
    var saveKindFile = function (response,cb) {
      if (kind) {
        pjutil.log("s3","SAVING KIND ",kind);
        saveFile(path+"/kind "+kind,"This is a file of kind "+kind,"text/plain",cb);
      } else if (cb) {
        cb();
      } else {
        succeed();
      }
    }
    console.log("AAAAAAAA");
    saveSourceFile(function () {
      saveDataFile(function (){
        saveCodeFile(function () {
          saveKindFile(function () {
            saveViewFile();
          });
        });
      });
    });
  });
}
*/
    
var newItemHandler = function (request,response,cob) { 
  checkInputs(response,cob, 'path',function(path) {
    // check if already present
    s3.getObject(path+"/item.js",function (e,d) {
      if (e) {
        var qpath = '"/x/'+path+'"';
        var item = 'prototypeJungle.om.assertItemLoaded({"value":{"__prototype__":"/svg/g"},'+
          '"path":'+qpath+'})';
        console.log("NEW ITEM",item);
        //   var item = 'prototypeJungle.om.assertItemLoaded({"value":{"value":{"__prototype__":"/svg/g"}},'+
        //  '"path":'+qpath+'})';
        var source = "//New item\n";
        var qdotpath = ".x."+path.replace(/\//g,".");
        var code = '(function () {\nvar item=prototypeJungle'+qdotpath+';\nprototypeJungle.om.assertCodeLoaded('+qpath+
                    ');\n})()\n'
        var kind = "codebuilt";
        var data = 'callback()';
        saveFiles(response,path,item,code,kind,source,data);
      } else {
        console.log(path + "ALREADY EXISTS");
        exports.failResponse(response,"alreadyExists");
      }
    });
  });
}

    
copyItemHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function () {exports.okResponse(response);}
  
  
  checkInputs(response,cob, 'dest',function() {
    var src = cob.src; // source path
    var dst = cob.dest;
    var cmps = cob.components;
    var drepo = pjutil.repoFromPath(dst);
    //console.log("IN copyItem ",src,dst,JSON.stringify(cmps));
    s3.copyItem(src,dst,function (e) {
      if (e) {
        console.log("ERROR in copyItem from ["+src+"] to ["+dst+"]",e);
        fail("copyFailed");
      } else {
        succeed();
      }
    });
  });
}



listHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  session.check(cob,function (sval) {
    if (typeof sval === "string") {
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
        pjutil.log("s3","PREFIXES",prefixes);
        fail("Prefixes is not an array");
      }
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

// mirroring the content of a file at s3 might be mirror url; In this case, the file is grabbed from its source, and that is what is returned


getMfileHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var path = cob.path;
  var  fl = cob.file;
  if (!path) {
    fail("noPath");
    return;
  }
  if (!fl) {
    fail("noFile");
    return;
  }
  s3.getMfile(path,fl,function (e,d) {
    if (e) {
      fail(e);
    } else {
      exports.okResponse(response,d.value,{mirrorOf:d.mirrorOf});
    }
  });
}


putMirrorHandler = function (request,response,cob) {
  var fail = function (msg) {exports.failResponse(response,msg);}
  var succeed = function (vl) {exports.okResponse(response,vl);}

  var path = cob.path;
  if (!path) {
    fail("noPath");
    return;
  }
  
  var url = cob.url;
  if (!url) {
    fail("noUrl");
    return;
  }

  s3.putMirror(path,url,function (v) {
    if (v===1) {
      succeed();
    } else {
      fail(v);
    }
  });
}

// mirroring the content of a file at s3 might be mirror 'url'. In this case, the file is grabbed from its source, and that is what is returned




pages["/api/checkSession"]  = checkSessionHandler;
pages["/api/toS3"] = saveHandler;
pages["/api/deleteItem"] = deleteItemHandler;
pages["/api/saveImage"] = saveImageHandler;
pages["/api/saveData"] = saveDataHandler;
pages["/api/newItem"] = newItemHandler;
pages["/api/listS3"] = listHandler;
pages["/api/setHandle"] = user.setHandleHandler;
pages['/api/logOut'] = user.logoutHandler;
pages['/api/personaLogin'] = persona.login;
pages["/api/twitterRequestToken"] = twitter.getRequestToken;
pages["/api/twitter_callback"] = twitter.callback;
pages["/api/getMfile"] = getMfileHandler;
pages["/api/putMirror"] = putMirrorHandler;
pages["/api/copyItem"] = copyItemHandler;
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
    

exports.okResponse = function (res,vl,otherProps) {
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

  