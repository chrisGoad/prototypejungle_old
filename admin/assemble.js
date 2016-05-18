/*
cd ~/storage_server_dev;node admin/assemble.js  core  d d
cd ~/storage_server_dev;node admin/assemble.js  editor  d d
cd ~/storage_server_dev;node admin/assemble.js  chooser  d d
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  dom  d d
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  draw  d p
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  ui  d d
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  page  d p 

cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  dev  p p
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  ui  p p
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  view  p p
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  chooser  p p
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  topbar  p p
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  worker  p p
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  chart   d d
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  insert   d d



var jobsByWhat = {core:[mk_pjcore],dom:[mk_pjdom],ui:[mk_pjui],inspect:[mk_pjinspect],draw:[mk_pjdraw],dev:[mk_pjdev],
                  view:[mk_pjview],insert:[mk_pjinsert],
                  chooser:[mk_pjchooser],login:[mk_pjloginout],topbar:[mk_pjtopbar],worker:[mk_pjworker],
                  rest:[mk_pjtopbar,mk_pjloginout,mk_pjwor

cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  dom d d
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  ui p p
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  ui p p
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js  ui p p

cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js d p

cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js p p
hw
The project relies on a exploiting the prototypical roots of javascript, via  the prototype tree data strucure,
which is, briefly,  a javascript tree threaded with inheritance chains. 
The major parts of the system are assembled into the single files: pjcs, pjdom and pjui
*/
var what = process.argv[2]; // should be core,dom,ui,inspect or rest (topbar,chooser,view,loginout,worker,bubbles)
var fromDev = process.argv[3] === 'd';
var toDev = process.argv[4] === 'd';
 
console.log('fromDev = ',fromDev,'toDev = ',toDev);
var versions = require("./versions.js");
//var util = require('../ssutil.js');

var fs = require('fs');
//var s3 = require('../s3');
var minify = require('minify');
var zlib = require('zlib');    

//var maxAge = 7200;
var maxAge = toDev?0:7200;
var core_files = ["pj","tree","event","exception","update","instantiate","externalize","internalize","install","log"];
core_files = core_files.map(function (f) { return "core/"+f;});

//var dom_files = ["marks","geom","data","install_data","dom1","jxon","svg","html","uistub","domstringify"];
var dom_files = ["spread","geom","data","dom1","jxon","svg","html","uistub","domstringify"];
dom_files = dom_files.map(function (f) { return "dom/"+f;});

var ui_files = ["svg_serialize","ajax","poster", "constants","firebase","ui","browser","page","save",
                "dom2","controls","svgx","tree1","tree2","lightbox","test"];
//var ui_files = ["svg_serialize","ajax","poster", "constants","ui","browser"];//"page","save","dom2","controls","svgx","tree1","tree2","lightbox"];
//var ui_files = ["svg_serialize","ajax","poster","constants","ui"];//,"browser"];//"page","save","dom2","controls","svgx","tree1","tree2","lightbox"];

//var ui_files = ["ajax","constants","ui","browser","page","save","svgx","dom2","tree1","tree2","lightbox",
//         "inspect1","inspect2"];
  
ui_files = ui_files.map(function (f) { return "ui/"+f;});

var insert_files = ["insert"];

insert_files = insert_files.map(function (f) { return "editor/"+f;});

var inspect_files = ["inspect1","inspect2"];
inspect_files = inspect_files.map(function (f) { return "inspect/"+f;});

var dev_files = ["dev1","dev2"];
dev_files = dev_files.map(function (f) { return "dev/"+f;});

var draw_files = ["draw1","draw2"];
draw_files = draw_files.map(function (f) { return "draw/"+f;});


var page_files = ["part1","part2"];
page_files = page_files.map(function (f) { return "page/"+f;});

//var core = "core/";

//var topbar_files = ["core/pj","core/exception","core/log","core/small","ui/ajax","ui/min_ui",
//                    "ui/browser","ui/constants","ui/page","ui/standalone_page"];

var topbar_files = ["editor/page_top"];

var chooser_files = ["ui/ajax","ui/ui","ui/constants","ui/page","ui/save","editor/chooser"];

var view_files = ["ui/poster","ui/constants","ui/min_ui","ui/view"];

var loginout_files = topbar_files.concat(["ui/login"]);
 
var worker_files = ["core/pj","core/exception","core/log","core/small","ui/ajax","editor/worker"];

var bubble_files = ["app/bubbles"];


var editor_files = ["editor/constants","editor/page_top","editor/page","editor/init"];

function doGzip(file,cb) {
  console.log("gzipping ",file);
  var gzip = zlib.createGzip();
  var inp = fs.createReadStream(file);
  var out = fs.createWriteStream(file+'.gz');
  inp.pipe(gzip).pipe(out);
  out.on('close',cb);
}


var asyncFor = function (fn,data,cb,tolerateErrors) {
    var ln = data.length;
    function asyncFor1(n) {
      if (n===ln) {
        if (cb) {
          cb(undefined,data);
        }
        return;
      }
      var dt = data[n];
      fn.call(null,dt,function (e) {
        if (e) {
          if (tolerateErrors) {
            asyncFor1(n+1);
          } else if (cb) {
            cb(e);
          }
        } else {
          asyncFor1(n+1);
        }
      });
    }
    asyncFor1(0);
  }



function fullName(f) {
  return 'js/'+f+".js";
  //var dir = util.beforeChar(f,'/');
  //var rs =  "/home/ubuntu/"+(fromDev?"xfer_prototypejungle":"git/www")+"/js/"+f+".js";
  //console.log("FULLNAME OF",f,rs);
  //return rs;
}

function extract(fl) {
  var fln = fullName(fl);
  console.log("Reading from ",fln);
  var cn = ""+fs.readFileSync(fln);
  var sex0 = cn.indexOf("\n//start extract");
  if (sex0 < 0) {
    return cn;
  }
  var sex = sex0 + ("//start extract".length + 2);
  var eex = cn.indexOf("\n//end extract")-1;
  var ex = cn.substring(sex,eex);
  return ex;
}

function getContents(fl) {
  var fln = fullName(fl);
  console.log("Reading from ",fln);
  var cn = ""+fs.readFileSync(fln)
  return cn;
}

function mextract(fls) {
  var rs = "";
  fls.forEach(function (fl) {
    rs += extract(fl);
  });
  return rs;
}

function mkS3Path(which,version,mini) {
  return (toDev?"www/djs/":"www/js/")+which+"-"+version+(mini?".min":"")+".js";
}

function mkLocalFile(which,version,mini) {
  return "/home/ubuntu/staging/www/js/"+which+"-"+version+(mini?".min":"")+".js";
}

function mkModule(which,version,contents,cb) {
  console.log('mkModule',which,version);
  var rs = contents;
  var path = mkS3Path(which,version,0);
  var minpath = mkS3Path(which,version,1);
  //var file = mkLocalFile(which,version,0);
  //var minfile = mkLocalFile(which,version,1);
  //var bucket = "prototypejungle.org";
  console.log("Saving to path ",path);
  fs.writeFileSync(path,rs);
  //s3.setBucket(bucket);
  minify(path,function (err,compressed) {
    //minify.optimize(file,function (err,compressed) {
      console.log("Saving the compressed file to ",minpath);
      fs.writeFileSync(minpath,compressed); // save the compressed version locally
      doGzip(minpath,function () { // finally ,gzip it;
        console.log("gzipping done");
        return;
        var minfgz = fs.readFileSync(minfile+".gz");
        console.log("LENGTH ",minfgz.length);
          console.log("Saving minimized to path ",minpath," from file ",minfile);

        s3.save(minpath,minfgz,{contentType:"application/javascript",encoding:"utf8",
                contentEncoding:"gzip",dontCount:1,maxAge:maxAge},cb);// and save the gzipped file to s3
      });
    });
}
                     
                     
                  
function mk_pjcore(cb) {
  console.log("mk_pjcore");
  var fls = core_files;
  var rs =
  '\nwindow.prototypeJungle =  (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n";
  mkModule("pjcore",versions.pjcore,rs,cb);
}

function mk_pjdom(cb) { 
  var fls = core_files.concat(dom_files);
  var rs =
  '\nwindow.prototypeJungle =  (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n";
  mkModule("pjdom",versions.pjdom,rs,cb);
  
}

function mk_pjui(cb) { 
  var fls = ui_files;
  var rs = "(function (pj) {\n\nvar om=pj.om,geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
 // var rs = "(function (pj) {\n\nvar om=pj.om,geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
  mkModule('pjui',versions.pjui,rs,cb);

}



function mk_pjpage(cb) { 
  var fls = page_files;
  var rs = "(function (pj) {\n\nvar om=pj.om,geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;tree=pj.tree;lightbox=pj.lightbox;\n"+
 // var rs = "(function (pj) {\n\nvar om=pj.om,geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
  mkModule('pjpage',versions.pjpage,rs,cb);

}



function mk_pjinspect(cb) {
  var fls = inspect_files;
  var rs = "(function (pj) {\n\nvar geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;lightbox=pj.lightbox,tree=pj.tree\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
  mkModule('pjinspect',versions.pjinspect,rs,cb);
}


function mk_pjdev(cb) {
  var fls = dev_files;
  var rs = "(function (pj) {\n\nvar geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;lightbox=pj.lightbox,tree=pj.tree\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
  mkModule('pjdev',versions.pjdev,rs,cb);
}

function mk_pjdraw(cb) {
  var fls = draw_files;
  var rs = "(function (pj) {\n\nvar geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;lightbox=pj.lightbox,tree=pj.tree\n"+

// var rs = "(function (pj) {\n\nvar dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
  mkModule('pjdraw',versions.pjdraw,rs,cb);f

}
// used to support the top bar for website pages
function mk_topbar(cb) {
  var fls = topbar_files;
  console.log("Files:",fls);
  var rs =
  '\nwindow.prototypeJungle = {};\n(function (pj) {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})(prototypeJungle);\n";
  mkModule("topbar",versions.topbar,rs,cb);

}
function mk_pjchooser(cb) {
  var fls = chooser_files;
  var rs = "(function (pj) {\n\nvar dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
  
  mkModule("chooser",versions.pjchooser,rs,cb);

}

function mk_pjview(cb) {
  var fls = view_files;
  var rs = "(function (pj) {\n\nvar dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
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


function mk_insert(cb) {
  debugger;
  var rs = getContents('editor/insert');
  mkModule('insert',versions.pjui,rs,cb);

}
function mk_editor(cb) { 
  var fls = editor_files;
  var rs = "(function (pj) {\n\nvar geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;tree=pj.tree;lightbox=pj.lightbox;\n"+
 // var rs = "(function (pj) {\n\nvar om=pj.om,geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
            '"use strict"\n'+
             mextract(fls,1) + "\n})(prototypeJungle);\n"
  mkModule('editor',versions.editor,rs,cb);

}

function mk_bubbles(cb) {
  var fln = fullName("app/bubbles");
  var cn = ""+fs.readFileSync(fln)
  mkModule("pjbubbles",versions.pjworker,cn,cb);
}


var afn = function (d,cb) {
  d(cb);
}
var jobsByWhat = {core:[mk_pjcore],dom:[mk_pjdom],ui:[mk_pjui],inspect:[mk_pjinspect],draw:[mk_pjdraw],dev:[mk_pjdev],
                  view:[mk_pjview],insert:[mk_insert],page:[mk_pjpage],
                  chooser:[mk_pjchooser],login:[mk_pjloginout],topbar:[mk_topbar],worker:[mk_pjworker],editor:[mk_editor],
                  rest:[mk_topbar,mk_pjloginout,mk_pjworker,mk_bubbles]}
                  
var jobs = jobsByWhat[what]; 

if (jobs) {
  console.log("ASSEMBLING ",what);
  //var jobs = [mk_pjom,mk_pjdom,mk_pjui,mk_pjtopbar,mk_pjchooser,mk_pjview,mk_pjloginout,mk_pjworker,mk_bubbles];
  asyncFor(afn,jobs,function () {console.log("S3 Save  DDONE");});
} else {
  console.log("NO ASSEMBLY INSTRUCTIONS EXIT FOR ",what);
}


