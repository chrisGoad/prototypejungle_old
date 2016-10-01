

var s3SaveState;// retains state while waiting for the save to complete
var s3SaveCallback;


// This is one of the code files assembled into pjui.js. 

pj.maxSaveLength = 50000; 

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
  var dir = pj.pathExceptLast(path);
  var fnm = pj.pathLast(path);
  var svg = pj.endsIn(fnm,'.svg');
  var json = pj.endsIn(fnm,'.json');
  var nm = fnm.replace('.',pj.dotCode);
  var storeRefString = fb.storeRefString();
  var fullPath = storeRefString + path;//path.replace('.',pj.dotCode);
  if (svg || json) {
    var storageRef = fb.storageRef.child(fb.storageRefString()+'/'+path);
  } else {
    var store = fb.rootRef.child(storeRefString+(dir?dir:''));
    var upd = {};
    upd[nm] = str;
  }
  var directory = fb.rootRef.child(fb.directoryRefString()+(dir?dir:''));//dir?directoryRef.child(dir):directoryRef;
  var updd = {};
  updd[nm] = 1;
  var updateDirectory = function (rs) {
    directory.update(updd,function (err) {
      cb(err,rs);
    });
  }
  if (svg || json) {
    var blob = new Blob([str]);
    var uploadTask = storageRef.put(blob, svg?fb.svgMetadata:fb.jsonMetadata);
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

pj.saveItem = function (path,itm,cb,aspectRatio) {
  var str;
  if (pj.endsIn(path,'.svg')) {
    str = svg.main.svgString(400,40,aspectRatio);
  } else {
    str = pj.stringify(itm,'http://protochart.org/repo1');
  }
  pj.log("save","DOING THE SAVE");
  pj.saveString(path,str,cb);
}

