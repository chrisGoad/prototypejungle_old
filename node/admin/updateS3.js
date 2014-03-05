

/*
Utility for updating  S3.


To run this script:
cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js d
or 
node admin/updateS3.js p
*/
var util = require('../util.js');
//util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');
s3.useNewBucket();
var cf = require('./codeFiles.js');
util.activateTagForDev("s3");


var a0 = process.argv[2];

if (a0 === "p") {
  var forDev = false;
  var pjdir = "/mnt/ebs0/prototypejungle/www/";
} else if (a0 ==="d") {
  forDev = true;
  var pjdir = "/mnt/ebs0/prototypejungledev/www/";
} else {
  console.log("Usage: 'node updateS3.js p' or 'node updateS3.js d', for the production or dev environtments, respectively")
}
if (pjdir) {

// Send the only files to s3 needed from development (as opposed to building items)

  function asyncFor(fn,data) {
    //console.log("FOR ",fn,data);
    var ln = data.length;
    function asyncFor1(n) {
      if (n===ln) {
        return;
      }
      var dt = data[n];
      fn.call(null,dt,function () {
        asyncFor1(n+1);
      });
    }
    asyncFor1(0);
  }
      
  var toS3 = function (dt,cb) {
    var path = dt[0];
    fpth = pjdir + path;
    var ctp = dt[1];
    var vl = fs.readFileSync(fpth);
    console.log("jsToS3 from ",fpth,"to",path);
    s3.save(path,vl,ctp,"utf8",cb,true);
  }
  

  var jst = "application/javascript";
  //var fts = [["min/draw.js",jst]];
  var htt = "text/html";
  var fts = [["index.html",htt],["style.css","text/css"],["min/common1.js",jst],
             ["min/view.js",jst],["min/core.js",jst],["min/draw.js",jst],["min/min.js",jst],
             ["choosedoc.html",htt],["tech.html",htt],["userguide.html",htt],["about.html",htt]];
  
  var fts = [["inspect.html",htt],["view.html",htt],["min/common1.js",jst],["min/view.js",jst],["min/inspect.js",jst]]

    asyncFor(toS3,fts);
/*
  function addJs(fls) {
    fls.forEach(function (fl) {fts.push(["js/"+fl,jst]);});
  }
   function addMin(fls) {
    fls.forEach(function (fl) {fts.push(["min/"+fl+'.js',jst]);});
  }
   function addHtml(fls) {
    fls.forEach(function (fl) {fts.push([fl+".html",htt]);});
   }
  var fts = [];
  //fts = [["images/folder.ico","image/x-icon"]];
  addHtml(["tindex","chooser2d","chooser2","inspectd","viewd"]);
  addJs(cf.commonFiles1);
   addJs(cf.inspectFiles);
   addJs(cf.viewFiles);
   fts.push(["ace-builds/src-min-noconflict/ace.js",jst],["spectrum.css","text/css"]);
    fts.push(["ace-builds/src-min-noconflict/mode-javascript.js",jst]);
      fts.push(["ace-builds/src-min-noconflict/worker-javascript.js",jst]);
  fts.push(["ace-builds/src-min-noconflict/ext-searchbox.js",jst]);
//["tindex.html",htt],["chooser2d.html",htt]];
 // addJs(["pj","util1","page","chooser2"]);
 //   addJs(["util2","om1","om2","instantiate","html_parser","dom","domprotos","chooser2"]);
    fts.push(["ace-builds/src-min-noconflict/theme-TextMate.js",jst]);

  //fts= [];
      fts.push(["ace-builds/src-min-noconflict/theme-TextMate.js",jst]);

  addJs(['inspect.js','worker.js','util2.js','externalize.js','page.js']);
  fts.push(["inspectd.html",htt]);
  //fts = [];
    fts.push(["inspectd.html",htt]);
  addJs(['page.js','inspect.js','worker.js']);
  addMin(['min','common2','loginout']);
  addHtml(["index","logout"]);
  fts = [];
  addJs(['om1.js','data.js','page.js','pj.js','om2.js','inspect.js','chooser2.js','dom.js','worker.js','util1.js','standalone_page.js',
         'util1.js','util2.js','externalize.js','initcanvas.js','draw.js','tree1.js','shapes.js','view.js','canvas.js','tree2.js']);
  addHtml(["index","inspectd","viewd","worker","indexd","api_tests"]);
        fts.push(["ace-builds/src-min-noconflict/worker-javascript.js",jst]);
  fts.push(["style.css","text/css"]);
  console.log(fts);
  asyncFor(toS3,fts);
  */
  /*
   *
  function styleToS3 () {
    var fpth = pjdir + "style.css";
    var path = "style.css";
    var vl = fs.readFileSync(fpth);
    var ctp = "text/css";
    console.log("jsToS3 from ",fpth,"to",path);
    s3.save(path,vl,ctp,"utf8",function () {
      console.log("SENT min/view.js, and style.css");
    },true);
  }
  function toS3(s3jobs) {
    var ln = s3jobs.length;
  
  function toS3() {
    var jsf = "view.js";
    var fpth = pjdir + "min/" + jsf;
    var path = "/min/"+jsf
    var vl = fs.readFileSync(fpth);
    ctp = "application/javascript"
    console.log("jsToS3 from ",fpth,"to",path);
    s3.save(path,vl,ctp,"utf8",styleToS3,true);
  }
  toS3();
  */
  
}


