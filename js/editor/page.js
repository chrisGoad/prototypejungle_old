
  
// This is one of the code files assembled into editor.version.js

var treePadding = 0;
var bkColor = "white";
var docDiv;
var minWidth = 1000;
var plusbut,minusbut;
var flatInputFont = "8pt arial";
var uiDiv,dataDiv,topbarDiv,obDivTitle;
var msgPadding = "5pt";
var inspectDom = false;
var uiWidth;
var insertKind;
ui.fitMode = false;
ui.panelMode = 'chain'; // mode of the right panel view; one of 'chain' (view the prototype chains); 'proto','insert','data','code'
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
      ui.replaceBut = html.Element.mk('<div class="ubutton">Replace</div>'),
      ui.editTextBut = html.Element.mk('<div class="ubutton">Edit Text</div>'),
     ui.viewDataBut = html.Element.mk('<div class="ubutton">Data</div>'),
     ui.addLegendBut = html.Element.mk('<div class="ubutton">Add Legend</div>'),
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
  //    tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;width:600px;padding-left:4px;float:right;border:solid thin black"/>').__addChildren([
        ui.noteSpan = html.Element.mk('<span>Click on things to adjust them. To navigate part/subpart hierarchy:</span>'),
        ui.upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
        ui.downBut =html.Element.mk('<div class="roundButton">Down</div>'),
        ui.topBut =html.Element.mk('<div class="roundButton">Top</div>')
       // ui.protoBut =html.Element.mk('<div class="roundButton">Prototypes</div>')
        ]),
        ui.svgMessageDiv = html.Element.mk('<div style="display:none;margin-left:auto;padding:40px;margin-right:auto;width:50%;margin-top:20px;border:solid thin black">AAAAUUUU</div>')
     ]),
  tree.objectContainer = uiDiv = html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"></div>').
    __addChildren([
      /*html.Element.mk('<div id="obtab" style="margin-bottom:0px;border-bottom:solid thin black">OBTAB</div>').__addChildren([
                  ui.selectedBut =html.Element.mk('<div class="roundButton">Selected Object</div>'),
                  ui.protoBut =html.Element.mk('<div class="roundButton">Prototypes</div>')
                  ]),*/
      tree.obDivRest =tree.obDiv = html.Element.mk('<div id="obDiv" style="position:absolute;background-color:white;border:solid thin blue;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px">TREE</div>'),
                //   ui.protoDiv =  html.Element.mk('<div id="protoDiv" style="display:none;position:absolute;border:solid thin blue;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>')
         

                             // obDivTitle = html.Element.mk('<span style="margin-bottom:10px;border-bottom:solid thin black">Workspace</span>')
   //]),
         
    ui.protoContainer =  html.Element.mk('<div id="protoContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').
    __addChildren([
      html.Element.mk('<div style="font-size:14pt;margin-bottom:5px">Click  in the graphics panel as many times as you like to add cloned items at the positions clicked.</div>'),
      // ui.startCloningBut =html.Element.mk('<div style = "font-size:14pt;text-align:center;margin-top:80px;mmargin-left:auto;mmargin-right:auto" class="roundButton">Done cloning</div>'),
      ui.doneCloningBut =html.Element.mk('<div style = "font-size:14pt;text-align:center;margin-top:80px;mmargin-left:auto;mmargin-right:auto" class="roundButton">Done Cloning</div>')
    ]),

    ui.dataContainer =  html.Element.mk('<div id="dataContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').
    __addChildren([
      html.Element.mk('<div style="margin-bottom:5px"></div>').__addChildren([
        ui.closeDataBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),
        ui.dataTitle = html.Element.mk('<span style="font-size:8pt;margin-left:10px;margin-right:10px">Data source:</span>'),
        ui.dataMsg =html.Element.mk('<span style="font-size:10pt">a/b/c</span>'), 
     ]),
     ui.dataError =html.Element.mk('<div style="margin-left:10px;margin-bottom:5px;color:red;font-size:10pt">Error</div>'),
      ui.dataButtons = html.Element.mk('<div id="dataButtons" style="bborder:solid thin red;"></div>').__addChildren([
         ui.changeDataSourceBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Change Source</div>'),
         ui.uploadBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Upload</div>'),
      ]),
       ui.dataDiv = html.Element.mk('<div id="dataDiv" style="border:solid thin green;position:absolute;">Data Div</div>')
    ]),
   
    
    ui.insertContainer =  html.Element.mk('<div id="insertContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px">INSERT</div>').
    __addChildren([
       /*ui.insertButtons = html.Element.mk('<div id="insertButtons" style="text-align:center;bborder:solid thin red;"></div>').
       __addChildren([
         ui.doneCloningBut =html.Element.mk('<div style = "font-size:14pt;text-align:center;margin-top:80px;mmargin-left:auto;mmargin-right:auto" class="roundButton">Done cloning</div>')
        // ui.closeInsertBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

       ]),
       
     */
      ui.insertDiv = html.Element.mk('<div id="insertDiv" style="overflow:auto;position:absolute;top:60px;height:400px;width:600px;background-color:white;bborder:solid thin black;"/>').
      __addChildren([
        ui.tabContainer = html.Element.mk('<div id="tabContainer" style="vertical-align:top;border-bottom:thin solid black;height:30px;"></div>').
        __addChildren([
            ui.insertTab = html.Element.mk('<div id="tab" style="width:80%;vertical-align:bottom;borderr:thin solid green;display:inline-block;height:30px;"></div>'),
            ui.closeInsertBut = html.Element.mk('<div style="background-color:red;display:inline-block;vertical-align:top;float:right;cursor:pointer;margin-left:0px;margin-right:1px">X</div>')
        ]),                                                                                                                                                 
        ui.insertDivCol1 = html.Element.mk('<div id="col1" style="display:inline-block;bborder:thin solid black;width:49%;"></div>'),
        ui.insertDivCol2 = html.Element.mk('<div id="col2" style="vertical-align:top;display:inline-block;bborder:thin solid black;width:49%;"></div>'),
      //   ui.catalogCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;margin-right:20px;border:thin solid green;float:right;margin-top:40px"></div>')
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
  } else if (ui.panelMode === 'data')  {
    uiWidth = pageWidth/2;
  } else {
    docwd = 0;
    uiWidth = 0.25 * pageWidth;
    svgwd = 0.75 * pageWidth;
  }
  svgwd = pageWidth - docwd - uiWidth;
  //ui.uiWidth  = uiWidth; //debugging
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
  var panelHeaderHt = 26; // the area above the object/code/data/component panels 
  var treeHt = svght;
  tree.myWidth = treeInnerWidth;
  var tabsTop = "20px";
  tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:((treeHt-20)+"px"),top:"20px",left:"0px"});
  ui.protoContainer.$css({width:(treeInnerWidth   + "px"),height:((treeHt-20)+"px"),top:"20px",left:"0px"});
  ui.svgDiv.$css({id:"svgdiv",left:docwd+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
  ui.svgHt = svght;
  ui.dataContainer.setVisibility(ui.panelMode === 'data');
  tree.obDiv.setVisibility(ui.panelMode=== 'chain');
  ui.insertContainer.setVisibility(ui.panelMode === 'insert');
  ui.protoContainer.setVisibility(ui.panelMode === 'proto');
  uiDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")});

  if (ui.panelMode === 'data') {
    //ui.dataContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.dataContainer.$css({top:"0px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.dataDiv.$css({top:"80px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-80)+"px"});
  } else if (ui.panelMode === 'insert') {
    //ui.insertContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.insertContainer.$css({top:"0px",left:0+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.insertDiv.$css({top:"0px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
  } else if (ui.panelMode === 'chain') {
    //obDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")});
  } else if (ui.panelMode === 'proto') {
    //ui.protoDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")});
  }
  docDiv.$css({left:"0px",width:docwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
  svg.main.resize(svgwd,svght); 
   svg.main.positionButtons(svgwd);
   var noteWidth = Math.min(svgwd-40,570);
   var noteLeft = 0.5 * (svgwd - 40 - noteWidth);
   tree.noteDiv.$css({left:noteLeft+"px",width:noteWidth +"px"});
   if ((ui.panelMode === 'data') && ui.dataDivContainsData) {
    ui.viewData();
   }
   if (firstLayout) {
     firstLayout = false; 
     ui.layout(noDraw);
   }
}


ui.uploadBut.$click(function () {
  ui.dataDivContainsData = false;
  ui.dataDiv.$html('<iframe width = "100%" height="100%" src="/upload.html"></iframe>');
});
  
ui.changeDataSourceBut.$click(function () {
   fb.getDirectory(function (err,list) {
     popChooser(list,'dataSource');
  });
})
  
    
    
setClickFunction(ui.viewDataBut,function () {
  debugger;
  ui.hideFilePulldown();
  var ds = dat.selectedDataSource();
  if (ds) {
    ui.dataTitle.$html('Data source:');
    var url = ds[1];
    dataUrl = url;
    var afterFetch = function (erm,data) {
      ui.viewData(data);
      ui.viewDataUrl();
    }
    ui.getData(url,afterFetch);
  }
});

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
    
var loadAndViewData = function (path) {
  debugger;
   ui.getData(path,function (erm,data) {
    debugger;
    viewAndUpdateFromData(data,path);
    ui.dataMsg.$html(path);
  });
}
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
    case "dataSource":
     debugger;
      var path = v.path;
      loadAndViewData(path);
      break;
  }
}
   
var popChooser = function(keys,operation) {
  //if (operation === 'saveAsSvg') {
    //ui.aspectRatio = svg.main.aspectRatio();
  //  ui.aspectRatio = 1;
  //}
  ui.chooserKeys = keys; // this is where the chooser gets its data
  ui.chooserMode = operation;
  //ui.chooserMode = 'open';
  if (mpg.lightbox) {
    mpg.lightbox.dismiss();
  }
  var lb = mpg.chooser_lightbox;
  var src = '/chooser.html';//(pj.devVersion)?"/chooserd.html":"/chooser.html";
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
        
//var fselJQ;
 
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
  debugger;
  if (!itemSource) {
    return undefined;
  }
  var uid = fb.currentUser.uid;
  var owner = pj.uidOfUrl(itemSource);
  var secondSlash = itemSource.indexOf('/',1);
  //var owner = itemSource.substring(1,secondSlash);
  if (uid !== owner) {
    return undefined;
  }
  var path = pj.pathOfUrl(itemSource);//itemSource.substring(secondSlash+2); // +2 because there's a /s/ before the path
  return path;
 
}

var setFselDisabled = function () {
   // ui.setPermissions();
   if (!fsel.disabled) {
      fsel.disabled = {};
   }
   var disabled = fsel.disabled;
   disabled.new = disabled.insertOwn = disabled.save = disabled.saveAs = disabled.saveAsSvg  = !fb.currentUser;
   if (!ui.source) {
     disabled.save = true;
    //code
   } else {
    ui.itemPath = ownedItemPath(ui.source);
    disabled.save = !ui.itemPath;
   }
    //fsel.disabled.editText =  !ui.textSelected();
   //fsel.disabled.addLegend = !ui.designatedChart();
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
      var chartsPage = ui.useMinified?"/charts":"/chartsd";
      location.href = chartsPage;
      break;
    case "addTitle":
      ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title');
      break;
    case "save":
      debugger;
      resaveItem();
      break;

    case "addLegend":
      debugger;
      //ui.addTitleAndLegend();
      ui.updateLegend('add');
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
 /* case "insertShape":
    ui.popInserts('shapes');
    break;
  case "insertChart":
    ui.popInserts('charts');
    break;
    */
  }
}
 
setClickFunction(ui.fileBut,function () {
  debugger;
  setFselDisabled();
  dom.popFromButton("file",ui.fileBut,fsel.domEl);
});

/* end file options section */

/* start legend section */
 
var aboveOffset = geom.Point.mk(20,-10);
var toRightOffset = geom.Point.mk(20,10);

var updateLegend1 = function (legend,chart) {
  var itmBounds;
  debugger;
  var chartBounds = chart.__bounds(pj.root);
  var bindChart = function (x) {
    x.forChart = chart;
    chart.__legend = x;
    x.__newData = true;
    x.__update();
    return x.__bounds();   
  }
  if (legend) {
    legend.__show();
    itmBounds = bindChart(legend); 
    var toRight = chartBounds.upperRight().plus(
                  geom.Point.mk(0.5*itmBounds.extent.x,0.5*itmBounds.extent.y)).plus(toRightOffset);
    legend.__moveto(toRight);
    legend.setColorsFromChart();
  }
}


var addLegend  = function () {
  debugger;
  var  ds = dat.selectedDataSource();
  var chart = ds[0];
  
  var chartBounds = chart.__bounds(pj.root);
 // svg.showRectangle(chartBounds);
  // todo deal with errors
  var installLegend = function (proto) {
    var nm = pj.autoname(pj.root,'legend');
    var legend = pj.root.set(nm,proto.instantiate());
    updateLegend1(legend,chart);
    disableButton(ui.addLegendBut);
  }
  var legendUrl = '/chart/component/legend3.js';
  var legendProto = pj.installedItems[legendUrl];
  if (legendProto) {
    installLegend(legendProto);
  } else {
    pj.install(legendUrl,function (erm,rs) {
      installLegend(rs);
    });
  }
}

ui.addLegendBut.$click(addLegend);

/* end legend section*/      
/* begin insert section */


ui.theInserts = {};


var idForInsert;//,positionForInsert;
var dataForInsert;
var dataUrlForInsert;
var insertAsPrototype;// = 1
var replaceRole;
var spreadForReplacement;
var replaceContainer;
var minExtent = 10;
var insertSettings;

var clearInsertVars = function () {
  idForInsert = dataForInsert = dataUrlForInsert = replaceRole =
    spreadForReplacement = replaceContainer  = insertSettings = undefined;
}
/* called from ui module */

ui.finalizeInsert = function (stateOrPoint) {
  debugger;
  var data = dataForInsert;
  var url = dataUrlForInsert;
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
  //if (insertSettings) {
  //  rs.set(insertSettings);
  //}
  var anm = pj.autoname(pj.root,idForInsert);
  rs.__unhide();
  pj.root.set(anm,rs);
  pj.log('install','Adding ',anm);
  rs.__draw();
  if (data) {
    var erm = ui.setDataFromExternalSource(rs,data,url);
  } else {
    if (ui.nowCloning && (rs.__updateClone)) {
      rs.__updateClone();
    } else {
      rs.__update();
    }
  }
  debugger;
 // rs.__show();
  if (!atPoint) {
    var resizee = ui.insertProto.__cloneResizable?rs:ui.insertProto;
    resizee.__setExtent(bnds.extent,stateOrPoint.ordered);
    rs.__update();
  }
  rs.__moveto(center);
  rs.__show();
  if (!ui.nowCloning) {
    if (1 || ui.insertingText) {
      rs.__select('svg');
    }
    //popTextEdit();
    doneInserting();
  }
  enableButtons();

}

// ui.insertProto is available for successive inserts; prepare for the insert operations

var disableAllButtons;

// proto 
var setupForInsertCommon = function (proto) {
  debugger;
  if (replaceRole) {
    //alert(' relplacing '+replaceRole);
    if (spreadForReplacement) {
      doSpreadReplacement(spreadForReplacement,ui.insertProto);
    } else {
      doReplacement(replaceContainer,ui.insertProto.instantiate());
    }
    return;
  }
  //if (insertAsPrototype) {
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
  // a "representative" of each prototype is added for the cloning interface
 
  //var repName = pj.autoname(pj.root,idForInsert+'Rep');
  //dom.removeDom(ui.insertProto);

 // svg.main.__element.style.cursor = "crosshair";
  ui.resizable = (!!(ui.insertProto.__setExtent) && !ui.insertProto.__donotResizeOnInsert);
  ui.resizeAspectRatio = ui.insertProto.__aspectRatio; // if a fixed aspect ratio is wanted (eg 1 for circle or square)
  svg.main.__element.style.cursor = ui.resizable?"crosshair":"cell";

  //ui.resizeAspectRatio = 1;
  ui.nowInserting = true;
  disableAllButtons()
}
// for the case where the insert needed loading
var afterInsertLoaded = function (e,rs) {
  //ui.insertProto = insertAsPrototype?rs.instantiate():rs;
  ui.theInserts[ui.insertPath] = rs;
  if (dataUrlForInsert) {
    ui.getData(dataUrlForInsert,function (erm,data) {
      dataForInsert = data;
      setupForInsertCommon(rs);
    });
  } else {
     setupForInsertCommon(rs);
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
  //newItem.__newData = true;
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

ui.arrangeReps = function () {
  debugger;
  var reps = [];
  //var bnds = [];
  var widths = [];
  var heights = [];
  pj.forEachTreeProperty(pj.root.representatives,function (child) {
    reps.push(child);
    child.__show();
    var bnds = child.__bounds();
    child.__width = bnds.extent.x;
    child.__height = bnds.extent.y;
  });
  var ln = reps.length;
  if (ln < 2) {
    return;
  }
  reps.sort(function (itm0,itm1) {
    return itm0.__width<itm1.__width?-1:1;
  });
  var spacing = reps[0].__width/4;
  var width = reps[0].__width + spacing +  reps[ln-1].__width + 0.1;
  var cx = 0;
  var cy = 0;
  var row = [];
  var rh = 0; //current row height
  var arrangeRow = function () {
    var rx = 0;
    row.forEach(function (rep) {
      var w = rep.__width;
      rep.__moveto(rx+w/2,cy+rh/2);
      rx += w+spacing;;
    })
  }
  reps.forEach(function (rep) {
    var w = rep.__width;
    var h = rep.__height;
    //var x = cx + w/2;
    //var y = cy + h/2;
    //rep.__moveto(x,y);
    cx += w;
    if (cx > width) {
      arrangeRow();
      cy += spacing + rh;
      row = [];
      rh = 0;
    }
    rh = Math.max(h,rh);
    row.push(rep);
  });
  arrangeRow();
}

var dontHideForCloning = {'representatives':1,'__controlBoxes':1};

var selectPrototypeToClone = function () {
  ui.arrangeReps();
   pj.forEachTreeProperty(pj.root,function (child) {
    if (svg.Element.isPrototypeOf(child) && !(dontHideForCloning[child.__name]))  {
      child.__hide();
    }
  });
   ui.unselect();
  svg.main.fitContents();
  ui.panelMode = 'proto';
  ui.layout();
}

var setupForClone = function () {
 
  if (pj.selectedNode) {
    ui.insertProto = Object.getPrototypeOf(pj.selectedNode);
    idForInsert  = pj.selectedNode.__name;
  }
   ui.panelMode = 'proto';
  ui.layout();
  //ui.insertProto = proto;
  //var protofied = protofy(pj.selectedNode);
 // ui.unselect();
 // ui.insertDiv.$hide();
 // ui.insertButtons.$show();
   //ui.doneInsertingBut.$show();

    //  ui.insertContainer =  html.Element.mk('<div id="insertContainer" style="border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([

  ui.resizable = ui.insertProto.__cloneResizable && ui.insertProto.__setExtent;
 // alert('resizable',ui.resizable);
  //if (resizable) {
  //ui.nowInserting = true;
  ui.nowCloning = true;
  //} else {
  //  ui.nowCloning = true;
  //}
  svg.main.__element.style.cursor = "crosshair";
  //popInsertPanelForCloning();
  disableAllButtons();
//setupForInsertCommon();
}
//ui.insertButtons
//setClickFunction(ui.cloneBut,setupForClone);

//ui.insertItem = function (path,where,position,kind,cb) {
var setupForInsert= function (catalogEntry,cb) {
  debugger;
  //path,where,settings,data,cb) { //position,kind,cb) {
  //clearInsertVars();
  var path = catalogEntry.url;
  idForInsert = catalogEntry.id;
  dataUrlForInsert = catalogEntry.data;
  dataForInsert = undefined;
  insertSettings = catalogEntry.settings;
  //replaceRole = catalogEntry.role;
  ui.insertingText = catalogEntry.isText;
  var ins = ui.theInserts[path];// already loaded?
  if (ins) {    
   // ui.insertProto = insertAsPrototype?ins.instantiate():ins;
    setupForInsertCommon(ins);
    if (cb) {
      cb();
    }
    return;
  }
  ui.insertPath = path;
  //insertKind = kind;
  //positionForInsert = position;
  pj.install(path,function (erm,rs) {
    debugger;
    afterInsertLoaded(erm,rs);
    if (cb) {cb()}
  });
}



var selectedForInsert;
var catalogState;

var popInserts= function () {
  selectedForInsert = undefined;
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.insertDiv.$show();
  //ui.insertButtons.$hide();
   //ui.doneInsertingBut.$hide();
 //  ui.insertButtons.$hide();

  pj.catalog.getAndShow({role:null,tabsDiv:ui.insertTab.__element,
                        cols:[ui.insertDivCol1.__element,ui.insertDivCol2.__element],catalogUrl:ui.catalogUrl,
    whenClick:function (selected) {
      debugger;
      selectedForInsert = selected;
      replaceRole = undefined; // we're not replacing
      setupForInsert(selectedForInsert);//,position,kind,cb);

    //  ui.insertInput.$prop("value",selected.id);
    },
    callback:function (error,catState) {
      debugger;
      catalogState = catState;
    }});
}

setClickFunction(ui.insertBut,popInserts);

var closeSidePanel = function () {
  debugger;
  if (ui.panelMode === 'chain')  {
    return;
  }
  ui.panelMode = 'chain';
  ui.layout();
}


var doneInserting = function () {
  debugger;
  svg.main.__element.style.cursor = "";
  if (ui.controlRect) {
    ui.controlRect.__hide();
  }
  if (ui.nowInserting) {
    pj.catalog.unselectElements(catalogState);
  //ui.doneInsertingBut.$hide();
   // ui.insertButtons.$hide();
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

ui.deleteBut.$click(function () {
  var selnode = pj.selectedNode;
  ui.unselect();
  selnode.remove();
  pj.root.__draw();
});
/* start buttons section */
activateTreeClimbButtons();
var allButtons = [ui.fileBut,ui.insertBut,ui.cloneBut,ui.replaceBut,ui.editTextBut,ui.viewDataBut,ui.addLegendBut,ui.deleteBut];

disableAllButtons = function () {
  allButtons.forEach(disableButton);
}
var getSpreadForReplacement;


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
  var ds = dat.selectedDataSource();
  if (ds && (ds !== 'multiple')) {
    if (ds[0].__legend) {
      disableButton(ui.addLegendBut);
    }
  } else {
    disableButton(ui.viewDataBut);
    disableButton(ui.addLegendBut);
  }
  /*if (pj.selectedNode) {
    enableButton1(ui.cloneBut,pj.selectedNode.__cloneable);
  }  else if  (ui.selectedTopProto) {
    enableButton1(ui.cloneBut,ui.selectedTopProto.__cloneable);
  } else {
    disableButton(ui.cloneBut);
  }*/
  if (pj.selectedNode) {
    if (!deleteable(pj.selectedNode)) {
      disableButton(ui.deleteBut);
    }
    if (!(getSpreadForReplacement()||getReplaceContainer())) {
      disableButton(ui.replaceBut);
    }
  } else {
    disableButton(ui.replaceBut);
    disableButton(ui.deleteBut);
  }
}
pj.selectCallbacks.push(enableButtons);
pj.unselectCallbacks.push(enableButtons);
/*
var insertOwn = function (v) {
  ui.insertItem('/'+v.path,v.where);
}
*/


  
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

/*  
ui.elementsToHideOnError = [];
  // a prototype for the divs that hold elements of the prototype chain
ui.errorDiv =  html.wrap('error','div');
ui.elementsToHideOnError.push(cols);
ui.elementsToHideOnError.push(actionDiv);
ui.elementsToHideOnError.push(docDiv);
*/
//tree.obDiv.click = function () {dom.unpop();};
  
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
  //var isJs = pj.endsIn(path,'.js');
  //if (isJs) {
  var pjUrl = '['+fb.currentUid()+']'+path;
  //}
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
      //var loc = '/svg.html?svg='+encodeURIComponent(path);
      var loc = '/svg.html?source='+pjUrl;
    } else {
      var loc = '/edit.html?source='+pjUrl;//(pj.devVersion?'/editd.html':'/edit.html')+'?item=/'+path;
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



/* begin replace section */
var replaceSettings;

var doSpreadReplacement = function (spread,newMark) {
  debugger;
  var imark = newMark.instantiate();
  if (replaceSettings) {
    imark.set(replaceSettings);
  }
  imark.__hide();
  spread.replacePrototype(imark);
}

var doReplacement = function (container,replacement) {
  debugger;
  container.__replacer(replacement);
}

/*
ui.replaceItem = function (path,settings) {
  installSettings = settings;
  pj.install(path,doReplacement);
}
*/


/*
var repDiv = html.Element.mk('<div style="displayy:inline-block"/>');
repDiv.set('img',html.Element.mk('<img width="150"/>'));
repDiv.set('txt',html.Element.mk('<div style="text-align:center">TXT</div>')); 
*
/* end replacement section */


//pj.getAndShowCatalog = function (col1,col2,imageWidthFactor,catalogUrl,whenClick,cb) {
var getReplaceContainer = function () {
  if (pj.selectedNode) {
    return pj.ancestorWithProperty(pj.selectedNode,'__replacementRole');
  } 
}

var getSpreadForReplacement = function () {
  if (pj.selectedNode) {
    var spread = pj.ancestorThatInheritsFrom(pj.selectedNode,pj.Spread);
    if (spread && spread.__role) {
      return spread;
    }
  }
}

setClickFunction(ui.replaceBut,function () {
  debugger;
  spreadForReplacement = getSpreadForReplacement();
  //ar role = ui.getRole(pj.selectedNode);
  if (spreadForReplacement) {
    var role = spreadForReplacement.__role;
  } else {
    replaceContainer = getReplaceContainer();
    if (replaceContainer) {
      role = replaceContainer.__replacementRole;
    } else {
      return;
    }
  }
  ui.hideFilePulldown(); 
  ui.panelMode = 'insert';
  ui.layout();
  pj.catalog.getAndShow(role,ui.insertTab.__element,[ui.insertDivCol1.__element,ui.insertDivCol2.__element],ui.catalogUrl,
    function (selected) {
      debugger;
      selectedForInsert = selected;
      replaceRole = role;//selected.role;
      replaceSettings = selected.settings;
      setupForInsert(selectedForInsert);//,position,kind,cb);

    //  ui.insertInput.$prop("value",selected.id);
  });
});
/* end Replacement section */



ui.closeDataBut.$click(closeSidePanel);


 


//ui.closeReplaceBut.$click(ui.closeSidePanel);


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

//pj.zz = 'acc \\'+'u0398 uv '+'\\'+'u0399 x';

editTextDone.$click(function () {
  var ival = editTextArea.$prop("value");
  var val = encodeUnicode(ival);
  //val = '\u0398';
  var textBox = selectedTextBox();
  textBox.__setText(val);
  textBox.update();
  textBox.__draw();
  mpg.textedit_lightbox.dismiss();

  debugger;
   ui.updateControlBoxes();
 //   inf.$attr("value",vts);

    
});


var editTextDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="editTextDivDiv" />').__addChildren([
  editTextArea,
  html.Element.mk('<div/>').__addChildren([editTextDone])
]);

//var editTextDiv = html.Element.mk('<div style="position:relative;width:100;height:500"  id="editTextDivDiv" />');//.__addChildren([

var texteditBeenPopped = false;

var popTextEdit = function () {
  debugger;
  var textBox = selectedTextBox();
  var val = textBox.__getText();

  //mpg.textedit_lightbox.pop();
 // mpg.chooser_lightbox.pop();
  debugger;
  if (!texteditBeenPopped) mpg.textedit_lightbox.setContent(editTextDiv);
  mpg.textedit_lightbox.pop(undefined,300);
  editTextArea.$prop('value',val);

  //editTextArea.$prop("value",val==='Text not yet set'?'':val);
  texteditBeenPopped = true;
  return;
}
setClickFunction(ui.editTextBut,popTextEdit);

ui.setSaved = function () {} //@todo implement this
/*end edit text section */
//var editor;

var selectedProtoLine;

var selectedProtoLineColor = "rgba(255,0,0,0.2)"
var mkProtoLine = function (el,proto) {
 // var el  =html.Element.mk('<div style="border:solid thin red;width:100%">'+proto.__name+'</div>');
  el.addEventListener("mouseover",function (e) {
    var inheritors;
    el.$css({"background-color":"rgba(0,100,255,0.2)"});
   
    if (!ui.selectedTopProto) {
      var inheritors = pj.inheritors(proto,function (x) {
       return x.__get("__element");
      });
     svg.highlightNodes(inheritors);
    }
  });
  el.addEventListener("mouseout",function (e) {
    el.$css({"background-color":(el === selectedProtoLine)?selectedProtoLineColor:"white"});
    if (!ui.selectedTopProto) {
      svg.unhighlight();
    }
  });
  el.addEventListener("mousedown",function (e) {
    debugger;
    ui.protoLines.forEach(function (el) {
      el.$css({"background-color":"white"});
    })
    el.$css({"background-color":selectedProtoLineColor});
  
    selectedProtoLine = el;
    var idx = ui.protoLines.indexOf(el);
    ui.selectedTopProto = ui.topProtos[idx]
    svg.unhighlight();

    var inheritors = pj.inheritors(ui.selectedTopProto,function (x) {
      return x.__get("__element");
    });
    svg.highlightNodes(inheritors);
   // ui.insertProto = ui.selectedTopProto;
   // idForInsert = 'foob'
    setupForClone(ui.selectedTopProto);
    //enableButtons();
    
  });

  return el;
}


var findTopProtos = function () {
  var rs = [];
  pj.forEachTreeProperty(pj.root,function (node) {
    if (node.__get('__topProto')) {
      rs.push(node);
    }
  });
  ui.topProtos = rs;
  return rs;
}

var addProtoLines = function () {
  ui.protoLines = [];
  var topP = findTopProtos();
  ui.protoDiv.$empty();
  if (pj.selectedNode) {
    var selectedProto = Object.getPrototypeOf(pj.selectedNode);
  }
  
  topP.forEach(function (proto) {
    var name = proto===selectedProto?proto.__name +' (selected object)':proto.__name;
    var el  =html.Element.mk('<div style="border:solid thin red;width:100%">'+name+'</div>');
    mkProtoLine(el,proto);
    ui.protoLines.push(el);
    ui.protoDiv.addChild(el);
  });
}

var toProtoPanel = function () {
  ui.selectedTopProto = undefined;
  ui.panelMode = 'proto';
    addProtoLines();
    ui.layout();
}

var toObjectPanel = function () {
  ui.panelMode = 'chain';
  ui.layout();
}

//setClickFunction (ui.protoBut,toProtoPanel);

//setClickFunction (ui.cloneBut,toProtoPanel);
//setClickFunction (ui.cloneBut,selectPrototypeToClone);
setClickFunction (ui.cloneBut,setupForClone);

  
//setClickFunction (ui.selectedBut,closeSidePanel);

  

