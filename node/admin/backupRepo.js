 
/*
cd /mnt/ebs0/prototypejungledev/node;node admin/backupRepo.js sys/repo0

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


var src = process.argv[2];
console.log("src",src);

var dst = process.argv[3];
console.log("dst",dst);

s3.listRepo(src,function (rs) {
  console.log(rs);
})

 



