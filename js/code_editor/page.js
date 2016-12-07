
  
// This is one of the code files assembled into pjui.js.

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
ui.panelMode = 'chain'; // mode of the right panel view; one of 'chain' (view the prototype chains);'insert','data','code','replace'
var unpackedUrl,unbuiltMsg;
//ui.docMode = 1;
ui.saveDisabled = false; // true if a build no save has been executed.

var buttonSpacing = "10px";
var buttonSpacingStyle = "margin-left:10px";
 var jqp = pj.jqPrototypes;
 // the page structure
var mainTitleDiv = html.wrap('mainTitle','div');
// note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed. 
  var test=html.Element.mk('<div class="roundButton">Top</div>');

var actionDiv,cols;

var mpg = ui.mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).__addChildren([
  topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",height:"10px",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).__addChildren([
    
  actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').__addChildren([
      ui.fileBut = html.Element.mk('<div class="ubutton">File</div>'),
     // ui.replaceBut = html.Element.mk('<div class="ubutton">Alternate Marks</div>'),
     //ui.viewDataBut = html.Element.mk('<div class="ubutton">View/Change Data</div>'),
      ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')
    ]),
    ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
  ]),

  cols = html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').__addChildren([
    
    ui.docDiv = docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
    
    ui.svgDiv = html.Element.mk('<div id="svgDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').__addChildren([
      tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').__addChildren([
  //    tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;width:600px;padding-left:4px;float:right;border:solid thin black"/>').__addChildren([
        //ui.noteSpan = html.Element.mk('<span>Click on things to adjust them. To navigate part/subpart hierarchy:</span>'),
        //ui.upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
        //ui.downBut =html.Element.mk('<div class="roundButton">Down</div>'),
        //ui.topBut =html.Element.mk('<div class="roundButton">Top</div>')
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
     
   /* editing data will be revived in future versions
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
    ]),*/
    ui.codeContainer =  html.Element.mk('<div id="codeContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([

     ui.codeMessage =html.Element.mk('<div style="margin-left:10px;margin-bottom:5px;color:red;font-size:10pt"></div>'),
      ui.codeUrls = html.Element.mk('<div style="borderr:solid thin red;margin-left:20px;margin-bottom:5px;color:black;font-size:10pt"></div>'),
      ui.codeButtons = html.Element.mk('<div id="codeButtons" style="bborder:solid thin red;"></div>').__addChildren([
         ui.runCodeBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Run</div>'),
         ui.saveBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Save</div>'),
         ui.saveAsBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Save As</div>'),
        ui.runningSpan = html.Element.mk('<span style="display:none">...running...</span>'),

      ]),
       ui.codeDiv = html.Element.mk('<div id="codeDiv" style="border:solid thin green;positionn:absolute;">Code Div</div>')
    ]),
    // insertContainer is used for opening from catalog
    ui.insertContainer =  html.Element.mk('<div id="insertContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([
       ui.insertButtons = html.Element.mk('<div id="insertButtons" style="border:solid thin red;"></div>'),
       ui.insertDiv = html.Element.mk('<div id="insertDiv" stbyle="border:solid thin green;position:absolute;"></div>').__addChildren([
         ui.tabContainer = html.Element.mk('<div id="tabContainer" style="vertical-align:top;border-bottom:thin solid black;height:30px;"></div>').__addChildren([
            ui.insertTab = html.Element.mk('<div id="tab" style="width:80%;vertical-align:bottom;borderr:thin solid green;display:inline-block;height:30px;"></div>'),
            ui.closeInsertBut = html.Element.mk('<div style="background-color:red;display:inline-block;vertical-align:top;float:right;cursor:pointer;margin-left:0px;margin-right:1px">X</div>')
        ]),                                                                                                                                                 
 
         //ui.insertTab = html.Element.mk('<div id="tab" style="vertical-align:bottom;border-bottom:thin solid black;height:30px;">Tab</div>'),
         ui.insertDivCol1 = html.Element.mk('<div id="col1" style="display:inline-block;cursor:pointer;border:thin solid yellow;mmargin-left:20px;mmargin-top:40px"></div>'),
         ui.insertDivCol2 = html.Element.mk('<div id="col2" style="display:inline-block;cursor:pointer;mmargin-right:20px;border:thin solid red;mmargin-top:40px"></div>'),
         ui.insertDivCol3 = html.Element.mk('<div id="col3" style="display:inline-block;cursor:pointer;border:thin solid blue;position:absolute;mmargin-left:20px;mmargin-top:40px"></div>'),
         //ui.insertIframe = html.Element.mk('<iframe width="99%" style="overflow:auto" height="200" scrolling="yes" id="insertIframe" />')
      ])
    ]),
    
  
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
  } else if ((ui.panelMode === 'replace') || (ui.panelMode === 'insert')) {
    docwd = 0;
    uiWidth = pageWidth/2;
  } else if ((ui.panelMode === 'data') || (ui.panelMode === 'code')) {
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
  //ui.dataContainer.setVisibility(ui.panelMode === 'data');
  ui.codeContainer.setVisibility(ui.panelMode === 'code');
  uiDiv.setVisibility(ui.panelMode=== 'chain');
  ui.insertContainer.setVisibility(ui.panelMode === 'insert');
  if (ui.panelMode === 'insert') {
    var colWidth = uiWidth/3;
    var colWidthPx = colWidth + "px";
    ui.insertDivCol1.$css({left:"0px",width:colWidthPx});
    ui.insertDivCol2.$css({left:colWidthPx,width:colWidthPx});
    ui.insertDivCol3.$css({left:(2*colWidth)+"px",width:colWidthPx});
  }
  if (ui.panelMode === 'data') {
    ui.dataContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.dataDiv.$css({top:"80px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-80)+"px"});
  } else if (ui.panelMode === 'code') {
    ui.codeContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    //ui.codeDiv.$css({top:"80px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-80)+"px"});
    ui.codeDiv.$css({width:(uiWidth-0 + "px"),height:(svght-80)+"px"});
  } else if (ui.panelMode === 'insert') {
   ui.insertContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
   // ui.insertDiv.$css({top:"20px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
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
     svg.main.fitContents();
   }
}


pj.selectCallbacks.push(function (itm) {
  ui.whatToAdjust = itm;
});

ui.disableShifter = true;
  



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

ui.chooserReturn = function (v) {
  debugger;
  mpg.chooser_lightbox.dismiss();
  switch (ui.chooserMode) {
    case 'saveCode':
      debugger;
      saveItem(v.path,ui.editorValue());
      break;
    case 'open':
      if (v.deleteRequested) {
        ui.deleteFromDatabase(v.path);
        return;
      }
     var ext = pj.afterLastChar(v.path,'.',true);
     location.href = '/code.html?source='+v.path;
      break;
 
  }
}
   
var popChooser = function(keys,operation) {
  debugger;
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
 
var initFsel = function () {
 fsel.options = ["New","Open from file browser","Open from catalog"]; 
 fsel.optionIds = ["new","open","openCatalog"];
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
var setFselDisabled = function () {
   if (!fsel.disabled) {
      fsel.disabled = {};
   }
   fsel.disabled.new = !(ui.source);//disabled.insertOwn = disabled.save = disabled.saveAs = disabled.saveAsSvg  = !fb.currentUser;
   fsel.updateDisabled();
}




var popInserts;

fsel.onSelect = function (n) {
  var opt = fsel.optionIds[n];
  if (fsel.disabled[opt]) return;
  switch (opt) {
    case "delete":
      confirmDelete();
      break;
    case "new":
      location.href = "/code.html";
      break;
    
    case "open":
    fb.getDirectory(function (err,list) {
      debugger;
      var filtered = fb.filterDirectoryByExtension(list,'.js');
        popChooser(filtered,opt);
    });
    case "saveCode":
       fb.getDirectory(function (err,list) {
         popChooser(list,opt);
      });
      break;
  case "openCatalog":
    popInserts('shapes');
    break;
  }
}
 
ui.fileBut.$click(function () {
  setFselDisabled();
  dom.popFromButton("file",ui.fileBut,fsel.domEl);
});

/* end file options section */

 

  

var installSettings;


var insertOwn = function (v) {
  ui.insertItem('/'+v.path,v.where);
}
  
  
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


var afterSave = function (err,path) {
    // todo deal with failure
    debugger;
    if (err) {
      ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
      return;
    }
    var url = ui.saveUrl;
    var dest = '/code.html?source='+url;
    if (ui.dataUrl) {
      dest +='&data='+ui.dataUrl;
    }
    location.href = dest;
    //ui.changed[ui.selectedUrl] = false;
    //ui.showChangedStatus();
  }
 
saveItem = function (path,code,cb,aspectRatio) { // aspectRatio is only relevant for svg, cb only for non-svg
  var needRestore = !!cb;
  var savingAs = true;
  ui.saveUrl = '['+fb.currentUid()+']'+path;
  pj.saveItem(path,code,afterSave);//aspectRatio);
}



var afterResave = function (err,path) {
    // todo deal with failure
    debugger;
    if (err) {
      ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
      return;
    }
    ui.changed[ui.selectedUrl] = false;
    ui.viewSource();
    return;
    var url = ui.saveUrl;
    var dest = '/code.html?source='+url;
    location.href = dest;
    //ui.changed[ui.selectedUrl] = false;
    //ui.showChangedStatus();
  }

resaveItem = function () {
  debugger;
  var code = ui.editorValue();
  var url =  '/'+ui.removeBracketsFromPath(ui.selectedUrl);
  ui.runningSpan.$html('...saving...');
  ui.runningSpan.$show();
  window.setTimeout(function() {
      ui.runningSpan.$hide();
  },300);
  pj.saveItem(url,code,afterResave);
  return;
  var doneSaving = function () {
    ui.displayMessage(ui.messageElement,'Done saving...');
    window.setTimeout(function () {ui.messageElement.$hide()},1500);
  }
  ui.displayMessage(ui.messageElement,'Saving...');
  saveItem(ui.itemPath,undefined,doneSaving);
}

setClickFunction(ui.saveBut,resaveItem);


var selectedForInsert,closeInsert;

var popInserts= function (charts) {
  debugger;
  selectedForInsert = undefined;
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  
    pj.catalog.getAndShow(undefined,ui.insertTab.__element,[ui.insertDivCol1.__element,ui.insertDivCol2.__element,ui.insertDivCol3.__element],ui.catalogUrl,
      function (selected) {
        debugger;
        closeInsert();
        /*ui.installItem(selected.url,undefined,selected.data,selected.settings,function () {
          ui.installNewItem();
          ui.viewSource();
        });*/
//        function () {
        var url = '/code.html'+pj.catalog.httpGetString(selected);//?source='+selected.url;
        //var data = selected.data;
        //if (data) {
        //  url += '&data='+data;
        //}
        location.href = url;
      },   
     function (error,catState) {
       debugger;
       ui.catalogState = catState;
      });
}
  
  
closeInsert = function () {
  ui.panelMode = 'code';
  ui.layout();
}
ui.closeInsertBut.$click(closeInsert);



//ui.closeReplaceBut.$click(ui.closeSidePanel);


ui.alert = function (msg) {
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(msg);
}


ui.changed = {};
ui.elsByUrl = {};

ui.itemSaved = true;

var count = 0;
//var editor;
var editorInitialized; 
var initEditor =    function () {
  var editor;
  if (!editorInitialized) {
    ui.editor = editor = ace.edit("codeDiv");
    //editor.setTheme("ace/theme/monokai");
    editor.setTheme("ace/theme/textmate");
    editor.getSession().setMode("ace/mode/javascript");
    editor.renderer.setOption('showLineNumbers',false);
     editor.renderer.setOption('showFoldWidgets',false);
      editor.renderer.setOption('showGutter',false);
     // editor.renderer.setOption('vScrollBarAlwaysVisible',true);
  editorInitialized = 1;
  editor.on('change',function (e) {
    if (ui.settingValue) {
      return;
    }
    if (!ui.mainUrl) {
      return;
    }
    var el = ui.elsByUrl[ui.selectedUrl];
    var oldValue = pj.loadedScripts[ui.selectedUrl];
    var newValue = ui.editorValue();
    if (newValue && (oldValue !== newValue)) {
      debugger;
      el.$html(ui.selectedUrl+'*');
      pj.loadedScripts[ui.selectedUrl] = newValue;
      delete pj.installedItems[ui.selectedUrl];
      ui.changed[ui.selectedUrl] = true;
    }
  });
    
  }
}
  
  ui.showChangedStatus = function () {
    var theUrls = [ui.mainUrl].concat(pj.loadedUrls);
    theUrls.forEach(function (url) {
      var el = ui.elsByUrl[url];
      el.$html(url + (ui.changed[url]?'*':''));
    })
  }

  ui.saveable = function (url) {
    var uid = fb.currentUid();
    return uid && (pj.uidOfUrl(url) === uid);
  }
  
  // if a url has been edited,  and is not saveable, it must be saved to avoid loss of work
  // if any url mustBeSavedAs, all other non-saveable url are readonly
var mustBeSavedAs = function (theUrls) {
    var ln = theUrls.length;
    for (var i=0;i<ln;i++) {
      var url = theUrls[i];
      if (ui.changed[url] && !ui.saveable(url)) {
        return url;
      }
    }
    
  }
  
  ui.editorValue = function () {
    return ui.editor.session.getDocument().getValue()
  }
  var initialCode = "pj.require(function () {\nvar item = pj.svg.Element.mk('<g/>');\n return item;\n})";
  ui.viewSource = function () {
    debugger;
       //var mainUrl = pj.root.__sourceUrl;
    
       ui.panelMode = 'code';
       ui.layout();
       initEditor();
       enableButton(ui.saveAsBut,!!fb.currentUser);
       if (!ui.mainUrl) {
          ui.editor.setValue(initialCode);//rs
          enableButton(ui.saveBut,false);

         return;
       }
       //ui.mainUrl = mainUrl;
      
      // ui.codeMsg.$html(url);
       var urlEls = [];
       //var elsByUrl = {};
       ui.codeUrls.$empty();
       var count = 0;
       //var theUrls = [mainUrl].concat(pj.loadedUrls);
       var theUrls = [];
       pj.loadedUrls.forEach(function (url) {
         if (pj.endsIn(url,'.js')) {
           theUrls.push(url);
         }
       });
       var highlight = function (selectedUrl) {
        theUrls.forEach(function (url) {
           var el = ui.elsByUrl[url];
           if (url === selectedUrl) {
             el.$css({'border':'solid black'});
           } else {
             el.$css({'border':'none'});
           }
         });
       }
       //pj.installedUrls = [];
      var moreThanOne = theUrls.length > 1;
      var viewCodeAtUrl = function (url) {
        debugger;
        var code = pj.loadedScripts[url];
         ui.settingValue = true;
         ui.editor.setValue(code);
         ui.editor.clearSelection();
         ui.editor.scrollToLine(0);
         ui.selectedUrl = url;
         if (moreThanOne) {
           var mbs  = mustBeSavedAs(theUrls);
           var readOnly = mbs  && (mbs !== url) && !ui.saveable(url);
           ui.editor.setReadOnly(readOnly);
           if (readOnly) {
            alert('readonly');
           }
           highlight(url);
         }
         enableButton(ui.saveBut,ui.saveable(url));
         ui.settingValue = false;
       }
       theUrls.forEach(function (url) {
          var urlEl = html.Element.mk('<div style="display:inline-block;padding-right:10pt;font-size:10pt">'+url+' </div>');
          if (moreThanOne) {
            urlEl.$click(function () {
            //var cached = pj.loadedScripts[url];
              viewCodeAtUrl(url);
            });
          }
          urlEls.push(urlEl);
          ui.elsByUrl[url] = urlEl;
          
          //count++;
          //if (count%2 === 0) {
          //  var br = html.Element.mk('<span style="padding-right:10pt;font-size:10pt">'+url+'</span>');
          //}
       });
       if (theUrls.length > 1) {
         var mainEl = html.Element.mk('<div style="display:inline-block;padding-right:10pt;font-weight:bold;font-size:10pt">Main:</div>');
         var depEl = html.Element.mk('<div style="display:inline-block;padding-left:10pt;padding-right:10pt;font-weight:bold;font-size:10pt">Dependencies:</div>');
         ui.runCodeBut.$html('Run Main');
         ui.codeUrls.__addChildren([mainEl,urlEls[0],depEl].concat(urlEls.slice(1)));
       } else {
        ui.codeUrls.__addChildren(urlEls);
       }
       var urlsHt = ui.codeUrls.__element.offsetHeight;
      // alert(urlsHt);
       ui.codeDiv.$css({height:(ui.svght-urlsHt)+"px"});
       viewCodeAtUrl(ui.mainUrl);
       return;
       //ui.codeUrls.$html(urls);
       pj.httpGet(url,function (error,rs) {
          ui.editor.setValue(rs);//rs
       });
  
  }

var runSource = function () {
    debugger;
    var src;
    if (ui.mainUrl) {
      src = ui.mainUrl;
    } else {
      src = 'top';
      pj.loadedScripts[src] = ui.editorValue();
    }
    ui.runningSpan.$html('...running...');
    ui.runningSpan.$show();
    window.setTimeout(function() {
      ui.runningSpan.$hide();
    },300);
    pj.installedItems = {};
    pj.install(src,function (erm,rs) {
      debugger;
      pj.root = rs;
      //tree.shownItem = rs;
      ui.installNewItem();
      svg.main.updateAndDraw();
    });
  }
  
ui.runCodeBut.$click(runSource);

setClickFunction(ui.saveAsBut,function () {
  //if (ui.runSource()) {
  fb.getDirectory(function (err,list) {
    popChooser(list,'saveCode');
  });
});

ui.enableButtons = function () {};
pj.updateErrorHandler = function (e) {
  alert(e);
}

