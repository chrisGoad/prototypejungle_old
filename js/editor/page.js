
  
// This is one of the code files assembled into pjui.js.

var treePadding = 0;
var bkColor = "white";
var docDiv;
var minWidth = 1000;
var plusbut,minusbut;
var flatInputFont = "8pt arial";
var uiDiv,editDiv,topbarDiv,obDivTitle;
var msgPadding = "5pt";
var inspectDom = false;
var uiWidth;
var insertKind;
ui.fitMode = false;
ui.editMode = false;
ui.insertMode = false;
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
      ui.replaceBut = html.Element.mk('<div class="ubutton">Alternate Marks</div>'),
     ui.viewDataBut = html.Element.mk('<div class="ubutton">View/Change Data</div>'),
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
     
    ui.editContainer =  html.Element.mk('<div id="editContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([
      html.Element.mk('<div style="margin-bottom:5px"></div>').__addChildren([
        ui.closeEditBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),
        ui.editTitle = html.Element.mk('<span style="font-size:8pt;margin-left:10px;margin-right:10px">Data source:</span>'),
        ui.editMsg =html.Element.mk('<span style="font-size:10pt">a/b/c</span>'), 
     ]),
     ui.editError =html.Element.mk('<div style="margin-left:10px;margin-bottom:5px;color:red;font-size:10pt">Error</div>'),
      ui.editButtons = html.Element.mk('<div id="editButtons" style="bborder:solid thin red;"></div>').__addChildren([
         ui.changeDataSourceBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Change Source</div>'),
         ui.uploadBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Upload</div>'),
      ]),
       ui.editDiv = html.Element.mk('<div id="editDiv" style="border:solid thin green;position:absolute;">Edit Div</div>')
    ]),
    
    /* the insert container is not currently in use */
    ui.insertContainer =  html.Element.mk('<div id="insertContainer" style="border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([
       ui.insertButtons = html.Element.mk('<div id="insertButtons" style="border:solid thin red;"></div>').__addChildren([
         ui.doInsertBut =html.Element.mk('<div style = "margin-left:30px" class="roundButton">Insert</div>'),
         ui.closeInsertBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

       ]),
       ui.insertDiv = html.Element.mk('<div id="insertDiv" style="border:solid thin green;position:absolute;"></div>').__addChildren([
          ui.insertIframe = html.Element.mk('<iframe width="99%" style="overflow:auto" height="200" scrolling="yes" id="insertIframe" />')
      ])
    ]),
    
    ui.replaceContainer =  html.Element.mk('<div id="replaceContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([
      ui.replaceButtons = html.Element.mk('<div id="replaceButtons" style="margin-left:10px"></div>').__addChildren([
       html.Element.mk('<span>Click to replace the marks with:</span>'),
       ui.closeReplaceBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

      ]),
      ui.replaceDiv = html.Element.mk('<div id="replaceDiv" style="position:absolute;"></div>').__addChildren([
       ui.replaceDivCol1 = html.Element.mk('<div id="col1" style="cursor:pointer;borderr:thin solid black;position:absolute;margin-left:20px;margin-top:40px"></div>'),
       ui.replaceDivCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;margin-right:20px;borderr:thin solid green;float:right;margin-top:40px"></div>')
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
  } else if (ui.replaceMode) {
    docwd = 0;
    uiWidth = pageWidth/3;
  } else if (ui.editMode) {
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
  if (ui.editMode) {
    ui.editContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.editDiv.$css({top:"80px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
    ui.editContainer.$show();
    uiDiv.$hide();
    ui.insertContainer.$hide();
    ui.replaceContainer.$hide();
  } else if (ui.insertMode) {
    ui.insertContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.insertDiv.$css({top:"20px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
    ui.insertContainer.$show();
    uiDiv.$hide();
    ui.editContainer.$hide();
    ui.replaceContainer.$hide();
  } else if (ui.replaceMode) {
    var rwd = (2/3) * uiWidth;
    ui.replaceContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth+ "px"),height:(svght-0)+"px"});
    ui.replaceDiv.$css({top:"20px",left:"0px",width:(uiWidth+ "px"),height:(svght-20)+"px"});
    ui.insertContainer.$hide();
    ui.replaceContainer.$show();
    uiDiv.$hide();
    ui.editContainer.$hide();
  } else {
    uiDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")});
    uiDiv.$show();
    ui.editContainer.$hide();
    ui.insertContainer.$hide();
    ui.replaceContainer.$hide();

  }
  docDiv.$css({left:"0px",width:docwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
  svg.main.resize(svgwd,svght); 
   svg.main.positionButtons(svgwd);
   var noteWidth = Math.min(svgwd-40,570);
   var noteLeft = 0.5 * (svgwd - 40 - noteWidth);
   tree.noteDiv.$css({left:noteLeft+"px",width:noteWidth +"px"});
   if (ui.editMode && ui.editDivContainsData) {
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
  

/* data sectioon */

/*update the current item from data */

ui.updateFromData =function (idata,url,cb) {
  debugger;
  var data;
  var ds = dat.findDataSource();
  if (!ds) {
    return;
  }
  var dataContainer = ds[0];
  if (typeof idata === 'string') {
    try {
      data = JSON.parse(idata);
    } catch (e) {
      debugger;
      ui.editError.$html(e.message);
      return;
    }
  } else {
    data = idata;
  }
  ui.editError.$html('');
  var dt = pj.lift(data);
  //dt.__sourceRelto = undefined;
  dt.__sourceUrl = url;
  dt.__requireDepth = 1; // so that it gets counted as a require on externalize
  dataContainer.__idata = undefined;
  try {
    dataContainer.__setData(dt);
  } catch (e) {
    debugger;
    if (e.kind === dat.badDataErrorKind) {
      ui.editError.$html(e.message);
    }
    return;
  }
  svg.main.updateAndDraw();
  pj.tree.refreshValues();
  if (cb) {
    cb();
  }
}

var htmlEscape = function (str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

var  delims = {',':1,':':1,'<':1,'>':1,';':1,' ':1,'\n':1};

var lastStringSplit = undefined;
var lastSplit = undefined;

var splitAtDelims = function (str,forPath) {
  if (forPath) {
    var isplit = str.split('/');
    var split = [];
    var ln = isplit.length;
    for (var i=0;i<ln;i++) {
      split.push(isplit[i]);
      if (i < ln-1) {
        split.push('/');
      }
    }
    return split;
  }
  if (lastStringSplit === str) {
    return lastSplit;
  }
  var ln = str.length;
  var rs = [];
  var word = '';
  for (var i=0;i<ln;i++) {
    var c = str[i];
    if (delims[c]) {
      rs.push(word);
      word = '';
      rs.push(c);
    } else if (c !== '\r') {
      word += c;
    }
  }
  if (word) {
    rs.push(word);
  }
  lastStringSplit = str;
  lastSplit = rs;
  return rs;
}
var wordWrap = function (str,maxLength,forPath) {
  var split = splitAtDelims(str,forPath);
  debugger;
  var rs = '';
  var currentLength = 0;
  split.forEach(function (word) {
    if (word) {
      if (word === '\n') {
        if (rs[rs.length-1] != '\n') {
          rs += word;
        }
        currentLength = 0;
        return;
      }
      var wln = word.length;
      if (wln + currentLength > maxLength) {
        rs += '\n';
        currentLength = wln;
      } else {
        currentLength += wln;
      }
      rs += word;
    }
  });
  return rs;
}





ui.viewData  = function (idata) {
  var dataString;
  var isString = typeof idata === 'string';
  if (isString) {
    ui.dataString = idata;
    dataString = idata;
  } else if (idata === undefined) {
    dataString = ui.dataString;
  }
  isString = typeof dataString === 'string';
  if (!ui.editMode) {
    ui.editMode = true;
    ui.replaceMode = false;
    ui.layout();
  }
  debugger;
  ui.editDivContainsData = true;
  if (!isString) {
    ui.editDiv.$html('');
    return;
  }
  var wwd  = uiWidth;
  debugger;
  var maxLength = Math.floor((wwd/622)*84);
  var htmlString = '<pre>'+htmlEscape(wordWrap(dataString,maxLength))+'</pre>';
  ui.editDiv.$html(htmlString);
  ui.viewDataUrl();
}

var dataUrl;

ui.viewDataUrl = function () {
  var wwd  = uiWidth;
  var maxLength = Math.floor((wwd/622)*84);
  var wrapped = wordWrap(dataUrl,maxLength,true);
  ui.editMsg.$html(wrapped);
}

ui.viewAndUpdateFromData =  function (data,url,cb) {
  ui.viewData(data);
  ui.clearError();
  if (!pj.throwOnError) {
    ui.updateFromData(data,url,cb);
    ui.updateTitleAndLegend();
  } else {
    try {
      ui.updateFromData(data,url,cb);
      ui.updateTitleAndLegend();
    } catch (e) {
      ui.handleError(e);
    }
  }
}

ui.getDataJSONP = function (url,initialUrl,cb,dontUpdate) {
  debugger;
  pj.returnData = function (data) {
      if (dontUpdate) {
         ui.viewData(data,url);
        if (cb) {
          cb();
        }
      } else {
        ui.viewAndUpdateFromData(data,initialUrl,cb);
      }
    }
  pj.loadScript(url);
}

ui.getDataJSON = function (url,initialUrl,cb,dontUpdate) {
  debugger;
  pj.httpGet(url,function (erm,rs) {
    if (dontUpdate) {
       ui.viewData(rs);
      if (cb) {
        cb();
      }
    } else {
      ui.viewAndUpdateFromData(rs,initialUrl,cb);
    }
  });
}

ui.getData = function (url,initialUrl,cb,dontUpdate) {
  debugger;
  var ext = pj.afterLastChar(initialUrl,'.');
  if (ext === 'json') {
    ui.getDataJSON(url,initialUrl,cb,dontUpdate);
  } else if (ext === 'js') {
    ui.getDataJSONP(url,initialUrl,cb,dontUpdate);
  }
}

ui.uploadBut.$click(function () {
  ui.editDivContainsData = false;
  ui.editDiv.$html('<iframe width = "100%" height="100%" src="/upload.html"></iframe>');
});
  
ui.changeDataSourceBut.$click(function () {
   fb.getDirectory(function (err,list) {
     ui.popChooser(list,'dataSource');
  });
})
  
  

ui.viewDataBut.$click(function () {
  ui.hideFilePulldown();
  var ds = dat.findDataSource();
  if (ds) {
    debugger;;
  
    //ui.saveEditBut.$html('Save data');
    ui.editTitle.$html('Data source:');
    var url = ds[1];
    dataUrl = url;
    //var afterFetch = function () {ui.viewDataUrl(url);};//ui.editMsg.$html(url);};
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

/* end data section */ 

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
  var ext = pj.afterLastChar(path,'.');
  var path0 = path[0];
  
  //var viaDatabase = path0 === '/';  // url has the form [uid]path .. that is, it is a reference via the user's database, which in turn points to storage
  var viaDatabase = path0 === '[';  // url has the form [uid]path .. that is, it is a reference via the user's database, which in turn points to storage
  if (viaDatabase) {
    if ((ext === 'js') || (ext === 'json')) {
      var url = pj.indirectUrl(path);
      var displayUrl = path;
      /*
      if (pj.beginsWith(path,'/')) {
         var rpath = path.replace('.',pj.dotCode);
         var uid = fb.currentUser.uid;
         var url = fb.firebaseHome+'/'+uid+'/directory'+rpath+'.json';
         var displayUrl = '['+uid+']'+path;
       } else {
         pj.error('CASE NOT HANDLED YET');
       }
       */
       pj.httpGet(url,function (erm,rs) {
         var cleanUp = ui.removeToken(JSON.parse(rs));
         ui.getData(cleanUp,displayUrl,function () {
               //ui.editMsg.$html(displayUrl);
         });    
       });
    } else {
      pj.error('Data files should have extension js or json')
    }
  } else {
    ui.getData(path,path,function () {
               ui.editMsg.$html(path);
         });
  }
}

ui.removeBracketsFromPath = function (path,addS,includeUid) {
  debugger;
  if (path[0] === '[') {
    var closeBracket = path.indexOf(']');
    var uid = path.substring(1,closeBracket);
    if (uid !== fb.currentUid()) { // opening files is supported only for the directory of the signed in user, so far
      pj.error('Not yet');
    }
    var rest = path.substring(closeBracket+(includeUid?1:2));
    var rs = (includeUid?uid:'')+(addS?'/s':'')+rest;
    return rs;
  } else {
    return path;
  }
}
ui.chooserReturn = function (v) {
  debugger;
  mpg.chooser_lightbox.dismiss();
  switch (ui.chooserMode) {
    case'saveAs':
      ui.saveItem(v.path);
      break;
   case'saveAsSvg':
     debugger;
      ui.saveItem(v.path,undefined,1.25);
      break;
   case 'insertOwn':
      insertOwn(v);
      break;
    case 'open':
      if (v.deleteRequested) {
        ui.deleteFromDatabase(v.path);
        return;
      }
     var ext = pj.afterLastChar(v.path,'.',true);
     if (ext) {
       var url = ui.removeBracketsFromPath(v.path);
       fb.directoryValue(url,function (err,iurl) {
         debugger;
         url = ui.removeToken(iurl);
         if (ext === '.svg') {
           location.href = '/svg.html?svg='+encodeURIComponent(url);
         } else {
           location.href = '/viewtext.html?file='+encodeURIComponent(url);

         }
       });
       return;
     }
     //var storeRefString = fb.storeRefString();
      //var url = '/' + storeRefString +  v.path;
      var url = '/'+ui.removeBracketsFromPath(v.path,true,true);
      var page = 'edit.html';//pj.devVersion?'editd.html':'edit.html';
      var dst = '/'+page+'?'+(pj.endsIn(url,'.js')?'source=':'item=')+url;
      location.href = dst;
      break;
    case "viewSource":
      ui.getEditText("/"+v.path);
      break;
    case "dataSource":
     debugger;
      var path = v.path;
      ui.loadAndViewData(path);
      break;
  }
}
   
ui.popChooser = function(keys,operation) {
  debugger;
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
  if (pj.developerVersion) {
    fsel.options = ["New Item","New Scripted Item","Open...","Insert Chart...","Add title/legend","Insert own item  ...","View source...","Save","Save As...","Save As SVG..."]; 
    fsel.optionIds = ["new","newCodeBuilt","open","insertChart","addLegend","insertOwn","viewSource","save","saveAs","saveAsSvg"];
  } else {
    fsel.options = ["Open...","Insert...","Add title/legend","Save","Save As...","Save As SVG..."]; 
    fsel.optionIds = ["open","insert","addLegend","save","saveAs","saveAsSvg"];
  }
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

ui.completeInsert = function (svgPoint) {
  console.log('completing insert at ',JSON.stringify(svgPoint));
  ui.insertItem(ui.nowInserting.url,ui.nowInserting.name,svgPoint);
}
var listAndPop = function (opt) {
  fb.getDirectory(function (err,list) {
    ui.popChooser(list,opt);
  });
}

ui.hasTitleLegend = function () {
  var  ds = dat.findDataSource();
  if (!ds) {
    return {};
  }
  var dt = ds[0].__getData();
  return {hasTitle:!!dt.title,hasLegend:!!dt.categories};
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
      //ui.addTitleAndLegend();
      ui.updateTitleAndLegend('add');
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
    case "open":
    case "insertOwn":
    case "saveAs":
    case "saveAsSvg":
    case "viewSource":
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
 
ui.fileBut.$click(function () {
  ui.setFselDisabled();
  dom.popFromButton("file",ui.fileBut,fsel.domEl);
});

/* end file options section */

 
var aboveOffset = geom.Point.mk(20,-10);
var toRightOffset = geom.Point.mk(20,10);

var updateTitleAndLegend1 = function (titleBox,legend,chart) {
  var itmBounds;
 
  var chartBounds = chart.__bounds();
  var bindChart = function (x) {
    x.forChart = chart;
    x.__newData = true;
    x.__update();
    return x.__bounds();   
  }
  if (titleBox) {
    titleBox.__show();
    itmBounds = bindChart(titleBox); 
    var above = chartBounds.upperLeft().plus(
                  geom.Point.mk(0.5*itmBounds.extent.x,-0.5*itmBounds.extent.y)).plus(aboveOffset);
    titleBox.__moveto(above);
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

ui.updateTitleAndLegend  = function (add) {
  var  ds = dat.findDataSource();
  var chart = ds[0];
  var dt = chart.__getData();
  var legend = pj.root.legend;
  var title = pj.root.titleBox;
  var hasTitleOrLegend = title || legend;
  var needsLegend = (add || hasTitleOrLegend) && dt.categories;;
  var needsTitle = add ||  hasTitleOrLegend && dt.title;
  if (!(needsTitle || needsLegend)) {
    return;
  }
  var newTitle = needsTitle && !title;
  var newLegend = needsLegend && !legend;
  var titleToUpdate = needsTitle?title:undefined;
  var legendToUpdate = needsLegend?legend:undefined;
  updateTitleAndLegend1(titleToUpdate,legendToUpdate,chart)
  if (title && !needsTitle) {
    title.__hide();
  }
  if (legend && !needsLegend) {
    legend.__hide();
  }
  if (newTitle) {
    ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',function () {
      if (newLegend) {
        ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',function () {svg.main.fitContents();});
      } else {
        svg.main.fitContents();
      }
    });
  } else if (newLegend) {
    ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',function () {svg.main.fitContents();});
  }
}
      


var whereToInsert,positionForInsert;
var afterInsert = function (e,rs) {
  var irs = rs.instantiate();
  pj.root.set(whereToInsert,irs);
  if (positionForInsert) {
    irs.__moveto(positionForInsert);
  }
  var  ds = dat.findDataSource();
  var chart = ds[0];
  if (insertKind === 'legend') {
    updateTitleAndLegend1(null,irs,chart);
  } else if (insertKind === 'title') {
    updateTitleAndLegend1(irs,null,chart);
  }
}
/* if ((insertKind === 'legend') || (insertKind === 'title')) {
    var  ds = dat.findDataSource();
    irs.forChart = ds[0];
    irs.__newData = true;
    irs.__update();
    var irsBounds = irs.__bounds();
    var chartBounds = irs.forChart.__bounds();
    debugger;
    if (insertKind === 'title') {
      var above = chartBounds.upperLeft().plus(
                  geom.Point.mk(0.5*irsBounds.extent.x,-0.5*irsBounds.extent.y)).plus(aboveOffset);
      irs.__moveto(above);
    } else {
      var toRight = chartBounds.upperRight().plus(
                  geom.Point.mk(0.5*irsBounds.extent.x,0.5*irsBounds.extent.y)).plus(toRightOffset);
      irs.__moveto(toRight);
    }
  //  svg.main.fitContents();
    if (insertKind === 'legend') {
      irs.setColorsFromChart();
    }
  }
  ui.refresh();
  if (ui.nowInserting) {
    irs.__select('svg');
    ui.nowInserting = undefined;
  }
  }
  */

  
ui.insertItem = function (path,where,position,kind,cb) {
  insertKind = kind;
  positionForInsert = position;
  whereToInsert = where;
  pj.install(path,function (erm,rs) {
    afterInsert(erm,rs);
    if (cb) {cb()}
  });
}

var installSettings;

var doReplacement = function (e,rs) {
  var irs = rs.instantiate();
  if (installSettings) {
    irs.set(installSettings);
  }
  irs.__hide();
  pj.replaceableSpread.replacePrototype(irs);
}

ui.replaceItem = function (path,settings) {
  installSettings = settings;
  pj.install(path,doReplacement);
}

var insertOwn = function (v) {
  ui.insertItem('/'+v.path,v.where);
}
  
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
    enableButton(ui.upBut,isp);
    enableButton(ui.topBut,isp);
    enableButton(ui.downBut,isc);
  }
 
 ui.enableTreeClimbButtons = enableTreeClimbButtons;

ui.topBut.$click(function () {
  if (ui.topBut.disabled) return;
  var top = tree.getParent(1);
  if (top) {
    top.__select('svg');
  }
  //tree.showTop();
  enableTreeClimbButtons();
});

ui.upBut.$click (function () {
  if (ui.upBut.disabled) return;
  var pr = tree.getParent();
  if (pr) {
    pr.__select('svg');
  }
  //tree.showParent();
  enableTreeClimbButtons();
});


ui.downBut.$click(function () {
  if (ui.downBut.disabled) return;
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

 
ui.saveItem = function (path,cb,aspectRatio) { // aspectRatio is only relevant for svg, cb only for non-svg
  var needRestore = !!cb;
  var savingAs = true;
  var isSvg = pj.endsIn(path,'.svg');
  ui.unselect();
  pj.saveItem(path,pj.root,function (err,path) {
    // todo deal with failure
    if (err) {
      ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
      return;
    } else if (cb) {
      cb(null,path);
      return;
    }
    if (isSvg) {
      var loc = '/svg.html?svg='+encodeURIComponent(path);
    } else {
      var loc = '/edit.html?item=/'+path;//(pj.devVersion?'/editd.html':'/edit.html')+'?item=/'+path;
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
  ui.saveItem(ui.itemPath,doneSaving);
}

/* Replacement section */

ui.getReplacements = function (selnd) {
  var spread = pj.ancestorThatInheritsFrom(selnd,pj.Spread);
  if (spread && spread.replacements) {
    return spread.replacements();
  }
}


var repDiv = html.Element.mk('<div style="displayy:inline-block"/>');
repDiv.set('img',html.Element.mk('<img width="150"/>'));
repDiv.set('txt',html.Element.mk('<div style="text-align:center">TXT</div>')); 

ui.replaceBut.$click(function () {
  debugger;
  ui.hideFilePulldown();
  var i;
  var replacements =  pj.replaceableSpread.replacements();//ui.getReplacements(pj.selectedNode);
  if (!replacements) {
    return;
  }
  ui.insertMode = false;
  ui.editMode = false;
  ui.replaceMode = true;
  ui.layout();
  ui.replaceDivCol1.$empty();
  ui.replaceDivCol2.$empty();
  var ln = replacements.length;
  var repEls1 = [];
  var repEls2 = [];
  var allEls = [];
  var highlightEl = function (el) {
    allEls.forEach(function (anEl) {
      if (anEl === el) {
        anEl.$setStyle('border','solid  red');
      } else {
        anEl.$setStyle('border','solid thin black');
      }
    });
  }
  var mkClick = function (el,dest,settings) {
    return function() {
      highlightEl(el);
      debugger;
      ui.unselect();
      ui.replaceItem(dest,settings)};
  }
  for (i=0;i<ln;i++) {
    var replacement = replacements[i];
    var repEl = repDiv.instantiate();// replacement.svg;
    repEl.img.width = (uiWidth/2 - 40)+'';
    repEl.img.src = replacement.svg;
    repEl.txt.$html(replacement.title);
    repEl.$click(mkClick(repEl,replacement.url,replacement.settings));
    if (i%2) {
      repEls2.push(repEl);
    } else {
      repEls1.push(repEl);
    }
    allEls.push(repEl);
  }
  ui.replaceDivCol1.__addChildren(repEls1);
  ui.replaceDivCol2.__addChildren(repEls2);
  highlightEl(allEls[allEls.length-1]); // by convention the original proto is la
  
  });
/* end Replacement section */


ui.closeSidePanel = function () {
  if (!ui.insertMode && !ui.editMode && !ui.replaceMode) {
    return;
  }
  ui.insertMode = false;
  ui.editMode = false;
  ui.replaceMode = false;
  ui.layout();
}


ui.closeEditBut.$click(ui.closeSidePanel);

ui.closeInsertBut.$click(ui.closeSidePanel);
 


ui.closeReplaceBut.$click(ui.closeSidePanel);


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
 

