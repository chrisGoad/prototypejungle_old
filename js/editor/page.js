
  
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
ui.panelMode = 'chain'; // mode of the right panel view; one of 'chain' (view the prototype chains);'insert','data','code'
var unpackedUrl,unbuiltMsg;
ui.saveDisabled = false; // true if a build no save has been executed.

var buttonSpacing = "10px";
var buttonSpacingStyle = "margin-left:10px";
 var jqp = pj.jqPrototypes;
 // the page structure
var mainTitleDiv = html.wrap('mainTitle','div');
  var test=html.Element.mk('<div class="roundButton">Top</div>');

var actionDiv,cols;

var mpg = ui.mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).__addChildren([
  topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",height:"10px",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).__addChildren([
    
  actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').__addChildren([
      ui.fileBut = html.Element.mk('<div class="ubutton">File</div>'),
     ui.insertBut = html.Element.mk('<div class="ubutton">Insert</div>'),
     ui.cloneBut = html.Element.mk('<div class="ubutton">Clone</div>'),
      ui.replaceBut = html.Element.mk('<div class="ubutton">Replace</div>'),
      ui.editTextBut = html.Element.mk('<div class="ubutton">Edit Text</div>'),
     ui.viewDataBut = html.Element.mk('<div class="ubutton">View/Change Data</div>'),
     ui.addLegendBut = html.Element.mk('<div class="ubutton">Add Legend</div>'),
      ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')
    ]),
    ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
  ]),

  cols = html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').__addChildren([
    
    ui.docDiv = docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
    
    ui.svgDiv = html.Element.mk('<div id="svgDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').__addChildren([
      tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').__addChildren([
  //    tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;width:600px;padding-left:4px;float:right;border:solid thin black"/>').__addChildren([
        ui.noteSpan = html.Element.mk('<span>Click on things to adjust them. To navigate part/subpart hierarchy:</span>'),
        ui.upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
        ui.downBut =html.Element.mk('<div class="roundButton">Down</div>'),
        ui.topBut =html.Element.mk('<div class="roundButton">Top</div>')
        ]),
        ui.svgMessageDiv = html.Element.mk('<div style="display:none;margin-left:auto;padding:40px;margin-right:auto;width:50%;margin-top:20px;border:solid thin black">AAAAUUUU</div>')
     ]),
    
     tree.objectContainer = uiDiv = html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"/>').__addChildren([
       tree.obDivRest = tree.obDiv = html.Element.mk('<div id="obDiv" style="position:absolute;background-color:white;border:solid thin blue;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>').__addChildren([
         html.Element.mk('<div style="margin-bottom:0px;border-bottom:solid thin black"/>').__addChildren([
                              obDivTitle = html.Element.mk('<span style="margin-bottom:10px;border-bottom:solid thin black">Workspace</span>')
        ]),
      ])
    ]),
     
    ui.dataContainer =  html.Element.mk('<div id="dataContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([
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
   
    
    ui.insertContainer =  html.Element.mk('<div id="insertContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([
       ui.insertButtons = html.Element.mk('<div id="insertButtons" style="text-align:center;bborder:solid thin red;"></div>').__addChildren([
         ui.doneInsertingBut =html.Element.mk('<div style = "font-size:14pt;text-align:center;margin-top:80px;mmargin-left:auto;mmargin-right:auto" class="roundButton">Done cloning</div>')
        // ui.closeInsertBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

       ]),
       
     
       ui.insertDiv = html.Element.mk('<div id="insertDiv" style="overflow:auto;position:absolute;top:60px;height:400px;width:600px;background-color:white;bborder:solid thin black;"/>').__addChildren([
        ui.tabContainer = html.Element.mk('<div id="tabContainer" style="vertical-align:top;border-bottom:thin solid black;height:30px;"></div>').__addChildren([
            ui.insertTab = html.Element.mk('<div id="tab" style="width:80%;vertical-align:bottom;borderr:thin solid green;display:inline-block;height:30px;"></div>'),
            ui.closeInsertBut = html.Element.mk('<div style="background-color:red;display:inline-block;vertical-align:top;float:right;cursor:pointer;margin-left:0px;margin-right:1px">X</div>')
        ]),                                                                                                                                                 
        ui.insertDivCol1 = html.Element.mk('<div id="col1" style="display:inline-block;bborder:thin solid black;width:49%;"></div>'),
        ui.insertDivCol2 = html.Element.mk('<div id="col2" style="vertical-align:top;display:inline-block;bborder:thin solid black;width:49%;"></div>'),
      //   ui.catalogCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;margin-right:20px;border:thin solid green;float:right;margin-top:40px"></div>')
    ]),
      

    ])
     /* ui.replaceContainer =  html.Element.mk('<div id="replaceContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([
      ui.replaceButtons = html.Element.mk('<div id="replaceButtons" style="margin-left:10px"></div>').__addChildren([
       html.Element.mk('<span>Click to replace the marks with:</span>'),
       ui.closeReplaceBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

      ])
   ])*/
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
  var actionLeft = ui.includeDoc?docwd +10 + "px":"200px";
  actionDiv.$css({width:(actionWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
  var actionHt = actionDiv.__element.offsetHeight;//+(isTopNote?25:0);
  topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px","padding-top":"10px"});
  var svght = pageHeight - actionHt -0;
  var panelHeaderHt = 26; // the area above the object/code/data/component panels 
  var treeHt = svght;
  tree.myWidth = treeInnerWidth;
  var tabsTop = "20px";
  tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
  ui.svgDiv.$css({id:"svgdiv",left:docwd+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
  ui.svgHt = svght;
  ui.dataContainer.setVisibility(ui.panelMode === 'data');
  uiDiv.setVisibility(ui.panelMode=== 'chain');
  ui.insertContainer.setVisibility(ui.panelMode === 'insert');
 //ui.replaceContainer.setVisibility(ui.panelMode === 'replace');
  if (ui.panelMode === 'data') {
    ui.dataContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.dataDiv.$css({top:"80px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-80)+"px"});
  } else if (ui.panelMode === 'insert') {
    ui.insertContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.insertDiv.$css({top:"0px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
 /* } else if (ui.panelMode === 'replace') {
    var rwd = (2/3) * uiWidth;
    ui.replaceContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth+ "px"),height:(svght-0)+"px"});
    ui.replaceDiv.$css({top:"20px",left:"0px",width:(uiWidth+ "px"),height:(svght-20)+"px"});*/
  } else if (ui.panelMode === 'chain') {
    uiDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")});
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

//   tree.noteDiv.$css({"left":(ui.intro?0:90)+"px","width":(svgwd - (ui.intro?10:140))+"px"});
   //tree.noteDiv.$css({left:"20px",width:svgwd +"px"});
   if (firstLayout) {
     firstLayout = false; 
     ui.layout(noDraw);
   }
   if (!noDraw) {
//     svg.main.fitContents();
   }
}

 
var disableGray = "#aaaaaa";

var enableButton1 =function (bt,vl) {
  bt.disabled = !vl;
  bt.$css({color:vl?"black":disableGray});
}

ui.enableButton = function (bt) {
  enableButton1(bt,true);
}

ui.disableButton = function (bt) {
  enableButton1(bt,false);
}

ui.setClickFunction = function (bt,fn) {
  bt.$click(function () {
    if (!bt.disabled) {
      fn();
    }
  });
}
 

ui.uploadBut.$click(function () {
  ui.dataDivContainsData = false;
  ui.dataDiv.$html('<iframe width = "100%" height="100%" src="/upload.html"></iframe>');
});
  
ui.changeDataSourceBut.$click(function () {
   fb.getDirectory(function (err,list) {
     ui.popChooser(list,'dataSource');
  });
})
  
  

ui.setClickFunction(ui.viewDataBut,function () {
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
    return;
    ;//ui.dataMsg.$html(url);};
    if (url[0] === '[') { // url has the form [uid]path .. that is, it is a reference to a user's database, which in turn points to storage
      var indirect = pj.indirectUrl(url);
      pj.httpGet(indirect,function (erm,rs) {
                debugger;
                ui.getData(JSON.parse(rs),url);//,afterFetch);
              });
    } else { // a direct url at which the data itself is present
      ui.getData(url,url,afterFetch);
    }
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
    
ui.loadAndViewData = function (path) {
  debugger;
   ui.getData(path,function (erm,data) {
    debugger;
    ui.viewAndUpdateFromData(data,path);
    ui.dataMsg.$html(path);
  });
}

ui.chooserReturn = function (v) {
  debugger;
  mpg.chooser_lightbox.dismiss();
  //var uid = fb.currentUid();
  switch (ui.chooserMode) {
    case'saveAs':
      ui.saveItem(v.path);
      //ui.saveItem('['+uid+']'+v.path);
      break;
   case'saveAsSvg':
      ui.saveItem(v.path,undefined,undefined,1.25);
      break;
   case 'insertOwn':
      insertOwn(v);
      break;
    case 'open':
      debugger;
      if (v.deleteRequested) {
        ui.deleteFromDatabase(v.path);
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
      ui.loadAndViewData(path);
      break;
  }
}
   
ui.popChooser = function(keys,operation) {
  if (operation === 'saveAsSvg') {
    ui.aspectRatio = svg.main.aspectRatio();
  }
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
 
ui.initFsel = function () {
  fsel.options = ["New","Open...","Save","Save As...","Save As SVG..."]; 
  fsel.optionIds = ["new","open","save","saveAs","saveAsSvg"];
 var el = fsel.build();
 el.__name = undefined;
  mpg.addChild(el);
  el.$hide();
}

ui.hideFilePulldown = function () {
 if (pj.ui.fsel) { 
    pj.ui.fsel.hide();
  }
}

// if the current item has been loaded from an item file (in which case ui.itemSource will be defined),
// this checks whether it is owned by the current user, and, if so, returns its path
ui.ownedItemPath = function (itemSource) {
  debugger;
  if (!itemSource) {
    return undefined;
  }
  var uid = fb.currentUser.uid;
  var secondSlash = itemSource.indexOf('/',1);
  var owner = itemSource.substring(1,secondSlash);
  if (uid !== owner) {
    return undefined;
  }
  var path = itemSource.substring(secondSlash+2); // +2 because there's a /s/ before the path
  return path;
 
}
ui.setFselDisabled = function () {
   // ui.setPermissions();
   if (!fsel.disabled) {
      fsel.disabled = {};
   }
   var disabled = fsel.disabled;
   disabled.new = disabled.insertOwn = disabled.save = disabled.saveAs = disabled.saveAsSvg  = !fb.currentUser;
   if (!ui.itemSource) {
     disabled.save = true;
    //code
   }
   if (!disabled.save) {
     ui.itemPath = ui.ownedItemPath(ui.itemSource);
     if (!ui.itemPath) {
        disabled.save = true;
     }
   }
    //fsel.disabled.editText =  !ui.textSelected();
   //fsel.disabled.addLegend = !ui.designatedChart();
   fsel.updateDisabled();
}


var notSignedIn = function () {
  location.href = "https://prototype-jungle.org/sign_in.html"
}


ui.nowInserting = undefined;
ui.startInsert = function (url,name) {
  ui.points = [];
  ui.nowInserting = {name:name,url:url};
}

var listAndPop = function (opt) {
  fb.getDirectory(function (err,list) {
    ui.popChooser(list,opt);
  });
}

ui.hasLegend = function () {
  var  ds = dat.selectedDataSource();
  if (!ds) {
    return {};
  }
  var dt = ds[0].__getData();
  return !!dt.categories;
}
/*
ui.addTitleAndLegend = function () {
  var after = function () {
    svg.main.fitContents();
    pj.tree.refreshTop();
    ui.legendAdded = true;
    fsel.disabled.addLegend = 1;

  }
  if (ui.legendAdded) {
    return;
  }
  var htl = ui.hasTitleLegend();
  if (htl.hasTitle && htl.hasLegend) {
    ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',function () { //svg.main.fitContents();return;
      ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',after);
    })
  } else if (htl.hasTitle) {
    ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',after);//svg.main.fitContents();});
  } else if (htl.hasLegend) {
    ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',after);//svg.main.fitContents();});
  }
}
*/

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
    //case "save":
      
      //ui.resaveItem(pj.root);
     // break;
    case "addTitle":
      ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title');
      break;
    case "save":
      debugger;
      ui.resaveItem();
      break;

    case "addLegend":
      debugger;
      //ui.addTitleAndLegend();
      ui.updateLegend('add');
      return;
      debugger;
      var htl = ui.hasTitleLegend();
      if (htl.hasTitle && htl.hasLegend) {
        ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',function () { //svg.main.fitContents();return;
          ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',function () {
            svg.main.fitContents();
          });
        })
      } else if (htl.hasTitle) {
        ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',function () {svg.main.fitContents();});
      } else if (htl.hasLegend) {
        ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',function () {svg.main.fitContents();});
      }
  
     // ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend');
      break;
    case "viewSource":
      ui.viewSource();
      break;
    case "open":
    case "insert":
    case "saveAs":
    case "saveAsSvg":
      fb.getDirectory(function (err,list) {
        ui.popChooser(list,opt);
      });
      break;
  case "insertShape":
    ui.popInserts('shapes');
    break;
  case "insertChart":
    ui.popInserts('charts');
    break;
  }
}
 
ui.setClickFunction(ui.fileBut,function () {
  ui.setFselDisabled();
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


ui.addLegend  = function () {
  debugger;
  var  ds = dat.selectedDataSource();
  var chart = ds[0];
  
  var chartBounds = chart.__bounds(pj.root);
 // svg.showRectangle(chartBounds);
  //var dt = chart.__getData();
//  var legend = chart.__legend;
  //var title = pj.root.titleBox;
 // var hasTitleOrLegend = title || legend;
 // var needsLegend = (add || legend) && dt.categories;;
//  if (!needsLegend) {
//    return;
 // }
/*  var newLegend = needsLegend && !legend;
  var legendToUpdate = needsLegend?legend:undefined;
  updateLegend1(legendToUpdate,chart)
  if (legend && !needsLegend) {
    legend.__hide();
  }
  if (newLegend) {
  */
  debugger;
  // todo deal with errors
  var installLegend = function (proto) {
    var nm = pj.autoname(pj.root,'legend');
    var legend = pj.root.set(nm,proto.instantiate());
    updateLegend1(legend,chart);
    ui.disableButton(ui.addLegendBut);
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

ui.addLegendBut.$click(ui.addLegend);

      
/* begin insert section */



ui.theInserts = {};


var idForInsert;//,positionForInsert;
var dataForInsert;
var dataUrlForInsert;
var insertAsPrototype;// = 1
var replaceRole;
var spreadForReplacement;


var minExtent = 10;
var insertSettings;


ui.finalizeInsert = function (bndsOrPoint) {
  debugger;
  var data = dataForInsert;
  var url = dataUrlForInsert;
  var atPoint = geom.Point.isPrototypeOf(bndsOrPoint);
  var center,bnds;
  if (atPoint) {
    center = bndsOrPoint;
  } else {
    var bnds = bndsOrPoint;
    var extent = bnds.extent;      //code
    if ((extent.width < 10)|| (extent.height < 10)) {
      // todo: display a messge
      return;
    }
    var center = bnds.center();
  }
  var  rs = ui.insertProto.instantiate();
  if (insertSettings) {
    rs.set(insertSettings);
  }
  var anm = pj.autoname(pj.root,idForInsert);
  pj.root.set(anm,rs);
  if (data) {
    var erm = ui.setDataFromExternalSource(rs,data,url);
    //rs.__setData(JSON.parse(data));
  } else {
    rs.__update();
  }
  rs.__show();
  if (!atPoint) {
    rs.__setExtent(bnds.extent);
  }
  rs.__moveto(center);
  if (!ui.nowCloning) {
    if (ui.insertingText) {
      rs.__select('svg');
    }
    //popTextEdit();
    doneInserting();
  }
  ui.enableButtons();

}

// ui.insertProto is available for successive inserts; prepare for the insert operations
var allButtons = [ui.fileBut,ui.insertBut,ui.cloneBut,ui.replaceBut,ui.editTextBut,ui.viewDataBut,ui.addLegendBut];

ui.disableAllButtons = function () {
  allButtons.forEach(ui.disableButton);
}

ui.enableButtons = function () {
  debugger;
  if (ui.nowCloning) {
    return;
  }
  allButtons.forEach(ui.enableButton);
  if (!selectedTextBox()) {
    ui.disableButton(ui.editTextBut);
  }
  var ds = dat.selectedDataSource();
  if (ds && (ds !== 'multiple')) {
    if (ds[0].__legend) {
      ui.disableButton(ui.addLegendBut);
    }
  } else {
    ui.disableButton(ui.viewDataBut);
    ui.disableButton(ui.addLegendBut);
  }
  if (pj.selectedNode) {
    if (!pj.selectedNode.__cloneable) {
      ui.disableButton(ui.cloneBut);
    }
    if (!ui.getSpreadForReplacement()) {
      ui.disableButton(ui.replaceBut);
    }
  } else {
    ui.disableButton(ui.cloneBut);
    ui.disableButton(ui.replaceBut);

  }
}
pj.selectCallbacks.push(ui.enableButtons);
pj.unselectCallbacks.push(ui.enableButtons);

var setupForInsertCommon = function () {
  debugger;
  if (replaceRole) {
    //alert(' relplacing '+replaceRole);
    doReplacement(spreadForReplacement,ui.insertProto)
    return;
  }
   if (insertAsPrototype) {
      var anm = pj.autoname(pj.root,idForInsert+'Proto');
      pj.root.set(anm,ui.insertProto);
      ui.insertProto.__hide();
    }
    svg.main.__element.style.cursor = "crosshair";
    ui.resizable = (!!(ui.insertProto.__setExtent) && !ui.insertProto.__donotResizeOnInsert);
    ui.resizeAspectRatio = ui.insertProto.__aspectRatio; // if a fixed aspect ratio is wanted (eg 1 for circle or square)
    //ui.resizeAspectRatio = 1;
    ui.nowInserting = true;
   ui.disableAllButtons()
}

// for the case where the insert needed loading
var afterInsertLoaded = function (e,rs) {
  debugger;
  ui.insertProto = insertAsPrototype?rs.instantiate():rs;
  ui.theInserts[ui.insertPath] = rs;
  if (dataUrlForInsert) {
    ui.getData(dataUrlForInsert,function (erm,data) {
      dataForInsert = data;
      setupForInsertCommon();
    });
  } else {
     setupForInsertCommon();
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
  var parent = x.__parent;
  var nm = x.__name;
  var anm = pj.autoname(parent,nm);
  parent.set(anm,newItem);
  newItem.__show();
  return newItem;
}

var resizable = true;
var setupForClone = function () {
  if (!pj.selectedNode) {
    return;
  }
  var protofied = protofy(pj.selectedNode);
  var idForInsert  = pj.selectedNode.__name;
  ui.unselect();
  ui.insertDiv.$hide();
  ui.insertButtons.$show();
   //ui.doneInsertingBut.$show();

    //  ui.insertContainer =  html.Element.mk('<div id="insertContainer" style="border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([

  ui.insertProto = Object.getPrototypeOf(protofied);
  ui.resizable = !!(ui.insertProto.__setExtent);
 // alert('resizable',ui.resizable);
  //if (resizable) {
  //ui.nowInserting = true;
  ui.nowCloning = true;
  //} else {
  //  ui.nowCloning = true;
  //}
  svg.main.__element.style.cursor = "crosshair";
  ui.popInsertPanelForCloning();
  ui.disableAllButtons();
//setupForInsertCommon();
}
//ui.insertButtons
ui.setClickFunction(ui.cloneBut,setupForClone);

//ui.insertItem = function (path,where,position,kind,cb) {
ui.setupForInsert= function (catalogEntry,cb) {
  //path,where,settings,data,cb) { //position,kind,cb) {
  var path = catalogEntry.url;
  idForInsert = catalogEntry.id;
  dataUrlForInsert = catalogEntry.data;
  insertSettings = catalogEntry.settings;
  //replaceRole = catalogEntry.role;
  ui.insertingText = catalogEntry.isText;
  var ins = ui.theInserts[path];// already loaded?
  if (ins) {    
    ui.insertProto = insertAsPrototype?ins.instantiate():ins;
    setupForInsertCommon();
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

ui.popInsertPanelForCloning = function () {
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.insertDivCol1.$empty();
  ui.insertDivCol2.$empty();
  
}
ui.popInserts= function () {
  selectedForInsert = undefined;
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.insertDiv.$show();
  //ui.insertButtons.$hide();
   //ui.doneInsertingBut.$hide();
   ui.insertButtons.$hide();

  pj.getAndShowCatalog(null,ui.insertTab.__element,[ui.insertDivCol1.__element,ui.insertDivCol2.__element],100,ui.catalogUrl,
    function (selected) {
      debugger;
      selectedForInsert = selected;
      replaceRole = undefined; // we're not replacing
       ui.setupForInsert(selectedForInsert);//,position,kind,cb);

    //  ui.insertInput.$prop("value",selected.id);
    },
    function (error,catState) {
      debugger;
      catalogState = catState;
    });
}

ui.setClickFunction(ui.insertBut,ui.popInserts);

ui.closeSidePanel = function () {
  debugger;
  if (ui.panelMode === 'chain')  {
    return;
  }
  ui.panelMode = 'chain';
  ui.layout();
}


var doneInserting = function () {
  debugger;
  ui.nowInserting = false;
  ui.nowCloning = false;
  svg.main.__element.style.cursor = "";
  if (ui.controlRect) {
    ui.controlRect.__hide();
  }
  pj.unselectCatalogElements(catalogState);
  //ui.doneInsertingBut.$hide();
  ui.insertButtons.$hide();
  ui.insertDiv.$show();

  ui.closeSidePanel();
  ui.enableButtons();
}

ui.doneInsertingBut.$click(doneInserting);
ui.closeInsertBut.$click(doneInserting);

/* end insert section */

/*
var insertOwn = function (v) {
  ui.insertItem('/'+v.path,v.where);
}
*/

/* begin buttons in the svg panel */

ui.addButtons = function (div,navTo) {
 var plusbut,minusbut,navbut;
 var divel = div.__element;
 ui.plusbut = plusbut = html.Element.mk('<div id="plusbut" class="button" style="position:absolute;top:0px">+</div>');
 ui.minusbut = minusbut = html.Element.mk('<div id="minusbut" class="button" style="position:absolute;top:0px">&#8722;</div>');
 ui.navbut = navbut = html.Element.mk('<div id="navbut" class="button" style="position:absolute;top:0px">'+navTo+'</div>');
 plusbut.__addToDom(divel);
 minusbut.__addToDom(divel);
 navbut.__addToDom(divel);
}


ui.positionButtons = function (wd) {
  if (ui.plusbut) {
    ui.plusbut.$css({"left":(wd - 50)+"px"});
    ui.minusbut.$css({"left":(wd - 30)+"px"});
    ui.navbut.$css({"left":"0px"});
  }
}

  
  function enableTreeClimbButtons() {
    var isc = tree.selectionHasChild();
    var isp = tree.selectionHasParent();
    ui.upBut.$show();
    ui.topBut.$show();
    ui.downBut.$show();
    enableButton1(ui.upBut,isp);
    enableButton1(ui.topBut,isp);
    enableButton1(ui.downBut,isc);
  }
 
 ui.enableTreeClimbButtons = enableTreeClimbButtons;

ui.setClickFunction(ui.topBut,function () {
  //if (ui.topBut.disabled) return;
  var top = tree.getParent(1);
  if (top) {
    top.__select('svg');
  }
  //tree.showTop();
  enableTreeClimbButtons();
});

ui.setClickFunction(ui.upBut,function () {
  //if (ui.upBut.disabled) return;
  var pr = tree.getParent();
  if (pr) {
    pr.__select('svg');
  }
  //tree.showParent();
  enableTreeClimbButtons();
});


ui.setClickFunction(ui.downBut,function () {
 // if (ui.downBut.disabled) return;
  tree.showChild();
  enableTreeClimbButtons();
});

  
/* end buttons in the svg panel */
  
ui.setInstance = function (itm) {
  if (!itm) {
    return;
  }
  ui.topBut.$show();
  ui.upBut.$show();
  tree.showItemAndChain(itm,'auto');
  enableTreeClimbButtons();
  return;
}

pj.selectCallbacks.push(ui.setInstance); 

  
ui.elementsToHideOnError = [];
  // a prototype for the divs that hold elements of the prototype chain
tree.protoSubDiv = html.Element.mk('<div style="background-color:white;margin-top:20px;border:solid thin green;padding:10px"/>');
ui.errorDiv =  html.wrap('error','div');
ui.elementsToHideOnError.push(cols);
ui.elementsToHideOnError.push(actionDiv);
ui.elementsToHideOnError.push(docDiv);
tree.obDiv.click = function () {dom.unpop();};
  
tree.viewNote = function(k,note) {
  var h = k?'<b>'+k+':</b> '+note:note;
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(h)
  return;
}

function mkLink(url) {
   return '<a href="'+url+'">'+url+'</a>';
 } 

 
ui.saveItem = function (path,code,cb,aspectRatio) { // aspectRatio is only relevant for svg, cb only for non-svg
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
      ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
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


ui.resaveItem = function () {
  debugger;
  var doneSaving = function () {
    ui.displayMessage(ui.messageElement,'Done saving...');
    window.setTimeout(function () {ui.messageElement.$hide()},1500);
  }
  ui.displayMessage(ui.messageElement,'Saving...');
  ui.saveItem(ui.itemPath,undefined,doneSaving);
}



/* begin replace section */
var replaceSettings;

var doReplacement = function (spread,newMark) {
  debugger;
  var imark = newMark.instantiate();
  if (replaceSettings) {
    imark.set(replaceSettings);
  }
  imark.__hide();
  spread.replacePrototype(imark);
}

/*
ui.replaceItem = function (path,settings) {
  installSettings = settings;
  pj.install(path,doReplacement);
}
*/
ui.getSpreadForReplacement = function () {
  if (pj.selectedNode) {
    var spread = pj.ancestorThatInheritsFrom(pj.selectedNode,pj.Spread);
    if (spread && spread.role) {
      return spread;
    }
  }
}

/*
var repDiv = html.Element.mk('<div style="displayy:inline-block"/>');
repDiv.set('img',html.Element.mk('<img width="150"/>'));
repDiv.set('txt',html.Element.mk('<div style="text-align:center">TXT</div>')); 
*
/* end replacement section */


//pj.getAndShowCatalog = function (col1,col2,imageWidthFactor,catalogUrl,whenClick,cb) {


ui.setClickFunction(ui.replaceBut,function () {
  debugger;
  spreadForReplacement = ui.getSpreadForReplacement();
  //ar role = ui.getRole(pj.selectedNode);
  if (!spreadForReplacement) {
    return;
  }
  ui.hideFilePulldown(); 
  ui.panelMode = 'insert';
  ui.layout();
  pj.getAndShowCatalog(spreadForReplacement.role,ui.insertTab.__element,[ui.insertDivCol1.__element,ui.insertDivCol2.__element],100,ui.catalogUrl,
    function (selected) {
      debugger;
      selectedForInsert = selected;
      replaceRole = selected.role;
      replaceSettings = selected.settings;
      ui.setupForInsert(selectedForInsert);//,position,kind,cb);

    //  ui.insertInput.$prop("value",selected.id);
  });
});
/* end Replacement section */



ui.closeDataBut.$click(ui.closeSidePanel);


 


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
var editTextArea = html.Element.mk('<textarea cols="50" rows="20"/>');
var editTextDone = html.Element.mk('<div class="ubutton">Ok</div>');
editTextDone.$click(function () {
  var val = editTextArea.$prop("value");// I don't understand why this is needed, but is
  debugger;
  var textBox = selectedTextBox();
  textBox.textarea.setText(val);
  textBox.update();
  
 //   inf.$attr("value",vts);
     mpg.textedit_lightbox.dismiss();

    
});

var editTextDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="editTextDivDiv" />').__addChildren([
  editTextArea,
  editTextDone
]);

var texteditBeenPopped = false;

var popTextEdit = function () {
  mpg.textedit_lightbox.pop();
  debugger;
  if (!texteditBeenPopped) mpg.textedit_lightbox.setContent(editTextDiv);
  texteditBeenPopped = true;
  return;
}
ui.setClickFunction(ui.editTextBut,popTextEdit);

ui.setSaved = function () {} //@todo implement this
//var editor;
  
  

