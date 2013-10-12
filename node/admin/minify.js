
/*
Javascript compression
run this on both dev and production after every code modification.
cd pdjn
node admin/minify.js d
or
node admin/minify.js p

*/


var a0 = process.argv[2];

if (a0 == "p") {
  var pjdir = "/mnt/ebs0/prototypejungle/www/";
} else if (a0 =="d") {
  var pjdir = "/mnt/ebs0/prototypejungledev/www/";
} else {
  console.log("Usage: 'node minify.js p' or 'node minify.js d', for the production or dev environtments, respectively")
}
if (pjdir) {

var minify = require('minify');
var fs = require('fs');
var srcdir = pjdir +"js/";
var destdir = pjdir + "min/";

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

function compress(files,dest,cb) {
  var ffiles = files.map(function (fl) {return srcdir+fl});
  var ifile =destdir+"big_"+dest;
  var fdest = destdir+dest;
  concatFiles(files,ifile);
  minify.optimize(ifile,{callback:function (compressed) {
    fs.writeFileSync(fdest,compressed);
    console.log("wrote ",fdest);
    fs.unlinkSync(ifile);
    if (cb) cb();
  }});
}


var commonFiles1 = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js",
                    "externalize.js","jquery.js","jqprotos.js","geom.js","draw.js","canvas.js","shapes.js"];
var inspectFiles = ["tree.js","lightbox.js","inspect.js","error.js","page.js"];
var viewFiles =  ['view.js'];
var pjdFiles = commonFiles1.concat(['codemode.js']);// for standalone use in external code; pjd means "with drawing"
var pjcFiles = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js",
                    "externalize.js"];// for standalone use in external code; pjc means "prototypejungle core"
var buildFiles = ['page.js','build.js','error.js'];


var commonFiles2 = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js"];
var loginoutFiles = ["login.js","page.js","error.js"];
var chooser2Files = ["jquery.js","jqprotos.js","chooser2.js"]
var view_dataFiles = ["jquery.js","jqprotos.js","page.js","view_data.js","error.js"]
var minFiles = ["pj.js","util1.js","page.js"]



function mcompress(compressionJobs) {
  var cjs = compressionJobs;
  var ln = cjs.length;
  
  function imcompress(n) {
    if (n == ln) return;
    var cj = cjs[n];
    compress(cj[0],cj[1],function () {
      imcompress(n+1);
    });
  }
  imcompress(0);
}


console.log("START");

mcompress([[commonFiles1,"common1.js"],
           [commonFiles2,"common2.js"],
           [inspectFiles,"inspect.js"],
           [viewFiles,"view.js"],
           [pjcFiles,"core.js"],
           [pjdFiles,"draw.js"],
           [loginoutFiles,"loginout.js"],
           [chooser2Files,"chooser2.js"],
           [view_dataFiles,"view_data.js"],
           [buildFiles,"build.js"],
           [minFiles,"min.js"]]);

           
}



