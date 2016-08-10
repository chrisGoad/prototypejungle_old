

/*
Utility for dealing with html files (index and doc files). Main job: insert boilerplate.
*/

var fs = require('fs');

var index;// = process.argv[2] === 'index';//for index page (and indexd) only
var comingSoon = 1;
var boilerplate = 
`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="description" content="An open platform for making charts and diagrams, based on deep prototypes">
<title>PrototypeJungle</title>
<link rel="stylesheet" type="text/css"  href="/style.css"> 
</head>
<body style="background-color:#eeeeee">
<div id="outerContainer">  
  <div id="topbar"> 
     <div id="topbarOuter" style="padding-bottom:30px">`+
        (index?'\n':'<a href="/"><span class="mainTitle">PrototypeJungle</span></a>\n')+
`        <img style ="position:relative;top:10px;border:none;left:-20px;" alt="images/logo_alt.html" src="/images/logo.svg"  width="120" height="30"/>
        <div id = "topbarInner" style="position:relative;float:right;top:12px">` +
           (comingSoon?'':'<a href="/edit.html?source=/repo1/startchart/column.js&intro=1" class="ubutton">Intro</a>\n')+ 
`           <a href="/doc/choosedoc.html" class="ubutton">Docs</a> 
           <a href="/doc/about.html" class="ubutton">About</a>
           <a href="https://github.com/chrisGoad/prototypejungle/tree/firebase" class="ubutton">GitHub</a> 
        </div> 
    </div>
  </div>
'  <div id="innerContainer" style="background-color:#eeeeee">`;

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

function insertBoilerplate(s) {
  var irs = doSubstitution(s,'boilerplate',boilerplate,1);
  var irs = doSubstitution(irs,'<cw>','<span class="codeWord">');
  var irs = doSubstitution(irs,'</cw>','</span>');
  var irs = doSubstitution(irs,'<precode>','<pre><code>');
  var irs = doSubstitution(irs,'</precode>','</code></pre>');
  return doSubstitution(irs,'endplate',endplate,1);
}

  
  
  var addHtml1 = function(fl) {
    console.log('read',fl);
    var ivl = fs.readFileSync('wwwsrc/'+fl).toString();
    console.log("index",index);
    var vl = insertBoilerplate(ivl);
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
  index = 1;
//if (index) {
    addHtml(['index.html','indexd.html','indexd_alt.html']);
index = 0;
    addHtml(['svg.html','summary.html','sign_in.html']);
    addHtmlDocs(fts,["intro","inherit","deep_prototypes","tech","code","about","choosedoc"]);    
    //addSvgDocs(fts,['prototree']);
    //addSvgDocs(fts,["figure1","figure2","prototree","instantiate1","instantiate2","figure_serialize1","logo"]);  
  // fts.push({source:"style.css",ctype:"text/css"});

  console.log('FTS',fts);   
  
