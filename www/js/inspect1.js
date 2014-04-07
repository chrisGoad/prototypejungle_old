// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code
// in any case, a rewrite is needed - not a clean body of code

// scheme for saving.  for a code built, owned item, objects, internal data, objects, code, and components can all be modified
//modifying any of the last three means a new build is needed.  build brings all into sync, and if it fails, records that failure
// at s3.  A missing of failed build item is called unbuilt. (the data.js file will record this). Save from the file menu just saves,
// and if the build is out of sync, turns this unbuilt. modification of objects makes the code read only and of code makes the
// objects read only

// from laptop
(function (__pj__) {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  //var draw = __pj__.draw;
  var svg = __pj__.svg;
  var draw = __pj__.draw;
  var tree = __pj__.tree;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var dataOps = __pj__.dataOps;
  var treePadding = 10;
  var bkColor = "white";
  var docDiv;
  var minWidth = 1000;
  var plusbut,minusbut;
  var isTopNote;
  var flatMode;
  var flatInputFont = "8pt arial";
  // flatMode: no trees in the workspace or proto windows.  Here's code for that
  var itemName,fileBut,customBut,aboutBut,shareBut,noteDiv,helpBut;
  var topbarDiv,cols,svgDiv,topNoteDiv,uiDiv,actionDiv,obDivTop,obDivTitle,ctopDiv,shareBut,upBut,cfBut;
  var editMsg;
  var dataMsg;
  var msgPadding = "5pt";
  var inspectDom = 0;
//  var testDom =  dom.El('<div style="background-color:white;border:solid thin black;display:inline-block">TEST DOM');
  om.inspectMode = 1; // if this code is being loaded, inspection is happening
  var unpackedUrl;
  var saveDisabled = 0; // true if a build no save has been executed.
  // the tab for choosing modes: objects, code, data
  
  var modeTab = page.modeTab = dom.Tab.mk(['Objects','Code','Data','Components'],'Objects');
  var modeTabJQ = modeTab.toJQ();
  var buttonSpacing = "10px";
   var jqp = __pj__.jqPrototypes;
   // the page structure
  var mainTitleDiv = dom.wrapJQ('#mainTitle');
  // note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed. 
  var mpg = page.mpg =  dom.wrapJQ("#main",{style:{position:"absolute","margin":"0px",padding:"0px"}}).addChildren([
    topbarDiv = dom.wrapJQ('#topbar',{style:'position:absolute;left:0px;background-color:bkColor;margin:0px;padding:0px'}).addChildren([
      topNoteDiv = dom.El({tag:"div",id:"topNote",style:{position:"absolute","top":"50px",left:"215px",font:"11pt arial italic","cursor":"pointer"}}),
     actionDiv = dom.El('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').addChildren([
        itemName = page.itemName = dom.El({tag:"span",html:"Name",id:"buttons",style:{overflow:"none",padding:"5px",height:"20px"}}),
        fileBut = jqp.ubutton.instantiate().set({html:"File"}),
        customBut = page.customBut = jqp.ulink.instantiate().set({html:"Arrange"}),
        aboutBut = page.aboutBut = jqp.ubutton.instantiate().set({html:"About"}),
        shareBut = jqp.ubutton.instantiate().set({html:"Share"}),
        helpBut = jqp.ubutton.instantiate().set({html:"Help"}),
      ]),
      ctopDiv = page.ctopDiv = dom.wrapJQ('#topbarInner',{style:{float:"right"}})
    ]),
    modeTabJQ,
   
    cols =  dom.El({tag:"div",id:"columns",style:{left:"0px",position:"relative"}}).addChildren([
      
      svgDiv =  page.svgDiv = dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
        //vbut = jqp.button.instantiate().set({html:"Viewer",style:{position:"absolute",top:"0px",left:"10px"}}),
        tree.noteDiv = noteDiv = dom.El({tag:"div",style:{"font":"10pt arial","background-color":"white",position:"absolute",top:"0px",
                         left:"90px","padding-left":"4px","border":"solid thin black"}}).addChildren([
          noteSpan = dom.El({tag:"span",html:"Clockk on things to inspect them. "}),
          upBut = jqp.roundButton.instantiate().set({html:"Up",style:{}}),
          downBut = jqp.roundButton.instantiate().set({html:"Down",style:{}}),
          topBut = jqp.roundButton.instantiate().set({html:"Top",style:{}})

        ])
     ]),
      page.uiDiv = uiDiv = dom.El({tag:"div",id:"uiDiv",style:{position:"absolute","bbackground-color":"white",margin:"0px",padding:"0px"}}).addChildren([
         page.obMsg = obMsg = dom.El({tag:"div",id:"obMsg",html:"",style:{"background-color":"white","font-size":"10pt",
                        "padding-left":msgPadding}}),

        page.editButDiv = editButDiv = dom.El({tag:"div",style:{positionn:"absolute"}}).addChildren([
            unbuiltMsg = dom.El({tag:"span",html:"Unbuilt",style:{color:"red"}}),
            buildBut = jqp.roundButton.instantiate().set({html:"Build ",style:{"margin-left":buttonSpacing}}),
            execBut = jqp.roundButton.instantiate().set({html:"Build No Save",style:{"margin-left":buttonSpacing}}),
            updateBut = jqp.roundButton.instantiate().set({html:"Update",style:{"margin-left":buttonSpacing}}),
            saveDataBut = jqp.roundButton.instantiate().set({html:"Save Data to File",style:{"margin-left":buttonSpacing}}),
            reloadDataBut = jqp.roundButton.instantiate().set({html:"Reload Data",style:{"margin-left":buttonSpacing}}),
           saveCodeBut = jqp.roundButton.instantiate().set({html:"Save Unbuilt",style:{"margin-left":buttonSpacing}}),
            catchBut = jqp.roundButton.instantiate().set({html:"Catch:Yes",style:{"margin-left":buttonSpacing}}),
            codeHelpBut = jqp.roundButton.instantiate().set({html:"?",style:{"margin-left":buttonSpacing}}),
            addComponentBut = jqp.roundButton.instantiate().set({html:"Add Component",style:{"margin-left":"40px"}})

    ]),
        tree.editContainer = dom.El({tag:"div",id:"editContainer",hidden:1,sytle:{position:"absolute","background-color":"white",border:"solid thin black"}}).addChildren([
          editMsg = page.editMsg = dom.El({tag:"div",style:{"font-size":"10pt","padding-left":msgPadding},html:"Experiment freely, but save to your own area prior ro persistent modifications."}),
        
        
          tree.editDiv = dom.El({tag:"div",id:"editDiv",style:{position:"absolute","background-color":"white",width:"100%",height:"100%",border:"solid thin black",
                                overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}})
        ]),
        tree.dataContainer = dom.El({tag:"div",id:"dataContainer",hidden:1,style:{position:"absolute","background-color":"white",border:"solid thin black",width:"100%"}}).addChildren([
          dataMsg = page.dataMsg = dom.El({tag:"div",style:{"font-size":"10pt",width:"100%"}}),
          dataSourceInputC = page.dataSourceInputC = dom.El({tag:"div",html:"From: ",style:{"font-size":"10pt",width:"100%"}}).addChildren([
              page.dataSourceInput =  page.dataSourceInput = dom.El({tag:"input",type:"text",style:{"font-size":"10pt",width:"80%"}}),
              page.dataEditableSpan = dom.El({tag:"span",html:" (editable)"})
          ]),
          tree.dataDiv = dom.El({tag:"div",id:"dataDiv",style:{position:"absolute","background-color":"white",width:"100%",height:                                "100%",border:"solid thin green",
                                overflow:"auto","vertical-align":"top",margin:"0px"}})//,padding:treePadding+"px"}})
          ]),
          tree.componentContainer = dom.El({tag:"div",id:"components",hidden:1,style:{positionn:"absolute","background-color":"white",bborder:"solid thin black"}}).addChildren([
            componentMsg = dom.El({tag:"div",html:"",style:{"padding-left":msgPadding}}),
            tree.componentsDiv = dom.El({tag:"div",id:"componentDiv",style:{position:"absolute","background-color":"white",width:"100%",height:                                "100%",border:"solid thin black",
                                overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}})
          ]),

        tree.objectContainer = dom.El({id:"objectContainer",tag:"div",style:{position:"absolute","background-color":"white",border:"solid thin black"}}).addChildren([
 //           obMsg = dom.El({tag:"div",id:"obMsg",style:{"background-color":"white","font-size":"10pt"}}),
            tree.obDiv = dom.El({tag:"div",style:{position:"absolute","background-color":"white",border:"solid thin black",
                                overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}}).addChildren([
              obDivTop = dom.El({tag:"div",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}}).addChildren([
              obDivTitle = dom.El({tag:"span",html:"Workspace",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}})
             ]),
            tree.obDivRest = dom.El({tag:"div",style:{overflow:"auto"}}),
          ]),
          tree.protoDiv = dom.El({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px","border":"solid thin black",
                               overflow:"auto",padding:treePadding+"px"}}).addChildren([
            dom.El({tag:"div",style:{"width":"100%","border-bottom":"solid thin black"}}).addChildren([
              tree.protoDivTitle = dom.El({tag:"span",html:"Prototype Chain"})
            ]),
            tree.protoDivRest = dom.El({tag:"div",style:{"border-top":"thin black",overflow:"auto"}})
          ])
        ])
      ])
    ])
  ]);

    var docDiv =  page.docDiv = dom.El({tag:"iframe",attributes:{src:"/doc/chartdoc.html"},style:{border:"solid thin black",position:"absolute"}});

  //mpg.addChild(docDiv);
  var cnvht = "100%"

  
  topBut.hide();
  upBut.hide();
  downBut.hide();
  
 // svg.main.width = 600;
 // svg.main.height = 600;;
  tree.codeToSave = "top";
  
  
  //page.elementsToHideOnError.push(docDiv)
  
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = 1;
  page.layout = function(noDraw) { // in the initialization phase, it is not yet time to draw, and adjust the transform
    // aspect ratio of the UI
    var bkg = om.root.backgroundColor;
    var svgwd = svg.main.width;
    var svght = svg.main.height;
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
    
    if (page.includeDoc) {
      var docTop = pageHeight * 0.8 - 20;
      pageHeight = pageHeight * 0.8;
      var docHeight = awinht - pageHeight - 30;
    }
    var  twtp = 2*treePadding;
    var svgwd = (pageWidth/2) - twtp;
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    
    var treeInnerWidth = treeOuterWidth - twtp;
    mpg.css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-22)+"px"});
    var topHt = topbarDiv.height();
    
    cols.css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
    modeTabJQ.css({top:"28px",left:svgwd+"px",width:(svgwd + "px")})
    //editButDiv.css({top:"38px",left:svgwd+"px",width:(svgwd + "px")})
    uiDiv.css({top:"0px",left:svgwd+"px",width:(svgwd + "px")})
    ctopDiv.css({"padding-top":"10px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});

    actionDiv.css({width:(uiWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:"200px",top:"0px"});

    var actionHt = actionDiv.__element__.outerHeight()+(isTopNote?25:0);
    topbarDiv.css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var svght = pageHeight - actionHt -30;
     var panelHeaderHt = 26; // the area above the object/code/data/component panels
   
    var treeHt = 5+ svght - 2*treePadding - panelHeaderHt;
    tree.myWidth = treeInnerWidth;
    var tabsTop = "20px";
    tree.editContainer.css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
     tree.editDiv.css({width:(svgwd+"px"),height:((treeHt)+"px")});
    tree.objectContainer.css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    //tree.componentContainer.css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
     tree.componentsDiv.css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    tree.obDiv.css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.protoDiv.css({width:(treeInnerWidth + "px"),height:(treeHt+"px"),top:"0px",left:(treeOuterWidth+"px")});
    tree.dataContainer.css({width:(svgwd + twtp+ "px"),height:((treeHt-15)+"px"),top:tabsTop,left:"0px"});
    tree.dataDiv.css({width:(svgwd+20+"px"),height:((treeHt)+"px")});

    svgDiv.css({width:svgwd +"px",height:svght + "px","background-color":bkg});
    svg.main.resize(svgwd,svght);
    if (docDiv) docDiv.css({left:"0px",width:pageWidth+"px",top:docTop+"px",overflow:"auto",height:docHeight + "px"});
    svg.main.positionButtons(svgwd);
    noteDiv.css({"width":(svgwd - 140)+"px"});
    if (firstLayout) {
      firstLayout = 0;
      page.layout();
    }
  }

  
  // now this is an occaison to go into flat mode
  function setInstance(itm) {
    modeTab.selectElement("Objects");
    if (!itm) {
      return;
    }
    if (!flatMode) {
      page.setFlatMode(true);
      topBut.show();
      upBut.show();
    }
    tree.showItem(itm,itm.selectable?"expand":"fullyExpand");
    tree.showProtoChain(itm);
    upBut.show();
    enableTreeClimbButtons();
    return;
  }
  
 om.selectCallbacks.push(setInstance);

  
  page.elementsToHideOnError = [];
 
 
  
 

  // a prototype for the divs that hold elements of the prototype chain
  
 tree.protoSubDiv = dom.El({tag:"div",style:{"background-color":"white","margin-top":"20px",border:"solid thin green",
                               padding:"10px"}});

  var errorDiv =  dom.wrapJQ($('#error'));
  
  
  page.elementsToHideOnError.push(cols);
  
    page.elementsToHideOnError.push(actionDiv);

 
  //docDiv =  dom.El({tag:"iframe",attributes:{src:"chartdoc.html"},style:{border:"solid thin black",position:"absolute"}});
  page.elementsToHideOnError.push(docDiv);
  tree.obDiv.click = function () {
    dom.unpop();
  };
  
 
  tree.protoDiv.click = function () {
    dom.unpop();
  };
  
  page.setFlatMode = function(vl) {
    flatMode = vl;
    tree.enabled = !vl;
    obDivTitle.__element__.html(flatMode?"Selected Item":"Workspace");
    if (!vl) {
      tree.initShapeTreeWidget();
      tree.adjust();
    }
  }
  
  
  tree.viewNote = function(k,note) {
    var h = '<b>'+k+':</b> '+note
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(h)
    return;
  }
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 

   

  var annLink = dom.El({'tag':'div'});
  annLink.addChild('caption',dom.El({'tag':'div'}));
  annLink.addChild('link',dom.El({'tag':'div'}));
// notes are set for a save, and only displayed when showing that saved item, not further saves down the line

  page.showTopNote = function () {
    var note = om.root.__topNote__;
    if (note) {
      isTopNote = true;
      var svc = om.root.get("__saveCountForNote__");
      if (svc ===om.saveCount()) {
         topNoteSpan.setHtml(note);
      }
    }
  }
  
  page.setTopNote = function (txt) {
    om.root.__topNote__ = txt;
    om.root.__saveCountForNote__ = page.saveCount()+1;
    //code
  }
  
  
  function inspectItem(pth) {
    var loc = "/inspect?item=/"+pth;
    location.href = loc;
  }
 
  // called from the chooser
  
  page.popItems = function(mode) {
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.chooser_lightbox;
    lb.pop(undefined,undefined,1);
    var chh = om.useMinified?"/chooser2.html":"/chooser2d.html";
    if (page.signedIn) {
      var fsrc = "http://"+om.liveDomain+chh; // go to dev version from dev version
    } else {
      fsrc = "http://"+location.host+chh;
    }
    fsrc = fsrc + "?mode="+mode;
    //fsrc = fsrc + "&dataSource="+(om.root.dataSource);
    fsrc= fsrc + "&item="+page.unpackedUrl.url;
    if (page.codeBuilt) {
      fsrc = fsrc + "&codeBuilt=1"   
    }
    lb.setHtml('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'"/>');
  }
  var functionToEdit;
  
  function editorWindow() {
    var ifrm = page.editorIframe;
    return ifrm[0].contentWindow;
  }
  
  
  
  window.fromEditor = function (msg,value) {
    if (msg == "ready") {
      var w = editorWindow();
      w.initializeEditor(page.editorRect,functionToEdit);
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
page.messageCallbacks.workerReady = function () {
  workerIsReady = 1;
  if (whenWorkerIsReady) {
    whenWorkerIsReady();
  }
}

page.messageCallbacks.dismissChooser = function () {
  debugger;
 // page.dismissChooser = function () {
    mpg.chooser_lightbox.dismiss();
   // shade.hide();
  }
  // this is called when the url of the current item includes &new=1
  var newItemCallback;
  // the worker might not be ready when we do this, so need to wait
  page.newItem = function (cb) {
    debugger;
    whenWorkerIsReady = function () {
      newItemCallback = cb;
      var path = page.unpackedUrl.path.substr(3);
      var dt = {path:path};
      page.sendWMsg(JSON.stringify({apiCall:"/api/newItem",postData:dt,opId:"newItem"}));
    }
    if (workerIsReady) {
      whenWorkerIsReady();
      whenWorkerIsReady=undefined;
    }
  }
  
  
   page.messageCallbacks.newItem = function (rs) {
    debugger;
    if (rs.status==="fail") {
      newItemCallback("notNew");
    } else {
      newItemCallback("ok");
    }
  }
  //path will be supplied for saveAs
  // called from the chooser
  // This is for saving variants
  page.saveAsVariant = function (pAd) {
    if (pAd) {
      var path = pAd.path;
      //var ds = pAd.dataSource;
    } else {
      path = page.unpackedUrl.path.substr(2);
      //ds = om.root.dataSource;
    }
    var url = om.itemHost+path;
    var upk = om.unpackUrl(url);
    unpackedUrl = upk;
    // make sure the item is at the right place
    __pj__.set(upk.path,om.root);
    om.root.__beenModified__ = 1;
    var svcnt = page.saveCount();
    om.root.__saveCount__ = svcnt+1;
    //var svds = om.root.dataSource;
    //om.root.dataSource = ds;
    var vOf = om.componentByName(om.root,"__variantOf__");
    if (!vOf) {
      var nc = om.DNode.mk();
      nc.name = "__variantOf__";
      nc.path = page.unpackedUrl.path;
      om.root.__components__.unshift(nc);
    }
    //if (!inspectDom) om.root.set("__canvasDimensions__",geom.Point.mk(draw.canvasWidth,draw.canvasHeight));
    var upk = om.unpackUrl(url,true);
    om.root.savedFrom = page.unpackedUrl.spath;
    om.s3Save(om.root,upk,function (srs) {
      om.root.__saveCount__ = svcnt;
      //om.root.dataSource = svds;
      var asv = afterSave(srs);
      if (asv === "ok") {
        var inspectD = om.useMinified?"/inspect":"inspectd";
        page.setSaved(true);
        if (page.newItem) {
          var loc = inspectD+"?item="+url;
          location.href = loc;
        } else if (path) { //  go there for a saveAs
          //page.itemSaved = true; // so no confirmation of leaving page
          var loc = inspectD+"?item="+url;
          location.href = loc;
        } else {
          //page.setSaved(true);
          om.performUpdate();
          draw.refreshAll();
        }
      }
    });  
  }
   page.messageCallbacks.saveAsVariant = page.saveAsVariant;
  
  var newItemPath;
  page.messageCallbacks.newItemFromChooser = function (pAd) {
    debugger;
    var path = pAd.path;
    var p = om.stripInitialSlash(path);
    newItemPath = p;
    var dt = {path:p};
    page.sendWMsg(JSON.stringify({apiCall:"/api/newItem",postData:dt,opId:"newItemFromChooserStage2"}));

  }
  
  
  page.messageCallbacks.newItemFromChooserStage2 = function (rs) {
    debugger;
    var ins = om.useMinified?"/inspect.html":"/inspectd.html";
    var url = ins + "?item=/"+newItemPath;
    location.href = url;
  }
// returns "ok", or an error message
function afterSave(rs) {
  if (rs.status==='fail') {
    if (rs.msg === 'collision') {
      var ht = 'An unlikely name collision took place. Please try your save again.'
    } else if (rs.msg === 'busy') {
      var ht = 'The site is too busy to do the save. Please try again later';
    } else if ((rs.msg==="noSession")||(rs.msg === "timedOut")) {
      var ht = 'Your session has timed out. Please sign in again.'
      page.nowLoggedOut();
    } else {
      var ht = "Error: "+rs.msg;
    }
    return ht;
  } else {
    return "ok"
  }
}
  page.saveCount = function () {
    var svcnt = om.root.__saveCount__;
    return (typeof svcnt === "number")?svcnt:0;
  }
  
  
  function prototypeSource(x) {
    var p = Object.getPrototypeOf(x);
    return om.pathExceptLast(p.__source__);// without the /source.js
  }
    
  
  page.rebuildItem = function () {
    var buildPage = om.useMinified?"/build":"/buildd";
    location.href =buildPage+"?item=/"+page.itemPath;
  }
/*
  page.saveImage = function (path,cb) {
    debugger;
    var url = om.itemHost+"/"+path;
    var upk = om.unpackUrl(url);
    var img = upk.image;
    draw.mainCanvas.postCanvas(path,function (rs) {
      cb(rs);
    });     
  }
  */
   //  page.messageCallbacks.saveImage = page.saveImage;

  
  actionDiv.addChild("itemName",itemName);
 
  var signedIn,itemOwner,codeBuilt,objectsModified;
  
  page.setPermissions = function() {
    signedIn = om.signedIn();
    page.signedIn = signedIn;
    var h = page.unpackedUrl.handle;
    itemOwner = page.itemOwner = signedIn && (h===localStorage.handle);
    page.codeBuilt =  !om.root.__saveCount__;
    page.objectsModified = !page.codeBuilt;
  }
  
  
 
  // file options pulldown
  
  var fsel = page.fsel = dom.Select.mk();
  
  fsel.containerP = jqp.pulldown;
  fsel.optionP = jqp.pulldownEntry;
  var fselJQ;

  
  page.initFsel = function () {
    fsel.options = ["New Build...","Open...","Save","Copy as Build...","Save as Variant","Delete"];
    fsel.optionIds = ["new","open","save","saveAsBuild","saveAsVariant","delete"];
    fselJQ = fsel.toJQ();
    mpg.addChild(fselJQ); 
    fselJQ.hide();
  }
  
  
  page.setFselDisabled = function () {
      fsel.disabled = {"new":!signedIn,
                       save:page.codeBuilt || !itemOwner,
                       saveAsBuild:!signedIn || !page.codeBuilt,
                       saveAsVariant:!signedIn,
                       delete:!itemOwner};
      fsel.updateDisabled();
  }
      
  
  fsel.onSelect = function (n) {
    var opt = fsel.optionIds[n];
    if (fsel.disabled[opt]) return;
    if (opt === "delete") {
      confirmDelete();
      return;
    }
    if (opt === "save") {
      itemName.setHtml("Saving ...");
      dom.unpop();
      page.saveAsVariant();
    } else {
      page.popItems(opt);
    }
  }
 
  fileBut.click = function () {
    page.setFselDisabled();
    dom.popFromButton("file",fileBut,fselJQ);
  }
  
  tree.onlyShowEditable= false;
 // tree.showFunctions = true;
  
  
  tree.onlyShowEditable= false;
  tree.showFunctions = false;
  
  
 
  tree.autoUpdate = 1;
  
  page.alert = function (msg) {
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(msg);
  }
 
  //src is who invoked the op; "tree" or "draw" (default is draw)
  function updateAndShow(src,forceFit) {
    om.root.removeComputed();
    om.root.deepUpdate(null,null,om.overrides);
    if (forceFit) draw.mainCanvas.fitContents(true);
    draw.refresh();
    if (src!="tree") tree.initShapeTreeWidget();
  }
 
  tree.updateAndShow = updateAndShow; // make this available in the tree module

  
  var disableGray = "#aaaaaa";

  var enableButton = page.enableButton = function (bt,vl) {
    bt.disabled = !vl;
    bt.css({color:vl?"black":disableGray});
  }

  function enableTreeClimbButtons() {
    var isc = tree.selectionHasChild();
    var isp = tree.selectionHasParent();
    upBut.show();
    topBut.show();
    downBut.show();
    enableButton(upBut,isp);
    enableButton(topBut,isp);
    enableButton(downBut,isc);
  }
 
 page.enableTreeClimbButtons = enableTreeClimbButtons;

  topBut.click = function () {
    if (topBut.disabled) return;
    //setFlatMode(false);
    tree.showTop();
    enableTreeClimbButtons();
  }
  
  upBut.click = function () {
    if (upBut.disabled) return;
    tree.showParent(); // returns hasParent,hasChild
    enableTreeClimbButtons();
  }
  
  
  downBut.click = function () {
    if (downBut.disabled) return;
    tree.showChild();
    enableTreeClimbButtons();
  }
 
  
  function aboutText() {
    var rt = om.root;
    var tab = rt.__about__;
    ht = "";
    var src = rt.__source__;
    if (rt.__saveCount__  && src) {
      var nsrc = om.pathExceptLast(src);
      var psrc = "http://prototypejungle.org/" +om.stripDomainFromUrl(nsrc); 
      ht += "<p>This is a variant of <a href='http://prototypejungle.org/inspect?item="+nsrc+"'>"+psrc+"</a></p>";
    }
    if (tab) ht += "<div>"+tab+"</div>";
    return ht;
  }
    
    
    
  aboutBut.click = function () {
    dom.unpop();
    var rt = om.root;
    mpg.lightbox.pop();
    var ht = '<p>The general <i>about</i> page for Prototype Jungle is <a href="http://prototypejungle.org/about.html">here</a>. This note concerns the current item.</p>';
    ht += aboutText();
    mpg.lightbox.setHtml(ht);
  }
  
  
  codeHelpBut.click = function () {
    dom.unpop();
    var rt = om.root;
    mpg.lightbox.pop();
    var ht = '<p>Fee fie fo fum</p>';
    ht += aboutText();
    mpg.lightbox.setHtml(ht);
  }
 
 



 function getHelpHtml()  {
  if (page.helpHtml) return page.helpHtml;
  if (page.includeDoc) {
  var helpHtml0 = '<div class="paddedIframeContents"><p> Please see the explanations at the bottom of this  intro page (after dismissing this lightbox).</p></div>'
 } else {
  var helpHtml0 = '<p>Two panels, labeled "Workspace" and "Prototype Chain", appear on the right-hand side of the screen. The workspace panel displays the hierarchical structure of the JavaScript objects which represent the item. You can select a part of the item either by clicking on it in the graphical display, or in the workspace panel. The <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain">prototype chain</a> of the selected object will be shown in rightmost panel. </p>';
 }

page.helpHtml = helpHtml0;

return page.helpHtml;
 }
 
 
 /*
 function genTweeter(txt,url) {
  var rs = 
'<a href="https://twitter.com/share" class="twitter-share-button"  data-count="none" data-text="'+txt+'">Tweet</a>'+
"<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";
  return rs;
 }
 */

 function shareJq() {
  var bb = om.root.getBBox();
  var ar = (bb.height)/(bb.width);
  var iurl = page.unpackedUrl.url;
  var rs = $("<div />");
  var url =iurl + "/view";
  //rs.append("<p>The URI of this item is </p>");
  //rs.append("<p style='padding-left:20px'>"+iurl+"</p>");
  rs.append('<div style="margin:0px;padding:0px">To inspect this item (ie, the current page): </div>');
  rs.append("<p style='font-size:8pt;padding-left:20px'>"+om.mkLink("http://prototypeJungle.org/inspect.html?item="+iurl)+"</p>");
  rs.append("<p>To view it: </p>");
  rs.append("<p style='font-size:8pt;padding-left:20px'>"+om.mkLink("http://prototypeJungle.org/view.html?item="+iurl)+"</p>");
  rs.append("<p>Embed (adjust width and height to taste):</p>");
  var wdln = $('<div style="padding-left:10px">Width: </div>');
  var initialWd = 500;
  var initialHt = Math.round(ar * initialWd);
  var wdin = $('<input type="text" style="width:100px"/>');
  wdin.on('change',function () {
    var wd = parseInt(wdin.prop("value"));
    var ht = Math.round(ar * wd);
    htin.prop("value",ht);
    updateIframeTxt(wd,ht);
  });
  rs.append(wdln);
  wdln.append(wdin)
  wdin.prop("value",initialWd);
  var htln = $('<div style="padding-bottom:5px;padding-left:10px">Height: </div>');
  var htin = $('<input type="text" style="width:100px"/>');
  rs.append(htln);
  htln.append(htin);
  htin.prop("value",initialHt);
  htin.on('change',function () {
    var ht = parseInt(htin.prop("value"));
    var wd = Math.round(ht/ar);
    wdin.prop("value",wd);
    updateIframeTxt(wd,ht);
  });
  rs.append('<div style="margin:0px;padding-left:10px">Copy and paste this:</div>');

  var dv = $("<input  class='embed'/>");
  dv.click(function () {
    dv.focus();dv.select();
  });
  rs.append(dv);
  var updateIframeTxt = function(wd,ht) {
    var rs = '<iframe width="'+wd+'" height="'+ht+'" src="http://prototypejungle.org/view.html?item='+url+'"/>';
    dv.prop('value',rs);
  }
  //var twl = $("<p>Tweet this  item: </p>");
  //rs.append(twl);
 // var tw = genTweeter(unpackedUrl.name + ' at PrototypeJungle',url);
//  twl.append(tw);
  updateIframeTxt(initialWd,initialHt);
  return rs;
 }


   shareBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setContent(shareJq());
   };
   
   
   helpBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setHtml(getHelpHtml());
   };
   
  page.itemSaved = true; // need this back there
  
  var dialogEl =$('<div class="Dialog">\
                        <div  id="dialogTitle" class="dialogLine"></div>\
                        <div  class="Line">\
                          <div class="button" id="dialogOk">Ok</div>\
                          <div class="button" id="dialogCancel">Cancel</div>\
                        </div>\
                      </div>');
                      
 var dialogOkButton = $('#dialogOk',dialogEl);
  var dialogCancelButton = $('#dialogCancel',dialogEl);
var dialogTitle = $('#dialogTitle',dialogEl);
 
  function activateDeleteButtons() {
    dialogTitle.html("Are you sure you wish to delete this item? There is no undo.");
    dialogOkButton.off("click");
    dialogOkButton.click(function () {
      var pth = page.unpackedUrl.spath;
      om.deleteItem(pth,function (rs) {
        page.nowDeleting = true;
        location.href = "/";
      });
    });
    dialogCancelButton.click(function (){
      mpg.lightbox.dismiss();
    });
  }
  
  function confirmDelete() {   
    var lb = mpg.lightbox;
    lb.pop();
    lb.setContent(dialogEl);
    activateDeleteButtons();
    return false;
  }
    
  var leavingFor;
 
  // see https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
  page.onLeave = function (e) {
    var msg = (page.nowDeleting || page.itemSaved)?null:"The current item has unsaved modifications.";
     (e || window.event).returnValue = msg;     //Gecko + IE
     return msg; //webkit
  }
  
  
  
})(prototypeJungle);


