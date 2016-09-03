
// what = process.argv[2]; // should be core,dom,ui,inspect or rest (topbar,chooser,view,loginout,worker,bubbles)
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

//var maxAge = 7200;
//var maxAge = toDev?0:7200;
var core_files = ["pj","tree","event","exception","update","instantiate","serialize","deserialize","install","log"];
core_files = core_files.map(function (f) { return "core/"+f;});

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

var pre = '../protochart/'
function mkS3Path(which,version,mini) {
  
  return pre+"www/js/"+which+"-"+version+(mini?".min":"")+".js";
  //return (toDev?"www/djs/":"www/js/")+which+"-"+version+(mini?".min":"")+".js";

}


function mkLocalFile(which,version,mini) {
  return "/home/ubuntu/staging/www/js/"+which+"-"+version+(mini?".min":"")+".js";
}

function mkModule(which,version,contents,cb) {
  console.log('mkModule',which,version);
  var rs = contents;
  var path = mkS3Path(which,version,0);
  var minpath = mkS3Path(which,version,1);
  var gzPath =  mkS3Path(which,version,1,1);
  //var file = mkLocalFile(which,version,0);
  //var minfile = mkLocalFile(which,version,1);
  //var bucket = "prototypejungle.org";
  console.log("Saving to path ",path);
  fs.writeFileSync(path,rs);
  //s3.setBucket(bucket);
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
  minify(path,function (err,compressed) {
    //minify.optimize(file,function (err,compressed) {
      console.log(err,"Saving the compressed file to ",minpath,!!compressed);
      fs.writeFileSync(minpath,compressed); // save the compressed version locally
      //doGzip(minpath,function () { // finally ,gzip it;
      //  console.log("gzipping done");
      //});
      return;
        var minfgz = fs.readFileSync(minfile+".gz");
        console.log("LENGTH ",minfgz.length);
          console.log("Saving minimized to path ",minpath," from file ",minfile);

        s3.save(minpath,minfgz,{contentType:"application/javascript",encoding:"utf8",
                contentEncoding:"gzip",dontCount:1,maxAge:maxAge},cb);// and save the gzipped file to s3
      });
 //   });*/
}
                     
                     
                  
function mk_pjcore(cb) {
  console.log("mk_pjcore");
  var fls = core_files;
  var rs =
  '\nwindow.prototypeJungle =  (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n";
  mkModule("pjcore",versions.pjcore,rs,cb);
}



mk_pjcore();


