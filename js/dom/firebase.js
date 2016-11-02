
  
// This is one of the code files assembled into pjdom.js. 



var fb = pj.set("fb",pj.Object.mk());
fb.__builtIn = true;

// get the  directory for this user. Create if missing.

var notSignedInUid = 'TcYg4ep5s5TrvfxG5CWr11vjZZu1';

 var protohart_config = {
    apiKey: "AIzaSyDCSJngwaC0I6K3QJNs4jibqmvV6Ezbvvc",
    authDomain: "protochart.firebaseapp.com",
    databaseURL: "https://protochart.firebaseio.com",
    storageBucket: "protochart.appspot.com",
  };
  
var config = {
    apiKey: "AIzaSyAKaFHViXlHy6Hm-aDeKa5S9Pnz87ZRpvA",
    authDomain: "prototypejungle.firebaseapp.com",
    databaseURL: "https://prototypejungle.firebaseio.com",
    storageBucket: "project-5150272850535855811.appspot.com",
  };

 var dev_config = {
    apiKey: "AIzaSyA97dcoN5fPvEoK_7LAGZcJn-GHd3xPW9I",
    authDomain: "prototypejungle-dev.firebaseapp.com",
    databaseURL: "https://prototypejungle-dev.firebaseio.com",
    storageBucket: "prototypejungle-dev.appspot.com",
  };
  
fb.initFirebase = function () {
   firebase.initializeApp(config);
   fb.rootRef =  firebase.database().ref();
   fb.storage = firebase.storage();
   fb.storageRef = fb.storage.ref();
}

/*
 * Structure: to the user, there is just one tree of objects. The underlying firebase structure is more complicated.
 * uid/directory contains an entry for every element of the tree of whatever kind. For an item at uid/directory/<path>,
 * uid/diretory/<path> holds just a 1, and uid/s/<path> holds the JSON content of the item. For other kinds of files (eg .svg and .json),
 * uid/directory/<path> holds the URL in firebase storage where the data itself is held. 
 */
fb.setCurrentUser = function (cb) {
  if (fb.currentUser) {
     if (cb) {
      cb();
     }
     return;
  }
  var  auth = firebase.auth();
  fb.currentUser = auth.currentUser;
  if (!fb.currentUser) {
    auth.onAuthStateChanged(function(user) {
      fb.currentUser = user;
      if (cb) {
        cb();
      }
    });
    return;
  }
  if (cb) {
    cb();
  }
}
fb.removeUser = function () {
 if (fb.currentUser) {
    var uid = encodeURIComponent(fb.currentUser.uid);
    var userRef = fb.rootRef.child(uid);
    userRef.remove();
 }
}

fb.currentUid = function ()  {
  return fb.currentUser?fb.currentUser.uid:notSignedInUid;
}
/*fb.directoryRefString = function () {
  return fb.currentUid()+'/directory';
}
*/

fb.directoryRefString = function () {
  return 'directory/' + fb.currentUid();
}

fb.directoryRef = function () {
  return fb.rootRef.child(fb.directoryRefString());
}

/*

fb.storeRefString = function () {
  return fb.currentUid() + '/s';
}
*/

fb.storeRefString = function () {
  return 's/' + fb.currentUid();
}

fb.storageRefString = function () {
  return fb.currentUid();
}

fb.svgMetadata =  {
  contentType: 'image/svg+xml'
};


fb.jsonMetadata =  {
  contentType: 'application/json'
};

fb.userRef = function () {
  return fb.rootRef.child(fb.currentUid()); 
}

//  .'s are replaced by %2E in the store; this puts the dots back in
var putInDots  = function (src) {
  for (var k in src) {
    var v = src[k];
    if (typeof v === 'object') {
      var child = src[k];
      if (child) {
        putInDots(child);
      }
    } else if (k.indexOf(pj.dotCode)>-1) {
      delete src[k];
      src[k.replace(pj.dotCode,'.')] = v;
    }
  }
  return src;
}

/* when getDirectory is called for the first time, this is detected by its lack of the value __ct3bfs4ew__ at top level
 * This special value is added, as well as some initial sample data files */

// sample data

fb.metalData = '{\n'+
'  "title":"Density in grams per cubic centimeter",\n'+
'  "fields":[{"id":"metal","type":"string"},{"id":"density","type":"number"}],\n'+
'  "elements":[["Lithium",0.53],["Copper",9],["Silver",10.5],["Gold",19.3]]\n'+
'}';


fb.tradeData = '{\n'+
'  "title":"US-China Trade Balance in Billions",\n'+
'  "fields":[\n'+
'    {"id":"year","type":"number"},\n'+
'    {"id":"Imports","type":"number"},\n'+
'    {"id":"Exports","type":"number"},\n'+
'    {"id":"Deficit","type":"number"}\n'+
'  ],\n'+
'  "elements":[[1980,291,272,19],[1995,616,535,81],[2000,1450,1073,377],[2010,2337,1842,495]]\n'+
'}';

fb.initializeStore = function (cb) {
  debugger;
  var directory =  {data:{'metal_densities.json':"1",'trade_balance.json':"1"}};
  pj.saveString('/data/metal_densities.json',fb.metalData,function() {
    pj.saveString('/data/trade_balance.json',fb.tradeData,function() {        
      if (cb) {
        cb(directory);
      }
    });
  });
}

var notSignedInDirectory = putInDots(
   {data:
     {
      'metal_densities.json':'ignored', //ignored, because when used, the data base is accessed
      'temperature.json':'ignored',
      'trade_balance.json':'ignored',
      'cayley_d3.json':'ignored'
     }
   }
);
     


fb.getDirectory = function (cb) {
 
  if (fb.directory) {
    cb(undefined,fb.directory);
    return;
  }
   if (!fb.currentUser) {
    fb.directory = notSignedInDirectory;
    cb(undefined,fb.directory);
    return;
  }
  var directoryRef = fb.directoryRef();
  directoryRef.once("value").then(function (snapshot) {
    var rs = snapshot.val();
    if (rs === null) {
      fb.initializeStore(cb);
      return;
    } else {
      fb.directory = putInDots(rs);
    }
    cb(undefined,fb.directory);
  });
}


fb.deleteFromUiDirectory = function (path) {
  var splitPath = path.split('/');
  var cd = fb.directory;
  if (!cd) {
    return;
  }
  var ln = splitPath.length;
  for (var i=1;i<ln-1;i++) {
    cd = cd[splitPath[i]];
    if (!cd) {
      return;
    }
  }
  delete cd[splitPath[ln-1]];
}


fb.deleteFromDatabase =  function (path,cb) {
  if (!fb.currentUser) {
    return;
  }
  var removePromise;
  var dotPath = path.replace('.',pj.dotCode);
  var deleteFromDirectory = function () {
    var directoryRef = fb.rootRef.child(fb.directoryRefString() + dotPath);//directoryTopRef.child(dotPath);
    var removePromise = directoryRef.remove();
    removePromise.then(function () {
      fb.deleteFromUiDirectory(path);
    });
  }
   var deleteFromStore = function () {
    var storeRef = fb.rootRef.child(fb.storeRefString()+dotPath);
    var removePromise = storeRef.remove();
    removePromise.then(function () {
      deleteFromDirectory(path);
    });
  }
  var ext = pj.afterLastChar(path,'.',true);
  if (ext) {
    fb.directoryValue(path,function (err,rs) {
      var storageRef = fb.storage.refFromURL(rs);
      var deletePromise = storageRef.delete();
      deletePromise.then(function () {
        deleteFromDirectory();
      })
    });
  } else {
    deleteFromStore();
  }
}
  


fb.addToDirectory = function (parentPath,name,link,cb) {
    if (!fb.currentUser) {
    return;
  }
  var directoryRef = fb.directoryRef();
  var uv,pRef;
  if (directoryRef) {
    pRef = directoryRef.child(parentPath);
    uv = {};
    uv[name] = link;
    pRef.update(uv,cb);
  }
}


fb.directoryValue = function (path,cb) {
  fb.getDirectory(function (err,directory) {
      cb(null,pj.evalPath(directory,path));
    });
  
  }
/*  var uid = fb.currentUser.uid;
  var directoryRef = fb.rootRef.child(fb.directoryRefString()+path.replace('.',pj.dotCode));
  directoryRef.once("value",function (snapshot) {
    var rs = snapshot.val();
    cb(null,rs);
  });
}
*/
fb.getFromStore = function (uid,path,cb) {
  var ref = fb.rootRef.child(uid+path);
  ref.once("value",function (snapshot) {
    var rs = snapshot.val();
    cb(null,rs);
  });
}

  
fb.testStore = function () {
  var uid = encodeURIComponent(fb.authData.uid);
  var directoryRef = new Firebase(fb.firebaseHome+'/'+uid+'/directory');
  directoryRef.set({});return;
  directoryRef.update({'a':'def'});
}

// decodes a pjUrl of the form [uid]/path
//if iurl has the form [uid]/whatever (a "pjUrl"), uid is taken from the path

pj.decodeUrl = function (iurl,uid) {
  var m= iurl.match(/\[(.*)\](.*)/);
  if (m) {
    return [m[1],m[2]];
  } else {
    return [uid,iurl];
  }
}


// the url for the directory side of the db (/s/...)

pj.databaseDirectoryUrl = function (ipath,iuid) {
  var uid,path;
  var durl = pj.decodeUrl(ipath);
  uid = durl[0];
  path = durl[1].replace('.',pj.dotCode)
  return 'https://prototypejungle.firebaseio.com/directory/'+uid+path+'.json';
}

// the url for the storage side of the db (/s/...),  which should be used for loading items
pj.itemUrl = function (ipath,iuid) {
  var uid,path;
  var durl = pj.decodeUrl(ipath);
  uid = durl[0];
  path = durl[1].replace('.',pj.dotCode)
  return 'https://prototypejungle.firebaseio.com/s/'+uid+path+'.json?callback=prototypeJungle.assertItemLoaded';
}



pj.storageUrl = function (ipath,iuid) {
  var uid,path;
  var durl = pj.decodeUrl(ipath,iuid);
  uid = durl[0];
  path = durl[1];
  if (uid) {
    return 'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/'+
    encodeURIComponent(uid+path)+'?alt=media';
  } else {
    return ipath;
  }
}


pj.mapUrl = pj.storageUrl; // used down in core/install.js

pj.indirectUrl = function (iurl) { // deals with urls of the form [uid]path
  if (pj.beginsWith(iurl,'[')) {

     return pj.databaseDirectoryUrl(iurl)
  }
}

//twitter%3A14822695%2Fcode%2Fc5.js?alt=media&token=8053abe2-618f-4021-8ce4-7e342a805df1
  
  
  