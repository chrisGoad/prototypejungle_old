// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code
// in any case, a rewrite is needed - not a clean body of code

// scheme for saving.  for a code built, owned item, objects, internal data, objects, code, and components can all be modified
//modifying any of the last three means a new build is needed.  build brings all into sync, and if it fails, records that failure
// at s3.  A missing of failed build item is called unbuilt. (the data.js file will record this). Save from the file menu just saves,
// and if the build is out of sync, turns this unbuilt. modification of objects makes the code read only and of code makes the
// objects read only
(function (__pj__) {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  //var draw = __pj__.draw;
  var svg = __pj__.svg;
  var tree = __pj__.tree;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var dataOps = __pj__.dataOps;
  var treePadding = 10;
  var bkColor = "white";
  var docDiv;
  var minWidth = 1000;
  var plusbut,minusbut;
  var isTopNote;
  var flatMode;
  var flatInputFont = "8pt arial";
  // flatMode: no trees in the workspace or proto windows.  Here's code for that
  var itemName,fileBut,customBut,aboutBut,shareBut,noteDiv,helpBut,stickyBut;
  var topbarDiv,cols,svgDiv,topNoteDiv,uiDiv,actionDiv,obDivTop,obDivTitle,ctopDiv,shareBut,upBut,cfBut;
  var editMsg;
      
  var inspectDom = 0;
//  var testDom =  dom.El('<div style="background-color:white;border:solid thin black;display:inline-block">TEST DOM');
  om.inspectMode = 1; // if this code is being loaded, inspection is happening
  var unpackedUrl;
  
  // the tab for choosing modes: objects, code, data
  
  var modeTab = dom.Tab.mk(['Objects','Code','Data','Components'],'Objects');
  var modeTabJQ = modeTab.toJQ();
  
   var jqp = __pj__.jqPrototypes;
   // the page structure
  var mainTitleDiv = dom.wrapJQ('#mainTitle');
  // note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed. 
  var mpg = dom.wrapJQ("#main",{style:{position:"absolute","margin":"0px",padding:"0px"}}).addChildren([
    topbarDiv = dom.wrapJQ('#topbar',{style:'position:absolute;left:0px;background-color:bkColor;margin:0px;padding:0px'}).addChildren([
      topNoteDiv = dom.El({tag:"div",id:"topNote",style:{position:"absolute","top":"50px",left:"215px",font:"11pt arial italic","cursor":"pointer"}}),
     actionDiv = dom.El('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').addChildren([
        itemName = dom.El({tag:"span",html:"Name",style:{overflow:"none",padding:"5px",height:"20px"}}),
        fileBut = jqp.ubutton.instantiate().set({html:"File"}),
        customBut = jqp.ulink.instantiate().set({html:"Arrange"}),
        //viewSourceBut = jqp.ulink.instantiate().set({html:"Source"}),
        //viewDataBut = jqp.ulink.instantiate().set({html:"Data"}),
        aboutBut = jqp.ubutton.instantiate().set({html:"About"}),
        shareBut = jqp.ubutton.instantiate().set({html:"Share"}),
        helpBut = jqp.ubutton.instantiate().set({html:"Help"}),
        stickyBut = jqp.ubutton.instantiate().set({html:"Sticky Hovers"}),
      ]),
      ctopDiv = dom.wrapJQ('#topbarInner',{style:{float:"right"}})
    ]),
    modeTabJQ,
   // uiTop = dom.El({tag:"div",html:"Objects Code Data",style:{position:"absolute"}}),
    cols =  dom.El({tag:"div",id:"columns",style:{left:"0px",position:"relative"}}).addChildren([
      
      svgDiv =  dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
        //vbut = jqp.button.instantiate().set({html:"Viewer",style:{position:"absolute",top:"0px",left:"10px"}}),
        tree.noteDiv = noteDiv = dom.El({tag:"div",style:{"font":"10pt arial","background-color":"white",position:"absolute",top:"0px",
                         left:"90px","padding-left":"4px","border":"solid thin black"}}).addChildren([
          noteSpan = dom.El({tag:"span",html:"Clockk on things to inspect them. "}),
          upBut = jqp.roundButton.instantiate().set({html:"Up",style:{}}),
          downBut = jqp.roundButton.instantiate().set({html:"Down",style:{}}),
          topBut = jqp.roundButton.instantiate().set({html:"Top",style:{}})

        ])
       // plusbut = jqp.button.instantiate().set({html:"+",style:{position:"absolute",top:"0px"}}),
       // minusbut = jqp.button.instantiate().set({html:"&#8722;",style:{position:"absolute",top:"0px"}})
        
     ]),
      uiDiv = dom.El({tag:"div",id:"uiDiv",style:{position:"absolute","background-color":"white",margin:"0px",padding:"0px"}}).addChildren([
        tree.editContainer = dom.El({tag:"div",hidden:1,sytle:{position:"absolute","background-color":"white",border:"solid thin black"}}).addChildren([
          editMsg = dom.El({tag:"div",style:{"font-size":"10pt"},html:"Experiment freely, but save to your own area prior ro persistent modifications."}),
          editButDiv = dom.El({tag:"div"}).addChildren([
            unbuiltMsg = dom.El({tag:"span",html:"Unbuilt",style:{color:"red"}}),
            buildBut = jqp.roundButton.instantiate().set({html:"Build",style:{"margin-left":"40px"}}),
            execBut = jqp.roundButton.instantiate().set({html:"Run",style:{"margin-left":"40px"}}),
            saveCodeBut = jqp.roundButton.instantiate().set({html:"Save",style:{"margin-left":"40px"}}),
            saveAsBuildBut = jqp.roundButton.instantiate().set({html:"Save as build",style:{"margin-left":"40px"}}),
          ]),
          tree.editDiv = dom.El({tag:"div",id:"editDiv",style:{position:"absolute","background-color":"white",width:"100%",height:"100%",border:"solid thin green",
                                overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}})
        ]),
        tree.dataContainer = dom.El({tag:"div",hidden:1,style:{position:"absolute","background-color":"white",border:"solid thin black"}}).addChildren([
          dataButDiv = dom.El({tag:"div"}),
          tree.dataDiv = dom.El({tag:"div",id:"dataDiv",style:{position:"absolute","background-color":"white",width:"100%",height:                                "100%",border:"solid thin green",
                                overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}})
          ]),
          tree.componentContainer = dom.El({tag:"div",id:"components",hidden:1,style:{position:"absolute","background-color":"white",border:"solid thin black"}}).addChildren([
            componentNote = dom.El({tag:"div",html:""}),
            compnentButDiv = dom.El({tag:"div"}).addChildren([
              addComponentBut = jqp.roundButton.instantiate().set({html:"Add Component",style:{"margin-left":"40px"}})
              ]),

            tree.componentsDiv = dom.El({tag:"div",id:"componentDiv",style:{position:"absolute","background-color":"white",width:"100%",height:                                "100%",border:"solid thin red",
                                overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}})
          ]),

        tree.objectContainer = dom.El({tag:"div",style:{position:"absolute","background-color":"white",border:"solid thin black"}}).addChildren([
          tree.obDiv = dom.El({tag:"div",style:{position:"absolute","background-color":"white",border:"solid thin black",
                                overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}}).addChildren([
            obDivTop = dom.El({tag:"div",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}}).addChildren([
              obDivTitle = dom.El({tag:"span",html:"Workspace",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}})
             // viewTreeBut = jqp.roundButton.instantiate().set({html:"View Workspace",style:{"margin-left":"40px",hidden:1}}),
             // page.upBut = upBut = jqp.roundButton.instantiate().set({html:"Up",style:{"margin-left":"40px",hidden:1}})
            ]),
            tree.obDivRest = dom.El({tag:"div",style:{overflow:"auto"}}),
          ]),
          tree.protoDiv = dom.El({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px","border":"solid thin black",
                               overflow:"auto",padding:treePadding+"px"}}).addChildren([
            dom.El({tag:"div",style:{"width":"100%","border-bottom":"solid thin black"}}).addChildren([
              tree.protoDivTitle = dom.El({tag:"span",html:"Prototype Chain"})
            // cf (computedField) buttons will come back in future
            //tree.cfBut = jqp.smallButton.instantiate().set({html:"Compute this field",style:{"background-color":"#dddddd","color":"red","float":"right","margin-left":"4px","top":"0px"}})
            ]),
            tree.protoDivRest = dom.El({tag:"div",style:{"border-top":"thin black",overflow:"auto"}})
          ])
        ])
      ])
    ])
  ]);

 // tree.cfBut.click = tree.cfButClick;
  
  var cnvht = "100%"
  // when inspecting dom, the canvas is a div, not really a canvas
 /* function addCanvas(canvasDiv,contents) {
    var theCanvas;
    var inspectDom = false;
    if (inspectDom) { // this code is not in use, but may come back
      var cnv = dom.El({tag:"div",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
      canvasDiv.addChild("canvas", cnv);
      draw.enabled = false;
    } else {
      var cnv = dom.El({tag:"canvas",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
      canvasDiv.addChild("canvas", cnv);
      var hitcnv = dom.El({tag:"canvas",attributes:{border:"solid thin blue",width:200,height:200}});
      //mpg.addChild("hitcanvas", hitcnv);
      canvasDiv.addChild("hitcanvas", hitcnv);
      //var htmlDiv = canvasDiv; //dom.El({tag:"div",style:{position:"absolute",border:"solid red",width:"10px",height:"10px",top:"0px",left:"0px"}});
      //canvasDiv.addChild("html",htmlDiv);
      theCanvas = draw.Canvas.mk(cnv,hitcnv,canvasDiv);
      theCanvas.isMain = 1;
      theCanvas.dragEnabled = 1;
      theCanvas.panEnabled = 1;
      theCanvas.contents = contents;
      //draw.addCanvas(theCanvas);
      return theCanvas;
    }
    
  }
  */
  
  topBut.hide();
  upBut.hide();
  downBut.hide();
  
 // svg.main.width = 600;
 // svg.main.height = 600;;
  tree.codeToSave = "top";
  
  
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = 1;
  function layout(noDraw) { // in the initialization phase, it is not yet time to draw, and adjust the transform
    // aspect ratio of the UI
    var svgwd = svg.main.width;
    var svght = svg.main.height;
    var ar = 0.5;
    var pdw = 30; // minimum padding on sides
    var vpad = 40; //minimum sum of padding on top and bottom
    var cdims = geom.Point.mk(svgwd,svght);
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
    var svgwd = pageWidth/2;
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    
    var treeInnerWidth = treeOuterWidth - 2*treePadding;
    mpg.css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-22)+"px"});
    var topHt = topbarDiv.height();
    
    cols.css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
    modeTabJQ.css({top:"28px",left:svgwd+"px",width:(svgwd + "px")})
     uiDiv.css({top:"0px",left:svgwd+"px",width:(svgwd + "px")})
    ctopDiv.css({"padding-top":"10px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});

    actionDiv.css({width:(uiWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:"200px",top:"0px"});

    var actionHt = actionDiv.__element__.outerHeight()+(isTopNote?25:0);
    topbarDiv.css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var svght = pageHeight - actionHt -30;
    //if (draw.enabled) {
    //  draw.mainCanvas.div.attr({width:canvasWidth,height:canvasHeight}); 
    //  draw.mainCanvas.hitDiv.attr({width:canvasWidth,height:canvasHeight});
      //draw.mainCanvas.htmlDiv.css({width:canvasWidth,height:canvasHeight});

    //} else {
    //  canvasDiv.css({width:canvasWidth+"px",height:canvasHeight+"px"});
    //}
    var treeHt = 5+ svght - 2*treePadding;
    tree.myWidth = treeInnerWidth;
    tree.editContainer.css({width:(svgwd + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
     tree.editDiv.css({height:((treeHt-20)+"px")});
    tree.objectContainer.css({width:(svgwd + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.componentContainer.css({width:(svgwd + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.obDiv.css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.protoDiv.css({width:(treeInnerWidth + "px"),height:(treeHt+"px"),top:"0px",left:(treeOuterWidth+"px")});
    //tree.obDiv.hide();
    //tree.protoDiv.hide();
    tree.dataContainer.css({width:(svgwd + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    svgDiv.css({width:svgwd +"px",height:svght + "px"});
    svg.main.resize(svgwd,svght);
    //draw.svgwd = canvasWidth;
    //draw.canvasHeight = canvasHeight;
    if (docDiv) docDiv.css({left:"0px",width:pageWidth+"px",top:docTop+"px",overflow:"auto",height:docHeight + "px"});
    //theCanvas.positionButtons(svgwd);
   // plusbut.css({"left":(svgwd - 50)+"px"});
   // minusbut.css({"left":(svgwd - 30)+"px"});
    noteDiv.css({"width":(svgwd - 140)+"px"});
  
    if (firstLayout) {
      firstLayout = 0;
      layout();
      return;
    }
    return;
    if (draw.mainCanvas) {
      var rtt = draw.mainCanvas.transform();
      if (rtt  &&  !draw.autoFit && !noDraw) {
        draw.mainCanvas.adjustTransform(rtt,cdims);
        draw.refresh();
      }
    }

}

  
  // now this is an occaison to go into flat mode
  function setInstance(itm) {
    if (!itm) {
      return;
    }
    if (!flatMode) {
      setFlatMode(true);
      topBut.show();
      upBut.show();
    }
    tree.showItem(itm,itm.selectable?"expand":"fullyExpand");
    tree.showProtoChain(itm);
    upBut.show();
    return;
  }
  
 om.selectCallbacks.push(setInstance);

  
  page.elementsToHideOnError = [];
 
 
  
 

  // a prototype for the divs that hold elements of the prototype chain
  
 tree.protoSubDiv = dom.El({tag:"div",style:{"background-color":"white","margin-top":"20px",border:"solid thin green",
                               padding:"10px"}});

  var errorDiv =  dom.wrapJQ($('#error'));
  
  
  page.elementsToHideOnError.push(cols);
  
    page.elementsToHideOnError.push(actionDiv);

 
  docDiv =  dom.El({tag:"iframe",attributes:{src:"chartdoc.html"},style:{border:"solid thin black",position:"absolute"}});
  page.elementsToHideOnError.push(docDiv);
  tree.obDiv.click = function () {
    dom.unpop();
  };
  
 
  tree.protoDiv.click = function () {
    dom.unpop();
  };
  
  function setFlatMode(vl) {
    flatMode = vl;
    tree.enabled = !vl;
    obDivTitle.__element__.html(flatMode?"Selected Item":"Workspace");
    if (!vl) {
      tree.initShapeTreeWidget();
      tree.adjust();
      //tree.selectPathInTree(om.selectedNodePath);
    }
  }
  
  
  tree.setNote = function(k,note) {
    var h = '<b>'+k+':</b> '+note
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(h)
    return;
  }
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 

   

  var annLink = dom.El({'tag':'div'});
  annLink.addChild('caption',dom.El({'tag':'div'}));
  annLink.addChild('link',dom.El({'tag':'div'}));
// notes are set for a save, and only displayed when showing that saved item, not further saves down the line

  function showTopNote() {
    var note = om.root.__topNote__;
    if (note) {
      isTopNote = true;
      var svc = om.root.get("__saveCountForNote__");
      if (svc ===om.saveCount()) {
         topNoteSpan.setHtml(note);
      }
    }
  }
  
  page.setTopNote = function (txt) {
    om.root.__topNote__ = txt;
    om.root.__saveCountForNote__ = page.saveCount()+1;
    //code
  }
  
  
  function inspectItem(pth) {
    var loc = "/inspect?item=/"+pth;
    location.href = loc;
  }
 
  // called from the chooser
  
  function popItems(mode) {
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.chooser_lightbox;
    lb.pop(undefined,undefined,true);//without topline
    var fsrc = "http://"+om.liveDomain+(om.useMinified?"/chooser2.html":"/chooser2d.html"); // go to dev version from dev version
    fsrc = fsrc + "?mode="+mode;
    fsrc= fsrc + "&item="+unpackedUrl.url;
    lb.setHtml('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'"/>');
  }
  var functionToEdit;
  
  function editorWindow() {
    var ifrm = page.editorIframe;
    return ifrm[0].contentWindow;
  }
  
  
  window.fromEditor = function (msg,value) {
    if (msg == "ready") {
      var w = editorWindow();
      w.initializeEditor(page.editorRect,functionToEdit);
    } else if (msg === "newCode") {
      var pth = functionToEdit[1];
      var toe = "prototypeJungle."+pth +" = "+value;
      try {
        eval(toe);
      } catch(e) {
        var w = editorWindow();
        w.setPjError("Error: "+e.message);
        var wasError = 1;
      }
      if (!wasError) {
        mpg.editor_lightbox.dismiss();
        updateAndShow();
      }
    } else if (msg === "cancel") {
      mpg.editor_lightbox.dismiss();

    }
  }
  
  page.popEditor = function(f,path) {
    var pf = om.beforeChar(path,".");
    if (pf ==="wsfdsfs") {
      var af = om.afterChar(path,".");
      functionToEdit = [f,"prototypeJungle.om.root."+af]
    } else {
      functionToEdit = [f,path];
    }
    var lb = __pj__.mainPage.lightbox;
    lb.pop();
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.editor_lightbox;
    lb.pop();

    var awinwd = $(window).width();
    var awinht = $(window).height();
    var padding = 40;
    var vpadding = 60;
    var lbwd = Math.min(650,awinwd-padding);
    var lbht = awinht-2*vpadding;
    var lft = 0.5 * (awinwd - lbwd);
    var top  = 20;
    var rct = geom.Rectangle.mk({corner:[lft,top],extent:[lbwd,lbht]});
    lb.setRect(rct);
    page.editorRect = rct;
    var fsrc = om.useMinified?"edit.html":"editd.html"; // go to dev version from dev version
    lb.setHtml('<iframe frameborder="0" id="editorIframe" width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'"/>');
    lb.setTopline(path + " = ");
     page.editorIframe = $('#editorIframe');
   
                 
  }
  
  // hmmm bundled not supported
  //path will be supplied for saveAs
  // called from the chooser
  page.saveItem = function (path,bundled) {
    bundled = false;
    if (!path) {
      if (page.newItem) {
        var url = "http://s3.prototypejungle.org"+page.newItem;
      } else {
        url = unpackedUrl.url;
      }
    } else {
      var url = om.itemHost+path;
    }
    var upk = om.unpackUrl(url);
    unpackedUrl = upk;
    // make sure the item is at the right place
    __pj__.set(upk.path,om.root);
    om.root.__beenModified__ = 1;
    if (bundled) {
      om.root.__bundled__ = 1;
    }
    var svcnt = page.saveCount();
    om.root.__saveCount__ = svcnt+1;
    //if (!inspectDom) om.root.set("__canvasDimensions__",geom.Point.mk(draw.canvasWidth,draw.canvasHeight));
    var upk = om.unpackUrl(url,true);
    om.s3Save(om.root,upk,function (srs) {
      om.root.__saveCount__ = svcnt;
      var asv = afterSave(srs);
      if (asv === "ok") {
        var inspectD = om.useMinified?"/inspect":"inspectd";
        page.setSaved(true);
        if (page.newItem) {
          var loc = inspectD+"?item="+url;
          location.href = loc;
        } else if (path) { //  go there for a saveAs
          //page.itemSaved = true; // so no confirmation of leaving page
          var loc = inspectD+"?item="+url;
          location.href = loc;
        } else {
          //page.setSaved(true);
          if (!bundled) {
            om.root.deepUpdate(null,om.overrides);
            draw.refresh();
          }
        }
      }
    },bundled);  // true = remove computed
  }
   page.messageCallbacks.saveItem = page.saveItem;
   
  page.newBuild = function (path) {
    var url = om.itemHost + "/"+path;
    var uurl = om.unpackUrl(url);
    om.s3Save(om.DNode.mk(),uurl,function (rs) {
        //location.href = url;
      },undefined,true); //true unbuilt
  }
   page.messageCallbacks.newBuild = page.newBuild;

// returns "ok", or an error message
function afterSave(rs) {
  if (rs.status==='fail') {
    if (rs.msg === 'collision') {
      var ht = 'An unlikely name collision took place. Please try your save again.'
    } else if (rs.msg === 'busy') {
      var ht = 'The site is too busy to do the save. Please try again later';
    } else if ((rs.msg==="noSession")||(rs.msg === "timedOut")) {
      var ht = 'Your session has timed out. Please sign in again.'
      page.nowLoggedOut();
    } else {
      var ht = "Error: "+rs.msg;
    }
    return ht;
  } else {
    return "ok"
  }
}
  page.saveCount = function () {
    var svcnt = om.root.__saveCount__;
    return (typeof svcnt === "number")?svcnt:0;
  }
  
  // OBSOLETE
  page.insertData = function (url,whr,cb) {
    om.getData(url,function (rs) {
      var dt = JSON.parse(rs);
      var ldt = om.lift(dt);
      om.root.set(whr,ldt);
      updateAndShow();
      cb("ok");     
    });
  }
  
  function prototypeSource(x) {
    var p = Object.getPrototypeOf(x);
    return om.pathExceptLast(p.__source__);// without the /source.js
  }
    
    // now somewhat specialized for adding captions and buttons,
    // but only via the last two arguments
  function finishInsert(x,pwhr,whr,cb,funToAdd,computableText) {
    // if pwhr is null, just instantiate x
    if (pwhr) {
      var prt = om.root.set("prototypes/"+pwhr,x.instantiate().hide());
      prt.namedType();
      om.root.prototypes.__doNotUpdate__ = 1;
    } else {
      prt = x;
    }
    var inst = om.root.set(whr,prt.instantiate().show());
    if (funToAdd) {
      var nm = funToAdd[0];
      inst[nm] = funToAdd[1];
      inst.setvis(nm,1);
      
    }
    if (1 || computableText) {
      inst.convertToComputedField("text");
    }
    inst.draggable = 1;
    if (!om.overrides) {
      om.overrides = {};
    }
    // deal with data sources

  }
  // returns true, false, or "conflict"
  page.prototypeAlreadyThere = function (url,pwhr) {
    var exp = om.evalPath(om.root,"prototypes/"+pwhr); // is the prototype already there?
    if (!exp) return false;
    var src = prototypeSource(exp);
    if (src===url) {
      return true;
    } else {
      return "conflict";
    }
  }
  
   page.alreadyThere = function (whr) {
    var exp = om.evalPath(om.root,whr); // is the prototype already there?
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


  page.rebuildItem = function () {
    var buildPage = om.useMinified?"/build":"/buildd";
    location.href =buildPage+"?item=/"+page.itemPath;
  }

  page.saveImage = function (path,cb) {
    var url = om.itemHost+"/"+path;
    var upk = om.unpackUrl(url);
    var img = upk.image;
    draw.mainCanvas.postCanvas(path,function (rs) {
      cb(rs);
    });     
  }
  
  
  actionDiv.addChild("itemName",itemName);
 
  var signedIn,itemOwner,codeBuilt;
  
  function setPermissions() {
    signedIn = (localStorage.signedIn === "1") || (localStorage.sessionId);// works at prototypejungle and prototype-jungle
    var h = unpackedUrl.handle;
    itemOwner = signedIn && (h===localStorage.handle);
    page.codeBuilt = codeBuilt = !om.root.__saveCount__;
  }
  // file options pulldown
  
  var fsel = dom.Select.mk();
  
  fsel.containerP = jqp.pulldown;
  fsel.optionP = jqp.pulldownEntry;
  var fselJQ;

  
  function initFsel() {
    fsel.options = ["New Build...","Open...","Save","Save As...","Save Image...","Delete"];
    fsel.optionIds = ["new","open","save","saveAs","saveImage","delete"];
    fselJQ = fsel.toJQ();
    mpg.addChild(fselJQ); 
    fselJQ.hide();
  }
  
  function setFselDisabled() {
      fsel.disabled = {"new":!signedIn,save:codeBuilt || !itemOwner,saveAs:!signedIn,saveImage:!signedIn,delete:!itemOwner};
  }
      
  
  fsel.onSelect = function (n) {
    var opt = fsel.optionIds[n];
    if (fsel.disabled[opt]) return;
    if (opt === "delete") {
      confirmDelete();
      return;
    }
    if (opt === "save") {
      itemName.setHtml("Saving ...");
      dom.unpop();
      page.saveItem();
    } else {
      popItems(opt);
    }
  }
 
 

  fileBut.click = function () {
    setFselDisabled();
    dom.popFromButton("file",fileBut,fselJQ);
  }

 
 
 
  
  var viewBut = jqp.ubutton.instantiate();
  viewBut.html = "View";

  var vsel = dom.Select.mk();
  vsel.disabled = {};
  vsel.isOptionSelector = 1;
  vsel.containerP = jqp.pulldown;
  vsel.optionP = jqp.pulldownEntry;
  vsel.options = ["Only editable fields",
                  "All fields except functions",
                  "All fields, including functions"];
  vsel.optionIds = ["editable","notFunctions","all"];
  vsel.onSelect = function (n) {
    if (n===0) {
      tree.onlyShowEditable = true;
      tree.showFunctions = false;
    } else if (n===1) {
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

 
  
  tree.onlyShowEditable= false;
  tree.showFunctions = false;
  
  
 
  tree.autoUpdate = 1;
  
  page.alert = function (msg) {
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(msg);
  }
 
  //src is who invoked the op; "tree" or "draw" (default is draw)
  function updateAndShow(src,forceFit) {
    om.root.removeComputed();
    om.root.deepUpdate(null,null,om.overrides);
    if (forceFit) draw.mainCanvas.fitContents(true);
    draw.refresh();
    if (src!="tree") tree.initShapeTreeWidget();
  }
 
  tree.updateAndShow = updateAndShow; // make this available in the tree module

  
  
  function enableButton(bt,vl) {
    bt.disabled = !vl;
    bt.css({color:vl?"black":disableGray});
  }
  // r = [isParent,isChild]
  function enableTreeClimbButtons() {
    var isc = tree.selectionHasChild();
    var isp = tree.selectionHasParent();
    enableButton(upBut,isp);
    enableButton(topBut,isp);
    enableButton(downBut,isc);
  }
 
  //om.selectCallbacks.push(function () {  @todo put back
  //   enableTreeClimbButtons();
  //});


  topBut.click = function () {
    if (topBut.disabled) return;
    setFlatMode(false);
    enableTreeClimbButtons();
  }
  
  upBut.click = function () {
    if (upBut.disabled) return;
    tree.showParent(); // returns hasParent,hasChild
    enableTreeClimbButtons();
  }
  
  
  downBut.click = function () {
    if (downBut.disabled) return;
    tree.showChild();
    enableTreeClimbButtons();
  }
 
  
  function aboutText() {
    var rt = om.root;
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
    
    
    
  aboutBut.click = function () {
    dom.unpop();
    var rt = om.root;
    mpg.lightbox.pop();
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
  var iurl = unpackedItem.url;
  var rs = $("<div />");
  var url =iurl + "/view";
  rs.append("<p>The URI of this item is </p>");
  rs.append("<p style='padding-left:20px'>"+iurl+"</p>");
  rs.append("<p>To inspect it (ie, the current page): </p>");
  rs.append("<p style='padding-left:20px'>"+om.mkLink("http://sprototypeJungle.org?item="+iurl)+"</p>");
 rs.append("<p>To view it: </p>");
  rs.append("<p style='padding-left:20px'>"+om.mkLink(iurl+"/view")+"</p>");
 rs.append("<p>Embed (adjust width and height to taste):</p>");
  var emb = om.mkEmbed(url);
  var dv = $("<input class='embed'/>");
  dv.attr("value",emb);
  dv.click(function () {
    dv.focus();dv.select();
  });
  rs.append(dv);
  rs.append("<p>Tweet this  item:</p>");
  var tw = genTweeter(unpackedUrl.name + ' at PrototypeJungle',url);
  rs.append(tw);
  return rs;
 }


   shareBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setContent(shareJq());
   };
   
   
   helpBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setHtml(getHelpHtml());
   };
   
  stickyBut.click = function () {
    if (theCanvas.stickyHover) {
      theCanvas.stopStickyHovers();
      stickyBut.setHtml('Sticky Hovers');
    } else {
      theCanvas.stickyHover = 1;
      stickyBut.setHtml('Unstick Hovers');
    }
  }
   
   
   
   
 // mainTitleDiv.click = function () {
 //   location.href = "http://prototypejungle.org";
 // }
  
  page.itemSaved = true; // need this back there
  
  page.setSaved = function(saved) {
    // those not logged in can't save anyway
    setSynced("Objects",saved);
    if (!localStorage.sessionId) {
      return;
    }
    
    if (saved == page.itemSaved) return;
    page.itemSaved = saved;
    //var nm =  page.newItem?"New Item*":(saved?page.itemName:page.itemName+"*");
    //itemName.setHtml(nm);
    fsel.setDisabled("save",saved); // never allow Save (as opposed to save as) for newItems
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
      var pth = unpackedUrl.spath;
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
  
  
  
  
//  draw.stateChangeCallbacks.push(function () { @todo put back
//    page.setSaved(false);
//  });
  
  //============= Support for the code editor ==============
  var editor,dataEditor;
  

  

function displayEditMessage(msg,isError){
  editMsg.css({color:isError?"red":(msg?"black":"transparent")});
  editMsg.setHtml(msg?msg:"-");
}


function displayEditError(msg){
  displayEditMessage(msg,1);
}


function displayEditDone() {
  displayEditMessage("Done");
  setTimeout(function () {
    displayEditMessage("");
  },500);
    //code
}

function getSource(src,cb) {
    // I'm not sure why, but the error call back is being called, whether or not the file is present
    function scb(rs) {
      if (rs.statusText === "OK") {
        cb(rs.responseText);
      } else {
        cb(undefined);
      }
    }
    var opts = {url:src,cache:false,contentType:"application/javascript",dataType:"string",type:"GET",success:scb,error:scb};
    $.ajax(opts);
  }
  
  var onChangeSet = 0;
  function showSource(src) {
    getSource(src,function (txt) {
      editor.setValue(txt);
      editor.clearSelection();
      setSynced("Data",1);
      if (!onChangeSet) {
        editor.on("change",function (){setSynced("Code",0);if (itemOwner) enableButton(saveCodeBut,1);});
        onChangeSet = 1;
      }

    });
}

/*
  function editAfterNewItem(building) {
    theCanvas.contents = om.root;
    theCanvas.surrounders = undefined;
    //theCanvas.init();
    //layout();
    theCanvas.fitContents();
    if (building) {
        om.s3Save(item,unpackedUrl,function (rs) {
          displayEditDone();
        });
    } else {
      displayEditDone();
    }
  }
*/
  function afterNewItem() {
    //om.root.data = om.data;
    var cxd = om.root.__currentXdata;
    if (cxd) {
      om.root.setData(om.root.__currentXdata__,false);
    } else {
      om.root.evaluateComputedFields();
      if (om.root.update) {
        om.root.update();
      }
      //code
    }
    svg.main.setContents(om.root);
    svg.main.fitContents();

    om.root.draw();
    //theCanvas.contents = om.root;
    //theCanvas.surrounders = undefined;
    //theCanvas.domContainer.empty();
    //theCanvas.initialView();
    tree.initShapeTreeWidget();   
    displayEditDone();
  }
// data from the editor is "inside" data, and is saved with the item
function getDataFromEditor() {
  if (!om.root.dataSource && dataEditor) {
    var ndj = dataEditor.getValue();
    if (ndj) {
      try {
        var nd = JSON.parse(ndj);
      } catch(e) {
        return "bad JSON";
      }
      //om.root.__xData__ = nd;
      //om.root.__currentXdata__ = nd;
      om.root.isetData(nd,true);
      //internalizeData(nd);
      return true;
    }
  }
}

var evalCatch = 0;;
function evalCode(building) {
  function theJob() {
    displayEditMessage(building?"Building...":"Running...");
    var cmps = om.root.__components__;
    if (cmps) {
      var upk = page.unpackedUrl;
      var h = upk.handle;
      var repo = upk.repo;
      var curls = [];// component urls
      cmps.forEach(function (c) {
        if (c[0]===".") { // repo relative
          curls.push(om.itemHost + "/"+h+"/"+repo+c.substr(1));
        } else {
          curls.push(om.itemHost + c);
        }
      });
    }    
    var ev = editor.getValue();
    
    var gd = getDataFromEditor();
    if (gd === "bad JSON") {
      displayEditError("The data is not valid JSON");
      return;
    }
    var cxd=om.root.__currentXdata__;
    var d = om.root.data;
    var createItem;
    var wev = "createItem = function (item) {\n"+ev+"\n}";
    om.restore(curls, function () {
      eval(wev);

      var itm = __pj__.set(unpackedUrl.path,svg.g.mk());
      createItem(itm);
      //itm.__xData__ = om.root.__xData__;
      if (cxd) {
        itm.__currentXdata__ = cxd;
      } else if (d) {
        itm.set("data",d);
      }
      if (om.root.__components__) {
        itm.set("__components__",om.root.__components__);
      }
      //itm.set("data",om.root.data);
      om.root = itm;
      if (building) {
        om.s3Save(itm,unpackedUrl,function (rs) {
          unbuilt = 0;
          unbuiltMsg.hide();
          setSynced("Data",1);
          setSynced("Components",1);
          afterNewItem();
        },true);
      } else {
        afterNewItem();
      }
    });
  }
  if (evalCatch) {
    try {
      theJob();
    } catch(e) {
      displayEditError(e);
     // $('#err').html(e);
     return;
    }
  } else {
    theJob();
  }

  $('#err').html(' ');
    //code
}


var errorMessages = {timedOut:"Your session has timed out. Please log in again.",
                             noSession:"You need to be logged in to save or build items."}
// are these various things different from their persistent reps?

var synced = {Components:1,Data:1,Code:1,Objects:1};
var unbuilt = 0;

function setSynced(which,value) {
  var cv = synced[which];
  if (cv === value) return;
  var jels = modeTab.jElements;
  //var idx = modeTab.elements.indexOf(which);
  var jel = modeTab.jElements[which];
  if (value) {
    jel.setHtml(which);
  } else {
    jel.setHtml(which +"*");
  }
  synced[which] = value;
}

// holds building state for the call back
  var saveSourceBuilding = 0;
  page.messageCallbacks.saveSource = function (rs) {
    $('#saving').hide();
    if (rs.status !== "ok") {
     var msg = errorMessages[rs.msg];
     msg = msg?msg:"Saved failed. (Internal error)";
     
     displayEditError(msg);
   } else {
     setSynced("Code",1);
     page.setSaved(true);
     if (!saveSourceBuilding) {
      unbuilt = 1;
      unbuiltMsg.show();
      displayEditDone();
     }
     var cb = saveSourceCallback;
     if (cb) {
       cb();
     }
   }
  }
 // page.messageCallbacks.notSignedIn = function (rs) {
 //   page.nowLoggedOut();
 // }
  
function saveSource(cb,building) {
    $('#error').html('');
    var dt = {path:unpackedUrl.spath,source:editor.getValue(),kind:"codebuilt"};

    if (!building) { //stash off xData and components, and declare unbuilt
      var anx = {value:"unbuilt",url:unpackedUrl.url,path:unpackedUrl.path,repo:(unpackedUrl.handle+"/"+unpackedUrl.repo)};
      if (om.root.__xData__) {
        anx.data = om.root.__xData__;
      }
      if (om.root.__components__) {
        anx.components = om.root.__components__.toArray();
      }
      dt.data = "prototypeJungle.om.loadFunction("+JSON.stringify(anx)+")";
      dt.code = "//unbuilt";
    }
    
    $('#saving').show();
    if (!building) displayEditMessage("Saving...");
    saveSourceBuilding = building;
    saveSourceCallback = cb;
    
    page.sendWMsg(JSON.stringify({apiCall:"/api/toS3",postData:dt,opId:"saveSource"}));
    return;
    om.ajaxPost("/api/toS3",dt,function (rs) {
       $('#saving').hide();
       if (rs.status !== "ok") {
        var msg = errorMessages[rs.msg];
        msg = msg?msg:"Saved failed. (Internal error)";
        
        displayEditError(msg);
      } else {
        setSynced("Code",1);
        page.setSaved(true);
        if (!building) displayEditDone();
        if (cb) {
          cb();
        }
      }
    });
  }

function doTheBuild() {
    saveSource(function () {
      evalCode(true);
    },true);
}


function saveTheCode() {
    saveSource(function () {
      enableButton(saveCodeBut,0);
      setSynced("Data",1);
      setSynced("Components",1);
    },false);
}

saveAsBuildBut.click = function () {popItems('saveAsBuild');};

page.messageCallbacks.saveAsBuild = function (path) {
  var src = om.stripInitialSlash(unpackedUrl.spath);
  var dst = om.stripInitialSlash(path);
  debugger;
  page.sendWMsg(JSON.stringify({apiCall:"/api/copyItem",postData:{src:src,dest:dst},opId:"saveBuildDone"}));

}

page.messageCallbacks.saveBuildDone = function (rs) {
  debugger;
  mpg.chooser_lightbox.dismiss();

}
  function expandSpath(sp) {
    var uurl = page.unpackedUrl;
    if (sp.indexOf("./") === 0) {
      return "/"+uurl.handle+"/"+uurl.repo+sp.substr(1);
      //code
    } else {
      return sp;
    }
    //code
  }
  function addComponentEl(spath) {
    var cel = dom.El({tag:'div'});
    var epath = expandSpath(spath);
    var pream = "http://prototypejungle.org/inspectd.html?item=";
    cel.addChild(dom.El({tag:'a',html:spath,attributes:{href:pream+om.itemHost+epath}}));
    var delcel = dom.El({tag:'span',class:"roundButton",html:'X'});
    if (itemOwner && page.codeBuilt) {
      cel.addChild(delcel);
      delcel.click = function () {cel.remove();om.root.__components__.remove(spath);setSynced("Components",0)};
    }
    tree.componentsDiv.addChild(cel);
    cel.install();

  }
  page.addComponent = function (spath,cb) {
    if (cb) cb();
    var r = /\/([^\/]*)\/([^\/]*)\/(.*)$/
    var m = spath.match(r);
    var h = m[1];
    var repo = m[2];
    var upk = page.unpackedUrl;
    if ((upk.handle === h) && (upk.repo === repo)) {
      var path = "./"+m[3];
    } else {
      path = spath;
    }
    if (om.root.__components__ === undefined) {
      om.root.set("__components__",om.LNode.mk());
    }
    var cmps = om.root.__components__;
    if (cmps.indexOf(path)>=0) {
      return;
    }
    om.root.__components__.push(path);
    addComponentEl(path,spath);
    setSynced("Components",0);
   
  }
  page.messageCallbacks.addComponent = function (pth) {
    page.addComponent(pth);
    mpg.chooser_lightbox.dismiss();
  }


  addComponentBut.click = function () {popItems('addComponent');};
  // saveCodeEnabled = 0;
  var disableGray = "#aaaaaa";
 
  var firstEdit = true;
  function toEditMode() {
    tree.objectContainer.hide();
    tree.componentContainer.hide();
   //tree.obDiv.hide();
    //tree.protoDiv.hide();
    tree.dataContainer.hide();
    tree.editContainer.show();
    if (firstEdit) {
      editor = ace.edit("editDiv");
      editor.setTheme("ace/theme/TextMate");
      editor.getSession().setMode("ace/mode/javascript");
      if (!page.codeBuilt) editor.setReadOnly(true);
    //editor.on("change",function (){console.log("change");setSaved(false);displayMessage('');layout();});
      showSource((codeBuilt?unpackedUrl.url:om.root.__source__)+"/source.js");//unpackedUrl.url+"/source.js");
      enableButton(buildBut,codeBuilt && itemOwner);
      enableButton(saveAsBuildBut,codeBuilt && signedIn);
      enableButton(execBut,codeBuilt);
      //enableRun(codeBuilt);
      firstEdit = false;
    }
  }
  
  var firstDataEdit = true;
  //var xData = {a:22};
  function toDataMode() {
    var xD = om.root.__currentXdata__;
    var iD = om.root.data;
    if (xD) {
      var d = xD;
    } else if (iD) {
      if (typeof iD === "object") {
        d = iD.fromNode();
      } else {
        d = iD;
      }
    }
    var jsD = d?JSON.stringify(d):"";
    tree.objectContainer.hide();
    tree.editContainer.hide();
    tree.componentContainer.hide();

    tree.dataContainer.show();
    if (firstDataEdit) {
      dataEditor = ace.edit("dataDiv");
      if (om.root.dataSource) {
        dataEditor.setReadOnly(true);
      }
      dataEditor.getSession().setUseWrapMode(true);
      //dataEditor.setWrapBehavioursEnabled(true);
      dataEditor.setTheme("ace/theme/TextMate");
      dataEditor.getSession().setMode("ace/mode/javascript");
      
      dataEditor.setValue(jsD);
      dataEditor.clearSelection();
      dataEditor.on("change",function (){setSynced("Data",0);});

      firstDataEdit = false;
    }
  }
  
  function toObjectMode() {
    tree.editContainer.hide();
    tree.dataContainer.hide();
    tree.componentContainer.hide();
    tree.objectContainer.show();
  }
  
  var firstComponentMode = true;
  function toComponentMode() {
    tree.editContainer.hide();
    tree.dataContainer.hide();
    tree.objectContainer.hide();
     tree.componentContainer.show();
    if (firstComponentMode) {
      var cmps = om.root.__components__;
      if (cmps) {
        cmps.forEach(addComponentEl);
      }
      firstComponentMode = false;
    }
 }
  
  
  function setMode(md) {
    if (md==="Code") {
      toEditMode();
    } else if (md==="Objects") {
      toObjectMode();
    } else if (md==="Data") {
      toDataMode();
    } else if (md == "Components") {
      toComponentMode();
    }
  }
  
  modeTab.action = setMode;
  
  function initializeTabState() {
    if (page.codeBuilt) {
                  
      if (itemOwner){
        var emsg = " HOOB ";
      } else {
        emsg = "You lack edit permissions for this item, but you can experiment anyway, by fiddling with the code and running it.";
      } 
        
    } else {
      var src = om.root.__source__;
      emsg = 'This is a variant of <a href="/inspectd.html?item='+src+'">'+
        om.stripDomainFromUrl(src)+'</a>, which was built from the code below';
    }
    if (!page.codeBuilt || !itemOwner) {
      addComponentBut.hide();
    }
    editMsg.__element__.html(emsg);
    if (unbuilt) {
      unbuiltMsg.show();
    } else {
      unbuiltMsg.hide();
    }
  }
  
  /* non-standalone items should not be updated or displayed; no canvas needed; show the about page intead */
  page.genMainPage = function (standalone,cb) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    if (page.includeDoc) {
      mpg.addChild("doc",docDiv);
    }
   
    //om.root.customUIaction = om.showComputed;
    if (om.root.customUIaction) {
      customBut.click = function () {om.root.customUIaction();};
    } else {
      customBut.hide();
    }
    /*  var dUrl = om.root.dataSource;
    if (dUrl) {
      viewDataBut.click = viewData;
    } else {
      viewDataBut.hide();
    }
    */
    execBut.click = function () {
      if (!execBut.disabled) evalCode();
    };
    buildBut.click = function () {
      if (!buildBut.disabled) doTheBuild();
    };
    saveCodeBut.click = function () {
      if (!saveCodeBut.disabled) saveTheCode();
    };
   
    mpg.install($("body"));
    if (standalone) {
      svg.init(svgDiv.__element__[0]);
      //theCanvas = dom.addCanvas(canvasDiv);
  
    }
    enableButton(saveCodeBut,0);

    if (standalone && 0 ) {//@todo put back
      
       theCanvas.initButtons("View");
      
      theCanvas.navbut.__element__.click(function () {
        var viewPage = om.useMinified?"/view.html":"viewd.html";
        var url = viewPage + "?item="+unpackedUrl.spath;
        if (om.root.dataSource) {
          url = url + "&data="+om.root.dataSource;
        }
        location.href = url;
      });
    }

    setFlatMode(false);
    $('.mainTitle').click(function () {
      location.href = "http://prototypejungle.org";
    });
   
 
    page.genButtons(ctopDiv.__element__,{toExclude:{'about':1}}, function () {
      fsel.jq.__element__.mouseleave(function () {dom.unpop();});  
      if (standalone && !inspectDom) {
        //theCanvas.contents = om.root;
        //draw.addCanvas(theCanvas);
        //theCanvas.contents = om.root;
        //theCanvas.init();
      } else if (!inspectDom) {
        aboutBut.hide();
        var nstxt = "<div class='notStandaloneText'><p>This item includes no visible content, at least in this standalone context.</p>";
        nstxt += aboutText() + "</div>";
        svgDiv.setHtml(nstxt);
      }
      $('body').css({"background-color":"#eeeeee"});
      if (!om.root.hasHovers) {
        stickyBut.hide();
      }
  
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
      var elb = lightbox.newLightbox($('body'),rc,__pj__.lightbox.template.instantiate());
      mpg.set("editor_lightbox",elb);
      itemName.setHtml(unpackedUrl.name);
      cb();   
    });
  }
    

    
    // note about code built items
    // they are loaded, then instantiated, and assigned the path prototypeJungle.ws
    // but before saving, they are moved to the right place in the tree for where they will be saved.
 
  page.initPage = function (o) {
    var q = om.parseQuerystring();
   // draw.bkColor = "white";
    var wssrc = q.item;
    unpackedUrl = om.unpackUrl(wssrc);
    page.unpackedUrl = unpackedUrl; 
   // var idataSource = q.data;
    //var idataSource = page.getDataSourceFromHref();
    page.newItem = q.newItem;
    var itm = q.item;
    page.includeDoc = q.intro;
  
  
    
    //page.itemUrl =  wssrc;
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
          om.tlog("document ready");
          $('body').css({"background-color":"white",color:"black"});
          om.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a page-back inadvertantly
          page.addMessageListener();
          /*window.addEventListener("message",function (event) {
            var jdt = event.data;
            var dt = JSON.parse(jdt);
            debugger;
            om.dispatchMessageCallback(dt.opId,dt.value);
            //location.href = sdt;
          });
          */
          //if (localStorage.signedIn === "1") {
          //  $('#workerIframe').attr('src','http://prototype-jungle.org:8000/worker.html');
         // }
            function afterInstall(ars) {
              om.tlog("install done");
              var ln  = ars?ars.length:0;
              if (ln>0) {
                var rs = ars[ln-1];
                if (rs) { // rs will be undefined if there was an error in installation 
                  unbuilt = rs.unbuilt;
                  if (unbuilt) {
                    frs = rs;
                  } else {
                    var inst  = !(rs.__beenModified__);// &&  !noInst; // instantiate directly built fellows, so as to share their code
                    var ovr = installOverrides(rs);
                    if (inst) {
                      // data,if any, should not be instantiated
                      var dt = rs.data;
                      delete rs.data;
                      frs = rs.instantiate()
                      if (dt) {
                        frs.set("data",dt);
                      }
                      __pj__.set("ws",frs);
                      frs.__source__ = unpackedUrl.url;
                      
                    } else {
                      frs = rs;
                    }
                  }
                  
                 // ws[rs.__name__] = frs; // @todo rename if necessary
                  om.root =  frs;
                  page.codeBuilt = !(frs.__saveCount__);
                  //draw.enabled = !inspectDom &&!frs.notStandalone;
                  var standalone = 1;//draw.enabled;
                  showTopNote();
                  if (standalone) {
                    om.overrides = ovr;
                   // frs.deepUpdate(null,null,ovr); wait until data is loaded
                   
                    var bkc = frs.backgroundColor;
                    if (!bkc) {
                      frs.backgroundColor="white";
                    }
                  }
                } else {
                  om.root ={__installFailure__:1};
                }
              } else {
                // newItem
                om.root =  __pj__.set("ws",svg.shape.mk());
                om.root.backgroundColor="white";
                standalone = true;
                page.codeBuilt = false;
              }
                initFsel();
                page.genMainPage(standalone,function () {
                            om.tlog("starting build of page");
                  setPermissions();
                  initializeTabState();
                  setFselDisabled(); 
                  if (!wssrc) {
                    page.setSaved(false);
                  }
                  if  (!om.root.__about__) {
                    aboutBut.hide();
                  }
                  var ue = om.updateErrors && (om.updateErrors.length > 0);
                  if (ue) {
                    var lb = mpg.lightbox;
                    lb.pop();
                    lb.setHtml("<div id='updateMessage'><p>An error was encountered in running the update function for this item: </p><i>"+om.updateErrors[0]+"</i></p></div>");
                  }
                  function afterAfterLoadData() {
                    tree.initShapeTreeWidget();
                    var isVariant = !!(om.root.__saveCount__);
                    if (inspectDom) { // not in use, but might come back
                      var doc = om.root.document;
                      if (doc) {
                        var dmf = doc.domify();
                        canvasDiv.addChild(dmf);
                        dmf.install();
                      }
                    } else if (standalone) {
                      //svg.main.setContents(om.root);
                      om.root.draw();//  get all the latest into svg
                      svg.main.fitContents();
                      om.root.draw();
                      
                      // theCanvas.initialView();   @todo back
                    }
                    //page.toEditMode();
                  }
                  var ds = om.initializeDataSource(page.unpackedUrl);//om.root.dataSource;
                  if (ds) {
                   // page.setDataSourceInHref(om.root.dataSource);
                    om.loadData(ds,function (err,dt) {
                      om.afterLoadData(err,dt);
                      afterAfterLoadData();
                    });
                  } else {
                    om.afterLoadData(null,null);
                    afterAfterLoadData();
                  }
                
                });
            
            }
            if (!wssrc || 0) {// || 1) put this in when the fellow is unloadable
              afterInstall();
            } else {
                //var lst = om.pathLast(wssrc);
                om.tlog("Starting install");
                om.install(unpackedUrl.url,afterInstall)
            }
            
            $(window).resize(function() {
                layout();
                //draw.mainCanvas.fitContents();

              });   
          });
  }
})(prototypeJungle);
/*
 http://prototypejungle.org:8000/inspectd?item=http://s3.prototypejungle.org/sys/repo0/chart/component/Bubble&data=./testdata/Bubble.
 
  */

