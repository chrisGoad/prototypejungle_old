// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code
(function (__pj__) {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var tree = __pj__.tree;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var treePadding = 10;
  var bkColor = "white";
  var docDiv;
  var minWidth = 1000;
  var plusbut,minusbut;
  var isTopNote;
  
  page.elementsToHideOnError = [];
  function layout(noDraw) { // in the initialization phase, it is not yet time to draw, and adjust the transform
    // aspect ratio of the UI 
    var ar = 0.5;
    var pdw = 30; // minimum padding on sides
    var vpad = 40; //minimum sum of padding on top and bottom
    var cdims = geom.Point.mk(draw.canvasWidth,draw.canvasHeight);
    var awinwid = $(window).width();
    var awinht = $(window).height();
    if (awinwid < minWidth) {
      var ppageWidth = minWidth; // min size page
      var lrs = pdw;
    } else if (awinht < ar * minWidth) {
      var ppageWidth = minWidth; // min size page
      var lrs = 0.5 * (awinwid - minWidth) +  pdw;
    } else { // enough room
      var twd =  awinht/ar; 
      if (twd < awinwid) { // extra space in width
        var lrs = 0.5 * (awinwid-twd) + pdw;
        var ppageWidth = twd;
      } else {
        var lrs = pdw;
        var ppageWidth = awinwid;
      }
    }
    var ppageHeight = ar * ppageWidth;
    var pageWidth = ppageWidth - 2 * pdw;
    var pageHeight = ppageHeight - vpad;
    
    if (page.includeDoc) {
      var docTop = pageHeight * 0.8 - 20;
      pageHeight = pageHeight * 0.8;
      var docHeight = awinht - pageHeight - 30;
    }
    var canvasWidth = pageWidth/2;
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    
    var treeInnerWidth = treeOuterWidth - 2*treePadding;
    mpg.css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-22)+"px"});

    
    cols.css({left:"0px",width:pageWidth+"px"});
    uiDiv.css({top:"0px",left:canvasWidth+"px",width:(canvasWidth + "px")})
    ctopDiv.css({"padding-top":"10px","padding-bottom":"20px","padding-right":"10px",left:canvasWidth+"px",top:"0px"});

    actionDiv.css({width:(uiWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:"200px",top:"0px"});

    var actionHt = actionDiv.__element__.outerHeight()+(isTopNote?25:0);
    topbarDiv.css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var canvasHeight = pageHeight - actionHt -30;
    if (draw.enabled) {
      draw.mainCanvas.div.attr({width:canvasWidth,height:canvasHeight}); 
      draw.mainCanvas.hitDiv.attr({width:canvasWidth,height:canvasHeight}); 
    } else {
      canvasDiv.css({width:canvasWidth+"px",height:canvasHeight+"px"});
    }
    var treeHt = 5+ canvasHeight - 2*treePadding;
    tree.myWidth = treeInnerWidth;
    tree.obDiv.css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.protoDiv.css({width:(treeInnerWidth + "px"),height:(treeHt+"px"),top:"0px",left:(treeOuterWidth+"px")});
    draw.canvasWidth = canvasWidth;
    draw.canvasHeight = canvasHeight;
    if (docDiv) docDiv.css({left:"0px",width:pageWidth+"px",top:docTop+"px",overflow:"auto",height:docHeight + "px"});
    plusbut.css({"left":(canvasWidth - 50)+"px"});
    minusbut.css({"left":(canvasWidth - 30)+"px"});
    if (draw.mainCanvas) {
      var rtt = draw.mainCanvas.transform();
      if (rtt  &&  !draw.autoFit && !noDraw) {
        draw.mainCanvas.adjustTransform(rtt,cdims);
        draw.refresh();
      }
    }

}
  var mpg; // main page
  /* the set up:  ws has one child other than transform. This is the subject of the edit; the "page"; the "top".
    The save operation saves this under its name in the selected library. */
  draw.canvasWidth = 600;
  draw.canvasHeight = 600;;
  tree.codeToSave = "top";
  
  var jqp = __pj__.jqPrototypes;
  var topbarDiv = dom.wrapJQ('#topbar',{style:{position:"relative",left:"0px","background-color":bkColor,"margin":"0px",padding:"0px"}});
  var mainTitleDiv = dom.wrapJQ('#mainTitle');
   var titleDiv = dom.newJQ({tag:"div",style:{color:"black",float:"left",font:"bold 12pt arial",width:"140px","padding-left":"60px","padding-top":"10px"}});
   var mpg = dom.wrapJQ("#main",{style:{position:"absolute","margin":"0px",padding:"0px"}});
   
    mpg.addChild("topbar",topbarDiv);
 
   var topNoteDiv = dom.newJQ({tag:"div",style:{position:"absolute","top":"50px",left:"215px",font:"11pt arial italic","cursor":"pointer"}});
    topbarDiv.addChild("topNote",topNoteDiv);

     var errorDiv =  dom.wrapJQ($('#error'));
     //{tag:"div",style:{"text-align":"center","margin-left":"auto","margin-right":"auto","padding-bottom":"40px"}});

  //var errorDiv =  dom.newJQ({tag:"div",style:{"text-align":"center","margin-left":"auto","margin-right":"auto","padding-bottom":"40px"}});
 // mpg.addChild("error",errorDiv);
  var cols =  dom.newJQ({tag:"div",style:{left:"0px",position:"relative"}});
  mpg.addChild("mainDiv",cols);
  page.elementsToHideOnError.push(cols);
  var canvasDiv =  dom.newJQ({tag:"div",style:{postion:"absolute","background-color":"white",border:"solid thin black",display:"inline-block"}});
  cols.addChild("canvasDiv", canvasDiv);
  
  var cnvht = draw.hitCanvasDebug?"50%":"100%"
  //var cnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin green",width:"100%",height:cnvht}});
  var theCanvas;
  function addCanvas() {
    var cnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
    canvasDiv.addChild("canvas", cnv);
    var hitcnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin blue",width:200,height:200}});
    mpg.addChild("hitcanvas", hitcnv);
    theCanvas = draw.Canvas.mk(cnv,hitcnv);
    theCanvas.isMain = 1;
    theCanvas.dragEnabled = 1;
    theCanvas.panEnabled = 1;
    
  }
  
  
  // to viewer
   var vbut = jqp.button.instantiate();
  vbut.style.position = "absolute";
  vbut.style.top = "0px";
  vbut.style.left = "10px";
  vbut.html = "Viewer";
  canvasDiv.addChild(vbut);
  
  vbut.click = function () {
    location.href = page.itemUrl+"/view";
  }

  plusbut = jqp.button.instantiate();
  plusbut.style.position = "absolute";
  plusbut.style.top = "0px";
  plusbut.html = "+";
  canvasDiv.addChild(plusbut);
  
  minusbut = jqp.button.instantiate();
  minusbut.style.position = "absolute";
  minusbut.style.top = "0px";
  minusbut.html = "&#8722;";
 
canvasDiv.addChild(minusbut);
 
  var uiDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px",
                               padding:"0px"}});
  cols.addChild("uiDiv",uiDiv);


  var actionDiv = dom.newJQ({tag:"div",style:{position:"absolute",margin:"0px",
                              overflow:"none",padding:"5px",height:"20px"}});
  
  var itemName = dom.newJQ({tag:"span",html:"Name",style:{overflow:"none",padding:"5px",height:"20px"}});
  

                              
  topbarDiv.addChild('action',actionDiv);
    page.elementsToHideOnError.push(actionDiv);

  var ctopDiv = dom.wrapJQ('#topbarInner',{style:{float:"right"}});
  topbarDiv.addChild('ctop',ctopDiv);
  tree.obDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",border:"solid thin black",
                               overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}});
  uiDiv.addChild("obDiv",tree.obDiv);
  var obDivTitle = dom.newJQ({tag:"div",html:"Workspace",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}});
  tree.obDiv.addChild("title",obDivTitle);
  tree.obDivRest = dom.newJQ({tag:"div",style:{overflow:"auto"}});
  tree.obDiv.addChild("rest",tree.obDivRest); 
  docDiv =  dom.newJQ({tag:"iframe",attributes:{src:"chartdoc.html"},style:{border:"solid thin black",position:"absolute"}});
  page.elementsToHideOnError.push(docDiv);
  tree.obDiv.click = function () {
    dom.unpop();
  };
  
  tree.protoDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px","border":"solid thin black",
                               overflow:"auto",padding:treePadding+"px"}});
  
  tree.protoDivTitle = dom.newJQ({tag:"div",html:"Prototype Chain",style:{"border-bottom":"solid thin black"}});
  tree.protoDiv.addChild("title",tree.protoDivTitle);
  tree.protoDivRest = dom.newJQ({tag:"div",style:{overflow:"auto"}});
  tree.protoDiv.addChild("rest",tree.protoDivRest);
  
  tree.protoSubDiv = dom.newJQ({tag:"div",style:{"background-color":"white","margin-top":"20px",border:"solid thin green",
                               padding:"10px"}});
 uiDiv.addChild("protoDiv",tree.protoDiv);
  tree.protoDiv.click = function () {
    dom.unpop();
  };
  
  
  tree.setNote = function(k,note) {
    var h = '<b>'+k+':</b> '+note
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(h)
    return;
  }
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 

   

  var annLink = dom.newJQ({'tag':'div'});
  annLink.addChild('caption',dom.newJQ({'tag':'div'}));
  annLink.addChild('link',dom.newJQ({'tag':'div'}));
// notes are set for a save, and only displayed when showing that saved item, not further saves down the line

  function showTopNote() {
    var note = draw.wsRoot.__topNote__;
    if (note) {
      isTopNote = true;
      var svc = draw.wsRoot.get("__saveCountForNote__");
      if (svc == page.saveCount()) {
         topNoteDiv.setHtml(note);
      }
    }
  }
  
  page.setTopNote = function (txt) {
    draw.wsRoot.__topNote__ = txt;
    draw.wsRoot.__saveCountForNote__ = page.saveCount()+1;
    //code
  }
  
  
  function inspectItem(pth) {
    var loc = "/inspect?item=http://s3.prototypejungle.org/"+pth;
    location.href = loc;
  }
 
  // called from the chooser
  
  function popItems(mode) {
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.chooser_lightbox;
    lb.pop(undefined,undefined,true);//without topline
   // var wp = om.whichPage();
    var fsrc = om.useMinified?"chooser2.html":"chooser2d.html"; // go to dev version from dev version
    lb.setHtml('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'?mode='+mode+'"/>');
  }
  
  
  
  //path will be supplied for saveAs
  // called from the chooser
  page.saveItem = function (path) {
    if (!path) {
      if (page.newItem) {
        var url = "http://s3.prototypejungle.org"+page.newItem;
      } else {
        url = page.itemUrl;
      }
    } else {
    //var h = localStorage.handle;
      var url = "http://s3.prototypejungle.org/"+path;
    }
    draw.wsRoot.__beenModified__ = 1;
    var svcnt = page.saveCount();
    draw.wsRoot.__saveCount__ = svcnt+1;
    draw.wsRoot.set("__canvasDimensions__",geom.Point.mk(draw.canvasWidth,draw.canvasHeight));
    var upk = om.unpackUrl(url,true);
    om.s3Save(draw.wsRoot,upk,function (srs) {
      draw.wsRoot.__saveCount__ = svcnt;
      var asv = afterSave(srs);
      if (asv == "ok") {
        var inspectPage = om.useMinified?"/inspect":"inspectd";
        page.setSaved(true);
        if (page.newItem) {
          var loc = inspectPage+"?item="+url;
          location.href = loc;
        } else if (path) { //  go there for a saveAs
          //page.itemSaved = true; // so no confirmation of leaving page
          var loc = inspectPage+"?item="+url;
          location.href = loc;
        } else {
          //page.setSaved(true);
          draw.wsRoot.deepUpdate(draw.overrides);
          draw.refresh();
        }
      }
    },true);  // true = remove computed
  }
        

// returns "ok", or an error message
function afterSave(rs) {
  if (rs.status=='fail') {
    if (rs.msg == 'collision') {
      var ht = 'An unlikely name collision took place. Please try your save again.'
    } else if (rs.msg == 'busy') {
      var ht = 'The site is too busy to do the save. Please try again later';
    } else if ((rs.msg=="noSession")||(rs.msg == "timedOut")) {
      var ht = 'Your session has timed out. Please sign in again.'
      page.logout();
    } else {
      var ht = "Error: "+rs.msg;
    }
    return ht;
  } else {
    return "ok"
  }
}
  page.saveCount = function () {
    var svcnt = draw.wsRoot.__saveCount__;
    return (typeof svcnt == "number")?svcnt:0;
  }
  
  
  page.insertData = function (url,whr,cb) {
    om.getData(url,function (rs) {
      var dt = JSON.parse(rs);
      var ldt = om.lift(dt);
      draw.wsRoot.set(whr,ldt);
      updateAndShow();
      cb("ok");     
    });
  }
  
  function prototypeSource(x) {
    var p = Object.getPrototypeOf(x);
    return om.pathExceptLast(p.__source__);// without the /source.js
  }
    
  function finishInsert(x,pwhr,whr,cb) {
    // if pwhr is null, just instantiate x
    if (pwhr) {
      var prt = draw.wsRoot.set("prototypes/"+pwhr,x.instantiate().hide());
      prt.namedType();
      draw.wsRoot.prototypes.__doNotUpdate__ = 1;
    } else {
      prt = x;
    }
    var inst = draw.wsRoot.set(whr,prt.instantiate().show());
    inst.draggable = 1;
    if (!draw.overrides) {
      draw.overrides = {};
    }
    om.loadTheDataSources([inst],function () {
      inst.addOverridesForInsert(draw.wsRoot,draw.overrides);
      updateAndShow(undefined,true); // force fit 
      cb("ok");
    });
  }
  // returns true, false, or "conflict"
  page.prototypeAlreadyThere = function (url,pwhr) {
    var exp = om.evalPath(draw.wsRoot,"prototypes/"+pwhr); // is the prototype already there?
    if (!exp) return false;
    var src = prototypeSource(exp);
    if (src==url) {
      return true;
    } else {
      return "conflict";
    }
  }
  
   page.alreadyThere = function (whr) {
    var exp = om.evalPath(draw.wsRoot,whr); // is the prototype already there?
    return !!exp;
  }
  
  function lookupPrim(path) {
    //the last two elements of the path identify the primitive
    var sp = path.split("/");
    var ln = sp.length;
    var dir = sp[ln-2];
    var nm = sp[ln-1];
    return prototypeJungle[dir][nm];
  }

    
  page.insertItem = function(url,pwhr,whr,cb) {
    //pwhr is the internal path at which to insert the prototype, and whr is the internal path at which to insert the instance
    if (pwhr) {
      var exp = om.evalPath(draw.wsRoot,"prototypes/"+pwhr); // is the prototype already there?
    }
    if (om.beginsWith(url,"http://")) {
      if (exp) {
        var src = prototypeSource(exp);
        if (url == src) {
          finishInsert(exp,null,whr,cb);
          return;
        }
      }
      om.install([url],function (ars) {
        finishInsert(ars[0],pwhr,whr,cb);
        /*
        var prt = draw.wsRoot.set("prototypes/"+pwhr,ars[0].instantiate().hide());
        draw.wsRoot.prototypes.__doNotUpdate__ = 1;
        var inst = draw.wsRoot.set(whr,prt.instantiate().show());
        updateAndShow();
        */
      });
    } else {
      // otherwise this is a primitive
      var prim = lookupPrim(url);
      if (exp) {
        if (Object.getPrototypeOf(exp)==prim) {
          finishInsert(exp,null,whr,cb);
          return;
        }
      }
      finishInsert(prim,pwhr,whr,cb);
    }
  }
  
 
  page.rebuildItem = function () {
    var buildPage = om.useMinified?"/build":"/buildd";
    location.href =buildPage+"?item=/"+page.itemPath;
  }

  page.saveImage = function (path,cb) {
    var url = "http://s3.prototypejungle.org/"+path;
    var upk = om.unpackUrl(url);
    var img = upk.image;
    draw.postCanvas(path,function (rs) {
      cb(rs);
    });     
  }
  
  
  actionDiv.addChild("itemName",itemName);
 
 
  var fileBut = jqp.ubutton.instantiate();
  fileBut.html = "File";
  actionDiv.addChild("file",fileBut);

  var fsel = dom.Select.mk();
  
  fsel.containerP = jqp.pulldown;
  fsel.optionP = jqp.pulldownEntry;
  var fselJQ;
  
  function setFselDisabled() {
    if (localStorage.sessionId) {
      var newItem = page.newItem;
      // if there is no saveCount, this an item from a build, and should not be overwritten
      var handle = localStorage.handle;
      if (newItem) {
        var myItem = true;
      } else {
        var fhandle = om.pathFirst(page.itemPath);
        var myItem = handle == fhandle;
      }
      var saveDisabled = newItem || (!draw.wsRoot.__saveCount__);
      var rebuildDisabled = newItem || draw.wsRoot.__saveCount__ || !myItem;
      if (newItem) {
        var deleteDisabled = true;
      } else {
         deleteDisabled = !myItem;
        
      }
      fsel.disabled = [0,0,0,0,0,rebuildDisabled,saveDisabled,0,0,deleteDisabled];
    } else {
      fsel.disabled = [1,1,1,0,1,1,1,1,1,1];
    }
  }

      
  function setFselOptions() {
    fsel.options = ["New Item...","New Build...","New Data File...","Open...","Insert...","Edit Source/Rebuild","Save","Save As...","Save Image...","Delete"];
    fsel.optionIds = ["newItem","new","newData","open","insert","rebuild","save","saveAs","saveImage","delete"];
    setFselDisabled();
    fselJQ = fsel.toJQ();
    mpg.addChild(fselJQ); 
    fselJQ.hide();
  }
  
  var fselSaveIndex = 6; // a little dumb, but harmless
  
  //fsel.optionIds = ["new","open","save","saveImage"];
  fsel.onSelect = function (n) {
    var opt = fsel.optionIds[n];
    if (opt == "newItem") { // check if an item save is wanted
      //var cklv = page.onLeave("newItem");
      //if (!cklv) return;
      var inspectPage = om.useMinified?"/inspect":"/inspectd";
      location.href = inspectPage + "?newItem=1"
      return;
 
    }
   
    if (opt == "delete") {
      confirmDelete();
      return;
      //code
    }
    if (opt == "save") {
      itemName.setHtml("Saving ...");
      dom.unpop();
      page.saveItem();
    } else if (opt == "rebuild") {
      page.rebuildItem();
    } else {

      popItems(opt);
    }
  }
 
 
 
 // var fselJQ = fsel.toJQ();
 // mpg.addChild(fselJQ); 
 // fselJQ.hide();

  fileBut.click = function () {
    setFselDisabled();
    //fsel.setDisabled(fselSaveIndex,saved);

    dom.popFromButton("file",fileBut,fselJQ);
  }

 
 
 
  
  var viewBut = jqp.ubutton.instantiate();
  viewBut.html = "View";
  //actionDiv.addChild("view",viewBut); // at the moment, leave this option out, until treatment of functions is better

  var vsel = dom.Select.mk();
  
  vsel.isOptionSelector = 1;
  vsel.containerP = jqp.pulldown;
  vsel.optionP = jqp.pulldownEntry;
  vsel.options = ["Only editable fields",
                  "All fields except functions",
                  "All fields, including functions"];
  vsel.optionIds = ["editable","notFunctions","all"];
  vsel.onSelect = function (n) {
    if (n==0) {
      tree.onlyShowEditable = true;
      tree.showFunctions = false;
    } else if (n==1) {
      tree.onlyShowEditable = false;
      tree.showFunctions = false;
    } else {
      tree.onlyShowEditable = false;
      tree.showFunctions = true;
    }
    tree.initShapeTreeWidget();
    tree.refreshProtoChain();
  }
  
      
  vsel.selected = 1;
  tree.onlyShowEditable= false;
  tree.showFunctions = true;
  
  var vselJQ = vsel.toJQ();
  page.vv = vselJQ;
  mpg.addChild(vselJQ); 
  vselJQ.hide();

  
  page.popViews = function () {
    if (page.viewsPopped) {
      vselJQ.hide();
      page.viewsPopped = 0;
      return;
    }
    var mof = mpg.offset();
    var ht = viewBut.height();
    var ofs = viewBut.offset();
    var rofL = ofs.left-mof.left;
    var rofT = ofs.top-mof.top;
    vselJQ.css({"display":"block","left":rofL+"px","top":(rofT+ht)+"px"});
    page.viewsPopped = 1;
  }
  
  page.hideViewsSel = function () {
    vselJQ.hide();
  }
  
  viewBut.click = function () {dom.popFromButton("views",viewBut,vselJQ);}

  /*
  
  var optionsBut = jqp.button.instantiate();
  optionsBut.html = "Options...";
  actionDiv.addChild("options",optionsBut);

  
  var osel = dom.Select.mk();
  
  osel.isOptionSelector = 1;
  osel.containerP = jqp.pulldown;
  osel.optionP = jqp.pulldownEntry;
  osel.options = ["Auto update",
                  "Manual update"];
  osel.optionIds = ["auto","manual"];
  osel.onSelect = function (n) {
    if (n==0) {
      tree.autoUpdate = 1;
      updateBut.hide();
      contractBut.hide();
    } else if (n==1) {
      tree.autoUpdate = 0;
      updateBut.show();
      contractBut.show();
    }
  }
  
  
  osel.selected = 0;
 
  var oselJQ = osel.toJQ();
  mpg.addChild(oselJQ); 
  oselJQ.hide();

  optionsBut.click = function () {dom.popFromButton("options",optionsBut,oselJQ);}
*/
  
  tree.onlyShowEditable= false;
  tree.showFunctions = true;
  
  
 
  tree.autoUpdate = 1;
  
  page.alert = function (msg) {
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(msg);
  }
 
  //src is who invoked the op; "tree" or "draw" (default is draw)
  function updateAndShow(src,forceFit) {
    draw.wsRoot.removeComputed();
    draw.wsRoot.deepUpdate(draw.overrides);
    draw.mainCanvas.fitContents(forceFit);
    draw.refresh();
    if (src!="tree") tree.initShapeTreeWidget();
  }
 
  tree.updateAndShow = updateAndShow; // make this available in the tree module

  var viewSourceBut = jqp.ulink.instantiate();
  viewSourceBut.html = "Source";
  actionDiv.addChild("viewSource",viewSourceBut);
 
 
  
  function aboutText() {
    var rt = draw.wsRoot;
    var tab = rt.__about__;
    ht = "";
    var src = rt.__source__;
    if (rt.__saveCount__  && src) {
      var nsrc = om.pathExceptLast(src);
      var psrc = "http://prototypejungle.org/" +om.stripDomainFromUrl(nsrc); 
      ht += "<p>This is a variant of <a href='http://prototypejungle.org/inspect?item="+nsrc+"'>"+psrc+"</a></p>";
    }
    if (tab) ht += "<div>"+tab+"</div>";
    return ht;
  }
    
    
    
  var aboutBut = jqp.ubutton.instantiate();
  aboutBut.html = "About";
  actionDiv.addChild("about",aboutBut);
  aboutBut.click = function () {
    dom.unpop();
    var rt = draw.wsRoot;
    mpg.lightbox.pop();
    //var tab = rt.__about__;
    var ht = '<p>The general <i>about</i> page for Prototype Jungle is <a href="http://prototypejungle.org/about.html">here</a>. This note concerns the current item.</p>';
    ht += aboutText();
    mpg.lightbox.setHtml(ht);
  }
 



 function getHelpHtml()  {
  if (page.helpHtml) return page.helpHtml;
  if (page.includeDoc) {
  var helpHtml0 = '<div class="paddedIframeContents"><p> Please see the explanations at the bottom of this  intro page (after dismissing this lightbox).</p></div>'
 } else {
  var helpHtml0 = '<p>Two panels, labeled "Workspace" and "Prototype Chain", appear on the right-hand side of the screen. The workspace panel displays the hierarchical structure of the JavaScript objects which represent the item. You can select a part of the item either by clicking on it in the graphical display, or in the workspace panel. The <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain">prototype chain</a> of the selected object will be shown in rightmost panel. </p>';
 }

page.helpHtml = helpHtml0;

return page.helpHtml;
 }
 
 
 
 
 function genTweeter(txt,url) {
  var rs = 
'<a href="https://twitter.com/share" class="twitter-share-button"  data-count="none" data-text="'+txt+'">Tweet</a>'+
"<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";
  return rs;
 }
 

 function shareJq() {
  var rs = $("<div />");
  var url = page.itemUrl + "/view";
  rs.append("<p>Embed (adjust width and height to taste):</p>");
  var emb = om.mkEmbed(url);
  var dv = $("<input class='embed'/>");
  dv.attr("value",emb);
  dv.click(function () {
    dv.focus();dv.select();
  });
  rs.append(dv);
  rs.append("<p>Tweet this  item:</p>");
  var tw = genTweeter(page.itemName + ' at PrototypeJungle',url);
  rs.append(tw);
  return rs;
 }


 
   var shareBut = jqp.ubutton.instantiate();
  shareBut.html = "Share";
   actionDiv.addChild("help",shareBut);
   shareBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setContent(shareJq());
   };
   
   
   var helpBut = jqp.ubutton.instantiate();
  helpBut.html = "Help";
   actionDiv.addChild("help",helpBut);
   helpBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setHtml(getHelpHtml());
   };
   
   
   
   
  mainTitleDiv.click = function () {
    location.href = "/";
  }
  
  page.itemSaved = true; // need this back there
  
  page.setSaved = function(saved) {
    // those not logged in can't save anyway
    if (!localStorage.sessionId) {
      return;
    }
    if (saved == page.itemSaved) return;
    page.itemSaved = saved;
    var nm =  page.newItem?"New Item*":(saved?page.itemName:page.itemName+"*");
    itemName.setHtml(nm);
    if (!page.newItem) fsel.setDisabled(fselSaveIndex,saved); // never allow Save (as opposed to save as) for newItems
    if (saved) {
      window.removeEventListener("beforeunload",page.onLeave);
    } else {
      window.addEventListener("beforeunload",page.onLeave);
    }
  }
  
  
  
  var dialogEl =$('<div class="Dialog">\
                        <div  id="dialogTitle" class="dialogLine"></div>\
                        <div  class="Line">\
                          <div class="button" id="dialogOk">Ok</div>\
                          <div class="button" id="dialogCancel">Cancel</div>\
                        </div>\
                      </div>');
                      
  
 var dialogOkButton = $('#dialogOk',dialogEl);
  var dialogCancelButton = $('#dialogCancel',dialogEl);
var dialogTitle = $('#dialogTitle',dialogEl);
 
  function activateDeleteButtons() {
    dialogTitle.html("Are you sure you wish to delete this item? There is no undo.");
    dialogOkButton.off("click");
    dialogOkButton.click(function () {
      var pth = page.itemPath;
      om.deleteItem(pth,function (rs) {
        page.nowDeleting = true;
        location.href = "/";
      });
    });
    dialogCancelButton.click(function (){
      mpg.lightbox.dismiss();
    });
  }
  
  function confirmDelete() {   
    var lb = mpg.lightbox;
    lb.pop();
    lb.setContent(dialogEl);
    activateDeleteButtons();
    return false;
  }
    
  var leavingFor;
 
  // see https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
  page.onLeave = function (e) {
    var msg = (page.nowDeleting || page.itemSaved)?null:"The current item has unsaved modifications.";
     (e || window.event).returnValue = msg;     //Gecko + IE
     return msg; //webkit
  }
  
  
  
  
  draw.stateChangeCallbacks.push(function () {
    page.setSaved(false);
  });
  
 
  /* non-standalone items should not be updated or displayed; no canvas needed; show the about page intead */
  page.genMainPage = function (standalone,cb) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    if (page.includeDoc) {
      mpg.addChild("doc",docDiv);
    }
    if (standalone) {
      addCanvas();
    } 
    mpg.install($("body"));
    $('.mainTitle').click(function () {
      location.href = "/";
    });
    if (om.root.__source__) {
      viewSourceBut.attr("href", om.root.__source__);
    } else {
      viewSourceBut.hide();
    }

    plusbut.__element__.mousedown(draw.startZooming);
    plusbut.__element__.mouseup(draw.stopZooming);
    plusbut.__element__.mouseleave(draw.stopZooming);
    minusbut.__element__.mousedown(draw.startUnZooming);
    minusbut.__element__.mouseup(draw.stopZooming);
    minusbut.__element__.mouseleave(draw.stopZooming);

    page.genButtons(ctopDiv.__element__,{toExclude:{'about':1,'file':1}});
    fsel.jq.__element__.mouseleave(function () {dom.unpop();});
  //  vsel.jq.__element__.mouseleave(function () {dom.unpop();});

    
   
    if (standalone) {
      theCanvas.contents = draw.wsRoot;
      draw.addCanvas(theCanvas);
  
      /*
      draw.theContext = draw.theCanvas.__element__[0].getContext('2d');
      if (draw.hitCanvasEnabled) {
        draw.hitContext = draw.hitCanvas.__element__[0].getContext('2d');
      } else {
        draw.hitCanvasActive = 0;
      }
      */
    } else {
      aboutBut.hide();
      var nstxt = "<div class='notStandaloneText'><p>This item includes no visible content, at least in this standalone context.</p>";
      nstxt += aboutText() + "</div>";
      canvasDiv.setHtml(nstxt);
    }
    $('body').css({"background-color":"#eeeeee"});
     

    layout(true); //nodraw
    var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
    var rc = geom.Rectangle.mk({corner:[0,0],extent:[600,200]});
    var lbt = __pj__.lightbox.template.instantiate();
    // the main lightbox wants padding and overflow, but not the chooser
    lbt.selectChild("content").setN("style",{"padding-left":"30px","padding-right":"30px","overflow":"auto"});
    var lb = lightbox.newLightbox($('body'),r,lbt);
    mpg.set("lightbox",lb);
    var clb = lightbox.newLightbox($('body'),rc,__pj__.lightbox.template.instantiate());
    mpg.set("chooser_lightbox",clb);
     itemName.setHtml(page.itemName);
    cb();   
  }
    

  
      
   // either nm,scr (for a new empty page), or ws (loading something into the ws) should be non-null
  
  page.initPage = function (o) {
    var q = om.parseQuerystring();
    draw.bkColor = "white";
  
    //var itm = q.item;
    //var nm = o.name;
    //var scr = o.screen;
    var wssrc = q.item;
    page.newItem = q.newItem;
    var itm = q.item;
    page.includeDoc = q.intro;
  
  
     
    page.itemUrl =  wssrc;
    if (wssrc) {
      page.itemName = om.pathLast(wssrc);
      page.itemPath = om.stripDomainFromUrl(wssrc);
    }
    //var noInst = o.noInst;
    //var isAnon = wssrc && ((wssrc.indexOf("http:") == 0) || (wssrc.indexOf("https:")==0));
    //var inst = o.instantiate;
    //var cb = o.callback;
      function installOverrides(itm) {
                  var ovr = itm.__overrides__;
              if (!ovr) {
                ovr = {};
              }
              if (ovr) {
                delete itm.__overrides__;
              }
              return ovr;
            }
            
     $('document').ready(
        function () {
          $('body').css({"background-color":"white",color:"black"});
          om.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a page-back inadvertantly
          //window.addEventListener("beforeunload",page.onLeave);

            function afterInstall(ars) {
              var ln  = ars?ars.length:0;
              if (ln>0) {
                var rs = ars[ln-1];
                if (rs) { // rs will be undefined if there was an error in installation 
                  var inst  = !(rs.__autonamed__);// &&  !noInst; // instantiate directly built fellows, so as to share their code
                  var ovr = installOverrides(rs);
                  var ws = __pj__.set("ws",om.DNode.mk());
                  if (inst) {
                    var frs = rs.instantiate();
                  } else {
                     frs = rs;
                  }
                  ws.set(rs.__name__,frs); // @todo rename if necessary
                  draw.wsRoot = frs;
                  page.codeBuilt = !(frs.__saveCount__);
                  om.root = draw.wsRoot;
                  draw.enabled = !frs.notStandalone;
                  var standalone = draw.enabled;
                  showTopNote();
                  if (standalone) {
                    draw.overrides = ovr;
                    frs.deepUpdate(ovr);
                   
                    var bkc = frs.backgroundColor;
                    if (!bkc) {
                      frs.backgroundColor="white";
                    }
                  }
                } else {
                  draw.wsRoot ={__installFailure__:1};
                }
              } else {
                // newItem
                draw.wsRoot = __pj__.set("ws",om.DNode.mk());
                om.root = draw.wsRoot;
                standalone = true;
                page.codeBuilt = false;
              }
              setFselOptions(); 
               
            
                page.genMainPage(standalone,function () {
                  if (!wssrc) {
                    page.setSaved(false);
                  }
                  if  (!draw.wsRoot.__about__) {
                    aboutBut.hide();
                  }
                  var ue = om.updateErrors && (om.updateErrors.length > 0);
                  if (ue) {
                    var lb = mpg.lightbox;
                    lb.pop();
                    lb.setHtml("<div id='updateMessage'><p>An error was encountered in running the update function for this item: </p><i>"+om.updateErrors[0]+"</i></p></div>");
                  }
                  om.loadTheDataSources([draw.wsRoot],function () {
                    if (standalone) draw.wsRoot.deepUpdate(ovr);
                    tree.initShapeTreeWidget();
                    var isVariant = !!(draw.wsRoot.__saveCount__);
                    if (standalone) {
                      var tr = draw.wsRoot.transform;
                      var cdims = draw.wsRoot.__canvasDimensions__;

                      if (tr  && cdims) {
                        draw.mainCanvas.adjustTransform(draw.mainCanvas.transform(),cdims);
                      } else {
                        if (!isVariant || !tr) { 
                          tr = draw.mainCanvas.fitTransform();
                          draw.wsRoot.set("transform",tr);
                        }
                      }
                      draw.refresh();

                    }
                    tree.openTop();
                    tree.adjust();
                    //if (cb) cb();
                  });
                });
            
            }
            if (!wssrc) {
              //draw.emptyWs(nm,scr);
              afterInstall();
            } else {
                var lst = om.pathLast(wssrc);
                om.install(wssrc,afterInstall)
            }
            
            $(window).resize(function() {
                layout();
                draw.fitContents();
                draw.refresh();

              });   
          });
  }
})(prototypeJungle);

