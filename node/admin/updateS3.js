

/*
Utility for updating  S3.


To run this script:
cd /mnt/ebs0/prototypejungledev/node
node admin/updateS3.js d
or 
node admin/updateS3.js p
*/
var util = require('../util.js');
util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');



var a0 = process.argv[2];

if (a0 == "p") {
  var pjdir = "/mnt/ebs0/prototypejungle/www/";
} else if (a0 =="d") {
  var pjdir = "/mnt/ebs0/prototypejungledev/www/";
} else {
  console.log("Usage: 'node updateS3.js p' or 'node updateS3.js d', for the production or dev environtments, respectively")
}
if (pjdir) {

// Send the only files to s3 needed from development (as opposed to building items)

  function asyncFor(fn,data) {
    console.log("FOR ",fn,data);
    var ln = data.length;
    function asyncFor1(n) {
      if (n==ln) {
        return;
      }
      var dt = data[n];
      fn.call(null,dt,function () {
        asyncFor1(n+1);
      });
    }
    asyncFor1(0);
  }
      
  function toS3(dt,cb) {
    var path = dt[0];
    fpth = pjdir + path;
    var ctp = dt[1];
    var vl = fs.readFileSync(fpth);
    console.log("jsToS3 from ",fpth,"to",path);
    s3.save(path,vl,ctp,"utf8",cb,true);
  }
  var jst = "application/javascript";
  
  var fts = [["style.css","text/css"],["min/common1.js",jst],["min/view.js",jst],["min/core.js",jst],["min/draw.js",jst]];
  asyncFor(toS3,fts);
  /*
  function styleToS3 () {
    var fpth = pjdir + "style.css";
    var path = "style.css";
    var vl = fs.readFileSync(fpth);
    var ctp = "text/css";
    console.log("jsToS3 from ",fpth,"to",path);
    s3.save(path,vl,ctp,"utf8",function () {
      console.log("SENT min/view.js, and style.css");
    },true);
  }
  function toS3(s3jobs) {
    var ln = s3jobs.length;
  
  function toS3() {
    var jsf = "view.js";
    var fpth = pjdir + "min/" + jsf;
    var path = "/min/"+jsf
    var vl = fs.readFileSync(fpth);
    ctp = "application/javascript"
    console.log("jsToS3 from ",fpth,"to",path);
    s3.save(path,vl,ctp,"utf8",styleToS3,true);
  }
  toS3();
  */
  
}


