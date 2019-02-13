/*

A very tiny and simple webpack-ish tool.
Concats files, and babels and minimizes them.
Usage:

cd c:\protopedia
node admin/assemble.js <module>

*/
let what = process.argv[2];
let noMinify = Boolean(process.argv[3]);
console.log(noMinify);
let versions = require("./versions.js");

 
let fs = require('fs');
let zlib = require('zlib');    
let babel = require("babel-core");


let fileLists = {};
let publicModules = ['core','geom','dom','harness','minimal'];

let prepend = function (what,arr) {
  return arr.map(function (el) { return what+"/"+el;});
}

//fileLists['core'] = prepend('core',["pj","tree","event","exception","update","instantiate","serialize","deserialize",

fileLists['core'] = prepend('core',["root","tree","exception","update","instantiate","serialize","deserialize","pageutils",
                  "install","xpath","log","replace","spread","history"]);//,"geom","geometric_object","replace"]); //linted with eslint 11/22/17
fileLists['geom'] = prepend("geom",["geom","geometric_object"]); //linted with eslint 11/22/17
fileLists['dom'] = prepend('dom',["environment","data","dom1","jxon","svg","html","domstringify","svg_serialize"]);
fileLists['firebase'] = ["firebase/firebase"]; // code cleaned
fileLists['chooser'] = ["chooser/chooser"];// code cleaned
fileLists['tree'] = ["tree/tree1","tree/tree2"]
fileLists['catalog'] = ["catalog/catalog"]; // code cleaned
fileLists['svg'] = ["svg/svg"]
fileLists['uistub'] = ["uistub/uistub"];
//console.log(fileLists.dom);
fileLists.graph = ['graph/environment','graph/graph','graph/periphery_ops','graph/edge_ops'];
fileLists['ui']  = prepend('ui',["environment","browser","ui","save","dom2","controls","svgx","history","image","grid"]);
fileLists['harness']   = ['harness/environment','harness/install','harness/page','harness/init_page'];//,'harness/uiStub'];                         
//console.log(fileLists.ui);
fileLists['lightbox'] = ["lightbox/lightbox"];

//fileLists['chooser'] = ["ui/ui","editor/chooser"]; //linted
let editorCommon = ["editor/environment","editor/page_top","editor/page_common"];//linted 
fileLists['editor'] =    editorCommon.concat(["editor/install","editor/check_json","editor/page","editor/insert","editor/edit_data","editor/save",
                                              "editor/actions","editor/catalog","editor/misc","editor/init_page","editor/animate","editor/to_image"]);//linted; code cleaned
fileLists['code_editor'] =    editorCommon.concat(["editor/install","code_editor/page","editor/init_page"]);//linted
//fileLists['code_editor'] =    editorCommon.concat(["editor/install","editor/init_page"]);//linted
//fileLists['data_editor'] =    editorCommon.concat(["editor/install","data_editor/page","editor/init_page"]);//linted
fileLists['text_editor'] =    editorCommon.concat(["editor/install","editor/check_json","text_editor/page","editor/init_page"]);//linted
fileLists['catalog_editor'] = editorCommon.concat(["catalog_editor/page","catalog_editor/init_page"]);//linted
                               
fileLists['minimal']  = ["core/root","core/pageutils"];//,"minimal/catalog"];
//fileLists['firebase_only'] =  ["firebase/firebase","ui/save","firebase/account_page","ui/catalog","ui/browser"];
fileLists['firebase_only'] =  ["firebase/firebase","ui/save","firebase/account_page"];

function doGzip(file,cb) {
  console.log("gzipping ",file);
  let gzip = zlib.createGzip();
  let inp = fs.createReadStream(file);
  let out = fs.createWriteStream(file+'.gz');
  inp.pipe(gzip).pipe(out);
  out.on('close',cb);
}


let isPublic = false;
function fullName(f) {
  return isPublic?`js/${f}.js`:`../protopedia_ui/js/${f}.js`;
}


function getContents(fl) {
  let fln = fullName(fl);
  console.log("Reading from ",fln);
  let cn = ""+fs.readFileSync(fln)
  return cn;
}

function mextract(fls) {
  let rs = "";
  fls.forEach(function (fl) {
    rs += getContents(fl);
  });
  return rs;
}



function mkPath(which,version,mini) {
  if (mini) {
    return `www/js/${which}-${version}.min.js`;
  } else {
    return `staging/${which}-${version}.js`;
  }
}

function mkModule(which,version,contents) {
  console.log('mkModule',which,version);
  
  let path = mkPath(which,version,0);
  let minpath = mkPath(which,version,1);
  let minified;
  console.log("Saving to path ",path);  
  fs.writeFileSync(path,contents);
  if (noMinify) {
    minified = contents;
  } else {
    minified = babel.transformFileSync(path).code;// for some reason plain old babel.transformmm couldn't find .babelrc
  }
  fs.writeFileSync(minpath,minified);
  doGzip(minpath,function () { // finally ,gzip it;
    console.log("gzipping done");
  });
}



function buildModule() {
  isPublic = publicModules.indexOf(what) >= 0;
  let fls = fileLists[what];
  if (!fls) {
    console.log('No such module: ',what);
  }
  let cn = mextract(fls);
  mkModule(what,versions[what],cn);
}

buildModule();     
   
   
/* maybe resurrect this some time 
function mk_combo() {
  let domPath = mkPath('dom',versions.pjdom);
 console.log('domPath',domPath);
  let dom = ''+fs.readFileSync(domPath);
  let ui = ''+fs.readFileSync(mkPath('ui',versions.pjui));
  let editor = ''+fs.readFileSync(mkPath('editor',versions.editor));
  let combo = dom.concat(ui,editor);
  mkModule('protochart',versions.combo,combo);
  console.log(combo);
  //code
}
*/
/*
 
 node admin/assemble minimal;
 node admin/assemble core;
 node admin/assemble geom;
 node admin/assemble dom;
 node admin/assemble harness;
 node admin/assemble firebase;
 node admin/assemble firebase_only;
 node admin/assemble graph;
 node admin/assemble ui;
 node admin/assemble tree;
  node admin/assemble catalog;
 node admin/assemble editor;
 node admin/assemble code_editor;
node admin/assemble text_editor;
node admin/assemble catalog_editor;
 node admin/assemble chooser;
 node admin/assemble lightbox;

*/

