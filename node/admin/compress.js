/*
cd /mnt/ebs0/prototypejungledev/node;node admin/compress.js

compress the big svg file for the weather events. Later,
*/


var util = require('../util.js');

var fs = require('fs');
var s3 = require('../s3');
var minify = require('minify');
var zlib = require('zlib');

var maxAge = 0;

var zippee = "/mnt/ebs0/prototypejungle/tmpforgzip/zippee";
var zipped = "/mnt/ebs0/prototypejungle/tmpforgzip/zipped";

function doGzip(cb) {
  console.log("gzipping ",zippee);
  var gzip = zlib.createGzip();
  var inp = fs.createReadStream(zippee);
  var out = fs.createWriteStream(zipped);
  inp.pipe(gzip).pipe(out);
  out.on('close',cb);
}

function compress(src,dst,ctype,cb) { // src and dst are relative to s3 prototypejungle.org
  s3.getObject(src,function (e,d) {
    console.log(e);//d.length);
    fs.writeFileSync(zippee,d);
    doGzip(function () {
      console.log('gzip done');
      var fzipped = fs.readFileSync(zipped);

       s3.save(dst,fzipped,{contentType:ctype,encoding:"utf8",
                contentEncoding:"gzip",dontCount:1,maxAge:maxAge},cb);// and save the gzipped file to s3
      
    });
  });
}


compress('sys/repo0/chart/variants/BubbleX1/BillionDollarWeatherEvents1/svg_uncompressed.html',
         'sys/repo0/chart/variants/BubbleX1/BillionDollarWeatherEvents1/svg.html','text/html',
         function () {console.log('s3 save done');});



