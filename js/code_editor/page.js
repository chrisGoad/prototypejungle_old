
  
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
      ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')
    ]),
    ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
  ]),

  cols = html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').__addChildren([
    
    ui.docDiv = docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
    
    ui.svgDiv = html.Element.mk('<div id="svgDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').__addChildren([
      tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>'),
      ui.svgMessageDiv = html.Element.mk('<div style="display:none;margin-left:auto;padding:40px;margin-right:auto;width:50%;margin-top:20px;border:solid thin black">AAAAUUUU</div>')
     ]),
    
     tree.objectContainer = uiDiv = html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"/>').__addChildren([
       tree.obDivRest = tree.obDiv = html.Element.mk('<div id="obDiv" style="position:absolute;background-color:white;border:solid thin blue;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>').__addChildren([
         html.Element.mk('<div style="margin-bottom:0px;border-bottom:solid thin black"/>').__addChildren([
                              obDivTitle = html.Element.mk('<span style="margin-bottom:10px;border-bottom:solid thin black">Workspace</span>')
        ]),
      ])
    ]),
     
    ui.codeContainer =  html.Element.mk('<div id="codeContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([

     ui.codeMessage =html.Element.mk('<div style="margin-left:10px;margin-bottom:5px;color:red;font-size:10pt"></div>'),
      ui.codeUrls = html.Element.mk('<div style="borderr:solid thin red;margin-left:20px;margin-bottom:5px;color:black;font-size:10pt"></div>'),
      ui.codeButtons = html.Element.mk('<div id="codeButtons" style="bborder:solid thin red;"></div>').__addChildren([
         ui.runCodeBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Run</div>'),
         ui.saveBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Save</div>'),
         ui.saveAsBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Save As</div>'),
         ui.readOnlySpan =html.Element.mk('<span style="padding-left:15px;font-size:10pt;color:red;display:nnone">Read Only</span>'),
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
         ui.insertMessage = html.Element.mk('<div id="insertMessage" style="width:80%;vertical-align:bottom;borderr:thin solid green;font-size:8pt;height:30px;">Click an entry to copy its url to the clipboard</div>'),

         //ui.insertTab = html.Element.mk('<div id="tab" style="vertical-align:bottom;border-bottom:thin solid black;height:30px;">Tab</div>'),
         ui.insertDivCol1 = html.Element.mk('<div id="col1" style="display:inline-block;cursor:pointer;mmargin-left:20px;mmargin-top:40px"></div>'),
         ui.insertDivCol2 = html.Element.mk('<div id="col2" style="display:inline-block;cursor:pointer;mmargin-right:20px;mmargin-top:40px"></div>'),
         ui.insertDivCol3 = html.Element.mk('<div id="col3" style="display:inline-block;cursor:pointer;position:absolute;mmargin-left:20px;mmargin-top:40px"></div>'),
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
    ui.codeDiv.$css({width:(uiWidth-0 + "px"),height:(svght-80)+"px"});
  } else if (ui.panelMode === 'insert') {
   ui.insertContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
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

var replaceRequireInMain = function (toReplace,replacement) {
  var code = pj.loadedScripts[ui.mainUrl];
  var newCode = code.replace(toReplace,replacement);
  pj.loadedScripts[ui.mainUrl] = newCode;
  ui.changed[ui.mainUrl] = true;
  ui.fileModified = true;
  
}
ui.chooserReturn = function (v) {
  mpg.chooser_lightbox.dismiss();
  switch (ui.chooserMode) {
    case 'saveCode':
      var newCode = ui.editorValue();
      var newUrl = '['+fb.currentUid()+']'+v.path;
      if (ui.selectedUrl !== ui.mainUrl) {
        replaceRequireInMain(ui.selectedUrl,newUrl);
      }
      saveItem(v.path,newCode,function () {
        if (ui.selectedUrl === ui.mainUrl) {
          ui.fileModified = false;
          location.href = '/code.html?source='+newUrl;
          return;
        }
        var el = ui.elsByUrl[ui.selectedUrl];
        el.$html(newUrl);
        ui.elsByUrl[newUrl] = el;
        pj.loadedScripts[newUrl] = newCode;
        ui.theUrls[ui.selectedUrlIndex] = newUrl;
        ui.isDirectDependency[newUrl] = true;
        var mainEl = ui.elsByUrl[ui.mainUrl];
        mainEl.$html(ui.mainUrl+'*');
      });
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
  ui.chooserKeys = keys; // this is where the chooser gets its data
  ui.chooserMode = operation;
  //ui.chooserMode = 'open';
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
        
//var fselJQ;
 
var initFsel = function () {
 fsel.options = ["New","Open from file browser","Open from catalog","View Catalog"]; 
 fsel.optionIds = ["new","open","openCatalog","viewCatalog"];
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

var setFselDisabled = function () {
   if (!fsel.disabled) {
      fsel.disabled = {};
   }
   fsel.disabled.new = !(ui.source);
   fsel.disabled.open = !(fb.currentUser);
   fsel.updateDisabled();
}

var popCatalog;

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
      var filtered = fb.filterDirectoryByExtension(list,'.js');
        popChooser(filtered,opt);
    });
    case "saveCode":
       fb.getDirectory(function (err,list) {
         popChooser(list,opt);
      });
      break;
  case "openCatalog":
    popCatalog(false);
    break;
  case "viewCatalog":
    popCatalog(true);
    break;
  }
}
 
ui.fileBut.$click(function () {
  setFselDisabled();
  dom.popFromButton("file",ui.fileBut,fsel.domEl);
});

/* end file options section */

/*
var insertOwn = function (v) {
  ui.insertItem('/'+v.path,v.where);
}
  */
  
ui.elementsToHideOnError = [];
  // a prototype for the divs that hold elements of the prototype chain
//tree.protoSubDiv = html.Element.mk('<div style="background-color:white;margin-top:20px;border:solid thin green;padding:10px"/>');
//ui.errorDiv =  html.wrap('error','div');
//ui.elementsToHideOnError.push(cols);
//ui.elementsToHideOnError.push(actionDiv);
//ui.elementsToHideOnError.push(docDiv);
//tree.obDiv.click = function () {dom.unpop();};
/*
tree.viewNote = function(k,note) {
  var h = k?'<b>'+k+':</b> '+note:note;
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(h)
  return;
}
*/
/*
function mkLink(url) {
   return '<a href="'+url+'">'+url+'</a>';
 } 
*/

var afterSave = function (err,path,cb) {
    // todo deal with failure
    if (err) {
      ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
      return;
    }
    ui.fileModified = codeNeedsSaving(true);

    var url = ui.saveUrl;
    if (cb) {
      cb();
      return;
    }
    
    var dest = '/code.html?source='+url;
    location.href = dest;
    //ui.changed[ui.selectedUrl] = false;
    //ui.showChangedStatus();
  }
 
saveItem = function (path,code,cb,aspectRatio) { // aspectRatio is only relevant for svg, cb only for non-svg
  var needRestore = !!cb;
  var savingAs = true;
  ui.saveUrl = '['+fb.currentUid()+']'+path;
  pj.saveItem(path,code,function (err,path) {afterSave(err,path,cb);});//aspectRatio);
}



var afterResave = function (err,path) {
    // todo deal with failure
    ui.runningSpan.$hide();

    if (err) {
      ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
      return;
    }
    ui.changed[ui.selectedUrl] = false;
    ui.fileModified = codeNeedsSaving(true);
    var el = ui.elsByUrl[ui.selectedUrl];
    el.$html(ui.selectedUrl)
  }

resaveItem = function () {
   if ((ui.selectedUrl===ui.mainUrl) && codeNeedsSaving()) {
    ui.alert('One or more dependencies need saving. This should be done before saving the main file');
    return;
  }
  var code = ui.editorValue();
  var url =  pj.pathOfUrl(ui.selectedUrl);//'/'+ui.removeBracketsFromPath(ui.selectedUrl);
  ui.runningSpan.$html('...saving...');
  ui.runningSpan.$show();
  window.setTimeout(function() {
      ui.runningSpan.$hide();
  },300);
  pj.saveItem(url,code,afterResave);
 
}

setClickFunction(ui.saveBut,resaveItem);


var selectedForInsert,closeInsert;

var popCatalog= function (forViewing) {
  selectedForInsert = undefined;
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
                        
  var options = {role:null,tabsDiv:ui.insertTab.__element,catalogUrl:ui.catalogUrl,
                        cols:[ui.insertDivCol1.__element,ui.insertDivCol2.__element,ui.insertDivCol3.__element],catalogUrl:ui.catalogUrl,     
                          //undefined,ui.insertTab.__element,[ui.insertDivCol1.__element,ui.insertDivCol2.__element,ui.insertDivCol3.__element],ui.catalogUrl,
     callback:function (error,catState) {
       ui.catalogState = catState;
      }};
    if (forViewing) {
      options.showUrl = true;
      options.whenClick =function (selected) {
        pj.catalog.copyToClipboard(selected.url);
        return;
      };
      ui.insertMessage.$show();
    } else {
       options.whenClick = function (selected) {
        var url = '/code.html'+pj.catalog.httpGetString(selected);//?source='+selected.url;
        location.href = url;
      };
      ui.insertMessage.$hide();

    }
    pj.catalog.getAndShow(options);
}
  
  
closeInsert = function () {
  ui.panelMode = 'code';
  ui.layout();
}
ui.closeInsertBut.$click(closeInsert);

ui.alert = function (msg) {
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(msg);
}


ui.changed = {};
ui.elsByUrl = {};

ui.itemSaved = true;

var count = 0;
var editorInitialized; 
var initEditor =    function () {
  var editor;
  if (!editorInitialized) {
    ui.editor = editor = ace.edit("codeDiv");
    editor.setTheme("ace/theme/textmate");
    editor.getSession().setMode("ace/mode/javascript");
    editor.renderer.setOption('showLineNumbers',false);
     editor.renderer.setOption('showFoldWidgets',false);
      editor.renderer.setOption('showGutter',false);
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
      el.$html(ui.selectedUrl+'*');
      pj.loadedScripts[ui.selectedUrl] = newValue;
      delete pj.installedItems[ui.selectedUrl];
      ui.changed[ui.selectedUrl] = true;
      ui.fileModified = true;
      enableButton1(ui.saveBut,fileIsOwned(ui.selectedUrl));     
    }
  });
    
  }
}

var codeNeedsSaving = function (includeMain) {
  var ln = ui.theUrls.length;
  for (var i=0;i<ln;i++) {
    var url = ui.theUrls[i];
    if ((includeMain || (url !== ui.mainUrl)) && ui.changed[url] ) {
      return true;
    }
  }
  return false;
}
  
ui.editorValue = function () {
  return ui.editor.session.getDocument().getValue()
}
var initialCode =
 "// sample code \npj.require(function () {\n  var item = pj.svg.Element.mk('<g/>');\n" +
             "  item.set('circle',pj.svg.Element.mk(\n  '"+  
                       '<circle fill="blue" stroke="black" stroke-width="2" r="20"/>'+"'));\n" +
             "  return item;\n})" ;
               
ui.viewSource = function () {
  ui.panelMode = 'code';
  ui.layout();
  initEditor();
  enableButton1(ui.saveAsBut,!!fb.currentUser);
  var theUrls = [];
  ui.theUrls = theUrls;
  if (!ui.mainUrl) {
     ui.editor.setValue(initialCode);//rs
     disableButton(ui.saveBut);
    return;
  }
  var urlEls = [];
  ui.codeUrls.$empty();
  var count = 0;
  var urlIndex = {};
  ui.isDirectDependency = {};;
  var mainRequires =pj.requireEdges[ui.mainUrl];
  if (mainRequires) {
    mainRequires.forEach(function (url) {
      if (pj.endsIn(url,'.js')) {
        ui.isDirectDependency[url] = true;
      }
    });
  }
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
  var viewCodeAtUrl = function (index) {
    var url = theUrls[index];
    var code = pj.loadedScripts[url];
    ui.settingValue = true;
    ui.editor.setValue(code);
    ui.editor.clearSelection();
    ui.editor.scrollToLine(0);
    ui.selectedUrl = url;
    ui.selectedUrlIndex = index;
    if (moreThanOne) {
      var readOnly = !((url === ui.mainUrl) || ui.isDirectDependency[url]);//mbs  && (mbs !== url) && !fileIsOwned(url);
      highlight(url);
    }
    ui.editor.setReadOnly(readOnly);
    if (readOnly) {
      ui.readOnlySpan.$show();
    } else {
      ui.readOnlySpan.$hide();
    }
    if (readOnly || !fb.currentUser) {
       disableButton(ui.saveBut);
       disableButton(ui.saveAsBut);
    } else {
      enableButton1(ui.saveBut,fileIsOwned(url)&&ui.changed[url]);
      enableButton(ui.saveAsBut);
    }
    ui.settingValue = false;
  }
  var count = 0;
  theUrls.forEach(function (url) {
    var urlEl = html.Element.mk('<div style="display:inline-block;padding-right:10pt;font-size:10pt">'+url+' </div>');
    var thisCount = count++;
    if (moreThanOne) {
      urlEl.$click(function () {
        viewCodeAtUrl(thisCount);
      });
    }
    urlEls.push(urlEl);
    ui.elsByUrl[url] = urlEl;
  });
  if (theUrls.length > 1) {
    var mainEl = html.Element.mk('<div style="display:inline-block;padding-right:10pt;font-weight:bold;font-size:10pt">Main:</div>');
    var depEl = html.Element.mk('<div style="display:inline-block;padding-left:10pt;padding-right:10pt;font-weight:bold;font-size:10pt">Dependencies:</div>');
    var indirectEl = html.Element.mk('<div style="display:inline-block;padding-left:10pt;padding-right:10pt;font-weight:bold;font-size:10pt">Indirect Dependencies:</div>');
    ui.runCodeBut.$html('Run Main');
    var codeEls = [mainEl,urlEls[0],depEl];
 
    var rest = theUrls.slice(1);
    rest.forEach(function (url) {
       if (ui.isDirectDependency[url]) {
         codeEls.push(ui.elsByUrl[url]);
       }
    });
    codeEls.push(indirectEl);
    rest.forEach(function (url) {
       if (!ui.isDirectDependency[url]) {
         codeEls.push(ui.elsByUrl[url]);
       }
    });
    ui.codeUrls.__addChildren(codeEls);
  } else {
   ui.codeUrls.__addChildren(urlEls);
  }
  var urlsHt = ui.codeUrls.__element.offsetHeight;
  ui.codeDiv.$css({height:(ui.svght-urlsHt)+"px"});
  viewCodeAtUrl(0);//ui.mainUrl);
}

var runSource = function () {
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
    pj.root = rs;
    ui.installAsSvgContents(pj.root);
    svg.main.updateAndDraw();
    svg.main.fitContents(ui.fitFactor);

  });
}
  
ui.runCodeBut.$click(runSource);

setClickFunction(ui.saveAsBut,function () {
  if ((ui.selectedUrl===ui.mainUrl) && codeNeedsSaving()) {
    ui.alert('One or more dependencies need saving. This should be done before saving the main file');
    return;
  }
  fb.getDirectory(function (err,list) {
    popChooser(list,'saveCode');
  });
});

var enableButtons = function () {};
pj.updateErrorHandler = function (e) {
  alert(e);
}


ui.openStructureEditor = function () {
  var url = '/edit.html';
  if (ui.source && pj.endsIn(ui.source,'.js')) {
    url += '?source='+ui.source;
  }
  location.href = url;
}

