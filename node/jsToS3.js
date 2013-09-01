
/*
Utility for updating the JavaScript files at S3. 


To run this script:
cd /mnt/ebs0/prototypejungledev/node
node jsToS3.js
*/
var util = require('./util.js');
util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('./s3');


var fdir = "/mnt/ebs0/prototypejungle/www/";
var jsdir = fdir + "js/"
function jsToS3(files,n) {
  var ln = files.length;
  if (ln > n) return;
  if (ln==n) { // a bit of a hack: send the one minified file needed at s3
    jsf = "view.js";
    fpth = fdir + "min/" + jsf;
  } else {
    var jsf = files[n];
    var fpth = jsdir+jsf;
  }
  var vl = fs.readFileSync(fpth);
  ctp = "application/javascript"
  path = "/js/"+jsf
  console.log("jsToS3",fpth,path);
  s3.save(path,vl,ctp,"utf8",function () {
    jsToS3(files,n+1);
  },true); //true = don't count
}

var files = ["pj.js","draw.js","error.js","externalize.js","geom.js",
         "instantiate.js","jqprotos.js","jquery.js","lightbox.js",
         "om.js","page.js","shapes.js","util.js","view.js"]
jsToS3(files,0);

