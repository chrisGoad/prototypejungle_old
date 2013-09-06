 

var pjdb = require('./db.js').pjdb;
var dyno = require('./dynamo.js');
var user = require('./user.js');
var s3 = require('./s3.js');
var util = require('./util.js');

util.activeTags.push('test');

if (0) {
  user.get('twitter_chrisGoad');
  dyno.newUser('test_node_user');
}

if (0) {
  s3.list("pj/function",function (e,keys) {
    console.log("listed keys",keys);
  });
}

if (0) {
  s3.deleteFiles("pj/function",function (e,keys) {
    console.log("listed keys",keys);
  });
}

if (1) {
  s3.save("testing111/testing321","<html><body><b>A TEST</b></body></html>","text/html",'utf8', function (e,d) {
    console.log("FROM S3",e,d);
  });
}