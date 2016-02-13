

/*
Utility for updating  S3.
First arg: prototypejunble or openchart
Second arg: d or p
Third arg: fromDev fromProd (default fromDev)
d means update the dev files
p means update the production files
Sources for each come from prototypejungledev/openchartdev or prototypejungle/openchart, respectively for fromDev and fromProd

cd ~/storage_server_dev;node admin/updateS3.js openchart d

An early stage project, but perhaps of interest to the JS community. The main idea - serialization and UI-inspection of  prototype-stitched trees - is a domain-independent idea. Thanks for having a look.
*/

var versions = require("./versions.js");
var util = require('../ssutil.js');
//util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');

var dontSend = 0; // 1 for checking: doesn't actually send to s3, but lets you know what it will do
var fromCloudFront = 1;
var useMin =  1;

util.activateTagForDev("s3");

var forChart = process.argv[2] === 'openchart'
var forDev = process.argv[3] === 'd';
var fromDev = process.argv[4] !== 'fromProd';

var srcdir = "/home/ubuntu/"+(fromDev?"xfer_"+(forChart?"openchart/":"prototypejungle/"):
                                  "git"+(forChart?"/openchart/www/":"/www/"));
//var srcdir = "/home/ubuntu/"+(fromDev?"xfer":"fromGit")+(forChart?"_openchart":"")+"/www/";

console.log("dontSend",dontSend,"forChart",forChart,"forDev",forDev,"fromDev",fromDev,'srcdir',srcdir);

var defaultMaxAge = 0;

function insertDomain(s) {
  var domain = forChart? (fromCloudFront?'openchart.net':'openchart.net.s3.amazonaws.com'):
                         (fromCloudFront?'prototypejungle.org':'prototypejungle.org.s3.amazonaws.com');
                       
  return  s.replace(/\{\{domain\}\}/g,domain);
}



function doSubstitution(s,what,value) {
    var min = useMin?'.min':'';
    var rge = new RegExp('\{\{'+what+'\}\}','g');
    return s.replace(rge,value);
}


function insertVersions(s) {
  var rs = insertDomain(s);
  var min = useMin?'.min':''
  var min = '.min';
  for (var k in versions) {
    //console.log('K',k);
    rs =  doSubstitution(rs,k+'_version',versions[k]+min);
  }
  return rs;
}

var boiler = {
  
boiler00:'<!DOCTYPE html>\n'+
'<html>\n'+
'<head>\n'+
'<meta charset="UTF-8">\n'+
'<meta name="description" content="Visibility and Persistence for JavaScript\'s Prototype Realm">\n'+
'<title>PrototypeJungle</title>\n'+
'<link rel="stylesheet" type="text/css"  href="'+(forDev?'/devstyle.css':'/style.css')+'"> \n'+
'</head>\n'+
'<body>\n',

boiler0:'\n'+
'<script>\n\n'+
'var documentReady = 0;\n'+
'var initPage = function () {\n'+
'  if (window.pj && documentReady) {\n'+
'    pj.ui.signInOutHandler();\n' +
'  }\n'+
'}\n'+
'</script>\n' +

'<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>\n\n'+ 
'\n',
boiler1:'\n'+
'<script>\n'+
"$('document').ready(function () {\n"+
'  documentReady = 1;\n'+
'  initPage();\n'+
//'  });\n'+
'});\n'+
'</script>\n',
boiler2:'\n'+
'<div id="outerContainer">\n'+  
'  <div id="topbar">\n'+ 
'     <div id="topbarOuter" style="padding-bottom:30px"><a href="http://prototypejungle.org"><span class="mainTitle">PrototypeJungle</span></a>\n'+
'        <img style ="position:relative;top:10px;border:none;left:-20px;" src="/images/logo.svg"  width="120" height="30"/>\n' +
'        <div id = "topbarInner" style="position:relative;float:right;top:12px">'+
'           <a href="https://github.com/chrisGoad/prototypejungle/tree/r3" class="ubutton">GitHub</a>\n'+ 
'           <a href="http://prototypejungle.org/doc/choosedoc.html" class="ubutton">Docs</a>\n'+ 
'           <a href="http://prototypejungle.org/doc/about.html" class="ubutton">About</a>\n'+
'        </div>\n'+ 
'        <div id ="worker" style="position:absolute;left:50px;top:4px">\n'+
'           <iframe style="border-width:0px" id="workerIframe" width="1" height="1"></iframe>\n'+
'        </div>\n'+
'    </div>\n'+
'  </div>\n'+
'  <div id="innerContainer">\n'
}

boiler.boilerplate = boiler.boiler0 + boiler.boiler1 + boiler.boiler2;

function insertBoilerplate(s) {
  var rs = s;
  for (var k in boiler) {
    rs = doSubstitution(rs,k,boiler[k]);
  }
  return rs;
}

function doSubstitutions(s) {
  return insertVersions(insertBoilerplate(s));
}

  var toS3 = function (dt,cb) {
    console.log("OO",dt);
    s3.setBucket(forChart?"openchart.net":"prototypejungle.org");
    var path = dt.source;
    var mxa = (dt.maxAge === undefined)?defaultMaxAge:dt.maxAge;
    var fpth = srcdir+path;
    var ctp = dt.ctype;
    if (dt.dest) {
      path = dt.dest;
    }
    console.log("Reading from ",fpth);
    var ivl = fs.readFileSync(fpth).toString();
    
    var vl = doSubstitutions(ivl);
    console.log("ToS3 from ",fpth,"to",path,"age",mxa);
    if (dontSend) {
      cb();
    } else {
      s3.save(path,vl,{contentType:ctp,encoding:"utf8",maxAge:mxa,dontCount:1},cb);
    }
  }
  
  var jst = "application/javascript";
  var htt = "text/html";
  var svgt = "image/svg+xml";
  
  var add1Html = function(a,fl,dst,mxa) {
    var rs = {source:fl,ctype:htt};
    if (dst) {
      rs.dest = "/"+dst;
    }
    if (mxa !== undefined) {
      console.log("MAX AGE FOR ",fl," IS ",mxa);
      rs.maxAge = mxa;
    }
    a.push(rs);
  }
  
  
  var addHtml = function (a,fls,mxa) {
    fls.forEach(function (fl) {
      add1Html(a,fl,undefined,mxa);
    });
  }
  
  var addHtmlDoc = function(a,fl) { // for now, send the docs to production in dev mode too
    var ffl = "doc/"+fl+".html";
    console.log('ADDING HTML DOC ',ffl);
    a.push({source:ffl,ctype:htt});
  }

  var addSvgDoc = function(a,fl) {
    console.log("SVG ",fl); 
    a.push({source:"images/"+fl+".svg",ctype:svgt});
  }
  var addHtmlDocs = function (a,fls) {
    fls.forEach(function (fl) {
      addHtmlDoc(a,fl); 
    });
  }
  
  var addSvgDocs = function (a,fls) {
    fls.forEach(function (fl) { 
      addSvgDoc(a,fl);
    }); 
  }
   
  var fts = [];


if (forDev) { 
  useMin = 0;
  if (forChart ) {
      addHtml(fts,["index.html","chooserd.html","test.html","uid","handled.html","after_sign_in.html"],0);//ui is temporary!
      fts.push({source:"style.css",ctype:"text/css"});

  } else {
    fts.push({source:"devstyle.css",ctype:"text/css"});
    //addHtml(fts,["indexd.html","devd","chartsd","uid","viewd","chooserd.html","chartsd.html","setkey.html",
    //             "logout.html","insert_shaped.html"],0);
    addHtml(fts,["uid","index_alt.html","index_alt2.html"],0);//ui is temporary!
    // uncomment the following  line if you wish to update documentation in devdoc
    addHtmlDocs(fts,["choosedoc","tech","intro","inherit","code","about","app"]);//"tech","coding","about"]);
    addSvgDocs(fts,['prototree']);
  }
    //addSvgDocs(fts,["figure1","figure2","prototree","instantiate1","instantiate2","figure_serialize1","logo"]);  
} else {
  useMin = 1;
  if (forChart) {
  } else {
   fts.push({source:"style.css",ctype:"text/css"});
   
   // add1Html(fts,"index.html","index.html");
   //addHtmlDocs(fts,["chartdoc","choosedoc","embed","guide","inherit","opaque","tech","about"]);
   // addHtmlDocs(fts,["choosedoc","code","tech","about","intro","inherit"]); 
   //addHtml(fts,["index.html","dev","charts","view", "chooser.html","shapes.html","charts.html","setkey.html","logout.html"],0);
   //addHtml(fts,["index.html","insert_chart.html","charts","view","setkey.html","logout.html"],0);
   addHtml(fts,["ui","index.html"]);
   addHtmlDocs(fts,["choosedoc","tech","intro","inherit","code","about","app"]);//"tech","coding","about"]);
   addSvgDocs(fts,['prototree'])
  };
 }
  console.log('FTS',fts);   
  
  util.asyncFor(toS3,fts,function () {
    console.log("DONE UPDATING S3");
  },1);

