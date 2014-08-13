(function (pj) {
  "use strict"
   var om = pj.om;
   var ui = pj.ui;
  var dom = pj.dom;
  var geom = pj.geom;
  //var __draw = pj.__draw;
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
   
  ui.processIncomingItem = function (nd) {
    var vr =  om.isVariant(nd);
    if (vr) {
      var rs = nd; // already a variant, not code built; leave as is
    } else {
      // note that one always works with an instantiation of the top level item.
      rs = nd.instantiate();
      // two things might be done: saving a variant of this, or rebuilding; we set up here for rebuilding
      // save variant produces a new variant of nd.
      
      // components for builds should not be inherited, since they might be modified in course of builds
      var rsc = nd.__requires;
      rs.set("__requires",rsc?rsc:om.LNode.mk());
      // nor should data, __xdata
      if (nd.data) {
        rs.set("data",nd.data);
      }
      if (nd.__xdata) {
        rs.__xdata = nd.__xdata;
        delete nd.__xdata;
      }
        
    }
    rs.__sourceRepo = ui.repo;
    rs.__sourcePath = ui.path;
    ui.root =  rs;
    pj.ws = rs;
    var bkc = rs.backgroundColor;
    if (!bkc) {
      rs.backgroundColor="white";
    }
  }
  
  ui.installNewItemInSvg = function () {
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
    svg.main.updateAndDraw(1);
    //itm.updateWithOverrides();
    //itm.draw();
    //debugger;
    //svg.main.fitContents();
  }
 /* 
ui.updateAndRefresh = function () {
  var itm = ui.root;
  itm.updateWithOverrides();

  if (itm.draw) {
    itm.draw();
    svg.main.addBackground(); 

    svg.main.fitContents();
  }
}
*/
function displayMessage(el,msg,isError){
  el.$show();
  el.$css({color:isError?"red":(msg?"black":"transparent")});
  el.$html(msg);
}


function displayError(el,msg){
  displayMessage(el,msg,1);
}

ui.displayError = displayError;

var activeMessageA = {"Objects":ui.obMsg,"Code":ui.codeMsg,"Data":ui.dataMsg};

ui.activeMessage = function () {
  var cmode = ui.modeTab.selectedElement;
  var rs = activeMessageA[cmode];
  return rs?rs:ui.obMsg;
}
 

function displayDone(el,afterMsg) {
  displayMessage(el,"Done");
  setTimeout(function () {
    displayMessage(el,afterMsg?afterMsg:"");
  },500);
}
ui.displayDataError = function (msg) {displayError(dataMsg,msg);}


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
  
  
  var theSource = '';
  var onChangeSet = 0;
  function showSource(src) {
    getSource(src,function (txt) {
      editor.setValue(txt);
      theSource = txt;
      editor.clearSelection();
      setSynced("Code",1);
      if (!onChangeSet) {
       // editor.on("change",function (){setSynced("Code",0);if (ui.itemOwner) ui.enableButton(ui.saveCodeBut,1);});
        onChangeSet = 1;
      }

    });
}
  
  function whenObjectsModified() {
    if (!ui.objectsModified) {
      ui.objectsModified = 1;
      return;
    }
  }
  
   ui.objectsModifiedCallbacks.push(whenObjectsModified);
  
  
  // the state of the buttons for managing code depends on permissions, and which tab is up
  
  
  var editButtons = {"build":ui.buildBut,"exec":ui.execBut,"update":ui.updateBut,
                    "saveData":ui.saveDataBut,
                     "reloadData":ui.reloadDataBut,"catch":ui.catchBut,"help":ui.codeHelpBut,"addComponent":ui.addComponentBut};
  
  function makeButtonsVisible(bts) {
    var v = {};
    bts.forEach(function (bt) {v[bt] = 1});
    for (var k in editButtons) {
      var bt = editButtons[k];
      if (v[k]) {
        bt.$show();
      } else {
        bt.$hide();
      }
    }
  }
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
    ui.editButDiv.$show();
    if (tab != "component") {
      ui.addComponentBut.$hide();
    }
    if (tab === "object") {
      ui.editButDiv.$hide();
      ui.obMsg.$show();
      return;
    }
    ui.obMsg.$hide();
    if (tab === "code") {
      ui.saveDataBut.$hide();
      ui.reloadDataBut.$hide();
      ui.editButDiv.$show();
      //ui.saveCodeBut.$hide();
      ui.updateBut.$show();
      ui.enableButton(ui.updateBut,ui.root.update);
      //if (ui.root.update) {
      //  ui.updateBut.$show();
      //} else {
      //  ui.updateBut.$hide();
      //}
      if (ui.codeBuilt) {
        if (ui.itemOwner) {
          ui.execBut.$hide();
          ui.buildBut.$show();
          //if (ui.signedIn) {
          //  ui.saveCodeBut.$show();
         // }
          displayMessage(editMsg,"");
          ui.enableButton(ui.buildBut,1);
        } else {
          ui.execBut.$show();
          ui.buildBut.$hide();
        }
        ui.catchBut.$show();
        ui.codeHelpBut.$show();
       
      } else {
        ui.execBut.$hide();
        ui.buildBut.$hide();
        ui.catchBut.$hide();
        ui.codeHelpBut.$hide();
        
        var vOf = om.getComponent(ui.root,"__variantOf");
        var vOfP = vOf.path;
        var vOfR = vOf.repo;
        if (vOfR === ".") {
          vOfR = ui.repo;
        }
        var nm = om.afterLastChar(vOfP.substring(0,vOfP.length-8),"/");
        var lnk = "/inspect?repo="+vOfR+"&path="+vOfP;
        displayMessage(editMsg,'This is a <a href="/doc/tech.html#variant" target="pjDoc">variant</a> of '+
                       '<a href="'+lnk+'">'+nm+'</a>.  You cannot edit the code in a variant.');        
      }
      //ui.updateBut.$hide();
      return;
    } 
    if (tab === "data") {
      makeButtonsVisible(["update","reloadData","catch","help"]);
      ui.enableButton(ui.updateBut,1);//iDataEdited);
      if (ui.codeBuilt) {
        ui.catchBut.$show();
        ui.codeHelpBut.$show();
      } else {
        ui.catchBut.$hide();
        ui.codeHelpBut.$hide();
      }
      return;
    }
    if (tab === "component") {
      ui.editButDiv.$show();
      makeButtonsVisible((ui.codeBuilt)?["addComponent"]:[]);
      ui.codeHelpBut.$show();

    }
  }

function getSourceFromEditor() {
  if (editor) {
    theSource = editor.getValue();
  }
  return theSource;
}



var evalCatch = 1;;

ui.catchBut.$click(function () {
  evalCatch = !evalCatch;
  ui.catchBut.$html("Catch: "+(evalCatch?"Yes":"No"));
});

var dataTabNeedsReset = 0;
// an overwrite from svg
svg.drawAll = function (){ // svg and trees
    tree.initShapeTreeWidget(); 
    //svg.main.refresh();//  __get all the latest into svg
    svg.main.fitContents();
    svg.main.draw();
  }

ui.updateBut.$click(function () {
  displayMessage(editMsg,"Updating...")
  //var ok = ui.afterLoadData(undefined,undefined,!evalCatch,dataMsg);
  if (ui.root.surrounders) {
      ui.root.surrounders.remove();
  }
  svg.main.updateAndDraw(1);
  //ui.root.
  //svg.refreshAll();
  window.setTimeout(function () {displayMessage(editMsg,"Done");window.setTimeout(
                      function () {displayMessage(editMsg,"");},500)
                    },
                    500);
});

function reloadTheData() {
  displayMessage(dataMsg,"Loading data");
  var ds = ui.root.__dataSource;
  if ($.trim(ds)) {
    dat.loadData(ds,function (err,dt) {
      if (err) {
        displayError(dataMsg,"Failed to load data");
        dataLoadFailed();
        return;
      }
      ui.root.__xdata = dt;
      ui.root.data = dat.internalizeData(dt);
      ui.root.updateWithOverrides();
      ui.root.draw();
      resetDataTab();
      displayMessage(dataMsg,"");
    });
  } else {
    delete ui.root.__xdata;
    delete ui.root.data;
    ui.root.updateWithOverrides();
    ui.root.draw();
    resetDataTab();
    displayMessage(dataMsg,"");
  }
}

ui.reloadDataBut.$click(reloadTheData);


ui.getComponentValue = function (c) {
  var p = c.path;
  var r = c.repo;
  if (r === ".") {
    r = ui.repo;
  }
  return  om.installedItems[r+"/"+p];
}

ui.bindComponent = function (item,c) {
  var nm = c.name;
  if (nm === "__instanceOf") return;
  var pv = ui.getComponentValue(c);//om.installedItems[r+"/"+p];
 // var pv = om.__evalPath(pj,p);
  if (pv) {
    var ipv = pv.instantiate();
    if (ipv.hide) {
      ipv.hide();
    }
    item.set(nm,ipv);
  } else {
    console.log("Missing component ",p);
  }
}
ui.bindComponents = function (item) {
  var cmps = item.__requires;
  if (cmps) {
    //var curls = [];// component urls
    cmps.forEach(function (c) {
      ui.bindComponent(item,c);
    });
  }
}
     
// mk a new item for a build from components. If one of the components is __instanceOf, item will instantiate that component
ui.mkNewItem = function (cms) {
  var iof = om.getComponentFromArray(cms,"__instanceOf");
  if (iof) {
    var iofv = ui.getComponentValue(iof);
    var itm = iofv.instantiate();
  } else {
    itm = svg.tag.g.mk();
  }
  if (cms) {
    itm.set("__requires",cms);
  }
  return itm;
}

  function evalCode(building) {
    // should prevent builds or evals when overrides exist;
    delete om.overrides;
    function theJob() {
      displayMessage(editMsg,building?"Building...":"Running...");
      adjustComponentNames();
      om.installRequires1(ui.repo,ui.root.__requires,function () {
       
        var ev = editor.getValue();
        var cxd=ui.root.__xdata;
        var d = ui.root.data;
        var ds = ui.root.__dataSource; // this gets carried over to the new item, if present
        var createItem;
        var wev = "createItem = function (item,repo) {debugger;window.pj.ui.bindComponents(item);\n";
        if (ds) {
          wev += 'item.__dataSource = "'+ds+'";\n';
        }
        wev += ev+"\n}";
        if (!building){
          ui.saveDisabled = 1;  // this modifies the world without updating anything persistent, so saving impossibleobj
        }
        eval(wev)
        var itm = ui.mkNewItem(ui.root.__requires);
        //var itm = svg.tag.g.mk();
        //if (ui.root.__requires) {
        //  itm.set("__requires",ui.root.__requires);
        //}
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
        itm.__sourceRepo = ui.repo;
        itm.__sourcePath = ui.path;
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
          ui.installNewItemInSvg();
          displayDone(editMsg);
        }
      if (building) {
          var toSave = {item:itm};
          om.s3Save(toSave,ui.repo,om.pathExceptLast(ui.path),afterSave,1); // 1 = force (ie overwrite)
       /*   )function (rs) {
            ui.objectsModified = 0;
            unbuilt = 0;
            unbuiltMsg.$hide();
            ui.processIncomingItem(itm);
            // carry over  data from before build
            if (cxd) {
              itm.__xdata = cxd;
              itm.data = d;
            }
            ui.installNewItemInSvg();
            displayDone(editMsg);
            return;
          },1); // 1 = force (ie overwrite)*/
        } else {
          afterSave();
        }
      });
    }
    theJob();
    $('#err').html(' ');
  }


var errorMessages = {timedOut:"Your session has timed out. Please log in again.",
                             noSession:"You need to be logged in to save or build items."}
// are these various things different from their persistent reps?

var synced = {Requires:1,Data:1,Code:1,Objects:1};
var unbuilt = 0;

function setSynced(which,value) {
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
  
 

function saveSource(cb,building) {
    $('#error').html('');
    var src = getSourceFromEditor();
    var kind = building?undefined:"unbuilt";
    if (!building) displayMessage(editMsg,"Saving...");
    saveSourceBuilding = building;
    om.saveSource(src,kind,ui.repo,om.pathExceptLast(ui.path),function (rs) {
    if (rs.status !== "ok") {
       var msg = errorMessages[rs.msg];
       msg = msg?msg:"Saved failed. (Internal error)";
       displayError(editMsg,msg);
     } else {
       setSynced("Code",1);
       ui.setSaved(true);
       if (!saveSourceBuilding) {
        unbuilt = 1;
        unbuiltMsg.$show();
        displayDone(editMsg);
       }
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
  var pth = paD.path;
  var frc = paD.force;
  var src = om.stripInitialSlash(ui.pjpath);
  var dst = om.stripInitialSlash(pth);
  var inspectPage = om.useMinified?"/inspect":"/inspectd";
  ui.gotoThisUrl = inspectPage+"?item=/"+dst;
  //var rcmp = om.__fromNode(om.root.__requires);
  var dt = {src:src,dest:dst};
  if (frc) {
    dt.force = 1;
  }
  ui.sendWMsg(JSON.stringify({apiCall:"/api/copyItem",postData:dt,opId:"saveBuildDone"}));
}
ui.messageCallbacks.saveBuildDone = function (rs) {
  location.href = ui.gotoThisUrl;
}
 
  var componentDeleteEls = [];
  function removeFromComponentArray(spath) {
    var cmps = ui.root.__requires;
    if (cmps) {
      var rs = om.LNode.mk();
      cmps.forEach(function (c) {
        if (c.path !== spath) {
          rs.push(c);
        }
      });
      ui.root.set("__requires",rs);
    }
  }
 
  // fpath is the "full path" , but without the item.js
  function componentByPath(fpath) {
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
  
  // the inspector doesn't support items from domains other than prototypejungle, but will
  // do so.
  ui.repoIsFromPJ = function (repo) {
    var pjs = "http://prototypejungle.org";
    if (repo === ".") {
      return om.beginsWith(ui.repo,pjs);
    } else {
      return om.beginsWith(repo,pjs);
    }
  }
  
  var componentNameEls = {};
  
  function addComponentEl(nm,repo,path) {
    if (!ui.repoIsFromPJ(repo)) {
      om.error("Repos from elsewhere than pj: not yet");
    }
    // path ends in /item.js. tpath, truncated path removes /item.js
    var tpath = path.substring(0,path.length-8);
    var cel = html.Element.mk('<div/>');
    var inspectPage = ui.useMinified?"/inspect":"/inspectd";
    var pream = "http://"+location.host+inspectPage+"?item=";
    var fpath = repo+"/"+tpath;//'pj'+spath.replace(/\//g,'.');
    var exrepo = ((repo === ".")?"/"+ui.handle+"/"+ui.pjrepo:repo.substr(26));
    var expath = exrepo+"/"+tpath; //  used for the link
    var dpath = ((repo === "."))?"."+"/"+tpath:expath;//  displayed path
    var editable = ui.codeBuilt&&ui.itemOwner;
    var vinp = html.Element.mk('<input type="input" value="'+nm+'" style="font:'+tree.inputFont+
                              ';background-color:white;width:100px;margin-left:0px"/>');
    cel.push(html.Element.mk('<span>item.</span>'));
    cel.push(vinp);
    componentNameEls[fpath] = vinp;
    cel.push(html.Element.mk('<span> = </span>'));
                 
    cel.push(html.Element.mk('<a href="'+pream+expath+'">'+dpath+'</a>'));
    var delcel = html.Element.mk('<span class="roundButton">X</span>');
    componentDeleteEls.push(delcel);
    cel.addChild(delcel);
    delcel.$click (function () {
      delete componentNameEls[fpath];
      cel.remove();removeFromComponentArray(path);setSynced("Requires",0)
    });
    tree.componentsDiv.addChild(cel);
    cel.draw();
    if (editable) {
      vinp.addEventListener('keyup',function () {
        var nm = vinp.$prop('value');
        console.log('++',nm);
        if (om.checkName(nm)) {
          displayMessage(componentMsg,"");
        } else {
          displayError(componentMsg,"Component names may not contain characters other than the digits, the letters, and  _ (underbar)");  
        }
      });
    }
  }
  // path is full path relative to prototypejungle.org (eg sys/repo0/example/TwoRectangles
  function adjustComponentNames() { // from the inputs
    for (var p in componentNameEls) {
      var vinp = componentNameEls[p];
      var nm = vinp.$prop('value');
      var c = componentByPath(p);
      if (om.checkName(nm)) {
        c.name = nm;
      } else {
        vinp.$prop('value',c.name);//revert
      }
        
    }
    displayMessage(componentMsg,"");

  }
  
  function hideComponentDeletes() {
    componentDeleteEls.forEach(function (d){d.$hide()});
  }
  
  
  ui.addComponent = function (path,cb) {
    if (cb) cb();
    var sp = path.split("/");
    var h = sp[0];
    var r = sp[1];
    var nm = sp[sp.length-1];
    var p = sp.slice(2).join("/")+"/item.js";
    var sameRepo = (ui.handle === h) && (ui.pjrepo === r);
    if (ui.root.__requires === undefined) {
      ui.root.set("__requires",om.LNode.mk());
    }
    var rr = sameRepo?".":"http://prototypejungle.org/"+h+"/"+r;
    var cmps = ui.root.__requires;
    var fpath = rr + "/" + p;
    if (componentByPath(fpath)) {
      return;
    }
    var xit = om.XItem.mk(nm,rr,p);
    ui.root.__requires.push(xit);//om.lift({name:nm,repo:rr,path:p}));
    addComponentEl(nm,rr,p);
    setSynced("Requires",0);
   
  }
  ui.messageCallbacks.addComponent = function (pth) {
    ui.addComponent(pth);
    mpg.chooser_lightbox.dismiss();
  }
  

  ui.addComponentBut.$click (function () {ui.popItems('addComponent');});
  
  
 
  var firstEdit = true;
  function toEditMode() {
    adjustCodeButtons('code');
    tree.objectContainer.$hide();
    tree.componentContainer.$hide();
    tree.dataContainer.$hide();
    tree.editContainer.$show();
    if (firstEdit) {
      editor = ace.edit("editDiv");
      editor.setTheme("ace/theme/TextMate");
      editor.getSession().setMode("ace/mode/javascript");
      if (!ui.codeBuilt) editor.setReadOnly(true);
      var vr = om.getComponent(ui.root,"__variantOf");
      if (vr) {
        var srcUrl = om.getComponentUrl(ui.root,vr);
      } else {
        var srcUrl = ui.url;
      }
      showSource(om.pathReplaceLast(srcUrl,"source.js"));//unpackedUrl.url+"/source.js");
      firstEdit = false;
    }
  }
  
  var firstDataEdit = true;
  
  function dataStringForTab() {
    var xD = ui.root.__xdata;
    return xD?"dataCallback("+JSON.stringify(xD)+")":"";      
  }
  
  
  ui.theDataSource = function () {
    return ui.__dataSource;//?ui.dataSource:ui.unpackedUrl.url + "/data.js";
  }
  
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
  
  /*
http://prototypejungle.org/sys/repo0/data/trade_balance.js
   */
  function resetDataTab () {
    if (!dataEditor) return;
    var ds = ui.root.__dataSource;
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
    tree.editContainer.$hide();
    tree.dataContainer.$hide();
    tree.componentContainer.$hide();
    tree.objectContainer.$show();
  }
  
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
  
  
  ui.modeTab.action = setMode;
  
  function initializeTabState() {
    if (ui.codeBuilt) {          
      if (ui.itemOwner){
        var emsg = "";
      } else {
        emsg = "You lack edit permissions for this item, but you can experiment with the code anyway.";
      } 
        
    } else {
      emsg = 'Fix this message';//This is a variant of <a href="/inspect?repo='+ui.root.__sourceRepo+'&path='+ui.root.__sourcePath+'">'+
        //om.root.pjpath+'</a>, which was built from the code below';
    }
    if (!ui.codeBuilt || !ui.itemOwner) {
      ui.addComponentBut.$hide();
    }
    editMsg.$html(emsg);
    if (unbuilt) {
      unbuiltMsg.$show();
    } else {
      unbuiltMsg.$hide();
    }
  }
 
  ui.genMainPage = function (cb) {
    if (pj.mainPage) return;
    pj.set("mainPage",mpg);
    if (ui.includeDoc) {
      mpg.addChild("doc",ui.docDiv);
    }
    ui.execBut.$click(function () {
      if (!ui.execBut.disabled) evalCode();
    });
    ui.buildBut.$click(function () {
      if (!ui.buildBut.disabled) doTheBuild();
    });
   // ui.saveCodeBut.$click(function () {
    //  if (!ui.saveCodeBut.disabled) saveTheCode();
    //});
    ui.mpg.__addToDom();    
    ui.dataSourceInput.addEventListener("change",function () {
      var nds = ui.dataSourceInput.$prop("value");
      ui.root.__dataSource = nds;
      ui.__dataSource = nds;
      ui.ownDataSource = 0;
      reloadTheData();
    });
    
    svg.main = svg.Root.mk(ui.svgDiv.__element);
    svg.main.activateInspectorListeners();
    //ui.enableButton(ui.saveCodeBut,0);
    svg.main.addButtons("View");      
    svg.main.navbut.$click(function () {
      var viewPage = om.useMinified?"/view":"viewd";
      var url = viewPage + "?item="+ui.pjpath;;
      //if (ui.root.dataSource) {
      //  url = url + "&data="+ui.root.__dataSource;
      //}
      location.href = url;
    });
    

    if (typeof(ui.root) !== "string") ui.setFlatMode(false);
    $('.mainTitle').click(function () {
      location.href = "http://prototypejungle.org";
    });
    
    ui.enableButton(ui.upBut,0);
    ui.enableButton(ui.topBut,0);
    ui.enableButton(ui.downBut,0);
 
    ui.genButtons(ui.ctopDiv.__element,{}, function () {
      $('body').css({"background-color":"#eeeeee"});
      ui.layout(true); //nodraw
      var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
      var rc = geom.Rectangle.mk({corner:[0,0],extent:[600,200]});
      var lb = lightbox.newLightbox(r);
      mpg.set("lightbox",lb);
      var clb = lightbox.newLightbox(rc);
      mpg.set("chooser_lightbox",clb);
      var elb = lightbox.newLightbox(rc);
      mpg.set("editor_lightbox",elb);
      ui.itemName.$html(ui.itmName);
      if (typeof(ui.root) == "string") {
        ui.editButDiv.$hide();
        ui.editMsg.$hide();
        if (ui.root === "missing") {
          var msg = "404 No Such Item"
        } else {
          // the first character indicates whether the item is code built (1) or not (0)
          msg = "Load failed for "+(ui.root.substr(1));
          if (ui.root[0] ==="1") {
            ui.codeBuilt = 1;
          }
          ui.setPermissions();
        }
        ui.svgDiv.setHtml("<div style='padding:100px;font-weight:bold'>"+msg+"</div>");
        ui.root = om.mkRoot();
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
  function processQuery(q) {
    var q = ui.parseQuerystring();
    var itm = q.item;
    if (itm) {
      var itms = itm.split("/");
      ui.repo = "http://prototypejungle.org/"+itms[1]+"/"+itms[2];
      ui.path = itms.slice(3).join("/");
    } else {
      ui.repo=q.repo;
      ui.path=q.path?om.stripInitialSlash(q.path):undefined;
    }
    if (!ui.repo) {
      return 0;
    }
    if (!om.endsIn(ui.path,".js")) {
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
    if (om.beginsWith(ui.url,'http://prototypejungle.org')) {
      ui.pjpath=om.pathExceptLast(ui.url.substring(26));
    }
    ui.includeDoc = q.intro;
    return 1;

  }
 
  function testStrict() {
    console.log("TEST STRICT ",this);
    //code
  }
  ui.initPage = function (o) {
    var q = ui.parseQuerystring();
    if (!processQuery(q)) {
      var badUrl = 1;
    }
    testStrict();
     $('document').ready(
        function () {
          om.tlog("document ready");
          $('body').css({"background-color":"white",color:"black"});
          ui.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a ui-back inadvertantly
          ui.addMessageListener();
            function afterInstall(e,rs) {
              //delete rs.__overrides;
               om.tlog("install done");
              if (e) {
                rs = svg.tag.g.mk();
                rs.__installFailure = e;

              } 
              ui.processIncomingItem(rs);
              ui.codeBuilt = !(om.variantOf(ui.root));
              ui.initFsel();
              ui.genMainPage(function () {
                om.tlog("starting build of page");
                ui.setPermissions();
                initializeTabState();
                toObjectMode();
                ui.setFselDisabled(); 
                if  (!ui.root._pj_about) {
                  ui.aboutBut.$hide();
                }
                var ue = ui.updateErrors && (ui.updateErrors.length > 0);
                if (ue || badUrl || e) {
                 
                  if (ue) {
                    var emsg = '<p>An error was encountered in running the update function for this item: </p><i>'+om.updateErrors[0]+'</i></p>';
                  } else if (badUrl) {
                      var emsg = '<p>Expected item, eg</p><p> http://prototypejungle.org/inspect?item=/sys/repo0/chart/Bar1</p>';
                  } else {
                    var emsg = '<p style="font-weight:bold">Item not found</p>';
                      //code
                  }
                  ui.svgDiv.$html('<div style="padding:150px;background-color:white;text-align:center">'+emsg+'</div>');
                  //var lb = mpg.lightbox;
                    //lb.pop();
                    //lb.setHtml("<div id='updateMessage'>"+emsg+"</div>");
                  
                } else {
                  ui.installNewItemInSvg();
                  tree.initShapeTreeWidget();
                 // tree.showItem(ui.root,'auto',1);// 1 noselect
                }

              });
            }      
            om.tlog("Starting install");
            if (ui.repo) {
              om.installWithData(ui.repo,ui.path,afterInstall);
            } else {
              afterInstall("badUrl");
            }
            $(window).resize(function() {
                ui.layout();

              });   
          });
  }

//end extract

})(prototypeJungle);


