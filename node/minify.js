
/*
Javascript compression
run this on both dev and production
node minify.js
*/
var minify = require('minify');
var fs = require('fs');
var srcdir = "../www/js/";
var destdir = "../www/min/";

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


var commonFiles = ["pj.js","util.js","om.js","instantiate.js","externalize.js","jquery.js","jqprotos.js","geom.js","draw.js","shapes.js"];
var inspectFiles = commonFiles.concat(["tree.js","lightbox.js","inspect.js","error.js","page.js"]);
var viewFiles = commonFiles.concat(['view.js']);
var loginoutFiles = ["pj.js","util.js","om.js","login.js","page.js","error.js"];
var chooser2Files = ["pj.js","util.js","om.js","instantiate.js","jquery.js","jqprotos.js","chooser2.js"]
var buildFiles = commonFiles.concat(['page.js','build.js','error.js']);


compress(inspectFiles,'inspect.js',function() {
  compress(viewFiles,'view.js',function () {
    compress(loginoutFiles,'loginout.js',function () {
      compress(chooser2Files,'chooser2.js',function () {
        compress(buildFiles,'build.js');
      });
    });
  });
});
//compress(buildFiles,'build.js');
