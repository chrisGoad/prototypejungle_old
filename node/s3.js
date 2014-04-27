//http://www.huffingtonpost.com/alain-de-botton/news-consumption-difficult-_b_4848709.html
// Generally, paths DO NOT start with / ; they are eg sys/repo/chart/component/Bubble1

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/aws.json');

var util = require('./util.js');
var http = require('follow-redirects').http;
var dns = require('dns');
var url = require('url');

util.activateTagForDev("s3");
var pjdb;
var fs = require('fs');
var buffer = require('buffer');
var old_bucket = "s3.prototypejungle.org";
var new_bucket = "prototypejungle.org";
var pj_bucket = new_bucket;
exports.useNewBucket = function () {
  pj_bucket = new_bucket;
}

var maxSavesPerHour = 1000;

var countSaves = function (cb,dontCount) {
  if (dontCount) {
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
        cb(cnt);
      }
    });
  });
}

var maxList = 2000;
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
        if (d.IsTruncated &&  (ln<=maxList)) {
          innerlist(prefix,lastKey);
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

var itemFiles = ["code.js","data.js","item.js","source.js","view","kind variant","kind codebuilt"];

exports.deleteItem = function (ky,cb) {
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  util.log("s3","DELETING item ",ky);
  exports.deleteTheseFiles(ky,itemFiles,function (e,d) {
    util.log("s3","DELETED item ",ky);
    if (e) {
      cb(e);
      return;
    }
    exports.listHandle(util.handleFromPath(ky),cb);
  });
}
exports.maxAge = 0;
// call back returns "s3error","countExceeded", or null for success
exports.save = function (path,value,contentType,encoding,cb,dontCount) {
  countSaves(function (cnt) {
    var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    util.log("s3","save to s3 at ",path," with contentType",contentType,"encoding",encoding);
    var bf = new buffer.Buffer(value,encoding);
    if (path[0]==="/") {
      path = path.substr(1);
    }
    var cc = "max-age="+exports.maxAge;
    console.log("MAX AGE for ",path," is ",cc);
    var p = {
      Bucket:pj_bucket,
      Body:bf,
      ContentType:contentType,
      CacheControl:cc,
      ACL:'public-read',
      Key:path
    }
    S3.putObject(p,function (e,d) {
      if (e) {
        util.log("error",e);
        if (cb) cb("s3error");
      } else if (cnt === "saveCountExceeded") {
        if (cb) cb(cnt);
      } else {
        if (cb) cb(null);
      }
    });
  },dontCount);
}

exports.copy = function (isrc,idst,cb) {
  var src = util.stripInitialSlash(isrc);
  var dst = util.stripInitialSlash(idst);
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  console.log("s3","copy in s3 from ",src," to ",dst);
  var p = {
    Bucket:pj_bucket,
    CopySource:"prototypejungle.org/"+src,
    MetadataDirective:"COPY",
    CacheControl: "max-age="+exports.maxAge,
    ACL:"public-read",
    Key:dst
  }
  S3.copyObject(p,cb);
}

// src and dst DO NOT start  with "/"

exports.copyFiles = function (src,dst,files,cb) {
  var fn = function (fln,cb) {
    exports.copy(src+"/"+fln,dst+"/"+fln,cb);
  }
  util.asyncFor(fn,files,cb,true);//tolerate errors; not every file must exist
}

var swapRepo0 = function (path,repoBefore,repoAfter,urlBefore,urlAfter) {
  console.log("swapRepo",path,repoBefore,repoAfter,urlBefore,urlAfter);
  if (path.indexOf(repoBefore) !== 0) {
      if (path.indexOf(urlBefore) !== 0) {
        return path;
      } else {
        return urlAfter + path.substr(urlBefore.length);
      }
  } else {
    return repoAfter + path.substr(repoBefore.length);
  }
}

// recurse in an externalized prototree, swapping repo
// repos should have the form /x/handle/repo
var swapRepoX = function (x,repoBefore,repoAfter,urlBefore,urlAfter) {
  if (!x) return x;
  var tp = typeof x;
  if (tp !== "object") return x;
  var isa = Array.isArray(x);
  if (isa) {
    var rs = x.map(function (v) {
      return swapRepoX(v,repoBefore,repoAfter,urlBefore,urlAfter);
    });
  } else {
    var rs = {};
    for (var k in x) {
      var v = x[k];
      if ((k === "__prototype__")||(k === "__reference__")||(k === "__source__")) {
        var nv = swapRepo0(v,repoBefore,repoAfter,urlBefore,urlAfter);
      } else {
        nv = swapRepoX(v,repoBefore,repoAfter,urlBefore,urlAfter);
      }
      rs[k] = nv;
    }
  }
  return rs;
}

var swapRepoC = function (x,repoBefore,repoAfter) {
  //console.log("SWAPC",x);
  x.forEach(function (v) {
      v.path = swapRepo0(v.path,repoBefore,repoAfter);
    });
}

// in copying between repos  if src has a reference to another member of its repo,  the corresponding ref in the copy will be to dst's repo
// for use in copying whole repos while preserving structure.


  
exports.copyItem1 = function (src,dst,cb,betweenRepos) {
  var sr = util.repoFromPath(src);
  var dr = util.repoFromPath(dst);
  if (betweenRepos) {
    var srcRepo = "/x/"+sr;
    var dstRepo = "/x/"+dr;
    var srcUrl = "http://prototypejungle.org/"+sr;
    var dstUrl = "http://prototypejungle.org/"+dr;
  }
  var itf = src + "/item.js";
  var dm = dst.match(/([^/]*\/[^/]*)$/);
  var dstPth =  dm[1];
  // path  needs adjusting in item.js
  exports.getObject(itf,function (e,its) {
    if (e) {
      cb(e);
      return;
    }
    var m = its.match(/assertItemLoaded\((.*)\)$/);
    var ito = JSON.parse(m[1]);
    ito.path = "/x/"+dst;
    if (betweenRepos) {
      ito.value = swapRepoX(ito.value,srcRepo,dstRepo,srcUrl,dstUrl);
      if (ito.components) {
        swapRepoC(ito.components,srcRepo,dstRepo);
      }
    }
    aits = "prototypeJungle.om.assertItemLoaded("+JSON.stringify(ito)+")";    
    exports.save(dst+"/item.js",aits,"application/javascript","utf-8",function (e) {
      if (e) {
        cb(e);
        return;
      }
      var cdf = src + "/code.js";
      exports.getObject(cdf,function (e,cds) {
        if (e) {
          cb(e);
          return;
        }
        // fix up the code file for its new location
        util.log("copyItem","Original code",cds);
        var idxsemi = cds.indexOf(";");
        var rcds = cds.substr(idxsemi);
        var ncds = '(function () {\nvar item = prototypeJungle.x.';
        var dstp = dst.replace(/\//g,".");
        var idxacd = rcds.indexOf('prototypeJungle.om.assertCodeLoaded("');
        rcds = rcds.substring(0,idxacd);
        ncds += dstp + rcds;
        ncds += 'prototypeJungle.om.assertCodeLoaded("/x/'+dst+'");\n})()';
        util.log("copyItem","Modified code",ncds);
        exports.save(dst+"/code.js",ncds,"application/javascript","utf-8",function (e) {
          if (e) {
            cb(e);
            return;
          }
          exports.copyFiles(src,dst,["data.js","kind codebuilt","kind variant","source.js"],cb); // @todo view?
        });
     
      });
    });
  });
}

exports.copyItem = function (src,dst,cb,betweenRepos) {
  exports.copyItem1(src,dst,function () {
    exports.listHandle(util.handleFromPath(dst),cb,betweenRepos);
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
    util.asyncFor(function (k,cb) {
      kwp = k.substr(lns);
      exports.copy(k,dst+kwp,function (e,d) {
        cb(e);
      },tolerateErrors);
    },keys);
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
    exports.save(fpth,txt,"text/plain","utf8",cb);
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
    util.log("s3","getObject from s3 at ",path);
    S3.getObject({Bucket:pj_bucket,Key:path},function (e,d) {
      if (d) {
        cb(e,d.Body.toString());
      } else {
        cb(e,d);
      }
    });
 }
 
 
 

exports.listHandle = function(hnd,cb) {
  exports.list([hnd+"/"],null,['.js'],function (e,keys) {
    util.log("s3","listed keys",keys.length," for ",hnd);
    var rs = "";
    var n = 0;
    keys.forEach(function (key) {
      if (!(util.endsIn(key,"/view")|| util.endsIn(key,"/svg"))) {
        rs += key+"\n";
        n++;
      }
    });
    var dst = hnd + "/syslist.js"
    exports.save(hnd + " list.js",rs,"application/javascript","utf8",cb);
  });
}



exports.listRepo = function(repo,cb) {
  exports.list([repo+"/"],null,null,function (e,keys) {

  //exports.list([repo+"/"],null,['.js'],function (e,keys) {
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
/*
exports.backupRepo = function (src,dst,cb) {
  exports.listRepo(src,function (rs) {
    rs.forEach(function (itm) {
      
    })
  }
}
*/

 
