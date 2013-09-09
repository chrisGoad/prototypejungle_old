 

var pjdb = require('./db.js').pjdb;
var dyno = require('./dynamo.js');
var user = require('./user.js');
var s3 = require('./s3.js');
var util = require('./util.js');

util.activeTags.push('test');
console.log("TEST");

var a0 = process.argv[2];
console.log("ARGVv",a0);

if (0) {
  user.get('twitter_chrisGoad');
  dyno.newUser('test_node_user');
}


if (1) {
  s3.list(["pj/"],null,['.jpg'],function (e,keys) {
    console.log("listed keys",keys);
  });
}

if (0 && a0) {
  s3.deleteFiles(a0,undefined,undefined,function (e,keys) {
    console.log("listed keys",keys);
  });
}

if (0) {
  s3.save("testing111/testing321","<html><body><b>A TEST</b></body></html>","text/html",'utf8', function (e,d) {
    console.log("FROM S3",e,d);
  });
}