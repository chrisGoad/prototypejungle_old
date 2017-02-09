

var s3SaveState;// retains state while waiting for the save to complete
var s3SaveCallback;


// This is one of the code files assembled into pjui.js. 

pj.maxSaveLength = 200000;//50000; // this should match the limit in the storage rules for firebase

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
  if (str.length >= pj.maxSaveLength) {
    cb('maxSizeExceeded',str.length);
    return;
  }
  alert('save size = '+str.length)
  var dir = pj.pathExceptLast(path);
  var fnm = pj.pathLast(path);
  var ext = pj.afterLastChar(fnm,'.',true);
  var svg = pj.endsIn(fnm,'.svg');
  var nm = fnm.replace('.',pj.dotCode);
  var storeRefString = fb.storeRefString();
  var fullPath = storeRefString + path;//path.replace('.',pj.dotCode);
  var storageRef = fb.storageRef.child(fb.storageRefString()+'/'+path);
  var directory = fb.rootRef.child(fb.directoryRefString()+(dir?dir:''));//dir?directoryRef.child(dir):directoryRef;
  var updd = {};
  updd[nm] = "1";
  var updateDirectory = function (rs) {
    directory.update(updd,function (err) {
      cb(err,rs);
    });
  }
  var blob = new Blob([str]);
  var uploadTask = storageRef.put(blob, svg?fb.svgMetadata:fb.jsonMetadata);
  uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,null,null,function() {
    var url = ui.removeToken(uploadTask.snapshot.downloadURL);
   // var url = updd[nm] = ui.removeToken(uploadTask.snapshot.downloadURL);
    debugger;
    var storageUrl = pj.storageUrl(path,fb.currentUid());
    if (url !== storageUrl) {
      console.log('mismatch :',url,storageUrl);
      debugger;
    } else {
      console.log('match :',url,storageUrl);
      debugger;
    }
    updateDirectory(url);
  });
}

pj.saveItem = function (path,itm,cb,aspectRatio) {
  var str;
  debugger;
  if (pj.endsIn(path,'.svg')) {
    str = svg.main.svgString(400,20,aspectRatio);
  } else if (pj.endsIn(path,'.js')||pj.endsIn(path,'.catalog')) { //the saving-codde case
    str = itm;
  } else { // .item case
    str = pj.stringify(itm);
    pj.tstr = str;
  }
  pj.log("save","DOING THE SAVE");
  pj.saveString(path,str,cb);
}

