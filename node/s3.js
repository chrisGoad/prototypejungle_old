  /**
     * This is our Node.JS code, running server-side.
     * from http://arguments.callee.info/2010/04/20/running-apache-and-node-js-together/
     */
  


var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/aws.json');

var util = require('./util.js');
//var pjdb = require('./db.js').pjdb;
var pjdb;
var fs = require('fs');
var buffer = require('buffer');
var pj_bucket = "s3.prototypejungle.org";
//var page = require('./page.js');
//var user = require('./user.js');
//var session = require('./session.js');

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
// exclude are extensions to exclude, eg .js
exports.list = function (prefix,exclude,cb) {
  var keys = [];
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  function innerlist(prefix,marker) {
   
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
        cb(e,keys);
      }
      var cn = d.Contents;
      cn.map(function (c) {
        var key = c.Key;
        if (!util.hasExtension(key,exclude)) {
          keys.push(c.Key);
        }
      });
      var ln = keys.length;
      util.log("test","\nListed another batch; now have ",ln," results");
      var lastKey = keys[ln-1];
      util.log("test","Last key: ",lastKey);
      if (d.IsTruncated &&  (ln<=maxList)) {
        innerlist(prefix,lastKey);
      } else {
        util.log("test","Final result ",ln,"keys");
        cb(null,keys);
      }
      //console.log(keys);
    });
  }
  innerlist(prefix);
}


// a bit dangerous!
var maxDeletions = 2;

exports.deleteFiles = function (prefix,cb) {
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  exports.list(prefix,function (e,keys) {
    var numd = Math.min(maxDeletions,keys.length);
    console.log("DELETING ",numd," OBJECTS");
    var deleted = [];
    function innerDelete(n) {
      if (n == numd) {
        cb(null,deleted);
        return;
      }
      var ky = keys[n];
      console.log("DELETING ",ky);
      S3.deleteObject({Bucket:pj_bucket,Key:ky},function (e,d) {
        innerDelete(n+1);
      });
    }
    innerDelete(0);
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
 
