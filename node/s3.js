//http://www.huffingtonpost.com/alain-de-botton/news-consumption-difficult-_b_4848709.html
// Generally, paths DO NOT start with / ; they are eg sys/repo/chart/component/Bubble1

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/aws.json');

var util = require('./util.js');
var http = require('follow-redirects').http;
//var http = require('http')
var dns = require('dns');
var url = require('url');

//util.activateTagForDev("s3");
//var pjdb = require('./db.js').pjdb;
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

exports.deleteItem = function (ky,cb) {
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  util.log("s3","DELETING item ",ky);
  exports.deleteFiles(ky,null,null,function (e,d) {
        util.log("s3","DELETED item ",ky);
        cb(e,d);
  });
}
var maxAge = 0;
// call back returns "s3error","countExceeded", or 1 for success
exports.save = function (path,value,contentType,encoding,cb,dontCount) {
  countSaves(function (cnt) {
    var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    util.log("s3","save to s3 at ",path," with contentType",contentType,"encoding",encoding);
    var bf = new buffer.Buffer(value,encoding);
    if (path[0]==="/") {
      path = path.substr(1);
    }
    var p = {
      Bucket:pj_bucket,
      Body:bf,
      ContentType:contentType,
      CacheControl: "max-age="+maxAge,
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
        if (cb) cb(1);
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
    CacheControl: "max-age="+maxAge,
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
  util.asyncFor(fn,files,cb,false);
}

var swapRepo0 = function (path,repoBefore,repoAfter) {
  console.log("swapRepo",path,repoBefore,repoAfter);
  if (path.indexOf(repoBefore) !== 0) return path;
  return repoAfter + path.substr(repoBefore.length);
}

// recurse in an externalized prototree, swapping repo
// repos should have the form /x/handle/repo
var swapRepoX = function (x,repoBefore,repoAfter) {
  if (!x) return x;
  var tp = typeof x;
  if (tp !== "object") return x;
  var isa = Array.isArray(x);
  if (isa) {
    var rs = x.map(function (v) {
      return swapRepoX(v,repoBefore,repoAfter);
    });
  } else {
    var rs = {};
    for (var k in x) {
      var v = x[k];
      if ((k === "__prototype__")||(k === "__reference__")) {
        var nv = swapRepo0(v,repoBefore,repoAfter);
      } else {
        nv = swapRepoX(v,repoBefore,repoAfter);
      }
      rs[k] = nv;
    }
  }
  return rs;
    //code
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
  if (betweenRepos) {
    var srcRepo = "/x/"+util.repoFromPath(src);
    var dstRepo = "/x/"+util.repoFromPath(dst);
    //console.log("srcRepo",srcRepo);
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
    //console.log(its);
    var m = its.match(/assertItemLoaded\((.*)\)$/);
    //console.log(its);
    //console.log(m[1]);
    var ito = JSON.parse(m[1]);
    //var dto = JSON.parse(dts);
    ito.path = "/x/"+dst;
    if (betweenRepos) {
      ito.value = swapRepoX(ito.value,srcRepo,dstRepo);
      if (ito.components) {
        swapRepoC(ito.components,srcRepo,dstRepo);
      }
    }
    //ito.url = "http://prototypejungle.org/"+dst;
    aits = "prototypeJungle.om.assertItemLoaded("+JSON.stringify(ito)+")";
    //adts = JSON.stringify(dto);
    
    exports.save(dst+"/item.js",aits,"application/javascript","utf-8",function (n) {
      if (typeof n !== "number") {
        cb(n);
        return;
      }
      var cdf = src + "/code.js";
      exports.getObject(cdf,function (e,cds) {
        if (e) {
          cb(e);
          return;
        }
        // fix up the code file for its new location
        var idxsemi = cds.indexOf(";");
        var rcds = cds.substr(idxsemi);
        var ncds = '(function () {\nvar item = prototypeJungle.x.';
        var dstp = dst.replace(/\//g,".");
        var idxacd = rcds.indexOf('prototypeJungle.om.assertCodeLoaded("');
        rcds = rcds.substring(0,idxacd);
        ncds += dstp + rcds;
        ncds += 'prototypeJungle.om.assertCodeLoaded("/x/'+dst+'");\n})()';
        exports.save(dst+"/code.js",ncds,"application/javascript","utf-8",function (n) {
          if (typeof n !== "number") {
            cb(n);
            return;
          }
          exports.copyFiles(src,dst,["data.js","kind codebuilt","source.js"],cb); // @todo view?
        });
     
      });
    });
  });
}

exports.copyItem = function (src,dst,cb) {
  exports.copyItem1(src,dst,cb);
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
    CacheControl: "max-age="+maxAge,
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
      //console.log("inner ",k);
      kwp = k.substr(lns);
      exports.copy(k,dst+kwp,function (e,d) {
        cb(e);
      },tolerateErrors);
    },keys);
  });
}
      


exports.viewToS3 = function(pth,cb) {
  util.log("s3","VIEWTOS3",pth);
  var cwd = process.cwd();
  var vwt = fs.readFileSync("view_template_for_s3");
  exports.save(pth,vwt,"text/html","utf8",cb);
}

// nothing to with S3, but whatever

exports.hhttpGet = function (url,cb) {
  var o = {host:'google.com',port:80,path:'/index.html'}
  http.get(o,function (r) {
    cb(undefined,r);
  });
}
try {
  
} catch(e) {
  alert(e);
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
        //var rs = data.toString();
        //cb(undefined,data.toString());
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
  
  
  //var fln = "/mnt/ebs0/prototypejungle"+((a0==="p")?"":"dev")+ "/www/syslist.json"
    exports.list([hnd+"/"],null,['.js'],function (e,keys) {
      //console.log("listed keys",keys);
      var rs = "";
      var n = 0;
      keys.forEach(function (key) {
        if (!util.endsIn(key,"/view")) {
          rs += key+"\n";
          n++;
        }
      });
     // fs.writeFileSync(fln,rs,{flag:'w'});
      var dst = hnd + "/syslist.js"
      //console.log("WROTE ",n," KEYS TO ",dst);
      exports.save(hnd + " list.js",rs,"application/javascript","utf8",cb);
    });

  }


 
