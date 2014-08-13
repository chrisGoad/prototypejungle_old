
// scheme for saving.  for a code built, owned item, objects, internal data, objects, code, and components can all be modified
//modifying any of the last three means a new build is needed.  build brings all into sync, and if it fails, records that failure
// at s3.  A missing of failed build item is called unbuilt. (the data.js file will record this). Save from the file menu just saves,
// and if the build is out of sync, turns this unbuilt. modification of objects makes the code read only and of code makes the
// objects read only

(function (pj) {
  var actionHt;
  var om = pj.om;
  var ui = pj.ui;
  var dom = pj.dom;
  var html = pj.html;
  var geom = pj.geom;
  var svg = pj.svg;
  //var __draw = pj.__draw;
  var tree = pj.tree;
  //var tree =pj.set("tree",om.DNode.mk());
  var lightbox = pj.lightbox;
  //var page = pj.page;
  //var dataOps = pj.dataOps;
  
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract


  var geom = pj.geom;
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
  ui.saveDisabled = 0; // true if a build no save has been executed.
  // the tab for choosing modes: objects, code, data
       
  var modeTab = ui.modeTab = dom.Tab.mk(['Objects','Code','Data','Requires'],'Objects');
  modeTab.build();
  var buttonSpacing = "10px";
  var buttonSpacingStyle = "margin-left:10px";
   var jqp = pj.jqPrototypes;
   // the page structure
  var mainTitleDiv = html.wrap('mainTitle','div');
  // note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed.
    var test=html.Element.mk('<div class="roundButton">Top</div>');
    
  var mpg = ui.mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).addChildren([
    topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).addChildren([
  
    //  topbarDiv = html.wrap('#topbar','div',{style:'position:absolute;left:0px;background-color:bkColor;margin:0px;padding:0px'}).addChildren([
    actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').addChildren([
        ui.itemName = html.Element.mk('<span id="buttons" style="overflow:none;padding:5px;height:20px">Name</span>'),
        ui.fileBut = html.Element.mk('<div class="ubutton">File</div>'),
        //ui.customBut = ui.customBut = jqp.ulink.instantiate().set({html:"Arrange"}),
        ui.aboutBut = html.Element.mk('<div class="ubutton">About</div>'),
        ui.shareBut = html.Element.mk('<div class="ubutton">Share</div>'),
        ui.helpBut = html.Element.mk('<div class="ubutton">Help</div>')
      ]),
      ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
 //   ])]);
    ]),

    modeTab.domEl,
    

    cols =  html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').addChildren([
      
      ui.svgDiv = html.Element.mk('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
        tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').addChildren([
          ui.noteSpan = html.Element.mk('<span>Click on things to inspect them.</span>'),
          ui.upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
          ui.downBut =html.Element.mk('<div class="roundButton">Down</div>'),
          ui.topBut =html.Element.mk('<div class="roundButton">Top</div>')
        ])
     ]),
    uiDiv = html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"/>').addChildren([
         ui.obMsg = html.Element.mk('<div id="obMsg" style="background-color:white;font-size:10pt;padding-left:msgPadding"/>'),
        
        ui.editButDiv = html.Element.mk('<div/>').addChildren([
            ui.unbuiltMsg = unbuiltMsg = html.Element.mk('<span style="color:red">Unbuilt</span>'),
            ui.buildBut = html.Element.mk('<div class="roundButton">Build</div>'), 
            ui.execBut = html.Element.mk('<div class="roundButton">Build No Save</div>'), 
            ui.updateBut = html.Element.mk('<div class="roundButton">Update</div>'), 
            ui.saveDataBut = html.Element.mk('<div class="roundButton">Save Data to File</div>'), 
            ui.reloadDataBut = html.Element.mk('<div class="roundButton">Reload Data</div>'), 
            //ui.saveCodeBut = html.Element.mk('<div class="roundButton">Save Unbuilt</div>'), 
            ui.catchBut = html.Element.mk('<div class="roundButton">Catch:Yes</div>'),
            ui.addComponentBut = html.Element.mk('<div class="roundButton">Add Require</div>'), 
            ui.codeHelpBut = html.Element.mk('<div class="roundButton">?</div>') 
    ]),
        tree.editContainer = html.Element.mk('<div id="editContainer" style="hidden:1,sytle:{position:absolute;background-color:white;border:solid thin black"/>').addChildren([
          ui.editMsg = html.Element.mk('<div style="font-size:10pt;padding-left:msgPadding">Experiment freely, but save to your own area prior to persistent modifications.</div>'),
        
          tree.editDiv = html.Element.mk('<div id="editDiv" style="position:absolute;background-color:white;width:100%;height:100%;border:solid thin black;overflow:auto;vertical-align:top;margin:0px;padding:treePadding+px"/>')
        ]),
        tree.dataContainer = html.Element.mk('<div id="dataContainer" style="display:none;position:absolute;background-color:white;border:solid thin black;width:100%"/>').addChildren([
          ui.dataMsg = html.Element.mk('<div style="font-size:10pt;width:100%"/>'),
          ui.dataSourceInputC = html.Element.mk('<div style="font-size:10pt;width:100%">From:</div>').addChildren([
              ui.dataSourceInput =  ui.dataSourceInput = html.Element.mk('<input type="text" style="font-size:10pt;width:80%"/>'),
              ui.dataEditableSpan = html.Element.mk('<span> (editable)</span>')
          ]),
          tree.dataDiv = html.Element.mk('<div id="dataDiv" style="position:absolute;background-color:white;width:100%;height:\
                                         100%;border:solid thin green;overflow:auto;vertical-align:top;margin:0px"/>')//,padding:treePadding+"px"}})
          ]),
          tree.componentContainer = html.Element.mk('<div id="components" style="display:none;background-color:white;display:none"/>').addChildren([
            componentMsg = html.Element.mk('<div style="padding-left:msgPadding"/>'),
            tree.componentsDiv = html.Element.mk('<div id="componentDiv" style="position:absolute;background-color:white;width:100%;\
                                                 height:100%;border:solid thin black;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>')
          ]),

        tree.objectContainer = html.Element.mk('<div id="objectContainer" style="position:absolute;background-color:white;border:solid thin black"/>').addChildren([
            tree.obDiv = html.Element.mk('<div style="position:absolute;background-color:white;border:solid thin black;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>').addChildren([
                            html.Element.mk('<div style="margin-bottom:10px;border-bottom:solid thin black"/>').addChildren([
                              obDivTitle = html.Element.mk('<span style="margin-bottom:10px;border-bottom:solid thin black">Workspace</span>')
             ]),
            tree.obDivRest = html.Element.mk('<div style="overflow:auto"/>'),
          ]),
          tree.protoDiv = html.Element.mk('<div style="position:absolute;background-color:white;margin:0px;border:solid thin black;overflow:auto;padding:treePadding+px"/>').addChildren([
            html.Element.mk('<div style="width:100%;border-bottom:solid thin black"/>').addChildren([
              tree.protoDivTitle = html.Element.mk('<span>Prototype Chain</span>')
            ]),
            tree.protoDivRest = html.Element.mk('<div style="border-top:thin black;overflow:auto"/>')
          ])
        ])
      ])
    ])
  ]);
  
  var docDiv =  ui.docDiv = html.Element.mk('<iframe src="/doc/chartdoc.html" style="border:solid thin black;position:absolute"/>');

  
  var cnvht = "100%"

  
  //ui.topBut.$hide();
  //ui.upBut.$hide();
 // ui.downBut.$hide();
  
  
  tree.codeToSave = "top";
  
   
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = 1;
  ui.layout = function(noDraw) { // in the initialization phase, it is not yet time to __draw, and adjust the transform
    // aspect ratio of the UI
    /*
    var bkg = ui.root.backgroundColor;
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
    
    if (ui.includeDoc) {
      var docTop = pageHeight * 0.8 - 20;
      pageHeight = pageHeight * 0.8;
      var docHeight = awinht - pageHeight - 30;
    }
    var  twtp = 2*treePadding;
    var svgwd = (pageWidth/2) - twtp;
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    
    var treeInnerWidth = treeOuterWidth - twtp;
    mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-22)+"px"});
    var topHt = topbarDiv.__element.offsetHeight;// was jquery .height()
    
    cols.$css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
    modeTab.domEl.$css({top:"28px",left:svgwd+"px",width:(svgwd + "px")})
    uiDiv.$css({top:"0px",left:svgwd+"px",width:(svgwd + "px")})
    ui.ctopDiv.$css({"padding-top":"0px","padding-bottom":"30px","padding-right":"10px",left:svgwd+"px",top:"0px"});

    actionDiv.$css({width:(uiWidth + "px"),"padding-top":"0px","padding-bottom":"30px",left:"200px",top:"0px"});

    //var actionHt = actionDiv.__element.outerHeight();//+(isTopNote?25:0);
    var actionHt = actionDiv.__element.offsetHeight;//+(isTopNote?25:0);
    topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var svght = pageHeight - actionHt -30;
     var panelHeaderHt = 26; // the area above the object/code/data/component panels
   
    var treeHt = 5+ svght - 2*treePadding - panelHeaderHt;
    tree.myWidth = treeInnerWidth;
    var tabsTop = "20px";
    tree.editContainer.$css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    tree.editDiv.$css({width:(svgwd+"px"),height:((treeHt)+"px")});
    tree.objectContainer.$css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    tree.componentsDiv.$css({width:(svgwd + "px"),height:(treeHt+"px"),top:tabsTop,left:"0px"});
    tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.protoDiv.$css({width:(treeInnerWidth + "px"),height:(treeHt+20+"px"),top:"0px",left:(treeOuterWidth+"px")});
    tree.dataContainer.$css({width:(svgwd + twtp+ "px"),height:((treeHt-15)+"px"),top:tabsTop,left:"0px"});
    tree.dataDiv.$css({width:(svgwd+20+"px"),height:((treeHt)+"px")});
    ui.svgDiv.$css({width:svgwd +"px",height:svght + "px","background-color":bkg});
    ui.svgHt = svght;
    svg.main.resize(svgwd,svght); // putback
    if (docDiv) docDiv.$css({left:"0px",width:pageWidth+"px",top:docTop+"px",overflow:"auto",height:docHeight + "px"});
    svg.main.positionButtons(svgwd); 
    tree.noteDiv.$css({"width":(svgwd - 140)+"px"});
    if (firstLayout) {
      firstLayout = 0;
      ui.layout();
    }
  }
  
  
  
   // now this is an occaison to go into flat mode
  ui.setInstance = function (itm) {
    modeTab.selectElement("Objects");
    if (!itm) {
      return;
    }
    if (!flatMode) {
      ui.setFlatMode(true);
      ui.topBut.$show();
      ui.upBut.$show();
    }
    tree.showItem(itm,itm.selectable?"expand":"fullyExpand");
    tree.showProtoChain(itm);
    ui.upBut.$show();
    enableTreeClimbButtons();
    return;
  }
  
om.selectCallbacks.push(ui.setInstance); 

  
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
  
 
  tree.protoDiv.click = function () {
    dom.unpop();
  };
  
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
  
  
  function inspectItem(pth) {
    var loc = "/inspect?item=/"+pth;
    location.href = loc;
  }
 

  // called from the chooser
  
  ui.popItems = function(mode) {
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.chooser_lightbox;
    debugger;
    lb.pop(undefined,undefined,1);
    var chh = om.useMinified?"/chooser.html":"/chooserd.html";
    var fsrc = chh;
    //if (ui.signedIn) {
    //  var fsrc = "http://"+om.liveDomain+chh; // go to dev version from dev version
    //} else {
    //  fsrc = "http://"+location.host+chh;
    //}
    fsrc = fsrc + "?mode="+mode;
    fsrc= fsrc + "&amp;item="+om.pathExceptLast(ui.url);
    if (ui.codeBuilt) {
      fsrc = fsrc + "&amp;codeBuilt=1"   
    }
    lb.setContent(html.Element.mk('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'"/>'));
    //lb.box.__element.innerHTML = "hoom";
    //lb.setContent(html.Element.mk('<div>HO HO</div>'));

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
    workerIsReady = 1;
    if (whenWorkerIsReady) {
      whenWorkerIsReady();
    }
 }

  ui.messageCallbacks.dismissChooser = function () {
    mpg.chooser_lightbox.dismiss();
  }
 
  /* for later implementation
  ui.messageCallbacks.deleteItem(pth,function (rs) {
        ui.nowDeleting = true;
        location.href = "/";
      });
  
  */
   //path will be supplied for saveAs
  // called from the chooser
  // This is for saving variants
  
  ui.pjpathToRepoAndPath = function (pjpath) {
    var fpathS = pjpath.split("/");
    var repo =  ui.itemHost + "/" + fpathS.slice(1,3).join("/");
    var path = fpathS.slice(3).join("/");
    return [repo,path];
  }
   
   
  ui.saveAsVariant = function (pAd) {
    var vOf = om.isVariant(ui.root);
    if (pAd) {
      var needRestore = 0;
      //var path = pAd.path;
      var savingVariantOf = 1;
      var frc = pAd.force;
      var rap = ui.pjpathToRepoAndPath(pAd.path);
      var repo=rap[0]
      var path = rap[1];
      //var fpath = pAd.path;// eg /sys/repo0/chart/bar1
      //var fpathS = fpath.split("/");
      //var repo =  ui.itemHost + "/" + fpathS.slice(1,3).join("/");
      var sameRepo = repo === ui.repo; // the variant is in the same repo as the original
      //var path = fpathS.slice(3).join("/");
      var svcnt = ui.saveCount();
      ui.root.__saveCount = svcnt+1;
      if (!vOf) {
        // the saved variant has the original as a component
        var nc = om.DNode.mk();
        nc.name = "__variantOf";
        nc.path = ui.path;
        nc.repo = sameRepo?".":ui.repo;
        ui.root.__requires.unshift(nc);
      }
      if (!sameRepo) {
        om.mkXItemsAbsolute(ui.root.__requires,ui.repo);
      }
    } else {
      needRestore = 1;
      if (!vOf) {
        om.error("Can't save a non-variant");
      }
      frc = 1;
      //ui.itemName.$html(ui.itemName);
      repo = ui.repo;
      path = om.pathExceptLast(ui.path);
    }
    //var url = ui.itemHost+path;
    //var upk = om.unpackUrl(url);
    //unpackedUrl = upk;
    // make sure the item is at the right place
    //pj.set(upk.path,ui.root);
    //ui.root.__pj_beenModified = 1;
  
   //           om.s3Save(toSave,ui.repo,om.pathExceptLast(ui.path),function (rs) {
    //ui.root.savedFrom = ui.unpackedUrl.spath;
    var toSave = {item:ui.root};
    om.s3Save(toSave,repo,path,function (srs) {
      //ui.root._pj_saveCount = svcnt;
      var asv = afterSave(srs);
      if (asv === "ok") {
        var inspectD = ui.useMinified?"/inspect":"inspectd";
        ui.setSaved(true);
        if (ui.newItem) {
          om.error("Obsolete");
          var loc = inspectD+"?item="+path;
          location.href = loc;
        } else if (savingVariantOf) { //  go there for a saveAs
          var loc = inspectD+"?item="+repo.substring(26)+"/"+path;
          location.href = loc;
        } else {
          //ui.updateAndRefresh();
          //ui.performUpdate();
          //svg.refresh();
          ui.itemName.$html(ui.itemName);

        }
      } else {
        om.displayError(om.activeMessage(),asv);
      }
    },frc,needRestore);  
  }
   ui.messageCallbacks.saveAsVariant = ui.saveAsVariant;
  
  var newItemPath;
  ui.messageCallbacks.newItemFromChooser = function (pAd) {
    var path = pAd.path;
    var frc = pAd.force;
    var p = om.stripInitialSlash(path);
    newItemPath = p;
    var dt = {path:p};
    if (frc) {
      dt.force=1;
    }
    ui.sendWMsg(JSON.stringify({apiCall:"/api/newItem",postData:dt,opId:"newItemFromChooserStage2"}));

  }
  
  
  ui.messageCallbacks.newItemFromChooserStage2 = function (rs) {
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
        ui.nowLoggedOut();
      } else {
        var ht = "Error: "+rs.msg;
      }
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
    return om.pathExceptLast(p._pj_source);// without the /source.js
  }
    
  
  ui.rebuildItem = function () {
    var buildPage = om.useMinified?"/build":"/buildd";
    location.href =buildPage+"?item=/"+ui.itemPath;
  }
  
  
  
  actionDiv.addChild("itemName",ui.itemName);
 
  var signedIn,itemOwner,codeBuilt,objectsModified;
  
  ui.setPermissions = function() {
    signedIn = om.signedIn();
    ui.signedIn = signedIn;
    var h = ui.handle;
    itemOwner = ui.itemOwner = signedIn && (h===localStorage.handle);
    ui.codeBuilt =  !om.isVariant(ui.root);
    ui.objectsModified = !ui.codeBuilt;
  }
  
  
 
  // file options pulldown
  
  var fsel = ui.fsel = dom.Select.mk();
  
  fsel.containerP = html.Element.mk('<div style="position:absolute;padding-left:5px;padding-right:5px;padding-bottom:15px;border:solid thin black;background-color:white"/>');
  
  fsel.optionP = html.Element.mk('<div class="pulldownEntry"/>');
          
  var fselJQ;

  
  ui.initFsel = function () {
    fsel.options = ["New Build...","Open...","Save","Fork...","Save as Variant...","Delete"];
    fsel.optionIds = ["new","open","save","saveAsBuild","saveAsVariant","delete"];
    var el = fsel.build();
    mpg.addChild(el);
    el.$hide();
  }
  
  
  ui.setFselDisabled = function () {
      ui.setPermissions();
      fsel.disabled = {"new":!signedIn,
                       save:ui.codeBuilt || !itemOwner,
                       saveAsBuild:!signedIn || !ui.codeBuilt,
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
      ui.itemName.$html("Saving ...");
      dom.unpop();
      ui.saveAsVariant();
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
 
  //src is who invoked the op; "tree" or "__draw" (default is __draw)
 /* function updateAndShow(src,forceFit) {
    ui.root._pj_removeComputed();
    ui.root.deepUpdate(null,null,om.overrides);
    if (forceFit) __draw.mainCanvas.fitContents(true);
    __draw.refresh();
    if (src!="tree") tree.initShapeTreeWidget();
  }
 
  tree.updateAndShow = updateAndShow; // make this available in the tree module

  */
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
  
  
  
  
  function computeCodeHelp() {
     return '<p>Click the <b>'+((ui.itemOwner)?"Build":"Build-no-save")+'</b>' +
  ' button to rebuild the item from the source code.  When a build is done, \
  all changes made interactively from \
  the object browser are lost (use <b>Save variant</b> from the File pulldown to save interactive changes).' +
  ((ui.itemOwner)?'':'Since you don\'t own this item, the result of the build is not saved either. \
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
 

 var helpHtml = function () {
  return ui.includeDoc?'<p>Basic instructions appear at the bottom of the page</p>':
  '<p><span>See this </span><a href="/inspect?item=/sys/repo0/example/BarChart2&amp;intro=1">introductory example</a><span> for basic instructions, which appear at the bottom of the introductory example page.</span></p>';
 }


 function shareJq() {
  if (ui.root.surrounders) ui.root.surrounders.remove();
  svg.draw();
  var bb = ui.root.getBBox();
  var ar = ((bb.width == 0)||(bb.height == 0))?1:(bb.height)/(bb.width);
  var sp = ui.unpackedUrl.spath;
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
    dv.focus();dv._pj_select();
  });
  rs.append(dv);
  var updateIframeTxt = function(wd,ht) {
    var rs = '<iframe width="'+wd+'" height="'+ht+'" src="http://prototypejungle.org/view?item='+sp+'"/>';
    dv.prop('value',rs);
  }
  updateIframeTxt(initialWd,initialHt);
  return rs;
 }



   ui.shareBut.$click(function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setContent(shareJq());
   });
   
  ui.helpBut.$click(function () {
      dom.unpop();
      mpg.lightbox.setHtml(helpHtml());
      mpg.lightbox.pop();
   });
   
  ui.itemSaved = true; // need this back there
  
  
  
  ui.afterDeleteItem = function () {
    location.href = "/";
  }
  ui.messageCallbacks.deleteItem = ui.afterDeleteItem;

  
  ui.deleteItem = function () {
    var p = om.stripInitialSlash(ui.pjpath);
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
// var dialogOkButton = $('#dialogOk',dialogEl);
//  var dialogCancelButton = $('#dialogCancel',dialogEl);
//var dialogTitle = $('#dialogTitle',dialogEl);
 /*
  function activateDeleteButtons() {
    dialogTitle.$html("Are you sure you wish to delete this item? There is no undo.");
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
  */
  function confirmDelete() {
    //dialogTitle.$html("Are you sure you wish to delete this item? There is no undo.");

    var lb = mpg.lightbox;
    lb.pop();
    lb.setContent(dialogEl);
   // activateDeleteButtons();
    return false;
  }
  
  /*
  om.deleteItem = function (path,cb) {
    var dt = {path:om.stripInitialSlash(path)};
    om.ajaxPost("/api/deleteItem",dt,function (rs) {
      if (cb) {
        cb(rs);
      }
    });
  }
    */
  var leavingFor;
 
  // see https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
  ui.onLeave = function (e) {
    var msg = (ui.nowDeleting || ui.itemSaved)?null:"The current item has unsaved modifications.";
     (e || window.event).returnValue = msg;     //Gecko + IE
     return msg; //webkit
  }

//end extract


})(prototypeJungle);


