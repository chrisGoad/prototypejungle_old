

/*
Utility for updating  S3.
First arg: prototypejunble or openchart
Second arg: d or p
Third arg: fromDev fromProd (default fromDev)
d means update the dev files
p means update the production files
Sources for each come from prototypejungledev/openchartdev or prototypejungle/openchart, respectively for fromDev and fromProd

cd ~/storage_server_dev;node admin/updateS3.js openchart d
cd ~/storage_server_dev;node admin/updateS3.js prototypejungle d
cd ~/storage_server_dev;node admin/updateS3.js prototypejungle d splash

An early stage project, but perhaps of interest to the JS community. The main idea - serialization and UI-inspection of  prototype-stitched trees - is a domain-independent idea. Thanks for having a look.
*/

var versions = require("./versions.js");
//var util = require('../ssutil.js');
//util.activeTags = ["s3"];

var fs = require('fs');
//var s3 = require('../s3');

var dontSend = 0; // 1 for checking: doesn't actually send to s3, but lets you know what it will do
var fromCloudFront = 1;
var useMin =  1;

//util.activateTagForDev("s3");

//var forChart = process.argv[2] === 'openchart'
var forDev = 1;//process.argv[3] === 'd';
var fromDev = 1;// process.argv[4] !== 'fromProd';
var splash = process.argv[4] === 'splash';//for splash page only
var srcdir = "/home/ubuntu/"+(fromDev?"xfer_prototypejungle/":"git/www/");
//var srcdir = "/home/ubuntu/"+(fromDev?"xfer":"fromGit")+(forChart?"_openchart":"")+"/www/";

console.log("dontSend",dontSend,"forDev",forDev,"fromDev",fromDev,'srcdir',srcdir);

var defaultMaxAge = 0;

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
'<meta name="description" content="Visibility and Persistence for JavaScript\'s Prototype Realm">\n'+
'<title>PrototypeJungle</title>\n'+
'<link rel="stylesheet" type="text/css"  href="'+(forDev?'/devstyle.css':'/style.css')+'"> \n'+
'</head>\n'+
'<body style="background-color:#eeeeee">\n',

//'<body style="background-color:'+(splash?'#eeeeee':'white')+'">\n',

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
'<div id="outerContainer>\n'+  
'  <div id="topbar">\n'+ 
'     <div id="topbarOuter" style="padding-bottom:30px">'+
        (splash?'\n':'<a href="/"><span class="mainTitle">PrototypeJungle</span></a>\n')+
'        <img style ="position:relative;top:10px;border:none;left:-20px;" src="/images/logo.svg"  width="120" height="30"/>\n' +
'        <div id = "topbarInner" style="position:relative;float:right;top:12px">'+
'           <a href="https://github.com/chrisGoad/prototypejungle/tree/firebase" class="ubutton">GitHub</a>\n'+ 
//'           <a href="http://prototypejungle.org/'+(forDev?'devdoc':'doc')+'/choosedoc.html" class="ubutton">Docs</a>\n'+ 
'           <a href="/doc/tech.html">Docs</a>\n'+ 
'           <a href="/doc/about.html" class="ubutton">About</a>\n'+
'        </div>\n'+ 
'        <div id ="worker" style="position:absolute;left:50px;top:4px">\n'+
'           <iframe style="border-width:0px" id="workerIframe" width="1" height="1"></iframe>\n'+
'        </div>\n'+
'    </div>\n'+
'  </div>\n'+
//'  <div id="innerContainer"'+(splash?' style="background-color:#eeeeee"':'')+'>\n'
'  <div id="innerContainer" style="background-color:#eeeeee">\n'
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

  
  
  var addHtml1 = function(fl) {
    console.log('read',fl);
    var ivl = fs.readFileSync('wwwsrc/'+fl).toString();
    //splash = fl === "index.html";
    console.log("SPLASH",splash);
    var vl = doSubstitutions(ivl);

    fs.writeFileSync('www/'+fl,vl);
    return;
  }
  
  
  var addHtml = function (fls) {
    fls.forEach(function (fl) {
      addHtml1(fl);
    });
  }
  
  var addHtmlDoc = function(fl) { // for now, send the docs to production in dev mode too
    //var ffl = (forDev?"devdoc/":"doc/")+fl+".html";
     var ffl = "doc/"+fl+".html";
   console.log('ADDING HTML DOC ',ffl);
    addHtml1(ffl); 
  }

  var addSvgDoc = function(fl) {
    addHtml1('images/'+fl+'.svg');
    //console.log("SVG ",fl); 
    //a.push({source:"images/"+fl+".svg",ctype:svgt});
  }
  var addHtmlDocs = function (a,fls) {
    fls.forEach(function (fl) {
      addHtmlDoc(fl); 
    });
  }
  
  var addSvgDocs = function (a,fls) {
    fls.forEach(function (fl) { 
      addSvgDoc(a,fl);
    }); 
  }
   
  var fts = [];
if (splash) {
    addHtml(['index.html']);
}  else if (forDev) { 
  useMin = 0;
  //addHtml(['index.html']);
  //addHtml(fts,["adjustable.html","editd","chooserd.html","index_fb.html","handled.html","after_sign_in.html","charts.html","inserts.html","replace.html"],0);//ui is temporary!
   addHtmlDocs(fts,["deep_prototypes","tech","code","about"]);//choosedoc","tech","intro","inherit","code","about","app"]);//"tech","coding","about"]);
 
  //fts.push({source:"devstyle.css",ctype:"text/css"});
    //addHtml(fts,["indexd.html","devd","chartsd","uid","viewd","chooserd.html","chartsd.html","setkey.html",
    //             "logout.html","insert_shaped.html"],0);
    // uncomment the following  line if you wish to update documentation in devdoc
    //addHtmlDocs(fts,["choosedoc","tech","intro","inherit","code","about","app"]);//"tech","coding","about"]);
    //addSvgDocs(fts,['prototree']);
    //addSvgDocs(fts,["figure1","figure2","prototree","instantiate1","instantiate2","figure_serialize1","logo"]);  
} else {
  // fts.push({source:"style.css",ctype:"text/css"});
   
   // add1Html(fts,"index.html","index.html");
   //addHtmlDocs(fts,["chartdoc","choosedoc","embed","guide","inherit","opaque","tech","about"]);
   // addHtmlDocs(fts,["choosedoc","code","tech","about","intro","inherit"]); 
   //addHtml(fts,["index.html","dev","charts","view", "chooser.html","shapes.html","charts.html","setkey.html","logout.html"],0);
   //addHtml(fts,["index.html","insert_chart.html","charts","view","setkey.html","logout.html"],0);
   addHtml(fts,["ui","index.html"]);
   addHtmlDocs(fts,["choosedoc","tech","intro","inherit","code","about","app"]);//"tech","coding","about"]);
   addSvgDocs(fts,['prototree'])
 }
  console.log('FTS',fts);   
  
