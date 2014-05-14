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
  var svg = __pj__.svg;
  var draw = __pj__.draw;
  //var tree = __pj__.tree;
  var tree =__pj__.set("tree",om.DNode.mk());
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var dataOps = __pj__.dataOps;
  var treePadding = 10;
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
  om.inspectMode = 1; // if this code is being loaded, inspection is happening
  var unpackedUrl,unbuiltMsg;
  var saveDisabled = 0; // true if a build no save has been executed.
  // the tab for choosing modes: objects, code, data
  
  var modeTab = page.modeTab = dom.Tab.mk(['Objects','Code','Data','Components'],'Objects');
  //var modeTabJQ = modeTab.toJQ();
  var buttonSpacing = "10px";
  var buttonSpacingStyle = "margin-left:10px";
   var jqp = __pj__.jqPrototypes;
   // the page structure
  var mainTitleDiv = dom.wrap('mainTitle','div');
  // note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed.
   
  var mpg = page.mpg =  dom.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).addChildren([
    topbarDiv = dom.wrap('topbar','div',{style:{position:"absolute",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).addChildren([
  
    //  topbarDiv = dom.wrap('#topbar','div',{style:'position:absolute;left:0px;background-color:bkColor;margin:0px;padding:0px'}).addChildren([
    actionDiv =  dom.ELement.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').addChildren([
        page.itemName = dom.ELement.mk('<span id="buttons" style="overflow:none;padding:5px;height:20px">Name</span>'),
        page.fileBut = dom.ELement.mk('<div class="ubutton">File</div>'),
        //page.customBut = page.customBut = jqp.ulink.instantiate().set({html:"Arrange"}),
        page.aboutBut = dom.ELement.mk('<div class="ubutton">About</div>'),
        page.shareBut = dom.ELement.mk('<div class="ubutton">Share</div>'),
        page.helpBut = dom.ELement.mk('<div class="ubutton">Help</div>')
      ]),
      page.ctopDiv = dom.wrap('topbarInner','div',{style:{float:"right"}})
 //   ])]);
    ]),

   // modeTabJQ,
   
    cols =  dom.ELement.mk('<div id="columns" style="left:0px,position:relative"/>').addChildren([
      
      page.svgDiv = dom.ELement.mk('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
        tree.noteDiv = dom.ELement.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').addChildren([
          page.noteSpan = dom.ELement.mk('<span>Click on things to inspect them.</span>'),
          page.upBut =dom.ELement.mk('<div class="roundbutton">Up</div>'), 
          page.downBut =dom.ELement.mk('<div class="roundbutton">Down</div>'),
          page.topBut =dom.ELement.mk('<div class="roundbutton">Top</div>')
        ])
     ]),
    uiDiv = dom.ELement.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"/>').addChildren([
         page.obMsg = dom.ELement.mk('<div id="obMsg" style="background-color:white;font-size:10pt;padding-left:msgPadding"/>'),

        page.editButDiv = dom.ELement.mk('<div/>').addChildren([
            page.unbuiltMsg = unbuiltMsg = dom.ELement.mk('<span style="color:red">Unbuilt</span>'),
            page.buildBut = dom.ELement.mk('<div class="roundbutton">Build</div>'), 
            page.execBut = dom.ELement.mk('<div class="roundbutton">Build No Save</div>'), 
            page.updateBut = dom.ELement.mk('<div class="roundbutton">Update</div>'), 
            page.saveDataBut = dom.ELement.mk('<div class="roundbutton">Save Data to File</div>'), 
            page.reloadDataBut = dom.ELement.mk('<div class="roundbutton">Reload Data</div>'), 
            page.saveCodeBut = dom.ELement.mk('<div class="roundbutton">Save Unbuilt</div>'), 
            page.catchBut = dom.ELement.mk('<div class="roundbutton">Catch:Yes</div>'),
            page.addComponentBut = dom.ELement.mk('<div class="roundbutton">Add Component</div>'), 
            page.codeHelpBut = dom.ELement.mk('<div class="roundbutton">?</div>')
    ]),
        tree.editContainer = dom.ELement.mk('<div id="editContainer" style="hidden:1,sytle:{position:absolute;background-color:white;border:solid thin black"/>').addChildren([
          page.editMsg = dom.ELement.mk('<div style="font-size:10pt;padding-left:msgPadding">Experiment freely, but save to your own area prior to persistent modifications.</div>'),
        
          tree.editDiv = dom.ELement.mk('<div id="editDiv" style="position:absolute;background-color:white;width:100%;height:100%;border:solid thin black;overflow:auto;vertical-align:top;margin:0px;padding:treePadding+px"/>')
        ]),
        tree.dataContainer = dom.ELement.mk('<div id="dataContainer" style="display:none;position:absolute;background-color:white;border:solid thin black;width:100%"/>').addChildren([
          page.dataMsg = dom.ELement.mk('<div style="font-size:10pt;width:100%"/>'),
          page.dataSourceInputC = dom.ELement.mk('<div style="font-size:10pt;width:100%">From:</div>').addChildren([
              page.dataSourceInput =  page.dataSourceInput = dom.ELement.mk('<input type="text" style="font-size:10pt;width:80%"/>'),
              page.dataEditableSpan = dom.ELement.mk('<span> (editable)</span>')
          ]),
          tree.dataDiv = dom.ELement.mk('<div id="dataDiv" style="position:absolute;background-color:white;width:100%;height:                                100%;border:solid thin green;overflow:auto;vertical-align:top;margin:0px"/>')//,padding:treePadding+"px"}})
          ]),
          tree.componentContainer = dom.ELement.mk('<div id="components" style="display:none;background-color:white;display:none"/>').addChildren([
            componentMsg = dom.ELement.mk('<div style="padding-left:msgPadding"/>'),
            tree.componentsDiv = dom.ELement.mk('<div id="componentDiv" style="position:absolute;background-color:white;width:100%;height:                    100%;border:solid thin black;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>')
          ]),

        tree.objectContainer = dom.ELement.mk('<div id="objectContainer" style="position:absolute;background-color:white;border:solid thin black"/>').addChildren([
            tree.obDiv = dom.ELement.mk('<div style="position:absolute;background-color:white;border:solid thin black;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>').addChildren([
                            dom.ELement.mk('<div style="margin-bottom:10px;border-bottom:solid thin black"/>').addChildren([
                              obDivTitle = dom.ELement.mk('<span style="margin-bottom:10px;border-bottom:solid thin black">Workspace</span>')
             ]),
            tree.obDivRest = dom.ELement.mk('<div style="overflow:auto"/>'),
          ]),
          tree.protoDiv = dom.ELement.mk('<div style="position:absolute;background-color:white;margin:0px;border:solid thin black;overflow:auto;padding:treePadding+px"/>').addChildren([
            dom.ELement.mk('<div style="width:100%;border-bottom:solid thin black"/>').addChildren([
              tree.protoDivTitle = dom.ELement.mk('<span>Prototype Chain</span>')
            ]),
            tree.protoDivRest = dom.ELement.mk('<div style="border-top:thin black;overflow:auto"/>')
          ])
        ])
      ])
    ])
  ]);
  
  var docDiv =  page.docDiv = dom.ELement.mk('<iframe src="/doc/chartdoc.html" style="border:solid thin black;position:absolute"/>');

  
  var cnvht = "100%"

  
  page.topBut.$.hide();
  page.upBut.$.hide();
  page.downBut.$.hide();
  
  tree.codeToSave = "top";
  
   
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = 1;
  page.layout = function(noDraw) { // in the initialization phase, it is not yet time to draw, and adjust the transform
    // aspect ratio of the UI
    /*
    var bkg = om.root.backgroundColor;
    var svgwd = svg.main.width;
    var svght = svg.main.height;
    */
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
    mpg.$.css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-22)+"px"});
    var topHt = topbarDiv.__element__.offsetHeight;// was jquery .height()
    
    cols.$.css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
    //modeTabJQ.$.css({top:"28px",left:svgwd+"px",width:(svgwd + "px")})
    uiDiv.$.css({top:"0px",left:svgwd+"px",width:(svgwd + "px")})
    page.ctopDiv.$.css({"padding-top":"10px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});

    actionDiv.$.css({width:(uiWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:"200px",top:"0px"});

    //var actionHt = actionDiv.__element__.outerHeight();//+(isTopNote?25:0);
    var actionHt = actionDiv.__element__.offsetHeight;//+(isTopNote?25:0);
    topbarDiv.$.css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var svght = pageHeight - actionHt -30;
     var panelHeaderHt = 26; // the area above the object/code/data/component panels
   
    var treeHt = 5+ svght - 2*treePadding - panelHeaderHt;
    tree.myWidth = treeInnerWidth;
    var tabsTop = "20px";
    tree.editContainer.$.css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    tree.editDiv.$.css({width:(svgwd+"px"),height:((treeHt)+"px")});
    tree.objectContainer.$.css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    tree.componentsDiv.$.css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    tree.obDiv.$.css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.protoDiv.$.css({width:(treeInnerWidth + "px"),height:(treeHt+"px"),top:"0px",left:(treeOuterWidth+"px")});
    tree.dataContainer.$.css({width:(svgwd + twtp+ "px"),height:((treeHt-15)+"px"),top:tabsTop,left:"0px"});
    tree.dataDiv.$.css({width:(svgwd+20+"px"),height:((treeHt)+"px")});
    page.svgDiv.$.css({width:svgwd +"px",height:svght + "px","background-color":bkg});
    //svg.main.resize(svgwd,svght); // putback
    if (docDiv) docDiv.$.css({left:"0px",width:pageWidth+"px",top:docTop+"px",overflow:"auto",height:docHeight + "px"});
    //svg.main.positionButtons(svgwd); putback
    tree.noteDiv.$.css({"width":(svgwd - 140)+"px"});
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
      page.topBut.show();
      page.upBut.show();
    }
    tree.showItem(itm,itm.selectable?"expand":"fullyExpand");
    tree.showProtoChain(itm);
    page.upBut.show();
    enableTreeClimbButtons();
    return;
  }
  
  om.selectCallbacks.push(setInstance);

  
  page.elementsToHideOnError = [];
 
 
  
 

  // a prototype for the divs that hold elements of the prototype chain
  
  tree.protoSubDiv = dom.ELement.mk('<div style="background-color:white;margin-top:20px;border:solid thin green;padding:10px"/>');

  var errorDiv =  dom.wrap('error');
  
  
  page.elementsToHideOnError.push(cols);
  
  page.elementsToHideOnError.push(actionDiv);

 
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
    obDivTitle.__element__.innerHTML = flatMode?"Selected Item":"Workspace";
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

   

  var annLink = dom.ELement.mk('<div/>');
  annLink.addChild('caption',dom.ELement.mk('<div/>'));
  annLink.addChild('link',dom.ELement.mk('<div/>'));
  
  
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
    var fsrc = chh;
    //if (page.signedIn) {
    //  var fsrc = "http://"+om.liveDomain+chh; // go to dev version from dev version
    //} else {
    //  fsrc = "http://"+location.host+chh;
    //}
    fsrc = fsrc + "?mode="+mode;
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
    mpg.chooser_lightbox.dismiss();
  }
 
  /* for later implementation
  page.messageCallbacks.deleteItem(pth,function (rs) {
        page.nowDeleting = true;
        location.href = "/";
      });
  
  */
   //path will be supplied for saveAs
  // called from the chooser
  // This is for saving variants
  page.saveAsVariant = function (pAd) {
    if (pAd) {
      var path = pAd.path;
    } else {
      path = page.unpackedUrl.path.substr(2);
    }
    var url = om.itemHost+path;
    var upk = om.unpackUrl(url);
    unpackedUrl = upk;
    // make sure the item is at the right place
    __pj__.set(upk.path,om.root);
    om.root.__beenModified__ = 1;
    var svcnt = page.saveCount();
    om.root.__saveCount__ = svcnt+1;
     var vOf = om.componentByName(om.root,"__variantOf__");
    if (!vOf) {
      var nc = om.DNode.mk();
      nc.name = "__variantOf__";
      nc.path = page.unpackedUrl.path;
      om.root.__components__.unshift(nc);
    }
    om.root.savedFrom = page.unpackedUrl.spath;
    om.s3Save(om.root,upk,function (srs) {
      om.root.__saveCount__ = svcnt;
      var asv = afterSave(srs);
      if (asv === "ok") {
        var inspectD = om.useMinified?"/inspect":"inspectd";
        page.setSaved(true);
        if (page.newItem) {
          var loc = inspectD+"?item="+path;
          location.href = loc;
        } else if (path) { //  go there for a saveAs
          var loc = inspectD+"?item="+path;
          location.href = loc;
        } else {
          om.performUpdate();
          draw.refreshAll();
        }
      } else {
        om.displayError(om.activeMessage(),asv);
      }
    });  
  }
   page.messageCallbacks.saveAsVariant = page.saveAsVariant;
  
  var newItemPath;
  page.messageCallbacks.newItemFromChooser = function (pAd) {
    var path = pAd.path;
    var p = om.stripInitialSlash(path);
    newItemPath = p;
    var dt = {path:p};
    page.sendWMsg(JSON.stringify({apiCall:"/api/newItem",postData:dt,opId:"newItemFromChooserStage2"}));

  }
  
  
  page.messageCallbacks.newItemFromChooserStage2 = function (rs) {
    var ins = om.useMinified?"/inspect":"/inspectd";
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
  
  
  
  actionDiv.addChild("itemName",page.itemName);
 
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
  
  fsel.containerP = dom.ELement.mk('<div style="position:absolute;padding-left:5px;padding-right:5px;padding-bottom:15px;border:solid thin black;background-color:white"/>');
  
  fsel.optionP = dom.ELement.mk('<div class="pulldownEntry"/>');
          
  var fselJQ;

  
  page.initFsel = function () {
    fsel.options = ["New Build...","Open...","Save","Copy as Build...","Save as Variant","Delete"];
    fsel.optionIds = ["new","open","save","saveAsBuild","saveAsVariant","delete"];
    var el = fsel.build();
    mpg.addChild(el);
    el.$.hide();
  }
  
  
  page.setFselDisabled = function () {
      page.setPermissions();
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
      page.itemName.setHtml("Saving ...");
      dom.unpop();
      page.saveAsVariant();
    } else {
      page.popItems(opt);
    }
  }
 
  page.fileBut.click = function () {
    page.setFselDisabled();
    dom.popFromButton("file",page.fileBut,fselJQ);
  }
  
  tree.onlyShowEditable= false;  
  
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
    bt.$.css({color:vl?"black":disableGray});
  }
  
  
  function enableTreeClimbButtons() {
    var isc = tree.selectionHasChild();
    var isp = tree.selectionHasParent();
    page.upBut.show();
    page.topBut.show();
    page.downBut.show();
    enableButton(page.upBut,isp);
    enableButton(page.topBut,isp);
    enableButton(page.downBut,isc);
  }
 
 page.enableTreeClimbButtons = enableTreeClimbButtons;

  page.topBut.click = function () {
    if (page.topBut.disabled) return;
    //setFlatMode(false);
    tree.showTop();
    enableTreeClimbButtons();
  }
  
  page.upBut.click = function () {
    if (page.upBut.disabled) return;
    tree.showParent(); // returns hasParent,hasChild
    enableTreeClimbButtons();
  }
  
  
  page.downBut.click = function () {
    if (page.downBut.disabled) return;
    tree.showChild();
    enableTreeClimbButtons();
  }
 
 
  function computeCodeHelp() {
     return '<p>Click the <b>'+((page.itemOwner)?"Build":"Build-no-save")+'</b>' +
  ' button to rebuild the item from the source code.  When a build is done, \
  all changes made interactively from \
  the object browser are lost (use <b>Save variant</b> from the File pulldown to save interactive\
  changes). Since you don\'t own this item, the result of the build is not saved either. \
  The persistent version of the item remains as it was. But, nonetheless, \
  <b>Build-no-save</b> allows you to experiment with the  consequences of code changes.</p> \
  <p>In the <b>Catch: Yes</b> state, the build process will be run inside a JavaScript catch, and errors displayed. \
  It is often useful to deal with errors using the browser\'s debugger instead.  \
  Click on the <b>Catch</b> button to toggle catching off.</p> \
  <p>You can change the set of components available in the build using the <b>Components</b> tab. \
  Changes made to components will have effect only after a build.</p>';
  }
  
  var dataHelpText ='<p>Data files are <a href="http://json.org" target="pjWindow">JSON</a> \
  wrapped in  <i>callback</i>, \
   <a href="http://en.wikipedia.org/wiki/JSONP" target="pjWindow">JSONP</a> style. Every item has \
  an associated data file, which may reside with the item (this is the case for newly created items, and \
  allows editing the data, if you own the item), \
  or placed  anywhere on the web. </p> \
  <p> You can  change the URL from which data is loaded, whether or not you own the item. Then <b>Update</b> modifies the item \
  to reflect the new data. <b>Save variant</b>(from the <b>File</b> pulldown) associates the new data URL with the saved variant. \    Details on the format of data are given \
  <a href="/doc/tech.html#dataFormat" target="pjWindow">here</a>  </p?';

    var componentHelpText ='<p>The components specified in this tab are available, under the  \
    specified names, in the scope in which a build is done. Changes to components only have effect \
    after a rebuild. </p>';

  page.codeHelpBut.click = function () {
    var cmode = page.modeTab.selectedElement;
    dom.unpop();
    var rt = om.root;
    mpg.lightbox.pop();
    if (cmode === "Code") {
      var txt = computeCodeHelp();
    } else if (cmode === "Data") {
      var txt = dataHelpText;
    } else if (cmode === "Components") {
      txt = componentHelpText;
    }
    mpg.lightbox.setHtml(txt);
  }
 

 var helpHtml = function () {
  return page.includeDoc?'<p>Basic instructions appear at the bottom of the page</p>':
  '<p>See this <a href="/inspect?item=/sys/repo0/example/BarChart2&intro=1">introductory example</a> for basic instructions, which appear at the bottom of the page.</p>';
 }


 function shareJq() {
  if (om.root.surrounders) om.root.surrounders.remove();
  svg.refresh();
  var bb = om.root.getBBox();
  var ar = ((bb.width == 0)||(bb.height == 0))?1:(bb.height)/(bb.width);
  var sp = page.unpackedUrl.spath;
  var rs = $("<div />");
  rs.append('<div style="margin:0px;padding:0px">To inspect this item (ie, the current page): </div>');
  rs.append("<p style='font-size:8pt;padding-left:20px'>"+om.mkLink("http://prototypeJungle.org/inspect?item="+sp)+"</p>");
  rs.append("<p>To view it: </p>");
  rs.append("<p style='font-size:8pt;padding-left:20px'>"+om.mkLink("http://prototypeJungle.org/view?item="+sp)+"</p>");
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
    var rs = '<iframe width="'+wd+'" height="'+ht+'" src="http://prototypejungle.org/view?item='+sp+'"/>';
    dv.prop('value',rs);
  }
  updateIframeTxt(initialWd,initialHt);
  return rs;
 }



   page.shareBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setContent(shareJq());
   };
   
   
  page.helpBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setHtml(helpHtml());
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


