
/*
Utility for copying trees in at s3



To run this script:
cd /mnt/ebs0/prototypejungledev/node
node s3Copy.js src dst
(eg 
or 
node jsToS3.js
cd /mnt/ebs0/prototypejungle/node
*/
var util = require('./util.js');
util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('./s3');


var a0 = process.argv[2];
var a1 = process.argv[3];
console.log("ARGVv",a0,a1);


  s3.list([a0],null,null,function (e,keys) {
    console.log("listed keys",keys);
  });
}


function jsToS3() {
  var jsf = "view.js";
  var fpth = fdir + "min/" + jsf;
  var path = "/min/"+jsf
  var vl = fs.readFileSync(fpth);
  ctp = "application/javascript"
  console.log("jsToS3 from ",fpth,"to",path);
  s3.save(path,vl,ctp,"utf8",function () {
    console.log("SENT");
  },true); //true = don't count
}

