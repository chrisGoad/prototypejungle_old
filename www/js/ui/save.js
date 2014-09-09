(function (pj) {
  "use strict";
  var om = pj.om;
  var ui = pj.ui;
  var dat = pj.dat;
  var dom = pj.dom;

  
  var s3SaveState;// retains state while waiting for the save to complete
  var s3SaveCallback;
  
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract
/*
  var s3SaveState;// retains state while waiting for the save to complete
  var s3SaveCallback;
  // some state of an item is not suitable for saving (eg all of the dom links). This sta
  var propsToStash = ["__objectsModified","__xdata","surrounders","__container"];
  var computeStash;
  var domStash;
  var stateStash;
  var itemSaved;
  var stashPreSave = function (itm,needRestore) {
      debugger;
      stateStash = needRestore?{}:undefined;
      if (needRestore) {
        om.setProperties(stateStash,itm,propsToStash,1);
      }
      propsToStash.forEach(function (p) {
        delete itm[p];
      });
      dat.stashData(itm);
      domStash = needRestore?{}:undefined;
      dom.removeDom(itm,domStash);
      computeStash = needRestore?{}:undefined;
      om.removeComputed(itm,computeStash);
     
      if (needRestore) itemSaved = itm;
  } 
  
  
  
  var restoreAfterSave = function () {
    var itm = itemSaved;
    om.setProperties(itm,om.stashedState,propsToStash,1);
    dat.restoreData(itm);
    om.restoreComputed(itm,computeStash);
    om.restoreDom(itm,domStash);
  }
    
    */
 
  ui.messageCallbacks.s3Save = function (rs) {
    //if (itemSaved) restoreAfterSave();
    if (s3SaveCallback) {
      var cb = s3SaveCallback;
      s3SaveCallback = undefined;
      
      cb(rs);
    }
  }
  
  var s3SaveUseWorker = 1;// use the worker iframe
  // note xData and components are moved from outside of the value to the container for storage.
  // this is for consistency for unbuilt items, in which the value is just "ubuilt".
  // repo should be eg http://prototypejungle.org/sys/repo0
  // toSave may have fields item, source,  and data
  om.s3Save = function (toSave,repo,pth,cb,force,needRestore) {
    //pth is eg chart/component (does not include item.js, data.js, whatever
    if (!om.beginsWith(repo,"http://prototypejungle.org")) {
      om.error("Repo must be at prototypejungle.org");
      return;
    }
    //itemSaved=undefined;
    var pjrepo = repo.substring(26);//includes a leading slash
    console.log(pjrepo);
    var fls = [];
    var itm = toSave.item;
    var dst = pjrepo+"/"+ pth;
    //var frepo ="http://prototypejungle.org"+repo; 
    var kind= toSave.kind;
    if (itm) {
      if (om.variantOf(itm)) {
        kind = "variant";
      } else {
        kind = "codebuilt"
      }
         //var ovr = om.overrides;
        //itm.__stashData();
       // itm.__removeComputed();
      //stashPreSave(itm,needRestore);
      var itms = om.stringify(itm,repo);
      fls.push({name:"item.js",value:itms,contentType:"application/javascript"});
    }
    var src = toSave.source;
    if (src) {
      fls.push({name:"source.js",value:src,contentType:"application/javascript"});
    }
    if (kind) {
      fls.push({name:"kind "+kind,value:"This is an item of kind "+kind,contentType:"text/plain"});
    }
    var dt = toSave.dt;
    if (dt) {
      fls.push({name:"data.js",value:dt,contentType:"application/javascript"});

    }
    var dt = {path:dst,files:fls};
    if (force) {
      dt.force = 1;
      //code
    }
   // var dt = {path:dst,files:[{name:"item.js",value:itms,contentType:"application/javascript"},
   //                           {name:"kind "+kind,value:"This is an item of kind "+kind,contentType:"text/plain"}]};
    /*var svf = x.savedFrom;
    if (svf && !x.dataSource ) {
      dt.savedFrom = svf;
      dt.ownDataSource = 1;
    }
    */
    //s3SaveState = {x:x,cb:cb,built:built,cxD:cxD,cmps:cmps,surrounders:surrounders};
   
    var apiCall = "/api/toS3";
    if (s3SaveUseWorker) {
      s3SaveCallback = cb;
      ui.sendWMsg(JSON.stringify({apiCall:apiCall,postData:dt,opId:"s3Save"}));
      return;
    } else {
      om.ajaxPost(apiCall,dt,cb);
    }
  }

    //pth is eg chart/component (does not include item.js, data.js, whatever
  om.saveData = function (dt,repo,pth,cb) {
    om.s3Save({data:dt},repo,pth,cb,1);
  }
  
  
  om.saveSource = function (cd,kind,repo,pth,cb) {
    om.s3Save({source:cd,kind:kind},repo,pth,cb,1);
  }

/*
  om.save = function (x) {
    var cs = om.customSave; // used in build
    if (cs) {
      cs(x);
    } else {
      alert('Save executed from an unexpected context');
    }
  }
  
  */

//end extract
 
})(prototypeJungle);