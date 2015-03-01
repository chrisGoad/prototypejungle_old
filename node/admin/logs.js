 /* A utility for listing cloudfront logs

cd /mnt/ebs0/prototypejungledev/node;node admin/logs.js 2014-11-25
cat cloudLogs/log*11-22.txt | grep inspect
cat cloudLogs/log*11-25.txt | grep tech


*/
var pattern = process.argv[2];
var s3 = require('../s3');
var aws  = s3.aws;
var zlib = require('zlib');
var fs = require('fs');

console.log("LOGS for ["+pattern+"]");
var dst = '/mnt/ebs0/prototypejungledev/node/cloudLogs/log_'+pattern+'.txt';
s3.maxList = 10000;
s3.listLogs(function (e,d) {
    var frs = '';
    console.log(d[20]);
    var bucket = "prototypejungle_log";
    var fd = d.filter(function (f) {
        //console.log("FF",f,pattern);
        return f.indexOf(pattern) > 0;
    }); 
    console.log("Found ",fd.length," log files ");
    var numLogFiles = fd.length;
    if (numLogFiles === 0) {
        return;
    }
    var i = 0;
    var logFile = fd[i];
    //console.log(logFile);
    var S3 = new aws.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
    var getCallback = function (e,d) {
      if (d) {
        zlib.unzip(d.Body,function (e,rs) {
          if (i%10 === 0) console.log("i",i);
          var lines = rs.toString().split('\n').slice(2);
          lines.forEach(function (line) {
            var sp = line.split('\t');
            var sps = sp.slice(0,6);
            sps.push(sp[7]);
            sps.push(sp[8]);
            var ast = sps.join(' ');;
            frs += ast + "\n";
          });
          i++;
          if (i >= numLogFiles) {
            console.log("Log file ",dst);
            console.log("Log file length",frs.length);
            fs.writeFileSync(dst,frs);
          } else {
            var logFile = fd[i];
            S3.getObject({Bucket:bucket,Key:logFile},getCallback);
          }
        });
      } else {
        console.log("ERROR ",e);
      }
    }
    S3.getObject({Bucket:bucket,Key:logFile},getCallback);
});
 
