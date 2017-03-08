

/*
Utility for dealing with html files (index and doc files). Main job: insert boilerplate.
node admin/updateHtml.js index
node admin/updateHtml.js
*/

var fs = require('fs');

var index = process.argv[2] === 'index';//for index page (and indexd) only

var comingSoon = 1;
//<body style="background-color:#eeeeee">

var boilerplate0 = 
`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="description" content="An open catalog of adjustable visual elements made from  deep prototypes">
<title>PrototypeJungle</title>
<link rel="stylesheet" type="text/css"  href="/style.css">
<link rel="icon" href="/images/favicon.png" />
</head>
<body style="background-color:white">
`;
var minimalScripts =
`<script src="js/minimal-0.9.3.js"></script>
`;
var signInScripts = 
`<script src="https://www.gstatic.com/firebasejs/3.0.0/firebase.js"></script>
<!-- <script src="https://prototypejungle.org/js/pjdom-0.9.3.js"></script>-->
<script src="js/core-0.9.3.js"></script>
<script src="js/dom-0.9.3.js"></script>
<script src="js/ui-0.9.3.js"></script>
`;
var boilerplate1 = 
`<div id="outerContainer">  
  <div id="topbar"> 
     <div id="topbarOuter" style="padding-bottom:0px">`+
        (index?'\n':'<a href="/"><span style="position:relative;top:-10px" class="mainTitle">PrototypeJungle</span></a>\n')+
`        <img style ="position:relative;top:10px;border:none;left:-0px;" alt="images/logo_alt.html" src="/images/logo.svg"  width="120" height="50"/>
        <div id = "topbarInner" style="position:relative;float:right;top:12px">` +
           (comingSoon?'':'<a href="/edit.html?source=/repo1/startchart/column.js&intro=1" class="ubutton">Intro</a>\n')+ 
`           <a href="/doc/choosedoc.html" class="ubutton">Docs</a> 
           <a href="/doc/about.html" class="ubutton">About</a>
           <a href="https://github.com/chrisGoad/prototypejungle/tree/r5" class="ubutton">GitHub</a>
           
        </div> 
    </div>
  </div>
'  <div id="innerContainer">`;

var endplate =
`  </div>
</div>
</body>
</html>
`;



function doSubstitution(s,what,value,withDoubleBracket) {
    //var min = useMin?'.min':'';
    var rge = withDoubleBracket?new RegExp('\{\{'+what+'\}\}','g'):new RegExp(what,'g');
    return s.replace(rge,value);
}

function insertBoilerplate(s,scripts) {
  var irs = doSubstitution(s,'boilerplate',boilerplate0+scripts+boilerplate1,1);
  var irs = doSubstitution(irs,'<cw>','<span class="codeWord">');
  var irs = doSubstitution(irs,'</cw>','</span>');
  var irs = doSubstitution(irs,'<precode>','<pre><code>');
  var irs = doSubstitution(irs,'</precode>','</code></pre>');
  return doSubstitution(irs,'endplate',endplate,1);
}

  
  
  var addHtml1 = function(fl) {
    console.log('read',fl);
    if (fl === 'sign_in.html') {
      var scripts = signInScripts;
    } else {
      scripts = minimalScripts;
    }
    var ivl = fs.readFileSync('wwwsrc/'+fl).toString();
    var vl = insertBoilerplate(ivl,scripts);
    fs.writeFileSync('www/'+fl,vl);
    return;
  }
  
  
  var addHtml = function (fls) {
    fls.forEach(function (fl) {
      addHtml1(fl);
    });
  }
  
  var addHtmlDoc = function(fl) { 
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
//  index = 1;
if (index) {
    addHtml(['index.html','indexd.html']);
} else {
    addHtml(['index.html','indexd.html','svg.html','viewtext.html','sign_in.html','catalog.html']);
    addHtmlDocs(fts,["code","about","choosedoc","inherit","deepPrototypes","tech"]);    
    //addSvgDocs(fts,['prototree']);
    //addSvgDocs(fts,["figure1","figure2","prototree","instantiate1","instantiate2","figure_serialize1","logo"]);  
  // fts.push({source:"style.css",ctype:"text/css"});
}
  
