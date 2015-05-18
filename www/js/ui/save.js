(function (pj) {
  "use strict";
  
  var ui = pj.ui;
  var dat = pj.dat;
  var dom = pj.dom;

  
  var s3SaveState;// retains state while waiting for the save to complete
  var s3SaveCallback;
  
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract
 
  ui.messageCallbacks.s3Save = function (rs) {
    //if (itemSaved) restoreAfterSave();
    debugger;
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
  pj.s3Save = function (toSave,repo,pth,cb,force,needRestore) {
    //pth is eg chart/component (does not include item.js, data.js, whatever
    if (!pj.beginsWith(repo,"http://prototypejungle.org")) {
      pj.error("Repo must be at prototypejungle.org");
      return;
    }
    var pjrepo = repo.substring(26);//includes a leading slash
    var fls = [];
    var itm = toSave.item;
    var dst = pjrepo+"/"+ pth;
    var kind= toSave.kind;
    if (itm) {
      if (pj.variantOf(itm)) {
        kind = "variant";
      } else {
        kind = "codebuilt"
      }
      debugger; 
      var itms = pj.stringify(itm,repo);
      var wrapped = 'prototypeJungle.assertItemLoaded('+itms+');\n';
      //fls.push({name:"item.js",value:itms,contentType:"application/javascript"});
      fls.push({name:"item.js",value:wrapped,contentType:"application/javascript"});
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
    }
    var apiCall = "/api/toS3";
    if (s3SaveUseWorker) {
      s3SaveCallback = cb;
      ui.sendWMsg(JSON.stringify({apiCall:apiCall,postData:dt,opId:"s3Save"}));
      return;
    } else {
      pj.ajaxPost(apiCall,dt,cb);
    }
  }

  pj.anonSave = function (itm,cb) {
    var fls = [];
    var kind = "assembly";
    var itms = pj.stringify(itm);
    var wrapped = 'prototypeJungle.assertItemLoaded('+itms+');\n';
//    fls.push({name:"item.js",value:itms,contentType:"application/javascript"});
    fls.push({name:"item.js",value:wrapped,contentType:"application/javascript"});
    fls.push({name:"kind "+kind,value:"This is an item of kind "+kind,contentType:"text/plain"});
    var dt = {files:fls};
    var apiCall = "/api/anonSave";
    if (s3SaveUseWorker) {
      s3SaveCallback = cb;
      ui.sendWMsg(JSON.stringify({apiCall:apiCall,postData:dt,opId:"s3Save"}));
      return;
    } else {
      pj.ajaxPost(apiCall,dt,cb);
    }
  }

    //pth is eg chart/component (does not include item.js, data.js, whatever
  pj.saveData = function (dt,repo,pth,cb) {
    pj.s3Save({data:dt},repo,pth,cb,1);
  }
  
  
  pj.saveSource = function (cd,kind,repo,pth,cb) {
    pj.s3Save({source:cd,kind:kind},repo,pth,cb,1);
  }

//end extract
 
})(prototypeJungle);