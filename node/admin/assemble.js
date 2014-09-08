/*
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js d


The major parts of the system are assembled into the single files: pjcs, pjdom and pjui
*/

var versions = require("./versions.js");

var util = require('../util.js');

var fs = require('fs');
var s3 = require('../s3');
var minify = require('minify');
var zlib = require('zlib');

var maxAge = 0;

var om_files = ["pj","om","event","exception","update","instantiate","externalize","internalize","install","log"];
//var om_files = ["pj","om","event","exception"];
var dom_files = ["marks","geom","data","dom1","jxon","svg","html","uistub","domstringify"];
//var dom_files = ["marks","geom","data","dom1","jxon","svg","html","uistub"];

var ui_files = ["ajax","constants","ui","page","save","svgx","dom2","tree1","tree2","lightbox",
             "inspect1","inspect2"];
var topbar_files = ["pj",,"exception","log","small","ajax","min_ui","constants","page","standalone_page"];
var chooser_files = ["ajax","ui","constants","page","save","chooser"];
var view_files = ["constants","view"];
var loginout_files = topbar_files.concat(["login"]);
var worker_files = ["pj","exception","log","small","ajax","worker"];
var bubble_files = ["bubbles"];

function doGzip(file,cb) {
  console.log("gzipping ",file);
  var gzip = zlib.createGzip();
  var inp = fs.createReadStream(file);
  var out = fs.createWriteStream(file+'.gz');
  inp.pipe(gzip).pipe(out);
  out.on('close',cb);
}



var dev = process.argv[2] === 'd';

//console.log("DEV ",dev);
//fjklsjfsl;

function fullName(f) {
  return "/mnt/ebs0/prototypejungle"+(dev?"dev":"")+"/www/js/"+f+".js";
}

function extract(fl) {
  var fln = fullName(fl);
  var cn = ""+fs.readFileSync(fln)
  var sex = cn.indexOf("\n//start extract")+ ("//start extract".length + 2);
  var eex = cn.indexOf("\n//end extract")-1;
  console.log(fl,"sex=",sex,"eex = ",eex);
   var ex = cn.substring(sex,eex);
 // console.log(ex);
   return ex;
}

function mextract(fls) {
  var rs = "";
  fls.forEach(function (fl) {
    rs += extract(fl);
  });
  return rs;
}

function mkS3Path(which,version,mini) {
  return (dev?"":"")+"js/"+which+"-"+version+(mini?".min":"")+".js";
}

function mkLocalFile(which,version,mini) {
  return "/mnt/ebs0/prototypejungle"+(dev?"dev":"")+"/www/js/"+which+"-"+version+(mini?".min":"")+".js";
}

function mkModule(which,version,contents,cb) {
  console.log('mkModule',which,version);
  var rs = contents;
  var path = mkS3Path(which,version,0);
  var minpath = mkS3Path(which,version,1);
  var file = mkLocalFile(which,version,0);
  var minfile = mkLocalFile(which,version,1);
  console.log("Saving to path ",path," file ",file);
  fs.writeFileSync(file,rs);
  s3.save(path,rs,{contentType:"application/javascript",encoding:"utf8",dontCount:1},function (err) {
    minify.optimize(file,function (err,compressed) {
      console.log("Saving the compressed file to ",minfile);
      fs.writeFileSync(minfile,compressed); // save the compressed version locally
      doGzip(minfile,function () { // finally ,gzip it;
        console.log("gzipping done");
        var minfgz = fs.readFileSync(minfile+".gz");
        console.log("LENGTH ",minfgz.length);
        s3.save(minpath,minfgz,{contentType:"application/javascript",encoding:"utf8",
                contentEncoding:"gzip",dontCount:1,maxAge:maxAge},cb);// and save the gzipped file to s3
      });
    });
  });
}

/*
 
function mkModule(which,version,contents,cb) {
  console.log('mkModule',which,version);
  var rs = contents;
  var path = mkS3Path(which,version,0);
  var minpath = mkS3Path(which,version,1);
  var file = mkLocalFile(which,version,0);
  var minfile = mkLocalFile(which,version,1);
  console.log("Saving to path ",path," file ",file);
  fs.writeFileSync(file,rs);
  s3.save(path,rs,"application/javascript","utf8",
    function () {
      minify.optimize(file,function (err,compressed) {
            console.log("Saving the compressed file to ",minpath);
            s3.save(minpath,compressed,"application/javascript","utf8",cb,true);
        });
    },true);
}

*/
                     
                     
                  
function mk_pjcs(cb) {
  console.log("mk_pjcs");
  var fls = om_files;
  var rs =
  '\nwindow.prototypeJungle =  (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n";
  mkModule("pjcs",versions.pjcs,rs,cb);
}
/*
function mk_pjdom(cb) {
  var fls = dom_files;
  var rs = '(function (pj) {\n"use strict"\nvar om=pj.om;'+mextract(fls) + '\n})(prototypeJungle);\n'
  mkModule('pjdom','0.9.0',rs,cb);
}
// pj contains both cs and dom
*/
function mk_pjdom(cb) {
  var fls = om_files.concat(dom_files);
  var rs =
  '\nwindow.prototypeJungle =  (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n";
  mkModule("pjdom",versions.pjdom,rs,cb);
  
}
function mk_pjui(cb) {
  var fls = ui_files;
  var rs = "(function (pj) {\n\nvar om=pj.om,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
  mkModule('pjui',versions.pjui,rs,cb);

}
// used to support the top bar for website pages
function mk_pjtopbar(cb) {
  var fls = topbar_files;
  console.log("Files:",fls);
  var rs =
  '\nwindow.prototypeJungle =  (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n";
  mkModule("pjtopbar",versions.pjtopbar,rs,cb);

}
function mk_pjchooser(cb) {
  var fls = chooser_files;
  var rs = "(function (pj) {\n\nvar om=pj.om,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
  
  mkModule("pjchooser",versions.pjchooser,rs,cb);

}

function mk_pjview(cb) {
  var fls = view_files;
  var rs = "(function (pj) {\n\nvar om=pj.om,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
  
  mkModule("pjview",versions.pjview,rs,cb);

}


function mk_pjloginout(cb) {
  var fls = loginout_files;
  var rs =   '\nwindow.prototypeJungle =  window.pj = (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n";
  mkModule("pjloginout",versions.pjloginout,rs,cb);
}



function mk_pjworker(cb) {
  var fls = worker_files;
  var rs =   '\nwindow.prototypeJungle =  window.pj = (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n";
  mkModule("pjworker",versions.pjworker,rs,cb);
}



function mk_bubbles(cb) {
  var fln = fullName("bubbles");
  var cn = ""+fs.readFileSync(fln)
  mkModule("pjbubbles",versions.pjworker,cn,cb);
}

var afn = function (d,cb) {
  d(cb);
}
var jobs = [mk_pjcs,mk_pjdom,mk_pjui,mk_pjtopbar,mk_pjchooser,mk_pjview,mk_pjloginout,mk_pjworker,mk_bubbles];
//var jobs = [mk_pjtopbar];

util.asyncFor(afn,jobs,function () {console.log("S3 Save  DONE");});


