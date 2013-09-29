
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/aws.json');

var util = require('./util.js');
util.activeTags.push("s3");
//var pjdb = require('./db.js').pjdb;
var pjdb;
var fs = require('fs');
var buffer = require('buffer');
var pj_bucket = "s3.prototypejungle.org";
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
      if (n == numd) {
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
   

// call back returns "s3error","countExceeded", or 1 for success
exports.save = function (path,value,contentType,encoding,cb,dontCount) {
  countSaves(function (cnt) {
    var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    util.log("s3","save to s3 at ",path," with contentType",contentType,"encoding",encoding);
    var bf = new buffer.Buffer(value,encoding);
    if (path[0]=="/") {
      path = path.substr(1);
    }
    var p = {
      Bucket:pj_bucket,
      Body:bf,
      ContentType:contentType,
      ACL:'public-read',
      Key:path
    }
    S3.putObject(p,function (e,d) {
      if (e) {
        util.log("error",e);
        cb("s3error");
      } else if (cnt == "saveCountExceeded") {
        cb(cnt);
      } else {
        cb(1);
      }
    });
  },dontCount);
}



exports.viewToS3 = function(pth,cb) {
  util.log("s3","VIEWTOS3",pth);
  var cwd = process.cwd();
  var vwt = fs.readFileSync("view_template_for_s3");
  exports.save(pth,vwt,"text/html","utf8",cb);
}
 
