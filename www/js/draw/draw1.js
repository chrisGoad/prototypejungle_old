
// scheme for saving.  for a code built, owned item, objects, internal data, objects, code, and components can all be modified
//modifying any of the last three means a new build is needed.  build brings all into sync, and if it fails, records that failure
// at s3.  A missing of failed build item is called unbuilt. (the data.js file will record this). Save from the file menu just saves,
// and if the build is out of sync, turns this unbuilt. modification of objects makes the code read only and of code makes the
// objects read only 

(function (pj) {
  var actionHt;
  
  var ui = pj.ui;
  var dom = pj.dom;
  var html = pj.html;
  var geom = pj.geom;
  var svg = pj.svg;
  var tree = pj.tree;
  var lightbox = pj.lightbox;
 
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

// this is called from the chooser. Used in insert or duplicate to manage target for the insertion/duplication
  var notInAssembly = {__inserts:1,transform:1,__requires:1};
  
  ui.describeAssembly = function (inode) {
    var node = inode?inode:ui.root;
    if (node.__isPart) {
      return "part";
    }
    var rs = {};
    pj.forEachTreeProperty(node,function (child,prop) {
      if (notInAssembly[prop]) {
        return;
      }
      var sub = ui.describeAssembly(child);
      rs[prop] =  sub;
    });
    return rs;
  }



  var geom = pj.geom;
  var treePadding = 0;//10;
  var bkColor = "white";
  var docDiv;
  var minWidth = 1000;
  var plusbut,minusbut;
  var flatInputFont = "8pt arial";
  var uiDiv,topbarDiv,obDivTitle;//topNoteDiv,
  var msgPadding = "5pt";
  var inspectDom = 0;
  ui.fitMode = 0;
  var unpackedUrl,unbuiltMsg;
  //ui.docMode = 1;
  ui.saveDisabled = 0; // true if a build no save has been executed.
  
  var buttonSpacing = "10px";
  var buttonSpacingStyle = "margin-left:10px";
   var jqp = pj.jqPrototypes;
   // the page structure
  var mainTitleDiv = html.wrap('mainTitle','div');
  // note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed. 
    var test=html.Element.mk('<div class="roundButton">Top</div>');
    
  var mpg = ui.mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).addChildren([
    topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",height:"10px",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).addChildren([
  
    actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').addChildren([
        ui.fileBut = html.Element.mk('<div class="ubutton">File</div>'),
        ui.aboutBut = html.Element.mk('<div class="ubutton">About</div>'),
        ui.shareBut = html.Element.mk('<div class="ubutton">Share</div>'),
        ui.helpBut = html.Element.mk('<div class="ubutton">Help</div>'),
        ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')

      ]),
      ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
    ]),

    

    cols =  html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').addChildren([
      ui.docDiv =  docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
      ui.svgDiv = html.Element.mk('<div id="svgDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
        tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').addChildren([
          ui.noteSpan = html.Element.mk('<span>Click on things to adjust them.</span>'),
          ui.upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
          ui.downBut =html.Element.mk('<div class="roundButton">Down</div>'),
          ui.topBut =html.Element.mk('<div class="roundButton">Top</div>')
        ])
     ]),
    tree.objectContainer = uiDiv = html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"/>').addChildren([
             tree.obDivRest = tree.obDiv = html.Element.mk('<div id="obDiv" style="position:absolute;background-color:white;border:solid thin blue;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>').addChildren([
                            html.Element.mk('<div style="margin-bottom:0px;border-bottom:solid thin black"/>').addChildren([
                              obDivTitle = html.Element.mk('<span style="margin-bottom:10px;border-bottom:solid thin black">Workspace</span>')
             ]),
        ])
      ])
    ])
  ]);
  
  
  var cnvht = "100%"

  
  ui.intro = 0;
   
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = 1;
  ui.layout = function(noDraw) { // in the initialization phase, it is not yet time to __draw, and adjust the transform
    // aspect ratio of the UI
    var bkg = "gray";
    var svgwd = 500;
    var svght = 500;
    var ar = 0.5;
    var pdw = 0;// minimum padding on sides
    var wpad = 0;
    var vpad = 0;//minimum sum of padding on top and bottom
    var cdims = geom.Point.mk(svgwd,svght);
    var awinwid = $(window).width();
    var awinht = $(window).height();
    var pwinwid = awinwid - 2 * wpad;
    var pwinht = awinht - 2 * vpad;
    if (0 && (pwinwid < minWidth)) {
      var ppageWidth = minWidth; // min size page
      var lrs = pdw;
    } else if (pwinht < ar * pwinwid) { // the page is bounded by height 
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
    if (ui.intro) {
      var docwd = 0.25 * pageWidth;
      var svgwd = (0.5 * pageWidth);
    } else {
      docwd = 0;
      svgwd = 0.75 * pageWidth;
    }
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    var treeInnerWidth = treeOuterWidth - twtp;
    mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-0)+"px"});
    var topHt = 20+topbarDiv.__element.offsetHeight;
    cols.$css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
    uiDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")})
    ui.ctopDiv.$css({"padding-top":"0px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});
    var actionLeft = ui.includeDoc?docwd +10 + "px":"200px";
    actionDiv.$css({width:(uiWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
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
  docDiv.$css({left:"0px",width:docwd+"px",top:topHt+"px",height:svght+"px",overflow:"auto"});
   svg.main.resize(svgwd,svght); 
    svg.main.positionButtons(svgwd);
    tree.noteDiv.$css({"width":(svgwd - 140)+"px"});
    if (firstLayout) {
      firstLayout = 0; 
      ui.layout();
    }
    if (!noDraw) {
      svg.main.fitContents();
    }
  }
  
  
  
   ui.addButtons = function (div,navTo) {
    var plusbut,minusbut,navbut;
    var divel = div.__element;
    ui.plusbut = plusbut = html.Element.mk('<div id="plusbut" class="button" style="position:absolute;top:0px">+</div>');
    ui.minusbut = minusbut = html.Element.mk('<div id="minusbut" class="button" style="position:absolute;top:0px">&#8722;</div>');
    ui.navbut = navbut = html.Element.mk('<div id="navbut" class="button" style="position:absolute;top:0px">'+navTo+'</div>');
    plusbut.__addToDom(divel);
    minusbut.__addToDom(divel);
    navbut.__addToDom(divel);
   // this.initButtons();
  }
  
  

  ui.positionButtons = function (wd) {
    if (ui.plusbut) {
      ui.plusbut.$css({"left":(wd - 50)+"px"});
      ui.minusbut.$css({"left":(wd - 30)+"px"});
      ui.navbut.$css({"left":"0px"});
    }
  }
  
   // now this is an occaison to go into flat mode
   // called from graphical select (svgx)
  ui.setInstance = function (itm) {
    if (!itm) {
      return;
    }
    ui.topBut.$show();
    ui.upBut.$show();
    tree.showItem(itm,itm.selectable?"expand":"fullyExpand",1);
    tree.showProtoChain(itm);
    ui.upBut.$show();
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
  tree.obDiv.click = function () {
    dom.unpop();
  };
  
  
  tree.viewNote = function(k,note) {
    var h = k?'<b>'+k+':</b> '+note:note;
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(h)
    return;
  }
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 

   

  var annLink = html.Element.mk('<div/>');
  annLink.addChild('caption',html.Element.mk('<div/>'));
  annLink.addChild('link',html.Element.mk('<div/>'));
  
  

  var workerIsReady = 0;
  var whenWorkerIsReady;
  ui.messageCallbacks.workerReady = function () {
    workerIsReady = 1;
    if (whenWorkerIsReady) {
      whenWorkerIsReady();
    }
 }

  ui.messageCallbacks.dismissChooser = function () {
    mpg.chooser_lightbox.dismiss();
  }
 
   //path will be supplied for saveAs
  // called from the chooser
  // This is for saving variants
  
  ui.pjpathToRepoAndPath = function (pjpath) {
    var fpathS = pjpath.split("/");
    var repo =  ui.itemHost + "/" + fpathS.slice(1,3).join("/");
    var path = fpathS.slice(3).join("/");
    return [repo,path];
  }
 
   ui.anonSave = function () { 
    var needRestore = 0;
    var savingAs = 1;
    pj.mkXItemsAbsolute(ui.root.__requires,ui.repo);
    pj.anonSave(ui.root,function (srs) {
      // todo deal with failure
      if (srs.status==='fail') {
        if (srs.msg === 'maxPerIPExceeded') {
          var errmsg = "The save rate is throttled. Please save, but not so often.";
        } else {
          errmsg = "The site is busy. Please try again later";
        }
        ui.displayTemporaryError(ui.messageElement,errmsg,5000);
        return;
      } else {
        var path = srs.value;
        var destPage = ui.useMinified?"/charts":"chartsd";
        var loc = destPage +"?item="+path;
        location.href = loc;
      }
    });
  }
 
  function prototypeSource(x) {
    var p = Object.getPrototypeOf(x);
    return pj.pathExceptLast(p._pj_source);// without the /source.js
  }
    
  
  
  
  
  //actionDiv.addChild("messageElement",ui.messageElement);
 
  var signedIn,itemOwner,objectsModified;
  
  ui.setPermissions = function() {
    signedIn = pj.signedIn();
    ui.signedIn = signedIn;
    var h = ui.handle;
    itemOwner = ui.itemOwner = signedIn && (h===localStorage.handle);
    ui.objectsModified = 0;
  }
  
   
 
  // file options pulldown 
  
  var fsel = ui.fsel = dom.Select.mk();
  
  fsel.containerP = html.Element.mk('<div style="position:absolute;padding-left:5px;padding-right:5px;padding-bottom:15px;border:solid thin black;background-color:white"/>');
  
  fsel.optionP = html.Element.mk('<div class="pulldownEntry"/>');
          
  var fselJQ;
  
  ui.initFsel = function () {
    fsel.options = ["New","Data source...","Save"]; 
    fsel.optionIds = ["new","dataSource","save"];
   var el = fsel.build();
    mpg.addChild(el);
    el.$hide();
  }
  
  ui.setFselDisabled = function () {
      ui.setPermissions();
     if (!fsel.disabled) {
        fsel.disabled = {};
     }
     fsel.updateDisabled();
  }
      
  
  ui.closer = html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;'+
			     'font-weight:bold,border:thin solid black;font-size:12pt;color:black">X</div>');
  var insertClose = ui.closer.instantiate();
  ui.insertIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="chooser" src="notyet"/>');
  
  var insertDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="insertDiv" />').addChildren([
    insertClose,
    ui.insertIframe
  ]);
  
  var insertsBeenPopped = 0;

  ui.insertsCurrentlyDisabled = {'Columnmm':1,'Textt':1};
  
  ui.insertsDisabled = function () { // called from the insert panel
    return ui.insertsCurrentlyDisabled;
  }
  
  ui.popInserts = function(icat) {
    var category = (icat === 'replace')?'shapes':icat;
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.insert_lightbox;
    var fsrc = pj.isDev?"/insert_chartd.html":"insert_chart.html"; 
    ui.insertIframe.src = fsrc;
    if (!insertsBeenPopped) {
      lb.setContent(insertDiv);
      insertsBeenPopped = 1;
    } else {
      ui.insertIframe.__element.src = fsrc;
    }
    window.setTimeout(function () {lb.pop(undefined,undefined,1);},300);
  }
  
  
  insertClose.$click(function () {
    mpg.insert_lightbox.dismiss();
  });

 
  
  ui.partsWithDataSource = function () {
    var rs = [];
    pj.forEachPart(ui.root,function (node) {
      if (node.dataSource) {
        rs.push(node);
      }
    });
    return rs;
  }
  
  // returns the dataSource of some part, if only one part has a dataSource.
  
  ui.getPartDataSource = function () {
    var pwd = ui.partsWithDataSource();
    if (pwd.length===1) {
      return pwd[0].dataSource;
    }
  }
  
  
  var dataSourceClose = ui.closer.instantiate();
  var dataSourceInput,loadDataButton,installDataButton,dataError,dataTextarea,theLoadedData,theDataSource,
   alternativeData;
  
  var dataLines = function (els) {
    var rs = "[\n";
    var ln = els.length;
    for (var i=0;i<ln;i++) {
      var el = els[i];
      rs += JSON.stringify(el);
      if (i<ln-1) rs += ",";
      rs += '\n';
    };
    rs += "]";
    return rs;
  }
  
  
  ui.showTheData = function (data) {
     var fields = "fields:"+JSON.stringify(data.fields);
    var els = "elements:"+dataLines(data.elements);
    var  dts = "{"+els+",\n"+fields+"}";
    dataTextarea.$html(dts); 
  }
  
  ui.showDataError = function (msg,eraseText) {
    dataError.$html(msg);
    if (eraseText) {
      dataTextarea.$html('');
    }
  }
 
  var dataHasBeenLoaded 
  ui.loadTheData = function () {
     var ds = dataSourceInput.$prop('value');    
    pj.loadData(ds,function (err,rs) {
      if (err) {
        ui.showDataError(err,1);
        return;
      }
      dataError.$html(''); 
      theLoadedData = rs;
      theDataSource = ds;
       ui.showTheData(rs);
       var markType = ui.insertedItem.markType;
       markType = markType?markType:'[N|S],N';
      try {
        var intData =  dat.internalizeData(theLoadedData,markType);
      } catch (e) {
        ui.showDataError('Bad format');
        return;
      }
      mpg.datasource_lightbox.dismiss();
      ui.completeTheInsert(intData,theLoadedData,theDataSource);
    });
  } 
  
  var escapeMap = {'<':'&lt;','>':'&gt;','"':'&quot;','&':'&amp;'};
   
  ui.htmlEscape = function (s) { 
    var r = /\<|>|\"/g;
    return s.replace(r,function (c) {return escapeMap[c]});
  }
  
  ui.dataSourceDiv = html.Element.mk('<div width="100%" height="100%"  style="background-color:white" id="DataSourceSelector" />').addChildren([
    dataSourceClose,
    html.Element.mk('<div style="padding-top:40px;padding-left:20px"><span>Data Source:</span></div>').addChild(
      dataSourceInput = html.Element.mk('<input type="text" style="width:400px"/>')),
    html.Element.mk('<div></div>').addChildren([
      loadDataButton = html.Element.mk('<div class="roundButton">Load Data</div>'),
      dataError = html.Element.mk('<span style="padding-left:10pt;color:red">An error</span>')]),
      alternativeDataDiv = html.Element.mk('<div style="padding:20px"></div>'),
    html.Element.mk('<div></div>').addChild(
      dataTextarea  = html.Element.mk('<textarea rows="25" cols="80" style="font-size:8pt"></textarea>')
    )
  ]);
  
  var addDataAlternatives = function (urls) { 
    alternativeDataDiv.innerHtml = '';
    if (!urls) {
      return;
    }
    alternativeDataDiv.addChild(html.Element.mk('<div>Sample Data Sources:</div>'));
    var alternativeEls = [];
    var selectEl = function (sel) {
      var idx = 0; 
      alternativeEls.forEach(function (el) { 
        var selUrl = urls[idx++];
        var txt = (el === sel)?'<span> &#x25CF; </span><span style="position:absolute;left:30px;">'+selUrl+'</span>':
                                '<span style="padding-left:30px;">'+selUrl+'</span>';
        el.$html(txt);
      });
    }
    urls.forEach(function (url) {
      var el = html.Element.mk('<div style="position:relative"/>');
      alternativeDataDiv.addChild(el);
      alternativeEls.push(el);
      el.$click(function () {
        selectEl(el);
        dataSourceInput.$prop('value',url);
      });
      selectEl(alternativeEls[0]);   
    })
  }
  
  dataSourceClose.$click(function () {
    mpg.datasource_lightbox.dismiss();
  });
  
  loadDataButton.$click(ui.loadTheData);
 // installDataButton.$click(ui.installTheData);
  
  var dataSourceSelectorBeenPopped = 0; 
  
  ui.popDataSourceSelector = function() {
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.datasource_lightbox; 
    lb.pop(undefined,undefined,1);
    var urls = ui.insertedItem.alternativeDataSources;
    if (!dataSourceSelectorBeenPopped){
      lb.setContent(ui.dataSourceDiv);
      dataSourceSelectorBeenPopped = 1;
      addDataAlternatives(urls); 
    }
    dataError.$html(''); 
    var pwds = ui.partsWithDataSource();
    if (pwds.length === 1) {
      var pwd = pwds[0];
      ui.dataSourceItem = pwd;
      var ds = pwd.dataSource;  
      dataSourceInput.$prop('value',ds);
      if (pwd.__xdata) {
        ui.showTheData(pwd.__xdata); 
      }
    }
  }
  
  var buildClose = ui.closer.instantiate();
  var buildButton,codeDiv;
  
   
  ui.buildDiv = html.Element.mk('<div width="100%" height="100%"  style="background-color:white" id="BuildDiv" />').addChildren([
    buildClose,
    buildButton = html.Element.mk('<div class="roundButton">Build</div>'),
    codeDiv = html.Element.mk('<div id="codeDiv"></div>')
  ]);
  
  buildClose.$click(function () {
    mpg.build_lightbox.dismiss();
  });
  
  buildButton.$click(ui.doTheBuild);
  
  var buildBeenPopped = 0; 
  
  ui.popBuild = function() {
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.build_lightbox; 
    lb.pop(undefined,undefined,1);
    codeDiv.$css({width:"200px",height:"300px"});

    if (!buildBeenPopped){
      lb.setContent(ui.buildDiv);
      buildBeenPopped = 1;
      codeEditor = ace.edit("codeDiv");
      codeEditor.setTheme("ace/theme/TextMate");
      codeEditor.getSession().setMode("ace/mode/javascript");
    }

  }
  
  ui.useSvgInsert = 1;
  fsel.onSelect = function (n) {
    var opt = fsel.optionIds[n];
    if (fsel.disabled[opt]) return;
    if (opt === "new") {
      var chartsPage = ui.useMinified?"/charts":"/chartsd";
      location.href = chartsPage;
    }
    if (opt === "save") {
      ui.messageElement.$html("Saving ...");
      dom.unpop();
      ui.anonSave();
    } else if ((opt === "insertShape") && ui.useSvgInsert) {
      ui.popInserts('shapes');
    } else if ((opt === "insertChart") && ui.useSvgInsert) {
      ui.popInserts('charts');
    } else if (opt === "editText") {
      ui.popEditText('charts');
    } else if (opt === "replace") {
      ui.popInserts('replace');
    } else if (opt === "dataSource") {
      ui.popDataSourceSelector();
   } else if (opt === "build") {
      ui.popBuild();
    } else {
      ui.popItems(opt);
    }
  }
 
  ui.fileBut.$click(function () {
    ui.setFselDisabled();
    dom.popFromButton("file",ui.fileBut,fsel.domEl);
  });

  ui.svgDiv.$click(function () {fsel.domEl.$css({"display":"none"})});

  tree.onlyShowEditable= false;  
  
  tree.onlyShowEditable= false;
  tree.showFunctions = false;
  
  
 
  tree.autoUpdate = 1;
  
  ui.alert = function (msg) {
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(msg);
  }
 
  var disableGray = "#aaaaaa";

  var enableButton = ui.enableButton = function (bt,vl) {
    bt.disabled = !vl;
    bt.$css({color:vl?"black":disableGray});
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
    tree.showTop();
    enableTreeClimbButtons();
  });
  
  ui.upBut.$click (function () {
    if (ui.upBut.disabled) return;
    tree.showParent(); // returns hasParent,hasChild
    enableTreeClimbButtons();
  });
  
  
  ui.downBut.$click(function () {
    if (ui.downBut.disabled) return;
    tree.showChild();
    enableTreeClimbButtons();
  });

  

ui.shareBut.$click(function () {   
  if (ui.root.surrounders) ui.root.surrounders.remove();
  svg.draw();
  var bb = ui.root.getBBox();
  var ar = ((bb.width == 0)||(bb.height == 0))?1:(bb.height)/(bb.width);
  var sp = ui.pjpath;
  var wdln = html.Element.mk('<div style="padding-left:10px">Width: </div>');
  var initialWd = 500;
  var initialHt = Math.round(ar * initialWd);
  var wdin = html.Element.mk('<input type="text" style="width:100px"/>');
  wdln.addChild(wdin);
  var htln = html.Element.mk('<div style="padding-bottom:5px;padding-left:10px">Height: </div>');
  var htin = html.Element.mk('<input type="text" style="width:100px"/>');
  htln.addChild(htin);
  
  htin.addEventListener('change',function () {
    var ht = parseInt(htin.$prop("value"));
    var wd = Math.round(ht/ar);
    wdin.$prop("value",wd);
    updateIframeTxt(wd,ht);
  });
  
  wdin.addEventListener('change',function () {
    var wd = parseInt(wdin.$prop("value"));
    var ht = Math.round(ar * wd);
    htin.$prop("value",ht);
    updateIframeTxt(wd,ht);
  });

  
  var embedDiv = html.Element.mk("<input  class='embed'/>");
  embedDiv.addEventListener('click',function () {
    embedDiv.$focus();
    embedDiv.$select();
  });
 
  var updateIframeTxt = function(wd,ht) {
    var rs = '<iframe width="'+wd+'" height="'+ht+'" src="http://prototypejungle.org/view?item='+sp+'"></iframe>';
    embedDiv.$prop('value',rs);
  }
  var  rs = html.Element.mk('<div/>').addChildren([
    html.Element.mk('<div style="margin:0px;padding:0px">To adjust this item (this page): </div>'),
    html.Element.mk("<p style='font-size:8pt;padding-left:20px'>"+mkLink("http://prototypeJungle.org/charts?item="+sp)+"</p>"),
    html.Element.mk("<p>To view it: </p>"),
    html.Element.mk("<p style='font-size:8pt;padding-left:20px'>"+mkLink("http://prototypeJungle.org/view?item="+sp)+"</p>"),
    html.Element.mk("<p>Embed (adjust width and height to taste):</p>"),
    wdln,
    htln,
    html.Element.mk('<div style="margin:0px;padding-left:10px">Copy and paste this:</div>'),
    embedDiv]);
  
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setContent(rs);
      
  wdin.$prop("value",initialWd);
  htin.$prop("value",initialHt);
    updateIframeTxt(initialWd,initialHt)


   });
   
  ui.helpBut.$click(function () {
      dom.unpop();
      mpg.lightbox.setHtml(helpHtml());
      mpg.lightbox.pop();
   });
   
  ui.itemSaved = true; // need this back there
  
  
  
  ui.afterDeleteItem = function (rs) {
    if (ui.checkForError(rs)) {
      mpg.lightbox.dismiss();
      return;
    }
    location.href = "/";
  }
  ui.messageCallbacks.deleteItem = ui.afterDeleteItem;

  
  ui.deleteItem = function () {
    var p = pj.stripInitialSlash(ui.pjpath);
    var dt = {path:p};
    ui.sendWMsg(JSON.stringify({apiCall:"/api/deleteItem",postData:dt,opId:"deleteItem"}));
  }
  
  var dialogOkButton,dialogCancelButton,dialogTitle;
  var dialogEl =html.Element.mk('<div class="Dialog"/>').addChildren([
  
    dialogTitle = html.Element.mk('<div  id="dialogTitle" class="dialogLine"/>').addChildren([
      html.Element.mk('<div  class="Line"/>').addChildren([
        dialogOkButton = html.Element.mk('<div class="button" id="dialogOk">Ok</div>'),
        dialogCancelButton =html.Element.mk('<div class="button" id="dialogCancel">Cancel</div>')
      ])
    ])
  ]);
  

dialogTitle.$html("Are you sure you wish to delete this item? There is no undo.");

dialogOkButton.$click(ui.deleteItem);
dialogCancelButton.$click(function (){
      mpg.lightbox.dismiss();
});

 
  
  var leavingFor;
 
  // see https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
  ui.onLeave = function (e) {
    var msg = (ui.nowDeleting || ui.itemSaved)?null:"The current item has unsaved modifications.";
     (e || window.event).returnValue = msg;     //Gecko + IE
     return msg; //webkit
  }

//end extract


})(prototypeJungle);


