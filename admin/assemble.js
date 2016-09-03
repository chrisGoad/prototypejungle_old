
var version = "0.9.3";
//var util = require('../ssutil.js');

var fs = require('fs');
var minify = require('minify');
var zlib = require('zlib');    

var core_files = ["pj","tree","event","exception","update","instantiate","serialize","deserialize","install","log"];

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

var pre = '../protochart/'
function mkPath(which,version,mini) {
  return pre+"www/js/"+which+"-"+version+(mini?".min":"")+".js";
}


function mkLocalFile(which,version,mini) {
  return "/home/ubuntu/staging/www/js/"+which+"-"+version+(mini?".min":"")+".js";
}

function mkModule(which,version,contents,cb) {
  console.log('mkModule',which,version);
  var rs = contents;
  var path = mkPath(which,version,0);
  var minpath = mkPath(which,version,1);
  var gzPath =  mkPath(which,version,1,1);
  console.log("Saving to path ",path);
  fs.writeFileSync(path,rs);
  minify(path,function (err,compressed) {
      console.log(err,"Saving the compressed file to ",minpath,!!compressed);
      fs.writeFileSync(minpath,compressed); // save the compressed version locally
  });
}

                     
                     
                  
function mk_pjcore(cb) {
  console.log("mk_pjcore");
  var fls = core_files;
  var rs = mextract(fls);
  mkModule("pjcore",version,rs,cb);
}



mk_pjcore();


