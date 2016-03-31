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
  
  
  
  var openB,folderPanel,itemsPanel,panels,urlPreamble,fileName,fileNameExt,errDiv0,errDiv1,yesBut,noBut,newFolderLine,newFolderB,
      newFolderInput,newFolderOk,closeX,modeLine,bottomDiv,errDiv1Container,forImage,imageDoneBut,forImageDiv,itemsDiv,
      //fileNameSpan,fpCloseX,fullPageText,insertPanel,insertPrototype,insertPrototypePath,insertInstance,insertInstanceTitle,insertInstancePath,
      //insertOkB,insertCancelB,insertError;
      fileNameSpan,fpCloseX,fullPageText;//,insertPanel,insertPrototype,insertPrototypePath,insertInstance,insertInstanceTitle,insertInstancePath,
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

   
   /* insertPanel = html.Element.mk('<div style="overflow:auto;height:50%;width:100%;border:solid thin black"/>').addChildren([
	insertPrototype = html.Element.mk('<div/>').addChildren([
	    html.Element.mk('<div style="font-size:8pt;padding:4px">On the first insert, an item is inserted twice: once as a prototype, \
and then as an instance of that prototype.  With repeated insertions, only the \
new instance is added, retaining the same prototype. This allows editing of __properties of all of the instances at once, via \
the prototype.</div>'),
	    html.Element.mk('<div style="padding:5px"/>').addChildren([
	      html.Element.mk('<span style="padding-right:20px">Prototype path: </span>'),
	      html.Element.mk('<span style="font-weight:bold;text-decoration:underline">prototypes</span>'),
	      insertPrototypePath = html.Element.mk('<input type="input" style="width:40%"/>')
	    ])
	  ])
	]),
	*/
    itemsPanel = html.Element.mk('<div id="itemsPanel" style="overflow:auto;ffloat:right;height:100%;width:100%;border:solid thin black"/>').addChildren([
        itemsDiv=html.Element.mk('<div style="width:100%;height:100%"/>'),
	forImage =  html.Element.mk('<img style="display:none;border:solid thin black;margin-right:auto;margin-left:auto"/>')
      ]),
   
    bottomDiv = html.Element.mk('<div style="padding-top:10px;width:100%"/>').addChildren([

      fileNameSpan = html.Element.mk('<span>Filename: </span>'),
      //urlPreamble = html.Element.mk('<span"}),
      fileName = html.Element.mk('<input type="input" style="font:8pt arial;background-color:#e7e7ee,width:30%;margin-left:10px"/>'),
      fileNameExt = html.Element.mk('<span>json</span>'),
       openB =  html.Element.mk('<span class="button" style="float:right">New Folder</span>'),
      //deleteB =  html.Element.mk('<span",html:"Delete",class:"smallButton",style="float:"right"}}); for later implementation

     ]),
    errDiv1Container = html.Element.mk('<div/>').addChildren([
        errDiv1 = html.Element.mk('<div class="error" style="font-size:12pt"/>'),
        html.Element.mk('<div/>').addChildren([
          yesBut =  html.Element.mk('<div class="button">Yes</div>'),
          noBut =  html.Element.mk('<div class="button">No</div>')
	])
      ]),

    ]);
    fullPageDiv = html.Element.mk('<div style="width:100%"/>').addChildren([
    
      fullPageText = html.Element.mk('<div style="padding-top:30px;width:90%;text-align:center;font-weight:bold"/>')
    ]);
    
  var buttonText = {"saveAs":"Save","insert":"Insert","open":"Open","dataSource":"Ok","viewSource":"View/Edit Source"};//"saveAsBuild":"Save","new":"Build New Item","open":"Open",
  //                  "addComponent":"Add Component"};
  //var drawButtonText = {"new":"New","insert":"Insert","save":"Save","saveAs":"Save as"}
  //
  //var devModeNames = {"new":"Build New Item","open":"Inspect an Item",
  //                 "saveAsBuild":"Fork","saveAsVariant":"Save Current Item as Variant","addComponent":"Add Component"};

  //var drawModeNames = drawButtonText;
  
  var modeNames = {"saveAs":"Save As","insert":"Insert","open":"Open","dataSource":"Select new data source","viewSource":"View/Edit Source"};
  //var buttonText;
		    
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
  
 
  //function setError(txt,yesNo,temporary,div1) {
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
    openB.$hide();
    if (yesNo) {
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
  
  yesBut.$click(function () {afterYes();}); // after yes is set later
  noBut.$click(clearError);
/*
  
  function openSelectedItem(pth) {
    parent.pj.ui.chooserReturn({opId:topId,value:{path:pth,force:1}});

    var nm = pj.pathLast(pth);
    if (pj.endsIn(nm,".jpg")) {
      showImage(pth);
    } else if (pj.endsIn(nm,".json")) {
      showJson(pth);
    } else {
      ui.sendTopMsg(JSON.stringify({opId:"openItem",value:pth}));
    }
  }
  */
    
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
    debugger;
    var tloc = window.top.location;
    if (!selectedFolder) {
      folderError = true;
      setError({text:"No folder selected",div1:true});
      return;
    }
    if (aboveRepo(selectedFolder)) {
      folderError = true;
      setError({text:"You must save this item within an existing repo",div1:true});
      return;
    }
    var fpth = pathAsString(selectedFolder);
    if (itemsMode === "new" ||  itemsMode === "saveAs" ||  itemsMode === "saveAsVariant" || itemsMode == "saveAsBuild" ) { // the modes which create a new item or file
      var nm = fileName.$prop("value");
      var pth = "/"+fpth +"/"+nm;//+'.js';
      var fEx = fileExists(nm);
      if (!nm) {
	      setError({text:"No filename.",div1:true});
	      return;
      }
      if ((itemsMode === "saveAsVariant") || (itemsMode === "saveAs") || (itemsMode === "saveAsBuild") || (itemsMode ==="new")) {
  	    if (itemsMode === "new") {
	        var topId =  "newItemFromChooser";
	      } else {
	        topId = itemsMode;
	      }
	      if (fEx === "file") {
	        setError({text:"This file exists. Do you wish to overwrite it?",yesNo:1,div1:true});
	        afterYes = function() {
            debugger
            parent.pj.ui.chooserReturn({path:pth,force:1});
	        }
	        return;
	      }
	      if (fEx === "folder") {
	        setError({text:"This is a folder. You cannot overwrite a folder with a file",div1:true});
	        return;
	      }
	      parent.pj.ui.chooserReturn({path:pth});
	      return;
      }
      //if (itemsMode === "new") {
	    //ui.sendTopMsg(JSON.stringify({opId:"newItemFromChooser",value:pth}));
      //  return;
      //}
    }
    // ok now the options where one is dealing with an existing item
    if (!selectedItemName) {
      noItemSelectedError = true;
      setError({text:"No item selected",div1:true});
      return
    }
    var pth = fpth +"/"+selectedItemName;
    if (itemsMode === "open"  || itemsMode === "viewSource" || itemsMode === "dataSource") {
      debugger;
      parent.pj.ui.chooserReturn({path:pth});
      return;
    }
    if ((itemsMode === "addComponent")||(itemsMode === "insert")) {
      //var pth = pathAsString(selectedFolder) + "/" + selectedItemName;
      if (itemsMode === "insert") {
         parent.pj.ui.chooserReturn({where:fileName.$prop("value"),path:pth});
	//var msg = {opId:"insertOwn",value:{where:fileName.$prop("value"),path:pth}};
      } else {
        parent.pj.ui.chooserReturn({path:pth});
	 //msg = {opId:itemsMode,value:pth};
      }
      //ui.sendTopMsg(JSON.stringify(msg));
    }
  }
  
  openB.$click(actOnSelectedItem);

  function pathsToTree (fls) {
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
  
  // some items might be assigned eg "kind codebuilt", and "kind codebuilt public".  The latter prevails
  function findKind(tr) {
    var rs;
    for (var k in tr) {
      if (pj.beginsWith(k,"kind ")) {
	if (k.indexOf("public")>0) {
	  return k.substr(5);
	} else {
	  rs = k.substr(5);
	}
      }
    }
    return rs;
    if (tr.view) {
      return "leaf";// no kind specified/ shouldn't happen when everything is rebuilt
    }
  }
  
  //pick out the items 
  function itemize(tr,includeVariants,publicOnly) {
    var rs = {};
    var  hasch = 0;
    var knd;
    for (var k in tr) {
      var st = tr[k];
      if (typeof st === "object") {
	    var knd = findKind(st);
        if (knd) {
          var aknd = (knd.indexOf("variant")>0)?"variant":"codebuilt";
          if (publicOnly) {
            if (knd.indexOf("public")>0) {
              hasch = 1;
              rs[k] = aknd;
            }
          } else {
	        if (includeVariants || (aknd === "codebuilt")) {
              hasch = 1;
              rs[k] = aknd;
            }
	      }
        } else {
          var ist = itemize(st,includeVariants,publicOnly);
          if (ist) {
            rs[k] =  ist;
            hasch = 1;
          }               
        }
      } 
    }
    if (hasch) {
      return rs;
    }
  }
  
  function noRepos() {
    return !handle || !fileTree[handle];
  }
  
  function populateEmptyTree() {
    var rp = pj.Object.mk();
    rp.set("repo0",pj.Object.mk());
    return rp;
    //fileTree.set(handle,rp);
    //return true;
  }
  
  
  
  function suggestedFolder(path,forImage) {
    var sp = pj.stripInitialSlash(path).split("/");
     var ln = sp.length;
    var phandle = sp[0];
    var owner = phandle === handle;
    var nm = sp[ln-1];

    if (!owner) {
      sp[0] = handle;
    }
    if (codeBuilt) {
	  sp.pop(); //pop off name
	  if (itemsMode === "saveAsVariant") {
	    sp.push("variants");
	    sp.push(nm);
	  }
	  return sp.join("/");
    } else {
	  sp.pop();
	  return sp.join("/");
    }
  }
  
  function suggestedName(srcpath,destFolder) {
    debugger;
    if (itemsMode === "saveAsVariant") {
      var nm = "v0";
    } else {
      var nm = pj.pathLast(srcpath).split('.')[0];
    }
    var nmidx = maxIndex(nm,Object.getOwnPropertyNames(destFolder),forImage) + 1;
    if (nmidx === 0) {
      return nm;
    } else {
      return stripDigits(nm) + nmidx;
     
    }
  }
  
   
  // if the current item is a non-variant, we need to add the appropriate variants branch into the tree, if not there already
  // this is a lifted (ie Object tree)
  // the variants branch is at repo/variants/<same path as item>
  function addVariantsBranch(tr,path) {
    var rs=pj.Object.mk();
    var nm = pj.pathLast(path);
    var pth = handle+"/variants/"+nm;
    tr.set(pth,rs);
    return rs;
   
  }
  var reservedFolderNames = {"pj":1,"geom":1,"dom":1,"ws":1,"tree":1,"page":1};
  
  function addNewFolder(nm) {
    var ck = pj.checkName(nm);
    if (!ck) {
      setError('Names may contain only letters, numerals, and the underbar or dash, and may not start with a numeral');
      return;
    }
    var sf = selectedFolder;
    var apth = sf.__pathOf();
    if (apth.length === 2) { // we are at the level just below the repo, where conflicts would arise
      if (reservedFolderNames[nm]) {
	setError(nm+" is a reserved name at this level of the hierarchy");
        return;
      }
    }
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
  function digitsStart(v) {
    var ln = v.length;
    var rs = ln-1;
    while (rs >= 0) {
      var cc = v.charCodeAt(rs);
      if ((47 < cc) && (cc < 58)) { // a digit
        rs = rs -1;
      } else {
        return rs+1;
      }
    }
    return 0;
  }

  function stripDigits(v) {
    var ds = digitsStart(v);
    return v.substr(0,ds);
  }
// if v is abc23, find the max digitwise extension abc in nms (eg 234 for ["oo","abc12","aa","abc234"]
// this is for autonaming
  function maxIndex(v,nms,hasExtension) {
    var rs = -1;
    var ds = digitsStart(v);
    var nds = v.substr(0,ds); // the part before digits at end
    nms.forEach(function (inm) {
      if (fc === "") return;
      var fc = inm[0];
      if (hasExtension) {
	    var nm = pj.beforeChar(inm,".");
      } else {
	    nm = inm;
      }
      var snm = stripDigits(nm);
      if (snm === nds) {
	    if (snm === nm) {
	      var idx = 0;
	    } else {
          var idxs = nm.substr(ds);
          var idx = parseInt(idxs);
	    }
        if (!isNaN(idx)) {
          rs = Math.max(idx,rs);
        }
      }
    });
    return rs;
  }
  
 
  
  function listHandle(hnd,cb) {// __get the static list for the sys tree
    var url = "http://prototypejungle.org.s3.amazonaws.com/"+hnd+" list.js";
    function ajaxcb(rsp) {
      if (rsp.status === 200) {
	    var rs = rsp.responseText;
	    if (rs === "") {
	      rs = hnd+"/repo0\n";
	    }
	    cb(undefined,hnd,rs)
      } else {
	    cb(rsp.status);
      }
    }
    var opts = {crossDomain: true,dataType:"json",url: url,success:ajaxcb,error:ajaxcb};
    $.ajax(opts);
  }
  
  function listHandles(hnds,cb) {
    var ln = hnds.length;
    var n = 0;
    var rs = [];
    var hCb = function (err,h,dts) {
      if (err) {
	    cb(err);
	    return;
      }
      rs = rs.concat(dts.split("\n"));
      n++;
	  cb(undefined,h,dts.split("\n"),n==ln);
      if (n<ln) listHandle(hnds[n],hCb);
    }
    listHandle(hnds[0],hCb);
  }
  
  var stripDomainFromUrl = function (url) {
    var r = /^http\:\/\/[^\/]*\/(.*)$/
    var m = url.match(r);
    if (m) {
      return m[1];
    }
  }
  
  function checkFilename() {
    var fs = fileName.$prop("value");
    if (itemsMode === "insert") {
      //if (!fs ||  pj.checkPath(fs,1)) { // 1 means "allow final slash; USE THIS ONCE paths are supported
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
    } else if (!fs ||  pj.checkName(fs)) {
      clearError();
    } else {
      setError("The name may not contain characters other than digits, letters, and the underbar");
      return 0;
    }
    return 1;
  }
  
  var nameEntered = 0; // for insert; means the user has typed something into the "instert as"
  var firstPop = true;
  //var modeNames = {"new":"New","open":"Inspect an Item",
  //                 "saveAsBuild":"Fork","saveAsVariant":"Save Current Item as Variant","addComponent":"Add Component"};
  var assembly;
  var keys;
  function popItems() { //item,mode,icodeBuilt) {
    debugger;
    keys = parent.pj.ui.chooserKeys;
    itemsMode = parent.pj.ui.chooserMode;
    mode = itemsMode;
    //codeBuilt = !!icodeBuilt; // a global
    //insertPanel.$hide();
    //deleteB.$hide(); for later implementation
    //itemsMode = mode;
   // fileNameExt.$html((itemsMode === "saveAs")?".js":(itemsMode === "saveImage")?".jpg":"");
    if  (mode === "saveAs") {
      newFolderLine.$show();
    } else {
      newFolderLine.$hide();
    }
    if (mode === "insert") {
      assembly  = parent.pj.ui.describeAssembly();
      nameEntered = 0;
    }
    if ((mode==="insert") || (mode === "new") || (mode=="saveAs") || (mode == "saveAsBuild") || (mode === "dataSource")) {
       fileNameSpan.$show();
       fileNameExt.$show();
      if (mode === "insert") {
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
      //handle = localStorage.handle;
    if (!keys) {
      if ((mode !== "open")&&(mode !== "addComponent")) {
        fullPageError("You need to be signed in to build or save items");
        layout();
        return;
      }
    }
    var tr  = pathsToTree(keys);
    fileTree = pj.lift(tr);
    layout();
    initVars();
    setSelectedFolder('sys');
    //openB.$html('Save');
    var btext = buttonText[itemsMode];
    //var btext = 'test';
    openB.$html(btext);
    clearError();
    if (firstPop) {
      fileName.addEventListener("keyup",checkFilename);
      /*function () {
	nameEntered = 1;
        var fs = fileName.$prop("value");
        if (pj.checkPath(fs,itemsMode==="saveImage")) {
          clearError();
        } else {
          setError({text:"The path may not contain characters other than / (slash) ,- (dash),_ (underbar) and the digits and letters",div1:true});  
        }  
      });   */
    }
    return;
    var includeSys = (mode === "open")  || (mode==="addComponent");
    var prefixes = (handle==="sys" || !handle)?["sys"]: includeSys?[handle,"sys"]:[handle];
    var whenFileTreeIsReady = function () {
      debugger;
      if ((itemsMode==="saveAsVariant") || (itemsMode === "saveAs") || (itemsMode === "saveAsBuild")) {
     	if (item) {
          currentItemPath = stripDomainFromUrl(item);
	      var folderPath = suggestedFolder(currentItemPath,(itemsMode === "saveImage"));
	    } else {
	      newItem = true;
	      folderPath = handle+"/repo2/assemblies"; //todo make this the last repo
	    }
        var folder = pj.createPath(fileTree,folderPath.split("/"));
        setSelectedFolder(folder);
	var ivr = suggestedName(currentItemPath?currentItemPath:"drawing0",folder,itemsMode === "saveImage");
        setFilename(ivr);
      } else {
	    var lp = (itemsMode==="insert")?localStorage.lastInsertFolder:localStorage.lastFolder;
	    if (lp && ((itemsMode==="open") ||   (itemsMode === "addComponent") || (handle === "sys") || (!pj.beginsWith(lp,'sys')) )) { // can't write into non-owned folders
	      var lfld = pj.evalPath(fileTree,lp);
	      if (lfld) {
	        setSelectedFolder(lfld);
	        return;
	      }
	    }
	    if ((itemsMode==="open") && noRepos()) {
	      var folderPath = newUserInitialPath;
	      setSelectedFolder(folderPath);
	      return;
	    } 
        if (handle === "sys") {
	      var hnd = fileTree[handle];
          if (!hnd) {
            hnd = fileTree.set(handle,pj.Object.mk());
          }
          setSelectedFolder(hnd);
	    } else {
	      if (itemsMode === "insert") {
	        setSelectedFolder(pj.evalPath(fileTree,"sys/repo0/geom"));
	      } else {
            setSelectedFolder(fileTree);
	      }
        }
      }
    }
    whenFileTreeIsReady();
    return;
    function genHandleTree(h,itemPaths) {
      var tr  = pathsToTree(itemPaths);
      var includeVariants = (itemsMode !== "insert");
      var restrictToPublic = h !== handle;
      var itr = itemize(tr,includeVariants,restrictToPublic);//includeData,includeVariants); // this variant restricts to public; putback     
      if (itr) {
        return pj.lift(itr[h]);
        
      } else {
        return undefined;
      }
    }
    
    function installTree(h,itemPaths) {
      var tr  = pathsToTree(itemPaths);

     // var ht  = genHandleTree(h,itemPaths);
      //if ((h === handle) && (itemsMode!=="open") && (itemsMode!=="addComponent") && (!ht)) {
      if ((h === handle) && (!ht)) {
        ht = populateEmptyTree();
      }
      fileTree.set(h,ht);
    }
    fileTree = pj.Object.mk();
    listHandles(prefixes,function (e,h,fls,done) {
      var pb = handle !== h;
      installTree(h,fls);
      if (done) {
        whenFileTreeIsReady();
      }
    });
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
    if ((itemsMode === "open") || (itemsMode === "addComponent")) {
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
  // for auto naming
  autoname = function (inm) {
    var nm = inm.split('.')[0];
    var maxnum = -1;
    if (!assembly[nm]) {
      return nm;
    }
    debugger;
    var nmlength = nm.length;
    for (anm in assembly) {
      if (anm === nm) {
	continue;
      }
      var idx = anm.indexOf(nm);
      if (idx === 0) {
	var rst = anm.substr(nmlength);
	if (!isNaN(rst)) {
	  var rint = parseInt(rst);
	  maxnum = Math.max(maxnum,parseInt(rst));
	}
      }
    }
    var num = (maxnum === -1)?1:maxnum+1;
    return nm + num;
  }
  setInsertName = function (nm) {
    if (!nameEntered) {
      setFilename(autoname(nm));
    }
  }
  setSelectedItem = function(nm) {
    selectedItemName = nm;
    if (itemsMode === "insert") {
      setInsertName(nm);
    }
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
    selectedItemKind = selectedFolder[nm];
    pj.log('chooser',"Selected Kind",selectedItemKind);
  }
  
  aboveRepo = function (nd) {
    return ((nd === fileTree) || (nd.__parent === fileTree));
  }
  
  setSelectedFolder = function (ind,fromPathClick) {
    if (typeof ind === "string") {
      var nd = pj.evalPath(fileTree,ind);
    } else {
      nd = ind;
    }
    if (itemsMode === "new"  && !fromPathClick) {
      if (aboveRepo(ind)) {
        nd = fileTree[handle].repo0;
      }
    }
    var apth = nd.__pathOf();
    var pth = pj.pathToString(apth);
    fhandle = apth[0];

    if (!((itemsMode === "open" ) || (itemsMode==="rebuild") || (itemsMode === "addComponent"))) {
      var atTop = nd === fileTree;
      if (atTop) {
        newFolderB.$hide();
        newFolderInput.$hide();
        newFolderOk.$hide();
      } else {
        newFolderInput.$hide();
        newFolderOk.$hide();
        var atHandle = nd === fileTree[handle];
        if (atHandle) {
          newFolderB.$html("New Repo");
        } else {
          newFolderB.$html("New Folder");
        }
	    newFolderB.$show();
      }
    }
    selectedItemName = undefined;
    selectedItemLine = undefined;
    selectedFolder = nd;
    if (itemsMode === "insert") {
      localStorage.lastInsertFolder = pth;
    } else {
      localStorage.lastFolder = pth;
    }
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
  /*
  function checkNamesInInput (ifld,erre) {
    ifld.__element.keyup(function () {
      var fs = ifld.$prop("value");
      if (itemsMode === "insert") {
	debugger;
	if (!fs ||  pj.checkPath(fs,1)) { // 1 means "allow final slash
	  erre.$html("");
	} else {
	  erre.$html('The name may not contain characters other than digits, letters,"_", or "/"');  
	}	//code
      } else if (!fs ||  pj.checkName(fs)) {
        erre.$html("");
      } else {
        erre.$html("The name may not contain characters other than digits, letters, and the underbar");  
      }
    })
  }
   
*/
  ui.genMainPage = function (options) {
    ui.addMessageListener();
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
    //buttonText = forDraw?drawButtonText:devButtonText;
    //modeNames = forDraw?drawModeNames:devModeNames;
    popItems(options.item,options.mode,options.codeBuilt);
  }

//end extract


})(prototypeJungle);
