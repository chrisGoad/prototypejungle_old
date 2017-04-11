
// This is one of the code files assembled into editor.version.js
var actionPanelActive = true;
var includeTest = false;

var treePadding = 0;
var bkColor = "white";
var docDiv;
var actionPanel,actionPanelMessage,actionPanelCommon,actionPanelCustom;
var minWidth = 1000;
var plusbut,minusbut;
var flatInputFont = "8pt arial";
var uiDiv,topbarDiv,obDivTitle;
var msgPadding = "5pt";
var inspectDom = false;
var uiWidth;
var insertKind;
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
     ui.actionPanel = actionPanel = html.Element.mk('<div  style="background-color:white;border:solid thin black;position:absolute;height:400px;width:600px;display:inline-block"></div>').__addChildren([
       actionPanelMessage = html.Element.mk('<div style="margin:0;width:100%;padding:10px">Actions on selected item</div>'),
//tml.Element.mk('<div style="font-size:11pt;padding:10px">Actions on Selected Item:</div>'),
       actionPanelCommon = html.Element.mk('<div style="margin:0;width:100%"></div>').__addChildren([
         ui.cloneAction = html.Element.mk('<div class="colUbutton">Clone</div>'),
         ui.replaceAction = html.Element.mk('<div class="colUbutton">Replace</div>'),
         ui.deleteAction = html.Element.mk('<div class="colUbutton">Delete</div>'),
          ui.editTextAction = html.Element.mk('<div class="colUbutton">Edit Text</div>')
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
        html.Element.mk('<div id="dragMessage" style="font-size:8pt;width:100%;text-align:center">Drag to Insert</div>'),
        ui.tabContainer = html.Element.mk('<div id="tabContainer" style="font-size:10pt;vertical-align:top;border-bottom:thin solid black;height:60px;"></div>').
        __addChildren([
            ui.insertTab = html.Element.mk('<div id="tab" style="width:80%;vertical-align:bottom;borderr:thin solid green;display:inline-block;height:30px;"></div>'),
            ui.closeInsertBut = html.Element.mk('<div style="background-color:red;display:inline-block;vertical-align:top;float:right;cursor:pointer;margin-left:0px;margin-right:1px">X</div>')
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
  var wpad = 20;//0
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
 // wpad = 10;
 // vpad = 10;
  //if (ui.includeDoc || 1) {
    var docTop = pageHeight * 0.8 - 20;
    var docTop = 0;
    var docHeight = awinht - pageHeight - 30;
  //}
  var  twtp = 2*treePadding;
  var actionWidth  = 0.5 * pageWidth;
  var docwd = 0;
  if (ui.intro) {
    var docwd = 0.25 * pageWidth;
    //uiWidth = 0.25 * pageWidth;
  } else if (actionPanelActive) {
    docwd = pageWidth/10;
  } else {
    docwd = 0;
  }
  if (ui.panelMode === 'insert') {
    //docwd = 0;
    uiWidth = pageWidth/6;//3
  } else {
    //docwd = 0;
    uiWidth = 0.25 * pageWidth;
    svgwd = 0.75 * pageWidth;
  }
  svgwd = pageWidth - docwd - uiWidth;
  var treeOuterWidth = uiWidth;///2;
  var treeInnerWidth = treeOuterWidth - twtp;
  mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-0)+"px"});
  var topHt = 20+topbarDiv.__element.offsetHeight;
  cols.$css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
  ui.ctopDiv.$css({"padding-top":"0px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});
  var actionLeft = ui.includeDoc?docwd +10 + "px":"210px";
  actionDiv.$css({width:(actionWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
  var actionHt = actionDiv.__element.offsetHeight;//+(isTopNote?25:0);
  topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px","padding-top":"10px"});
  var svght = pageHeight - actionHt -0;
  var panelHeaderHt = 26; // the area above the object/code/component panels 
  var treeHt = svght;
  tree.myWidth = treeInnerWidth;
  var tabsTop = "20px";
  tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:treeHt+"px",top:"0px",left:"0px"});
  ui.protoContainer.$css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"20px",left:"0px"});
  ui.svgDiv.$css({id:"svgdiv",left:docwd+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
  ui.svgHt = svght;
 // ui.dataContainer.setVisibility(ui.panelMode === 'data');
  tree.obDiv.setVisibility(ui.panelMode=== 'chain');
  ui.insertContainer.setVisibility(ui.panelMode === 'insert');
  ui.protoContainer.setVisibility(ui.panelMode === 'proto');
  uiDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")});
  if (ui.panelMode === 'insert') {
    ui.insertContainer.$css({top:"0px",left:0+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.insertDiv.$css({top:"0px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
  } else if (ui.panelMode === 'chain') {
  } else if (ui.panelMode === 'proto') {
  }
  docDiv.$css({left:"0px",width:docwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
  if (actionPanelActive) {
    actionPanel.$css({left:"0px",width:docwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
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
       dest = 'edit';
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
  fsel.options = ["New","Open...","Save","Save As...","Save As SVG..."]; 
  fsel.optionIds = ["new","open","save","saveAs","saveAsSvg"];
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
   //disabled.new =
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
      location.href = "/edit.html"
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
  idForInsert =  insertSettings = undefined;
}
/* called from ui module */

var theGraph = function () {
  if (pj.root.main.graph) {
    return pj.root.main.graph;
  }
}
var insertLastStep = function (point,scale) {
 // var atPoint = geom.Point.isPrototypeOf(stateOrPoint);
  //var center,bnds;
  //if (atPoint) {
   // center = stateOrPoint;
 /* } else {
    var bnds = stateOrPoint.rect;
    var extent = bnds.extent;      //code
    if ((extent.width < 10)|| (extent.height < 10)) {
      // todo: display a messge
      return;
    }
    var center = bnds.center();
  }*/
 // insert vertices and edges into the graph, if any, where they can be connected */
 debugger;
  var graph = theGraph();
  var addToGraph = false;
  var proto = ui.insertProto;
  var rs;
  if (graph) {
    var isVertex = proto.__isVertex;
    var isEdge = proto.__isEdge;
    addToGraph = isVertex || isEdge;
  }
  if (addToGraph) {
    if (isVertex) {
     // var protoProto = Object.getPrototypeOf(proto);
    // proto.__actions = [{title:'connect',action:addDescendant}];

      rs = graph.addVertex(proto);
    } else {
      rs = graph.addEdge(proto);
    }
  } else {
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
 // if (!ui.nowCloning) {
 //   var resizeBounds = defaultSize;
//  }
/*  if (!atPoint) {
    resizeBounds = bnds.extent;
    var ordered = stateOrPoint.ordered;  // ordered.x  ordered.y describes the direction of drag
  }
  */
  if (!ui.nowCloning) {
    //var resizee = ui.insertProto.__cloneResizable?rs:ui.insertProto;
    var resizee = ui.insertProto;
   // if ((Math.abs(resizeBounds.x) < 15) || (Math.abs(resizeBounds) < 15)) {
    //  resizeBounds = defaultSize;
   // }
    resizee.__setExtent(defaultSize);
    resizee.__beenResized = true;
    rs.__update();
  }
  rs.__moveto(point);
  rs.__show();
 // if (0 && !ui.nowCloning) {
 //   rs.__select('svg');
 //   doneInserting();
 // }
  
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

var disableAllButtons;

var setupForInsertCommon = function (proto) {
  ui.insertProto = proto.instantiate();
  ui.insertProto.__topProto = 1;
  if (insertSettings) {
    ui.insertProto.set(insertSettings);
  }
  var protos = pj.root.prototypes;
  if (!protos) {
    pj.root.set('prototypes',svg.Element.mk('<g/>'));
  }
  var anm = pj.autoname(pj.root,idForInsert);
  pj.log('install','Adding prototype',anm);
  pj.disableAdditionToDomOnSet = true;
  pj.root.prototypes.set(anm,ui.insertProto);
  pj.disableAdditionToDomOnSet = false;
  ui.insertProto.__hide();
  ui.resizable = false;//(!!(ui.insertProto.__setExtent) && !ui.insertProto.__donotResizeOnInsert);
  ui.resizeAspectRatio = ui.insertProto.__aspectRatio; // if a fixed aspect ratio is wanted (eg 1 for circle or square)
}
// for the case where the insert needed loading

var afterInsertLoaded = function (e,rs) {
  ui.theInserts[ui.insertPath] = rs;
  setupForInsertCommon(rs);
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
//var resizable = true;

var setupForClone = function () {
  if (pj.selectedNode) {
    ui.insertProto = Object.getPrototypeOf(pj.selectedNode);
    idForInsert  = pj.selectedNode.__name;
  }  
  //ui.panelMode = 'proto';
  //ui.layout();
  ui.setupActionPanelForCloning();
  ui.resizable = false;//ui.insertProto.__cloneResizable && ui.insertProto.__setExtent;
  ui.nowCloning = true;
  svg.main.__element.style.cursor = ui.resizable?"crosshair":"cell";
  disableAllButtons();
}

var setupForInsert= function (catalogEntry,cb) {
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
    afterInsertLoaded(erm,rs);
    if (cb) {cb()}
  });
}

ui.dropListener = function (point,scale) {
  setupForInsert(ui.dragSelected,function () {
    insertLastStep(point,scale);
  });
}
var catalogState;

ui.popInserts= function () {
  selectedForInsert = undefined;
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.insertDiv.$show();
  enableButtons();
  pj.catalog.getAndShow({forInsert:true,role:null,tabsDiv:ui.insertTab.__element,
                        cols:[ui.insertDivCol1.__element,ui.insertDivCol2.__element],
                        catalogUrl:ui.catalogUrl,extensionUrl:ui.catalogExtensionUrl,
    /*whenClickk:function (selected) {
      selectedForInsert = selected;
      //ui.nowInserting = true;
      disableAllButtons();
      //var selResizable = selected.resizable?$.trim(selected.resizable):null;
     // ui.resizable = selResizable && (selResizable !== 'false') && (selResizable !== '0');
      svg.main.__element.style.cursor = ui.resizable?"crosshair":"cell";
    },*/
    whenDrag: function (selected) {
      ui.dragSelected = selected;
      ui.draggingFromCatalog = true;
    },
    callback:function (error,catState) {
      catalogState = catState;
    }});
}

setClickFunction(ui.insertBut,ui.popInserts);

ui.closeSidePanel = function () {
  if (ui.panelMode === 'chain')  {
    return;
  }
  ui.panelMode = 'chain';
  ui.layout();
}


var doneInserting = function () {
  //svg.main.__element.style.cursor = "";
  debugger;
  if (ui.controlRect) {
    ui.controlRect.__hide();
  }
  if (ui.nowCloning) {
     svg.main.__element.style.cursor = "";
  }
  ui.resumeActionPanelAfterCloning();
  //ui.closeSidePanel();
  ui.nowCloning = false;

  enableButtons();
}

ui.doneCloningBut.$click(doneInserting);
ui.closeInsertBut.$click(doneInserting);

/* end insert section */
/* start replace section */

var popReplace = function () {
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.insertDiv.$show();
  enableButtons();
  pj.catalog.getAndShow({forReplace:true,role:null,tabsDiv:ui.insertTab.__element,
                        cols:[ui.insertDivCol1.__element,ui.insertDivCol2.__element],
                        catalogUrl:ui.catalogUrl,extensionUrl:ui.catalogExtensionUrl,
    whenClick:function (selected) {
      ui.replace(selected);
      
    },
    callback:function (error,catState) {
      catalogState = catState;
    }});
}


var replaceLastStep = function () {
  debugger;
  var  rs = ui.insertProto.instantiate();
  var replaced = pj.selectedNode;
  var parent = replaced.__parent;
  var nm = replaced.__name;
  var extent = replaced.__getExtent?replaced.__getExtent():undefined;
  var position = replaced.__getTranslation();
  var transferredProperties = replaced.__transferredProperties;
  replaced.remove(0);
  rs.__unhide();
  pj.setProperties(rs,replaced,replaced.__transferredProperties);
  if (extent && rs.__setExtent) {
    rs.__setExtent(extent);
    rs.__beenResized = true;
  }
  rs.__moveto(position);
  if (replaced.transferProperties) {
    replaced.transferProperties(rs,replaced);
  }
  rs.update();
  //rs . __svgId = anm;
  pj.log('replaced',nm);
  rs.__draw();
  rs.__select();
  ui.setSaved(false);

}


ui.replace = function (catalogEntry) {
  debugger;
  setupForInsert(catalogEntry,function () {
    replaceLastStep();
  });
}
setClickFunction(ui.replaceAction,popReplace);
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
  ui.unselect();
  if (selnode.__delete) {
    selnode.__delete();
  } else {
    ui.standardDelete(selnode);
  }
});

activateTreeClimbButtons();
var allButtons = [ui.fileBut,ui.insertBut,ui.cloneBut,ui.editTextBut,ui.deleteBut,ui.upBut,ui.downBut,ui.topBut];
var navsDisabled;
disableAllButtons = function () {
  //navsDisabled = {'up':ui.upBut.disabled,'down':ui.downBut.disabled,'top':ui.topBut.disabled};
  allButtons.forEach(disableButton);
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
  }  else if  (ui.selectedTopProto) {
    enableButton1(ui.cloneBut,ui.selectedTopProto.__cloneable);
  } else {
    disableButton(ui.cloneBut);
  }
  if (pj.selectedNode) {
    if (!deleteable(pj.selectedNode)) {
      disableButton(ui.deleteBut);
    }
  } else {
    disableButton(ui.deleteBut);
  }
  if ( ui.panelMode === 'insert') {
    disableButton(ui.insertBut);
  }
  enableTreeClimbButtons();
}
pj.selectCallbacks.push(enableButtons);
pj.unselectCallbacks.push(enableButtons);

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
  var pjUrl = '('+fb.currentUid()+')'+path;
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
      var loc = '/edit.html?source='+pjUrl;
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

setClickFunction (ui.cloneBut,setupForClone);

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

ui.instersectsWithNode = function (bnds) {
  
}
var findActionSets = function (item) {
  var rs = [];
  pj.forEachDescendant(item,function (d) {
    var actions = d.__actions;
    if (actions) {
      if (rs.indexOf(actions)>=0) {
        return;
      }
      rs.push(actions);
    }
  });
  return rs;
}


ui.popActionPanel = function (item) {
  //actionPanel.$show();
 // actionPanelActive = true;
  //ui.layout();
 // ui.zoomStep(0.5);
 //      svg.main.fitContents();
}

// actions should be functions attached to the activeTop,and are designated by their names

var nowSelectingForActionPanel = false;
var actionPanelLastSelection;

ui.resumeActionPanelAfterSelect = function (iitem) {
  debugger;
   nowSelectingForActionPanel = false;
  actionPanelCommon.__element.style.display = "block";
  actionPanelCustom.__element.style.display = "block";
  actionPanelMessage.__element.innerHTML = "Actions on selected item";
   //var item = iitem?iitem:actionPanelLastSelection;
   pj.selectCallbacks.pop();
   actionPanelLastSelection.__select('svg');
}
ui.setActionPanelForSelect = function (msg,onSelect) {
  actionPanelCommon.__element.style.display = "none";
  actionPanelCustom.__element.style.display = "none";

  actionPanelMessage.__element.innerHTML = msg;
  var el = html.Element.mk('<div class="colUbutton">Cancel</div>');
  actionPanelMessage.addChild(el);
  setClickFunction(el,ui.resumeActionPanelAfterSelect);

  pj.selectCallbacks.push(onSelect);
  nowSelectingForActionPanel = true;
  actionPanelLastSelection = pj.selectedNode;
  
 //       setClickFunction(el,action.action);
   
}

ui.setupActionPanelForCloning = function () {
  actionPanelCommon.__element.style.display = "none";
  actionPanelCustom.__element.style.display = "none";
  actionPanelMessage.__element.innerHTML = '';  
  var el = html.Element.mk('<div class="colUbutton">Done Cloning</div>');
  actionPanelMessage.addChild(el);
  setClickFunction(el,doneInserting);

}

ui.resumeActionPanelAfterCloning = function () {
  actionPanelCommon.__element.style.display = "block";
  actionPanelCustom.__element.style.display = "block";
  actionPanelMessage.__element.innerHTML = "Actions on selected item";
}


ui.setActionPanelContents = function (item) {
  if (nowSelectingForActionPanel) {
    return;
  }
  actionPanelCustom.__element.innerHTML = '';
  if (!item) {
    return;
  }
  var topActive = pj.ancestorWithProperty(item,'__activeTop');
  if (topActive) {
    var topActions = topActive.__topActions;
    if (topActions) {
      topActions.forEach(function (action) {
        var el = html.Element.mk('<div class="colUbutton">'+action.title+'</div>');
        actionPanelCustom.addChild(el);
        setClickFunction(el,action.action);
      });
    }
  }
  var actions  = item.__actions;
  if (!actions) {
    return;
  }
  actions.forEach(function (action) {
      var el = html.Element.mk('<div class="colUbutton">'+action.title+'</div>');
      actionPanelCustom.addChild(el);
      debugger;
      var actionF = topActive[action.action];
      setClickFunction(el,function () {
        debugger;
        actionF.call(undefined,topActive,item);
      });
  });
  return;
  var actionSets = findActionSets(item);
  actionSets.forEach(function (actions)  {
    actions.forEach(function (action) {
      var el = html.Element.mk('<div class="colUbutton">'+action.title+'</div>');
     actionPanelCustom.addChild(el);
      setClickFunction(el,function () {
        action.action.call(undefined,item,pj.selectedNode);
      });
    });
  });
  return;
  var el = html.Element.mk('<div class="colUbutton">HOHO</div>');
  var el2 = html.Element.mk('<div class="colUbutton">HAHA</div>');
  actionPanelCol1.addChild(el);
  actionPanelCol1.addChild(el2);
  setClickFunction(el,function () {alert(123)});
}
 pj.unselectCallbacks.push(ui.setActionPanelContents);
  pj.selectCallbacks.push(ui.setActionPanelContents);
if (ui.testBut) {
  
  setClickFunction(ui.testBut,function () {
    //ui.popActionPanel(pj.root.main);
    setActionPanelContents(pj.root.main.tree);
  });
 }
var installTopActions = function (item) {
  debugger;
  var actions = item.__actions;
  if (!actions) {
    return;
  }
   var actionPanelEl = ui.actionPanel.__element;
   for (var id in actions) {
    var fn = actions[id];
    var aEl = actionPanelEl.querySelector("[id = '"+id+"']");
    if (aEl) {
      aEl.addEventListener('mousedown',function () {fn(item);});
    }
   }
}

/*end action section */
