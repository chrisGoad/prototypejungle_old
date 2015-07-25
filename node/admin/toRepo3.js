

/*
Utility for updating  Repo3.


cd /mnt/ebs0/prototypejungledev/node;node admin/toRepo3.js
 
*/
var files = [
      'test/two_arrows.js','shape/arrow1.js',
      'chart/component/axis1.js','test/axis.js',
      'chart/component/labels1.js','test/labels.js','data/labels0.js',
       'chart/core/bar1.js','test/core_bar.js',
       'lib/color_utils.js',
       'data/metal_densities.js',
      'test/graph.js','graph/def.js','graph/svg.js','data/graph0.js'];

var srcdir = "/mnt/ebs0/prototypejungle/repo3/";
var dstdir = "sys/repo3/";
var jst = "application/javascript";

var fs = require('fs');
var s3 = require('../s3');
var util = require('../util.js');

var toS3 = function (fl,cb) {
    var mxa = 0;
    var fpth = srcdir+fl;
    var dpth = dstdir+fl;
    var ctp = jst;
    console.log("Reading from ",fpth, "saving to ",dpth);
    var vl = fs.readFileSync(fpth).toString();
    s3.save(dpth,vl,{contentType:ctp,encoding:"utf8",maxAge:mxa,dontCount:1},cb);
  }
//toS3(files[0]);

 util.asyncFor(toS3,files,function () {
    console.log("DONE UPDATING S3");
  },1);




