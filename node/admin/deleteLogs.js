 /* A utility for listing s3 directories 

cd /mnt/ebs0/prototypejungledev/node;node admin/deleteLogs.js 2014-09-

// for deleting cloudfront logs
*/
 

var pattern = process.argv[2];

//var pattern = "2014-09-1";
var maxCount = 1000;

var a0 = process.argv[2];
console.log("A0",a0);
var s3 = require('../s3');
var aws  = s3.aws;
var zlib = require('zlib');

console.log("DELETING LOGS ",pattern);
s3.maxList = 10000;

s3.listLogs(function (e,d) {
    var bucket = "prototypejungle_log";
    // build the kind of argument that deleteObjects expects
    var obs = [];
    d.forEach(function (logFile) {
      if (logFile.indexOf(pattern)>0) {
        obs.push({Key:logFile});
      }
    });
    var numd = Math.min(maxCount,obs.length);
    console.log("DELETING ",numd,' out of ',obs.length,' LOG FILES matching',pattern);
    if (obs.length === 0) {
        return;
    }
    obs = obs.slice(0,maxCount);
    var S3 = new aws.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    S3.deleteObjects({Bucket:"prototypejungle_log",Delete:{Objects:obs}},function (e,d) {
        console.log("error",e);
        console.log('DELETION DONE');
    });
    
});
 
