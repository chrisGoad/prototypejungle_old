 
/*
cd
cd pjdn
cd admin
node tests.js pj/variant/ws/TwoR/
node tests.js pj/repo0/pix/variants/TwoArcs/v3
node admin/tests.js sys/repo0/chart/Linear/source.js
node admin/tests.js http://google.com
node admin/tests.js sys/repo0/data/linedata0.json
node admin/tests.js sys/repo0/data/linedata0.json
node admin/tests.js sys/repo0/examples

*/
//var pjdb = require('./db.js').pjdb;
var dyno = require('../dynamo.js');
var user = require('../user.js');
var s3 = require('../s3.js');
var util = require('../util.js');
var sys = require('sys')
var http = require('http');
var dns = require('dns');
util.activeTags.push('test');
util.activeTags.push('s3');
console.log("TEST");

var a0 = process.argv[2];
console.log("ARGVvvv",a0);

if (0) {
  user.get('twitter_chrisGoad');
  dyno.newUser('test_node_user');
}


if (0) {
  s3.list(["sys/"],null,null,function (e,keys) {
    console.log("listed keys",keys);
  });
}


if (0&& a0) {
  s3.list([a0],undefined,undefined,function (e,keys) {
    console.log("listed keys",keys);
  });
}

if (0 && a0) {
  s3.deleteFiles(a0,undefined,undefined,function (e,keys) {
    console.log("listed keys",keys);
  });
}


if (0 && a0) {
  s3.deleteItem(a0,function (e,d) {
    console.log("e,d",e,d);
  });
}

if (0) {
  s3.save("testing111/testing321","<html><body><b>A TEST</b></body></html>","text/html",'utf8', function (e,d) {
    console.log("FROM S3",e,d);
  });
}

if (0 && a0) {
  a0 = "a b d";
  console.log(a0);
  s3.getMfile(a0,function (e,d) {
    console.log("rs",sys.inspect(d));
  });
}


if (0) {
  dns.resolve4('googjlkfjdle.com',function (err,rs) {
    console.log(err,rs);
  });
  //code
  
}


if (0 && a0) {
  a0 = "http://google.com";
  s3.httpGet(a0,function (e,d) {
    console.log("rs",e,d);
  });
}

if (0 && a0) {
  console.log("ZZZZ");
  s3.copy(a0,'copytest/'+a0, function (e,d) {
    console.log("rs",e,d);
  });
}


if (1 && a0) {
  console.log("ZZZZ");
  s3.copyTree(a0,'copytest/'+a0, function (e,d) {
    console.log("rs",e,d);
  });
}



