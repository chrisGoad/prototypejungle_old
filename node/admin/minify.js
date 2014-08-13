
/*
Javascript compression
run this on both dev and production after every code modification.
cd pjdn
cd /mnt/ebs0/prototypejungledev/node;node admin/minify.js d
or
node admin/minify.js d

*/


var a0 = process.argv[2];

if (a0 === "p") {
  var srcdir = "/mnt/ebs0/prototypejungle/www/js/";
  var dstdir = "/js/";
} else if (a0 ==="d") {
  var srcdir = "/mnt/ebs0/prototypejungledev/www/js/";
  dstdir = "/djs/";
} else {
  console.log("Usage: 'node minify.js p' or 'node minify.js d', for the production or dev environtments, respectively")
}
if (srcdir) {

var minify = require('minify');
var util = require('../util.js');

var fs = require('fs');
var cf = require('./codeFiles.js');
var s3 = require('../s3');
s3.useNewBucket();


function concatFiles(files,dest) {
  var ffiles = files.map(function (fl) {return srcdir+fl});
  var rs = "";
  var bf = 
  ffiles.forEach(function (fl) {
    var fc = fs.readFileSync(fl);
    rs += fc;
  });
  console.log('dest',dest);
  fs.writeFileSync(dest,rs);
  console.log('concat length ',rs.length);
}

function compress(dt,cb) {
  var files = dt[0];
  var dest = dt[1];
  var path = dstdir + dest;
  if (files.length === 1) {
    var ifile = files[0];
  } else {
    var ffiles = files.map(function (fl) {return srcdir+fl});
    var ifile =srcdir+"big_"+dest;
  //var fdest = srcdir+dest;
    concatFiles(files,ifile);
    console.log("Concatenated ",files,"to ",ifile);
  }
  
  minify.optimize(ifile,{callback:function (compressed) {
    console.log("Saving the compressed file to ",path);
     s3.save(path,compressed,"application/javascript","utf8",function () {if (cb) cb();},true);
  }});
}
/*
var commonFiles1 = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js",
                    "externalize.js","html_parser.js","dom.js","domprotos.js","geom.js","marks.js","draw.js","canvas.js","shapes.js"];
var inspectFiles = ["color_picker.js","tree.js","lightbox.js","inspect.js","error.js","page.js"];
var viewFiles =  ['view.js'];
var scratchFiles = ["codemode.js","page.js","scratch.js","error.js"];
var pjdFiles = commonFiles1.concat(['codemode.js']);// for standalone use in external code; pjd means "with drawing"
var pjcFiles = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js",
                    "externalize.js"];// for standalone use in external code; pjc means "prototypejungle core"
var buildFiles = ['page.js','build.js','error.js'];


var commonFiles2 = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js"];
var loginoutFiles = ["login.js","page.js","error.js"];
var chooser2Files = ["html_parser.js","dom.js","domprotos.js","chooser2.js"]
var view_dataFiles = ["html_parser.js","dom.js","domprotos.js","page.js","view_data.js","error.js"]
var minFiles = ["pj.js","util1.js","page.js"]

*/

function mcompress(compressionJobs) {
  util.asyncFor(compress,compressionJobs,function (){console.log("DONE");},true);
}


console.log("START");
//console.log('MIN',cf.minFiles);
mcompress([[cf.csFiles,"pjcs-0.9.0.min.js"],
           [cf.domFiles,"pjdom-0.9.0.min.js"]]);

}



