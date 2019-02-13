

/*
Utility for dealing with html files from wwwscrc. Inserts boilerplate, does substitutions,  and writes to www
For the index file:
node admin/updateHtml.js p index
For the rest
node admin/updateHtml.js p

"p" means production (use of .min js files). Use d for non-min
*/

var fs = require('fs');

var minimize = process.argv[2] === 'p';//for production
var index = false;//process.argv[3] === 'index';
var diagrams = false;//process.argv[3] === 'diagrams';

var boilerplate0 = 
`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="description" content="An Open Repository of Prototype Structures for the Visual Domain">
<title>ProtoPedia</title>
<link rel="stylesheet" type="text/css"  href="/style.css"/>
<link rel="stylesheet" type="text/css"  href="spectrum.css"/>
<link rel="icon" href="/images/favicon.ico?v18" />
</head>
`;
var minimalScripts =
`<script src="js/minimal-1.1.0.min.js"></script>
`;

var signInScripts = 
`<script src="https://www.gstatic.com/firebasejs/4.1.1/firebase.js"></script>
<script src="js/firebase_only-1.1.0.min.js"></script>
`;

var buttonStyle = index?'indexUbutton':'ubutton';
//var buttonStyle = 'indexUbutton';
//`<body style="background-color:rgb(30,30,30)">

var forUsers = 0; // as oposed to developers
//(&beta;)
var boilerplate1 =
`<body style="background-color:white;font-size:14pt">
<div id="outerContainer">  
  <div id="topbar"> 
     <div id="topbarOuter" style="padding-bottom:0px">`+
        (index?'\n':`<a href="/"><span style="position:relative;top:${index?-27:-10}px" class="mainTitle">ProtoPedia </span></a>\n`)+
`         <img style ="position:relative;border:none;top:${index?0:0}px;left:${index?0:20}px;" alt="images/logo_alt.html" src="/images/logo3.svg"  width="60" height="25"/>
         <div id = "topbarInner" style="position:relative;float:right;top:0px">
                     <a href="/draw.html?source=(sys)/forMainPage/spiralLogo6.item&intro=tutorial_index&fit=0.7" class="${buttonStyle}">Tutorial</a>
 <a href="/draw.html" class="${buttonStyle}">Draw</a> 
          <a href="/code.html" class="${buttonStyle}">Code Editor</a> 
            <a href="/text.html" class="${buttonStyle}">Text Editor</a> 
         <a href="/doc/code.html" class="${buttonStyle}">Coding Guide</a> 
          <a href="/doc/about.html" class="${buttonStyle}">About</a>
           <a id ="signInButton" style="display:none" href="/sign_in.html" class="${buttonStyle}">Sign In</a>
           <a id="accountButton" style="display:none" href="/account.html" class="${buttonStyle}">Account</a>      
         </div> 
    </div>
  </div>
  <div id="innerContainer" style="margin-top:10px">
   `;


var Uboilerplate1 =
`<body style="background-color:white;font-size:14pt">
<div id="outerContainer">  
  <div id="topbar"> 
     <div id="topbarOuter" style="padding-bottom:0px">`+
        (index?'\n':`<a href="/"><span style="position:relative;top:${index?-27:-10}px" class="mainTitle">ProtoPedia (beta)</span></a>\n`)+
`         <img style ="position:relative;border:none;top:${index?0:0}px;left:${index?0:20}px;" alt="images/logo_alt.html" src="/images/logo2.svg"  width="60" height="25"/>
         <div id = "topbarInner" style="position:relative;float:right;top:0px">`+
          `<a href="/draw.html?source=(sys)/intro/logoShaded3.item&intro=tutorial_index&fit=0.5" class="${buttonStyle}">Tutorial</a>
          <a href="/doc/about.html" class="${buttonStyle}">About</a>
           <a id ="signInButton" style="display:none" href="/sign_in.html" class="${buttonStyle}">Sign In</a>
           <a id="accountButton" style="display:none" href="/account.html" class="${buttonStyle}">Account</a>      
         </div> 
    </div>
  </div>
  <div id="innerContainer" style="margin-top:10px">
   `;
var endplate =
`  </div>
</div>
</body>
</html>
`;

let fireLibs =
`<script src="https://www.gstatic.com/firebasejs/5.8.2/firebase.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.8.2/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.8.2/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.8.2/firebase-database.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.8.2/firebase-storage.js"></script>
`;

let mainImports =
`import * as core from "/js/core-1.1.0.min.js";
import * as geom from "/js/geom-1.1.0.min.js";
import * as dom from "/js/dom-1.1.0.min.js";
import * as fb from "/js/firebase-1.1.0.min.js";
import * as graph from "/js/graph-1.1.0.min.js";
import * as ui from '/js/ui-1.1.0.min.js';
`;

function doSubstitution(s,what,value,withDoubleBracket) {
    var rge = withDoubleBracket?new RegExp('\{\{'+what+'\}\}','g'):new RegExp(what,'g');
    return s.replace(rge,value);
}

//let firebaseSys = 'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2F';
let firebaseSys = 'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/JHtAs2VsGjYCqJmOo39SexGq2Fx1%2F';
function insertBoilerplate(s,scripts,networkNote) {
  let mainPlate  = (forUsers)?Uboilerplate1:boilerplate1;
  var irs = doSubstitution(s,'boilerplate0',boilerplate0,1);
  irs = doSubstitution(irs,'fireLibs',fireLibs,1);
  irs = doSubstitution(irs,'mainImports',mainImports,1);

  var irs = doSubstitution(irs,'boilerplate',boilerplate0+mainPlate+scripts,1);
  var irs = doSubstitution(irs,'networkNote',networkNote,1);
  var irs = doSubstitution(irs,'min',minimize?'min.':'',1);
  var irs = doSubstitution(irs,'<cw>','<span class="codeWord">');
  var irs = doSubstitution(irs,'</cw>','</span>');
   var irs = doSubstitution(irs,'<smallcw>','<span class="codeWord" style="font-size:9pt">');
  var irs = doSubstitution(irs,'</smallcw>','</span>');
  var irs = doSubstitution(irs,'<precode>','<p style="padding:5px"></p><pre class="code">');
    var irs = doSubstitution(irs,'<precodeId','<p style="padding:5px"></p><pre class="code"');
var irs = doSubstitution(irs,'<smallcode>','<pre style="font-size:11pt">');
  var irs = doSubstitution(irs,'</precode>','</pre>');
  var irs = doSubstitution(irs,'</smallcode>','</pre>');
   var irs = doSubstitution(irs,'<vgap/>','<p style="padding:5px"></p>');
 let preirs = irs;
  var irs = doSubstitution(irs,'sys',firebaseSys,1);
  console.log('found sys',irs != preirs);
 
  return doSubstitution(irs,'endplate',endplate,1);
}

  
  //var needsSignInScripts = {sign_in:1,account:0,index:1,svg:1};
   var noScripts = 1;//{account:1};
 
  var theNetworkNote = '<p style="padding-left:50px;padding-right:50px;font-size:12pt">(For a full explanation of coding in ProtoPedia, '+
  'which will enable you to define your own visual elements and diagram types, see the '+
  '<a href="/doc/code.html">coding guide</a> after reading this).</p>';
  
  
const endsIn = function (string,p) {
  return string.substr(string.length-p.length) === p;
}

  var xferFile = function(ffl) {
    console.log('read',ffl);
    //var scripts = needsSignInScripts[fl]?signInScripts:minimalScripts;
     var scripts = '';
//var ffl = fl+'.html';
    let ipath = '../protopedia_ui/wwwsrc/'+ffl;
    var ivl = fs.readFileSync(ipath).toString();
        console.log('read',ipath);

    let vl = endsIn(ffl,'.html')?insertBoilerplate(ivl,scripts,''):ivl;
    console.log('writing',ffl);
   fs.writeFileSync('www/'+ffl,vl);
   
  }
  
  var xferFiles = function (dir,ext,fls,forU) {
    forUsers = forU;
    fls.forEach(function (fl) {
      xferFile(dir+fl+ext); 
    });
  }
 /* 
  var addHtml = function (fls) {
    fls.forEach(function (fl) {
      addFile(fl+'.html');
    });
  }
  
  var addDoc = function(fl) { 
     var ffl = "doc/"+fl;
   console.log('ADDING HTML DOC ',ffl);
    addFile(ffl); 
  }
*/
  
 /*
 
  var addIntroDoc = function(fl) { 
     var ffl = "intro/"+fl;
   console.log('ADDING HTML INTRO ',ffl);
    addFile(ffl); 
  }

  var addHtmlInIntro = function (a,fls) {
    fls.forEach(function (fl) {
      addIntroDoc(fl+'.html'); 
    });
  }
  
  var addIntroJS= function (a,fls) {
    fls.forEach(function (fl) {
      addIntroDoc(fl+'.js'); 
    });
  }
var fts = [];
if (index) {
  addHtml(['index']);
} else if (diagrams) {
  addHtml(['diagrams']);
}else {
  */
  
//  index = 1;
  xferFiles('','.html',['devindex','transfer','diagrams','test','nomodules','unsupported','swap','sample','draw','drawd','code','coded','data',
                        'datad','text','textd','catalog','coreExamples',
                       'image','sign_in','password','account','programming','chooser','beta','boxGallery']);
  xferFiles('','.html',['index','index','sindex','index_alt1','index_alt2','ops'],false);//forUsers
    xferFiles('doc/','.html',['swap','pswap','about','pidea','ui_and_api'],false);//forUsers
xferFiles('doc/','.html',["idea","project","code","choosedoc","rectangle","prototypetree","advantages",
                            "tutorial","inherit","deepPrototypes","tech","privacy","network","toc"]);
  xferFiles('intro/','.html',['mainIntro','animate','kit','files','tutorial_index','swap','swapPart','intro','tree','insert','exercise',
                              'network_main','connect','cayley',"basic_ops","properties","data","prototypes","separate","variant","wrap","share",
                              'textbox','copy','catalog',,'image','diagrams','diagrams_main',"network",'details','cohorts','code_intro']);
  xferFile('intro/pages.js');
 // xferFile('favicon.ico');
  xferFile('robots.txt');
    xferFile('sitemap.xml');

  xferFile('spectrum.css');
xferFile('style.css');
xferFile('gallery.css');





  