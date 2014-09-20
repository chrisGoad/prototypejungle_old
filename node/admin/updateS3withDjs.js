

/*
Utility for updating  S3.

It also sends logout_template, sign_in_template, and handle_template into logout,sign_in, and handle (needed
to install versions)

To run this script (for version 3)
cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js d all
cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js p all


*/


var fromCloudFront = 1;
var useMin = 1;

var versions = require("./versions.js");
var util = require('../util.js');
//util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');
util.activateTagForDev("s3");

var defaultMaxAge = 0; // if not explicitly specified 
var a0 = process.argv[2];
var updateAll = process.argv[3] === 'all';


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

console.log('UPDATE ALL',updateAll);

function insertDomain(s) {
  var domain = fromCloudFront?'prototypejungle.org':'prototypejungle.org.s3.amazonaws.com';
  return  s.replace(/\{\{domain\}\}/g,domain);
}


function insertJsSource(s,value) {
  return  s.replace(/\{\{jsSource\}\}/g,value);
}



function doSubstitution(s,what,value) {
    var min = useMin?'.min':'';
    var rge = new RegExp('\{\{'+what+'\}\}','g');
    return s.replace(rge,value);
}

// when we are generating the dev versions of files, toDev is 1
function insertVersions(s,forDevVersion) {
  var rs = insertDomain(s);
  rs = insertJsSource(rs,forDevVersion?'djs':'js');
  var min = useMin?'.min':'';
  for (var k in versions) {
    console.log('K',k);
    rs =  doSubstitution(rs,k+'_version',versions[k]+min);
  }
  return rs;
}

var boiler = {
  
boiler00:'<!DOCTYPE html>\n'+
'<html>\n'+
'<head>\n'+
'<meta charset="UTF-8">\n'+
'<meta name="description" content="A prototype-oriented object model for infographics, with inspector">\n'+
'<title>PrototypeJungle</title>\n'+
'<link rel="stylesheet" type="text/css"  href="/style.css"> \n'+
'</head>\n'+
'<body>\n',

boiler0:'\n'+
'<script>\n\n'+
'if (!Object.create) {\n'+
'  window.location.href = "/unsupportedbrowser";\n'+
'}\n'+
'</script>\n'+
'<script src="http://{{domain}}/js/pjtopbar-{{pjtopbar_version}}.js"></script>\n'+
'<script>\n'+
'pj.ui.checkBrowser();\n'+
'</script>\n'+
'<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>\n\n'+
'\n',
boiler1:'\n'+
'<script>\n'+
"$('document').ready(function () {\n"+
'  pj.om.checkSession(function (rs) {\n'+
"    pj.ui.genTopbar($('#topbar'),{includeTitle:1});\n"+
'  });\n'+
'});\n'+
'</script>\n',
boiler2:'\n'+
'<div id="outerContainer">\n'+
'  <div id="topbar">\n'+
'     <div id="topbarOuter" style="padding-bottom:30px"><span class="mainTitle">PrototypeJungle</span>\n'+
'        <div id = "topbarInner" style="float:right"></div>\n'+
'        <div id ="worker" style="position:absolute;left:50px;top:4px">\n'+
'           <iframe style="border-width:0px" id="workerIframe" width="1" height="1"></iframe>\n'+
'        </div>\n'+
'    </div>\n'+
'  </div>\n'
}

boiler.boilerplate = boiler.boiler0 + boiler.boiler1 + boiler.boiler2;

function insertBoilerplate(s) {
  var rs = s;
  for (var k in boiler) {
    rs = doSubstitution(rs,k,boiler[k]);
  }
  return rs;
}

function doSubstitutions(s,forDevVersion) {
  return insertVersions(insertBoilerplate(s,forDevVersion));
}

  var fromTemplate = function (path) {
    var ipth = pjdir+path+"_template";
    console.log("Reading from ",ipth);
    var ivl = fs.readFileSync(ipth).toString();
    var vl = doSubstitutions(ivl);

    //var vl =  insertVersions(insertBoilerplate(fs.readFileSync(ipth).toString()));
    var opth = ppjdir+path;
    if ((path === "worker") || (path === "twitter_oauth")) {
      opth += ".html";
    }
    console.log("Instantiating ",ipth," to ",opth);
    fs.writeFileSync(opth,vl);
  }
  
  var templated = ["sign_in","logout","handle","worker","twitter_oauth"];
  
  if (updateAll) {
    templated.forEach(function (p) {
      fromTemplate(p);
    });
  }
  
    

  var toS3 = function (dt,cb) {
    console.log("OO",dt);
    var forDevVersion = dt.devVersion;
    var path = dt.source;
    var mxa = (dt.maxAge)?dt.maxAge:defaultMaxAge;
    var fpth = pjdir+path;
    var ctp = dt.ctype;
    if (dt.dest) {
      path = dt.dest;
    }
    console.log("Reading from ",fpth);
    var ivl = fs.readFileSync(fpth).toString();
    
   // var vl = insertVersions(insertBoilerplate(ivl));
    var vl = doSubstitutions(ivl,forDevVersion);
    console.log("ToS3 from ",fpth,"to",path,"age",mxa);
    if (path.indexOf("choosedoc")>0) {
      console.log("**IVL**",ivl);

      console.log("**VL**",vl);
    }
    s3.save(path,vl,{contentType:ctp,encoding:"utf8",maxAge:mxa,dontCount:1},cb);
  }
  
  var jst = "application/javascript";
  var htt = "text/html";
 
  
  var add1Html = function(a,fl,dst,devVersion) {
    var rs = {source:fl,ctype:htt,devVersion:devVersion};
    if (dst) {
      rs.dest = "/"+dst;
    }
    a.push(rs);
  }
  
  
  var addHtml = function (a,fls,devVersion) {
    fls.forEach(function (fl) {
      add1Html(a,fl,devVersion);
    });
  }
  
  var addHtmlDoc = function(a,fl,devVersion) {
    a.push({source:"doc/"+fl+".html",ctype:htt,devVersion:devVersion});
  }
  
  var addHtmlDocs = function (a,fls,devVersion) {
    fls.forEach(function (fl) {
      addHtmlDoc(a,fl,devVersion);
    });
  }
  
  
  var fts = [{source:"style.css",ctype:"text/css"}];
  if (updateAll) {

    
  //add1Html(fts,"index.html","tindex.html");
  //add1Html(fts,"notyet.html","index.html");
    addHtml(fts,["inspect","newuser","view","chooser.html","unsupportedbrowser","missing.html","limit.html","denied.html"]);
    addHtml(fts,["inspectd","viewd"],1);
  }
  add1Html(fts,"index.html","index.html");

  addHtmlDocs(fts,["chartdoc","choosedoc","embed","guide","inherit","opaque","tech","about"]);

  console.log(fts);
  
  
  util.asyncFor(toS3,fts,function () {
    console.log("DONE UPDATING S3");
  },1);
