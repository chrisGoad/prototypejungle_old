(function (pj) {
  
var ui = pj.ui;
var dat = pj.dat;
var dom = pj.dom;


var s3SaveState;// retains state while waiting for the save to complete
var s3SaveCallback;


// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly

//start extract

ui.messageCallbacks.s3Save = function (rs) {
  debugger;
  //if (itemSaved) restoreAfterSave();
  if (s3SaveCallback) {
    var cb = s3SaveCallback;
    s3SaveCallback = undefined;
    
    cb(rs);
  }
}

  var s3SaveUseWorker = 1;// use the worker iframe
  
  pj.maxSaveLength = 50000; // same as maxLengths for storage_server
pj.saveAnonString = function (str,contentType,cb) {
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
// ctype : json or svg
pj.saveString = function (path,str,cb) {
  debugger;
  var dir = pj.pathExceptLast(path);
  var fnm = pj.pathLast(path);
  var svg = pj.endsIn(fnm,'.svg');
  var nm = svg?pj.beforeLastChar(fnm,'.'):fnm;
  var directoryRef = ui.directoryRef().child(svg?'svg':'s')
  var storeRefString = ui.storeRefString(svg);
  var fullPath = storeRefString + path;
  var storeRef = new Firebase(ui.firebaseHome+storeRefString);
  var store = dir?storeRef.child(dir):storeRef;
  var directory = dir?directoryRef.child(dir):directoryRef;
  var upd = {};
  upd[nm] = str;
  var updd = {};
  updd[nm] = 1;
  store.update(upd,function (err) {
    if (!err) {
      directory.update(updd,function (err2) {
        cb(err2,fullPath);
      });
    } else {
      cb(err,fullPath);
    }
  });
}
/*
pj.saveString = function (path,str,contentType,overwrite,cb) {
  if (pj.FB) {
    pj.saveStringFB(path,str,overwrite,cb);
    return;
  }
  var errmsg,dt;
  if (str.length > pj.maxSaveLength) {
    debugger;
    errmsg = 'SizeFail' ;
    cb({status:'fail',msg:'SizeFail',length:str.length});
    return;
  }
  dt = {path:path,value:str,contentType:contentType};
  if (overwrite) {
    dt.overwrite = 1;
  }
  s3SaveCallback = cb;
  ui.sendWMsg(JSON.stringify({apiCall:"/api/save",postData:dt,opId:"s3Save"}));
}
*/


pj.anonSave = function (itm,cb) {
  var itms = pj.stringify(itm,'http://prototypejungle/anon');
  var wrapped = 'prototypeJungle.assertItemLoaded('+itms+');\n';
  var doTheSave = function () {
    pj.log("save","DOING THE SAVE");
    pj.saveAnonString(wrapped,"application/javascript",cb);
  }
  if (ui.workerIsReady) {
    doTheSave();
  } else {
    pj.log("save","DEFERRING SAVE");
    ui.whenWorkerIsReady = doTheSave;
    ui.loadWorker();
  }
}

/*
var str = svg.main.svgString(400,20);
    var doTheSave = function () {
      pj.saveString(str,'image/svg+xml',function (srs) {
  */
  
pj.forFB = 1;

pj.saveItem = function (path,itm,cb) {
  var str;
  debugger;
  if (pj.endsIn(path,'.svg')) {
    str = svg.main.svgString(400,20);
  } else {
    str = pj.stringify(itm,'http://prototypejungle.org/sys/repo1');
  }
  pj.log("save","DOING THE SAVE");
  pj.saveString(path,str,cb);
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