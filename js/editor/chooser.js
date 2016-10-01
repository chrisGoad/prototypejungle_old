
// This is one of the code files assembled into pjchooser.js. 
var mpg; // main page
var mpg = html.Element.mk('<div style="position:absolute;margin:0px;padding:0px"/>');

 var highlightColor = "rgb(100,140,255)"; //light blue

var forDraw = false;
var codeBuilt = false;
var itemLines;
var itemLinesByName;
var selectedItemLine;
var selectedItemName;
var selectedFolder;
var fileTree;
var afterYes;
var isVariant;
var itemsMode;
var folderError;
var repo; // the repo of the current user, if any
var handle; // ditto if any
var fhandle; // the handle of the currently selected folder
var pathLine;
var itemName;
var currentItemPath; // for saving, this is the current item in the inspector
var newItem = false;
var currentItemFolder; // for saving, this is the current item in the inspector
var inFrame = false;// is this page in an iframe, or at top level? usually the former, only the latter for debugging
var whichPage;
var imageIsOpen;
var lastClickTime0; // double clicking is confusing; ignore clicks too close together. to keep track of dbl clicks, we need to
var lastClickTime1; //store the last three click
var lastClickTime2;
var minClickInterval = 500; // millisecs
var baseTime = Date.now();
var parentPJ;
var noItemSelectedError = false;

var newUserInitialPath = "sys/repo0/example";


var openB,deleteB,folderPanel,itemsPanel,panels,urlPreamble,fileNameLine,fileName,fileNameExt,errDiv0,errDiv1,yesBut,noBut,newFolderLine,newFolderB,
    newFolderInput,newFolderOk,closeX,modeLine,bottomDiv,errDiv1Container,forImage,imageDoneBut,forImageDiv,itemsDiv,
    fileNameSpan,aspectRatioLine,aspectRatioSpan,aspectRatioInput,fpCloseX,fullPageDiv,fullPageText,noNewFolderTextEntered,selectedFolderPath,
    selectedItemKind;
    
function initVars() {
  itemLines = [];
  itemLinesByName = {}
  selectedFolder = selectedFolderPath = undefined;
    isVariant = false;
  inFrame = window !== window.top;
  
 
}

  
  
var itemsBrowser =  html.Element.mk('<div  style="position:absolute;width:100%;height:100%"/>');
itemsBrowser.__addChildren([
  modeLine = html.Element.mk('<div style="padding:10px;width:100%;text-align:center">Mode</div>'),
  newFolderLine = html.Element.mk('<div/>').__addChildren([
    newFolderB  = html.Element.mk('<div class="button">New Folder</div>'),
                           // hoverOut:{"background-color":"white"},
                           // hoverIn:{"background-color":highlightColor},style="cursor:"pointer"}}),
    newFolderInput = html.Element.mk('<input type="input" style="display:none;font:8pt arial;background-color:#e7e7ee,width:60%;margin-left:10px"/>'),
    newFolderOk =  html.Element.mk('<div class="button">Ok</div>')

  ]),
  errDiv0 =  html.Element.mk('<span class="error" style="font-size:12pt"/>'),
  html.Element.mk('<div/>').__addChildren([
     pathLine = html.Element.mk('<span/>'),
     itemName = html.Element.mk('<span/>')
     ]),
  itemsPanel = html.Element.mk('<div id="itemsPanel" style="overflow:auto;ffloat:right;height:100%;width:100%;border:solid thin black"/>').__addChildren([
      itemsDiv=html.Element.mk('<div style="width:100%;height:100%"/>'),
      forImage =  html.Element.mk('<img style="display:none;border:solid thin black;margin-right:auto;margin-left:auto"/>')
    ]),
 
  bottomDiv = html.Element.mk('<div style="padding-top:10px;width:100%"/>').__addChildren([
    html.Element.mk('<div/>').__addChildren([
      fileNameLine = fileNameSpan = html.Element.mk('<span>Filename: </span>'),
      fileName = html.Element.mk('<input type="input" style="font:8pt arial;background-color:#e7e7ee,width:60%;margin-left:10px"/>'),
      fileNameExt = html.Element.mk('<span>.svg</span>'),
      openB =  html.Element.mk('<span class="button" style="float:right">New Folder</span>'),
      deleteB =  html.Element.mk('<span class="button" style="float:right">Delete</span>')
      ]),
    aspectRatioLine = html.Element.mk('<div/>').__addChildren([
      aspectRatioSpan = html.Element.mk('<span>Aspect ratio: </span>'),
      aspectRatioInput= html.Element.mk('<input type="input" style="font:8pt arial;background-color:#e7e7ee,width:30%;margin-left:10px"/>'),
      html.Element.mk('<span>(initialized based on content - but settable)</span> ')
    ]),
  ]),
  errDiv1Container = html.Element.mk('<div/>').__addChildren([
      errDiv1 = html.Element.mk('<div class="error" style="font-size:12pt"/>'),
      html.Element.mk('<div/>').__addChildren([
        yesBut =  html.Element.mk('<div class="button">Yes</div>'),
        noBut =  html.Element.mk('<div class="button">No</div>'),
      ])
  ])
]);
fullPageDiv = html.Element.mk('<div style="width:100%"/>').__addChildren([
  fullPageText = html.Element.mk('<div style="padding-top:30px;width:90%;text-align:center;font-weight:bold"/>')
]);
    
var buttonText = {"saveAs":"Save","saveAsSvg":"Save As SVG","insertOwn":"Insert","open":"Open","dataSource":"Ok","viewSource":"View/Edit Source"};//"saveAsBuild":"Save","new":"Build New Item","open":"Open",

var modeNames = {"saveAs":"Save As","saveAsSvg":"Save As Svg","insertOwn":"Insert","open":"Open","dataSource":"Select new data source","viewSource":"View/Edit Source"};
// not in use: insertOwn, and viewSource
var dismissChooser = function () {
  ui.sendTopMsg(JSON.stringify({opId:"dismissChooser"}));
}

mpg.addChild(itemsBrowser);
  mpg.addChild(fullPageDiv);
  noNewFolderTextEntered = false;
  newFolderB.$click(function() {
    newFolderInput.$show();
    newFolderOk.$show();
    newFolderInput.$prop("value","Name for the new folder");
    noNewFolderTextEntered = true;
  });
function layout() {
  var awinwid = $(window).width();
  var awinht = $(window).height();
  var topht = ((itemsMode === "open")?0:newFolderLine.$height()) + modeLine.$height() + pathLine.$height();
  var botht = bottomDiv.$height() + errDiv1Container.$height();
  var itemsht = awinht - topht - botht - 60;
  itemsPanel.$css({height:itemsht+"px"});
  var eht = awinht - 10;
  mpg.$css({height:eht,top:"0px",width:"99%"});
}
// for accessibility from the parent window
window.layout = layout;
  
  

function setFilename(vl,ext) {
  fileName.$prop("value",vl);
  clearError();
}

function fileExists(nm) {
  var cv = selectedFolder[nm];
  if (cv) {
    if (typeof cv === "object") {
      return "folder"
    } else {
      return "file";
    }
  }
}


var disableGray = "#aaaaaa";

var enableButton = ui.enableButton = function (bt,vl) {
  bt.disabled = !vl;
  bt.$css({color:vl?"black":disableGray});
}

var disableButton = function (bt) {
  enableButton(bt,false);
}


function clearError() {
  errDiv0.$hide();
  errDiv1.$hide();
  yesBut.$hide();
  noBut.$hide();
  openB.$show();
  layout();
}

function fullPageError(txt) {
  itemsBrowser.$hide();
  fullPageDiv.$show();
  if (typeof txt === "string") {
    fullPageText.$html(txt);
  } else {
    fullPageText.__element.append(txt);
  }
}

 
function setError(options) {
  if (typeof options === "string"){
    var txt  = options;
    var ed = errDiv0;
  } else {
    var div1 = options.div1;
    var txt = options.text;
    var temporary = options.temporary;
    var yesNo  = options.yesNo;
    var ed = div1?errDiv1:errDiv0;
  }
  ed.$html(txt);
  ed.$show();
  if (yesNo) {
    openB.$hide();
    noBut.$show();
    yesBut.$show();
  } else   {
    noBut.$hide();
    yesBut.$hide();
  }
  if (temporary) {
    setTimeout(function (){ ed.__element.$hide(500);},1500);
  }
  layout();
}
  
yesBut.$click(function () {
  debugger;
  clearError();
  afterYes();
}); // after yes is set later
noBut.$click(clearError);
  
var pathAsString = function (nd,rt) {
  return pj.pathToString(nd.__pathOf(rt));
}

var addJsExtension = function (s) {
  if (pj.endsIn(s,'.js')) {
    return s;
  }
  return s+'.js';
}
  
var actOnSelectedItem = function (deleteRequested) {
  debugger;
  var tloc = window.top.location;
  var inm = $.trim(fileName.$prop("value"));
  if ((itemsMode === 'dataSource') && inm) {
    if (inm && (pj.beginsWith(inm,'http:') || pj.beginsWith(inm,'https:'))){ // a full url for the datasource
      parent.pj.ui.chooserReturn({path:inm});
      return;
    }
  }
  if (!selectedFolder) {
    folderError = true;
    setError({text:"No folder selected",div1:true});
    return;
  }
  var fpth = pathAsString(selectedFolder);
  if (itemsMode === "saveAs" ||   itemsMode === "saveAsSvg") { // the modes which create a new item or file
    if (!inm) {
      setError({text:"No filename.",div1:true});
      return;
    }
    if (!nameChecker(fileName)) {
      return;
    }
    var nm = inm+((itemsMode==='saveAsSvg')?'.svg':'');
    var pth = (fpth?("/"+fpth):"") +"/"+nm;
    var fEx = fileExists(nm);
   
    //if ((itemsMode === "saveAs") || (itemsMode === "saveAsSvg")) {
    var topId = itemsMode;
    afterYes = function() {
      debugger;
      var ar =  Number(aspectRatioInput.$prop("value"));
      if (Number.isNaN(ar)) {
          setError({text:"Aspect ratio is not a number",div1:true});
          return;
      }
      parent.pj.ui.chooserReturn({path:pth,aspectRatio: Number(aspectRatioInput.$prop("value"))});;
    }
    if (fEx === "file") {
      setError({text:"This file exists. Do you wish to overwrite it?",yesNo:1,div1:true});
     
      return;
    }
    if (fEx === "folder") {
      setError({text:"This is a folder. You cannot overwrite a folder with a file",div1:true});
      return;
    }
    afterYes();
  }
    // ok now the options where one is dealing with an existing item
  if (!selectedItemName) {
    noItemSelectedError = true;
    setError({text:"No item selected",div1:true});
    return
  }
  var pth = currentUid() + (fpth?("/"+fpth):"") +"/"+selectedItemName;
  if (itemsMode === "open"  || itemsMode === "dataSource") {
    if (deleteRequested) {
      afterYes = function () {
        parent.pj.ui.chooserReturn({path:pth,deleteRequested:true});
      }
      setError({text:"Are you sure you wish to delete this file? There is no undo",yesNo:1,div1:true});
    } else {
      parent.pj.ui.chooserReturn({path:pth});
    }
    return;
  }
}
  
openB.$click(function () {actOnSelectedItem(false);});
deleteB.$click(function () {actOnSelectedItem(true)});

function pathsToTree (fls) {
  return fls;
  var sfls = fls.map(function (fl) {return fl.split("/")});
  var rs = {};
  sfls.forEach(function (sfl) {
    var  cnd = rs;
    var ln = sfl.length;
    for (var i=0;i<ln;i++) {
      var nm = sfl[i];
      var nnd = cnd[nm];
      if (!nnd) {
        if (i === (ln-1)) {
          cnd[nm] = "leaf";
        } else {
          cnd[nm] = nnd = {};
        }
      }
      cnd = nnd;
    }
  });
  return rs;
}
function addNewFolder(nm) {
  var ck = pj.checkName(nm);
  if (!ck) {
    setError('Names may contain only letters, numerals, and the underbar or dash, and may not start with a numeral');
    return;
  }
  var sf = selectedFolder;
  var apth = sf.__pathOf();
  if (sf[nm]) {
    setError('There is already a folder by that name');
    return;
  }
  var nnd  = pj.Object.mk();
  sf.set(nm,nnd);
  setSelectedFolder(sf);
}
  
var nff = function () {
  var nm = newFolderInput.$prop("value");
  if (nm) {
    addNewFolder(nm);
  }
  newFolderInput.$hide();
  newFolderOk.$hide();
  
};
newFolderOk.$click(nff);
//newFolderInput.$enter(nff);
  
  
  
var nameEntered = false; // for insertOwn; means the user has typed something into the "instert as"
var firstPop = true;
var assembly;
var keys;

function popItems() { 
  debugger;
  keys = parent.pj.ui.chooserKeys;  // the file tree
  var mode = itemsMode;
  //disableButton(deleteB);
  aspectRatioLine.$hide();
  if  ((mode === "saveAs") || (mode === "saveAsSvg") ) {
    newFolderLine.$show();
  } else {
    newFolderLine.$hide();
  }
  if (mode === 'saveAsSvg') {
      debugger;
      aspectRatioLine.$show();
      aspectRatioInput.$prop("value",pj.nDigits(parent.pj.ui.aspectRatio,3));// I don't understand why this is needed, but is
  }
  if ((mode=="saveAs") || (mode=="saveAsSvg") || (mode === "dataSource")) {
    deleteB.$hide();
    fileNameSpan.$show();
    if (mode === 'saveAsSvg') {
      fileNameExt.$show();
    } else {
      fileNameExt.$hide();
    }
    if (mode === "dataSource") {
      fileNameSpan.$html('Or specify data source here (any url):')
    }
    fileName.$show();
  } else {
    //newFolderLine.$show();
    fileNameSpan.$hide();
    fileName.$hide();
    fileNameExt.$hide();
    deleteB.$show();

  }
  debugger;
  modeLine.$html(modeNames[itemsMode]);
  var tr  = pathsToTree(keys);
  fileTree = pj.lift(tr);
  if (itemsMode === 'dataSource') {
    fileTree = fileTree.data;
  }
  debugger;
  layout();
  initVars();
  setSelectedFolder(fileTree);
  var btext = buttonText[itemsMode];
  openB.$html(btext);
  clearError();
}

  
function selectedItemPath() {
  var fpth = pathAsString(selectedFolder);
  return fpth + "/" + selectedItemName;
}



function selectItemLine(iel) {
  if (iel === selectedItemLine) return;
  pj.log('chooser','selecting item line');
  if (typeof iel === "string") {
    var el = itemLinesByName[iel];
  } else {
    el = iel;
  }
  if (selectedItemLine) {
    selectedItemLine.$css({'background-color':'white'});
  }
  el.$css({'background-color':highlightColor});
  selectedItemLine = el; 
}

var currentUid = function () {
  return '['+ parent.pj.fb.currentUid()+ ']';
};

var setPathLine = function (nd) {
  var pth = nd.__pathOf();
  var pel = pathLine.__element;   
  pathLine.$empty();
  var first = false;
  if (1 || (itemsMode === "open")) {
    //var uid = parent.pj.fb.currentUser.uid;
    //pth.unshift('['+uid+']');//pj.itemHost);
    pth.unshift(currentUid());
    first = true;
  }
  var cnd = fileTree;
  pth.forEach(function (nm) {
    if (first) {
      first = false;
    } else {
      var slel = html.Element.mk('<span>/</span>');
      pathLine.push(slel);
      cnd = cnd[nm];
    } 
    var lcnd = cnd; // so it gets closed over
    var el = html.Element.mk('<span class="pathLineElement">'+nm+'</span>');
    el.$click(function () {
      setSelectedFolder(lcnd,true);
    });

    pathLine.push(el);
  });
}
  
function shiftClickTimes() {
  lastClickTime0 = lastClickTime1;
  lastClickTime1 = lastClickTime2;
  lastClickTime2 = Date.now();
 
}

// the clicking is too fast from the point of view of a double click, if the earlier click interval is too short
function checkQuickClick (fromDbl) {
  var tm = Date.now();
   
  if (lastClickTime2) {
    var itv = tm - lastClickTime2;
    pj.log('chooser',tm-baseTime,"click interval",itv,"dbl",fromDbl,"lct0",lastClickTime0-baseTime,"lct1",
    lastClickTime1-baseTime,"lct2",lastClickTime2-baseTime);
    if (itv < minClickInterval) {
      if (fromDbl) { // we care how long it was since the click prior to the double click 
      if (lastClickTime0) {
        var interval = tm - lastClickTime0;
        pj.log('chooser',"double click interval",interval);
        if (interval < minClickInterval) {
          pj.log('chooser',"double click too quick");
          return true;
        }
      }
    } else {
      pj.log('chooser',"click too quick");
      shiftClickTimes(); 
      return true;
    }
    }
  }
  if (!fromDbl) shiftClickTimes();    
}
 
var setSelectedItem = function(nm) {
  selectedItemName = nm;
  if (noItemSelectedError) {
    clearError();
    noItemSelectedError = false;
    openB.$show();
  }
  if (!nm) {
    //deleteB.$hide(); for later implementation
    selectedItemKind =  undefined;
    return;
  }
  setFilename(nm);
  selectedItemKind = selectedFolder[nm];
  pj.log('chooser',"Selected Kind",selectedItemKind);
}
  
 
var setSelectedFolder = function (ind,fromPathClick) {
  if (typeof ind === "string") {
    var nd = pj.evalPath(fileTree,ind);
  } else {
    nd = ind;
  }
  var apth = nd.__pathOf();
  var pth = pj.pathToString(apth);
  fhandle = apth[0];
  newFolderOk.$hide();

  if (itemsMode !== "open") {
    var atTop = nd === fileTree;
    newFolderInput.$hide();
    newFolderB.$html("New Folder");
    newFolderB.$show();
  }
  selectedItemName = undefined;
  selectedItemLine = undefined;
  selectedFolder = nd;
  localStorage.lastFolder = pth;
  setPathLine(nd);
  if (folderError) {
    clearError();
    folderError = false;
  }
  var items = pj.treeProperties(nd,true);
  pj.log('chooser',"selected ",nd.name,items);
  var ln = items.length;
  var numels = itemLines.length;
  for (var i=0;i<ln;i++) {
    var nm = items[i];
    var ch = nd[nm];
    var isFolder =  typeof ch === "object";
    var imfile = isFolder?"folder.ico":"file.ico"
    var el = itemLines[i];
    if (el) {
      el.nm.$html(nm);
      el.im.$attr('src','/images/'+imfile);
      el.removeEventListener('click');
      el.removeEventListener('dblclick');
      el.$show();
      el.$css({'background-color':'white'});
    } else {
      var imel = html.Element.mk('<img style="cursor:pointer;background-color:white" width="16" height="16" src="/images/'+imfile+'"/>');
      var nmel =  html.Element.mk('<span id="item" class="chooserItem">'+nm+'</span>');
      var el = html.Element.mk('<div/>');
      el.set("im",imel);
      el.set("nm",nmel);
      itemLines.push(el);
      itemsDiv.push(el);
    }
    itemLinesByName[nm] = el;
    // need to close over some variables
    var clf = (function (el,nm,isFolder) {
      return function () {
      if (checkQuickClick()) {
        return;
      }
        if (isFolder) {
          var ch = selectedFolder[nm];
          setSelectedFolder(ch);
          selectedItemName = undefined;
        } else {
        setSelectedItem(nm);
          selectItemLine(el);
        }
      }
    })(el,nm,isFolder);
    el.$click(clf);
    //el.$mouseup(function (e) {  });
    if (!isFolder  && (itemsMode==="open")) {
      var dclf = (function (nm,pth) {
        return function () {
        if (!checkQuickClick(true)) {
          actOnSelectedItem();
        }
        }
      })(nm,pth); 
      el.$dblclick(dclf);
    }
  }
  for (var i=ln;i<numels;i++) {
    itemLines[i].$hide();
  }
  setFilename("");
}

var nameChecker = function (input,e) {
  //console.log('KEY',e.which);
   if (e && (e.which === 13)) {
     nff();
   }
   var fs = input.$prop("value");
   if (!fs ||  pj.checkName(fs)) {
     clearError();
     return true;
   } else {
     setError({text:"The name contain characters only digits and letters",div1:false});
     return false;
   }
 }
 
ui.genMainPage = function (options) {
  if (pj.mainPage) return;
  debugger;
  pj.mainPage = mpg; 
  mpg.__draw(document.body);
  mpg.$css({width:"100%"});
  var clearFolderInput = function () {
    if (noNewFolderTextEntered) {
      //newFolderInput.$attr("value","");
      newFolderInput.$prop("value","");
      newFolderOk.$show();

      noNewFolderTextEntered = false;
    }
  }
  newFolderOk.$hide();


  newFolderInput.addEventListener("keydown",clearFolderInput);
  newFolderInput.addEventListener("mousedown",clearFolderInput);
  newFolderInput.addEventListener("keyup",function (e) {
    nameChecker(newFolderInput,e);
    return;
    console.log('KEY',e.which);
    if (e.which === 13) {
      nff();
    }
    var fs = newFolderInput.$prop("value");
    if (!fs ||  pj.checkName(fs)) {
      clearError();
    } else {
      setError({text:"The name contain characters only digits and letters",div1:false});  
    }
  });
  debugger;
  itemsMode = parent.pj.ui.chooserMode;
  fileName.removeEventListener("keyup");
  if (itemsMode !== 'dataSource') {
    fileName.addEventListener("keyup",function (e) {
      nameChecker(fileName,e);
    });
  }
  forDraw = options.fordraw;
  popItems();//options.item,options.mode,options.codeBuilt);
}


})(prototypeJungle);
