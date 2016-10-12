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

var fileLists = {};


var core_files = ["pj","tree","event","exception","update","instantiate","serialize","deserialize","install","log"];
core_files = core_files.map(function (f) { return "core/"+f;});

fileLists['core'] = core_files;

var dom_files = ["spread","geom","data","dom1","jxon","svg","html","uistub","domstringify","firebase","view"];
fileLists['dom'] = dom_files.map(function (f) { return "dom/"+f;});

console.log('Ho');

var ui_files = ["ui","svg_serialize","browser",
                //"page",
                "save","dom2","controls","svgx","tree1","tree2","lightbox"];
fileLists['ui'] = ui_files.map(function (f) { return "ui/"+f;});


fileLists['chooser'] = ["ui/ui","editor/chooser"];
fileLists['view'] = ["ui/view"];
fileLists['editor'] = ["editor/page_top","editor/catalog","editor/data","editor/page","editor/init"];
fileLists['code_editor'] = ["code_editor/page_top","editor/catalog","code_editor/page","code_editor/init"];
fileLists['catalog_editor'] =  ["catalog_editor/page_top","minimal/catalog","catalog_editor/page","catalog_editor/init"];
fileLists['minimal']  = ["minimal/pj","minimal/catalog"];

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

var addOns = {'minimal':'\nreturn pj;\n})()\n'}

function buildModule() {
  var addOn = addOns[what];
  var fls = fileLists[what];
  if (!fls) {
    console.log('No such module: ',what);
  }
  //console.log('CN',mextract(fls));
  var cn = mextract(fls) + (addOn?addOn:'');
  mkModule(what,versions[what],cn);
}

buildModule();
 
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


