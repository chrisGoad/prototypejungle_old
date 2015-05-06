(function (pj) {
  "use strict"
   
   var ui = pj.ui;
  var dom = pj.dom;
  var geom = pj.geom;
  var svg = pj.svg;
  var html = pj.html;
  var tree = pj.tree;
  var lightbox = pj.lightbox;
  //var page = pj.page;
  var dat = pj.dat;
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  
  var mpg = ui.mpg;
  var editMsg = ui.editMsg;
  var dataMsg = ui.dataMsg;
  
  /* Items are constructs or  variants. A variant is an item whose top level is derived from a single component (__variantOf), with overrides. Constructs in the current environment are built from code.
  When a construct is loaded into the constructor, a variantn item (with empty overrides) is what occurs internally
  in the inpspector's data structures.*/
  
   
  //============= Support for the code editor ==============
  var editor,dataEditor;
  var unbuiltMsg = ui.unbuiltMsg;
   
  ui.processIncomingItem = function (rs,cb) {
    debugger;
    ui.root =  rs;
    pj.ws = rs; 
    rs.__sourceRepo = ui.repo;
    rs.__sourcePath = ui.path;
    var bkc = rs.backgroundColor;
    if (!bkc) {
      rs.backgroundColor="white";
    }
    dat.installData(rs,cb);
  }
  
  
  ui.installNewItem = function () {
    var itm = ui.root;
    svg.main.addBackground(ui.root.backgroundColor);
    var mn = svg.main;
    if (mn.contents) {
      dom.removeElement(mn.contents);
    }
    mn.contents=ui.root;
    if (itm.draw) {
      itm.draw(svg.main.__element); // update might need things to be in svg
    }
    if (itm.soloInit) { 
      itm.soloInit(); 
    }
    if (1 || !ui.intro) ui.updateAndDraw(ui.fitMode);
  }
/*  
function displayMessage(el,msg,isError){
  el.$show();
  el.$css({color:isError?"red":(msg?"black":"transparent")});
  el.$html(msg);
}


function displayError(el,msg){
  displayMessage(el,msg,1);
}

ui.displayError = displayError;
*/
var activeMessageA = {"Objects":ui.obMsg,"Code":ui.codeMsg,"Data":ui.dataMsg};

ui.activeMessage = function () {
  var cmode = ui.modeTab.selectedElement;
  var rs = activeMessageA[cmode];
  return rs?rs:ui.obMsg;
}
 

function displayDone(el,afterMsg) {
  ui.displayMessage(el,"Done");
  setTimeout(function () {
    ui.displayMessage(el,afterMsg?afterMsg:"");
  },500);
}
//ui.displayDataError = function (msg) {displayError(dataMsg,msg);}


function getSource(isrc,cb) {
    // I'm not sure why, but the error call back is being called, whether or not the file is present
    // __get from the s3 domain, which has CORS
    var src = isrc.replace("prototypejungle.org",ui.s3Domain);
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
  
  /*
  var theSource = '';
  var onChangeSet = 0;
  function showSource(src) {  
    getSource(src,function (txt) {
      editor.setValue(txt);
      theSource = txt;
      editor.clearSelection();
      setSynced("Code",1);
      if (!onChangeSet) {
        onChangeSet = 1;
      }
    });
}
*/
  function whenObjectsModified() {
    if (!ui.objectsModified) {
      ui.objectsModified = 1;
      return;
    }
  }
  
   ui.objectsModifiedCallbacks.push(whenObjectsModified);
  
  
  
  var dataSourceMsg;
  
  function dataLoadFailed() {
    delete ui.root.data;
    ui.dataLoadFailed = 1;
    if (dataEditor) {
      dataEditor.setValue("");
      dataEditor.setReadOnly(1)
    }
  }
 
  function adjustCodeButtons(tab) {
    /*ui.editButDiv.$show();
    if (tab != "component") {
      ui.addComponentBut.$hide();
    }
    */
    if (tab === "object") {
      //ui.editButDiv.$hide();
      ui.obMsg.$show();
      return;
    }
    ui.obMsg.$hide();
    if (tab === "data") {
      return;
    }
  }

var dataTabNeedsReset = 0;
// an overwrite from svg
svg.drawAll = function (){ // svg and trees
    tree.initShapeTreeWidget(); 
    if (ui.fitMode) svg.main.fitContents();
    svg.main.draw();
  }

function reloadTheData() {
  ui.displayMessage(dataMsg,"Loading data");
  var ds = ui.root.dataSource;
  if ($.trim(ds)) {
    dat.loadData(ds,function (err,dt) {
      if (err) {
        ui.displayError(dataMsg,"Failed to load data");
        dataLoadFailed();
        return;
      }
      ui.root.__xdata = dt;
      ui.root.data = dat.internalizeData(dt,ui.root.markType);
      ui.root.outerUpdate();
      ui.root.draw();
      resetDataTab();
      ui.displayMessage(dataMsg,"");
    });
  } else {
    delete ui.root.__xdata;
    delete ui.root.data;
    ui.root.outerUpdate();
    ui.root.draw();
    resetDataTab();
    ui.displayMessage(dataMsg,"");
  }
}

//ui.reloadDataBut.$click(reloadTheData);
/* 
ui.bindComponent = function (item,c) {
  var nm = c.name;
  if (nm === "__instanceOf") return;
  var pv = pj.getRequireValue(item,nm);//pj.installedItems[r+"/"+p];
  if (pv) {
    var ipv = pv.instantiate();
    if (ipv.hide) {
      ipv.hide();
    }
    item.set(nm,ipv);
  } else {
    pj.error("Missing component ",nm);
  }
}
ui.bindComponents = function (item) {
  var cmps = item.__requires;
  if (cmps) {
    cmps.forEach(function (c) {
      ui.bindComponent(item,c);
    });
  }
}
*/
     
// mk a new item for a build from components. If one of the components is __instanceOf, item will instantiate that component
/*ui.mkNewItem = function (cms) {
  debugger;
  var iof = pj.getRequireFromArray(cms,"__instanceOf");
  if (iof) {
    var iofv = pj.getRequireValue(iof.name);
    var itm = iofv.instantiate();
  } else {
    itm = svg.tag.g.mk();
  }
  if (cms) {
    itm.set("__requires",cms);
  }
  return itm;
}
*/
/*
  function evalCode(building) {
    // should prevent builds or evals when overrides exist;
    delete pj.overrides;
    function theJob() {
      debugger;
      displayMessage(editMsg,building?"Building...":"Running...");
      adjustComponentNames();
      pj.installRequires1(ui.repo,ui.root.__requires,function () {
        var ev = editor.getValue();
        var cxd=ui.root.__xdata;
        var d = ui.root.data;
        var ds = ui.root.dataSource; // this gets carried over to the new item, if present
        var createItem;
        var wev = "createItem = function (item,repo) {window.pj.ui.bindComponents(item);\n";
        if (ds) {
          wev += 'item.dataSource = "'+ds+'";\n';
        }
        wev += ev+"\n}";
        if (!building){
          ui.saveDisabled = 1;  // this modifies the world without updating anything persistent, so saving impossibleobj
        }
        eval(wev)
        var itm = ui.mkNewItem(ui.root.__requires);
        itm.__sourceRepo = ui.repo;
        itm.__sourcePath = ui.path;
        if (evalCatch) {
          try {
            createItem(itm);
          } catch(e) {
            displayError(editMsg,e);
            return;
          }
        } else {
          createItem(itm);
        }
        if (cxd) {
          itm.__xdata = cxd;
        } 
        ui.root = itm;
        pj.ws   = itm;
        var afterSave = function (rs) {
          ui.objectsModified = 0;
          unbuilt = 0;
          unbuiltMsg.$hide();
          ui.processIncomingItem(itm);
          // carry over  data from before build
          if (cxd) {
            itm.__xdata = cxd;
            itm.data = d;
          }
          ui.installNewItem();
          displayDone(editMsg);
        }
      if (building) {
          var toSave = {item:itm};
          pj.s3Save(toSave,ui.repo,pj.pathExceptLast(ui.path),afterSave,1); // 1 = force (ie overwrite)
        } else {
          afterSave();
        }
      });
    }
    theJob();
    $('#err').html(' ');
  }
*/

// are these various things different from their persistent reps?

var synced = {Requires:1,Data:1,Code:1,Objects:1};
var unbuilt = 0; 

function setSynced(which,value) {
  return;
  var cv = synced[which];
  if (cv === value) return;
  var jels = ui.modeTab.domElements;
  var jel = jels[which];
  if (value) {
    jel.$html(which);
  } else {
    jel.$html(which +"*");
  }
  synced[which] = value;
}

 ui.setSaved = function(saved) {
    // those not logged in can't save anyway
    setSynced("Objects",saved);
    if (!localStorage.sessionId) {
      return;
    }  
    if (saved == ui.itemSaved) return;
    ui.itemSaved = saved;
    ui.fsel.setDisabled("save",saved); // never allow Save (as opposed to save as) for newItems
    if (saved) {
      window.removeEventListener("beforeunload",ui.onLeave);
    } else {
      window.addEventListener("beforeunload",ui.onLeave);
    }
  }
  
  
// holds building state for the call back
  var saveSourceBuilding = 0;
  
 
/*
function saveSource(cb,building) {
    $('#error').html('');
    var src = getSourceFromEditor();
    var kind = building?undefined:"unbuilt";
    if (!building) displayMessage(editMsg,"Saving...");
    saveSourceBuilding = building;
    pj.saveSource(src,kind,ui.repo,pj.pathExceptLast(ui.path),function (rs) {
      console.log("SOURCE SAVED ",rs);//removeThis
      if (ui.checkForError(rs)) {
        return;
      }
      setSynced("Code",1);
      ui.setSaved(true);
      if (!saveSourceBuilding) {
        unbuilt = 1;
        unbuiltMsg.$show();
        displayDone(editMsg);
      }
      if (cb) {
       cb();
      }
    });
    return;
  }
  

  
function doTheBuild() {
  saveSource(function () {
    evalCode(true);
  },true);
}


function saveTheCode() {
    saveSource(function () {
    //  ui.enableButton(saveCodeBut,0);
      //setSynced("Data",1);
      setSynced("Requires",1);
    },false);
}




ui.messageCallbacks.saveAsBuild = function (paD) {
  obsolete();
  var pth = paD.path;
  var frc = paD.force;
  var src = pj.stripInitialSlash(ui.pjpath);
  var dst = pj.stripInitialSlash(pth);
  var inspectPage = ui.useMinified?"/inspect":"/inspectd";
  ui.gotoThisUrl = inspectPage+"?item=/"+dst;
  var dt = {src:src,dest:dst};
  if (frc) {
    dt.force = 1;
  }
  ui.sendWMsg(JSON.stringify({apiCall:"/api/copyItem",postData:dt,opId:"saveBuildDone"}));
}
ui.messageCallbacks.saveBuildDone = function (rs) {
  if (ui.checkForError(rs)) {
    return;
  }
  location.href = ui.gotoThisUrl;
}
 */
  var componentDeleteEls = [];
 /* function removeFromComponentArray(spath) {
    var cmps = ui.root.__requires;
    if (cmps) {
      var rs = pj.Array.mk();
      cmps.forEach(function (c) {
        if (c.path !== spath) {
          rs.push(c);
        }
      });
      ui.root.set("__requires",rs);
    }
  }
 */
  // fpath is the "full path" , but without the item.js
 /* function componentByPath(fpath) {
    var cmps = ui.root.__requires;
    var rs;
    cmps.some(function (c) {
      if ((c.repo + "/"+ c.path) === fpath+"/item.js") {
        rs = c;
        return 1;
      }
    });
    return rs;
  }
  */
  // the inspector doesn't support items from domains other than prototypejungle, but will
  // do so.
  /*ui.repoIsFromPJ = function (repo) {
    var pjs = "http://prototypejungle.org";
    if (repo === ".") {
      return pj.beginsWith(ui.repo,pjs);
    } else {
      return pj.beginsWith(repo,pjs);
    }
  }
  */
  var componentNameEls = {};
  
  function hideComponentDeletes() {
    componentDeleteEls.forEach(function (d){d.$hide()});
  }
  
  ui.pathToXitem = function (path,absolute) {
    var sp = path.split("/");
    var h = sp[0];
    var r = sp[1];
    var nm = sp[sp.length-1];
    var p = sp.slice(2).join("/")+"/item.js";
    var sameRepo = (!absolute) && (ui.handle === h) && (ui.pjrepo === r);
    var rr = sameRepo?".":"http://prototypejungle.org/"+h+"/"+r;
    var xit = pj.XItem.mk(nm,rr,p);
    return xit;
  }
  
  ui.addToRequires = function (xit) {
    var rr = xit.repo;
    var p = xit.path;
    var nm = xit.name;
    if (ui.root.__requires === undefined) {
      ui.root.set("__requires",pj.Array.mk());
    }
    var cmps = ui.root.__requires;
    var fpath = rr + "/" + p;
    //if (componentByPath(fpath)) { // already required
    //  return;
    //}
    ui.root.__requires.push(xit);//pj.lift({name:nm,repo:rr,path:p}));
  }
  /*
  ui.addComponent = function (path,cb) {
    alert('add component');
    if (cb) cb();
    var xit = ui.pathToXitem(path);
    ui.addToRequires(xit);
    //addComponentEl(xit.name,xit.repo,xit.path);
    //setSynced("Requires",0);
   
  } 
  ui.messageCallbacks.addComponent = function (pth) {
    ui.addComponent(pth);
    mpg.chooser_lightbox.dismiss();
  }
  */
  ui.inserts = function () {
    var rs = ui.root.__inserts;
    if ( !rs) {
      rs = ui.root.set("__inserts",pj.svg.Element.mk('<g/>'));
      ui.root.__insertCount = 0;
    }
    return rs;
  }
  /* 
  ui.genInsertName = function (seed) {
    var nm,
      n = 0,
      taken = 1,
      inserts = ui.inserts();
    while (taken) {
      n++;
      nm = seed + n;
      taken = inserts[nm];
    }
    return nm;
  }  
  */
  
  ui.insertRectangle = function (where) {
    var rs =  pj.svg.Element.mk(
      '<rect  fill="blue" stroke="black" stroke-width="5" x="-50" y="-50" width="100" height="100"/>');
    //var inserts = ui.inserts();
    //var nm = ui.genInsertName('rectangle');
    //inserts.set(nm,rect);  
   // var rs = Object.create(rect);
    ui.root.set(where,rs);
    rs.__adjustable = 1;
    return rs;
  }
   
  //ui.inserters = {"sys/repo1/shape/rectangle":ui.insertRectangle};
   
  // called from shapes.html,charts.html
  ui.shapesPath = 'sys/repo2/shape/';
  ui.chartsPath = 'sys/repo2/chart/';
  
  ui.instantiateInserts = 1;
  ui.insertXdisplace = 50; // how far to displace the inserted item
  ui.pathsForInserts = {
    'text':'sys/repo2/text/text',
    'textbox':'sys/repo2/text/box',
    'Bar':'sys/repo2/chart/Bar1', 
    'Column':'sys/repo2/chart/Column1',
    'Scatter':'sys/repo2/chart/Scatter1',
    'Line':'sys/repo2/chart/Line1',
  'legend':'sys/repo2/chart/component/Legend2'
  };
  
  
  
  ui.installTheData = function (item,iData,xData,dataSource) { 
    //var pwds =  ui.partsWithDataSource()[0];
    item.__xdata = xData; 
    item.dataSource = theDataSource;
    item.set("data", iData);
    item.reset();  
    item.outerUpdate();
    item.draw();
   // ui.showDataError('The data has been installed. Dismiss this lighbox to see the result')
   // mpg.datasource_lightbox.dismiss();   

  }
  ui.insertItem = function (category,where,ipth,forIntroCallback) {
    debugger;
   
    if ((category === 'shape') && (ipth === 'rectangle')) {
      var rect = ui.insertRectangle(where);
      var ibnds = rect.toRectangle();
      moveOutOfWay(rect,bnds,ibnds);
      mpg.insert_lightbox.dismiss();
      return; 
    }
    var pth = ui.pathsForInserts[ipth];
  /*  if (ipth === 'textbox') { 
      var pth = 'sys/repo1/text/box';
    } else  if (ipth === 'legend') {
      var pth = 'sys/repo1/chart/component/Legend2';
    } else  {
      pth = (category==='shape'?ui.shapesPath:ui.chartsPath) + ipth;
    }
    //var pth = (category==='shape'?ui.shapesPath:ui.chartsPath) + ipth;
    */
    var xit = ui.pathToXitem(pth,1); 

    var afterInstall = function (err,itm) {
      //debugger;
      if (!forIntroCallback) {
        mpg.insert_lightbox.dismiss();
        ui.unselect();
      }
      //var bnds = svg.boundsOnVisible(ui.root,ui.root)
      ui.addToRequires(xit);
      if (itm.__value) {
        itm = itm.__value;
      }
      //var d = itm.data;
      var xd = itm.__xdata;
      //delete itm.data;
      delete itm.__xdata;
      if (ui.instantiateInserts) {
        var iitm = itm.instantiate();
      } else {
        iitm = itm;
      }
      iitm.__isPart = 1; //  a top level part of this assembly 
      ui.root.set(where,iitm);
      ui.whereToInsert = where;
      ui.insertedItem = iitm; 
      if (forIntroCallback) {
        forIntroCallback();
        return; 
      }
      mpg.insert_lightbox.dismiss();
      ui.popDataSourceSelector();
    }
    pj.install(xit.repo,xit.path,afterInstall);  
  }
  
  ui.moveOutOfWay = function (inserted) {
    var bnds = svg.boundsOnVisible(ui.root,ui.root);
    var ibnds = inserted.bounds();
    if (bnds) {
      var xoutofway = bnds.corner.x + bnds.extent.x + 0.5*ibnds.extent.x + ui.insertXdisplace;
      inserted.moveto(xoutofway,0);
      bnds.extent.x = bnds.extent.x + ibnds.extent.x + ui.insertXdisplace;
    } else {
      bnds = ibnds;
    }
    svg.main.fitBounds(0.8,bnds);
  }
    
  ui.legendPath = 'sys/repo2/chart/component/Legend2';
  
  ui.insertLegend = function (chart,cb) {
    debugger;
    var pth = ui.legendPath;
    var xit = ui.pathToXitem(pth,1); 
    var afterInstall = function (err,legend) {
      debugger;
      legend.dataSource = undefined;
     // mpg.insert_lightbox.dismiss();
      //ui.unselect();
      //var bnds = svg.boundsOnVisible(ui.root,ui.root)
      ui.addToRequires(xit);
  
      var ilegend= legend.instantiate();
      ilegend.forChart= pj.pathOf(chart,ui.root).join("/");  
      ui.root.set('legend',ilegend);
      ilegend.__isPart = 1; //  a top level part of this assembly
      //ilegend.reset();  
      ilegend.outerUpdate();
      ilegend.draw();
      ui.moveOutOfWay(ilegend);
      if (cb) {
        cb();
      }

    }
    pj.install(xit.repo,xit.path,afterInstall);  
  } 
  
  ui.completeTheInsert = function (iData,xData,dataSource) { 
    //var pth = ui.pathToInsert;
    var where = ui.whereToInsert;
    ui.installTheData(ui.insertedItem,iData,xData,dataSource);
    ui.moveOutOfWay(ui.insertedItem);
    debugger;
    var afterInsertLegend = function () {
      svg.main.fitContents();   
      ui.fsel.setDisabled("insertChart",1);
      };
    if (iData.categories) {
      ui.insertLegend(ui.insertedItem,afterInsertLegend);
    } else {
      afterInsertLegend();
    }
  }

  //}
  
 // pj.log("ui","Inserting "+pth+" at ",where);
   // var xit = ui.pathToXitem(pth,1);
   /*
    var afterInstall = function (err,itm) {
      mpg.insert_lightbox.dismiss();
      ui.unselect();
      var bnds = svg.boundsOnVisible(ui.root,ui.root)
      ui.addToRequires(xit);
      if (itm.__value) {
        itm = itm.__value;
      }
      //var d = itm.data;
      var xd = itm.__xdata;
      //delete itm.data;
      delete itm.__xdata;
      if (ui.instantiateInserts) {
        var iitm = itm.instantiate();
      } else {
        iitm = itm;
      }
      //if (d) {
      //  iitm.data=d; 
      //}
      */
   
   ui.messageCallbacks.insertItem = function (msg) {
    debugger;
    NotInUse();
    var where = msg.where;
    var pth = msg.path;
    pj.log("ui","Inserting "+pth+" at ",where);
   /*var inserter = ui.inserters[pth];
    if (inserter) {
      var iitm = inserter(where);
      iitm.draw();
      iitm.__isPart = 1;
      mpg.chooser_lightbox.dismiss();
      return;
    } */
    var xit = ui.pathToXitem(pth);
    var afterInstall = function (err,itm) {
      ui.addToRequires(xit);
      if (itm.__value) {
        itm = itm.__value;
      }
      var d = itm.data;
      var xd = itm.__xdata;
      delete itm.data;
      delete itm.__xdata;
      if (ui.instantiateInserts) {
        var iitm = itm.instantiate();
      } else {
        iitm = itm;
      }
      if (d) {
        iitm.data=d;
      } 
      if (xd) {
        iitm.__xdata=xd;
      }
      ui.root.set(where,iitm);
      iitm.outerUpdate();
      iitm.draw();
      iitm.__isPart = 1; // a top level part of this assembly
      mpg.chooser_lightbox.dismiss();
    }
    pj.install(xit.repo,xit.path,afterInstall);
  }
  
  
  
/* replace the given node with the item at the given path.*/

  ui.addReplacement = function (xitem) {
    var replacements = pj.setIfMissing(ui.root,'__replacements',pj.Array.mk);
    replacements.push(xitem);
    return xitem;
  }
    
  ui.replaceItemI = function (node,xitem,cb) {
    //var proto = Object.getPrototypeOf(node);
    
    var internalPath = pj.stringPathOf(node,ui.root);
    var parent = node.parent;
    var name = node.name;
    // todo autoname should be done in terms of replacements, not names bound to roog
    var requireName = pj.autonameRequire(ui.root,"__forReplace");
    var replaceRequire = pj.XItem.mk(requireName,xitem.repo,xitem.path);
    
    var state = node.getState();
    
    var afterInstall = function (err,itm) {
      var iitm = itm.instantiate();
      parent.set(name,iitm);
      iitm.putState(state);
      //iitm.hide();
      ui.addToRequires(replaceRequire);
      ui.addReplacement(pj.Replacement.mk(internalPath,requireName));
      ui.unselect();
      if (cb) {
        cb();
      }
    }
    pj.install(xitem.repo,xitem.path,afterInstall);
  }
  
  
// called from insert.js  
  ui.replaceItem = function (withShape) {
    var path = ui.shapesPath+withShape;
    var xit = ui.pathToXitem(path);
    mpg.chooser_lightbox.dismiss();
    ui.replaceItemI(Object.getPrototypeOf(pj.selectedNode),xit,
                     function () {pj.ui.updateAndDraw()});

  }
 
  
  var firstDataEdit = true;
  
  function dataStringForTab() {
    var xD = ui.root.__xdata;
    return xD?"dataCallback("+JSON.stringify(xD)+")":"";      
  }
  
  
  ui.theDataSource = function () {
    return ui.dataSource;//?ui.dataSource:ui.unpackedUrl.url + "/data.js";
  }
  /*
  function toDataMode() {
    adjustCodeButtons('data');
    tree.objectContainer.$hide();
    tree.editContainer.$hide();
    tree.componentContainer.$hide();

    tree.dataContainer.$show();
    if (firstDataEdit) {
      dataEditor = ace.edit("dataDiv");
      dataEditor.getSession().setUseWrapMode(true);
      dataEditor.setTheme("ace/theme/TextMate");
      dataEditor.getSession().setMode("ace/mode/javascript");
      dataEditor.setReadOnly(1);
      resetDataTab();
      firstDataEdit = false;
    } else {
      if (dataTabNeedsReset) {
        resetDataTab();
      }
    }
  }
  */
  
  function resetDataTab () {
    if (!dataEditor) return;
    var ds = ui.root.dataSource;
    ui.dataSourceInput.$prop('value',ds);
    var jsD = dataStringForTab();
    dataEditor.setValue(jsD);
    dataEditor.clearSelection();
    dataEditor.resize(true);
    setSynced("Data",1);
    dataTabNeedsReset = 0;
  }
  
  function toObjectMode() {
    adjustCodeButtons('object');
    //tree.editContainer.$hide();
   // tree.dataContainer.$hide();
   // tree.componentContainer.$hide();
    tree.objectContainer.$show();
  }
  /*
  var firstComponentMode = true;
  function toComponentMode() {
    adjustCodeButtons('component');
    tree.editContainer.$hide();
    tree.dataContainer.$hide(); 
    tree.objectContainer.$hide();
     tree.componentContainer.$show();
    if (firstComponentMode) {
      componentNameEls = {};
      var cmps = ui.root.__requires;
      if (cmps) {
        cmps.forEach(function (c) {addComponentEl(c.name,c.repo,c.path);});
      }
      firstComponentMode = false;
    }
 }
  */
  
  /*
  function setMode(md) {
    if (md==="Code") {
      toEditMode();
    } else if (md==="Objects") {
      toObjectMode();
    } else if (md==="Data") {
      toDataMode();
    } else if (md == "Requires") {
      toComponentMode();
    }
  }
  */
   
  
  
  ui.genMainPage = function (cb) {
    if (pj.mainPage) return;
    pj.mainPage = mpg;
   // pj.set("mainPage",mpg);  
    if (ui.includeDoc) {
      mpg.addChild("doc",ui.docDiv);
    }
    /*ui.execBut.$click(function () {
      if (!ui.execBut.disabled) evalCode();
    });
    ui.buildBut.$click(function () {
      console.log("BUILDBUT Clicked");
      if (!ui.buildBut.disabled) doTheBuild();
    });
    */
    ui.mpg.__addToDom(); 
    /*
    ui.dataSourceInput.addEventListener("change",function () { 
        var nds = ui.dataSourceInput.$prop("value");
        ui.root.dataSource = nds;
        ui.dataSource = nds;
        ui.ownDataSource = 0;
        reloadTheData();
    });*/
    svg.main = svg.Root.mk(ui.svgDiv.__element);
    svg.main.activateInspectorListeners();
    svg.main.addButtons("View");      
    svg.main.navbut.$click(function () {
      var viewPage = ui.useMinified?"/view":"viewd";
      var url = viewPage + "?item="+ui.pjpath;;
      location.href = url;
    });
  
   // debugger;

    if (typeof(ui.root) !== "string") ui.setFlatMode(false);
    $('.mainTitle').click(function () {
      location.href = "http://prototypejungle.org/charts";
    });
    
    ui.enableButton(ui.upBut,0);
    ui.enableButton(ui.topBut,0);
    ui.enableButton(ui.downBut,0);
 
    ui.genButtons(ui.ctopDiv.__element,{}, function () {
      $('body').css({"background-color":"#eeeeee"});
      //ui.layout(true); //nodraw
      var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
      var rc = geom.Rectangle.mk({corner:[0,0],extent:[600,200]});
      var lb = lightbox.newLightbox(r);
      lb.box.$css({"padding-left":"20px"}); 
      mpg.set("lightbox",lb);
      var clb = lightbox.newLightbox(rc);
      mpg.set("chooser_lightbox",clb);
      mpg.set("datasource_lightbox",lightbox.newLightbox(rc));
      mpg.set("build_lightbox",lightbox.newLightbox(rc));
      mpg.set("insert_lightbox",lightbox.newLightbox(rc));
      mpg.set("edittext_lightbox",lightbox.newLightbox(rc));
      var elb = lightbox.newLightbox(rc);
      mpg.set("editor_lightbox",elb);
     // ui.itemName.$html(ui.itmName);  
      if (typeof(ui.root) == "string") {
        ui.editButDiv.$hide();
        ui.editMsg.$hide();
        if (ui.root === "missing") {
          var msg = "404 No Such Item"
        } else {
          // the first character indicates whether the item is code built (1) or not (0)
          msg = "Load failed for "+(ui.root.substr(1));
          //if (ui.root[0] ==="1") {
          //  ui.codeBuilt = 1;
          //}
          ui.setPermissions();
        }
        ui.svgDiv.setHtml("<div style='padding:100px;font-weight:bold'>"+msg+"</div>");
        ui.root = pj.mkRoot();
      } else {
        cb();
      }
    });
  }
    

    
    // note about code built items
    // they are loaded, then instantiated, and assigned the path prototypeJungle.ws
    // but before saving, they are moved to the right place in the tree for where they will be saved.
  var newBuild  = 0;
  // set some vars in ui. from the query
  function processQuery(iq) {
    var q = ui.parseQuerystring();
    var itm = q.item;
    var intro = q.intro;
    if (intro) {
      //itm = "/anon/repo2/w3hxiqyviz";//"/anon/repo1/v50lxhlffx";
      itm = "/anon/repo2/hfpp44fjx4";
      ui.intro = 1;
      ui.docDiv.src = "/devdoc/intro.html"
    } else {
      ui.docDiv.$hide();
    }
    if (itm) {
      var itms = itm.split("/");
      ui.repo = "http://prototypejungle.org/"+itms[1]+"/"+itms[2];
      ui.path = itms.slice(3).join("/");
    } else {
      ui.repo=q.repo;
      ui.path=q.path?pj.stripInitialSlash(q.path):undefined;
    }
    if (q.cf) { // meaning grab from cloudfront, so null out the urlmap
      pj.urlMap = undefined;
      pj.inverseUrlMap = undefined;
    }
    if (!ui.repo) {
      return 0;
    }
    if (!pj.endsIn(ui.path,".js")) {
      ui.path += "/item.js";
    }
    var psp = ui.path.split("/");
    var pln = psp.length;
    ui.itmName = psp[pln-2];
    var sr = ui.repo.split("/");
    var srln = sr.length;
    ui.handle = sr[srln-2];
    ui.pjrepo = sr[srln-1]; // eg repo0 for /sys/repo0
    if (ui.repo.indexOf('htt')!==0) {
      ui.repo = 'http://prototypejungle.org'+ui.repo;
    }
    ui.url = ui.repo+"/"+ui.path;
    if (pj.beginsWith(ui.url,'http://prototypejungle.org')) {
      ui.pjpath=pj.pathExceptLast(ui.url.substring(26));
    }
    ui.includeDoc = q.intro;
    return 1; 
  }
 
  ui.initPage = function (o) {
    debugger;
    ui.inInspector = 1;
    var q = ui.parseQuerystring();
    if (!processQuery(q)) {
      var noUrl = 1;
    }
          pj.tlog("document  ready");
          $('body').css({"background-color":"white",color:"black"});
          ui.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a ui-back inadvertantly
          ui.addMessageListener();
            function afterInstall(e,rs)  { 
              if (e === "noUrl") {
                ui.shareBut.$css('color','gray');
                //code
              }
               pj.tlog("install done");
              if (e) {
                if (!rs) {
                  rs = svg.tag.g.mk(); 
                  rs.__isAssembly = 1;
                }
                if (e !== "noUrl") rs.__installFailure = e;
              } 
              ui.processIncomingItem(rs,function (err) {
              //ui.codeBuilt = !(pj.variantOf(ui.root));
                debugger;
                ui.initFsel();
                ui.genMainPage(function () {
                  debugger;
                  if (ui.intro) {
                   ui.fsel.setDisabled("insertChart",true);
                  }
                  pj.tlog("starting build of page");
                  ui.setPermissions();
                  ui.setFselDisabled(); 
                  if  (!ui.root._pj_about) {
                    ui.aboutBut.$hide();
                  }
                  var ue = ui.updateErrors && (ui.updateErrors.length > 0);
                  if (ue || (e  && (e !== "noUrl"))) {
                    if (ue) {
                      var emsg = '<p>An error was encountered in running the update function for this item: </p><i>'+pj.updateErrors[0]+'</i></p>';
                     } else if (e) {
                      var emsg = '<p style="font-weight:bold">'+e.message+'</p>';
                    }
                    ui.errorInInstall = emsg;
                    ui.svgDiv.$html('<div style="padding:150px;background-color:white;text-align:center">'+emsg+'</div>');                  
                  } //else {
                    debugger;
                  /*  
                    var afterInsert = function () {
                      debugger; 
                      var itm = ui.insertedItem;
                      //ui.layout(true); //nodraw 
                      itm.reset();
                     // itm.draw();
                      ui.updateAndDraw(ui.fitMode);
  
                      //itm.outerUpdate();
                      //itm.draw(); 
                      tree.initShapeTreeWidget(); 
                    }
                    */  
                    ui.installNewItem();
                    debugger;
                    ui.layout(); 
  
                    if (0 && ui.intro) {
                      debugger;
                      ui.insertItem('chart','barChart','Bar',afterInsert);
                      ui.fsel.setDisabled("insertChart",1); 
                    } else {
                       tree.initShapeTreeWidget();
                    }
                  //}
                });
              });
            }
            pj.tlog("Starting install");
            if (ui.repo) {
              //pj.installWithData(ui.repo,ui.path,afterInstall);
              debugger;
              pj.install(ui.repo,ui.path,afterInstall); 
            } else {
              afterInstall("noUrl");
            }
            $(window).resize(function() {
                ui.layout();
                if (ui.fitMode) svg.main.fitContents();
              });   
 //         });
  }

//end extract

})(prototypeJungle);


