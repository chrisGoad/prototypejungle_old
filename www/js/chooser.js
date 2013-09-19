// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code
(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var tree = __pj__.tree;
  var jqp = __pj__.jqPrototypes;
  var page = __pj__.page;
  var mpg; // main page
  var mpg = dom.newJQ({tag:"div",style:{position:"absolute","margin":"0px",padding:"0px"}});
  
  //window.hoob = 23;
  
  
   
  
  function inspectItem(pth) {
    var loc = "/inspect?item=http://s3.prototypejungle.org/"+pth;
    alert("going to ",loc);
    location.href = loc;
  }
  
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
  var folderError;
  var currentItemPath;
  var repo; // the repo of the current user, if any
  var handle; // ditto if any
  
  
  function initVars() {
    itemLines = [];
    itemLinesByName = {}
    selectedFolder = selectedFolderPath = undefined;
    //var svcnt = draw.wsRoot.__saveCount__;
    //isVariant = (svcnt > 0); // this is already a variant
    isVariant = 0;
   
  }
  
  var openB,folderPanel,itemsPanel,panels,urlPreamble,fileName,errDiv,yesBut,noBut,newFolderLine,newFolderB,
      newFolderInput,newFolderOk;
 
  var itemsBrowser =  dom.newJQ({tag:"div",style:{position:"absolute",width:"100%",height:"100%"}}).addChildren([
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
  
  mpg.addChild(itemsBrowser);
  
  
  function layout() {
   debugger;
    var awinwid = $(window).width();
    var awinht = $(window).height();
    var topht = $('#topbarOuter').height();
    var eht = awinht - 50 - topht;
    console.log(topht);
    mpg.css({height:(awinht-140)+"px",top:"20px",width:(awinwid-120)+"px"});
   //  itemsBrowser.css({height:500+"px",top:"20px",width:500+"px"});
 }
  // for accessibility from the parent window
  window.layout = layout;
  
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
    if (itemsMode == "new") {
      var nm = fileName.prop("value");
      if (!selectedFolder) {
        folderError = true;
        setError("No folder selected for the new item");
        return;
      }
      if (!nm) {
        setError("No name selected for the new item");
        return;
      }
      var pth = selectedFolder.pathAsString() + "/" + nm;
      var loc = "/build_item.html?item="+pth;
      location.href = loc;
  
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
  // the variants branch is at repo/variants/<same path as item>
  function addVariantsBranch(tr,path) {
    var rs=om.DNode.mk();
    var nm = om.pathLast(path);
    var pth = handle+"/variants/"+nm;
    tr.set(pth,rs);
    return rs;
   
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
    //var h = localStorage.handle;
    var nm = om.pathLast(currentItemPath);
    var wsName = draw.wsRoot.__name__; //will be the same as name for the directly-built
    if (handle == ownr) {
      
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
  function popItems(item,mode) {
    layout();
    handle = localStorage.handle;
    initVars();
    itemsMode = mode;
    var btext = itemsMode=="save"?"Save":(itemsMode=="new")?"New Item":"Open"
    openB.setHtml(btext);
    //var lb = mpg.lightbox;
    //lb.pop();
    //var cn = lb.content.__element__;
    //itemsBrowser.uninstall();
    //var itemsBrowser= $('<div><div id="openButton" class="button">Open Item</div><div id="items">A B C</div></div>');
    //mpg.lightbox.installContent(itemsBrowser,true);
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
    var pfx = handle;
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
        currentItemPath = om.stripInitialSlash(item);
        //var psp = currentItemPath.split("/");
        //ciHandle = psp[0];
        //ciRepo = psp[1];
        
        var nm = om.pathLast(currentItemPath);
        var currentItemNode = om.evalPath(otr,om.pathExceptLast(currentItemPath));// we want the parent node
        if (!isVariant) {
          currentItemNode =  addVariantsBranch(otr,currentItemPath);
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
    if (folderError) {
      clearError();
      folderError = false;
    }
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
          var ch = nd[nm];
          if (ch == "leaf") {
            setFilename(nm);
          }
          //if (itemMode != "new") setFilename(nm);
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
  
  page.saveFromItemPanel= function () {
    debugger;
    var h = localStorage.handle;
    if (!h) {
      mpg.lightbox.pop();
      mpg.lightbox.setHtml("You must be logged in to save items. No registration is required - just use your twitter account or email address.")
      return;
    }
    var fpth =  selectedFolder.pathAsString();
    var sva = fileName.prop("value");
   
    var doTheSave = function () {
      var url = "http://s3.prototypejungle.org/"+fpth+"/"+sva;
      draw.wsRoot.__beenModified__ = 1;
      var svcnt = page.saveCount();
      draw.wsRoot.__saveCount__ = svcnt+1;
      draw.wsRoot.set("__canvasDimensions__",geom.Point.mk(draw.canvasWidth,draw.canvasHeight));
      if (!om.checkPath(sva)) {
        return;// the error message will already be there
      }
      var upk = om.unpackUrl(url,true);
      om.s3Save(draw.wsRoot,upk,function (srs) {
        draw.wsRoot.__saveCount__ = svcnt;
        mpg.chooser_lightbox.dismiss();
       // mpg.lightbox.setHtml(msg);
        },true);  // true = remove computed
    }
    afterYes = doTheSave;
    if (!sva) {
      setError("No filename given");
      return;;
    }
    var pex = fileExists(sva);
    if (pex == "folder") {
      setError("You cannot overwrite a directory with a file");
      return;
    } else if (pex) {
        setError("The file already exists. Do you wish to overwrite it?",1);
        return;
    } else {
      doTheSave();
    }
  }
        
 
page.genMainPage = function (options) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    mpg.install($("body"));
    mpg.css({width:"100%"});
    itemsBrowser.css({width:"100%","height":"9-%"});
  
    popItems(options.item,options.mode);
  }
    
  /*
   http://prototypejungle.org:8000/chooserd.html?item=/pj/repoTest2/examples/Nested&mode=save
      
*/  
 
})(__pj__);

