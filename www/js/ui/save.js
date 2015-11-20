(function (pj) {
  
var ui = pj.ui;
var dat = pj.dat;
var dom = pj.dom;


var s3SaveState;// retains state while waiting for the save to complete
var s3SaveCallback;


// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly

//start extract

ui.messageCallbacks.s3Save = function (rs) {
  //if (itemSaved) restoreAfterSave();
  if (s3SaveCallback) {
    var cb = s3SaveCallback;
    s3SaveCallback = undefined;
    
    cb(rs);
  }
}

  var s3SaveUseWorker = 1;// use the worker iframe
  
  pj.maxSaveLength = 50000; // same as maxLengths for storage_server
pj.saveString = function (str,contentType,cb) {
  var errmsg,dt;
  if (str.length > pj.maxSaveLength) {
    errmsg = 'SizeFail' ;
    cb({status:'fail',msg:'SizeFail'});
    return;
  }
  dt = {value:str,contentType:contentType};
  s3SaveCallback = cb;
  ui.sendWMsg(JSON.stringify({apiCall:"/api/anonSave",postData:dt,opId:"s3Save"}));
}


pj.anonSave = function (itm,cb) {
  var itms = pj.stringify(itm,'http://prototypejungle/anon');
  var wrapped = 'prototypeJungle.assertItemLoaded('+itms+');\n';
  var doTheSave = function () {
    pj.log("save","DOING THE SAVE");
    pj.saveString(wrapped,"application/javascript",cb);
  }
  if (ui.workerIsReady) {
    doTheSave();
  } else {
    pj.log("save","DEFERRING SAVE");
    ui.whenWorkerIsReady = doTheSave;
    ui.loadWorker();
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