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


  var geom = pj.geom;
  var treePadding = 0;
  var bkColor = "white";
  var docDiv;
  var minWidth = 1000;
  var plusbut,minusbut;
  var flatInputFont = "8pt arial";
  var uiDiv,topbarDiv,obDivTitle;
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
        ui.saveBut = html.Element.mk('<div class="ubutton">Save</div>'),
        ui.saveSvgBut = html.Element.mk('<div class="ubutton">Save as SVG</div>'),
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
  docDiv.$css({left:"0px",width:docwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
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
  
  ui.setInstance = function (itm) {
    if (!itm) {
      return;
    }
    ui.topBut.$show();
    ui.upBut.$show();
    //tree.showItem(itm,itm.selectable?"expand":"fullyExpand",1);
    tree.showItem(itm,'auto');
    tree.showProtoChain(itm);
    //ui.upBut.$show();
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

   
  

  ui.workerIsReady = 0;
  ui.messageCallbacks.workerReady = function () {
    ui.workerIsReady = 1;
    if (ui.whenWorkerIsReady) {
      ui.whenWorkerIsReady();
    }
 }

  
   ui.anonSave = function () { 
    var needRestore = 0;
    var savingAs = 1;
    pj.mkXItemsAbsolute(pj.root.__requires,pj.repo);
    pj.anonSave(pj.root,function (srs) {
      // todo deal with failure
      if (srs.status==='fail') {
        if (srs.msg === 'maxPerIPExceeded') {
          var errmsg = "The save rate is throttled for now to 10 saves per 5 minutes.";
        } else {
          errmsg = "The site is busy. Please try again later";
        }
        ui.displayTemporaryError(ui.messageElement,errmsg,5000);
        return;
      } else {
        var path = srs.value;
        var destPage = ui.useMinified?"/ui":"ui";
        var loc = destPage +"?item="+path;
        location.href = loc;
      }
    });
  }
 
 
ui.saveSvg = function () {
    ui.unselect();
    var str = svg.main.svgString(400,20);
    var doTheSave = function () {
      pj.saveString(str,'image/svg+xml',function (srs) {
        if (srs.status==='fail') {
          var msgKind = pj.beforeChar(srs.msg,' ');
          if (msgKind === 'maxPerIPExceeded') {
            var errmsg = "The save rate is throttled for now to 10 saves per 5 minutes.";
          } else if (msgKind === 'SizeFail') {
            errmsg = "Temporary cap on size ("+pj.maxSaveLength+") exceeded";// this should be caught before sending, but just in case
          } else {
            errmsg = "The site is busy. Please try again later";
          }
          ui.displayTemporaryError(ui.messageElement,errmsg,5000);
          return;
        } else {
          var path = srs.value;
          var loc = 'http://prototypejungle.org'+path;
          location.href = loc;
        }
      });
    }
    if (ui.workerIsReady) {
      doTheSave();
    } else {
      console.log("DEFERRING SAVE");
      ui.whenWorkerIsReady = doTheSave;
      ui.loadWorker();
    }
  }
  
  function prototypeSource(x) {
    var p = Object.getPrototypeOf(x);
    return pj.pathExceptLast(p._pj_source);// without the /source.js
  }
    
if (ui.saveBut) {
  ui.saveBut.$click(function () {
   ui.messageElement.$html("Saving ...");
   dom.unpop();
   ui.anonSave();
  });


  ui.saveSvgBut.$click(function () {
    ui.saveSvg();
  });
}

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

  
  ui.itemSaved = true; 
  

//end extract


})(prototypeJungle);


