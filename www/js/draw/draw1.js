
// scheme for saving.  for a code built, owned item, objects, internal data, objects, code, and components can all be modified
//modifying any of the last three means a new build is needed.  build brings all into sync, and if it fails, records that failure
// at s3.  A missing of failed build item is called unbuilt. (the data.js file will record this). Save from the file menu just saves,
// and if the build is out of sync, turns this unbuilt. modification of objects makes the code read only and of code makes the
// objects read only 

(function (pj) {
  var actionHt;
  var pt = pj.pt;
  var ui = pj.ui;
  var dom = pj.dom;
  var html = pj.html;
  var geom = pj.geom;
  var svg = pj.svg;
  var tree = pj.tree;
  var lightbox = pj.lightbox;
 
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

// this is called from the chooser. Used in insert or duplicate to manage target for the insertion/duplication
  var notInAssembly = {__inserts:1,transform:1,__requires:1};
  
  ui.describeAssembly = function (inode) {
    var node = inode?inode:ui.root;
    if (node.__isPart) {
      return "part";
    }
    var rs = {};
    pt.forEachTreeProperty(node,function (child,prop) {
      if (notInAssembly[prop]) {
        return;
      }
      var sub = ui.describeAssembly(child);
      rs[prop] =  sub;
    });
    return rs;
  }



  var geom = pj.geom;
  var treePadding = 0;//10;
  var bkColor = "white";
  var docDiv;
  var minWidth = 1000;
  var plusbut,minusbut;
  //var isTopNote;
  var flatMode;
  var flatInputFont = "8pt arial";
  var uiDiv,topbarDiv,obDivTitle;//topNoteDiv,
  var msgPadding = "5pt";
  var inspectDom = 0;
  ui.fitMode = 0;
  var unpackedUrl,unbuiltMsg;
  ui.docMode = 1;
  ui.saveDisabled = 0; // true if a build no save has been executed.
  // the tab for choosing modes: objects, code, data
       
  //var modeTab = ui.modeTab = dom.Tab.mk(['Objects','Code','Data','Requires'],'Objects');
  //var modeTab = ui.modeTab = dom.Tab.mk(['Objects','Data'],'Objects');
  //modeTab.build();
  var buttonSpacing = "10px";
  var buttonSpacingStyle = "margin-left:10px";
   var jqp = pj.jqPrototypes;
   // the page structure
  var mainTitleDiv = html.wrap('mainTitle','div');
  // note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed.
    var test=html.Element.mk('<div class="roundButton">Top</div>');
    
  var mpg = ui.mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).addChildren([
    topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).addChildren([
  
    actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').addChildren([
        ui.itemName = html.Element.mk('<span id="buttons" style="overflow:none;padding:5px;height:20px">Name</span>'),
        ui.fileBut = html.Element.mk('<div class="ubutton">File</div>'),
        ui.aboutBut = html.Element.mk('<div class="ubutton">About</div>'),
        ui.shareBut = html.Element.mk('<div class="ubutton">Share</div>'),
        ui.helpBut = html.Element.mk('<div class="ubutton">Help</div>')
      ]),
      ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
    ]),

    //modeTab.domEl,
    

    cols =  html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').addChildren([
      ui.docDiv =  docDiv = html.Element.mk('<iframe src="/devdoc/intro.html" id="docDiv" style="postion:absolute;height:400px;width:600px;background-color:white;border:solid thin red;display:inline-block"/>'),
      ui.svgDiv = html.Element.mk('<div id="svgDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
        tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').addChildren([
          ui.noteSpan = html.Element.mk('<span>Click on things to inspect them.</span>'),
          ui.upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
          ui.downBut =html.Element.mk('<div class="roundButton">Down</div>'),
          ui.topBut =html.Element.mk('<div class="roundButton">Top</div>')
        ])
     ]),
   // tree.objectContainer =  html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"/>').addChildren([
    tree.objectContainer = uiDiv = html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"/>').addChildren([
      //   ui.obMsg = html.Element.mk('<div id="obMsg" style="background-color:white;font-size:10pt;padding-left:msgPadding"/>'),
       

       // tree.objectContainer = html.Element.mk('<div id="objectContainer" style="position:absolute;background-color:white;border:solid thin black"/>').addChildren([
            tree.obDivRest = tree.obDiv = html.Element.mk('<div id="obDiv" style="position:absolute;background-color:white;border:solid thin blue;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>').addChildren([
                            html.Element.mk('<div style="margin-bottom:0px;border-bottom:solid thin black"/>').addChildren([
                              obDivTitle = html.Element.mk('<span style="margin-bottom:10px;border-bottom:solid thin black">Workspace</span>')
             ]),
            //tree.obDivRest = html.Element.mk('<div style="overflow:auto;border:solid thin red"/>'), 
      //    ]),
         /* tree.protoDiv = html.Element.mk('<div style="position:absolute;background-color:white;margin:0px;border:solid thin black;overflow:auto;padding:treePadding+px"/>').addChildren([
            html.Element.mk('<div style="width:100%;border-bottom:solid thin black"/>').addChildren([
              tree.protoDivTitle = html.Element.mk('<span>Prototype Chain</span>')
            ]),
            tree.protoDivRest = html.Element.mk('<div style="border-top:thin black;overflow:auto"/>')
          ])*/
        ])
      ])
    ])
  ]);
  
  //var docDiv =  ui.docDiv = html.Element.mk('<iframe src="/doc/chartdoc.html" style="border:solid thin green;position:absolute"/>');

  
  var cnvht = "100%"

  
  //tree.codeToSave = "top";
  
   
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = 1;
  ui.layout = function(noDraw) { // in the initialization phase, it is not yet time to __draw, and adjust the transform
    // aspect ratio of the UI
    var bkg = "gray";
    var svgwd = 500;
    var svght = 500;
    var ar = 0.5;
    var pdw = 30; // minimum padding on sides
    var vpad = 40; //minimum sum of padding on top and bottom
    var cdims = geom.Point.mk(svgwd,svght);
    var awinwid = $(window).width();
    var awinht = $(window).height();
    if (awinwid < minWidth) {
      var ppageWidth = minWidth; // min size page
      var lrs = pdw;
    } else if (awinht < ar * minWidth) {
      var ppageWidth = minWidth; // min size page
      var lrs = 0.5 * (awinwid - minWidth) +  pdw;
    } else { // enough room
      var twd =  awinht/ar; 
      if (twd < awinwid) { // extra space in width
        var lrs = 0.5 * (awinwid-twd) + pdw;
        var ppageWidth = twd;
      } else {
        var lrs = pdw;
        var ppageWidth = awinwid;
      }
    }
    var ppageHeight = ar * ppageWidth;
    var pageWidth = ppageWidth - 2 * pdw;
    var pageHeight = ppageHeight - vpad;
    
    if (ui.includeDoc) {
      var docTop = pageHeight * 0.8 - 20;
      pageHeight = pageHeight * 0.8;
      var docHeight = awinht - pageHeight - 30;
    }
    var  twtp = 2*treePadding;
    if (ui.docMode) {
      var docwd = 0.25 * pageWidth;
      var svgwd = (0.5 * pageWidth);
    } else {
      docwd = 0;
      svgwd = 0.75 * pageWidth;
    }
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    
    var treeInnerWidth = treeOuterWidth - twtp;
    mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-22)+"px"});
    var topHt = topbarDiv.__element.offsetHeight;// was jquery .height()
    
    cols.$css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
    //modeTab.domEl.$css({top:"28px",left:svgwd+"px",width:(svgwd + "px")})
    uiDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")})
    ui.ctopDiv.$css({"padding-top":"0px","padding-bottom":"30px","padding-right":"10px",left:svgwd+"px",top:"0px"});

    actionDiv.$css({width:(uiWidth + "px"),"padding-top":"0px","padding-bottom":"30px",left:"200px",top:"0px"});
    var actionHt = actionDiv.__element.offsetHeight;//+(isTopNote?25:0);
    topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var svght = pageHeight - actionHt -30;
    var panelHeaderHt = 26; // the area above the object/code/data/component panels 
    //var treeHt = 5+ svght - 2*treePadding - panelHeaderHt;
    var treeHt = svght;
    tree.myWidth = treeInnerWidth;
    var tabsTop = "20px";
    //tree.editContainer.$css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    //tree.editDiv.$css({width:(svgwd+"px"),height:((treeHt)+"px")});
   // tree.objectContainer.$css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    //tree.componentsDiv.$css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    //tree.protoDiv.$css({width:(treeInnerWidth + "px"),height:(treeHt+20+"px"),top:"0px",left:(treeOuterWidth+"px")});
    //tree.dataContainer.$css({width:(svgwd + twtp+ "px"),height:((treeHt-15)+"px"),top:tabsTop,left:"0px"});
    //tree.dataDiv.$css({width:(svgwd+20+"px"),height:((treeHt)+"px")}); 
    ui.svgDiv.$css({id:"svgdiv",left:docwd+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
    ui.svgHt = svght; 
    docDiv.$css({left:"0px",width:docwd+"px",height:svght+"px",overflow:"auto"});
    svg.main.resize(svgwd,svght); 
    svg.main.positionButtons(svgwd);
    tree.noteDiv.$css({"width":(svgwd - 140)+"px"});
    if (firstLayout) {
      firstLayout = 0;
      ui.layout();
    }
  }
  
  
  
   ui.addButtons = function (div,navTo) {
    var plusbut,minusbut,navbut;
    var divel = div.__element;
    ui.plusbut = plusbut = html.Element.mk('<div id="plusbut" class="button" style="position:absolute;top:0px">+</div>');
    ui.minusbut = minusbut = html.Element.mk('<div id="minusbut" class="button" style="position:absolute;top:0px">&#8722;</div>');
    ui.navbut = navbut = html.Element.mk('<div id="navbut" class="button" style="position:absolute;top:0px">'+navTo+'</div>');
    plusbut.__addToDom(divel);
    minusbut.__addToDom(divel);
    navbut.__addToDom(divel);
   // this.initButtons();
  }
  
  

  ui.positionButtons = function (wd) {
    if (ui.plusbut) {
      ui.plusbut.$css({"left":(wd - 50)+"px"});
      ui.minusbut.$css({"left":(wd - 30)+"px"});
      ui.navbut.$css({"left":"0px"});
    }
  }
  
   // now this is an occaison to go into flat mode
   // called from graphical select (svgx)
  ui.setInstance = function (itm) {
    //modeTab.selectElement("Objects");
    if (!itm) {
      return;
    }
    if (!flatMode) {
      ui.setFlatMode(true);
      ui.topBut.$show();
      ui.upBut.$show();
    }
    tree.showItem(itm,itm.selectable?"expand":"fullyExpand",1);
    tree.showProtoChain(itm);
    ui.upBut.$show();
    enableTreeClimbButtons();
    return;
  }
  
pt.selectCallbacks.push(ui.setInstance); 

  
  ui.elementsToHideOnError = [];
 
 
  
 

  // a prototype for the divs that hold elements of the prototype chain
  
  tree.protoSubDiv = html.Element.mk('<div style="background-color:white;margin-top:20px;border:solid thin green;padding:10px"/>');

  var errorDiv =  html.wrap('error','div');
  
  
  ui.elementsToHideOnError.push(cols);
  
  ui.elementsToHideOnError.push(actionDiv);

 
  ui.elementsToHideOnError.push(docDiv);
  tree.obDiv.click = function () {
    dom.unpop();
  };
  
 
  /*
   *tree.protoDiv.click = function () {
    dom.unpop();
  };
  */
  ui.setFlatMode = function(vl) {
    flatMode = vl;
    tree.enabled = !vl;
    obDivTitle.__element.innerHTML = flatMode?"Selected Item":"Workspace";
    return;//putback
    if (!vl) {
      tree.initShapeTreeWidget();
      tree.adjust();
    }
  }
  
  
  tree.viewNote = function(k,note) {
    var h = k?'<b>'+k+':</b> '+note:note;
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(h)
    return;
  }
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 

   

  var annLink = html.Element.mk('<div/>');
  annLink.addChild('caption',html.Element.mk('<div/>'));
  annLink.addChild('link',html.Element.mk('<div/>'));
  
  /*
  function inspectItem(pth) {
    var loc = "/inspect?item=/"+pth;
    location.href = loc;
  }
 */

  // called from the chooser
  
  ui.popItems = function(mode) {
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.chooser_lightbox;
    lb.pop(undefined,undefined,1);
    var chh = ui.useMinified?"/chooser.html":"/chooserd.html";
    var fsrc = chh;
    fsrc = fsrc + "?fordraw=1&amp;mode="+mode;
    if (ui.url) {
      fsrc= fsrc + "&amp;item="+pt.pathExceptLast(ui.url);
    }
    var ifrm = html.Element.mk('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'"/>')
    lb.setContent(ifrm);
  }
  var functionToEdit;
  
  function editorWindow() {
    var ifrm = ui.editorIframe;
    return ifrm[0].contentWindow;
  }
  
  
  
  window.fromEditor = function (msg,value) {
    if (msg == "ready") {
      var w = editorWindow();
      w.initializeEditor(ui.editorRect,functionToEdit);
    } else if (msg === "newCode") {
      var pth = functionToEdit[1];
      var toe = "prototypeJungle."+pth +" = "+value;
      try {
        eval(toe);
      } catch(e) {
        var w = editorWindow();
        w.setPjError("Error: "+e.message);
        var wasError = 1;
      }
      if (!wasError) {
        mpg.editor_lightbox.dismiss();
        updateAndShow();
      }
    } else if (msg === "cancel") {
      mpg.editor_lightbox.dismiss();

    }
  }
  

  var workerIsReady = 0;
  var whenWorkerIsReady;
  ui.messageCallbacks.workerReady = function () {
    debugger;
    workerIsReady = 1;
    if (whenWorkerIsReady) {
      whenWorkerIsReady();
    }
 }

  ui.messageCallbacks.dismissChooser = function () {
    mpg.chooser_lightbox.dismiss();
  }
 
   //path will be supplied for saveAs
  // called from the chooser
  // This is for saving variants
  
  ui.pjpathToRepoAndPath = function (pjpath) {
    var fpathS = pjpath.split("/");
    var repo =  ui.itemHost + "/" + fpathS.slice(1,3).join("/");
    var path = fpathS.slice(3).join("/");
    return [repo,path];
  }
  
  ui.messageCallbacks.openItem = function (spath) {
    debugger;
    var drawD = ui.isDev?"/drawd":"/draw";
    var url = drawD + "?item="+spath;
    location.href = url;
  }
  
   ui.anonSave = function () { 
    debugger;
    var needRestore = 0;
    var savingAs = 1;
    var svcnt = ui.saveCount();
    pt.mkXItemsAbsolute(ui.root.__requires,ui.repo);
    pt.anonSave(ui.root,function (srs) {
      // todo deal with failure
      debugger;
      if (srs.status==='fail') {
        return; // go to error page
      } else {
        var path = srs.value;
        var drawD = ui.useMinified?"/draw":"drawd";
        var loc = drawD+"?item="+path;
        location.href = loc;
      }
    });
  }
   
   
  ui.saveAs = function (pAd) { // if !pAd, this is a save, rather than saveAs
    //return; 
    //var vOf = pt.isVariant(ui.root);
    if (pAd) {
      var needRestore = 0;
      var savingAs = 1;
      var frc = pAd.force;
      var rap = ui.pjpathToRepoAndPath(pAd.path);
      var repo=rap[0]
      var path = rap[1];
      var sameRepo = repo === ui.repo; // the variant is in the same repo as the original
      var svcnt = ui.saveCount();
      ui.root.__saveCount = svcnt+1;
      if (!sameRepo) {
        pt.mkXItemsAbsolute(ui.root.__requires,ui.repo);
      }
    } else {
      needRestore = 1;
      savingAs = 0;
      if (!vOf) {
        pt.error("Can't save a non-variant");
      }
      frc = 1;
      repo = ui.repo;
      path = pt.pathExceptLast(ui.path);
    }
    var toSave = {item:ui.root};
    pt.s3Save(toSave,repo,path,function (srs) {
      var asv = afterSave(srs);
      if (asv === "ok") {
        var drawD = ui.useMinified?"/draw":"drawd";
        ui.setSaved(true);
        if (savingAs) { //  go there for a saveAs
          var loc = drawD+"?item="+repo.substring(26)+"/"+path;
          location.href = loc;
        } else {
          ui.itemName.$html(ui.itmName);
        }
      } else {
        mpg.chooser_lightbox.dismiss();
        ui.displayError(ui.activeMessage(),asv);
      }
    },frc,needRestore);  
  }
  
  ui.messageCallbacks.saveAs = ui.saveAs;
  
  var newItemPath;
  ui.messageCallbacks.newItemFromChooser = function (pAd) {
    var path = pAd.path;
    var frc = pAd.force;
    var p = pt.stripInitialSlash(path);
    newItemPath = p;
    var dt = {path:p};
    if (frc) {
      dt.force=1;
    }
    ui.sendWMsg(JSON.stringify({apiCall:"/api/newItem",postData:dt,opId:"newItemFromChooserStage2"}));

  }
  
  
  ui.errorMessages = {timedOut:'Your session has timed out. Please log in again.',
                      noSession:'You need to be logged in to save or build items.',
                      systemDown:"The storage system is down for maintainence (sorry). Please try again later.",
                      busy:'The site is too busy to do the save. Please try again later',
                      collision: 'An unlikely name collision took place. Please try your save again.'
  }
  
  ui.checkForError = function (rs) {
    if (rs.status === "ok") {
      return 0;
    } else {
      ui.nowLoggedOut();
      ui.setFselDisabled();
      var msg = ui.errorMessages[rs.msg];
      msg = msg?msg:"Operation failed. (Internal error)";
      mpg.chooser_lightbox.dismiss();
      displayError(ui.activeMessage(),msg);
      return 1;
    }
  }
  
  ui.messageCallbacks.newItemFromChooserStage2 = function (rs) {
    needsRework();
    if (ui.checkForError(rs)) {
      return;
    }
    var ins = ui.useMinified?"/inspect":"/inspectd";
    var url = ins + "?item=/"+newItemPath;
    location.href = url;
  }
  
// returns "ok", or an error message
  function afterSave(rs) {
    if (rs.status==='fail') {
      if ((rs.msg==="noSession")||(rs.msg === "timedOut")||(rs.msg === "systemDown")) {
        ui.nowLoggedOut();
        ui.setFselDisabled();
      }
      var msg = ui.errorMessages[rs.msg];
      var ht = msg?msg:"Error: "+rs.msg;
      return ht;
    } else {
      return "ok"
    }
  }
  
  ui.saveCount = function () {
    var svcnt = ui.root._pj_saveCount;
    return (typeof svcnt === "number")?svcnt:0;
  }

  function prototypeSource(x) {
    var p = Object.getPrototypeOf(x);
    return pt.pathExceptLast(p._pj_source);// without the /source.js
  }
    
  
  ui.rebuildItem = function () {
    var buildPage = ui.useMinified?"/build":"/buildd";
    location.href =buildPage+"?item=/"+ui.itemPath;
  }
  
  
  
  actionDiv.addChild("itemName",ui.itemName);
 
  var signedIn,itemOwner,objectsModified;
  
  ui.setPermissions = function() {
    signedIn = pt.signedIn();
    ui.signedIn = signedIn;
    var h = ui.handle;
    itemOwner = ui.itemOwner = signedIn && (h===localStorage.handle);
    //ui.codeBuilt =  !pt.isVariant(ui.root);
    ui.objectsModified = 0;
  }
  
   
 
  // file options pulldown 
  
  var fsel = ui.fsel = dom.Select.mk();
  
  fsel.containerP = html.Element.mk('<div style="position:absolute;padding-left:5px;padding-right:5px;padding-bottom:15px;border:solid thin black;background-color:white"/>');
  
  fsel.optionP = html.Element.mk('<div class="pulldownEntry"/>');
          
  var fselJQ;
  
  ui.initFsel = function () {
    fsel.options = ["New","Open...","Insert shape ...","Insert chart...","Edit text...","Data source...","Replace...","Save","Delete"];
    fsel.optionIds = ["new","open","insertShape","insertChart","editText","dataSource","replace","save","delete"];
    var el = fsel.build();
    mpg.addChild(el);
    el.$hide();
  }
  
  ui.setFselDisabled = function () {
      ui.setPermissions();
      /*
      fsel.disabled = {"new":!signedIn,
                       save: !itemOwner,
                       saveAsVariant:!signedIn,
                       delete:!itemOwner};
      */
      fsel.disabled = {};
      fsel.updateDisabled();
  }
      
  
  ui.closer = html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;'+
			     'font-weight:bold,border:thin solid black;font-size:12pt;color:black">X</div>');
  var insertClose = ui.closer.instantiate();
  ui.insertIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="chooser" src="notyet"/>');
  
  var insertDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="insertDiv" />').addChildren([
    insertClose,
    ui.insertIframe
  ]);
  
  var insertsBeenPopped = 0;

  ui.popInserts = function(icat) {
    var category = (icat === 'replace')?'shapes':icat;
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.insert_lightbox;
    var fsrc = "/"+category+".html";
    if (icat === 'replace') {
      fsrc += '?replace=1';
    }
    //var ifrm = html.Element.mk('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'"/>')
    //lb.setContent(ifrm);
    ui.insertIframe.src = fsrc;
    if (!insertsBeenPopped) {
      lb.setContent(insertDiv);
      insertsBeenPopped = 1;
      //lb.pop(undefined,undefined,1);

    } else {
      ui.insertIframe.__element.src = fsrc;
 // ui.insertIframe.__element.reload();
    }
    window.setTimeout(function () {lb.pop(undefined,undefined,1);},300);
  }
  
  
  insertClose.$click(function () {
    mpg.insert_lightbox.dismiss();
  });

  // If only one of the parts has a data source, this is what appears in the data source lightbox, regardless
  // of which part is selected. If there are multiple data sources, then popping the lightbox will ask which
  // (not yet).
  
  ui.partsWithDataSource = function () {
    var rs = [];
    pt.forEachPart(ui.root,function (node) {
      if (node.__dataSource) {
        rs.push(node);
      }
    });
    return rs;
  }
  
  // returns the dataSource of some part, if only one part has a dataSource.
  
  ui.getPartDataSource = function () {
    var pwd = ui.partsWithDataSource();
    if (pwd.length===1) {
      return pwd[0].__dataSource;
    }
  }
  
  
  var dataSourceClose = ui.closer.instantiate();
  var dataSourceInput,loadDataButton,installDataButton,dataTextarea,theLoadedData,theDataSource;
  
  var dataLines = function (addTo,els) {
    els.forEach(function (el) {
      addTo += JSON.stringify(el) + '\n';
    })
    return addTo;
  }
  
  
  ui.showTheData = function (data) {
    debugger;  
    //var pwds =  ui.partsWithDataSource()[0];
    //var item = ui.dataSourceItem;
    var txt = JSON.stringify(data.fields);
    var dlines = dataLines(txt,data.elements);
    dataTextarea.$html(dlines); 
  }
  
  ui.installTheData = function () {
    //var pwds =  ui.partsWithDataSource()[0];
    var item = ui.dataSourceItem;
    item.__xdata = theLoadedData; 
    item.__dataSource = theDataSource;
    item.set("data", dat.internalizeData(theLoadedData,'NNC'));//,"barchart"));//dataInternalizer(rs);
    item.outerUpdate();
    item.draw();
    mpg.datasource_lightbox.dismiss();

  }
  
  
  ui.loadTheData = function () {
   // item.outerUpdate();return; 
    //var pwds = ui.partsWithDataSource()[0];
    var ds = dataSourceInput.$prop('value');
    //var item = ui.dataSourceItem;
    debugger;
    
    pt.loadData(ds,function (err,rs) {
      debugger;
      /*var dlines = dataLines(rs.elements);
      dataTextarea.$html(dlines);  
      item.__dataSource = nds;
      */
      theLoadedData = rs;
      theDataSource = ds;
       ui.showTheData(rs);
     // mpg.datasource_lightbox.dismiss();
       
    });
  } 
  
  var escapeMap = {'<':'&lt;','>':'&gt;','"':'&quot;','&':'&amp;'};
   
  ui.htmlEscape = function (s) { 
    var r = /\<|>|\"/g;
    return s.replace(r,function (c) {return escapeMap[c]});
  }
  
  ui.dataSourceDiv = html.Element.mk('<div width="100%" height="100%"  id="DataSourceSelector" />').addChildren([
    dataSourceClose,
    html.Element.mk('<div style="padding-top:40px;padding-left:20px"><span>Data Source:</span></div>').addChild(
      dataSourceInput = html.Element.mk('<input type="text" style="width:400px"/>')),
    loadDataButton = html.Element.mk('<div class="roundButton">Load Data</div>'),
    installDataButton = html.Element.mk('<div class="roundButton">Install Data</div>'),
    html.Element.mk('<div></div>').addChild(
      dataTextarea  = html.Element.mk('<textarea rows="5" cols="60"></textarea>')
    )
    //dataTextArea = html.Element.mk('<div></div>')
  ]);
  
  dataSourceClose.$click(function () {
    mpg.datasource_lightbox.dismiss();
  });
  
  loadDataButton.$click(ui.loadTheData);
  installDataButton.$click(ui.installTheData);
  
  var dataSourceSelectorBeenPopped = 0; 
  
  ui.popDataSourceSelector = function() {
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.datasource_lightbox; 
    lb.pop(undefined,undefined,1);
    //ui.dataSourceDiv.$show(); 
    debugger;
    if (!dataSourceSelectorBeenPopped){
      lb.setContent(ui.dataSourceDiv);
     // dataTextarea.$attr('rows','40');
      dataSourceSelectorBeenPopped = 1;
    }
    var pwds = ui.partsWithDataSource();
    if (pwds.length === 1) {
      var pwd = pwds[0];
      ui.dataSourceItem = pwd;
      var ds = pwd.__dataSource;  
      //ds = "http://prototypejungle.org/sys/repo1/data/metal_densities.js";
      //ds = "http://prototypejungle.org/sys/repo1/data/metal_densities.js"
      dataSourceInput.$prop('value',ds);
      if (pwd.__xdata) {
        ui.showTheData(pwd.__xdata); 
      }
      //dataSourceInput.$prop('value','http://prototypejungle.org/sys/repo0/data/trade_balance.js');  
    }

  }
  
  
  var editTextClose = ui.closer.instantiate();
  var editOkButton,editTextarea,textNode;
  var editTextBeenPopped = 0;
  
  ui.editTextDiv = html.Element.mk('<div width="100%" height="100%"  id="DataSourceSelector" />').addChildren([
    editTextClose,
    //html.Element.mk('<div style="padding-top:40px;padding-left:20px"><span>Data Source:</span></div>').addChildren(
    html.Element.mk('<div>Editing text  of ....</div>'), 
    editOkButton = html.Element.mk('<div class="roundButton">Ok</div>'),
    html.Element.mk('<div></div>').addChild(
      editTextarea  = html.Element.mk('<textarea rows="5" cols="60"></textarea>')
    )
    //dataTextArea = html.Element.mk('<div></div>')
  ]);
  
  ui.selectedTextNode = function () {
    var nd = pt.selectedNode;
    while (nd) {
      if (nd.getText) {
        return nd;
      }
      nd = nd.parent;
    }
  }
  ui.popEditText = function() {
    ui.editTextarea = editTextarea;
    var lb = mpg.edittext_lightbox; 
    lb.pop(undefined,undefined,1);
    //ui.dataSourceDiv.$show(); 
    debugger;
    if (!editTextBeenPopped){
      lb.setContent(ui.editTextDiv); 
     // dataTextarea.$attr('rows','40');
      editTextBeenPopped = 1;
    }
    textNode = ui.selectedTextNode();
    if (textNode) {
      var txt = textNode.getText();
      editTextarea.$prop('value',txt); 
    }
  }
  
  editOkButton.$click(function () { 
    if (textNode) {
      var newText = editTextarea.$prop('value');
      debugger;
      textNode.putText(newText);
      mpg.edittext_lightbox.dismiss(); 
    }
  })
  ui.useSvgInsert = 1;
  fsel.onSelect = function (n) {
    debugger;
    var opt = fsel.optionIds[n];
    if (fsel.disabled[opt]) return;
    if (opt === "delete") {
      confirmDelete();
      return;
    }
    if (opt === "save") {
      ui.itemName.$html("Saving ...");
      dom.unpop();
      ui.anonSave();
      //ui.saveAsVariant(); 
    } else if ((opt === "insertShape") && ui.useSvgInsert) {
      ui.popInserts('shapes');
    } else if ((opt === "insertChart") && ui.useSvgInsert) {
      ui.popInserts('charts');
    } else if (opt === "editText") {
      ui.popEditText('charts');
    } else if (opt === "replace") {
      ui.popInserts('replace');
    } else if (opt === "dataSource") {
      ui.popDataSourceSelector();
    } else {
      ui.popItems(opt);
    }
  }
 
  ui.fileBut.$click(function () {
    ui.setFselDisabled();
    dom.popFromButton("file",ui.fileBut,fsel.domEl);
  });
  
  ui.svgDiv.$click(function () {fsel.domEl.$css({"display":"none"})});

  tree.onlyShowEditable= false;  
  
  tree.onlyShowEditable= false;
  tree.showFunctions = false;
  
  
 
  tree.autoUpdate = 1;
  
  ui.alert = function (msg) {
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(msg);
  }
 
  var disableGray = "#aaaaaa";

  var enableButton = ui.enableButton = function (bt,vl) {
    bt.disabled = !vl;
    bt.$css({color:vl?"black":disableGray});
  }
  
  
  function enableTreeClimbButtons() {
    var isc = tree.selectionHasChild();
    var isp = tree.selectionHasParent();
    ui.upBut.$show();
    ui.topBut.$show();
    ui.downBut.$show();
    enableButton(ui.upBut,isp);
    enableButton(ui.topBut,isp);
    enableButton(ui.downBut,isc);
  }
 
 ui.enableTreeClimbButtons = enableTreeClimbButtons;

  ui.topBut.$click(function () {
    if (ui.topBut.disabled) return;
    //setFlatMode(false);
    tree.showTop();
    enableTreeClimbButtons();
  });
  
  ui.upBut.$click (function () {
    if (ui.upBut.disabled) return;
    tree.showParent(); // returns hasParent,hasChild
    enableTreeClimbButtons();
  });
  
  
  ui.downBut.$click(function () {
    if (ui.downBut.disabled) return;
    tree.showChild();
    enableTreeClimbButtons();
  });
var aaa = ((ui.itemOwner)?'':'Since you don\'t own this item, the result of the build is not saved either.')

 ' button to rebuild the item from the source code.  When a build is done, \
  all changes made interactively from \
  the object browser are lost (use <b>Save variant</b> from the File pulldown to save interactive changes).' +
  ((ui.itemOwner)?'':'Since you don\'t own this item, the result of the build is not saved either. \
   sdfkjkl');
  
  
  
  /*
  function computeCodeHelp() {
     return '<p>Click the <b>'+((ui.itemOwner)?"Build":"Build-no-save")+'</b>' +
  ' button to rebuild the item from the source code.  When a build is done, \
  all changes made interactively from \
  the object browser are lost (use <b>Save variant</b> from the File pulldown to save interactive changes).' +
  ((ui.itemOwner)?'':'Since you don\'t own this item, the result oif the build is not saved either. \
  The persistent version of the item remains as it was. But, nonetheless, \
  <b>Build-no-save</b> allows you to experiment with the  consequences of code changes.</p>') +
   '<p>In the <b>Catch: Yes</b> state, the build process will be run inside a JavaScript catch, and errors displayed. \
  It is often useful to deal with errors using the browser\'s debugger instead.  \
  Click on the <b>Catch</b> button to toggle catching off.</p> \
  <p>You can change the set of components available in the build using the <b>Requires</b> tab. \
  Changes made to requires will have effect only after a build.</p>\
  The <b>Update</b> button runs the <i>update</i> function of the item, if any, without any rebuild. This can \
  be helpful for debugging <i>update</i>. The button is disabled if there is no <i>update</i> function.';
  }
  */
  
  var dataHelpText ='<p>Data files are <a href="http://json.org" target="pjWindow">JSON</a> \
  wrapped in  <i>callback</i>, \
   <a href="http://en.wikipedia.org/wiki/JSONP" target="pjWindow">JSONP</a> style. Every item has \
  an associated data file, which may reside with the item (this is the case for newly created items, and \
  allows editing the data, if you own the item), \
  or placed  anywhere on the web. </p> \
  <p> You can  change the URL from which data is loaded, whether or not you own the item. Then <b>Update</b> modifies the item \
  to reflect the new data. <b>Save variant</b>(from the <b>File</b> pulldown) associates the new data URL with the saved variant. \    Details on the format of data are given \
  <a href="/doc/tech.html#dataFormat" target="pjWindow">here</a>  </p?';
/*
    var componentHelpText ='<p>The components specified in this tab are available, under the  \
    specified names, in the scope in which a build is done. Changes to requires only have effect \
    after a rebuild. </p>';


  ui.codeHelpBut.$click(function () {
    var cmode = ui.modeTab.selectedElement;
    dom.unpop();
    var rt = ui.root;
    mpg.lightbox.pop();
    if (cmode === "Code") {
      var txt = computeCodeHelp();
    } else if (cmode === "Data") {
      var txt = dataHelpText;
    } else if (cmode === "Requires") {
      txt = componentHelpText;
    }
    mpg.lightbox.setHtml(txt);
  });
 */

 var helpHtml = function () {
  return ui.includeDoc?'<p>Basic instructions appear at the bottom of the page</p>':
  '<p><span>See this </span><a href="/inspect?item=/sys/repo0/example/BarChart2&amp;intro=1">introductory example</a><span> for basic instructions, which appear at the bottom of the introductory example page.</span></p>';
 }

 function shareJq() {
  if (ui.root.surrounders) ui.root.surrounders.remove();
  svg.draw();
  var bb = ui.root.getBBox();
  var ar = ((bb.width == 0)||(bb.height == 0))?1:(bb.height)/(bb.width);
  var sp = ui.pjpath;
  var wdln = html.Element.mk('<div style="padding-left:10px">Width: </div>');
  var initialWd = 500;
  var initialHt = Math.round(ar * initialWd);
  var wdin = html.Element.mk('<input type="text" style="width:100px"/>');
  wdln.addChild(wdin);
  var htln = html.Element.mk('<div style="padding-bottom:5px;padding-left:10px">Height: </div>');
  var htin = html.Element.mk('<input type="text" style="width:100px"/>');
 //rs.append(htln);
  htln.addChild(htin);
  var  rs = html.Element.mk('<div style="padding:20px"/>').addChildren([
    html.Element.mk('<div style="margin:0px;padding:0px">To inspect this item (ie, the current page): </div>'),
    html.Element.mk("<p style='font-size:8pt;padding-left:20px'>"+mkLink("http://prototypeJungle.org/inspect?item="+sp)+"</p>"),
    html.Element.mk("<p>To view it: </p>"),
    html.Element.mk("<p style='font-size:8pt;padding-left:20px'>"+mkLink("http://prototypeJungle.org/view?item="+sp)+"</p>"),
    html.Element.mk("<p>Embed (adjust width and height to taste):</p>"),
    wdln,
    htln]);
  
  wdin.$prop("value",initialWd);
  htin.$prop("value",initialHt);
  return rs;
 }



ui.shareBut.$click(function () {   
  if (ui.root.surrounders) ui.root.surrounders.remove();
  svg.draw();
  var bb = ui.root.getBBox();
  var ar = ((bb.width == 0)||(bb.height == 0))?1:(bb.height)/(bb.width);
  var sp = ui.pjpath;
  var wdln = html.Element.mk('<div style="padding-left:10px">Width: </div>');
  var initialWd = 500;
  var initialHt = Math.round(ar * initialWd);
  var wdin = html.Element.mk('<input type="text" style="width:100px"/>');
  wdln.addChild(wdin);
  var htln = html.Element.mk('<div style="padding-bottom:5px;padding-left:10px">Height: </div>');
  var htin = html.Element.mk('<input type="text" style="width:100px"/>');
  htln.addChild(htin);
  
  htin.addEventListener('change',function () {
    var ht = parseInt(htin.$prop("value"));
    var wd = Math.round(ht/ar);
    wdin.$prop("value",wd);
    updateIframeTxt(wd,ht);
  });
  
  wdin.addEventListener('change',function () {
    var wd = parseInt(wdin.$prop("value"));
    var ht = Math.round(ar * wd);
    htin.$prop("value",ht);
    updateIframeTxt(wd,ht);
  });

  
  var embedDiv = html.Element.mk("<input  class='embed'/>");
  embedDiv.addEventListener('click',function () {
    embedDiv.$focus();
    embedDiv.$select();
  });
 
  var updateIframeTxt = function(wd,ht) {
    var rs = '<iframe width="'+wd+'" height="'+ht+'" src="http://prototypejungle.org/view?item='+sp+'"></iframe>';
    embedDiv.$prop('value',rs);
  }
  var  rs = html.Element.mk('<div/>').addChildren([
    html.Element.mk('<div style="margin:0px;padding:0px">To inspect this item (ie, the current page): </div>'),
    html.Element.mk("<p style='font-size:8pt;padding-left:20px'>"+mkLink("http://prototypeJungle.org/inspect?item="+sp)+"</p>"),
    html.Element.mk("<p>To view it: </p>"),
    html.Element.mk("<p style='font-size:8pt;padding-left:20px'>"+mkLink("http://prototypeJungle.org/view?item="+sp)+"</p>"),
    html.Element.mk("<p>Embed (adjust width and height to taste):</p>"),
    wdln,
    htln,
    html.Element.mk('<div style="margin:0px;padding-left:10px">Copy and paste this:</div>'),
    embedDiv]);
  
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setContent(rs);
      
  wdin.$prop("value",initialWd);
  htin.$prop("value",initialHt);
    updateIframeTxt(initialWd,initialHt)


   });
   
  ui.helpBut.$click(function () {
      dom.unpop();
      mpg.lightbox.setHtml(helpHtml());
      mpg.lightbox.pop();
   });
   
  ui.itemSaved = true; // need this back there
  
  
  
  ui.afterDeleteItem = function (rs) {
    if (ui.checkForError(rs)) {
      mpg.lightbox.dismiss();
      return;
    }
    location.href = "/";
  }
  ui.messageCallbacks.deleteItem = ui.afterDeleteItem;

  
  ui.deleteItem = function () {
    var p = pt.stripInitialSlash(ui.pjpath);
    var dt = {path:p};
    ui.sendWMsg(JSON.stringify({apiCall:"/api/deleteItem",postData:dt,opId:"deleteItem"}));
  }
  
  var dialogOkButton,dialogCancelButton,dialogTitle;
  var dialogEl =html.Element.mk('<div class="Dialog"/>').addChildren([
  
    dialogTitle = html.Element.mk('<div  id="dialogTitle" class="dialogLine"/>').addChildren([
      html.Element.mk('<div  class="Line"/>').addChildren([
        dialogOkButton = html.Element.mk('<div class="button" id="dialogOk">Ok</div>'),
        dialogCancelButton =html.Element.mk('<div class="button" id="dialogCancel">Cancel</div>')
      ])
    ])
  ]);
  

dialogTitle.$html("Are you sure you wish to delete this item? There is no undo.");

dialogOkButton.$click(ui.deleteItem);
dialogCancelButton.$click(function (){
      mpg.lightbox.dismiss();
});

  function confirmDelete() {
    //dialogTitle.$html("Are you sure you wish to delete this item? There is no undo.");

    var lb = mpg.lightbox;
    lb.pop();
    lb.setContent(dialogEl);
   // activateDeleteButtons();
    return false;
  }
  
  var leavingFor;
 
  // see https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
  ui.onLeave = function (e) {
    var msg = (ui.nowDeleting || ui.itemSaved)?null:"The current item has unsaved modifications.";
     (e || window.event).returnValue = msg;     //Gecko + IE
     return msg; //webkit
  }

//end extract


})(prototypeJungle);


