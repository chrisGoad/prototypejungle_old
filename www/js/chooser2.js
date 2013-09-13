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
  
   var highlightColor = "rgb(100,140,255)"; //light blue

   
  /*
  function inspectItem(pth) {
    var loc = "/inspect?item=http://s3.prototypejungle.org/"+pth;
    alert("going to ",loc);
    window.top.location.href = loc;
  }
  */
  
  var itemLines;
  var itemLinesByName;
  var selectedItemLine;
  var selectedItemName;
  var selectedFolder;
  var fileTree;
  var afterYes;
  var isVariant;
  var itemsMode;
  var folderError;
  var repo; // the repo of the current user, if any
  var handle; // ditto if any
  var pathLine;
  var currentItemPath; // for saving, this is the current item in the inspector
  var currentItemFolder; // for saving, this is the current item in the inspector
  var inFrame = 0;// is this page in an iframe, or at top level? usually the former, only the latter for debugging
  var whichPage;
  var imageIsOpen;
  var lastClickTime0; // double clicking is confusing; ignore clicks too close together. to keep track of dbl clicks, we need to
  var lastClickTime1; //store the last three click
  var lastClickTime2;
  var minClickInterval = 1000; // millisecs
  var baseTime = Date.now();
  function initVars() {
    itemLines = [];
    itemLinesByName = {}
    selectedFolder = selectedFolderPath = undefined;
    //var svcnt = draw.wsRoot.__saveCount__;
    //isVariant = (svcnt > 0); // this is already a variant
    isVariant = 0;
    inFrame = window != window.top;
    whichPage = om.whichPage(window.top.location.href);
   
  }
  
  
  
  var openB,folderPanel,itemsPanel,panels,urlPreamble,fileName,errDiv0,errDiv1,yesBut,noBut,newFolderLine,newFolderB,
      newFolderInput,newFolderOk,closeX,modeLine,bottomDiv,errDiv1Container,forImage,imageDoneBut,forImageDiv,itemsDiv,
      fileNameSpan;
 
  var itemsBrowser =  dom.newJQ({tag:"div",style:{position:"absolute",width:"100%",height:"100%"}}).addChildren([
    closeX = dom.newJQ({tag:"div",html:"X",style:{padding:"3px",cursor:"pointer","background-color":"red","font-weight":"bold",border:"thin solid black",
        "font-size":"12pt",color:"black","float":"right"
      }}),
    modeLine = dom.newJQ({tag:"div",html:"Mode",style:{"padding":"10px","width":"100%","text-align":"center","ffont-weight":"bold"}}),
    newFolderLine = dom.newJQ({tag:"div"}).addChildren([
      newFolderB  = dom.newJQ({tag:"span",html:"New Folder",class:"button"}),
                             // hoverOut:{"background-color":"white"},
                             // hoverIn:{"background-color":highlightColor},style:{cursor:"pointer"}}),
      newFolderInput = dom.newJQ({tag:"input",type:"input",hidden:1,
                         style:{font:"8pt arial","background-color":"#e7e7ee",width:"60%","margin-left":"10px"}}),
      newFolderOk =  jqp.button.instantiate({html:"Ok"})

    ]),
    errDiv0 =  dom.newJQ({tag:"span","class":"error","style":{"font-size":"12pt"}}),
    pathLine = dom.newJQ({tag:"div",html:"path"}),

    //panels = dom.newJQ({tag:"div",style:{width:"100%",height:"80%","border":"solid thin black",}}).addChildren([
     // folderPanel = dom.newJQ({tag:"div",style:{overflow:"auto",display:"inline-block",height:"100%",width:"40%","border-right":"solid thin black"}}),
    itemsPanel = dom.newJQ({tag:"div",
			   style:{overflow:"auto",ffloat:"right",height:"100%",width:"100%","border":"solid thin black"}}).addChildren([
        itemsDiv=dom.newJQ({tag:"div",style:{width:"100%",height:"100%"}}),
	forImage =  dom.newJQ({tag:"img",style:{border:"solid thin black","margin-right":"auto","margin-left":"auto"}})
      ]),
    bottomDiv = dom.newJQ({tag:"div",style:{"padding-top":"10px",width:"100%"}}).addChildren([
     
      fileNameSpan = dom.newJQ({tag:"span",html:"Filename: "}),
      //urlPreamble = dom.newJQ({tag:"span"}),
      fileName = dom.newJQ({tag:"input",type:"input",
                         style:{font:"8pt arial","background-color":"#e7e7ee",width:"60%","margin-left":"10px"}}),
         openB =  dom.newJQ({tag:"span",html:"New Folder",class:"button",style:{float:"right"}})
//jqp.button.instantiate({html:"Open"})

     ]),
    errDiv1Container = dom.newJQ({tag:"div",hidden:0}).addChildren([
        errDiv1 = dom.newJQ({tag:"span","class":"error","style":{"font-size":"12pt"}}),
        yesBut =  jqp.button.instantiate({html:"Yes"}),
        noBut =  jqp.button.instantiate({html:"No"})
      ]),

    //openB = jqp.button.instantiate({html:"Open"})
    ]);
  
    fullPageDiv = dom.newJQ({tag:"div",html:"Error",hidden:1,style:{ccolor:"red","padding-top":"30px","width":"90%","text-align":"center","font-weight":"bold"}})
    
    /*/.addChildren([
      forImageDiv = dom.newJQ({tag:"div"}).addChildren([
        forImage =  dom.newJQ({tag:"img",style:{border:"solid thin black"}})
      ]),
      imageDoneBut = dom.newJQ({tag:"div",class:"button",html:"ok",hidden:1,style:{float:"right"}})
      ]);*/
  var buttonText = {"saveAs":"Save","new":"New Item","rebuild":"Rebuild","open":"Open","saveImage":"Save Image"};

  
  closeX.click = function () {
    window.parent.__pj__.page.dismissLightbox();
  }
  mpg.addChild(itemsBrowser);
    mpg.addChild(fullPageDiv);
  noNewFolderTextEntered = 0;
  newFolderB.click = function() {
    newFolderInput.show();
    newFolderOk.show();
    newFolderInput.prop("value","Name for the new folder");
    noNewFolderTextEntered = 1;
  }
  
  
  function layout() {
    var lb =       window.parent.__pj__.page.theLightbox;
    var awinwid = $(window).width();
    var awinht = $(window).height();
   // var topht = $('#topbarOuter').height();
   var topht = ((itemsMode == "open")?0:newFolderLine.height()) + modeLine.height() + pathLine.height();
   var botht = bottomDiv.height() + errDiv1Container.height();
   var itemsht = awinht - topht - botht - 60;
   console.log('topht',topht,'botht',botht,'itemsht',itemsht);
   itemsPanel.css({height:itemsht+"px"});
    var eht = awinht - 10;
    console.log(topht);
   // mpg.css({height:(awinht-30)+"px",top:"20px",width:(awinwid-40)+"px"});
     // mpg.css({height:"70%",top:"0px",width:"98%"});
       mpg.css({height:eht,top:"0px",width:"98%"});
//  itemsBrowser.css({height:500+"px",top:"20px",width:500+"px"});
 }
  // for accessibility from the parent window
  window.layout = layout;
  
  //openB.style["float"] = "right";
  //openB.style["width"] = "100px";
  // openB.style["clear"] = "left";
 //openB.style["top"] = "0px";


  function setFilename(vl) {
    fileName.prop("value",vl);
    clearError();
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
    errDiv0.hide();
    errDiv1.hide();
    yesBut.hide();
    noBut.hide();
    openB.show();
    layout();
  }
  
  function fullPageError(txt) {
    itemsBrowser.hide();
    /*
    modeLine.hide();
    newFolderLine.hide();
    pathLine.hide();
    itemsPanel.hide();
    bottomDiv.hide();
    openB.hide();
    */
    fullPageDiv.show();
    fullPageDiv.setHtml(txt);
  }
  
  function showImage(path) {
    var url = "http://s3.prototypejungle.org/"+path;
    itemsDiv.hide();
    //fullPageDiv.setHtml(url);
    forImage.show();
    forImage.attr("src",url);
    var ht = itemsPanel.height();
    var wd = itemsPanel.width();
    forImage.attr("height",ht-10);
    //var imwd = forImage.width();
    //var mrg = (wd-ht)/2 - 150;

   // forImage.css({"margin-right":mrg+"px","margin-left":mrg+"px"});//center it
    openB.setHtml('Close');
    imageIsOpen = true;
    pathLine.setHtml(path);
    //imageDoneBut.show();
  }
  
  function closeImage() {
    forImage.hide();
    itemsDiv.show();
    imageIsOpen = false;
    openB.setHtml(buttonText[itemsMode]);
    setPathLine(selectedFolder);
    
  }

  //function setError(txt,yesNo,temporary,div1) {
  function setError(options) {
    if (typeof options == "string"){
      var txt  = options;
      var ed = errDiv0;
    } else {
      var div1 = options.div1;
      var txt = options.text;
      var temporary = options.temporary;
      var yesNo  = options.yesNo;
      var ed = div1?errDiv1:errDiv0;
    }
    ed.setHtml(txt);
    ed.show();
    openB.hide();
    if (yesNo) {
      noBut.show();
      yesBut.show();
    } else   {
      noBut.hide();
      yesBut.hide();
    }
    if (temporary) {
      setTimeout(function (){ ed.__element__.hide(500);},1500);
    }
    layout();
  }
  
  yesBut.click =  function () {afterYes();} // after yes is set later
  noBut.click = clearError;

  
  function openSelectedItem(nm) {
    debugger;
    var pth = selectedFolder.pathAsString() + "/" + nm;
    var inspectPage = om.useMinified?"/inspect":"inspectd";
    window.top.location.href = inspectPage +"?item=http://s3.prototypejungle.org/"+pth;
  }
  
  
  openB.click = function () {
    if (imageIsOpen) {
      closeImage();
      return;
    }
    var tloc = window.top.location;
    if (!selectedFolder) {
      folderError = true;
      setError({text:"No folder selected",div1:true});
      return;
    }
    var nm = fileName.prop("value");
    var fEx = fileExists(nm);
    var fpth = selectedFolder.pathAsString();
    var pth = fpth + "/" + nm;
    if (!nm) {
      setError({text:"No filename.",div1:true});
      return;
    }
    //window.parent.__pj__.page.testCall({a:3});
    if (itemsMode == "saveAs") {
      if (fEx == "file") {
	
	setError({text:"This file exists. Do you wish to overwrite it?",yesNo:1,div1:true});
	afterYes = function() {
	  window.parent.__pj__.page.saveItem(pth);
	}
        return;
      }
      if (fEx == "folder") {
	setError({text:"This is a folder. You cannot overwrite a folder with a file",div1:true});
        return;
      }
      window.parent.__pj__.page.saveItem(pth);
      return;
    }
    
     if (itemsMode == "saveImage") {
      var afterSave = function(rs) {
	debugger;
	if (rs.status == "ok") {
	  fullPageError("Image saved at "+pth);
	}
      }
      if (fEx == "file") {
	
	setError({text:"This file exists. Do you wish to overwrite it?",yesNo:1,div1:true});
	afterYes = function() {
	  window.parent.__pj__.page.saveImage(pth,afterSave);
	}
        return;
      }
      if (fEx == "folder") {
	setError({text:"This is a folder. You cannot overwrite a folder with a file",div1:true});
        return;
      }
      window.parent.__pj__.page.saveImage(pth,afterSave);
      return;
    }
    
   
   
    if (itemsMode == "new") {
      var atTop = (selectedFolder == fileTree);
      var atHandle= (selectedFolder == fileTree[handle]);
      if (atTop || atHandle) {
	var msg ="You cannot create an item at this level. You must select (or create) a repo  to hold it"
          setError({text:msg,div1:0,temporary:true});
          setError({text:msg,div1:1,temporary:true});
        return;
      }
      var buildPage = om.useMinified?"/build":"/buildd";

      tloc.href =buildPage+"?item=/"+pth;
      return;
    } 
    if (itemsMode == "open") {
      if (fEx=="file") {
	if (om.endsIn(nm,".jpg")) {
	  showImage(pth);
	} else {
	  openSelectedItem(nm);
	}
       // tloc.href = "/inspectd?item=http://s3.prototypejungle.org/"+pth;
      } else {
        setError({text:"File not found",div1:true});
      }
    }
    if (itemsMode == "rebuild") {
      if (fEx=="file") {
	  tloc.href = "/build_item.html?item=/"+pth;
      } else {
        setError({text:"Item not found",div1:true});
      }
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
  
  //pick out the items and images
  function itemize(tr,includeImages) {
    var rs = {};
    var  hasch = 0;
    for (var k in tr) {
      var st = tr[k];
      if (typeof st == "object") {
        if (st.view == "leaf") {
          rs[k] = "leaf";
          hasch = 1;
        } else {
          var ist = itemize(st,includeImages);
          if (ist) {
            rs[k] = itemize(st,includeImages);
            hasch = 1;
          }               
        }
      } else if (includeImages && om.endsIn(k,".jpg")) {
	rs[k] = "leaf";
	hasch = 1;
      }
    }
    if (hasch) return rs;
  }
  
  
  // computing where to put a variant.
  // There are several cases:
  // (1) variant of your own item which is not a variant
  // in this case let /handle/<path> be the path of the item
  // the variant folder nd /hancle/variants/<path>/
  // (2) variant of your own item which is a variant
  // in this case let /handle/variants/<path>/vN be the path of the item
  // the variant folder is  /handle/variants/<path>/
   // (3) variant of another person's item which is not a variant
   // in this case let /ownershandle/<path> be the path of the item
  // the variant folder nd /myhandle/variants/ownershandle/<path>/
   // (4) variant of another person's item which is  a variant
   // in this case let /ownershanlde/variants/<path> be the path of the item
  // the variant folder nd /myhandle/variants/ownershandle/<path>/

 /*
  
  function variantFolder(path) {
    var sp = om.stripInitialSlash(path).split("/");
    var phandle = sp[0];
    var prepo = sp[1];
    if (phandle == handle) {
      if (prepo == "variants") {
        sp.pop();
        var rs = sp.join("/");
      } else {
        sp.shift();
        rs = handle + "/variants/"+sp.join("/");
      }
    } else { // someone else's item
      if (prepo == "variants") {
        sp.pop();
	sp.shift();// remove owner handle and "variants"
	sp.shift();
        rs = handle + "/variants/" + phandle + "/" + sp.join("/");
      } else {
        //sp.shift();
        var rs = handle + "/variants/"+sp.join("/");
      }
    }
    console.log("variantsFolder for ",path," is ",rs);
    return rs;
  }
  */
  // very simple: just at handle/variants/nm, always
  function variantFolder(path) {
    var sp = om.stripInitialSlash(path).split("/");
    var ln = sp.length;
    var repo = sp[1];
    if (repo == "variants") { //already a variant; 
      var nm = sp[ln-2];
    } else {
      nm = sp[ln-1];
    }
    return handle + "/variants/"+nm;
  }
  
  function imageFolder(path) {
    var sp = om.stripInitialSlash(path).split("/");
    var ln = sp.length;
    var repo = sp[1];
    if (repo == "variants") { //already a variant; 
      var nm = sp[ln-2];
    } else {
      nm = sp[ln-1];
    }
    return handle + "/images/"+nm;
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
    var ck = om.checkName(nm);
    if (!ck) {
      setError('Names may contain only letters, numerals, and the underbar or dash, and may not start with a numeral');
      return;
    }
    var sf = selectedFolder;
    if (sf[nm]) {
      setError('There is already a folder by that name');
      return;
    }
    var nnd  = om.DNode.mk();
    sf.set(nm,nnd);
    //var wl = sf.widgetDiv;
    //var nln = wl.addItemLine(nnd);
    setSelectedFolder(sf);
  }
  
  
  newFolderOk.click = newFolderInput.enter = function () {
    var nm = newFolderInput.prop("value");
    if (nm) {
      addNewFolder(nm);
    }
    newFolderInput.hide();
    newFolderOk.hide();
    
  }
  // finds the max int N among nms where nm has the form vN
  function maxVariantIndex(nms,forImage) {
    var rs = -1;
    nms.forEach(function (inm) {
      if (fc == "") return;
      var fc = inm[0];
      if (forImage) {
	var nm = om.beforeChar(inm,".");
      } else {
	nm = inm;
      }
      if ((forImage && (fc == "i")) || (!forImage && (fc == "v"))) {
        var idxs = nm.substr(1);
        var idx = parseInt(idxs);
        if (idx != NaN) {
          rs = Math.max(idx,rs);
        }
      }
    });
    return rs;
  }
  
  function listpj(cb) {// get the static list for the pj tree
    var opts = {crossDomain: true,dataType:"json",url: "/pjlist.json",success:cb,error:cb};
    $.ajax(opts);
  }
  // autonaming variant.
  function initialVariantName(forImage) {
    //var currentItemPath = om.stripDomainFromUrl(page.itemUrl);
    if (isVariant) {
      // then overwrite is the default
      return {resave:true,name:om.pathLast(currentItemPath)};
    }
    var nmidx = maxVariantIndex(selectedFolder.ownProperties(),forImage) + 1;
    return {name:forImage?"i"+nmidx+".jpg":"v"+nmidx,resave:false}
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
  var modeNames = {"new":"Build New item","rebuild":"Rebuild an Item","open":"Inspect an Item","saveAs":"Save Current Item As..."};
  function popItems(item,mode) {
    debugger;
    itemsMode = mode;
    if ((mode == "open") || (mode=="rebuild")) {
      newFolderLine.hide();
      fileNameSpan.hide();
      fileName.hide();
   } else {
      newFolderLine.show();
      fileNameSpan.show();
      fileName.show();
    }
    modeLine.setHtml(modeNames[mode]);
    handle = localStorage.handle;
    if (!handle) {
      if (mode == "open") {
        handle = "pj";
      } else {
        fullPageError("You need to be signed in to build or save items");
        layout();
        return;
      }
    }
    layout();
    initVars();
    var btext = buttonText[itemsMode];//=="saveAs"?"Save":(itemsMode=="new")?"New Item":"Open"
    openB.setHtml(btext);
     clearError();
    if (firstPop) {
      fileName.__element__.keyup(function () {
        var fs = fileName.prop("value");
        if (om.checkPath(fs)) {
          clearError();
        } else {
          setError({text:"The path may not contain characters other than / (slash) ,- (dash),_ (underbar) and the digits and letters",div1:true});  
        }
      });
     // firstPop = false;
    }
    
    var pfx = "pj/test5/";
    var pfx = "pj/testRepo/";
    var includePJ = (mode == "open") || (handle = "pj");
    var prefixes = (handle=="pj")?undefined:[handle+"/"];
  
    var whenFileTreeIsReady = function () {
      if ((itemsMode=="saveAs") || (itemsMode == "saveImage")) {
        var itemUrl = window.parent.__pj__.page.itemUrl;
        if (!itemUrl) {
          itemUrl = "http://s3.prototypejungle.org/pj/repoTest2/bbb"; // for debugging as a standalone page
        }
        currentItemPath = om.stripDomainFromUrl(itemUrl);
	
        var folderPath = (itemsMode == "saveImage")?imageFolder(currentItemPath):variantFolder(currentItemPath);
        var folder = om.createPath(fileTree,folderPath);   
        setSelectedFolder(folder);
        var ivr = initialVariantName(itemsMode=="saveImage");
        setFilename(ivr.name);
        if (ivr.resave) {
          selectItemLine(ivr.name);
        }
      //} else if (itemsMode == "new") {
      } else {
	var lp = localStorage.lastFolder;
	if (lp) {
	  var lfld = om.evalPath(fileTree,lp);
	  if (lfld) {
	    setSelectedFolder(lfld);
	    return;
	  }
	}
        if (handle == "pj") {
	  var hnd = fileTree[handle];
          if (!hnd) {
            hnd = fileTree.set(handle,om.DNode.mk());
          }
          setSelectedFolder(hnd);
	} else {
          setSelectedFolder(fileTree);
        }
      }
    }
    function genFileTree(itemPaths) {
      var tr  = pathsToTree(itemPaths);
      var includeImages = (itemsMode == "open") || (itemsMode == "saveImage");
      var itr = itemize(tr,includeImages);
      if (!itr) itr = om.DNode.mk()
      var otr = om.lift(itr);
      return otr;
    }
    function installTree(itemPaths) {
      fileTree = genFileTree(itemPaths);
      whenFileTreeIsReady();
    }
    var itemPaths = [];
    if (prefixes) { // grab the other prefixes (there will just be one for now, the owner's)
      var finishList = function (sofar) {
       
        om.ajaxPost('/api/listS3',{prefixes:prefixes,exclude:[".js"],publiccOnly:1},function (rs) {
          if (rs.status == "fail") {
            var msg = (rs.msg == "noSessionAtClient")?"Your session has timed out. Please sign in again":
                   "There is a problem at the server: "+rs.msg;
            fullPageError(msg);
          } else {
            installTree(sofar.concat(rs.value));
          }
        });
      }
    } else {
      finishList = function (sofar) {installTree(sofar)}
    }
    if (includePJ) {
      listpj(finishList);
    } else {
      finishList([]);
    }
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
    $('span',el).css({'background-color':highlightColor});
    //el.css({'background-color':'blue'});
    selectedItemLine = el;
    
  }

  setPathLine = function (nd) {
    var pth = nd.pathOf();
    var rs = "";
    var pel = pathLine.__element__;
    
    pel.empty();
    first = 0;
    if (1 || itemsMode == "open") {
      pth.unshift("http://s3.prototypejungle.org");
      var first = 1;
    } 
    var cnd = fileTree;
    pth.forEach(function (nm) {
      if (first) {
        first = false;
      } else {
        pel.append("/");
        cnd = cnd[nm];
      } 
      var lcnd = cnd; // so it gets closed over
      var el = $('<span class="pathLineElement">');
      el.html(nm);
      el.click(function () {
        setSelectedFolder(lcnd);
      });

      pel.append(el);
    });
  }
  
  function shiftClickTimes() {
    lastClickTime2 = lastClickTime1;
    lastClickTime1 = lastClickTime0;
    lastClickTime0 = Date.now();
   
  }
  
  // the clicking is too fast from the point of view of a double click, if the earlier click interval is too short
  function checkQuickClick (fromDbl) {
    var tm = Date.now();
    console.log("tm",tm-baseTime,"click interval",itv,"dbl",fromDbl,"lct0",lastClickTime0-baseTime,"lct1",
		  lastClickTime1-baseTime,"lct2",lastClickTime2-baseTime);
  
    if (lastClickTime2) {
      var itv = tm - lastClickTime2;
      //lastClickTime1 = tm;
        if (itv < minClickInterval) {
        if (fromDbl) { // we care how long it was since the click prior to the double click 
	  if (lastClickTime0) {
	    var interval = tm - lastClickTime0;
	    console.log("double click interval",interval);
	    if (interval < minClickInterval) {
	      console.log("double click too quick");
	      return true;
	    }
	  }
	} else {
	  console.log("click too quick");
	  shiftClickTimes();
         
	  return true;
	}
      }
    }
    if (!fromDbl) shiftClickTimes();  
    
  }
  
  setSelectedFolder     = function (nd) {
    if (!((itemsMode == "open" ) || (itemsMode=="rebuild"))) {
      var atTop = nd == fileTree;
      if (atTop) {
        newFolderB.hide();
        newFolderInput.hide();
        newFolderOk.hide();
      } else {
        newFolderInput.hide();
        newFolderOk.hide();
        var atHandle = nd == fileTree[handle];
        if (atHandle) {
          newFolderB.setHtml("New Repo");
        } else {
          newFolderB.setHtml("New Folder");
        }
	newFolderB.show();
      }
    }
    selectedItemName = undefined;
    selectedItemLine = undefined;
    selectedFolder = nd;
    localStorage.lastFolder = nd.pathAsString()

    setPathLine(nd);
    //var pth = selectedFolder.pathAsString();
    //pathLine.setHtml(pth);
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
        itemsDiv.__element__.append(el);
      }
      itemLinesByName[nm] = el;

      // need to close over some variables
      var clf = (function (el,nm,isFolder) {
        return function () {
	  if (checkQuickClick()) {
	    return;
	  }
          if (isFolder) {
            var ch = selectedFolder[nm];
            setSelectedFolder(ch);
            selectedItemName = undefined;
          } else {
            selectItemLine(el);
            selectedItemName = nm;
            if (itemsMode != "new") {
              setFilename(nm);
            }
          }
        }
      })(el,nm,isFolder);
      el.click(clf);
      if (!isFolder  && ((itemsMode=="open")) || (itemsMode=="rebuild")) {
        var dclf = (function (nm) {
          
          return function () {
	    if (!checkQuickClick(1)) {
	      alert("opening");
              //openSelectedItem(nm);
	    }
          }
        })(nm); 
        el.dblclick(dclf);
      }
    }
    for (var i=ln;i<numels;i++) {
      itemLines[i].hide(100);
    }
    setFilename("");
  }
  /*
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
        mpg.lightbox.dismiss();
       // mpg.lightbox.setHtml(msg);
        },true);  // true = remove computed
    }
    afterYes = doTheSave;
    if (!sva) {
      setError({text:"No filename given",div1:true});
      return;;
    }
    var pex = fileExists(sva);
    if (pex == "folder") {
      setError({text:"You cannot overwrite a directory with a file",div1:true});
      return;
    } else if (pex) {
        setError({text:"The file already exists. Do you wish to overwrite it?",yesNo:true,div1:true});
        return;
    } else {
      doTheSave();
    }
  }
        
 */       
 
page.genMainPage = function (options) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    mpg.install($("body"));
    mpg.css({width:"100%"});
    //itemsBrowser.css({width:"100%","height":"9-%"});
    newFolderInput.__element__.keydown(function () {
      if (noNewFolderTextEntered) {
	newFolderInput.prop("value","");
	noNewFolderTextEntered = 0;
      }
    });
    newFolderInput.__element__.keyup(function () {
      var fs = newFolderInput.prop("value");
      if (!fs ||  om.checkName(fs)) {
        clearError();
      } else {
        setError({text:"The name may not contain characters other than / (slash) ,- (dash),_ (underbar) and the digits and letters",div1:false});  
      }
    });

    popItems(options.item,options.mode);
  }
    
  /*
   http://prototypejungle.org:8000/chooserd.html?item=/pj/repoTest2/examples/Nested&mode=saveAs
      
*/  
 
})(__pj__);

