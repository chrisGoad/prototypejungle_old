// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code
(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var tree = __pj__.tree;
  var jqp = __pj__.jqPrototypes;
  var page = __pj__.page;
  
  var mpg; // main page
  var mpg = dom.newJQ({tag:"div",style:{position:"absolute","margin":"0px",padding:"0px"}});
  
  var Chooser =page.set("Chooser",om.DNode.mk()).namedType();

  var highlightColor = "rgb(100,140,255)"; //light blue

  
  Chooser.codeBuilt = false;
  Chooser.minClickInterval = 500; // millisecs
  Chooser.baseTime = Date.now();
  Chooser.newUserInitialPath = "sys/repo0/examples";

  /*
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
  var fhandle; // the handle of the currently selected folder
  var pathLine;
  var itemName;
  var currentItemPath; // for saving, this is the current item in the inspector
  var newItem = false;
  var currentItemFolder; // for saving, this is the current item in the inspector
  var inFrame = 0;// is this page in an iframe, or at top level? usually the former, only the latter for debugging
  var whichPage;
  var imageIsOpen;
  var lastClickTime0; // double clicking is confusing; ignore clicks too close together. to keep track of dbl clicks, we need to
  var lastClickTime1; //store the last three click
  var lastClickTime2;
  var minClickInterval = 500; // millisecs
  var parentPJ;
  var parentPage;
  var noItemSelectedError = false;
  */
  
  
  Chooser.initVars = function() {
    this.itemLines = [];
    this.itemLinesByName = {};
    this.selectedFolder = selectedFolderPath = undefined;
    this.isVariant = 0;
    this.inFrame = window != window.top;
    this.handle = localStorage.handle;
    //this.whichPage = om.whichPage(window.top.location.href);
  }
  
  
  Chooser.mk = function () {
    var rs = Object.create(Chooser);
    rs.initVars();
    return rs;
  }
  
/*  
  
  var openB,rebuildB,viewSourceB,folderPanel,itemsPanel,panels,urlPreamble,fileName,fileNameExt,errDiv0,errDiv1,yesBut,noBut,newFolderLine,newFolderB,
      newFolderInput,newFolderOk,closeX,modeLine,bottomDiv,errDiv1Container,forImage,imageDoneBut,forImageDiv,itemsDiv,
      fileNameSpan,fpCloseX,fullPageText,insertPanel,insertPrototype,insertPrototypePath,insertInstance,insertInstanceTitle,insertInstancePath,
      insertOkB,insertCancelB,insertError;
      
  */    
      
Chooser.genPage = function (nm,parent) {
  this.parent = parent;
  this.itemsBrowser =  dom.newJQ({tag:"div",style:{position:"absolute",width:"100%",height:"100%"}}).addChildren([
  
 
    dom.newJQ({tag:"div"}).addChildren([
       this.pathLine = dom.newJQ({tag:"span"}),
       this.itemName = dom.newJQ({tag:"span"})
       ]),

    this.itemsPanel = dom.newJQ({tag:"div",
			   style:{overflow:"auto",ffloat:"right",height:"100%",width:"100%","border":"solid thin black"}}).addChildren([
        this.itemsDiv=dom.newJQ({tag:"div",html:"ITEMS",style:{width:"100%",height:"100%",border:"solid thin green"}}),
	this.forImage =  dom.newJQ({tag:"img",style:{border:"solid thin black","margin-right":"auto","margin-left":"auto"}})
      ]),
    this.bottomDiv = dom.newJQ({tag:"div",style:{"padding-top":"10px",width:"100%"}}).addChildren([
     
      this.openB =  dom.newJQ({tag:"span",html:"Open",class:"button",style:{float:"right"}}),
      this.viewSourceB =  dom.newJQ({tag:"span",html:"View Source",class:"smallButton",style:{float:"right"}}),

     ]),
  

    ]);
  parent.addChild(nm,this.itemsBrowser);
  
  this.itemsBrowser.install();
  this.itemsBrowser.__element__.mousedown(function (e){console.log("down");e.preventDefault();});
   this.itemsBrowser.__element__.mousemove(function (e){console.log("move");e.preventDefault();});
 //parent.addChild(this.itemsBrowser);
}
  
  
Chooser. layout = function() {
    //var lb =       parentPage.theLightbox;
    var awinwid = this.parent.width();
    var awinht = this.parent.height();
   // var topht = $('#topbarOuter').height();
   var topht =  this.pathLine.height();
   var botht = this.bottomDiv.height();
   var itemsht = awinht - topht - botht - 60;
   this.itemsPanel.css({height:itemsht+"px"});
    var eht = awinht - 10;
   this.itemsBrowser.css({top:"0px"});
    //this.parent.css({height:eht,top:"0px",width:"98%"});
 }
  // for accessibility from the parent window
 // window.layout = layout;
  
  
  
  
  Chooser.openSelectedItem = function(pth) {
   
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
  
  function findKind(tr) {
    for (var k in tr) {
      if (om.beginsWith(k,"kind ")) {
	return k.substr(5);
      }
    }
    if (tr.view) {
      return "leaf";// no kind specified/ shouldn't happen when everything is rebuilt
    }
  }
  
  //pick out the items and images, and now json (data) files
  function itemize(tr,includeImages,includeData,includeVariants) {
    var rs = {};
    var  hasch = 0;
    var kind;
    for (var k in tr) {
    
      var st = tr[k];
      if (typeof st == "object") {
	var knd = findKind(st);
        if (knd) {
	  rs[k] = findKind(st);
	  if ((knd == "codebuilt") || (knd && includeVariants)) {
            hasch = 1;
	  }
        } else {
          var ist = itemize(st,includeImages,includeData,includeVariants);
          if (ist) {
            rs[k] = itemize(st,includeImages,includeData,includeVariants);
            hasch = 1;
          }               
        }
      } else if ((includeImages && (om.endsIn(k,".jpg"))|| (includeData && om.endsIn(k,".json")))) {
	rs[k] = "leaf";
	hasch = 1;
      }
    }
    if (hasch) {
      if (kind) {
	rs.kind = kind;
      }
      return rs;
    }
  }
  
  // various things that are part of the native prototypeJungle tree, such as shape/Rectangle, are shown as lieing in the tree sys/repo0
  function addPrims(tr) {
    tr.set("sys/repo0/geom/Rectangle","import");
     tr.set("sys/repo0/geom/Arc","import");
  //  tr.set("sys/repo0/geom/Circle","import");
    tr.set("sys/repo0/geom/Text","import");

 }
  
  function noRepos() {
    return !this.handle|| !fileTree[this.handle];
  }
  
  function populateEmptyTree() {
    var rp = om.DNode.mk();
    rp.set("repo0",om.DNode.mk());
    fileTree.set(this.handle,rp);
    return true;
  }
  
  
  
  
  function listsys(cb) {// get the static list for the sys tree
    var opts = {crossDomain: true,dataType:"json",url: "/syslist.json",success:cb,error:cb};
    $.ajax(opts);
  }
  
  var firstPop = true;
  
  Chooser.popItems = function () {
    this.layout();
    this.initVars();
    var includeSys = !this.handle || (this.handle == "sys");
    var prefixes = (this.handle=="sys" || !this.handle)?undefined:[this.handle+"/"];
    var thisHere = this;
    var whenFileTreeIsReady = function () {
	if (noRepos()) {
	  var folderPath = thisHere.newUserInitialPath;
	   thisHere.setSelectedFolder(folderPath);
	  return;
	} 
        if (thisHere.handle == "sys") {
	  var hnd = thisHere.fileTree[thisHere.handle];
          if (!hnd) { 
            hnd = thisHere.fileTree.set(thisHere.handle,om.DNode.mk());
          }
          thisHere.setSelectedFolder(hnd);
	} else {
          thisHere.setSelectedFolder(fileTree);
        }
    }
    
  var genFileTree = function (itemPaths) {
      var tr  = pathsToTree(itemPaths);
      var includeImages = 0;
      var includeData = 1;
      var includeVariants = 1;
      var itr = itemize(tr,includeImages,includeData,includeVariants);
      if (!itr) itr = om.DNode.mk()
      var otr = om.lift(itr);
      addPrims(otr);
      return otr;
    }
    function installTree(itemPaths) {
      thisHere.fileTree = genFileTree(itemPaths);
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
      finishList = function (sofar) {
	installTree(sofar);
      }
    }
    if (includeSys) {
      listsys(finishList);
    } else {
      finishList([]);
    }
  }
  
  Chooser.selectedItemPath = function() {
    var fpth = this.selectedFolder.pathAsString();
    return fpth + "/" + this.selectedItemName;
  }

  
  Chooser.selectItemLine = function(iel) {
    if (iel == this.selectedItemLine) return;
    om.log('chooser','selecting item line');
    if (typeof iel == "string") {
      var el = this.itemLinesByName[iel];
    } else {
      el = iel;
    }
    if (this.selectedItemLine) {
      $('span',this.selectedItemLine).css({'background-color':'white'});
    }
    $('span',el).css({'background-color':this.highlightColor});
    //el.css({'background-color':'blue'});
    this.selectedItemLine = el;
    
  }

  Chooser.setPathLine = function (nd) {
    var pth = nd.pathOf();
    var rs = "";
    var pel =this.pathLine.__element__;
    var thisHere = this;
    pel.empty();
    first = 0;
    //pth.unshift("http://s3.prototypejungle.org");
    pth.unshift("root");
    var first = 1;
    var cnd = this.fileTree;
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
        thisHere.setSelectedFolder(lcnd);
      });

      pel.append(el);
    });
  }
  
  Chooser.shiftClickTimes = function() {
    this.lastClickTime0 = this.lastClickTime1;
    this.lastClickTime1 = this.lastClickTime2;
    this.lastClickTime2 = Date.now();
   
  }
  
  // the clicking is too fast from the point of view of a double click, if the earlier click interval is too short
  Chooser.checkQuickClick = function(fromDbl) {
    var tm = Date.now();
     
    if (this.lastClickTime2) {
      var itv = tm - this.lastClickTime2;
       //om.log('chooser',tm-baseTime,"click interval",itv,"dbl",fromDbl,"lct0",lastClickTime0-baseTime,"lct1",
	//	  lastClickTime1-baseTime,"lct2",lastClickTime2-baseTime);

      //lastClickTime1 = tm;
        if (itv < this.minClickInterval) {
        if (fromDbl) { // we care how long it was since the click prior to the double click 
	  if (this.lastClickTime0) {
	    var interval = tm - this.lastClickTime0;
	  //  om.log('chooser',"double click interval",interval);
	    if (interval < this.minClickInterval) {
	      om.log('chooser',"double click too quick");
	      return true;
	    }
	  }
	} else {
	  om.log('chooser',"click too quick");
	  this.shiftClickTimes();
         
	  return true;
	}
      }
    }
    if (!fromDbl) this.shiftClickTimes();  
    
  }
  
  Chooser.setSelectedItem = function(nm) {
    this.selectedItemName = nm;

    if (om.endsIn(nm,".json")) {
      this.selectedItemKind = "data";
    } else {
      this.selectedItemKind = this.selectedFolder[nm];
    }
    om.log('chooser',"Selected Kind",this.selectedItemKind);
    // which auxilliary buttons to show?
  }
  
  Chooser.setSelectedFolder = function (ind) {
    if (typeof ind == "string") {
      var nd = om.evalPath(this.fileTree,ind);
    } else {
      nd = ind;
    }
    var apth = nd.pathOf();
    var pth = om.pathToString(apth);
    this.fhandle = apth[0];
    this.selectedItemName = undefined;
    this.selectedItemLine = undefined;
    this.selectedFolder = nd;
    localStorage.lastFolder = pth;


    this.setPathLine(nd);
    var items = nd.ownProperties();
    om.log('chooser',"selected ",nd.__name__,items);
    var ln = items.length;
    var numels = this.itemLines.length;
    for (var i=0;i<ln;i++) {
      var nm = items[i];
      var ch = nd[nm];
      var isFolder =  typeof ch == "object";
      var imfile = isFolder?"folder.ico":"file.ico"
      var el = this.itemLines[i];
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
        var el = $('<div><img style="cursor:pointer;background-color:white" width="16" height="16" src="/images/'+imfile+'">\
		   <span class="chooserItem">'+nm+'<span></div>');
        this.itemLines.push(el);
        this.itemsDiv.__element__.append(el);
      }
      this.itemLinesByName[nm] = el;
      var thisHere = this;
      // need to close over some variables
      var clf = (function (el,nm,isFolder) {
        return function () {
	  if (thisHere.checkQuickClick()) {
	    return;
	  }
          if (isFolder) {
            var ch = thisHere.selectedFolder[nm];
            thisHere.setSelectedFolder(ch);
            thisHere.selectedItemName = undefined;
          } else {
	    thisHere.setSelectedItem(nm);
            thisHere.selectItemLine(el);
          
          }
        }
      })(el,nm,isFolder);
      el.click(clf);
      if (!isFolder) {
        var dclf = (function (nm,pth) {
          return function () {
	    if (!this.checkQuickClick(1)) {
	      this.actOnSelectedItem();
	    }
          }
        })(nm,pth); 
        el.dblclick(dclf);
      }
    }
    for (var i=ln;i<numels;i++) {
      this.itemLines[i].hide(100);
    }
    //this.setFilename("");
  }
  
})(prototypeJungle);

