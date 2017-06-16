var toProtochart = 0;
/*
Usage:

cd c:\prototypejungle
node admin/assemble.js core

*/
var what = process.argv[2]; 
var versions = require("./versions.js");

 
var fs = require('fs');
var minify = require('minify');
var zlib = require('zlib');    
var babel = require("babel-core");


var fileLists = {};

var prepend = function (what,arr) {
  return arr.map(function (el) { return what+"/"+el;});
}

fileLists['core'] = prepend('core',["pj","tree","event","exception","update","instantiate","serialize","deserialize",
                  "install","xpath","log","pageutils"]);
fileLists['dom'] = prepend('dom',["spread","geom","data","dom1","jxon","svg","html","uistub","domstringify","view"]);
fileLists['ui']  = prepend('ui',["ui","firebase","svg_serialize","save","dom2","controls","svgx","tree1","tree2","lightbox"]);
fileLists['chooser'] = ["ui/ui","editor/chooser"];
var editorCommon = ["editor/page_top","minimal/browser","minimal/catalog","editor/page_common"];
fileLists['editor'] =         editorCommon.concat(["editor/install","editor/graph",,"editor/page","editor/init_page"]);
fileLists['code_editor'] =    editorCommon.concat(["editor/install","editor/graph","code_editor/page","editor/init_page"]);
fileLists['catalog_editor'] = editorCommon.concat(["catalog_editor/page","catalog_editor/init"]);
                               
fileLists['minimal']  = ["core/pj","core/pageutils"];//,"minimal/catalog"];
fileLists['firebase_only'] =  ["core/pj","core/pageutils","ui/firebase","minimal/catalog","minimal/browser"];

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

function mkPath(which,version,mini,es5) {
  return "www/js/"+(es5?'es5_':'')+which+"-"+version+(mini?".min":"")+".js";
}

function mkModule(which,version,contents,cb) {
  console.log('mkModule',which,version);
  var path = mkPath(which,version,0);
  var es5path = mkPath(which,version,0,1);
  var minpath = mkPath(which,version,1);
  var gzPath =  mkPath(which,version,1);
  console.log("Saving to path ",path);  
  fs.writeFileSync(path,contents);
  var es5 = babel.transformFileSync(path).code;// for some reason plain old babel.transformmm couldn't find .babelrc
  fs.writeFileSync(es5path,es5);

  //console.log(es5);
  //return;
  minify(es5path,function (err,compressed) {
      console.log(err,"Saving the compressed file to ",minpath,!!compressed);
      fs.writeFileSync(minpath,compressed); // save the compressed version locally
      doGzip(minpath,function () { // finally ,gzip it;
        console.log("gzipping done");
      });
      
  });
}

var stdClose = '\n})(prototypeJungle);\n'
var minClose = '\nreturn pj;\n})()\n';
var addOns = {'minimal':minClose,'firebase_only':minClose,'catalog_editor':stdClose,'editor':stdClose,'code_editor':stdClose};

function buildModule() {
  var addOn = addOns[what];
  var fls = fileLists[what];
  if (!fls) {
    console.log('No such module: ',what);
  }
  var cn = mextract(fls) + (addOn?addOn:'');
  mkModule(what,versions[what],cn);
}

buildModule();     
   
/* maybe resurrect this some time 
function mk_combo() {
  var domPath = mkPath('dom',versions.pjdom);
 console.log('domPath',domPath);
  var dom = ''+fs.readFileSync(domPath);
  var ui = ''+fs.readFileSync(mkPath('ui',versions.pjui));
  var editor = ''+fs.readFileSync(mkPath('editor',versions.editor));
  var combo = dom.concat(ui,editor);
  mkModule('protochart',versions.combo,combo);
  console.log(combo);
  //code
}
*/


