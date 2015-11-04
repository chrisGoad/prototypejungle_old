

/*
Utility for updating  S3.

It also sends logout_template, sign_in_template, and handle_template into logout,sign_in, and handle (needed
to install versions)
// for dev
cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js d

cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js d all
cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js p all
cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js d
 
An early stage project, but perhaps of interest to the JS community. The main idea - serialization and UI-inspection of  prototype-stitched trees - is a domain-independent idea. Thanks for having a look.
*/

var dontSend = 0; // 1 for checking: doesn't actually send to s3, but lets you know what it will do
var devOnly = 1; // only update the dev files: "indexd.html","inspectd","viewd","chooserd.html"
var fromCloudFront = 1;
var useMin =  1;
var defaultMaxAge = 0;//devOnly?0:7200; // if not explicitly specified 

var versions = require("./versions.js");
var util = require('../util.js');
//util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');
util.activateTagForDev("s3");

var a0 = process.argv[2];
var updateAll = (!devOnly && (process.argv[3] === 'all'));


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
console.log('UPDATE ALL',updateAll,' forDev ',forDev);

function insertDomain(s) {
  var domain = fromCloudFront?'prototypejungle.org':'prototypejungle.org.s3.amazonaws.com';
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
'<meta name="description" content="JavaScript Prototypes in the Open">\n'+
'<title>PrototypeJungle</title>\n'+
'<link rel="stylesheet" type="text/css"  href="'+(devOnly?'/devstyle.css':'/style.css')+'"> \n'+
'</head>\n'+
'<body>\n',

boiler0:'\n'+
'<script>\n\n'+
//'if (!Object.create) {\n'+
//'  window.location.href = "/unsupportedbrowser";\n'+
//'}\n'+
'var documentReady = 0;\n'+
'var initPage = function () {\n'+
'  if (window.pj && documentReady) {\n'+
//'    pj.checkSession(function (rs) {\n'+
'    pj.ui.signInOutHandler();\n' +
//"    pj.ui.genTopbar($('#topbar'),{includeTitle:1});\n"+
//'    });\n'+
'  }\n'+
'}\n'+
'</script>\n'+
'<script  src="http://{{domain}}/'+(devOnly?'djs':'js')+'/pjtopbar-{{pjtopbar_version}}.js"></script>\n'+

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

  var fromTemplate = function (path) {
    var ipth = pjdir+path+"_template";
    console.log("Reading template from ",ipth);
    var ivl = fs.readFileSync(ipth).toString(); 
    var vl = doSubstitutions(ivl);

    //var vl =  insertVersions(insertBoilerplate(fs.readFileSync(ipth).toString()));
    var opth = pjdir+path;
    if ((path === "worker") || (path === "workerd") || (path === "worker_nosession") || (path === "worker_nosessiond") || (path === "twitter_oauth")) {
      opth += ".html";
    }
    console.log("Instantiating ",ipth," to ",opth);
    fs.writeFileSync(opth,vl);
  }
  
  
  //var templated = ["sign_in","logout","handle","worker","twitter_oauth"];
var templated = ["worker","worker_nosession"];
var templatedD = ["sign_ind","workerd","worker_nosessiond"];
  
  if (updateAll) {
    templated.forEach(function (p) {
      fromTemplate(p);
    });
  } else if (devOnly) {
    //code
    var saveUseMin = useMin;
    useMin = 0;
    templatedD.forEach(function (p) {
      fromTemplate(p);
    });
    useMin = saveUseMin;
  }
  

  var toS3 = function (dt,cb) {
    console.log("OO",dt);
    var path = dt.source;
    var mxa = (dt.maxAge === undefined)?defaultMaxAge:dt.maxAge;
    var fpth = pjdir+path;
    var ctp = dt.ctype;
    if (dt.dest) {
      path = dt.dest;
    }
    console.log("Reading from ",fpth);
    var ivl = fs.readFileSync(fpth).toString();
    
   // var vl = insertVersions(insertBoilerplate(ivl));
    var vl = doSubstitutions(ivl);
    console.log("ToS3 from ",fpth,"to",path,"age",mxa);
    /*if (path.indexOf("charts")>-1) {
      console.log("**IVL**",ivl);

      console.log("**VL**",vl);
    }*/
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
  
  var addHtmlDoc = function(a,fl) {
    var ffl = (devOnly?"devdoc/":"doc/")+fl+".html";
    console.log('ADDING HTML DOC ',ffl);
    a.push({source:ffl,ctype:htt});
  }
/*
  var addSvgDoc = function(a,fl) {
    console.log("SVG ",fl); 
    a.push({source:(devOnly?"devdoc/":"doc/")+fl+".svg",ctype:svgt});
  }
  */
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
   
  var fts = [];//{source:devOnly?"devstyle.css":"style.css",ctype:"text/css"}];
  if (updateAll && !devOnly) {
    addHtml(fts,["newuser","view","chooser.html","unsupportedbrowser","missing.html","limit.html","denied.html"]);
  } 
if (devOnly) { 
  fromCloudFront = 0;
  useMin = 0;
  fts.push({source:"devstyle.css",ctype:"text/css"});
  addHtml(fts,["indexd.html","devd","chartsd","ui","viewd","chooserd.html","chartsd.html","setkey.html",
               "logout.html","insert_shaped.html"],0);
  // uncomment the following  line if you wish to update documentation in devdoc
  addHtmlDocs(fts,["choosedoc","tech","intro","code","about"]);//"tech","coding","about"]); 
  //addSvgDocs(fts,["figure1","figure2","prototree","instantiate1","instantiate2","figure_serialize1","logo"]);  
} else {
  useMin = 1;
   fts.push({source:"style.css",ctype:"text/css"});
  // add1Html(fts,"index.html","index.html");
    //addHtmlDocs(fts,["chartdoc","choosedoc","embed","guide","inherit","opaque","tech","about"]);
     addHtmlDocs(fts,["choosedoc","code","tech","about","intro","inherit"]); 
       //addHtml(fts,["index.html","dev","charts","view", "chooser.html","shapes.html","charts.html","setkey.html","logout.html"],0);
       addHtml(fts,["index.html","insert_chart.html","charts","view","setkey.html","logout.html"],0);

 }
  console.log('FTS',fts);   
  
  util.asyncFor(toS3,fts,function () {
    console.log("DONE UPDATING S3");
  },1);

