

/*
Utility for updating  S3.

It also sends logout_template, sign_in_template, and handle_template into logout,sign_in, and handle (needed
to install versions)

To run this script (for version 3)
cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js d

*/
var versions = require("./versions.js");

var util = require('../util.js');
//util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');
s3.useNewBucket();
util.activateTagForDev("s3");

var defaultMaxAge = 0; // if not explicitly specified 
var a0 = process.argv[2];
//var domVersion  = "0.9.0";
//var uiVersion = "0.8.0";
var fromCloudFront = 0;


function insertVersions(s) {
  if (fromCloudFront) {
    var rs =  s.replace(/\{\{domain\}\}/g,'prototypejungle.org');
  } else {
    rs = s.replace(/\{\{domain\}\}/g,'prototypejungle.org.s3.amazonaws.com');
  }
  rs =  rs.replace(/\{\{pjdom_version\}\}/g,versions.pjdom);
  rs = rs.replace(/\{\{pjui_version\}\}/g,versions.pjui);
  rs = rs.replace(/\{\{pjtopbar_version\}\}/g,versions.pjtopbar);
  rs = rs.replace(/\{\{pjchooser_version\}\}/g,versions.pjchooser);
  rs = rs.replace(/\{\{pjview_version\}\}/g,versions.pjview);
  rs = rs.replace(/\{\{pjloginout_version\}\}/g,versions.pjloginout);
  rs = rs.replace(/\{\{pjworker_version\}\}/g,versions.pjworker);

  return rs;

}

var ppjdir = "/mnt/ebs0/prototypejungle/www/";

if (a0 === "p") {
  var forDev = false;
  var pjdir = "/mnt/ebs0/prototypejungle/www/";
} else if (a0 ==="d") {
  forDev = true;
  var pjdir = "/mnt/ebs0/prototypejungledev/www/";
} else {
  console.log("Usage: 'node updateS3.js p' or 'node updateS3.js d', for the production or dev environtments, respectively")
}

  var fromTemplate = function (path) {
    var ipth = pjdir+path+"_template";
    console.log("Instantiating ",ipth);
    var vl = insertVersions(fs.readFileSync(ipth).toString());
    var opth = ppjdir+path;
    if ((path === "chooser") || (path === "worker") || (path === "twitter_oauth")) {
      opth += ".html";
    }
    fs.writeFileSync(opth,vl);
  }
  
  var templated = ["sign_in","logout","handle","chooser","worker","twitter_oauth"];
  
  templated.forEach(function (p) {
    fromTemplate(p);
  });
  
    

  var toS3 = function (dt,cb) {
    console.log("OO",dt);
    var path = dt.source;
    var mxa = (dt.maxAge)?dt.maxAge:defaultMaxAge;
    var fpth = pjdir+path;
    //var s3path = path === "index.html"?tindex.html:path;
    var ctp = dt.ctype;
    if (dt.dest) {
      path = dt.dest;
    }
   
    var vl = insertVersions(fs.readFileSync(fpth).toString());
    console.log("ToS3 from ",fpth,"to",path,"age",mxa);
    if (path === "inspect") {
      console.log("**VL**",vl);
    }
     s3.save(path,vl,{contentType:ctp,encoding:"utf8",maxAge:mxa,dontCount:1},cb);
   //cb();
  }
  
  var jst = "application/javascript";
  var htt = "text/html";
 
  
  var add1Html = function(a,fl,dst) {
    var rs = {source:fl,ctype:htt};
    if (dst) {
      rs.dest = "/"+dst;
    }
    a.push(rs);
  }
  
  
  var addHtml = function (a,fls) {
    fls.forEach(function (fl) {
      add1Html(a,fl);
    });
  }
  
  var addHtmlDoc = function(a,fl) {
    a.push({source:"doc/"+fl+".html",ctype:htt});
  }
  
  var addHtmlDocs = function (a,fls) {
    fls.forEach(function (fl) {
      addHtmlDoc(a,fl);
    });
  }
  
  
  //var fts = [["index.html",htt],["style.css","text/css"],["min/common1.js",jst],
  //           ["min/view.js",jst],["min/core.js",jst],["min/draw.js",jst],["min/min.js",jst],
  //           ["choosedoc.html",htt],["tech.html",htt],["userguide.html",htt],["about.html",htt]];
  
  var fts = [{source:"style.css",ctype:"text/css"}];
  add1Html(fts,"index.html","tindex.html");
  add1Html(fts,"notyet.html","index.html");
  addHtml(fts,["inspect","newuser","view","chooser.html","unsupportedbrowser"]);
  //  addJsFiles(fts,["min","draw","core","common1","common2","inspect","view","chooser2"]);
  //var fts = [];
  addHtmlDocs(fts,["chartdoc","choosedoc","embed","guide","inherit","opaque","tech","about"]);

  console.log(fts);
  
  
  util.asyncFor(toS3,fts,function () {
    console.log("DONE UPDATING S3");
  },1);
   // toS3(["testht",htt]);
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
  



