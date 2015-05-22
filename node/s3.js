// Generally, paths DO NOT start with / ; they are eg sys/repo/chart/component/Bubble1
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/aws.json');

var util = require('./util.js');
var http = require('follow-redirects').http;
var dns = require('dns');
var url = require('url');

exports.aws = AWS;
exports.maxAge = 0; // used in copying in s3; maybe change some day
//util.activateTagForDev("s3");
var pjdb;
var fs = require('fs');
var buffer = require('buffer');
var pj_bucket = "prototypejungle.org";

// some throttling

var maxSavesPerHour = 2000;//000;
var maxSaveSize = 50000; 

// for now, this is not in use. Only anon saves are counted,via putSave
var countSaves = function (cb,dontCount) {
  if (1 || dontCount) { //disabled for now
    cb(0);
    return;
  }
  if (!pjdb) pjdb = require('./db.js').pjdb;
  var hrs = Math.floor(Date.now()/(3600*1000))-382548; // since a particular hour on 8/22/2013
  var ky = "s3count_"+hrs;
  pjdb.get(ky,function (e,d) {
    if (e) {
      var cnt = 1;
    } else {
      var cnt = parseInt(d)+1;
    }
    if (cnt > maxSavesPerHour) {
      cb("saveCountExceeded");
      return;
    }
    util.log("s3","Save count for hrs="+hrs+" bumped to ",cnt);
    pjdb.put(ky,cnt,function (e,d) {
      if (cb) {
        cb(null,cnt);
      }
    });
  });
}

exports.maxList = 2000;
// includes,excludes are extensions, eg .js
exports.list = function (prefixes,include,exclude,cb) {
  var keys = [];
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  var pln = prefixes.length;
  var listNextPrefix = function (n) {
    util.log("test","listing prefix ",n,prefixes[n]);
    if (n>=pln) {
      cb(null,keys);
      return;
    }
    var innerlist = function (prefix,marker,icb) {
      var p = {
        Bucket:pj_bucket,
      }
      if (prefix) {
        p.Prefix = prefix;
      }
      if (marker) {
        p.Marker = marker;
      }
      p.MaxKeys = 900;
      S3.listObjects(p,function (e,d) {
        if (e) {
          icb();
        }
        
        var cn = d.Contents;
        cn.map(function (c) {
          var key = c.Key;
          if (include && !util.hasExtension(key,include)) return;
          if (exclude && util.hasExtension(key,exclude)) return;
            keys.push(c.Key);
        });
        var ln = keys.length;
        util.log("test","\nListed another batch; now have ",ln," results");
        var lastKey = keys[ln-1];
        util.log("test","Last key: ",lastKey);
        if (d.IsTruncated &&  (ln<=(exports.maxList))) {
          innerlist(prefix,lastKey,icb);
        } else {
          util.log("test","Final result ",ln,"keys");
          icb();
        }
      });
    }
    
    innerlist(prefixes[n],undefined,function () {listNextPrefix(n+1)});
  }
  listNextPrefix(0);
}

  


// a bit dangerous!
var maxDeletions = 200;
// todo use deleteObjects instead
exports.deleteFiles = function (prefix,include,exclude,cb) {
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  exports.list([prefix],include,exclude,function (e,keys) {
    util.log("s3","READY FOR DELETE");
    var numd = Math.min(maxDeletions,keys.length);
    util.log("s3","DELETING ",numd," OBJECTS");
    var deleted = [];
    function innerDelete(n) {
      if (n === numd) {
        cb(null,deleted);
        return;
      }
      var ky = keys[n];
      util.log("s3","DELETING ",ky);
      S3.deleteObject({Bucket:pj_bucket,Key:ky},function (e,d) {
        util.log("s3","DELETED",ky);
        deleted.push(ky);
        innerDelete(n+1);
      });
    }
    innerDelete(0);
  });
}

exports.deleteTheseFiles = function (prefix,files,cb) {
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  util.log("s3","READY FOR DELETE THESE");
  var numd = files.length;
  var deleted = [];
  var n = 0;
  function innerDelete(n) {
    if (n === numd) {
      cb(null,deleted);
      return;
    }
    var ky = prefix + "/" + files[n];
    util.log("s3","DELETING ",ky);
    S3.deleteObject({Bucket:pj_bucket,Key:ky},function (e,d) {
      util.log("s3","DELETED",ky);
      deleted.push(ky);
      innerDelete(n+1);
    });
  }
  innerDelete(0);
}

var itemFiles = ["data.js","item.js","source.js","kind variant","kind codebuilt","kind variant public","kind codebuilt public"];

exports.deleteItem = function (ky,cb) {
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  util.log("s3","DELETING item ",ky);
  exports.deleteTheseFiles(ky,itemFiles,function (e,d) {
    util.log("s3","DELETED item ",ky);
    cb(e,d);
    if (e) {
      cb(e);
    } else {
      exports.listHandle(util.handleFromPath(ky),cb);
    }
  });
}

// call back returns "s3error","countExceeded", or null for success

exports.save = function (path,value,options,cb) {
  var contentType = options.contentType;
  var contentEncoding = options.contentEncoding;
  var encoding = options.encoding;
  var dontCount = 1;// options.dontCount; For now, only counting anon saves
  var sizeLimited = options.sizeLimited;
  var maxAge = (options.maxAge === undefined)?0:options.maxAge;
  var sz = value.length;
  if (sizeLimited && (sz > maxSaveSize)) {
    util.log("s3","In save",sz,"EXCEEDED MAX SAVE SIZE",maxSaveSize);
    cb("Exceeded maxSaveSize");
    return;
  }
  countSaves(function (err,cnt) {
    if (err) {
      cb(err);
      return;
    }
    var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    util.log("s3","save to s3 at ",path," with contentType",contentType,"encoding",
             encoding,"max-age",maxAge,"size",sz);
    var bf = new buffer.Buffer(value,encoding);
    if (path[0]==="/") {
      path = path.substr(1);
    }
    var cc = "max-age="+maxAge;
    var p = {
      Bucket:pj_bucket,
      Body:bf,
      ContentType:contentType,
      ContentEncoding:contentEncoding,
      CacheControl:cc,
      ACL:'public-read',
      Key:path
    }
    S3.putObject(p,function (e,d) {
      if (e) {
        util.log("error",e);
        if (cb) cb("s3error");
      } else {
        if (cb) cb(null);
      }
    });
  },dontCount);
}

var simulateCopy = 0; // for safely checking copy operations
exports.copy = function (isrc,idst,cb) {
  var src = util.stripInitialSlash(isrc);
  var dst = util.stripInitialSlash(idst);
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  util.log("s3","copy in s3 from ",src," to ",dst);
  var p = {
    Bucket:pj_bucket,
    CopySource:"prototypejungle.org/"+src,
    MetadataDirective:"COPY",
    CacheControl: "max-age="+exports.maxAge,
    ACL:"public-read",
    Key:dst
  }
  if (simulateCopy) {
    console.log("Simulating copy of ",src," to ",dst);
    cb();
  } else {
    console.log("Copying ",src," to ",dst);
  
    S3.copyObject(p,cb);
  }
}

// src and dst DO NOT start  with "/"

exports.copyFiles = function (src,dst,files,cb) {
  var fn = function (fln,cb) {
    exports.copy(src+"/"+fln,dst+"/"+fln,cb);
  }
  util.asyncFor(fn,files,cb,true);//tolerate errors; not every file must exist
}


// files is an array of objects {name:name,value:value,contentType:contentType}
exports.saveFiles = function (path,files,cb,encoding,sizeLimited) {
  var fn = function (dt,cb) {
    var fpth = path + "/" +  dt.name;
    var vl = dt.value;
    util.log("saving to ",fpth);
    var ctp = dt.contentType;
    exports.save(fpth,vl,{contentType:ctp,encoding:encoding,sizeLimited:sizeLimited},cb);
  }
  util.asyncFor(fn,files,cb);
}



// transfers the item, with the following additional capability:
// if dst is in a different repo than src, then all components mentioned are made absolute ("."s replaced with full pathnames)

var transferItem = function (src,dst,cb) {
  var srcs = src.split("/");
  var dsts = dst.split("/");
  var srci = src+"/item.js";
  var dsti = dst+"/item.js";
  debugger;
  var samerepo = (srcs[0]===dsts[0]) && (srcs[1]===dsts[1]);
  util.log("s3","TRANSFER ITEM FROM ",srcs," TO ",dsts," SAME REPO ",samerepo);
  if (samerepo) {
    exports.copy(srci,dsti,cb);
  } else {
    exports.getObject(srci,function (e,its) {
      if (e) {
        cb(e);
        return;
      }
      var frepo = "http://prototypejungle.org/"+srcs[0]+"/"+srcs[1];
      var m = its.match(/assertItemLoaded\((.*)\)\;\n/);
      if (!m) {
        util.log("s3","BAD Bad form for item.js");
        cb("Bad form for item.js");
        return;
      }
      var m1 = m[1];
      try {
        var ito = JSON.parse(m[1]);
      } catch(e) {
        cb("BAD JSON");
        return;
      }
      var assertln = 39 + m1.length; // the lenght of the assertion part of the incoming string
      var rst = its.substring(assertln);
      var cms = ito.__requires;
      var modmade = 0;
      if (cms) {
        var keys = Object.keys(cms);
        keys.forEach(function (key) {
          var c = cms[key]; 
          if (c.repo===".") {
            c.repo = frepo;
            modmade = 1;
          }
        });
        //code
      }
      if (modmade) {
        var mit = "prototypeJungle.om.assertItemLoaded("+JSON.stringify(ito)+");\n"+rst;
      } else {
        mit = its;
      }
      exports.save(dsti,mit,{contentType:"application/javascript",encoding:"utf-8"},cb);
    });
  }
}
    
// in copying between repos  if src has a reference to another member of its repo,  the corresponding ref in the copy will be to dst's repo
// for use in copying whole repos while preserving structure.

exports.copyItem = function (src,dst,cb) {
  exports.copyFiles(src,dst,["kind codebuilt","kind variant","source.js"],function (e) {
    if (e) {
      cb(e);
      return
    }
    transferItem(src,dst,cb);
  });
}
 


exports.backupItem = function (src,dst,cb) {
  exports.copyFiles(src,dst,["item.js","code.js","data.js","kind codebuilt","kind variant","source.js","svg.html"],cb); // @todo view?
}

exports.copyBetweenRepos = function (srcR,dstR,itm,cb) {
  exports.copyItem1(srcR+itm,dstR+itm,cb,1);
}



exports.mcopyBetweenRepos = function (srcR,dstR,items,cb) {
  items.forEach(function (itm) {
     exports.copyItem1(srcR+itm,dstR+itm,cb,1);
  });
}

exports.copyToNewBucket= function (src,cb) {
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  util.log("s3","copy to new bucket ",src);
  var p = {
    Bucket:new_bucket,
    CopySource:"s3.prototypejungle.org/"+src,
    CacheControl: "max-age="+exports.maxAge,
    MetadataDirective:"COPY",
    ACL:"public-read",
    Key:src
  }
  S3.copyObject(p,cb);
}

exports.copyTree = function (src,dst,cb,tolerateErrors) {
  exports.list([src],null,null,function (e,keys) {
    if (e) {
      cb(e);
      return;
    }
    var lns = src.length;
    var forop = function (k,cb) {
      kwp = k.substr(lns);
      exports.copy(k,dst+kwp,function (e,d) {
        cb(e);
      },tolerateErrors);
    }
    //forop(keys[0],function (){});
    //return;
    util.asyncFor(forop,keys);
  });
}
      

// http.get throws an error, killing the sever, if the domain is bad.
// so I use dns to check first.


exports.httpGet = function (iurl,cb) {
  util.log("s3","http get from ",iurl);
  var o = url.parse(iurl);
  if (!o.host){
    cb("noHost",undefined);
    return;
  }
  dns.resolve4(o.host,function (err,rs) {
    if (err) {
      cb("badHost",undefined);
      return;
    }
    var chunks = [];

    var req = http.get(o,function (res) {
      
      util.log("s3",'request status',res.statusCode);
      if (res.statusCode != 200) {
        cb("missing",undefined);
        return;
      }
      res.on('data', function( data ) {
        chunks.push(data);
      });
      res.on('end', function () {
        var dt = Buffer.concat(chunks);
        var dts = dt.toString();
        cb(undefined,dts);
      });
      res.on('error',function (err) {
        cb(err,undefined);
      });
    });
    req.end();
  });
}

function removeLeadingSlash(s) {
  if (s[0]=="/") {
    return s.substring(1);
  } else {
    return s;
  }
}
//mirroring not yet in use
// mirroring the content of a file at s3 might be mirror url; In this case, the file is grabbed from its source, and that is what is returned
// get possibly mirrored file
// ipath is the path of an item, which might have an associated mirror file, whose contents should have the form "mirror url;"
 exports.getMirror = function (ipath,cb) {
    var path = removeLeadingSlash(ipath);
    var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    util.log("s3","getMirror from s3 at ",path);
    S3.getObject({Bucket:pj_bucket,Key:path+"/mirror.txt"},function (e,d) {
      if (e) {
        cb("noMirror",undefined);
        return;
      }
      var s = d.Body.toString();
      var m = s.match(/^mirror\s+([^\;]*)\;/)
      if (m) {
        var url = m[1];
        util.log("s3","Mirror from ",url);
        exports.httpGet(url,function (e,d) {
          if (e) {
            cb(e);
          } else {
            cb(undefined,{mirrorOf:url,value:d});
          }
        })
      } else {
        cb("badMirror",undefined);
      }
    });
 }
 
  exports.putMirror = function(ipath,url,cb) {
    var txt = "mirror "+url+";";
    var fpth = removeLeadingSlash(ipath) + "/mirror.txt"
    exports.save(fpth,txt,{contentType:"text/plain",encoding:"utf8"},cb);
  }

  
  
// gets the mirror is present, and otherwise fl
  exports.getMfile = function (ipath,fl,cb) {
    var path = removeLeadingSlash(ipath);
    exports.getMirror(path,function (e,d) {
      if (e) {
        var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
        S3.getObject({Bucket:pj_bucket,Key:path+"/"+fl},function (e,d) {
          if (d) {
            cb(e,{value:d.Body.toString()});
          } else {
            cb(e,d);
          }
        });
      } else {
        cb(undefined,d);
      }
    });
  }

// just lift
 exports.getObject = function (ipath,cb) {
    var path = removeLeadingSlash(ipath);
    var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    util.log("s3","getObject from s3 at ",path,'bucket',pj_bucket);
    S3.getObject({Bucket:pj_bucket,Key:path},function (e,d) {
      if (d) {
        cb(e,d.Body.toString());
      } else {
        cb(e,d);
      }
    });
 }
 
 
//We keep track of all of the items for handle hnd in eg "prototypejungle.org/sys list.js" for handle sys
// These lists are used in the chooser


exports.listHandle = function(hnd,cb) {
  exports.list([hnd+"/"],null,['.js'],function (e,keys) {
    util.log("s3","listed keys",keys.length," for ",hnd);
    var rs = "";
    keys.forEach(function (key) {
      // include only the kind xxx files
      var afs = util.afterLastChar(key,"/");
      if (util.beforeChar(afs," ",1)=== "kind") {
        rs += key+"\n";
      }
    });
    exports.save(hnd + " list.js",rs,{contentType:"application/javascript",encoding:"utf8"},cb);
  });
}



exports.listRepo = function(repo,cb) {
  exports.list([repo+"/"],null,null,function (e,keys) {
    util.log("s3","listed keys",keys.length," for ",repo);
    var rs = [];
    var n = 0;
    var ln =  repo.length;
    keys.forEach(function (key) {
      if (1 || !(util.endsIn(key,"/view")|| util.endsIn(key,"/svg"))) {
        var lstSlash = key.lastIndexOf("/");
        rs.push(key.substring(ln+1));//.substring(0,lstSlash));// drop the last part of the path
        n++;
      }
    });
    cb(rs);
  });
}

exports.listLogs = function(cb) {
  pj_bucket = "prototypejungle_log";
  exports.list(["pj_logs/"],null,null,function (e,keys) {
    util.log("s3","listed keys",keys.length);
    cb(e,keys);
  });
}


 
