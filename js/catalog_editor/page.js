
  
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
      ui.addEntryBut= html.Element.mk('<div class="ubutton">Add Entry</div>'),
    // ui.viewDataBut = html.Element.mk('<div class="ubutton">View/Change Data</div>'),
      ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')
    ]),
    ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
  ]),

  cols = html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').__addChildren([
    
    ui.docDiv = docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
    
    ui.catalogDiv = html.Element.mk('<div id="svgDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').__addChildren([
         ui.catalogCol1 = html.Element.mk('<div id="col1" style="cursor:pointer;border:thin solid black;position:absolute;margin-left:20px;margin-top:40px"></div>'),
         ui.catalogCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;margin-right:20px;border:thin solid green;float:right;margin-top:40px"></div>')
    ]),
    
    ui.codeContainer =  html.Element.mk('<div id="codeContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([
      html.Element.mk('<div style="margin-bottom:5px"></div>').__addChildren([
        ui.closeCodeBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),
        ui.codeTitle = html.Element.mk('<span style="font-size:8pt;margin-left:10px;margin-right:10px">Data source:</span>'),
        ui.codeMsg =html.Element.mk('<span style="font-size:10pt">a/b/c</span>'), 
     ]),
     ui.codeError =html.Element.mk('<div style="margin-left:10px;margin-bottom:5px;color:red;font-size:10pt">Error</div>'),
      ui.codeButtons = html.Element.mk('<div id="codeButtons" style="bborder:solid thin red;"></div>').__addChildren([
         ui.updateBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Update</div>'),
      ]),
       ui.codeDiv = html.Element.mk('<div id="codeDiv" style="border:solid thin green;position:absolute;">Code Div</div>')
    ]),
    // insertContainer is used for opening from catalog
   
    
  
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
  uiWidth = pageWidth/2;

  //catalogwd = pageWidth/2; 
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
  var cataloght = pageHeight - actionHt -0;
  var panelHeaderHt = 26; // the area above the object/code/data/component panels 
  //var treeHt = svght;
 // tree.myWidth = treeInnerWidth;
  var tabsTop = "20px";
  //tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
  ui.catalogDiv.$css({id:"svgdiv",left:docwd+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
  ui.catalogHt = cataloght;
  ui.codeContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
  ui.codeDiv.$css({top:"80px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-80)+"px"});
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
    

var addEntry = function (path) {
  debugger;
  var uname = '['+fb.currentUid()+']';
  var ctxt = ui.editorValue();
  var newEntry = ',\n'+
                 '  {"title":"enter title here",\n'+
                 '   "svg":"'+uname+path+'",\n' +
                 '   "url":"enter url here"\n' +
                 '  }';
  var closeBracket = ctxt.lastIndexOf(']');
  var lf = ctxt.lastIndexOf('\n',closeBracket);
  var beforeInsert = ctxt.substring(0,lf-1);
  var afterInsert  = ctxt.substring(lf);
  var newText = beforeInsert+newEntry+afterInsert;
  ui.editor.setValue(newText);//rs

}
ui.chooserReturn = function (v) {
  debugger;
  mpg.chooser_lightbox.dismiss();
  switch (ui.chooserMode) {
    case "addEntry":
      addEntry(v.path);
      break;
    case 'saveCatalog':
      ui.saveItem(v.path,ui.editorValue());
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
   
ui.popChooser = function(keys,operation) {
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
 
ui.initFsel = function () {
 fsel.options = ["New Catalog","Open ...","Save","Save As..."]; 
 fsel.optionIds = ["new","open","save","saveCatalog"];
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

ui.setFselDisabled = function () {
   // ui.setPermissions();
   debugger;
   if (!fsel.disabled) {
      fsel.disabled = {};
   }
   var disabled = fsel.disabled;
   disabled.new = !ui.source;
   disabled.saveCatalog =  disabled.save = !fb.currentUser;
   if (fb.curentUser && !ui.source) {
     disabled.save = true;
   }
   fsel.updateDisabled();
}


var notSignedIn = function () {
  location.href = "https://prototype-jungle.org/sign_in.html"
}




fsel.onSelect = function (n) {
  var opt = fsel.optionIds[n];
  if (fsel.disabled[opt]) return;
  switch (opt) {
    case "new":
      location.href = "/catalogEdit.html";
      break;
    //case "save":
      
      //ui.resaveItem(pj.root);
     // break;
    case "save":
      debugger;
      ui.resaveItem();
      break;

    case "open":
    case "saveCatalog":
       fb.getDirectory(function (err,list) {
        ui.popChooser(list,opt);
      });
      break;
  }
}

ui.fileBut.$click(function () {
  ui.setFselDisabled();
  dom.popFromButton("file",ui.fileBut,fsel.domEl);
});

/* end file options section */

ui.addEntryBut.$click(function () {
    fb.getDirectory(function (err,list) {
        ui.popChooser(list,'addEntry');
      });
  });

 

 
ui.saveItem = function (path,code,cb,aspectRatio) { // aspectRatio is only relevant for svg, cb only for non-svg
  var needRestore = !!cb;
  var savingAs = true;
  var pjUrl = '['+fb.currentUid()+']'+path;
  ui.unselect();
  pj.saveItem(path,code?code:pj.root,function (err,path) {
    debugger;
    if (err) {
      ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
      return;
    } else if (cb) {
      cb(null,path);
      return;
    }
    var loc = '/catalogEdit.html?source='+pjUrl;
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


/*
ui.popInserts= function (charts) {
  debugger;
  selectedForInsert = undefined;
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.showTheCatalog(ui.insertDivCol1.__element,ui.insertDivCol2.__element,ui.catalogUrl);
}
*/
  
ui.alert = function (msg) {
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(msg);
}

var disableGray = "#aaaaaa";

var enableButton = ui.enableButton = function (bt,vl) {
  bt.disabled = !vl;
  bt.$css({color:vl?"black":disableGray});
}

ui.disableButton = function (bt) {
  enableButton(bt,false);
}


  
ui.itemSaved = true;

//var editor;
  var editorInitialized; 
  ui.initEditor =    function () {
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
      
    }
  }
  
  ui.editorValue = function () {
    return ui.editor.session.getDocument().getValue()
  }
  
  ui.showInEditor = function (str) {

       ui.initEditor();
       ui.codeUrl = url;
       ui.codeMsg.$html(url);
       pj.httpGet(url,function (error,rs) {
        ui.editor.setValue(rs);//rs
       });
  
  }
  
ui.showCatalog = function (url) {
     pj.getAndShowCatalog(ui.catalogCol1.__element,ui.catalogCol2.__element,0.75,url,null,
      function (err,catalog) {
        ui.catalogJSON = catalog;
        ui.initEditor();
        ui.editor.setValue(catalog);     
     });
}
  
ui.updateBut.$click(function () {
    ui.catalogJSON = ui.editor.getValue();
    try {
      var catalog = JSON.parse(ui.catalogJSON);
    } catch(e) {
      debugger;
      ui.codeError.$html(e.message);
      return;
    }
    pj.showCatalog(ui.catalogCol1.__element,ui.catalogCol2.__element,0.75,catalog);
  });

  ui.runSource = function () {
    var vl = ui.editorValue();
    pj.returnValue = function (err,rs) {
      debugger;
      pj.root = rs;
      tree.shownItem = rs;
      ui.installNewItem();
      svg.main.updateAndDraw();
      pj.tree.refreshValues();
    }
    eval(vl);
  }
  
  
  //stub
  ui.unselect = function () {};
  
