OBSOLETE
/* generates common elements of the html pages */
if (typeof prototypeJungle === "undefined") {
  var prototypeJungle = {};
}


(function (pj) {
  
var ui = pj.ui;


// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract
 
   // lightboxes without dependencies
var lightBoxWidth = 500;
var lightBoxHeight = 400;
//var atMain  = location.href.indexOf("http://prototypejungle.org")===0;
//var host = (pj.devVersion)?"http://prototype-jungle.org:8000":"http://prototypejungle.org";
ui.releaseMode = true; // until release, the signin and file buttons are hidden                

// For active pages, worker.html is loaded into an iframe from http://prototype-jungle.org (where the real work, non-s3, goes on)
// the chooser is also loaded from that domain. postMessage is used for cross frame communication

var openItemBut;

var fileBut;
ui.genButtons = function (container,options,cb) {
  var toExclude,down,includeFile,qs;
  var toExclude = options.toExclude;
  var down = options.down;
  var includeFile = options.includeFile;
  function addButton(id,text,url) {
    if (down && (id==="file" || id==="sign_in")) return;
    if (toExclude && toExclude[id]) return;
    if (url) {
      var rs = document.createElement('a');
      rs.className = "ubutton";
      rs.setAttribute('href',url);
    } else {
      var rs = document.createElement('a');
      rs.className = "ubutton";
    }
    rs.innerHTML = text;
    container.appendChild(rs);
    return rs; 
  }
  if (includeFile) {
    openItemBut = addButton('openItem',"File");
    openItemBut.click(function () {
      ui.popChooser('open');
    });
  }
  qs = ui.parseQuerystring();
  if (qs.intro) {
     //addButton('charts','Charts','/charts'); 
  } else {
   addButton('tutorial','Intro ','/ui?intro=1'); 
  } 
  addButton('github','GitHub ','https://github.com/chrisGoad/prototypejungle/tree/firebase');
  addButton('tech','Docs',"/doc/choosedoc.html");
  addButton('about','About',"/doc/about.html");

  if (cb) cb();
}
   
  


//end extract

  
})(prototypeJungle);


