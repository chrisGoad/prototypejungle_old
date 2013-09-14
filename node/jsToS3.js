
/*
Utility for updating the JavaScript files at S3. 


To run this script:
cd /mnt/ebs0/prototypejungledev/node
node jsToS3.js
or 
node jsToS3.js
cd /mnt/ebs0/prototypejungle/node
*/
var util = require('./util.js');
util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('./s3');


var cwd = process.cwd();
if (cwd.indexOf('prototypejungledev')>=0) {
  var fdir = "/mnt/ebs0/prototypejungledev/www/";
} else {
  fdir = "/mnt/ebs0/prototypejungle/www/";
}
var jsdir = fdir + "js/"

// now, the only file needed at s3 is the minimized version of view.js


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
jsToS3();
/*
function jsToS3(files,n) {
  var ln = files.length;
  if (n > ln) return;
  if (ln==n) { // a bit of a hack: send the one minified file needed at s3
    var jsf = "view.js";
    var fpth = fdir + "min/" + jsf;
    var path = "/min/"+jsf
  } else {
    var jsf = files[n];
    var fpth = jsdir+jsf;
    var path = "/js/"+jsf
 }
  var vl = fs.readFileSync(fpth);
  ctp = "application/javascript"
  console.log("jsToS3 from ",fpth,"to",path);
  s3.save(path,vl,ctp,"utf8",function () {
    jsToS3(files,n+1);
  },true); //true = don't count
}
*/
/*
var files = ["pj.js","draw.js","error.js","externalize.js","geom.js",
         "instantiate.js","jqprotos.js","jquery.js","lightbox.js",
         "om.js","page.js","shapes.js","util.js","view.js"]
*/
//var files = ["inspect.js","view.js","loginout.js","chooser2.js"]
//jsToS3(files,0);

