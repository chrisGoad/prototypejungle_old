

/*
Utility for updating  S3.
This is for temporary use: does a subset of what updateS3 will do.


cd /mnt/ebs0/prototypejungledev/node;node admin/codeFilesToS3.js d

*/
var util = require('../util.js');
//util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');
s3.useNewBucket();
var cf = require('./codeFiles.js');
util.activateTagForDev("s3");


var a0 = process.argv[2];
var version  = process.argv[3];

function insertVersion(s) {
  return s.replace(/\{\{version\}\}/g,version);
}
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
    console.log("OO",dt);
    var path = dt.source;
    var mxa = (dt.maxAge)?dt.maxAge:0;
    var fpth = pjdir+path;
    var ctp = dt.ctype;
    if (dt.dest) {
      path = dt.dest;
    }
    //var path = dt[0];
    //fpth = pjdir + path;
    //var ctp = dt[1];
    //if (dt.length > 2) {
    
    //  path = dt[2];
    //}
    var vl = insertVersion(fs.readFileSync(fpth).toString());
    console.log("ToS3 from ",fpth,"to",path,"age",mxa);
    //var isJs = path.indexOf(".js")>0;
    //console.log("isJs",isJs);
    s3.maxAge = mxa;//isJs?11:0;
    s3.save(path,vl,ctp,"utf8",cb,true);
  }
  
  var jst = "application/javascript";
  //var fts = [["min/draw.js",jst]];
  var htt = "text/html";
  /*
  var addJs = function(a,fl) {
    var dir = forDev?"js/":"min/";
    if (forDev) {
      a.push([dir+fl,jst]);
    } else {
      a.push([dir+fl+".js",jst]);
      a.push([dir+fl+".js",jst,dir+fl+"_"+version+".js"]);
    }
  }
  */
  var vMaxAge = 11;
  var addJs = function(a,fl) {
    var dir = forDev?"js/":"min/";
    if (forDev) {
      a.push({source:dir+fl,ctype:jst});
    } else {
      a.push({source:dir+fl+".js",ctype:jst});
      a.push({source:dir+fl+".js",ctype:jst,dest:dir+fl+"_"+version+".js",maxAge:vMaxAge});
    }
  }
  
  
  var addJsFiles = function (a,fls) {
    fls.forEach(function (fl) {
      addJs(a,fl);
    });
  }
  
  
  var add1Html = function(a,fl) {
    a.push({source:"/"+fl,ctype:htt});
  }
  
  
  var addHtml = function (a,fls) {
    fls.forEach(function (fl) {
      add1Html(a,fl);
    });
  }
  
  var addHtmlDoc = function(a,fl) {
    a.push({source:"/doc/"+fl+".html",ctype:htt});
  }
  
  var addHtmlDocs = function (a,fls) {
    fls.forEach(function (fl) {
      addHtmlDoc(a,fl);
    });
  }
  
  
  //var fts = [["index.html",htt],["style.css","text/css"],["min/common1.js",jst],
  //           ["min/view.js",jst],["min/core.js",jst],["min/draw.js",jst],["min/min.js",jst],
  //           ["choosedoc.html",htt],["tech.html",htt],["userguide.html",htt],["about.html",htt]];
  
  var fts = [{source:"style.css",ctype:"text/css"}]
  
  if (forDev) {
    addJsFiles(fts,["bubbles.js"]);
  } else {
  //  addHtml(fts,["index.html","inspect","newuser","view","chooser2.html","worker.html"]);
  //  addJsFiles(fts,["min","draw","core","common1","common2","inspect","view","chooser2"]);
  //var fts = [];
  //  addHtmlDocs(fts,["chartdoc","choosedoc","components","embed","guide","inherit","opaque","tech","about"]);
  }
  console.log(fts);
  
  
    asyncFor(toS3,fts);
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

