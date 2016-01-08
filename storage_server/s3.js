// Generally, paths DO NOT start with / ; they are eg sys/repo/chart/component/Bubble1
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/aws.json');

var ssutil = require('./ssutil.js');
//var http = require('follow-redirects').http;
//var dns = require('dns');
//var url = require('url');

exports.aws = AWS;
exports.maxAge = 0; // used in copying in s3; maybe change some day
//ssutil.activateTagForDev("s3");
var pjdb;
var fs = require('fs');
var buffer = require('buffer');
var pj_bucket = "prototypejungle.org";

exports.setBucket = function (b) {
  pj_bucket = b; 
}
// some throttling

var maxSavesPerHour = 2000;//000;
var maxSaveLength = 50000; 


// call back returns "s3error","countExceeded", or null for success

exports.save = function (path,value,options,cb) {
  var contentType = options.contentType;
  var contentEncoding = options.contentEncoding;
  var encoding = options.encoding;
  var dontCount = 1;// options.dontCount; For now, only counting anon saves
  var sizeLimited = options.sizeLimited;
  var maxAge = (options.maxAge === undefined)?0:options.maxAge;
  var sz = value.length;
  if (sizeLimited && (sz > maxSaveLength)) {
    ssutil.log("s3","In save",sz,"EXCEEDED MAX SAVE SIZE",maxSaveLength);
    cb("Exceeded maxSaveLength");
    return;
  }
  /*countSaves(function (err,cnt) {
    if (err) {
      cb(err);
      return;
    }
    */
    var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    ssutil.log("s3","save to s3 at ",path," with contentType",contentType,"encoding",
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
        ssutil.log("error",e);
        if (cb) cb("s3error");
      } else {
        if (cb) cb(null);
      }
    });
 // },dontCount);
}


function removeLeadingSlash(s) {
  return (s[0]=="/")?s.substring(1):s;
}
// just lift
 exports.getObject = function (ipath,cb) {
    var path = removeLeadingSlash(ipath);
    var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    ssutil.log("s3","getObject from s3 at ",path,'bucket',pj_bucket);
    S3.getObject({Bucket:pj_bucket,Key:path},function (e,d) {
      if (d) {
        cb(e,d.Body.toString());
      } else {
        cb(e,d);
      }
    });
 }
 

// files is an array of objects {name:name,value:value,contentType:contentType}
exports.saveFiles = function (path,files,cb,encoding,sizeLimited) {
  var fn = function (dt,cb) {
    var fpth = path + "/" +  dt.name;
    var vl = dt.value;
    ssutil.log("saving to ",fpth);
    var ctp = dt.contentType;
    exports.save(fpth,vl,{contentType:ctp,encoding:encoding,sizeLimited:sizeLimited},cb);
  }
  ssutil.asyncFor(fn,files,cb);
}




  

