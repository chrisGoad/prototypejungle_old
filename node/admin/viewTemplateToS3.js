

/*
Utility for updating  the view html file at S3 for an already-present item
(normally, the view is sent at create time, and never after.


To run this script:
cd /mnt/ebs0/prototypejungledev/node
node admin/viewTemplateToS3.js sys/repo0/chart/variants/Flow/adjusted d
or 
node updateS3.js p
*/
var util = require('../util.js');
util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');


var a0 = process.argv[2];

var a1 = process.argv[3];
console.log("ZZ",a0);
if (a1== "p") {
  var pjdir = "/mnt/ebs0/prototypejungle/node/";
} else if (a1 =="d") {
  var pjdir = "/mnt/ebs0/prototypejungledev/node/";
} else {
  console.log("Usage: 'node viewTemplateToS3.js what p' or 'node viewTemplateToS3.js what d', for the production or dev environtments, respectively")
}
if (pjdir) {

      
  function toS3() {
    var path = a0+"/view";
    fpth = pjdir + "view_template_for_s3";
    var vl = fs.readFileSync(fpth);
    console.log("jsToS3 from ",fpth,"to",path);
    s3.save(path,vl,"text/html","utf8",function () {console.log("done")},true);
  }

  toS3();
  
}


