 /* A utility for listing s3 directories 

cd /mnt/ebs0/prototypejungledev/node;node admin/logs.js

*/

var pattern = "2014-09-05";
var a0 = process.argv[2];
console.log("A0",a0);
var s3 = require('../s3');
var aws  = s3.aws;
var zlib = require('zlib');

console.log("LOGS");

s3.listLogs(function (e,d) {
    var bucket = "prototypejungle_log";
    var fd = d.filter(function (f) {
        return f.indexOf(pattern) > 0;
    });
    console.log("Found ",fd.length," log files ");
    fd.forEach(function (logFile) {
    console.log(logFile);
    var S3 = new aws.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    S3.getObject({Bucket:bucket,Key:logFile},function (e,d) {
      if (d) {
        //console.log("OK",d.Body.length);
        //return;
        zlib.unzip(d.Body,function (e,rs) {
          var lines = rs.toString().split('\n').slice(2);
          lines.forEach(function (line) {
            var sp = line.split('\t');
            var sps = sp.slice(0,6);
            sps.push(sp[7]);
            sps.push(sp[8]);
            var ast = sps.join(' ');;
            console.log(ast);
          });
         // console.log("RS",rs.toString());
        });
      }
    });
      
    });
});
 
