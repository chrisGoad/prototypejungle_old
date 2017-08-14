
// This is one of the code files assembled into editor.version.js
var actionPanelActive = true;
var includeTest = false;

var treePadding = 0;
var bkColor = "white";
var docDiv;
var actionPanel,actionPanelMessage,actionPanelButton,actionPanelCommon,actionPanelCustom;//connectorImg;
var minWidth = 1000;
var plusbut,minusbut;
var flatInputFont = "8pt arial";
var uiDiv,topbarDiv,obDivTitle;
var msgPadding = "5pt";
var inspectDom = false;
var uiWidth;
var insertKind;
ui.forking = false;
ui.fitMode = false;
ui.panelMode = 'chain'; // mode of the right panel view; one of 'chain' (view the prototype chains); 'proto','insert','code'
var unpackedUrl,unbuiltMsg;

var buttonSpacing = "10px";
var buttonSpacingStyle = "margin-left:10px";
 var jqp = pj.jqPrototypes;
 // the page structure
var mainTitleDiv = html.wrap('mainTitle','div');
  var test=html.Element.mk('<div class="roundButton">Top</div>');

var actionDiv,cols;

var mpg = ui.mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).
__addChildren([
  topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",height:"10px",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).
  __addChildren([
    
  actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').
  __addChildren([
    ui.fileBut = html.Element.mk('<div class="ubutton">File</div>'),
    ui.testBut = includeTest?html.Element.mk('<div class="ubutton">Test</div>'):null, 
    ui.insertBut = html.Element.mk('<div class="ubutton">Insert</div>'),
     ui.replaceBut = html.Element.mk('<div class="ubutton">Replace</div>'),
     ui.replaceProtoBut = html.Element.mk('<div class="ubutton">Replace Prototype</div>'),
    ui.cloneBut = actionPanelActive?null:html.Element.mk('<div class="ubutton">Clone</div>'),
     ui.editTextBut = actionPanelActive?null:html.Element.mk('<div class="ubutton">Edit Text</div>'),
     ui.deleteBut = actionPanelActive?null:html.Element.mk('<div class="ubutton">Delete</div>'),
    ui.fileDisplay = html.Element.mk('<span style="font-size:11pt;padding-left:40px"></span>'),

     ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')
    ]),
    ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
  ]),

  cols = html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').
  __addChildren([
    
    ui.docDiv = docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
     ui.actionPanel = actionPanel = html.Element.mk('<div   draggable="true" style="background-color:white;border:solid thin black;position:absolute;height:400px;width:600px;display:inline-block"></div>').__addChildren([
        html.Element.mk('<div style="border:solid thin black;"></div>').__addChildren([
        actionPanelMessage = html.Element.mk('<div style="margin:10px;width:80%;padding-right:10px">Nothing is selected</div>'),
        actionPanelButton = html.Element.mk('<div class="colUbutton"></div>')
       ]),
       actionPanelCommon = html.Element.mk('<div style="margin:0;width:100%"></div>').__addChildren([
          ui.deleteAction = html.Element.mk('<div class="colUbutton left">Delete</div>'),
          ui.editTextAction = html.Element.mk('<div class="colUbutton left">Edit Text</div>'),
          ui.cloneAction = html.Element.mk('<div class="colUbutton left">Clone</div>'),
          ui.showCohortButtons = html.Element.mk('<div class="colUbutton left">Cohorts ...</div>'),
          ui.showClonesAction = html.Element.mk('<div style="display:none" class="colUbutton moreLeft">Show Cohort</div>'),
          ui.splitCohortAction = html.Element.mk('<div style="display:none;" class="colUbutton moreLeft">Split Cohort</div>'), // referred to as forking
          ui.joinAction = html.Element.mk('<div style="display:none;" class="colUbutton moreLeft">Add to Cohort</div>')
         
        ]),
       actionPanelCustom= html.Element.mk('<div style="float:left;margin:0;width:100%"></div>')
     ]),
   
    ui.svgDiv = html.Element.mk('<div id="svgDiv" draggable="true" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').
    __addChildren([
      tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').__addChildren([
        ui.noteSpan = html.Element.mk('<span>Click on things to adjust them. Hierarchy navigation:</span>'),
        ui.upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
        ui.downBut =html.Element.mk('<div class="roundButton">Down</div>'),
        ui.topBut =html.Element.mk('<div class="roundButton">Top</div>')
        ]),
        ui.svgMessageDiv = html.Element.mk('<div style="display:none;margin-left:auto;padding:40px;margin-right:auto;width:50%;margin-top:20px;border:solid thin black">AAAAUUUU</div>')
     ]),
  tree.objectContainer = uiDiv = html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"></div>').
    __addChildren([
      tree.obDivRest =tree.obDiv = html.Element.mk('<div id="obDiv" style="position:absolute;background-color:white;border:solid thin blue;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px">TREE</div>'),
      
    ui.protoContainer =  html.Element.mk('<div id="protoContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').
    __addChildren([
      html.Element.mk('<div style="font-size:14pt;margin-bottom:5px">Click  in the graphics panel as many times as you like to add cloned items at the positions clicked.</div>'),
      ui.doneCloningBut =html.Element.mk('<div style = "font-size:14pt;text-align:center;margin-top:80px;mmargin-left:auto;mmargin-right:auto" class="roundButton">Done Cloning</div>')
    ]),
    ui.insertContainer =  html.Element.mk('<div id="insertContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px">INSERT</div>').
    __addChildren([
      ui.insertDiv = html.Element.mk('<div id="insertDiv" style="overflow:auto;position:absolute;top:60px;height:400px;width:600px;background-color:white;bborder:solid thin black;"/>').
      __addChildren([
        ui.dragMessage = html.Element.mk('<div id="dragMessage" style="font-size:8pt;padding-bottom:10px;width:100%;text-align:center">Drag to insert</div>'),/*.__addChildren(
          [ui.insertSpan = html.Element.mk('<span style="padding-left:10px;text-decoration:underline"> Insert</span>'),
           ui.replaceSpan = html.Element.mk('<span style="padding-left:10px;text-decoration:none">Replace</span>'),
           ui.replaceProtoSpan = html.Element.mk('<span style="padding-left:10px;text-decoration:none"> Replace Proto</span>')]),*/
          
        ui.tabContainer = html.Element.mk('<div id="tabContainer" style="font-size:10pt;vertical-align:top;border-bottom:thin solid black;height:60px;"></div>').
        __addChildren([
            ui.insertTab = html.Element.mk('<div id="tab" style="width:80%;vertical-align:bottom;borderr:thin solid green;display:inline-block;height:30px;"></div>')
           // ui.closeInsertBut = html.Element.mk('<div style="background-color:red;display:inline-block;vertical-align:top;float:right;cursor:pointer;margin-left:0px;margin-right:1px">X</div>')
        ]),                                                                                                                                                 
        ui.insertDivCol1 = html.Element.mk('<div id="col1" style="display:inline-block;bborder:thin solid black;width:49%;"></div>'),
        ui.insertDivCol2 = html.Element.mk('<div id="col2" style="vertical-align:top;display:inline-block;bborder:thin solid black;width:49%;"></div>'),
      ])
      

    ])
 ])
])
]);

if (actionPanelActive) {
  ui.cloneBut = ui.cloneAction;
  ui.deleteBut = ui.deleteAction;
  ui.editTextBut = ui.editTextAction;
}
  
ui.intro = false;
ui.includeActionPanel= true;

   
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = true;
ui.layout = function(noDraw) { // in the initialization phase, it is not yet time to __draw, and adjust the transform
  // aspect ratio of the UI
  var bkg = "white";
  var svgwd = 500;
  var svght = 500;
  var ar = 0.48//0.5;
  var pdw = 0;// minimum padding on sides
  var wpad = 5;//0
  var vpad = 20;//0//minimum sum of padding on top and bottom
  var cdims = geom.Point.mk(svgwd,svght);
  var awinwid = $(window).width();
  var awinht = $(window).height();
  var pwinwid = awinwid - 2 * wpad;
  var pwinht = awinht - 2 * vpad;
  if (pwinht < ar * pwinwid) { // the page is bounded by height 
    var pageHeight = pwinht;
    var pageWidth = pageHeight/ar;
    var lrs = (awinwid - pageWidth)/2;  
  } else { // the page is bounded by width
    var pageWidth = pwinwid;
    var pageHeight = ar * pageWidth;
  }
  pageHeight = pwinht;
  pageWidth = pwinwid;
  lrs = wpad;
  var docTop = pageHeight * 0.8 - 20;
  var docTop = 0;
  var docHeight = awinht - pageHeight - 30;
  var  twtp = 2*treePadding;
  var actionWidth  = 0.5 * pageWidth;
  var actionwd = 0;
  var docwd = 0;
  if (ui.intro) {
    var docwd = 0.25 * pageWidth;
  }
  if (actionPanelActive) {
    actionwd = pageWidth/10;
  } else {
    actionwd = 0;
  }
  if (ui.panelMode === 'insert') {
    uiWidth = pageWidth/6;//3
  } else {
    uiWidth = 0.25 * pageWidth;
    svgwd = 0.75 * pageWidth;
  }
  svgwd = pageWidth - actionwd - docwd - uiWidth;
  var treeOuterWidth = uiWidth;///2;
  var treeInnerWidth = treeOuterWidth - twtp;
  mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-0)+"px"});
  var topHt = -15 + topbarDiv.__element.offsetHeight;
  cols.$css({left:"5px",width:pageWidth+"px",top:topHt+"px"});
  ui.ctopDiv.$css({"padding-top":"0px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});
  var actionLeft = ui.includeDoc?docwd +10 + "px":"210px";
  actionDiv.$css({width:(actionWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
  var actionHt = actionDiv.__element.offsetHeight;//+(isTopNote?25:0);
  topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px","padding-top":"10px"});
  var svght = pageHeight - actionHt + 20;
  var panelHeaderHt = 26; // the area above the object/code/component panels 
  var treeHt = svght;
  tree.myWidth = treeInnerWidth;
  var tabsTop = "20px";
  tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:treeHt+"px",top:"0px",left:"0px"});
  ui.protoContainer.$css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"20px",left:"0px"});
  ui.svgDiv.$css({id:"svgdiv",left:(actionwd + docwd)+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
  ui.svgHt = svght;
 // ui.dataContainer.setVisibility(ui.panelMode === 'data');
  tree.obDiv.setVisibility(ui.panelMode=== 'chain');
  ui.insertContainer.setVisibility(ui.panelMode === 'insert');
  ui.protoContainer.setVisibility(ui.panelMode === 'proto');
  uiDiv.$css({top:"0px",left:(actionwd + docwd + svgwd)+"px",width:(uiWidth + "px")});
  if (ui.panelMode === 'insert') {
    ui.insertContainer.$css({top:"0px",left:0+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.insertDiv.$css({top:"0px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
  } else if (ui.panelMode === 'chain') {
  } else if (ui.panelMode === 'proto') {
  }
  docDiv.$css({left:"0px",width:docwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
  if (actionPanelActive) {
    if (ui.intro) {
      actionPanel.$css({left:docwd+"px",width:actionwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
    } else {
      actionPanel.$css({left:"0px",width:actionwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
     
    }
  } else {
    actionPanel.$hide();
  }

  svg.main.resize(svgwd,svght); 
   svg.main.positionButtons(svgwd);
   var noteWidth = Math.min(svgwd-40,570);
   var noteLeft = 0.5 * (svgwd - 40 - noteWidth);
   tree.noteDiv.$css({left:noteLeft+"px",width:noteWidth +"px"});
   if (firstLayout) {
     firstLayout = false; 
     ui.layout(noDraw);
   }
}

// Keep user informed about modifications 
var fileAssertedModified = false;


ui.setSaved = function (value) {
  ui.fileModified = !value;
  if (!value) {
    if (!fileAssertedModified) {
      ui.fileDisplay.$html(ui.source?ui.sourceFile+'*':'unsaved');
      fileAssertedModified = true;
    }
  } else {
     if (fileAssertedModified) {
      ui.fileDisplay.$html(ui.source?ui.sourceFile:'');
      fileAssertedModified = false;
    }
    
  }
}
/*begin chooser section */
ui.closer = html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;'+
         'font-weight:bold,border:thin solid black;font-size:12pt;color:black">X</div>');

var chooserClose = ui.closer.instantiate();
ui.chooserIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="chooser" />');
var chooserDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="chooserDiv" />').__addChildren([
  chooserClose,
  ui.chooserIframe
]);
var chooserBeenPopped = false;
var saveItem,resaveItem;

/* called from the chooser frame */
ui.chooserReturn = function (v) {
  mpg.chooser_lightbox.dismiss();
  switch (ui.chooserMode) {
    case'saveAs':
      saveItem(v.path);
      break;
   case'saveAsSvg':
      saveItem(v.path,undefined,undefined,(v.aspectRatio===0)?undefined:v.aspectRatio);
      break;
   case 'insertOwn':
      insertOwn(v);
      break;
    case 'open':
      if (v.deleteRequested) {
        fb.deleteFromDatabase(v.path);
        return;
      }
     var ext = pj.afterLastChar(v.path,'.',true);
     var dest;
     if (ext === 'svg') {
       dest = 'svg';
     } else if ((ext === 'item')||(ext === 'js')) {
       dest = 'draw';
     } else if (ext === 'catalog') {
       dest = 'catalogEdit';
     } // @todo add .json case
     location.href = '/'+dest+'.html?source='+v.path;
     break;
    case "viewSource":
      ui.viewSource();
      break;
  }
}
   
var popChooser = function(keys,operation) {
  ui.chooserKeys = keys; // this is where the chooser gets its data
  ui.chooserMode = operation;
  if (mpg.lightbox) {
    mpg.lightbox.dismiss();
  }
  var lb = mpg.chooser_lightbox;
  var src = '/chooser.html';
  if (!chooserBeenPopped) {
    lb.setContent(chooserDiv);
    chooserBeenPopped = true;

  } else {
    ui.chooserIframe.__element.src = src;
  }
  window.setTimeout(function () {lb.pop(undefined,undefined,1);ui.chooserIframe.__element.src = src},300);
}
  
chooserClose.$click(function () {
  mpg.chooser_lightbox.dismiss();
});


/* end chooser section */

/* file options section */
  
var fsel = ui.fsel = dom.Select.mk();

fsel.containerP = html.Element.mk('<div style="position:absolute;padding-left:5px;padding-right:5px;padding-bottom:15px;border:solid thin black;background-color:white"/>');

fsel.optionP = html.Element.mk('<div class="pulldownEntry"/>');
       
initFsel = function () {
  fsel.options = ["New","New Network","Open or Delete...","Save","Save As...","Save As SVG..."]; 
  fsel.optionIds = ["new","newNetwork","open","save","saveAs","saveAsSvg"];
 var el = fsel.build();
 el.__name = undefined;
  mpg.addChild(el);
  el.$hide();
}

// called from the ui module

ui.hideFilePulldown = function () {
 if (pj.ui.fsel) { 
    pj.ui.fsel.hide();
  }
}


var setFselDisabled = function () {
   if (!fsel.disabled) {
      fsel.disabled = {};
   }
   var disabled = fsel.disabled;
   disabled.insertOwn = disabled.open = disabled.save = disabled.saveAs = disabled.saveAsSvg  = !fb.currentUser;
   if (!ui.source) {
     disabled.save = true;
   } else {
    ui.itemPath = ownedFilePath(ui.source);
    disabled.save = !ui.itemPath;
   }
   fsel.updateDisabled();
}

var listAndPop = function (opt) {
  fb.getDirectory(function (err,list) {
    popChooser(list,opt);
  });
}

/* called from the ui module */
fsel.onSelect = function (n) {
  var opt = fsel.optionIds[n];
  if (fsel.disabled[opt]) return;
  switch (opt) {
    case "delete":
      confirmDelete();
      break;
    case "new":
      location.href = "/draw.html"
      break;
    case "newNetwork":
      location.href = "/draw.html?source=/diagram/backGraph.js";
      break;
    case "addTitle":
      ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title');
      break;
    case "save":
      resaveItem();
      break;

    case "viewSource":
      ui.viewSource();
      break;
    case "open":
    case "insert":
    case "saveAs":
    case "saveAsSvg":
      var selectFile  = function () {
        fb.getDirectory(function (err,list) {
          popChooser(list,opt);
        });
      };
      if ((opt === 'saveAsSvg') && ui.fileModified) {
          setYesNoText('This file is unsaved; do you want to generate SVG anyway, losing your changes?');
          afterYes = selectFile; 
          mpg.lightbox.pop();
        
      } else {
        selectFile();
      }
     
      break;
  }
}
 
setClickFunction(ui.fileBut,function () {
  setFselDisabled();
  dom.popFromButton("file",ui.fileBut,fsel.domEl);
});

/* end file options section */
     
/* begin insert section */

ui.theInserts = {};

var idForInsert;
var insertSettings;
var selectedForInsert;

var clearInsertVars = function () {
  idForInsert =  insertSettings = undefined;s
}

//roles is a comma-separated list
ui.roleAppears = function (role,iroles) {
  return iroles.indexOf(role) > -1;
}

/* called from ui module */

var insertLastStep = function (point,scale) {
  debugger;
  if (ui.customInsert) {
    var rs = ui.customInsert(ui.insertProto);
  }
  if (!rs) {
    rs = ui.insertProto.instantiate();
    var anm = pj.autoname(pj.root,idForInsert);
    rs.__unhide();
    pj.root.set(anm,rs);
  //rs . __svgId = anm;
    pj.log('install','Adding ',anm);
  }
  rs.__draw();
 
  if (ui.nowCloning && (rs.__updateClone)) {
    rs.__updateClone();
  } else {
    rs.__update();
  }
  var defaultSize = ui.insertProto.__defaultSize;
  if (!defaultSize) {
    defaultSize = geom.Point.mk(30,30);
  }
  defaultSize = defaultSize.times(2/scale);
  if (!ui.nowCloning) {
    var resizee = ui.insertProto;
    resizee.__setExtent(defaultSize);
    resizee.__beenResized = true;
    rs.__update();
  }
  rs.__moveto(point);
  rs.__show();
  enableButtons();
  ui.setSaved(false);

}

ui.finalizeInsert = function (point,scale) {
  if (ui.nowCloning) {
     insertLastStep(point,scale);
  } else {
    setupForInsert(selectedForInsert,function () {
      insertLastStep(point,scale);
    });
  }
}

// ui.insertProto is available for successive inserts; prepare for the insert operations

/* version where each insert has its own proto */
var setupForInsertCommon = function (proto) {
  debugger;
  ui.insertProto = proto.instantiate();
  ui.insertProto.__topProto = 1;
  
  if (insertSettings) {
    ui.insertProto.set(insertSettings);
    if (ui.insertProto.__updatePrototype) {
      ui.insertProto.__updatePrototype();
    }
  }
  ui.installPrototype(idForInsert,ui.insertProto);
  ui.resizable = false;//(!!(ui.insertProto.__setExtent) && !ui.insertProto.__donotResizeOnInsert);
  ui.resizeAspectRatio = ui.insertProto.__aspectRatio; // if a fixed aspect ratio is wanted (eg 1 for circle or square)
}
// for the case where the insert needed loading



var afterInsertLoaded = function (e,rs,cb) {
  ui.theInserts[ui.insertPath] = rs;
  setupForInsertCommon(rs);
  if (cb) {
    cb();
  }
}

// protofy returns an item that  has  prototype in the workspace. If its input does not have this property,
// it instantiates it, and hides the input.
var protofy = function (x) {
  var proto = Object.getPrototypeOf(x);
  if (proto.__inWs()) {
    return x;
  }
  x.__hide();
  var newItem = x.instantiate();
    newItem.__show();

  if (newItem.__reset) {
    newItem.__reset();
  }
  var parent = x.__parent;
  var nm = x.__name;
  var anm = pj.autoname(parent,nm);
  parent.set(anm,newItem);
  newItem.__update();
  return newItem;
}


var popInsertPanelForCloning = function () {
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.insertDivCol1.$empty();
  ui.insertDivCol2.$empty();
  
}

var setupForClone = function (forAddToCohort) {
  debugger;
  if (pj.selectedNode) {
    ui.insertProto = Object.getPrototypeOf(pj.selectedNode);
    idForInsert  = pj.selectedNode.__name;
  } 
  if (forAddToCohort) {
    var inheritors = pj.inheritors(ui.insertProto);
    ui.unselect();
    showClones(ui.insertProto);
    actionPanelMessage.__element.innerHTML = "Select items to add to the cohort";
    actionPanelButton.__element.innerHTML = "Done adding to cohort";
    setClickFunction(actionPanelButton,stdActionPanelButtonAction);
  } else {
    actionPanelMessage.__element.innerHTML = `Now cloning`;
    actionPanelButton.__element.innerHTML = `Done cloning`;
    setClickFunction(actionPanelButton,stdActionPanelButtonAction);
    svg.main.__element.style.cursor = ui.resizable?"crosshair":"cell";
  }
  actionPanelCommon.__element.style.display = "none";
  actionPanelCustom.__element.style.display = "none";
  ui.resizable = false;
  ui.nowCloning = !forAddToCohort;
  ui.nowReplacingFromClone= forAddToCohort;
  ui.disableAllButtons();
}

var setupForInsert = function (catalogEntry,cb) {
  debugger;
  var path = catalogEntry.url;
  idForInsert = catalogEntry.id;
  insertSettings = catalogEntry.settings;
  ui.insertingText = catalogEntry.isText;
  var ins = ui.theInserts[path];// already loaded?
  if (ins) {    
    setupForInsertCommon(ins);
    if (cb) {
      cb();
    }
    return;
  }
  ui.insertPath = path;
  pj.install(path,function (erm,rs) {
    rs.__roles = catalogEntry.roles;
    afterInsertLoaded(erm,rs,cb);
  });
}

ui.dropListener = function (draggedOver,point,scale) {
  debugger;
  if (ui.draggingText && draggedOver) {
    addText(draggedOver);
    return;
  }
  var toReplaceTop;
  var toReplace;
  if (ui.replaceMode && !draggedOver) {
    return;
  }
  toReplaceTop = toReplace = draggedOver;
  if (ui.replaceMode) {
    var rp = ui.replaceablePart(draggedOver);
    if (rp) {
      toReplace = rp;
    } 
  }
  setupForInsert(ui.dragSelected,function () {
  
    if (ui.replaceMode) {
      if (ui.replaceProtoMode) {
        replacePrototypeLastStep(toReplace,toReplaceTop);
      } else {
        replaceLastStep(toReplace,toReplaceTop);
      }
    } else {
      insertLastStep(point,scale);
    }
  });
}
var catalogState = {};

ui.popInserts= function (mode) {
  debugger;
  selectedForInsert = undefined;
  ui.draggingText = false;
  if (mode === 'replace') {
    ui.replaceMode = true;
    ui.replaceProtoMode = false;
    ui.dragMessage.$html('Drag to replace');
  } else if (mode === 'replaceProto') {
    ui.replaceMode = true;
    ui.replaceProtoMode = true;
    ui.dragMessage.$html('Drag to replace  prototype');
  } else {
    ui.replaceMode = false;
    ui.replaceProtoMode = false;
    ui.dragMessage.$html('Drag to insert');
  }
  ui.unselect();
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.insertDiv.$show();
  enableButtons();
  pj.catalog.getAndShow({forInsert:true,role:null,tabsDiv:ui.insertTab.__element,selectedTab:catalogState.selectedTab,
                        cols:[ui.insertDivCol1.__element,ui.insertDivCol2.__element],
                        catalogUrl:ui.catalogUrl,extensionUrl:ui.catalogExtensionUrl,
    whenDrag: function (selected) {
      ui.dragSelected = selected;
      ui.draggingText = (!ui.replaceMode) && (selected.url === "/text/textPlain.js");
      ui.draggingFromCatalog = true;
    },
    callback:function (error,catState) {
      ui.catalogState = catalogState = catState;
    }});
}

setClickFunction(ui.insertBut,() => ui.popInserts('insert'));
setClickFunction(ui.replaceBut,() => ui.popInserts('replace'));
setClickFunction(ui.replaceProtoBut,() => ui.popInserts('replaceProto'));

ui.closeSidePanel = function () {
  if (ui.panelMode === 'chain')  {
    return;
  }
  ui.panelMode = 'chain';
  ui.layout();
}


var doneInserting = function () {
  //svg.main.__element.style.cursor = "";
  if (ui.controlRect) {
    ui.controlRect.__hide();
  }
  if (ui.nowCloning) {
     svg.main.__element.style.cursor = "";
  }
  ui.resumeActionPanelAfterCloning();
  //ui.closeSidePanel();
  ui.nowCloning = false;
  ui.nowReplacingFromClone = false;

  enableButtons();
}

ui.doneCloningBut.$click(doneInserting);

/* end insert section */

/* start replace section */
ui.standardTransferProperties = ['fill','stroke'];

ui.replaceablePart = function (item) {
  var rs;
  pj.forEachTreeProperty(item,function (node) {
    if (!rs  && node.__role && ui.dragSelected.roles.indexOf(node.__role)) {
      rs = node;
    }
  });
  return rs;
  }
  
ui.replaceable = function (item) {
  return (item) &&
    ((ui.nowReplacingFromClone && (item.__role === ui.insertProto.__role)) ||  (!item.__role) ||
     (ui.draggingText && (item.__roles.indexOf('box') > -1)) ||
     (ui.dragSelected.roles && (ui.replaceablePart(item) || (ui.dragSelected.roles.indexOf(item.__role) > -1))))
}

ui.getExtent = function (item,own) {
  var dim = own?pj.getval(item,'__dimension'):item.__dimension;
  if (dim !== undefined) {
    return geom.Point.mk(dim,dim);
  }
  if (own) {
    dim = item.__dimension; // dimension rules, and if it is in the prototype, there is no "own" extent
    if (dim !== undefined) {
      return undefined;
    }
  }
  var width = own?pj.getval(item,'width'):item.width;
  if (width !== undefined) {
    return geom.Point.mk(width,own?pj.getval(item,'height'):item.height);
  }
}

ui.getOwnExtent = function (item) {
  return ui.getExtent(item,true);
}

ui.transferExtent = function (dest,src,own) {
  var ext = ui.getExtent(src,own);
  if (ext) {
    var dim = dest.__dimension;
    if (dim !== undefined) {
      dest.__dimension = ext.x;
    } else if (dest.width !== undefined) {
      dest.width = ext.x;
      dest.height = ext.y;
    }
  }
}

ui.transferOwnExtent = function (dest,src) {
  ui.transferExtent(dest,src,true);
}

ui.diagramTransferredProperties = function (item) {
  var topActive = pj.ancestorWithProperty(item,'__diagram');
  if (topActive) {
    return topActive.__diagramTransferredProperties;
  }
}

var textboxCatalogEntry = {id:"textbox",roles:["vertex"],url:"/text/textbox.js"};

var addText = function (item) { // add text to the given item
  setupForInsert(textboxCatalogEntry,function () {
    debugger;
    var parent = item.__parent;
    var name = item.__name;
    var newProto = ui.insertProto;
    var newBoxProto = Object.getPrototypeOf(item);
    newProto.set('box',newBoxProto);
    newBoxProto.__unselectable = true;
    var newItem = newProto.instantiate();

    //var newBox = oldBox.instantiate();
    item.remove();
    //newBox.__unhide();
    newItem.__unhide();
    //newItem.box.__unhide();
    parent.set(name,newItem);
    //var position = newItem.box.__getTranslation();
    //newItem.set('box',newBox);
    //newBox.__unselectable = true;
    //newItem.__replaceChild(newItem.box,item); // keeps the order of children intact
    //transferProperties(newItem.box,item);
    transferProperties(newItem,item);
   // newItem.box.__moveto(position);

    newItem.update();
    newItem.__draw();
  });
}

var transferProperties = function (dst,src) {
  debugger;
  var position = src.__getTranslation();
  var transferredProperties = src.__transferredProperties;
  var diagramTransferredProperties = ui.diagramTransferredProperties(src);
  var instanceTransferFunction  = src.__instanceTransferFunction;
  pj.setPropertiesFromOwn(dst,src,transferredProperties);
  pj.setPropertiesFromOwn(dst,src,diagramTransferredProperties);
  if (instanceTransferFunction) {
    instanceTransferFunction(dst,src);
  }
  ui.transferOwnExtent(dst,src);
  dst.__moveto(position);
}

var replaceIt = function (replaced,replacementProto) {
  debugger;
  var replacement = replacementProto.instantiate();
  var parent = replaced.__parent;
  var nm = replaced.__name;
  //var extent;
  //var position = replaced.__getTranslation();
  //var transferredProperties = replaced.__transferredProperties;
  //var diagramTransferredProperties = ui.diagramTransferredProperties(replaced);
  //var instanceTransferFunction  = replaced.__instanceTransferFunction;
  parent.__replaceChild(replaced,replacement); // keeps the order of children intact
  //replaced.remove();
 // replacement.__unhide();
  //parent.set(nm,replacement);
 // pj.setPropertiesFromOwn(replacement,replaced,transferredProperties);
 // pj.setPropertiesFromOwn(replacement,replaced,diagramTransferredProperties);
  replacement.__role = replaced.__role;
  transferProperties(replacement,replaced);
 // ui.transferOwnExtent(replacement,replaced);
  //replacement.__moveto(position);
  //if (instanceTransferFunction) {
  //  instanceTransferFunction(replacement,replaced);
  //}
  return replacement;
}

/* not in use, but works */
var fork = function () {
  var replaced = pj.selectedNode;
  var oldProto =   Object.getPrototypeOf(replaced);
  var transferredProperties = oldProto.__transferredProperties;
  var instanceTransferFunction  = oldProto.__instanceTransferFunction;
  var protoProto =  Object.getPrototypeOf(oldProto);
  var newProto = protoProto.instantiate();
  var parent = oldProto.__parent;
  var nm = oldProto.__name;
  var newName = pj.autoname(parent,nm);
  parent.set(newName,newProto);
  pj.setPropertiesFromOwn(newProto,oldProto,transferredProperties);
  var replacement = replaceIt(replaced,newProto);
  replacement.update();
  replacement.__draw();
  replacement.__select('svg');
  ui.setSaved(false);  
}

pj.deepCopyOwnProperties = function (dest,src) {
  var names = Object.getOwnPropertyNames(src);
  names.forEach(function (name) {
    if (pj.internal(name)) {
      return;
    }
    var child = src[name];
    if ((child === null) || (typeof child !== 'object')) {
      dest[name] = child;
    } else {
      pj.deepCopyOwnProperties(dest[name],child);
    }
  });
}

var newPrototypeWithReplacedChild = function (item,name,replacement) {
  var saveChild = item[name];
  item[name] = undefined; //temporarily
  var proto = Object.getPrototypeOf(item);
  var newItem = proto.instantiate();
  pj.deepCopyOwnProperties(newItem,item);
  newItem.set(name,replacement);
  replacement.__unhide(); //a child only so should not be hidden
  ui.installPrototype(item.__name,newItem);
  item[name] = saveChild;
  return newItem;
}

// ireplaced might be a child of replacedTop, eg the box in a text box
var replaceLastStep = function (ireplaced,replacedTop) {
  var newProto,replaced,topProto;
  console.log('replaceLastStep',ireplaced.__name);
  debugger;
  newProto = ui.insertProto;
  if (ireplaced !== replacedTop) {
    topProto = newPrototypeWithReplacedChild(Object.getPrototypeOf(replacedTop),ireplaced.__name,ui.insertProto);
    replaced = replacedTop;
  } else {
    replaced = ireplaced;
    topProto = newProto;    
  }
  var oldProto = Object.getPrototypeOf(ireplaced);
  var transferredProperties = oldProto.__transferredProperties;
  pj.setPropertiesFromOwn(newProto,oldProto,oldProto.__transferredProperties);
  newProto.__role =  oldProto.__role;
  newProto.__unselectable = oldProto.__unselectable;
  ui.transferExtent(newProto,oldProto);
  var replacement = replaceIt(replaced,topProto);
  replacement.update();
  var diagram = ui.containingDiagram(replacement);
  var toUpdate = diagram?diagram:replacement
  toUpdate.__update();
  toUpdate.__draw();
  ui.setSaved(false);
}


var replacePrototypeLastStep = function (ireplaced,replacedTop) {
  debugger;
  var replaced,topProto;
  var  replacementProto = ui.insertProto; // the part in part case
  if (ireplaced !== replacedTop) {
    topProto = newPrototypeWithReplacedChild(Object.getPrototypeOf(replacedTop),ireplaced.__name,ui.insertProto);
    replaced = replacedTop;  
   } else {
    replaced = ireplaced;
    topProto = replacementProto;    
  }
  
  var replacedProto = Object.getPrototypeOf(ireplaced); //the part, in part case
  var replacedTopProto = Object.getPrototypeOf(replacedTop);
  var transferExtent = replacedProto.__transferExtent;
  var protoExtent;
  if (transferExtent) {
    ui.transferExtent(replacementProto,replacedProto);
  }
  pj.setPropertiesFromOwn(replacementProto,replacedProto,replacedProto.__transferredProperties);
  pj.setPropertiesFromOwn(replacementProto,replacedProto,ui.diagramTransferredProperties(replacedProto));
  replacementProto.__role =  replacedProto.__role;
  replacementProto.__unselectable = replacedProto.__unselectable;
  pj.forInheritors(replacedTopProto,function (replaced) {
    if (replacedTopProto === replaced) { // a node counts as an inheritor of itself
      return;
    }
    var replacement = replaceIt(replaced,topProto);
    replacement.update();
    replacement.__draw();
  });
  ui.setSaved(false);
}


ui.replacePrototype = function (catalogEntry) {
  setupForInsert(catalogEntry,function () {
    replacePrototypeLastStep();
  });
}

ui.replaceFromClone = function (toReplace) {
  debugger;
  if (toReplace === pj.selectedMode) {
     return;
  }
  var  proto = ui.insertProto;
  if ((toReplace.__role) && (proto.__roles.indexOf(toReplace.__role) === -1)) {
    return;
  }
  var replacement = replaceIt(toReplace,proto);
  replacement.update();
  replacement.__draw();
  showClones(proto);
  ui.setSaved(false);
}
  
/* end replace section */

/* start buttons section */

ui.standardDelete = function (item) {
  ui.unselect();
  item.remove();
  ui.setSaved(false);
  pj.root.__draw();
  
}
setClickFunction(ui.deleteBut,function () {
  var selnode = pj.selectedNode;
  debugger;
  ui.unselect();
  ui.popInserts();
  var diagram = ui.containingDiagram(selnode);
  debugger;
  if (diagram && diagram.__delete) {
    diagram.__delete(selnode);
  } else {
    ui.standardDelete(selnode);
  }
});

activateTreeClimbButtons();
var allButtons = [ui.fileBut,ui.insertBut,ui.replaceBut,ui.replaceProtoBut, ui.cloneBut,ui.joinAction,ui.showClonesAction,ui.splitCohortAction,ui.editTextBut,ui.deleteBut,ui.upBut,ui.downBut,ui.topBut];
var topbarButtons = [ui.fileBut,ui.insertBut,ui.replaceBut,ui.replaceProtoBut];
var navsDisabled;
ui.disableAllButtons = function () {
  allButtons.forEach(disableButton);
}

ui.disableTopbarButtons = function () {
  topbarButtons.forEach(disableButton);
}

ui.enableTopbarButtons = function () {
  topbarButtons.forEach(enableButton);
}

var deleteable = function (x) {
  return !(x.__notDeleteable);
}

enableButtons = function () {
  if (ui.nowCloning) {
    return;
  }
  allButtons.forEach(enableButton);
  if (!selectedTextBox()) {
    disableButton(ui.editTextBut);
  }
  if (pj.selectedNode) {
    enableButton1(ui.cloneBut,pj.selectedNode.__cloneable);
     enableButton1(ui.deleteBut,deleteable(pj.selectedNode));
  } else {
    disableButton(ui.cloneBut);
    disableButton(ui.showClonesAction);
    disableButton(ui.splitCohortAction);
    disableButton(ui.joinAction);
    disableButton(ui.deleteBut);
  }
  if (ui.panelMode === 'insert') {
    if  (!ui.replaceMode) {
      disableButton(ui.insertBut);
    } 
    if ( ui.replaceMode && !ui.replaceProtoMode) {
      disableButton(ui.replaceBut);
    }
    if (ui.replaceMode && ui.replaceProtoMode) {
      disableButton(ui.replaceProtoBut);
    }
  }
  enableTreeClimbButtons();
  if (nowSelectingForActionPanel) {
    ui.disableTopbarButtons();
  }
}
pj.selectCallbacks.push(enableButtons);
console.log('pushing enableButtons onto selectCallbacks');
pj.unselectCallbacks.push(function () {
  enableButtons();
  actionPanelMessage.__element.innerHTML="No item selected";
});

/* end buttons  section */
  
var setInstance = function (itm) { 
  if (!itm) {
    return;
  }
  ui.topBut.$show();
  ui.upBut.$show();
  tree.showItemAndChain(itm,'auto');
  enableTreeClimbButtons();
  return;
}

pj.selectCallbacks.push(setInstance); 

tree.protoSubDiv = html.Element.mk('<div style="background-color:white;margin-top:20px;border:solid thin green;padding:10px"/>');

tree.viewNote = function(k,note) {
  var h = k?'<b>'+k+':</b> '+note:note;
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(h)
  return;
}

function mkLink(url) {
   return '<a href="'+url+'">'+url+'</a>';
 } 

saveItem = function (path,code,cb,aspectRatio) { // aspectRatio is only relevant for svg, cb only for non-svg
  var needRestore = !!cb;
  var savingAs = true;
  var isSvg = pj.endsIn(path,'.svg');
  var pjUrl = '('+fb.currentUserName()+')'+path;
  ui.unselect();
  pj.saveItem(path,code?code:pj.root,function (err,path) {
    // todo deal with failure
    if (err) {
      if (err === 'maxSizeExceeded') {
        var msg = 'File size '+path+' exceeded limit: '+(pj.maxSaveLength);
      } else {
        msg = 'the save failed, for some reason';
      }
      ui.displayTemporaryError(ui.messageElement,msg,15000);
      return;
    } else if (cb) {
      cb(null,path);
      return;
    }
    if (isSvg) {
      var loc = '/svg.html?source='+pjUrl;
    } else {
      ui.fileModified = false;
      var loc = '/draw.html?source='+pjUrl;
    }
    location.href = loc;

  },aspectRatio);
}


resaveItem = function () {
  var doneSaving = function () {
    ui.messageElement.$hide();
    ui.setSaved(true);
  }
  ui.displayMessage(ui.messageElement,'Saving...');
  saveItem(ui.itemPath,undefined,doneSaving);
}

ui.alert = function (msg) {
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(msg);
}

  
ui.itemSaved = true;

/* edit text section */

var selectedTextBox = function () {
  var node = pj.selectedNode;
  while (node) {
    if (node.__isTextBox) {
      return node;
    }
    node = node.parent();
  }
}
var editTextArea = html.Element.mk('<textarea style="margin-left:10px" cols="50" rows="15"/>');
var editTextDone = html.Element.mk('<div class="roundButton">Ok</div>');

var backslashU = '\\'+'u';

var encodeUnicode = function (s) {
  var pointer = 0;
  var rs = '';
  var ln = s.length;
  while (true) {
    var nxt = s.indexOf(backslashU,pointer);
    if (nxt >= 0) {
      var beforeUnicode = s.substring(pointer,nxt);
      var codeString = s.substr(nxt+2,4);
      var code = parseInt(s.substr(nxt+2,4),16);
      var codePoint = String.fromCharCode(code);
      rs += beforeUnicode;
      rs += codePoint;
      pointer = nxt + 6;
    } else {
      var afterUnicode = s.substr(pointer);
      return rs + afterUnicode
    }
  }
}

editTextDone.$click(function () {
  var ival = editTextArea.$prop("value");
  var val = encodeUnicode(ival);
  var textBox = selectedTextBox();
  textBox.__setText(val);
  textBox.update();
  textBox.__draw();
  mpg.textedit_lightbox.dismiss();
  ui.updateControlBoxes();    
});

var editTextDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="editTextDivDiv" />').__addChildren([
  editTextArea,
  html.Element.mk('<div/>').__addChildren([editTextDone])
]);

var texteditBeenPopped = false;

var popTextEdit = function () {
  var textBox = selectedTextBox();
  var val = textBox.__getText();
  if (!texteditBeenPopped) mpg.textedit_lightbox.setContent(editTextDiv);
  mpg.textedit_lightbox.pop(undefined,300);
  editTextArea.$prop('value',val);
  texteditBeenPopped = true;
}

setClickFunction(ui.editTextBut,popTextEdit);

/*end edit text section */

var toObjectPanel = function () {
  ui.panelMode = 'chain';
  ui.layout();
}

setClickFunction (ui.cloneBut,() => {setupForClone(false)});
setClickFunction (ui.joinAction,() => {setupForClone(true)});

ui.openCodeEditor = function () {
  var url = '/code.html';
  if (ui.source && pj.endsIn(ui.source,'.js')) {
    url += '?source='+ui.source;
  }
  location.href = url;
}

/* begin action section (in progress-not enalbed for production)*/

// The action facility is a way of associating a panel of actions with an item.  Some of the actions are "top level", and
// some are asscociated with descendants of the item. For example, the item might be a tree diagram. A top level action
// might be turning the diagram on its side. Each node might have an associated action "add descendant". Details:

// an item is topActive  if it has these properties:
// __actionPanelUrl
// __topActions: an object of the form {[id:id1,title:title1,action:action1}, id2:action2 ... idn:actionn
//If the element in the action panel with idk is clicked, actionK is called with one argument: the topActive item.
// otherIds : an array of ids of other elements in the action panel which respond to actions associated with descendants
// of the topActive item. The elements with these otherIds should be grayed or hidden unless the descendant in question is selected

// an item A is active if it is a descendant of a topActive item, and if it has the properties
// __action __actionTitle,__actionId.  When the ative item A is selected, the element in the actionPanel with __actionId is shown (or ungrayed)
// When that element is clicked,  item__action(id) is called.


// actions should be functions attached to the activeTop,and are designated by their names

var nowSelectingForActionPanel = false;
var actionPanelLastSelection;

ui.resumeActionPanelAfterSelect = function (iitem) {
  debugger;
   nowSelectingForActionPanel = false;
  ui.enableTopbarButtons();
  actionPanelCommon.__element.style.display = "block";
  actionPanelCustom.__element.style.display = "block";
  if (pj.selectedNode) {
     actionPanelMessage.__element.innerHTML="Actions on selected item";
     actionPanelButton.__element.innerHTML = "";
  } else {
     actionPanelMessage.__element.innerHTML = "No item selected";
    
  }
  ui.actionPanelSelectCallback = function (itm) {
    actionPanelMessage.__element.innerHTML="Actions on selected item";
    ui.setActionPanelContents(itm);
  }
  //if (actionPanelLastSelection) {
  //  actionPanelLastSelection.__select('svg');
  //}
}

ui.actionPanelSelectCallback  = function (itm) {
        actionPanelMessage.__element.innerHTML="Actions on selected item";
        ui.setActionPanelContents(itm);
  };
  
pj.selectCallbacks.push(function (itm) {debugger;ui.actionPanelSelectCallback(itm)});

ui.setActionPanelForSelect = function (msg,onSelect,buttonMsg,buttonAction) {
  actionPanelCommon.__element.style.display = "none";
  actionPanelCustom.__element.style.display = "none";
  actionPanelMessage.__element.innerHTML = msg;
  ui.actionPanelSelectCallback = onSelect;
  if (buttonMsg) {
    actionPanelButton.__element.innerHTML = buttonMsg;
    setClickFunction(actionPanelButton,buttonAction)
  } else {
    actionPanelButton.__element.innerHTML = '';
  }
  nowSelectingForActionPanel = true;
  actionPanelLastSelection = pj.selectedNode;
}

ui.setupActionPanelForCloning = function () {
  actionPanelCommon.__element.style.display = "none";
  actionPanelCustom.__element.style.display = "none";
  actionPanelMessage.__element.innerHTML = `Now cloning`;
  actionPanelButton.__element.innerHTML = `Done cloning`;
  setClickFunction(actionPanelButton,stdActionPanelButtonAction);


}

ui.resumeActionPanelAfterCloning = function () {
  actionPanelCommon.__element.style.display = "block";
  actionPanelCustom.__element.style.display = "block";
  actionPanelMessage.__element.innerHTML = "Actions on selected item";
  actionPanelButton.__element.innerHTML = ``;

}


ui.setActionPanelContents = function (item) {
  actionPanelCustom.__element.innerHTML = '';
  if (!item) {
    return;
  }
  var diagram = pj.ancestorWithProperty(item,'__diagram');
  if (diagram) {
    var topActions = diagram.__topActions;
    if (topActions) {
      topActions.forEach(function (action) {
        var actionF = diagram[action.action];
        if (action.type === "numericInput") {
          var el = html.Element.mk('<div />');
         var spanEl = html.Element.mk('<span>'+action.title+'</span>');
         var inputEl =
            html.Element.mk(
              '<input type="number" id="N" style="font:8pt arial;width:40px;margin-left:5px" value="7"></input>');
         el.__addChildren([spanEl,inputEl]);
        actionPanelCustom.addChild(el);
        inputEl.$prop("value",action.value(diagram));
        inputEl.addEventListener("change",function () {
          actionF.call(undefined,diagram,Number(inputEl.$prop("value")));
        })
        } else {
          var el = html.Element.mk('<div class="colUbutton left">'+action.title+'</div>');
          actionPanelCustom.addChild(el);
          setClickFunction(el,action.action);
        }
      });
    }
    var actions = diagram.__actions(item);
  } else {
    actions  = item.__actions?item.__actions():undefined;
  }
  if (!actions) {
    return;
  }
  actions.forEach(function (action) {
    debugger;
    var actionF = diagram[action.action];
    if (!actionF) {
      pj.error('no such Action',action.action);
    }
    if (action.type === "numericInput") {
      var el = html.Element.mk('<input type="input" style="font:8pt arial;background-color:#e7e7ee,width:60%;margin-left:10px"/>');
      actionPanelCustom.addChild(el);
    } else {
      var el = html.Element.mk('<div class="colUbutton left">'+action.title+'</div>');
      actionPanelCustom.addChild(el);
      setClickFunction(el,function () {
        actionF.call(undefined,diagram,item);
      });
    }
  });
}

var cohortButtonsShown = false;
setClickFunction(ui.showCohortButtons,function () {
  if (cohortButtonsShown) {
    ui.showClonesAction.$hide();
    ui.splitCohortAction.$hide();
    ui.joinAction.$hide();
    cohortButtonsShown = false;
  } else {
    ui.showClonesAction.$show();
    ui.splitCohortAction.$show();
    ui.joinAction.$show();
    cohortButtonsShown = true;
  }
});

var showClones = function (proto) {
  debugger;
   var inheritors = pj.inheritors(proto);
  console.log('inheritor count',inheritors.length)
  svg.highlightNodes(inheritors);

}
setClickFunction(ui.showClonesAction,function () {
  var proto = Object.getPrototypeOf(pj.selectedNode);
  showClones(proto);
});

const stdActionPanelButtonAction =  function () {
  if (ui.forking) {
    ui.forking = undefined;
    svg.unhighlight();
  } else if (ui.nowCloning) {
    ui.nowCloning = false;
    ui.unselect();
  }  else if (ui.nowReplacingFromClone) {
    ui.nowReplacingFromClone = false
    svg.unhighlight();
  }
  enableButtons();
  actionPanelMessage.__element.innerHTML="No item selected";
  ui.actionPanelSelectCallback = function (itm) {
      actionPanelMessage.__element.innerHTML="Actions on selected item";
      ui.setActionPanelContents(itm)
  }
  ui.setActionPanelContents(pj.selectedNode)
  actionPanelCommon.__element.style.display = "block";
  actionPanelCustom.__element.style.display = "block";
  actionPanelButton.__element.innerHTML = "";

};

setClickFunction(actionPanelButton,stdActionPanelButtonAction);
 

setClickFunction(ui.splitCohortAction,function () {
  var proto = Object.getPrototypeOf(pj.selectedNode);
  var inheritors = pj.inheritors(proto);
  if (inheritors.length === 2) { // proto itself is an inheritor
    actionPanelMessage.__element.innerHTML = "The cohort only has one member, so splitting will have no effect";
    actionPanelButton.__element.innerHTML = "";
  } else {
    var protoProto = Object.getPrototypeOf(proto);
    ui.forking = pj.inheritors(proto);
    var transferredProperties = proto.__transferredProperties;
    debugger;
    ui.forkProto = ui.installPrototype(proto.__name,protoProto);
    pj.setPropertiesFromOwn(ui.forkProto,proto,transferredProperties);
    ui.transferOwnExtent(ui.forkProto,proto);
    console.log('inheritor count',ui.forking.length);
    ui.unselect();
    svg.highlightNodes(ui.forking);
    actionPanelMessage.__element.innerHTML = "Select the highlighted items that you wish to split off into a new cohort";
    actionPanelButton.__element.innerHTML = "Done splitting";
    setClickFunction(actionPanelButton,stdActionPanelButtonAction);
    actionPanelCommon.__element.style.display = "none";
    actionPanelCustom.__element.style.display = "none";
  
    ui.disableAllButtons();
  }
});


ui.performFork = function (item) {
  debugger;
  if (ui.forking.indexOf(item) > -1) {
    //var position = item.__getTranslation();
    var nm = item.__name;
    var highlight = item.__highlight;
    if (highlight) {
      svg.changeHighlightColor(highlight,"rgba(255,0,0,0.4)");
      item.__highlight = undefined;
    } else {
      return;
    }
    //var transferredProperties = item.__transferredProperties;
    //var instanceTransferFunction  = item.__instanceTransferFunction;
    var parent = item.__parent;
    item.remove();
    var forked = ui.forkProto.instantiate();
    parent.set(nm,forked);
    transferProperties(forked,item);
    ////pj.setPropertiesFromOwn(forked,item,transferredProperties);
    //ui.transferOwnExtent(forked,item);
    //forked.__moveto(position);
    var topActive = pj.ancestorWithProperty(parent,'__diagram');
    if (topActive) {
      topActive.__update();
    } else {
      forked.__update();
    }
    forked.__show();   
  }
}

/* end action section */
