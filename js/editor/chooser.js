// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code
(function (pj) {
  
  var ui = pj.ui;
  var dom = pj.dom;
  var html = pj.html;

// This is one of the code files assembled into pjchooser.js. //start extract and //end extract indicate the part used in the assembly


//start extract

  var mpg; // main page
  var mpg = html.Element.mk('<div style="position:absolute;margin:0px;padding:0px"/>');
  
   var highlightColor = "rgb(100,140,255)"; //light blue

  var forDraw = 0;
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
  var inFrame = 0;// is this page in an iframe, or at top level? usually the former, only the latter for debugging
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
  
  function initVars() {
    itemLines = [];
    itemLinesByName = {}
    selectedFolder = selectedFolderPath = undefined;
      isVariant = 0;
    inFrame = window !== window.top;
    
   
  }
  
  
  
  var openB,folderPanel,itemsPanel,panels,urlPreamble,fileNameLine,fileName,fileNameExt,errDiv0,errDiv1,yesBut,noBut,newFolderLine,newFolderB,
      newFolderInput,newFolderOk,closeX,modeLine,bottomDiv,errDiv1Container,forImage,imageDoneBut,forImageDiv,itemsDiv,
      //fileNameSpan,fpCloseX,fullPageText,insertPanel,insertPrototype,insertPrototypePath,insertInstance,insertInstanceTitle,insertInstancePath,
      //insertOkB,insertCancelB,insertError;
      fileNameSpan,aspectRatioLine,aspectRatioSpan,aspectRatioInput,fpCloseX,fullPageText;//,insertPanel,insertPrototype,insertPrototypePath,insertInstance,insertInstanceTitle,insertInstancePath,
      //  ,insertCancelB,insertError;
  var itemsBrowser =  html.Element.mk('<div  style="position:absolute;width:100%;height:100%"/>');
    itemsBrowser.addChildren([
    closeX = html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;'+
			     'font-weight:bold,border:thin solid black;font-size:12pt;color:black">X</div>'),
    modeLine = html.Element.mk('<div style="padding:10px;width:100%;text-align:center">Mode</div>'),
    newFolderLine = html.Element.mk('<div/>').addChildren([
      newFolderB  = html.Element.mk('<div class="button">New Folder</div>'),
                             // hoverOut:{"background-color":"white"},
                             // hoverIn:{"background-color":highlightColor},style="cursor:"pointer"}}),
      newFolderInput = html.Element.mk('<input type="input" style="display:none;font:8pt arial;background-color:#e7e7ee,width:60%;margin-left:10px"/>'),
      newFolderOk =  html.Element.mk('<div class="button">Ok</div>')

    ]),
    errDiv0 =  html.Element.mk('<span class="error" style="font-size:12pt"/>'),
    html.Element.mk('<div/>').addChildren([
       pathLine = html.Element.mk('<span/>'),
       itemName = html.Element.mk('<span/>')
       ]),

   

    itemsPanel = html.Element.mk('<div id="itemsPanel" style="overflow:auto;ffloat:right;height:100%;width:100%;border:solid thin black"/>').addChildren([
        itemsDiv=html.Element.mk('<div style="width:100%;height:100%"/>'),
	forImage =  html.Element.mk('<img style="display:none;border:solid thin black;margin-right:auto;margin-left:auto"/>')
      ]),
   
    bottomDiv = html.Element.mk('<div style="padding-top:10px;width:100%"/>').addChildren([
      html.Element.mk('<div/>').addChildren([
        fileNameLine = fileNameSpan = html.Element.mk('<span>Filename: </span>'),
        fileName = html.Element.mk('<input type="input" style="font:8pt arial;background-color:#e7e7ee,width:30%;margin-left:10px"/>'),
        fileNameExt = html.Element.mk('<span>json</span>'),
        openB =  html.Element.mk('<span class="button" style="float:right">New Folder</span>')
        ]),
      aspectRatioLine = html.Element.mk('<div/>').addChildren([
        aspectRatioSpan = html.Element.mk('<span>Aspect ratio: </span>'),
        aspectRatioInput= html.Element.mk('<input type="input" style="font:8pt arial;background-color:#e7e7ee,width:30%;margin-left:10px"/>'),
        html.Element.mk('<span>(initialized based on content - but settable)</span> ')
      ]),
      ]),
    errDiv1Container = html.Element.mk('<div/>').addChildren([
        errDiv1 = html.Element.mk('<div class="error" style="font-size:12pt"/>'),
        html.Element.mk('<div/>').addChildren([
          yesBut =  html.Element.mk('<div class="button">Yes</div>'),
          noBut =  html.Element.mk('<div class="button">No</div>'),
        ])
    ])
    ]);
    fullPageDiv = html.Element.mk('<div style="width:100%"/>').addChildren([
    
      fullPageText = html.Element.mk('<div style="padding-top:30px;width:90%;text-align:center;font-weight:bold"/>')
    ]);
    
  var buttonText = {"saveAs":"Save","saveAsSvg":"Save As SVG","insertOwn":"Insert","open":"Open","dataSource":"Ok","viewSource":"View/Edit Source"};//"saveAsBuild":"Save","new":"Build New Item","open":"Open",
 
  var modeNames = {"saveAs":"Save As","saveAsSvg":"Save As Svg","insertOwn":"Insert","open":"Open","dataSource":"Select new data source","viewSource":"View/Edit Source"};
  //var buttonText;
	// not in use: insertOwn, and viewSource
  var dismissChooser = function () {
    ui.sendTopMsg(JSON.stringify({opId:"dismissChooser"}));
  }
  closeX.$click(dismissChooser);
  
  mpg.addChild(itemsBrowser);
    mpg.addChild(fullPageDiv);
    noNewFolderTextEntered = 0;
    newFolderB.$click(function() {
      newFolderInput.$show();
      newFolderOk.$show();
      newFolderInput.$prop("value","Name for the new folder");
      noNewFolderTextEntered = 1;
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
  
  var actOnSelectedItem = function () {
    var tloc = window.top.location;
    var inm = $.trim(fileName.$prop("value"));
    if ((itemsMode === 'dataSource') && inm) {
      if (inm && (pj.beginsWith(inm,'http:') || pj.beginsWith(inm,'https:'))){ // a full url for the datasource
        parent.pj.ui.chooserReturn({path:inm});
        return;f
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
      var nm = inm+((itemsMode==='saveAsSvg')?'.svg':'');
      var pth = (fpth?("/"+fpth):"") +"/"+nm;
      var fEx = fileExists(nm);
     
      if ((itemsMode === "saveAs") || (itemsMode === "saveAsSvg") ) {
	      topId = itemsMode;
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
	      return;
      }
    }
  
    // ok now the options where one is dealing with an existing item
    if (!selectedItemName) {
      noItemSelectedError = true;
      setError({text:"No item selected",div1:true});
      return
    }
    var pth = (fpth?("/"+fpth):"") +"/"+selectedItemName;
    if (itemsMode === "open"  || itemsMode === "dataSource") {
      parent.pj.ui.chooserReturn({path:pth});
      return;
    }
  }
  
  openB.$click(actOnSelectedItem);

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
  
 
  function noRepos() {
    return !handle || !fileTree[handle];
  }
  
  
  
  
  //var reservedFolderNames = {"pj":1,"geom":1,"dom":1,"ws":1,"tree":1,"page":1};
  
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
  newFolderInput.$enter(nff);
  // finds the max int N among nms where nm has the form vN
  
  
function checkFilename() {
  var fs = fileName.$prop("value");
  if (itemsMode === 'dataSource') {
    /// @todo check extension is one of js, json, or csv
    clearError();
    return 1;
  }
  if (itemsMode === "insertOwn") {
    if (!fs ||  pj.checkName(fs)) { 
	    if (assembly[fs]) {
	      setError('That name is taken');
	      return 0;
	    } else {
	     clearError();
	    }
    } else {
	//setError('The name may not contain characters other than digits, letters,"_", or "/"');  USE THIS WHEN PATHS SUPPORTED
	   setError('The name may not contain characters other than digits, letters, or "_"');  
    }	//code
  } else {
    if (!fs) {
      clearError();
      return;
    }
    let ext = pj.afterLastChar(fs,'.');
    let path = pj.beforeLastChar(fs,'.');
    if (pj.checkName(path)) {
      clearError();
    } else {
      setError("In name.ext, name may not contain characters other than digits, letters, and the underbar");
      return 0;
    }
    
  }
}
  
  var nameEntered = 0; // for insertOwn; means the user has typed something into the "instert as"
  var firstPop = true;
 
  var assembly;
  var keys;
  function popItems() { //item,mode,icodeBuilt) {
    debugger;
    keys = parent.pj.ui.chooserKeys;
    itemsMode = parent.pj.ui.chooserMode;
    mode = itemsMode;
    aspectRatioLine.$hide();
    if  ((mode === "saveAs") || (mode === "saveAsSvg")) {
      newFolderLine.$show();
      if (mode === 'saveAsSvg') {
        debugger;
        aspectRatioLine.$show();
        aspectRatioInput.$prop("value",pj.nDigits(parent.pj.ui.aspectRatio,3));// I don't understand why this is needed, but is
      }
    } else {
      newFolderLine.$hide();
    }
    if (mode === "insertOwn") {
      assembly  = parent.pj.ui.describeAssembly();
      nameEntered = 0;
    }
    if ((mode=="saveAs") || (mode=="saveAsSvg") || (mode === "dataSource")) {
       fileNameSpan.$show();
       fileNameExt.$show();
      if (mode === "insertOwn") {
         fileNameSpan.$html('Insert as:');
      } else if (mode === "dataSource") {
        fileNameSpan.$html('Or specify data source here (any url):')
      }
      fileName.$show();
   } else {
      newFolderLine.$show();
      fileNameSpan.$hide();
      fileName.$hide();
    }
    debugger;
    modeLine.$html(modeNames[itemsMode]);
    if (!keys) {
      if ((mode !== "open")) {
        fullPageError("You need to be signed in to build or save items");
        layout();
        return;
      }
    }
    var tr  = pathsToTree(keys);
    fileTree = pj.lift(tr);
    layout();
    initVars();
    setSelectedFolder(fileTree);
    var btext = buttonText[itemsMode];
    openB.$html(btext);
    clearError();
    if (firstPop) {
      fileName.addEventListener("keyup",checkFilename);
    }
    return;
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

  setPathLine = function (nd) {
    var pth = nd.__pathOf();
    var pel = pathLine.__element;   
    pathLine.$empty();
    var first = 0;
    if ((itemsMode === "open")) {
      pth.unshift('prototypejungle.org');//pj.itemHost);
      first = 1;
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
        setSelectedFolder(lcnd,1);
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
 
  setSelectedItem = function(nm) {
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
  
 
  setSelectedFolder = function (ind,fromPathClick) {
    if (typeof ind === "string") {
      var nd = pj.evalPath(fileTree,ind);
    } else {
      nd = ind;
    }
    var apth = nd.__pathOf();
    var pth = pj.pathToString(apth);
    fhandle = apth[0];

    if (itemsMode !== "open") {
      var atTop = nd === fileTree;
      newFolderInput.$hide();
      newFolderOk.$hide();
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
      if (!isFolder  && (itemsMode==="open")) {
        var dclf = (function (nm,pth) {
          return function () {
	        if (!checkQuickClick(1)) {
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
  
  ui.genMainPage = function (options) {
    //alert(66)
    if (pj.mainPage) return;
    pj.mainPage = mpg; 
    mpg.__draw(document.body);
    mpg.$css({width:"100%"});
    var clearFolderInput = function () {
      if (noNewFolderTextEntered) {
	    newFolderInput.$prop("value","");
	    noNewFolderTextEntered = 0;
      }
    }
    newFolderInput.addEventListener("keydown",clearFolderInput);
    newFolderInput.addEventListener("mousedown",clearFolderInput);
    newFolderInput.addEventListener("keyup",function () {
      var fs = newFolderInput.$prop("value");
      if (!fs ||  pj.checkName(fs)) {
        clearError();
      } else {
        setError({text:"The name may not contain characters other than / (slash) ,- (dash),_ (underbar) and the digits and letters",div1:false});  
      }
    });
    forDraw = options.fordraw;
    popItems(options.item,options.mode,options.codeBuilt);
  }

//end extract


})(prototypeJungle);
