  /**
     * This is our Node.JS code, running server-side.
     * from http://arguments.callee.info/2010/04/20/running-apache-and-node-js-together/
     */
  


var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/aws.json');

var util = require('./util.js');
var pjdb = require('./db.js').pjdb;

var fs = require('fs');
var buffer = require('buffer');
var pj_bucket = "s3.prototypejungle.org";
var page = require('./page.js');
var user = require('./user.js');
var session = require('./session.js');

var maxSavesPerHour = 1000;

var countSaves = function (cb) {
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

// call back returns "s3error","countExceeded", or 1 for success
exports.save = function (path,value,contentType,encoding,cb) {
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
  });
}

var beginsWith = function (s,p) {
  var ln = p.length;
  return s.substr(0,ln)==p;
}



var viewToS3 = function(pth,cb) {
  util.log("s3","VIEWTOS3",pth);
  var cwd = process.cwd();
  var vwt = fs.readFileSync("view_template_for_s3");
  exports.save(pth,vwt,"text/html","utf8",cb);
}
   
exports.saveHandler = function (request,response,cob) {
  var fail = function (msg) {page.failResponse(response,msg);}
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

      exports.save(path,vl,ctp, encoding,function (x) {
        util.log("s3","FROM s3 save",x);
        if ((typeof x!="number")) {
          page.failResponse(response,x);
          return;
        }
        vwf = cob.viewFile;
        if (vwf) {
          viewToS3(vwf,function (x) {
            util.log("s3","FROM viewTOS3",x);
            if ((typeof x=="number")) {
              page.okResponse(response);
            } else {
              page.failResponse(response,x);
            }
          });
        } else {
          page.okResponse(response);
        }
      });
    });
  });
}
