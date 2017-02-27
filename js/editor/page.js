
// This is one of the code files assembled into editor.version.js

var treePadding = 0;
var bkColor = "white";
var docDiv;
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
ui.saveDisabled = false; // true if a build no save has been executed.

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
     ui.insertBut = html.Element.mk('<div class="ubutton">Insert</div>'),
     ui.cloneBut = html.Element.mk('<div class="ubutton">Clone</div>'),
     ui.editTextBut = html.Element.mk('<div class="ubutton">Edit Text</div>'),
     ui.deleteBut = html.Element.mk('<div class="ubutton">Delete</div>'),
     ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')
    ]),
    ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
  ]),

  cols = html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').
  __addChildren([
    
    ui.docDiv = docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
    
    ui.svgDiv = html.Element.mk('<div id="svgDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').
    __addChildren([
      tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').__addChildren([
        ui.noteSpan = html.Element.mk('<span>Click on things to adjust them. To navigate part/subpart hierarchy:</span>'),
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
        ui.tabContainer = html.Element.mk('<div id="tabContainer" style="vertical-align:top;border-bottom:thin solid black;height:30px;"></div>').
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
  
  
ui.intro = false;
   
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = true;
ui.layout = function(noDraw) { // in the initialization phase, it is not yet time to __draw, and adjust the transform
  // aspect ratio of the UI
  var bkg = "white";
  var svgwd = 500;
  var svght = 500;
  var ar = 0.48//0.5;
  var pdw = 0;// minimum padding on sides
  var wpad = 0;
  var vpad = 0;//minimum sum of padding on top and bottom
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
  if (ui.includeDoc) {
    var docTop = pageHeight * 0.8 - 20;
    var docHeight = awinht - pageHeight - 30;
  }
  var  twtp = 2*treePadding;
  var actionWidth  = 0.5 * pageWidth;
  var docwd = 0;
  if (ui.intro) {
    var docwd = 0.25 * pageWidth;
    uiWidth = 0.25 * pageWidth;
  } else if (ui.panelMode === 'insert') {
    docwd = 0;
    uiWidth = pageWidth/3;
  } else {
    docwd = 0;
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
  var actionLeft = ui.includeDoc?docwd +10 + "px":"150px";
  actionDiv.$css({width:(actionWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
  var actionHt = actionDiv.__element.offsetHeight;//+(isTopNote?25:0);
  topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px","padding-top":"10px"});
  var svght = pageHeight - actionHt -0;
  var panelHeaderHt = 26; // the area above the object/code/component panels 
  var treeHt = svght;
  tree.myWidth = treeInnerWidth;
  var tabsTop = "20px";
  tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:((treeHt-20)+"px"),top:"20px",left:"0px"});
  ui.protoContainer.$css({width:(treeInnerWidth   + "px"),height:((treeHt-20)+"px"),top:"20px",left:"0px"});
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
  debugger;
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
      debugger;
      if (v.deleteRequested) {
        debugger;
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

// if the current item has been loaded from an item file (in which case ui.itemSource will be defined),
// this checks whether it is owned by the current user, and, if so, returns its path
var ownedItemPath = function (itemSource) {
  if (!itemSource) {
    return undefined;
  }
  var uid = fb.currentUser.uid;
  var owner = pj.uidOfUrl(itemSource);
  var secondSlash = itemSource.indexOf('/',1);
  if (uid !== owner) {
    return undefined;
  }
  var path = pj.pathOfUrl(itemSource);
  return path;
}

var setFselDisabled = function () {
   if (!fsel.disabled) {
      fsel.disabled = {};
   }
   var disabled = fsel.disabled;
   disabled.new = disabled.insertOwn = disabled.save = disabled.saveAs = disabled.saveAsSvg  = !fb.currentUser;
   if (!ui.source) {
     disabled.save = true;
   } else {
    ui.itemPath = ownedItemPath(ui.source);
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
      debugger;
      resaveItem();
      break;

    case "viewSource":
      ui.viewSource();
      break;
    case "open":
    case "insert":
    case "saveAs":
    case "saveAsSvg":
      fb.getDirectory(function (err,list) {
        popChooser(list,opt);
      });
      break;
  }
}
 
setClickFunction(ui.fileBut,function () {
  debugger;
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

var insertLastStep = function (stateOrPoint) {
  var atPoint = geom.Point.isPrototypeOf(stateOrPoint);
  var center,bnds;
  if (atPoint) {
    center = stateOrPoint;
  } else {
    var bnds = stateOrPoint.rect;
    var extent = bnds.extent;      //code
    if ((extent.width < 10)|| (extent.height < 10)) {
      // todo: display a messge
      return;
    }
    var center = bnds.center();
  }
  var  rs = ui.insertProto.instantiate();
  var anm = pj.autoname(pj.root,idForInsert);
  rs.__unhide();
  pj.root.set(anm,rs);
  pj.log('install','Adding ',anm);
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
  if (atPoint  && !ui.nowCloning) {
    var resizeBounds = defaultSize;
  }
  if (!atPoint) {
    resizeBounds = bnds.extent;
    var ordered = stateOrPoint.ordered;  // ordered.x  ordered.y describes the direction of drag
  }
  if (resizeBounds) {
    var resizee = ui.insertProto.__cloneResizable?rs:ui.insertProto;
    if ((Math.abs(resizeBounds.x) < 15) || (Math.abs(resizeBounds) < 15)) {
      resizeBounds = defaultSize;
    }
    resizee.__setExtent(resizeBounds,ordered);
    rs.__update();
  }
  rs.__moveto(center);
  rs.__show();
  if (!ui.nowCloning) {
    if (1 || ui.insertingText) {
      rs.__select('svg');
    }
    doneInserting();
  }
  enableButtons();

}

ui.finalizeInsert = function (stateOrPoint) {
  if (ui.nowCloning) {
     insertLastStep(stateOrPoint);
  } else {
    setupForInsert(selectedForInsert,function () {
      insertLastStep(stateOrPoint);
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
  ui.resizable = (!!(ui.insertProto.__setExtent) && !ui.insertProto.__donotResizeOnInsert);
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
var resizable = true;

var setupForClone = function () {
 
  if (pj.selectedNode) {
    ui.insertProto = Object.getPrototypeOf(pj.selectedNode);
    idForInsert  = pj.selectedNode.__name;
  }  
  ui.panelMode = 'proto';
  ui.layout();
  ui.resizable = ui.insertProto.__cloneResizable && ui.insertProto.__setExtent;
  ui.nowCloning = true;
  svg.main.__element.style.cursor = "crosshair";
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

var catalogState;

var popInserts= function () {
  selectedForInsert = undefined;
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.insertDiv.$show();
  pj.catalog.getAndShow({role:null,tabsDiv:ui.insertTab.__element,
                        cols:[ui.insertDivCol1.__element,ui.insertDivCol2.__element],catalogUrl:ui.catalogUrl,
    whenClick:function (selected) {
      selectedForInsert = selected;
      ui.nowInserting = true;
      disableAllButtons();
      var selResizable = selected.resizable?$.trim(selected.resizable):null;
      ui.resizable = selResizable && (selResizable !== 'false') && (selResizable !== '0');
      svg.main.__element.style.cursor = ui.resizable?"crosshair":"cell";
    },
    callback:function (error,catState) {
      catalogState = catState;
    }});
}

setClickFunction(ui.insertBut,popInserts);

var closeSidePanel = function () {
  if (ui.panelMode === 'chain')  {
    return;
  }
  ui.panelMode = 'chain';
  ui.layout();
}


var doneInserting = function () {
  svg.main.__element.style.cursor = "";
  if (ui.controlRect) {
    ui.controlRect.__hide();
  }
  if (ui.nowInserting) {
    pj.catalog.unselectElements(catalogState);
    ui.insertDiv.$show();
  }

  closeSidePanel();
  ui.nowInserting = false;
  ui.nowCloning = false;

  enableButtons();
}

ui.doneCloningBut.$click(doneInserting);
ui.closeInsertBut.$click(doneInserting);

/* end insert section */

/* start buttons section */

ui.deleteBut.$click(function () {
  var selnode = pj.selectedNode;
  ui.unselect();
  selnode.remove();
  pj.root.__draw();
});

activateTreeClimbButtons();
var allButtons = [ui.fileBut,ui.insertBut,ui.cloneBut,ui.editTextBut,ui.deleteBut];

disableAllButtons = function () {
  allButtons.forEach(disableButton);
}

var deleteable = function (x) {
  if (!x.__sourceUrl) {
    return false;
  }
  var px = x.__parent;
  var ans = pj.ancestorWithProperty(px,'__sourceUrl');
  return !ans;
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
  var pjUrl = '['+fb.currentUid()+']'+path;
  ui.unselect();
  pj.saveItem(path,code?code:pj.root,function (err,path) {
    // todo deal with failure
    debugger;
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
      var loc = '/edit.html?source='+pjUrl;
    }
    location.href = loc;

  },aspectRatio);
}


resaveItem = function () {
  debugger;
  var doneSaving = function () {
    ui.displayMessage(ui.messageElement,'Done saving...');
    window.setTimeout(function () {ui.messageElement.$hide()},1500);
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
  debugger;
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

ui.setSaved = function () {} //@todo implement this
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
//ui.codeEditorButton.addEventListener('click', function () {
 //alert(123);
//});
//}
