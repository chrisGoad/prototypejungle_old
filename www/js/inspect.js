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
      draw.theCanvas.attr({width:canvasWidth,height:canvasHeight}); 
      draw.hitCanvas.attr({width:canvasWidth,height:canvasHeight}); 
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
    var rtt = draw.rootTransform();
    if (rtt  &&  !draw.autoFit && !noDraw) {
      draw.adjustTransform(rtt,cdims);
      draw.refresh();
    }

}
  var mpg; // main page
  /* the set up:  ws has one child other than transform. This is the subject of the edit; the "page"; the "top".
    The save operation saves this under its name in the selected library. */
  draw.canvasWidth = 600;
  draw.canvasHeight = 600;;
  tree.codeToSave = "top";
  
  /* saw the lone ranger. a principle was observed: only nonsense among non-humans alowed. */
  var jqp = __pj__.jqPrototypes;
  //var topbarDiv = dom.newJQ({tag:"div",style:{position:"relative",left:"0px","background-color":bkColor,"margin":"0px",padding:"0px"}});
  var topbarDiv = dom.wrapJQ('#topbar',{style:{position:"relative",left:"0px","background-color":bkColor,"margin":"0px",padding:"0px"}});
  var mainTitleDiv = dom.wrapJQ('#mainTitle');
  //var mainTitleDiv = dom.newJQ({tag:"div",html:"Prototype Jungle ",hoverIn:{"color":"#777777"},hoverOut:{color:"black"},style:{color:"black","cursor":"pointer","float":"left",font:"bold 12pt arial"}});
  var titleDiv = dom.newJQ({tag:"div",style:{color:"black",float:"left",font:"bold 12pt arial",width:"140px","padding-left":"60px","padding-top":"10px"}});
 // var subtitleDiv = dom.newJQ({tag:"div",html:"Inspector/Editor",style:{font:"10pt arial",left:"0px"}});
  //var mpg = dom.newJQ({tag:"div",style:{position:"absolute","margin":"0px",padding:"0px"}});
   var mpg = dom.wrapJQ("#main",{style:{position:"absolute","margin":"0px",padding:"0px"}});
   
    mpg.addChild("topbar",topbarDiv);
 /* topbarDiv.addChild("title",titleDiv);
  titleDiv.addChild("maintitle",mainTitleDiv);
  titleDiv.addChild("subtitle",subtitleDiv);
  */
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
  function addCanvas() {
    var cnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
    canvasDiv.addChild("canvas", cnv);
    draw.theCanvas = cnv;
    var hitcnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin blue",width:200,height:200}});
    mpg.addChild("hitcanvas", hitcnv);
    draw.hitCanvas = hitcnv;
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
  //var hitcnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin blue",width:"100%",height:cnvht}});
 
  var uiDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px",
                               padding:"0px"}});
  cols.addChild("uiDiv",uiDiv);


  var actionDiv = dom.newJQ({tag:"div",style:{position:"absolute",margin:"0px",
                              overflow:"none",padding:"5px",height:"20px"}});
  
  var itemName = dom.newJQ({tag:"span",html:"Name",style:{overflow:"none",padding:"5px",height:"20px"}});
  

                              
  topbarDiv.addChild('action',actionDiv);
    page.elementsToHideOnError.push(actionDiv);

  //var ctopDiv = dom.newJQ({tag:"div",style:{float:"right"}});
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
    //alert("going to ",loc);
    location.href = loc;
  }
  /*
  var itemLines;
  var itemLinesByName;
  var selectedItemLine;
  var itemSelectedInPanel; // the full path
  var selectedFolder;
  var selectedFolderPath;
  var fileTree;
  var afterYes;
  var isVariant;
  var itemsMode;
  
  
  function initVars() {
    itemLines = [];
    itemLinesByName = {}
    selectedFolder = selectedFolderPath = undefined;
    var svcnt = draw.wsRoot.__saveCount__;
    isVariant = (svcnt > 0); // this is already a variant
   
  }
  
  var openB,folderPanel,itemsPanel,panels,urlPreamble,fileName,errDiv,yesBut,noBut,newFolderLine,newFolderB,
      newFolderInput,newFolderOk;
 

  var itemsBrowser =  dom.newJQ({tag:"div",style:{width:"100%",height:"100%"}}).addChildren([
    newFolderLine = dom.newJQ({tag:"div"}).addChildren([
      newFolderB  = dom.newJQ({tag:"span",html:"New Folder",
                              hoverOut:{"background-color":"white"},
                              hoverIn:{"background-color":tree.highlightColor},style:{cursor:"pointer"}}),
      newFolderInput = dom.newJQ({tag:"input",type:"input",
                         style:{font:"8pt arial","background-color":"#e7e7ee",width:"60%","margin-left":"10px"}}),
      newFolderOk =  jqp.button.instantiate({html:"Ok"})

    ]),
    panels = dom.newJQ({tag:"div",style:{width:"100%",height:"80%","border":"solid thin black",}}).addChildren([
      folderPanel = dom.newJQ({tag:"div",style:{overflow:"auto",display:"inline-block",height:"100%",width:"40%","border-right":"solid thin black"}}),
      itemsPanel = dom.newJQ({tag:"div",html:"ITEMS",style:{overflow:"auto",float:"right",height:"100%",width:"58%","borderr":"solid thin black"}}),
    ]),
    dom.newJQ({tag:"div",style:{"padding-top":"10px",width:"100%"}}).addChildren([
      dom.newJQ({tag:"span",html:"URL: "}),
      urlPreamble = dom.newJQ({tag:"span"}),
      fileName = dom.newJQ({tag:"input",type:"input",
                         style:{font:"8pt arial","background-color":"#e7e7ee",width:"60%","margin-left":"10px"}}),
      dom.newJQ({tag:"div"}).addChildren([
        errDiv = dom.newJQ({tag:"span","class":"error","style":{"font-size":"10pt"}}),
        yesBut =  jqp.button.instantiate({html:"Yes"}),
        noBut =  jqp.button.instantiate({html:"No"})
      ])
     ]),
    openB = jqp.button.instantiate({html:"Open"})
    
  

  ]);
  
  openB.style["float"] = "right";
  

  function setFilename(vl) {
    fileName.prop("value",vl);
  }
  
  function fileExists(nm) {
    var cv = selectedFolder[nm];
    //var cv = om.evalPath(fileTree,localStorage.handle+"/"+pth);
    if (cv) {
      if (typeof cv == "object") {
        return "folder"
      } else {
        return "file";
      }
    }
  }
  
  function clearError() {
    errDiv.hide();
    yesBut.hide();
    noBut.hide();
    openB.show();
  }
  function setError(txt,yesNo) {
    errDiv.setHtml(txt);
    errDiv.show();
    openB.hide();
    if (yesNo) {
      noBut.show();
      yesBut.show();
    } else   {
      noBut.hide();
      yesBut.hide();
    }
  }
  
  yesBut.click =  function () {afterYes();} // after yes is set later
  noBut.click = clearError;

  
  openB.click = function () {
    if (itemsMode == "save") {
      page.saveFromItemPanel();
      return;
    }
    if (itemSelectedInPanel) {
      inspectItem(itemSelectedInPanel);
    } else {
      alert("Nothing selected");
      //for now
    }

  }

  function pathsToTree (fls) {
    var sfls = fls.map(function (fl) {return fl.split("/")});
    var rs = {};
    sfls.forEach(function (sfl) {
      var  cnd = rs;
      var ln = sfl.length;
      for (var i=0;i<ln;i++) {
        var nm = sfl[i];
        var nnd = cnd[nm];
        if (!nnd) {
          if (i == (ln-1)) {
            cnd[nm] = "leaf";
          } else {
            cnd[nm] = nnd = {};
          }
        }
        cnd = nnd;
      }
    });
    return rs;
  }
  
  //pick out the items
  function itemize(tr) {
    var rs = {};
    var  hasch = 0;
    for (var k in tr) {
      var st = tr[k];
      if (typeof st == "object") {
        if (st.view == "leaf") {
          rs[k] = "leaf";
          hasch = 1;
        } else {
          var ist = itemize(st);
          if (ist) {
            rs[k] = itemize(st);
            hasch = 1;
          }               
        }
      }
    }
    if (hasch) return rs;{
      //code
    }
  }
  
  // if the current item is a non-variant, we need to add the appropriate variants branch into the tree, if not there already
  // this is a lifted (ie DNode tree)
  function addVariantsBranch(tr,nd,nm) {
    var vrs = nd.setIfMissing("variants");
    vrs.setIfMissing(nm);
  }
  
  function addNewFolder(nm) {
    var sf = selectedFolder;
    var nnd  = om.DNode.mk();
    sf.set(nm,nnd);
    var wl = sf.widgetDiv;
    var nln = wl.addItemLine(nnd);
    tree.setSelectedFolder(wl);
  }
  
  newFolderOk.click = function () {
    var nm = newFolderInput.prop("value");
    addNewFolder(nm);
    
  }
  
  
  // finds the max int N among nms where nm has the form vN
  function maxVariantIndex(nms) {
    var rs = -1;
    nms.forEach(function (nm) {
      if (fc == "") return;
      var fc = nm[0];
      if (fc == "v") {
        var idxs = nm.substr(1);
        var idx = parseInt(idxs);
        if (idx != NaN) {
          rs = Math.max(idx,rs);
        }
      }
    });
    return rs;
  }
  
  // autonaming variant.
  function initialVariantName() {
    //var currentItemPath = om.stripDomainFromUrl(page.itemUrl);
    if (isVariant) {
      // then overwrite is the default
      return {resave:true,name:om.pathLast(page.itemUrl)};
    }
    var nmidx = maxVariantIndex(selectedFolder.ownProperties()) + 1;
    return {name:"v"+nmidx,resave:false}
    var ownr = om.beforeChar(currentItemPath,"/"); // the handle of the user that created the current item
    var h = localStorage.handle;
    var nm = om.pathLast(currentItemPath);
    var wsName = draw.wsRoot.__name__; //will be the same as name for the directly-built
    if (h == ownr) {
      
      //store the variant nearby in the directory structure, or resave it is a variant already
      var crpath = om.pathExceptFirst(currentItemPath);// relative to handle
      var crdir = om.pathExceptLast(crpath);
      if (isVariant) {
        return {resave:true,path:crpath};
      } else {
        var dir = crdir+"variants/"+nm+"/"; 
      }
    } else {
      dir = "variants/"+ownr+"/"+wsName+"/";
    }
    var cvrs = om.evalPath(itr,h+"/"+dir);
    if (cvrs) {
      var nmidx = maxVariantIndex(cvrs.ownProperties())+1;
    } else {
      nmidx = 0;
    }
    return {resave:false,path:dir+"v"+nmidx};
    
  }
 
  
  var firstPop = true;
  function popItems(mode) {
    var lb = mpg.lightbox;
    lb.pop(undefined,undefined,true);//without topline
    var wp = om.whichPage();
    var fsrc = (wp == "inspectd")?"chooser2d.html":"chooser2.html"; // go to dev version from dev version
    lb.setHtml('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'?mode='+mode+'"/>');
    return;
    initVars();
    var btext = itemsMode=="save"?"Save":(itemsMode=="new")?"New Item":"Open"
    openB.setHtml(btext);
    var h = localStorage.handle;
    var lb = mpg.lightbox;
    lb.pop();
    var cn = lb.content.__element__;
    itemsBrowser.uninstall();
    //var itemsBrowser= $('<div><div id="openButton" class="button">Open Item</div><div id="items">A B C</div></div>');
    mpg.lightbox.installContent(itemsBrowser,true);
    clearError();
    if (firstPop) {
      fileName.__element__.change(function () {
        var fs = fileName.prop("value");
        if (om.checkPath(fs)) {
          clearError();
        } else {
          setError("The path may not contain characters other then / (slash) ,- (dash),_ (underbar) and the digits and letters");  
        }
      });
      firstPop = false;
    }
    
    var pfx = "pj/test5/";
    var pfx = "pj/testRepo/";
    var pfx = localStorage.handle;
    // check for logged in
    om.ajaxPost('/api/listS3',{prefixes:[pfx+"/"],exclude:[".js"],publiccOnly:1},function (rs) {
      var itemPaths = rs.value;
      var tr  = pathsToTree(itemPaths);
      var itr = itemize(tr);
      if (!itr) itr = om.DNode.mk()
      var otr = om.lift(itr);
      fileTree = otr;
      om.attachItemTree(folderPanel.__element__,otr);

      if (itemsMode=="save") {
        //urlPreamble.setHtml("http://s3.prototypejungle.org/"+h+"/");
        var currentItemPath = om.stripDomainFromUrl(page.itemUrl);
        var nm = om.pathLast(currentItemPath);
        var currentItemNode = om.evalPath(otr,om.pathExceptLast(currentItemPath));// we want the parent node
        if (!isVariant) {
          addVariantsBranch(otr,currentItemNode,nm);
          currentItemNode = currentItemNode.variants[nm];
        }
        
        currentItemNode.expandToHere();
        currentItemNode.widgetDiv.selectThisLine();
       // tree.setSelectedFolder(currentItemNode.widgetDiv); already done by above line
        //selectItemLine(nm); 
        var ivr = initialVariantName();
        setFilename(ivr.name);
        if (ivr.resave) {
          selectItemLine(ivr.name);
        }
      } else {
        tree.itemTree.expand();
      }

      //om.attachItemTree(folderPanel.__element__,['pj/abc/def','pj','pj/def','pj/abc/z0/z1','pj2/a/b','pj3'])
    });
  }
  
  function selectItemLine(iel) {
    if (iel == selectedItemLine) return;
    console.log('selecting item line');
    if (typeof iel == "string") {
      var el = itemLinesByName[iel];
    } else {
      el = iel;
    }
    if (selectedItemLine) {
      $('span',selectedItemLine).css({'background-color':'white'});
    }
    console.log(tree.highlightColor);
    $('span',el).css({'background-color':tree.highlightColor});
    //el.css({'background-color':'blue'});
    selectedItemLine = el;
    
  }
  tree.setSelectedFolder     = function (wline) {
    var nd = wline.forNode;
    selectedFolder = nd;
    var items = nd.ownProperties();
    console.log("selected ",nd.__name__,items);
    var ln = items.length;
    var numels = itemLines.length;
    //itemsPanel.empty();
    //itemLines = [];
    //numels = 0;
    for (var i=0;i<ln;i++) {
      var nm = items[i];
      var ch = nd[nm];
      var isFolder =  typeof ch == "object";
      var imfile = isFolder?"folder.ico":"file.ico"
      var el = itemLines[i];
      if (el) {
        var sp = $('span',el);
        sp.html(nm);
        var img= $('img',el);
        img.attr('src','/images/'+imfile);
        el.off('click dblclick');
        el.show();
        $('span',el).css({'background-color':'white'});
        el.css({'background-color':'white'});
      } else {
        var el = $('<div><img style="background-color:white" width="16" height="16" src="/images/'+imfile+'"><span>'+nm+'<span></div>');
        itemLines.push(el);
        itemsPanel.__element__.append(el);
      }
      itemLinesByName[nm] = el;

      // need to close over some variables
      var clf = (function (el,nm,isFolder) {
        return function () {
          selectedFolderPath = nd.pathAsString();
          itemSelectedInPanel = isFolder?undefined:selectedFolderPath + "/" + nm;
          selectedFolder = nd;
          selectItemLine(el);
          setFilename(nm);
          clearError();
        }
      })(el,nm,isFolder);
      el.click(clf);
      if (isFolder) {
        var dclf = (function (nm) {
          return function () {
             wline.selectChildLine(nm);
          };
        })(nm);
        el.dblclick(dclf);
      } 
    }
    for (var i=ln;i<numels;i++) {
      itemLines[i].hide(100);
    }
    setFilename("");
  }
  
  //var itemsBut = jqp.button.instantiate();
  //itemsBut.html = "Open";
  //actionDiv.addChild("items",itemsBut);
 // itemsBut.click = function () {popItems();};

  page.testCall = function (v) { alert(v.a)};
  */
  // called from the chooser
  
  function popItems(mode) {
    var lb = mpg.chooser_lightbox;
    lb.pop(undefined,undefined,true);//without topline
   // var wp = om.whichPage();
    var fsrc = om.useMinified?"chooser2.html":"chooser2d.html"; // go to dev version from dev version
    lb.setHtml('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'?mode='+mode+'"/>');
  }
  
  
  
  //path will be supplied for saveAs
  page.saveItem = function (path) {
    debugger;
    if (!path) {
      var url = page.itemUrl
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
        if (path) { //  go there for a saveAs
          var inspectPage = om.useMinified?"/inspect":"inspectd";
          var loc = inspectPage+"?item="+url;
          location.href = loc;
        } else {
          page.setSaved(true);
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
  /*
  page.saveWS = function () {
    var h = localStorage.handle;
    if (!h) {
      mpg.lightbox.pop();
      mpg.lightbox.setHtml("You must be logged in to save items. No registration is required - just use your twitter account or email address.")
      return;
    }
    draw.wsRoot.__beenModified__ = 1;
    var svcnt = page.saveCount();
    draw.wsRoot.__saveCount__ = svcnt+1;
    draw.wsRoot.set("__canvasDimensions__",geom.Point.mk(draw.canvasWidth,draw.canvasHeight));
    var paths = draw.wsRoot.computePaths();
    var whr = paths.host + "/" + localStorage.handle + "/" + 'variant' + paths.path +  "/";
    var  suggested = om.randomName();
    var ht = "Save as <br/>"+whr+"<input id='saveAs' type='text' style='width:200px' value='"+suggested+"'></input>";
    ht += '<p><div class="button" id="saveButton">Save</div><div class="button" id="cancelButton">Cancel</div></p>';
    ht += '<p id="lbError" class="error"></p>';
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(ht);
    $('#cancelButton').click(function (){mpg.lightbox.dismiss()})
    $('#saveButton').click(function (){
      var sva = $('#saveAs').prop('value');
      if (!om.checkName(sva)) {
        $('#lbError').html('Error: the last part of the path must contain only letters, numerals, or the underbar, and may not start with a numeral.');
        return;
      }
      var url = whr + sva;
      var upk = om.unpackUrl(url,true);
      
      om.s3Save(draw.wsRoot,upk,function (srs) {
        draw.wsRoot.__saveCount__ = svcnt;
        mpg.lightbox.pop();
        var asv = afterSave(srs);
        if (asv == "ok") {
          var msg = om.mkLinks(upk,'saved');
        } else {
          msg = asv;
        }
        mpg.lightbox.setHtml(msg);
      },true); // true = remove computed
    });
  }
        
  */
  //var saveBut = jqp.button.instantiate();
  //saveBut.html = "Save";
  //actionDiv.addChild("save",saveBut);
  //saveBut.click = page.saveWS;
  //saveBut.click = function () {popItems("save");}

  page.rebuildItem = function () {
    var buildPage = om.useMinified?"/build":"/buildd";
    location.href =buildPage+"?item=/"+page.itemPath;
  }

  page.saveImage = function (path,cb) {
    debugger;
    var url = "http://s3.prototypejungle.org/"+path;
    var upk = om.unpackUrl(url);
    var img = upk.image;
    draw.postCanvas(path,function (rs) {
      cb(rs);
    });     
  }
  
  
  actionDiv.addChild("itemName",itemName);
 
 
  var fileBut = jqp.button.instantiate();
  fileBut.html = "File";
  actionDiv.addChild("file",fileBut);

  var fsel = dom.Select.mk();
  
  fsel.containerP = jqp.pulldown;
  fsel.optionP = jqp.pulldownEntry;
  var fselJQ;
  
  function setFselDisabled() {
    if (localStorage.sessionId) {
      // if there is no saveCount, this an item from a build, and should not be overwritten
      var saveDisabled = (!draw.wsRoot.__saveCount__) || (page.itemSaved);
      var rebuildDisabled = draw.wsRoot.__saveCount__;
      fsel.disabled = [0,0,rebuildDisabled,saveDisabled,0,0];
    } else {
      fsel.disabled = [1,0,1,1,1,1];
    }
  }

      
  function setFselOptions() {
    fsel.options = ["New Item...","Open...","Edit/Rebuild","Save","Save As...","Save Image..."];
    fsel.optionIds = ["new","open","rebuild","save","saveAs","saveImage"];
    setFselDisabled();
    fselJQ = fsel.toJQ();
    mpg.addChild(fselJQ); 
    fselJQ.hide();
  }
  
  var fselSaveIndex = 3; // a little dumb, but harmless
  
  //fsel.optionIds = ["new","open","save","saveImage"];
  fsel.onSelect = function (n) {
    var opt = fsel.optionIds[n];
    if (opt == "new") { // check if an item save is wanted
      var cklv = page.onLeave("chooser new");
      if (!cklv) return;
    }
    if (opt == "open") {
      var cklv = page.onLeave("chooser open");
      if (!cklv) return;
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

  fileBut.click = function () {dom.popFromButton("file",fileBut,fselJQ);}

 
 
 
  
  var viewBut = jqp.button.instantiate();
  viewBut.html = "View...";
  actionDiv.addChild("view",viewBut);

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
  tree.showFunctions = false;
  
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
  
 
  tree.autoUpdate = 1;
  
  page.alert = function (msg) {
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(msg);
  }
  /*
  var updateBut = jqp.button.instantiate();
  updateBut.html = "Update";
  actionDiv.addChild("update",updateBut);
 */
  //src is who invoked the op; "tree" or "draw" (default is draw)
  function updateAndShow(src) {
    draw.wsRoot.removeComputed();
    draw.wsRoot.deepUpdate(draw.overrides);
    draw.fitContents();
    draw.refresh();
    if (src!="tree") tree.initShapeTreeWidget();
  }
  /*
  updateBut.click = function () {
    dom.unpop();
    updateAndShow();
  }
  */
  tree.updateAndShow = updateAndShow; // make this available in the tree module
    
    /*
  var contractBut = jqp.button.instantiate();
  contractBut.html = "Remove Computed";
  actionDiv.addChild("contract",contractBut);

  contractBut.click = function () {
    dom.unpop();
    draw.wsRoot.removeComputed();
    tree.initShapeTreeWidget();
    draw.refresh();
  };
  
  */
    
    
  var viewSourceBut = jqp.button.instantiate();
  viewSourceBut.html = "Source";
  actionDiv.addChild("viewSource",viewSourceBut);
 
  viewSourceBut.click = function() {
    var src = draw.wsRoot.__source__;
    location.href = src;
  }
  
  function aboutText() {
    var rt = draw.wsRoot;
    var tab = rt.__about__;
    var src = rt.__source__;
    ht = "";
    if (src) {
      ht += "<p>Source code: "+om.mkLink(src);
      if (rt.__beenModified__) {
        ht += " with subsequent modifications";
      ht += "</p>";
      }
    }
    var org = rt.__source__;
    if (tab) ht += "<div>"+tab+"</div>";
    return ht;
  }
    
    
    
  var aboutBut = jqp.button.instantiate();
  aboutBut.html = "About";
  actionDiv.addChild("about",aboutBut);
  aboutBut.click = function () {
    dom.unpop();
    var rt = draw.wsRoot;
    mpg.lightbox.pop();
    var tab = rt.__about__;
    var ht = '<p>The general <i>about</i> page for Prototype Jungle is <a href="http://prototypejungle.org/about.html">here</a>. This note concerns the current item.</p>';
    ht += aboutText();
    mpg.lightbox.setHtml(ht);
  }
 



 function getHelpHtml()  {
  if (page.helpHtml) return page.helpHtml;
  if (page.includeDoc) {
  var helpHtml0 = '<div class="paddedIframeContents"><p> Please see the explanations at the bottom of this  intro page first (after dismissing this lightbox).  Other topics are covered below.</p>'
 } else {
  var helpHtml0 = '<p>Two panels, labeled "Workspace" and "Prototype Chain", appear on the right-hand side of the screen. The workspace panel displays the hierarchical structure of the JavaScript objects which represent the item. You can select a part of the item either by clicking on it in the graphical display, or in the workspace panel. The <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain">prototype chain</a> of the selected object will be shown in rightmost panel. </p>';
 }

page.helpHtml = helpHtml0 + '<p> The <b>View</b> pulldown allows you to choose which fields are displayed in the workspace and prototype browsers.  </p><p>The significance of the <b>Options</b> pulldowns is as  follows: In most applications, parts of the item are computed from a more compact description.  In auto-update mode, this computation is run every time something changes, but in manual mode, an update button appears for invoking the operation explicitly, and also a "remove computed" button, so you can see what is being recomputed.  (Many changes are seen immediately even in manual mode - those which have effect in a redraw, rather than a regeneration of the item). </div>  ';

return page.helpHtml;
 }
 
   var helpBut = jqp.button.instantiate();
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
    if (saved == page.itemSaved) return;
    page.itemSaved = saved;
    var nm =  saved?page.itemName:page.itemName+"*"
    itemName.setHtml(nm);
    fsel.setDisabled(fselSaveIndex,saved);
  }
  
  
  
  var leaveDialog =$('<div class="leaveDialog">\
                        <div  class="leaveLinee">The current item has unsaved changes. Proceed anyway?</div>\
                        <div  class="leaveLinee">\
                          <div class="button" id="leaveOk">Ok</div>\
                          <div class="button" id="leaveCancel">Cancel</div>\
                        </div>\
                      </div>');
                      
  
  var leaveOkButton = $('#leaveOk',leaveDialog);
  leaveOkButton.click(function () {
    if (leavingFor == "chooser new") {
      popItems('new');
    } else if (leavingFor == "chooser open") {
      popItems('open');
    } else {
      location.href=leavingFor;
    }
  });
  

  var leaveCancelButton = $('#leaveCancel',leaveDialog);
  leaveCancelButton.click(function (){mpg.lightbox.dismiss();});
  var leavingFor;
  
  page.onLeave = function (dest) {
    
    if (!page.itemSaved) {
      var lb = mpg.lightbox;
      lb.pop();
      lb.setContent(leaveDialog);
      leavingFor = dest;
      return false;
    }
    return true;
  
  
  }
  
  draw.stateChangeCallbacks.push(function () {
    page.setSaved(false);
  });
  
  /*
  toViewer.click = function () {
    location.href = page.itemUrl+"/view";
  }
  */
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
    plusbut.__element__.mousedown(draw.startZooming);
    plusbut.__element__.mouseup(draw.stopZooming);
    plusbut.__element__.mouseleave(draw.stopZooming);
    minusbut.__element__.mousedown(draw.startUnZooming);
    minusbut.__element__.mouseup(draw.stopZooming);
    minusbut.__element__.mouseleave(draw.stopZooming);

    page.genButtons(ctopDiv.__element__,{toExclude:{'about':1,'file':1}});

    
    /*
    var oselEl =osel.jq.__element__;
    oselEl.mouseleave(function () {dom.unpop();});
    vsel.jq.__element__.mouseleave(function () {dom.unpop();});
    fsel.jq.__element__.mouseleave(function () {dom.unpop();});
    updateBut.hide();
    contractBut.hide();
    */
    //tree.noteDiv.hide();
    //tree.noteDivP.hide();
    if (standalone) {
      draw.theContext = draw.theCanvas.__element__[0].getContext('2d');
      if (draw.hitCanvasEnabled) {
        draw.hitContext = draw.hitCanvas.__element__[0].getContext('2d');
      } else {
        draw.hitCanvasActive = 0;
      }
    } else {
      aboutBut.hide();
      var nstxt = "<div class='notStandaloneText'><p>This item includes no visible content, at least in this standalone context.</p>";
      nstxt += aboutText() + "</div>";
      canvasDiv.setHtml(nstxt);
    }
    $('body').css({"background-color":"#eeeeee"});
    //mpg.css({"background-color":"#444444","z-index":200})
    layout(true); //nodraw
    var r = geom.Rectangle.mk({corner:[0,0],extent:[700,200]});
    var r = geom.Rectangle.mk({corner:[0,0],extent:[700,200]});
    var lbt = __pj__.lightbox.template.instantiate();
    // the main lightbox wants padding and overflow, but not the chooser
    lbt.selectChild("content").setN("style",{"padding-left":"30px","padding-right":"30px","overflow":"auto"});
    var lb = lightbox.newLightbox($('body'),r,lbt);
    mpg.set("lightbox",lb);
    var clb = lightbox.newLightbox($('body'),r,__pj__.lightbox.template.instantiate());
    mpg.set("chooser_lightbox",clb);
     itemName.setHtml(page.itemName);
    cb();   
  }
    

  
      
   // either nm,scr (for a new empty page), or ws (loading something into the ws) should be non-null
  
  page.initPage = function (o) {
    var nm = o.name;
    var scr = o.screen;
    var wssrc = o.wsSource;
        if (!wssrc) {
              page.genError("<span class='errorTitle'>Error:</span> no item specified (ie no ?item=... )");
              return;
            }  
     
    page.itemUrl =  wssrc;
    page.itemName = om.pathLast(wssrc);
    page.itemPath = om.stripDomainFromUrl(wssrc);
    var noInst = o.noInst;
    var isAnon = wssrc && ((wssrc.indexOf("http:") == 0) || (wssrc.indexOf("https:")==0));
    var inst = o.instantiate;
    var cb = o.callback;
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
        
            function afterInstall(ars) {
              
              var ln  = ars.length;
              if (ln>0) {
                var rs = ars[ln-1];
                if (rs) { // rs will be undefined if there was an error in installation 
                  inst  = !(rs.__autonamed__) &&  !noInst; // instantiate directly built fellows, so as to share their code
                  var ovr = installOverrides(rs);
                  var ws = __pj__.set("ws",om.DNode.mk());
                  if (inst) {
                    var frs = rs.instantiate();
                  } else {
                     frs = rs;
                  }
                  ws.set(rs.__name__,frs); // @todo rename if necessary
                  draw.wsRoot = frs;
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
                  draw.wsRoot = {__installFailure__:1};
                }
                setFselOptions(); // see if this fellow is a variant
                
                page.genMainPage(standalone,function () {
                  draw.init();
                  if  (!draw.wsRoot.__about__) {
                    aboutBut.hide();
                  }
                  om.loadTheDataSources([frs],function () {
                    if (standalone) draw.wsRoot.deepUpdate(ovr);
                    tree.initShapeTreeWidget();
                    var isVariant = !!(draw.wsRoot.__saveCount__);
                    if (standalone) {
                      var tr = draw.wsRoot.transform;
                      var cdims = draw.wsRoot.__canvasDimensions__;

                      if (tr  && cdims) {
                        draw.adjustTransform(draw.rootTransform(),cdims);
                      } else {
                        if (!isVariant || !tr) { 
                          tr = draw.fitTransform(draw.wsRoot);
                          draw.wsRoot.set("transform",tr);
                        }
                      }
                      draw.refresh();
                    }
                    tree.openTop();
                    tree.adjust();
                    if (cb) cb();
                  });
                });
            }
            }
            if (nm) {
              draw.emptyWs(nm,scr);
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

