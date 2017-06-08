
// This is one of the code files assembled into editor.version.js
var actionPanelActive = true;
var includeTest = false;

var treePadding = 0;
var bkColor = "white";
var docDiv;
var actionPanel,actionPanelMessage,actionPanelCommon,actionPanelCustom,connectorImg;
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
       html.Element.mk('<div style="margin:0;width:100%;padding:10px">Connector:</div>'),
       connectorImg = html.Element.mk('<img style="padding-left:20%;width:60%;padding-right:20%"/>'),
       actionPanelMessage = html.Element.mk('<div style="margin:10px;width:80%;padding-right:10px">Actions on selected item</div>'),
//tml.Element.mk('<div style="font-size:11pt;padding:10px">Actions on Selected Item:</div>'),
       actionPanelCommon = html.Element.mk('<div style="margin:0;width:100%"></div>').__addChildren([
         ui.cloneAction = html.Element.mk('<div class="colUbutton">Clone</div>'),
        ui.cloneReplaceAction = html.Element.mk('<div class="colUbutton">Clone -> Replace</div>'),
         //ui.forkAction = html.Element.mk('<div class="colUbutton">Fork</div>'),
        // ui.replacePrototypeAction = html.Element.mk('<div class="colUbutton">Replace Prototype</div>'),
        // ui.replaceAction = html.Element.mk('<div class="colUbutton">Replace</div>'),
         ui.deleteAction = html.Element.mk('<div class="colUbutton">Delete</div>'),
          ui.editTextAction = html.Element.mk('<div class="colUbutton">Edit Text</div>'),
          ui.showClonesAction = html.Element.mk('<div class="colUbutton">Show Clones</div>')
          
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
 // wpad = 10;
 // vpad = 10;
  //if (ui.includeDoc || 1) {
    var docTop = pageHeight * 0.8 - 20;
    var docTop = 0;
    var docHeight = awinht - pageHeight - 30;
  //}
  var  twtp = 2*treePadding;
  var actionWidth  = 0.5 * pageWidth;
  var actionwd = 0;
  var docwd = 0;
  if (ui.intro) {
    var docwd = 0.25 * pageWidth;
    //uiWidth = 0.25 * pageWidth;
  }
  if (actionPanelActive) {
    actionwd = pageWidth/10;
  } else {
    actionwd = 0;
  }
  if (ui.panelMode === 'insert') {
    //docwd = 0;
    uiWidth = pageWidth/6;//3
  } else {
    //docwd = 0;
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
  fsel.options = ["New","Open or Delete...","Save","Save As...","Save As SVG..."]; 
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
      location.href = "/draw.html"
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

var insertLastStep = function (point,scale) {
 // insert vertices and edges into the graph, if any, where they can be connected */
  var addToGraph = false;
  var proto = ui.insertProto;
  var rs;
  var isVertex = proto.__role === 'vertex';
  var isEdge = proto.__role === 'edge';
  var isMultiIn = proto.__role === 'multiIn';
  var isMultiOut = proto.__role === 'multiOut';
  addToGraph = isVertex || isEdge || isMultiIn || isMultiOut;
  if (addToGraph) {
    if (isVertex) {
      rs = ui.graph.addVertex(proto);
    } else if (isMultiIn) {
      rs = ui.graph.addMultiIn(proto);
    } else if (isMultiOut) {
      rs = ui.graph.addMultiOut(proto);
    } else {
      rs = ui.graph.addEdge(proto);
    }
    debugger;
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


ui.findPrototypeWithUrl = function (url){
  if (!pj.root.prototypes) {
    return undefined;
  }
  var rs = undefined;
  pj.forEachTreeProperty(pj.root.prototypes, function (itm,name) {
    if (itm.__sourceUrl === url) {
      rs = itm;
    }
  });
  return rs;
}

/*
ui.installPrototype = function (id,proto) {
  var protos = pj.root.prototypes;
  if (!protos) {
    pj.root.set('prototypes',svg.Element.mk('<g/>'));
  }
  var anm = pj.autoname(pj.root.prototypes,id);
  if (pj.getval(proto,'__parent')) { // already present
    pj.root.prototypes[anm] = proto;
    return proto;
  }
  console.log('install','Adding prototype',anm);
  pj.disableAdditionToDomOnSet = true;
  pj.root.prototypes.set(anm,proto);
  pj.disableAdditionToDomOnSet = false;
  proto.__hide();
  return proto;

}
*/

ui.installArrow = function (cb) {
  var arrowP = ui.findPrototypeWithUrl('/shape/arrow.js');
  if (arrowP) {
    ui.currentConnector = arrowP;
    if (cb) {
      cb();
    }
    return;
  }
  pj.install('/shape/arrow.js',function (erm,arrowPP) {
    var arrowP = arrowPP.instantiate();
    ui.installPrototype('arrow',arrowP);
    ui.currentConnector = arrowP;
    if (cb) {
      cb();
    }
  });
}


ui.installGraph = function (cb) {
  ui.installArrow(function () {
    if (pj.root.__graph) {
      cb();
    }
   /* if (pj.installedItems['/diagram/graph2.js']) {
      ui.graph = ui.findGraph(); 
      if (cb) {
        cb();
      }
      return;
    }*/
   
    pj.install('/diagram/graph2.js',function (erm,graph) {
      //ui.graph =
      ui.graph = pj.root.set('__graph',graph.instantiate());
      if (cb) {
        cb();
     }
    });
  });
}


var setupForInsertCommon = function (proto) {
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
  var next = function () {
    ui.theInserts[ui.insertPath] = rs;
    setupForInsertCommon(rs);
    if (cb) {
      cb();
    }
  }
  if ( (!ui.graph) && ((rs.__role === 'vertex') || (rs.__role === 'edge') || (rs.__role === 'multiIn') || (rs.__role === 'multiOut'))) {// need graph support
    ui.installGraph(next);
  } else {
    next();
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
//var resizable = true;



  


var setupForClone = function (forReplace) {
  if (pj.selectedNode) {
    ui.insertProto = Object.getPrototypeOf(pj.selectedNode);
    idForInsert  = pj.selectedNode.__name;
  }  
  ui.setupActionPanelForCloning(forReplace);
  ui.resizable = false;
  ui.nowCloning = !forReplace;
  ui.nowReplacingFromClone= forReplace;
  if (ui.nowCloning) {
    svg.main.__element.style.cursor = ui.resizable?"crosshair":"cell";
  }
  ui.disableAllButtons();
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
    afterInsertLoaded(erm,rs,cb);
  });
}

ui.dropListener = function (draggedOver,point,scale) {
  if (ui.replaceMode && !draggedOver) {
    return;
  }
  setupForInsert(ui.dragSelected,function () {
    if (ui.replaceMode) {
      if (ui.replaceProtoMode) {
        replacePrototypeLastStep(draggedOver);
      } else {
        replaceLastStep(draggedOver);
      }
    } else {
      insertLastStep(point,scale);
    }
  });
}
var catalogState = {};

ui.popInserts= function (mode) {
  selectedForInsert = undefined;
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
//ui.closeInsertBut.$click(doneInserting);

/* end insert section */
/* start replace section */
ui.standardTransferProperties = ['fill','stroke'];

ui.replaceable = function (item) {
  return item && (!!item.__role) &&
    ((ui.nowReplacingFromClone && (item.__role === ui.insertProto.__role)) ||
     (ui.replaceMode && (item.__role === ui.dragSelected.role)))
}


ui.getOwnExtent = function (item) {
  var dim = pj.getval(item,'__dimension');
  if (dim !== undefined) {
    return geom.Point.mk(dim,dim);
  }
  dim = item.__dimension; // dimension rules, and if it is in the prototype, there is no "own" extent
  if (dim !== undefined) {
    return undefined;
  }
  var width = pj.getval(item,'width');
  if (width !== undefined) {
    return geom.Point.mk(width,pj.getval(item,'height'));
  }
}


ui.transferExtent = function (dest,src) {
  var ext = ui.getOwnExtent(src);
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
  
var replaceIt = function (replaced,replacementProto) {
  var replacement = replacementProto.instantiate();
  var parent = replaced.__parent;
  var nm = replaced.__name;
  var extent;
  var position = replaced.__getTranslation();
  var transferredProperties = replaced.__transferredProperties;
  var instanceTransferFunction  = replaced.__instanceTransferFunction;
  replaced.remove();
  replacement.__unhide();
  parent.set(nm,replacement);
  pj.setPropertiesFromOwn(replacement,replaced,transferredProperties);
  ui.transferExtent(replacement,replaced);
  replacement.__moveto(position);
  if (instanceTransferFunction) {
    instanceTransferFunction(replacement,replaced);
  }
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
 

var replaceLastStep = function (replaced) {
  console.log('replaceLastStep',replaced.__name);
  var extent;
  var  newProto = ui.insertProto;
  var oldProto = Object.getPrototypeOf(replaced);
  var transferredProperties = oldProto.__transferredProperties;
  pj.setProperties(newProto,oldProto,transferredProperties);
  ui.transferExtent(newProto,oldProto);
  var replacement = replaceIt(replaced,newProto);
  replacement.update();
  replacement.__draw();
  ui.setSaved(false);
}


var replacePrototypeLastStep = function (replaced) {
  var  replacementProto = ui.insertProto;
  //var replacementForSelected;
  var replacedProto = Object.getPrototypeOf(replaced);
  var transferExtent = replacedProto.__transferExtent;
  var protoExtent;
  if (transferExtent) {
    ui.transferExtent(replacementProto,replacedProto);
  }
  var transferredProperties = replacementProto.__transferredProperties;
  pj.setPropertiesFromOwn(replacementProto,replacedProto,transferredProperties);
  pj.forInheritors(replacedProto,function (replaced) {
    if (replacedProto === replaced) { // a node counts as an inheritor of itself
      return;
    }
    var replacement = replaceIt(replaced,replacementProto);
    replacement.update();
    replacement.__draw();
  });
  replacementForSelected.__select('svg');
  ui.setSaved(false);
}


ui.replacePrototype = function (catalogEntry) {
  setupForInsert(catalogEntry,function () {
    replacePrototypeLastStep();
  });
}

ui.replaceFromClone = function (toReplace) {
  if (toReplace === pj.selectedMode) {
     return;
  }
  var  proto = ui.insertProto;
  if ((!toReplace.__role) || (toReplace.__role !== proto.__role)) {
    return;
  }
  var replacement = replaceIt(toReplace,proto);
  replacement.update();
  replacement.__draw();
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
  //ui.unselect();
  pj.root.__select('svg');
  //ui.selectableAncestor(selnode).__select('svg');
  //ui.popInserts('insert');
  if (selnode.__delete) {
    selnode.__delete();
  } else {
    ui.standardDelete(selnode);
  }
});

activateTreeClimbButtons();
var allButtons = [ui.fileBut,ui.insertBut,ui.replaceBut,ui.replaceProtoBut, ui.cloneBut,ui.cloneReplaceAction,ui.showClonesAction,ui.editTextBut,ui.deleteBut,ui.upBut,ui.downBut,ui.topBut];
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
    disableButton(ui.cloneReplaceAction);
    disableButton(ui.showClonesAction);
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
setClickFunction (ui.cloneReplaceAction,() => {setupForClone(true)});

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



// actions should be functions attached to the activeTop,and are designated by their names

var nowSelectingForActionPanel = false;
var actionPanelLastSelection;

ui.resumeActionPanelAfterSelect = function (iitem) {
   nowSelectingForActionPanel = false;
  ui.enableTopbarButtons();
  actionPanelCommon.__element.style.display = "block";
  actionPanelCustom.__element.style.display = "block";
  actionPanelMessage.__element.innerHTML = "Actions on selected item";
   pj.selectCallbacks.pop();
   actionPanelLastSelection.__select('svg');
}
ui.setActionPanelForSelect = function (msg,onSelect) {
  actionPanelCommon.__element.style.display = "none";
  actionPanelCustom.__element.style.display = "none";

  actionPanelMessage.__element.innerHTML = msg;
  var el = html.Element.mk('<div style="font-size:12pt" class="colUbutton">Done Connecting</div>');
  actionPanelMessage.addChild(el);
  setClickFunction(el,ui.resumeActionPanelAfterSelect);

  pj.selectCallbacks.push(onSelect);
  nowSelectingForActionPanel = true;
  actionPanelLastSelection = pj.selectedNode;
  
 //       setClickFunction(el,action.action);
   
}

ui.setupActionPanelForCloning = function (forReplace) {
  actionPanelCommon.__element.style.display = "none";
  actionPanelCustom.__element.style.display = "none";
  actionPanelMessage.__element.innerHTML = '';  
  var el = html.Element.mk(`<div style="font-size:12pt" class="colUbutton">${forReplace?'Done Replacing  From Clone':'Done Cloning'}</div>`);
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
  var actions  = item.__actions?item.__actions():undefined;
  if (!actions  || !topActive) {
    return;
  }
  actions.forEach(function (action) {
      var el = html.Element.mk('<div class="colUbutton">'+action.title+'</div>');
      actionPanelCustom.addChild(el);
      var actionF = topActive[action.action];
      setClickFunction(el,function () {
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
    setActionPanelContents(pj.root.main.tree);
  });
 }
var installTopActions = function (item) {
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
setClickFunction(ui.showClonesAction,function () {
  var proto = Object.getPrototypeOf(pj.selectedNode);
  var inheritors = pj.inheritors(proto);
  console.log('inheritor count',inheritors.length)
  svg.highlightNodes(inheritors);
});

  

var connectorDropListener = function (e) {
  console.log('drop in action panel');
  debugger;
  e.preventDefault();
  if (ui.dragSelected.role === 'edge') {
    var el = connectorImg.__element;
    el.src = pj.storageUrl(ui.dragSelected.svg);
    var proto = ui.findPrototypeWithUrl(ui.dragSelected.url);
    if (proto) {
      ui.currentConnector = proto;
      return;
    }
    setupForInsert(ui.dragSelected,function () {
      ui.installPrototype(ui.dragSelected.id, ui.insertProto);
      ui.currentConnector = ui.insertProto;
    });
  }
}

ui.setConnector = function (url) {
  var el = connectorImg.__element;
  var fullUrl = pj.storageUrl(url);
  el.src = fullUrl;
}

ui.initConnector = function () {
  ui.setConnector("(sys)/forCatalog/arrow.svg");
  var el = actionPanel.__element;
   el.addEventListener("drop",connectorDropListener);
   el.addEventListener("dragover",(e) => {e.preventDefault();});
   
   var arrow = ui.findPrototypeWithUrl('/shape/arrow');
   ui.currentConnector = arrow;
}





/* end action section */
