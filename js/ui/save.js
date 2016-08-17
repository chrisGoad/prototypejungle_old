(function (pj) {
  
var ui = pj.ui;
var dat = pj.dat;
var dom = pj.dom;


var s3SaveState;// retains state while waiting for the save to complete
var s3SaveCallback;


// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly

//start extract
/*
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
  */
  pj.maxSaveLength = 50000; // same as maxLengths for storage_server
/*pj.saveAnonString = function (str,contentType,cb) {
  var errmsg,dt;
  if (str.length > pj.maxSaveLength) {
    errmsg = 'SizeFail' ;
    cb({status:'fail',msg:'SizeFail'});
    return;
  }
  dt = {value:str,contentType:contentType};
  s3SaveCallback = cb;
  ui.sendWMsg(JSON.stringify({apiCall:"/api/anonSave",postData:dt,opId:"s3Save"}));
}*/
// ctype : json or svg

ui.removeToken = function (url) { // the token is not needed, because our bucket gives open read access
  var rs;
  var tokenP = url.indexOf('&token=');
  if (tokenP > -1) {
    rs = url.substring(0,tokenP);
  } else {
    rs = url;
  }
  return rs;
}

pj.saveString = function (path,str,cb) {
  debugger;
  
  var dir = pj.pathExceptLast(path);
  var fnm = pj.pathLast(path);
  var svg = pj.endsIn(fnm,'.svg');
  //var nm = svg?pj.beforeLastChar(fnm,'.'):fnm;
  var nm = fnm.replace('.',pj.dotCode);
  //var directoryRef = pj.useS?ui.directoryRef().child('s'):ui.directoryRef();
  var storeRefString = ui.storeRefString();
  var fullPath = storeRefString + path;//path.replace('.',pj.dotCode);
  if (svg) {
    var storageRef = ui.storageRef.child(ui.storageRefString()+'/'+path);
  } else {
    var store = ui.rootRef.child(storeRefString+(dir?dir:''));
    //var store = dir?storeRef.child(dir):storeRef;
    var upd = {};
    upd[nm] = str;
  }
 
  var directory = ui.rootRef.child(ui.directoryRefString()+(dir?dir:''));//dir?directoryRef.child(dir):directoryRef;
  var updd = {};
  updd[nm] = 1;
  var updateDirectory = function (rs) {
    directory.update(updd,function (err) {
      cb(err,rs);
    });
  }
  if (svg) {
    var blob = new Blob([str]);
    var uploadTask = storageRef.put(blob, ui.svgMetadata);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,null,null,function() {
      var url = updd[nm] = ui.removeToken(uploadTask.snapshot.downloadURL);
      updateDirectory(url);
    });
  } else {
    store.update(upd,function (err) {
      if (err) {
        cb(err,fullPath);
      } else {
        updateDirectory(fullPath);
      }
    });
  }
}

  pj.forFB = true;

pj.saveItem = function (path,itm,cb,aspectRatio) {
  var str;
  debugger;
  if (pj.endsIn(path,'.svg')) {
    str = svg.main.svgString(400,40,aspectRatio);
  } else {
    str = pj.stringify(itm,'http://prototypejungle.org/sys/repo1');
  }
  pj.log("save","DOING THE SAVE");
  pj.saveString(path,str,cb);
}


//end extract
 
})(prototypeJungle);