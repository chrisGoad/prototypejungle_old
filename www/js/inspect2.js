
(function (__pj__) {
   var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  //var draw = __pj__.draw;
  var svg = __pj__.svg;
  var draw = __pj__.draw;
  var tree = __pj__.tree;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var dataOps = __pj__.dataOps;
  var modeTab = page.modeTab;
  var mpg = page.mpg;
  var customBut = page.customBut;
  var svgDiv = page.svgDiv;
  var enableButton = page.enableButton;
  var editMsg = page.editMsg;
  var dataMsg = page.dataMsg;
  
  
  //============= Support for the code editor ==============
  var editor,dataEditor;
  



function displayMessage(el,msg,isError){
  el.show();
  el.css({color:isError?"red":(msg?"black":"transparent")});
  el.setHtml(msg);
}


function displayError(el,msg){
  displayMessage(el,msg,1);
}

om.displayError = displayError;

function displayDone(el,afterMsg) {
  displayMessage(el,"Done");
  setTimeout(function () {
    displayMessage(el,afterMsg?afterMsg:"");
  },500);
    //code
}
page.displayDataError = function (msg) {displayError(dataMsg,msg);}


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
  
  var theSource = '';
  var onChangeSet = 0;
  function showSource(src) {
    getSource(src,function (txt) {
      editor.setValue(txt);
      theSource = txt;
      editor.clearSelection();
      setSynced("Code",1);
      if (!onChangeSet) {
        editor.on("change",function (){setSynced("Code",0);if (page.itemOwner) enableButton(saveCodeBut,1);});
        onChangeSet = 1;
      }

    });
}

  function afterNewItem() {
    obsolete();
    om.afterLoadData();
    svg.refresh(); // needed so that bounds() function will work
    svg.main.fitContents();
    svg.refresh();
    tree.initShapeTreeWidget();   
    displayEditDone();
    resetDataTab();

  }
  
  
  function whenObjectsModified() {
    if (!objectsModified) {
      page.objectsModified = objectsModified = 1;
      return;
    }
  }
  
   om.objectsModifiedCallbacks.push(whenObjectsModified);
  
  
  // the state of the buttons for managing code depends on permissions, and which tab is up
    /*editButDiv = dom.El({tag:"div",style:{positionn:"absolute"}}).addChildren([
            unbuiltMsg = dom.El({tag:"span",html:"Unbuilt",style:{color:"red"}}),
            buildBut = jqp.roundButton.instantiate().set({html:"Build ",style:{"margin-left":buttonSpacing}}),
            execBut = jqp.roundButton.instantiate().set({html:"Build No Save",style:{"margin-left":buttonSpacing}}),
            updateBut = jqp.roundButton.instantiate().set({html:"Update",style:{"margin-left":buttonSpacing}}),
            saveCodeBut = jqp.roundButton.instantiate().set({html:"Save Unbuilt",style:{"margin-left":buttonSpacing}}),
            catchBut = jqp.roundButton.instantiate().set({html:"Catch:Yes",style:{"margin-left":buttonSpacing}}),
            codeHelpBut = jqp.roundButton.instantiate().set({html:"?",style:{"margin-left":buttonSpacing}}),
    ]),
  */
  var editButtons = {"build":buildBut,"exec":execBut,"update":updateBut,"saveCode":saveCodeBut,"saveData":saveDataBut,
                     "reloadData":reloadDataBut,"catch":catchBut,"help":codeHelpBut,"addComponent":addComponentBut};
  
  function makeButtonsVisible(bts) {
    var v = {};
    bts.forEach(function (bt) {v[bt] = 1});
    for (var k in editButtons) {
      var bt = editButtons[k];
      if (v[k]) {
        bt.show();
      } else {
        bt.hide();
      }
    }
  }
  var dataSourceMsg;
  
  function adjustCodeButtons(tab) {
    editButDiv.show();
    if (tab != "component") {
      addComponentBut.hide();
    }
    if (tab === "object") {
      editButDiv.hide();
      obMsg.show();
      return;
    }
    obMsg.hide();
    if (tab === "code") {
      //obMsg.hide();
      //if (objectsModified) return;
      saveDataBut.hide();
      reloadDataBut.hide();
      editButDiv.show();
      saveCodeBut.hide();   
      if (page.codeBuilt) {
        if (page.itemOwner) {
          execBut.hide();
          buildBut.show();
          if (page.signedIn) {
            saveCodeBut.show();
          }
          displayMessage(editMsg,iDataEdited?"Save or reload data before building":"");
          enableButton(buildBut,!iDataEdited);
        } else {
          execBut.show();
          buildBut.hide();
        }
        catchBut.show();
        codeHelpBut.show();
       
      } else {
        execBut.hide();
        buildBut.hide();
        catchBut.hide();
        codeHelpBut.hide();
        displayMessage(editMsg,'This is a <a href="/doc/tech.html#variant" target="pjDoc">variant</a>, whose code cannot be edited');       
      }
    
      updateBut.hide();
    
     
      return;
    } 
    if (tab === "data") {
      //if (objectsModified) return;
      //obMsg.hide();
      var ds = om.root.dataSource;
      dataSourceMsg = ds?" From <a href='"+ds+"'>"+ds+"</a>":"";
      displayMessage(dataMsg,dataSourceMsg);
      makeButtonsVisible(["update","reloadData","catch","help"]);
      //editButDiv.show();
      //execBut.hide();
      //catchBut.hide();
      //codeHelpBut.show();
      //updateBut.show();
      enableButton(updateBut,iDataEdited);
      if (page.itemOwner) {
        saveDataBut.show();
      }
      if (page.codeBuilt) {
        catchBut.show();
        codeHelpBut.show();
      } else {
        catchBut.hide();
        codeHelpBut.hide();
      }
      return;
    }
    if (tab === "component") {
     // if (objectsModified) return;
      editButDiv.show();
      makeButtonsVisible((page.itemOwner&&page.codeBuilt)?["addComponent"]:[]);
      //addComponentBut.show();

    }
  }
  
// data from the editor is "inside" data, and is saved with the item
var iDataEdited = 0;
function getDataFromEditor() {
  if (dataEditor && iDataEdited) {
    var ndj = dataEditor.getValue();
    if (ndj) {
      try {
        var m = ndj.match(/callback\(((?:.|\r|\n)*)\)\s*$/);
        if (!m) return false;
        var nd = JSON.parse(m[1]);
      } catch(e) {
        return false;
      }
      om.root.__currentXdata__ = nd;
      iDataEdited = false;
      return true;
    } else {
      om.root.__currentXdata__ = undefined;
    }
  }
  return true;

}
function getSourceFromEditor() {
  if (editor) {
    theSource = editor.getValue();
  }
  return theSource;
}



var evalCatch = 1;;

catchBut.click = function () {
  evalCatch = !evalCatch;
  catchBut.setHtml("Catch: "+(evalCatch?"Yes":"No"));
}
var dataTabNeedsReset = 0;
// an overwrite from svg
svg.refreshAll = function (){ // svg and trees
    tree.initShapeTreeWidget();
    svg.refresh();//  get all the latest into svg
    svg.main.fitContents();
    svg.refresh();
  }
 function afterAfterLoadData(ok,msgEl,startingUp) {
  var isVariant = !!(om.root.__saveCount__);
  if (startingUp) toObjectMode();
  dataTabNeedsReset = 1;
  setSynced("Data",1);// at least it will be synched
  iDataEdited = false;
  if (!startingUp) {
    if (ok) {
      displayDone(msgEl);
    } else {
      displayError(msgEl,"Failed to load data");
    }
  }
  draw.refreshAll();

}

updateBut.click = function () {
  displayMessage(dataMsg,"Updating...")
  if (!getDataFromEditor()) {
    page.displayDataError('Bad JSON');
  } else {
    var ok = om.afterLoadData(undefined,undefined,!evalCatch,dataMsg);
    if (om.root.surrounders) {
      om.root.surrounders.remove();
    }
    draw.refreshAll();
    displayMessage(dataMsg,dataSourceMsg);
    //if (ok) displayDone(dataMsg);
  }
  enableButton(updateBut,0);
  //displayEditDone();
}
/*
 callback({"fields":["metal","density"],"domain":"metal","range":"density","elements":[["silver",10.49],["gold",19.3]]})
*/
page.messageCallbacks.saveData = function (rs) {
   setSynced("Data",1);
  iDataEdited = false;

  enableButton(saveDataBut,0);
 
  displayDone(dataMsg,dataSourceMsg);

}

reloadDataBut.click = function () {
  displayMessage(dataMsg,"Reloading data");
  var ds = om.root.dataSource;
  om.loadData(ds,function (err,dt) {
    debugger;
    om.processIncomingData(dt);
    om.performUpdate(!evalCatch,dataMsg);
    resetDataTab();
    displayMessage(dataMsg,dataSourceMsg);
    draw.refreshAll();
  });
}


saveDataBut.click = function () {
  if (!getDataFromEditor()) {
    displayError(dataMsg,'Bad JSON');
  } else {
    var uds = om.unpackUrl(om.root.dataSource);
    //debugger;
    //return;
    //var xd = "callback("+JSON.stringify(om.root.__currentXdata__)+")"
     var xd = {path:uds.spath,data:om.root.__currentXdata__};
    displayMessage(dataMsg,"Saving...");

    page.sendWMsg(JSON.stringify({apiCall:"/api/saveData",postData:xd,opId:"saveData"}));
  }
}


function loadComponents(cb) {
  var cmps = om.root.__components__;
  if (cmps) {
    var curls = [];// component urls
    cmps.forEach(function (c) {
      var p = c.path;
      var pv = om.evalPath(pj,p);
      if (!pv) {
        curls.push(om.itemHost + c.path.substr(2));
      }
    });
    om.restore(curls,cb);
  } else {
    cb();
  }
}


om.bindComponents = function (item) {
  var cmps = item.__components__;
  if (cmps) {
    var curls = [];// component urls
    cmps.forEach(function (c) {
      var nm = c.name;
      var p = c.path;
      var pv = om.evalPath(pj,p);
      if (pv) {
        item.set(nm,pv.instantiate());
      } else {
        console.log("Missing component ",p);
      }
    });
  }
}


  function evalCode(building) {
    // should prevent builds or evals when overrides exist;
    delete om.overrides;
    function theJob() {
      displayMessage(editMsg,building?"Building...":"Running...");
      adjustComponentNames();
      loadComponents(function () {
        var ev = editor.getValue();
        if (!getDataFromEditor()) {
          displayEditError("The data is not valid JSON");
          return;
        }
        var cxd=om.root.__currentXdata__;
        var d = om.root.data;
        var createItem;
        var wev = "createItem = function (item,repo) {debugger;window.pj.om.bindComponents(item);\n"+ev+"\n}";
        debugger;
       // om.restore(curls, function () {
          if (!building){
            saveDisabled = 1;  // this modifies the world without updating anything persistent, so saving impossibleobj
          }
          eval(wev);
          var itm = __pj__.set(unpackedUrl.path,svg.g.mk());
          var repo = __pj__.x[unpackedUrl.handle][unpackedUrl.repo];
          if (om.root.__components__) {
            itm.set("__components__",om.root.__components__);
          }
          createItem(itm,repo);
          //itm.__xData__ = om.root.__xData__;
          if (cxd) {
            itm.__currentXdata__ = cxd;
          } 
          //itm.set("data",om.root.data);
          itm.__source__ = unpackedUrl.url;
          om.root = itm;
          if (building) {
            debugger;
            om.s3Save(itm,unpackedUrl,function (rs) {
              objectsModified = 0;
              unbuilt = 0;
              unbuiltMsg.hide();
              //displayEditDone();
              loadDataStep(editMsg);
              return;
              om.afterLoadData(null,null,!evalCatch,editMsg);
             
              setSynced("Data",1);
              enableButton(saveDataBut,0);
     
              setSynced("Components",1);
              afterNewItem();
            });
            //}//);
          } else {
            loadDataStep(editMsg);
            //afterNewItem();
          }
        });
     // });
    }
    if (evalCatch) {
      try {
        theJob();
      } catch(e) {
        displayError(editMsg,e);
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
  
  
// holds building state for the call back
  var saveSourceBuilding = 0;
  page.messageCallbacks.saveSource = function (rs) {
    $('#saving').hide();
    if (rs.status !== "ok") {
     var msg = errorMessages[rs.msg];
     msg = msg?msg:"Saved failed. (Internal error)";
     
     displayError(editMsg,msg);
   } else {
     setSynced("Code",1);
     page.setSaved(true);
     if (!saveSourceBuilding) {
      unbuilt = 1;
      unbuiltMsg.show();
      displayDone(editMsg);
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
// saves iData and components too

function saveSource(cb,building) {
    if (!getDataFromEditor()) {
      displayError(editMsg,"Data is not valid JSON");
      return;
    }
    $('#error').html('');
    var dt = {path:unpackedUrl.spath,source:getSourceFromEditor(),kind:"codebuilt"};

    if (!building) { //stash off xData and components, and declare unbuilt
      var anx = {value:"unbuilt",url:unpackedUrl.url,path:unpackedUrl.path,repo:(unpackedUrl.handle+"/"+unpackedUrl.repo)};
    
     // if (om.root.__iData__) {
     //   anx.data = om.root.__iData__;
     // }
      if (om.root.__components__) {
        anx.components = om.root.__components__.toArray();
      }
     // dt.data = "prototypeJungle.om.loadFunction("+JSON.stringify(anx)+")";
      dt.data = anx;
      dt.code = "//unbuilt";
    }
    
    $('#saving').show();
    if (!building) displayMessage(editMsg,"Saving...");
    saveSourceBuilding = building;
    saveSourceCallback = cb;
    
    page.sendWMsg(JSON.stringify({apiCall:"/api/toS3",postData:dt,opId:"saveSource"}));
    return;
  }

function doTheBuild() {
    saveSource(function () {
      evalCode(true);
    },true);
}


function saveTheCode() {
    saveSource(function () {
      enableButton(saveCodeBut,0);
      //setSynced("Data",1);
      setSynced("Components",1);
    },false);
}

//saveAsBuildBut.click = function () {popItems('saveAsBuild');};

page.messageCallbacks.saveAsBuild = function (pathAndDataSource) {
  var src = om.stripInitialSlash(unpackedUrl.spath);
  var dst = om.stripInitialSlash(pathAndDataSource.path);
  var rcmp = om.fromNode(om.root.__components__);//,"/"+om.repoFromPath(dst));
  var dt = {src:src,dest:dst,components:rcmp};
  debugger;
  page.sendWMsg(JSON.stringify({apiCall:"/api/copyItem",postData:dt,opId:"saveBuildDone"}));

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
  var componentDeleteEls = [];
  function removeFromComponentArray(spath) {
    var cmps = om.root.__components__;
    if (cmps) {
      var rs = om.LNode.mk();
      cmps.forEach(function (c) {
        if (c.path !== spath) {
          rs.push(c);
        }
      });
      om.root.set("__components__",rs);
    }
    //code
  }
  /*
   function inComponentArray(spath) {
    var cmps = om.root.__components__;
    if (cmps) {
      var ln=cmps.length;
      for (var i=0;i<ln;i++) {
        if (cmps[i].path === spath) {
          return 1;
        }
      }
    }
    return 0;
  }
  */
  
  // wrinkle: spath does not include the "/x" but the paths in component arrays do
  function componentByPath(spath) {
    var cmps = om.root.__components__;
    var ln = cmps.length;
    for (var i=0;i<ln;i++) {
      if (cmps[i].path===spath) {
        return cmps[i];
      }
    }
    return undefined;
  }
  var componentNameEls = {};
  
  function addComponentEl(nm,spath) {
    var cel = dom.El({tag:'div'});
    var epath = expandSpath(spath);
    var pream = "http://"+location.host+"/inspectd.html?item=";
    var opath = 'pj'+spath.replace(/\//g,'.');
    var vinp = dom.El({tag:"input",type:"input",attributes:{value:nm},style:{font:tree.inputFont,"background-color":"white",width:"100px","margin-left":"0px"}});
    cel.addChild(dom.El({tag:"span",html:"item."}));
    cel.addChild(vinp);
    
    componentNameEls[spath] = vinp;
    cel.addChild(dom.El({tag:"span",html:" = "}));
    cel.addChild(dom.El({tag:'a',html:opath,attributes:{href:pream+om.itemHost+epath}}));
    if (page.codeBuilt&&page.itemOwner) {
      var delcel = dom.El({tag:'span',class:"roundButton",html:'X'});
      componentDeleteEls.push(delcel);
      cel.addChild(delcel);
      delcel.click = function () {
        debugger;
        delete componentNameEls[spath];
        cel.removeFromDom();removeFromComponentArray(spath);setSynced("Components",0)
      };
    }
    tree.componentsDiv.addChild(cel);
    cel.install();
    vinp.__element__.keyup(function () {
      var nm = vinp.prop('value');
      console.log('++',nm);
      if (om.checkName(nm)) {
        displayMessage(componentMsg,"");
      } else {
        displayError(componentMsg,"Component names may not contain characters other than the digits, the letters, and  _ (underbar)");  
      }
    });
  }
  function adjustComponentNames() { // from the inputs
    for (var p in componentNameEls) {
      var vinp = componentNameEls[p];
      var nm = vinp.prop('value');
      var c = componentByPath(p);
      //console.log("setting name for ",p," to ",nm);
      if (om.checkName(nm)) {
        c.name = nm;
      } else {
        vinp.prop('value',c.name);//revert
      }
        
    }
    displayMessage(componentMsg,"");

  }
  
  function hideComponentDeletes() {
    componentDeleteEls.forEach(function (d){d.hide()});
  }
  
  
  page.addComponent = function (spath,cb) {
    if (cb) cb();
    var sp = spath.split("/");
   /* var r = /\/([^\/]*)\/([^\/]*)\/(.*)$/
    var m = spath.match(r);
    var h = m[1];
    var repo = m[2];
    */
    var h = sp[1];
    var r = sp[2];
    var nm = sp[sp.length-1];
    var upk = page.unpackedUrl;
    if (0 && (upk.handle === h) && (upk.repo === repo)) {
      var path = "./"+m[3];
    } else {
      path = spath;
    }
    if (om.root.__components__ === undefined) {
      om.root.set("__components__",om.LNode.mk());
    }
    var cmps = om.root.__components__;
    if (componentByPath(spath)) {
      return;
    }
    om.root.__components__.push(om.lift({name:nm,path:path}));
    addComponentEl(nm,spath);
    setSynced("Components",0);
   
  }
  page.messageCallbacks.addComponent = function (pth) {
    page.addComponent(pth);
    mpg.chooser_lightbox.dismiss();
  }
  // only needed temporarily to convert from old unary components, to components that assign names
  function fixupComponents(cmps) {
    var rs = om.LNode.mk();
    var ln = cmps.length;
    var frepo = "/" +unpackedUrl.handle+"/"+unpackedUrl.repo;
    for (var i=0;i<ln;i++) {
      var c = cmps[i];
      var nc = om.DNode.mk();
      if (typeof c === "string") {
        nc.name = "name"+i;
        if (c[0]===".") {
          nc.path = frepo + c.substr(1);
        } else {
          nc.path = c;
        }
      } else {
        nc.name=c.name;
        nc.path=c.path;
      }
      rs.push(nc);
    }
    return rs;
  }

  addComponentBut.click = function () {page.popItems('addComponent');};
  
  
  // saveCodeEnabled = 0;
 
  var firstEdit = true;
  function toEditMode() {
    adjustCodeButtons('code');
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
      showSource((page.codeBuilt?unpackedUrl.url:om.root.__source__)+"/source.js");//unpackedUrl.url+"/source.js");
      //enableButton(buildBut,codeBuilt && itemOwner);
     // enableButton(saveAsBuildBut,codeBuilt && signedIn);
      //enableButton(execBut,codeBuilt);
      //enableRun(codeBuilt);
      firstEdit = false;
    }
  }
  
  var firstDataEdit = true;
  //var xData = {a:22};
  
  function dataStringForTab() {
    var xD = om.root.__currentXdata__;
    //var iD = om.root.__iData__;
    var d = xD?JSON.stringify(xD):"";
    var jsD = "callback("+d+")";
    return jsD;
  }
  /*
  function updateDataTab() {
    if (!dataEditor) return;
    var xD = om.root.__currentXdata__;
    //var iD = om.root.__iData__;
    var d = xD?xD:iD;
    var jsD = d?JSON.stringify(d):"";
    if (xD) {
      dataEditor.setReadOnly(true);
    }
    dataEditor.setValue(jsD);
    dataEditor.clearSelection();
    iDataEdited = false;
  }
  */
  function toDataMode() {
    adjustCodeButtons('data');
    /*
    var xD = om.root.__currentXdata__;
    var iD = om.root.__iData__;
    var d = xD?xD:iD;
  
    var jsD = d?JSON.stringify(d):"";
    */
    tree.objectContainer.hide();
    tree.editContainer.hide();
    tree.componentContainer.hide();

    tree.dataContainer.show();
    if (firstDataEdit) {
      dataEditor = ace.edit("dataDiv");
      /*
       *if (xD) {
        dataEditor.setReadOnly(true);
      }
      */
      dataEditor.getSession().setUseWrapMode(true);
      //dataEditor.setWrapBehavioursEnabled(true);
      dataEditor.setTheme("ace/theme/TextMate");
      dataEditor.getSession().setMode("ace/mode/javascript");
      resetDataTab();
      //dataEditor.setValue(jsD);
      //dataEditor.clearSelection();
      dataEditor.on("change",function (){
        iDataEdited = true;
        enableButton(updateBut,1);
        enableButton(saveDataBut,1);
        displayMessage(dataMsg,dataSourceMsg);
        setSynced("Data",0);});

      firstDataEdit = false;
    } else {
      if (dataTabNeedsReset) {
        resetDataTab();
      }
    }
  }
  
  function resetDataTab () {
    if (!dataEditor) return;
    var ds = om.root.dataSource;
    var uds = om.unpackUrl(ds);
    var h  = uds.host;
    page.dataWritable = uds && (uds.host === "http://prototypejungle.org") && (h===unpackedUrl.handle);
    dataEditor.setReadOnly(page.dataWritable);
    var jsD = dataStringForTab();
    dataEditor.setValue(jsD);
    dataEditor.clearSelection();
    dataEditor.resize(true);
    setSynced("Data",1);
    iDataEdited = false;
    dataTabNeedsReset = 0;
  }
  
  function toObjectMode() {
    adjustCodeButtons('object');

    tree.editContainer.hide();
    tree.dataContainer.hide();
    tree.componentContainer.hide();
    tree.objectContainer.show();
  }
  
  var firstComponentMode = true;
  function toComponentMode() {
    debugger;
    adjustCodeButtons('component');
    tree.editContainer.hide();
    tree.dataContainer.hide();
    tree.objectContainer.hide();
     tree.componentContainer.show();
    if (firstComponentMode) {
      componentNameEls = {};
      var cmps = om.root.__components__;
      if (cmps) {
        cmps.forEach(function (c) {addComponentEl(c.name,c.path);});
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
                  
      if (page.itemOwner){
        var emsg = "";
      } else {
        emsg = "You lack edit permissions for this item, but you can experiment with the code anyway.";
      } 
        
    } else {
      var src = om.root.__source__;
      emsg = 'This is a variant of <a href="/inspectd.html?item='+src+'">'+
        om.stripDomainFromUrl(src)+'</a>, which was built from the code below';
    }
    if (!page.codeBuilt || !page.itemOwner) {
      addComponentBut.hide();
    }
    editMsg.__element__.html(emsg);
    if (unbuilt) {
      unbuiltMsg.show();
    } else {
      unbuiltMsg.hide();
    }
  }
  
  
    function loadDataStep(errEl,startingUp) {
      var ds = om.initializeDataSource(page.unpackedUrl);//om.root.dataSource;
      if (ds) {
       // page.setDataSourceInHref(om.root.dataSource);
        om.loadData(ds,function (err,dt) {
          var ok = !err;
          if (ok) {
            ok = om.afterLoadData(dt,null,!evalCatch,errEl);
          }
          afterAfterLoadData(ok,errEl,startingUp);
        });
      } else {
        var ok = om.afterLoadData(null,null,!evalCatch,errEl);
        afterAfterLoadData(ok,errEl,startingUp);
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
      //svg.main.addViewBox();
    }
    enableButton(saveCodeBut,0);

    if (standalone && 1 ) {//@todo put back
       svg.main.addButtons("View");

       //theCanvas.initButtons("View");
      
      svg.main.navbut.__element__.click(function () {
        var viewPage = om.useMinified?"/view.html":"viewd.html";
        var url = viewPage + "?item="+unpackedUrl.spath;
        if (om.root.dataSource) {
          url = url + "&data="+om.root.dataSource;
        }
        location.href = url;
      });
    }

    page.setFlatMode(false);
    $('.mainTitle').click(function () {
      location.href = "http://prototypejungle.org";
    });
   
 
    page.genButtons(page.ctopDiv.__element__,{toExclude:{'about':1}}, function () {
      page.fsel.jq.__element__.mouseleave(function () {dom.unpop();});  
      if (standalone) {
        //theCanvas.contents = om.root;
        //draw.addCanvas(theCanvas);
        //theCanvas.contents = om.root;
        //theCanvas.init();
      } else {
        page.aboutBut.hide();
        var nstxt = "<div class='notStandaloneText'><p>This item includes no visible content, at least in this standalone context.</p>";
        nstxt += aboutText() + "</div>";
        svgDiv.setHtml(nstxt);
      }
      $('body').css({"background-color":"#eeeeee"});

  
      page.layout(true); //nodraw
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
      page.itemName.setHtml(unpackedUrl.name);
      cb();   
    });
  }
    

    
    // note about code built items
    // they are loaded, then instantiated, and assigned the path prototypeJungle.ws
    // but before saving, they are moved to the right place in the tree for where they will be saved.
  var newBuild  = 0;
  
  page.initPage = function (o) {
    var q = om.parseQuerystring();
   // draw.bkColor = "white";
    var wssrc = q.item;
    newBuild = q.new;
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
              debugger;
              om.tlog("install done");
              var ln  = ars?ars.length:0;
              var standalone = 1;//always true now

              if (ln>0) {
                var rs = ars[ln-1];
                if (rs) { // rs will be undefined if there was an error in installation 
                  unbuilt = rs.unbuilt;
                  if (unbuilt) {
                    var frs = rs;
                  } else {
                    var inst  = !(rs.__beenModified__);// &&  !noInst; // instantiate directly built fellows, so as to share their code
                    var ovr = installOverrides(rs);
                    if (inst) {
                      frs = rs.instantiate();
                      // components should not be inherited, since they might be modified in course of builds
                      if (rs.__components__) {
                        frs.set("__components__",fixupComponents(rs.__components__));
                        //frs.set("__components__",rs.__components__.deepCopyNoProto());
                      }
                      //if (idt) {
                      //  frs.__iData__ = idt;
                      //}
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
                  page.showTopNote();
                  if (standalone) {
                    om.overrides = ovr;
                   // frs.deepUpdate(null,null,ovr); wait until data is loaded
                   
                    var bkc = frs.backgroundColor;
                    if (!bkc) {
                      frs.backgroundColor="white";
                    }
                  }
                } else {
                  om.root =  __pj__.set("ws",svg.shape.mk());
                  om.root.__installFailure__ = 1;
                }
              } else {
                // newItem
                om.error("Obsolete option");
                om.root =  __pj__.set("ws",svg.shape.mk());
                om.root.backgroundColor="white";
                standalone = true;
                page.codeBuilt = false;
              }
                page.initFsel();
                loadComponents(function () {
                  //om.bindComponents(om.root);
                  page.genMainPage(standalone,function () {
                              om.tlog("starting build of page");
                    page.setPermissions();
                    initializeTabState();
                    page.setFselDisabled(); 
                    if (!wssrc) {
                      page.setSaved(false);
                    }
                    if  (!om.root.__about__) {
                      page.aboutBut.hide();
                    }
                    var ue = om.updateErrors && (om.updateErrors.length > 0);
                    if (ue) {
                      var lb = mpg.lightbox;
                      lb.pop();
                      lb.setHtml("<div id='updateMessage'><p>An error was encountered in running the update function for this item: </p><i>"+om.updateErrors[0]+"</i></p></div>");
                    }
                    loadDataStep(obMsg,1);// 1 = starting up
                  });
                });
            
            }
            if (0&& (newBuild || !wssrc)) {// || 1) put this in when the fellow is unloadable
              afterInstall();
            } else {
                //var lst = om.pathLast(wssrc);
                om.tlog("Starting install");
                om.install(unpackedUrl.url,afterInstall)
            }
            
            $(window).resize(function() {
                page.layout();
                //draw.mainCanvas.fitContents();

              });   
          });
  }
})(prototypeJungle);
/*
 http://prototypejungle.org:8000/inspectd?item=http://s3.prototypejungle.org/sys/repo0/chart/component/Bubble&data=./testdata/Bubble.
 
  */

