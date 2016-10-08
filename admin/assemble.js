var toProtochart = 0;
/*
 
 hmmmm

cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js d p

cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js p p
hw
The project relies on a exploiting the prototypical roots of javascript, via  the prototype tree data strucure,
which is, briefly,  a javascript tree threaded with inheritance chains. 
The major parts of the system are assembled into the single files: pjcs, pjdom and pjui
*/
var what = process.argv[2]; // should be core,dom,ui,inspect or rest (topbar,chooser,view,loginout,worker,bubbles)
//var fromDev = process.argv[3] === 'd';
//var toDev = process.argv[4] === 'd';
 
//console.log('fromDev = ',fromDev,'toDev = ',toDev);
var versions = require("./versions.js");
//var util = require('../ssutil.js');

 
var fs = require('fs');
//var s3 = require('../s3');
var minify = require('minify');
//var compressor = require('node-minify');
var zlib = require('zlib');    


var core_files = ["pj","tree","event","exception","update","instantiate","serialize","deserialize","install","log"];
core_files = core_files.map(function (f) { return "core/"+f;});

var dom_files = ["spread","geom","data","dom1","jxon","svg","html","uistub","domstringify","firebase","view"];
dom_files = dom_files.map(function (f) { return "dom/"+f;});

//var ui_files = ["svg_serialize","ajax","constants","firebase","ui","browser",
var ui_files = ["ui","svg_serialize","browser",
                //"page",
                "save","dom2","controls","svgx","tree1","tree2","lightbox"];
  
ui_files = ui_files.map(function (f) { return "ui/"+f;});

//var chooser_files = ["ui/ajax","ui/ui","ui/constants","editor/chooser"];
var chooser_files = ["ui/ui","editor/chooser"];

//var view_files = ["ui/poster","ui/constants","ui/min_ui","ui/view"];
var view_files = ["ui/view"];

//var editor_files = ["editor/constants","editor/page_top","editor/page","editor/init"];
var editor_files = ["editor/page_top","editor/catalog","editor/data","editor/page","editor/init"];

var code_editor_files = ["code_editor/page_top","editor/catalog","code_editor/page","code_editor/init"];

function doGzip(file,cb) {
  console.log("gzipping ",file);
  var gzip = zlib.createGzip();
  var inp = fs.createReadStream(file);
  var out = fs.createWriteStream(file+'.gz');
  inp.pipe(gzip).pipe(out);
  out.on('close',cb);
}



function fullName(f) {
  return 'js/'+f+".js";
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
    rs += getContents(fl);
  });
  return rs;
}


function mkPath(which,version,mini) {
  
  return (toProtochart?"../protochart/":"")+"www/js/"+which+"-"+version+(mini?".min":"")+".js";
}


function mkModule(which,version,contents,cb) {
  console.log('mkModule',which,version);
  var rs = contents;
  var path = mkPath(which,version,0);
  var minpath = mkPath(which,version,1);
  var gzPath =  mkPath(which,version,1);
  console.log("Saving to path ",path);
  fs.writeFileSync(path,rs);
  minify(path,function (err,compressed) {
      console.log(err,"Saving the compressed file to ",minpath,!!compressed);
      fs.writeFileSync(minpath,compressed); // save the compressed version locally
      doGzip(minpath,function () { // finally ,gzip it;
        console.log("gzipping done");
      });
      
  });
}
 
 
  //var minifier = new compressor.minify;
  /*
  new compressor.minify({type:'gcc',
           fileIn:path,
           fileOut:minpath,
           callback:function (err,min) {
             console.log(err,"Saved the compressed file to ",minpath);
             doGzip(minpath,function () { 
               console.log("gzipping done");
             });
           } 
  });
*/                    
                     
                 


function mk_pjcore(cb) { 
  var fls = core_files;
  var rs =mextract(fls) ;
  mkModule("core",versions.pjdom,rs,cb);
  
}

function mk_pjdom(cb) { 
  var fls = dom_files;
  var rs =mextract(fls) ;
  mkModule("dom",versions.pjdom,rs,cb);
  
}


function mk_pjui(cb) { 
  var fls = ui_files;
  dontExtract = 1;
 // var rs = "(function (pj) {\n\nvar geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,fb=pj.fb,ui=pj.ui;\n"+
 // var rs = "(function (pj) {\n\nvar om=pj.om,geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
  var rs =        mextract(fls);
  mkModule('ui',versions.pjui,rs,cb);

}



function mk_combo() {
  var domPath = mkPath('dom',versions.pjdom);
  // var core = ''+fs.readFileSync(mkPath('pj',versions.pjcore));
 console.log('domPath',domPath);
  var dom = ''+fs.readFileSync(domPath);
  var ui = ''+fs.readFileSync(mkPath('ui',versions.pjui));
  var editor = ''+fs.readFileSync(mkPath('editor',versions.editor));
  var combo = dom.concat(ui,editor);
  mkModule('protochart',versions.combo,combo);
  console.log(combo);
  //code
}

function mk_pjchooser(cb) {
  var fls = chooser_files;
  var rs = mextract(fls);
  mkModule("chooser",versions.pjchooser,rs,cb);

}

function mk_pjview(cb) {
  var fls = view_files;
  //var rs = "(function (pj) {\n\nvar dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;\n"+
   //         '"use strict"\n'+
   var rs =          mextract(fls);// + "\n})(prototypeJungle);\n"
  
  mkModule("view",versions.pjview,rs,cb);

}


function mk_pjeditor(cb) { 
  var fls = editor_files;
  var rs = mextract(fls);//+ "\n})(prototypeJungle);\n"
  mkModule('editor',versions.editor,rs,cb);

}


function mk_code_editor(cb) { 
  var fls = code_editor_files;
  var rs = mextract(fls);//+ "\n})(prototypeJungle);\n"
  mkModule('code_editor',versions.code_editor,rs,cb);

}


var afn = function (d,cb) {
  d(cb);
}
var jobByWhat = {core:mk_pjcore,dom:mk_pjdom,ui:mk_pjui,//data:mk_pjdata,
                  view:mk_pjview,chooser:mk_pjchooser,editor:mk_pjeditor,code_editor:mk_code_editor,combo:mk_combo
                  // some old items: inspect:[mk_pjinspect],draw:[mk_pjdraw],dev:[mk_pjdev],login:[mk_pjloginout],
                 // rest:[mk_topbar,mk_pjloginout,mk_pjworker,mk_bubbles]
                  }
                  
var job = jobByWhat[what]; 

if (job) {
  console.log("ASSEMBLING ",what);
  job();
  //var jobs = [mk_pjom,mk_pjdom,mk_pjui,mk_pjtopbar,mk_pjchooser,mk_pjview,mk_pjloginout,mk_pjworker,mk_bubbles];
 // asyncFor(afn,jobs,function () {console.log("S3 Save  DDONE");});
} else {
  console.log("NO ASSEMBLY INSTRUCTIONS EXIT FOR ",what);
}


