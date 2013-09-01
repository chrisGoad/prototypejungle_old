 
var testingUser=0,testingS3=1;

var pjdb = require('./db.js').pjdb;
var dyno = require('./dynamo.js');
var user = require('./user.js');
var s3 = require('./s3.js');


if (testingUser) {
  user.get('twitter_chrisGoad');
  dyno.newUser('test_node_user');
}

if (testingS3) {
  s3.list();
  return;
  s3.save("/testing11/testing22","<html><body><b>A TEST</b></body></html>","text/html", function (e,d) {
    console.log("FROM S3",e,d);
  });
}