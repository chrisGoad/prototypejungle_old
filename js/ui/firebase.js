// extensions of pj for prototypejungle  (beyond pjcs)
(function (pj) {
  var ui = pj.ui;
  
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly

//start extract


// get the  directory for this user. Create if missing.


 var config = {
    apiKey: "AIzaSyDCSJngwaC0I6K3QJNs4jibqmvV6Ezbvvc",
    authDomain: "protochart.firebaseapp.com",
    databaseURL: "https://protochart.firebaseio.com",
    storageBucket: "protochart.appspot.com",
  };
  
var prototypejungle_config = {
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
  
ui.initFirebase = function () {
   firebase.initializeApp(config);
   ui.rootRef =  firebase.database().ref();
   ui.storage = firebase.storage();
   ui.storageRef = ui.storage.ref();
}

/*
 * Structure: to the user, there is just one tree of objects. The underlying firebase structure is more complicated.
 * uid/directory contains an entry for every element of the tree of whatever kind. For an item at uid/directory/<path>,
 * uid/diretory/<path> holds just a 1, and uid/s/<path> holds the JSON content of the item. For other kinds of files (eg .svg and .json),
 * uid/directory/<path> holds the URL in firebase storage where the data itself is held. 
 */
ui.setCurrentUser = function (cb) {
  if (ui.currentUser) {
     if (cb) {
      cb();
     }
     return;
  }
  var  auth = firebase.auth();
  ui.currentUser = auth.currentUser;
  if (!ui.currentUser) {
    auth.onAuthStateChanged(function(user) {
      ui.currentUser = user;
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
ui.removeUser = function () {
 if (ui.currentUser) {
    var uid = encodeURIComponent(ui.currentUser.uid);
    var userRef = ui.rootRef.child(uid);
    userRef.remove();
 }
}

ui.directoryRefString = function () {
   if (ui.currentUser) {
    var uid = ui.currentUser.uid;
    return uid+'/directory';
  }
}

ui.directoryRef = function () {
  return ui.rootRef.child(ui.directoryRefString());
}

ui.storeRefString = function () {
  if (ui.currentUser) {
    var uid = ui.currentUser.uid;
    return uid+'/s';
  }
}


ui.storageRefString = function () {
  return ui.currentUser.uid;
}

ui.svgMetadata =  {
  contentType: 'image/svg+xml'
};


ui.jsonMetadata =  {
  contentType: 'application/json'
};

ui.userRef = function () {
  if (ui.currentUser) {
     var uid = ui.currentUser.uid;
     return ui.rootRef.child(uid);
   }
}

//  .'s are replaced by %2E in the store; this puts the dots back in
var putInDots  = function (src) {
  for (k in src) {
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
/*
ui.metalData = `{
  "title":"Density in grams per cubic centimeter",
  "fields":[{"id":"metal","type":"string"},{"id":"density","type":"number"}],
  "elements":[["Lithium",0.53],["Copper",9],["Silver",10.5],["Gold",19.3]]
}`;


ui.tradeData = `{
  "title":"US-China Trade Balance in Billions",
  "fields":[
    {"id":"year","type":"number"},
    {"id":"Imports","type":"number"},
    {"id":"Exports","type":"number"},
    {"id":"Deficit","type":"number"}
  ],
  "elements":[[1980,291,272,19],[1995,616,535,81],[2000,1450,1073,377],[2010,2337,1842,495]]
}`;
*/
// ui.tradeData = `whatever`; breaks minify
ui.metalData = '{\n'+
'  "title":"Density in grams per cubic centimeter",\n'+
'  "fields":[{"id":"metal","type":"string"},{"id":"density","type":"number"}],\n'+
'  "elements":[["Lithium",0.53],["Copper",9],["Silver",10.5],["Gold",19.3]]\n'+
'}';


ui.tradeData = '{\n'+
'  "title":"US-China Trade Balance in Billions",\n'+
'  "fields":[\n'+
'    {"id":"year","type":"number"},\n'+
'    {"id":"Imports","type":"number"},\n'+
'    {"id":"Exports","type":"number"},\n'+
'    {"id":"Deficit","type":"number"}\n'+
'  ],\n'+
'  "elements":[[1980,291,272,19],[1995,616,535,81],[2000,1450,1073,377],[2010,2337,1842,495]]\n'+
'}';

ui.initializeStore = function (cb) {
  debugger;
 // var directory = {directory:
  var directory =  {data:{'metal_densities.json':1,'trade_balance.json':1}};
//                  s:{data:{metal_densities:ui.metalData,
//                           trade_balance:ui.tradeData}
//                  };
   // ui.userRef().update(directory).then(function () {
      //ui.directory = ui.addExtensions(directory);
      pj.saveString('/data/metal_densities.json',ui.metalData,function() {
        pj.saveString('/data/trade_balance.json',ui.tradeData,function() {        
          cb(directory)});
      });
      //cb(directory)})                  
}

ui.getDirectory = function (cb) {
  debugger;
  if (ui.directory) {
    cb(ui.directory);
    return;
  }
  var directoryRef = ui.directoryRef();
  if (directoryRef) {
    directoryRef.once("value").then(function (snapshot) {
      
      var rs = snapshot.val();
      if (rs === null) {
        ui.initializeStore(cb);
        return;
      } else {
        ui.directory = putInDots(rs);//rs.s)//ui.addExtensions(rs);
        debugger;
      }
       // console.log('directory found');
        //ui.directory = (ui.directory === 'empty')?{}:ui.directory;
      cb(ui.directory);
    });
  } else {
    ui.directory = undefined;
    cb(undefined);
    
  }
}


ui.deleteFromUiDirectory = function (path) {
  debugger;
  var splitPath = path.split('/');
  var cd = ui.directory;
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


ui.deleteFromDatabase =  function (path,cb) {
  debugger;
  var removePromise;
  //var directoryTopRef = ui.directoryRef();
  var dotPath = path.replace('.',pj.dotCode);
  var deleteFromDirectory = function () {
    var directoryRef = ui.rootRef.child(ui.directoryRefString() + dotPath);//directoryTopRef.child(dotPath);
    var removePromise = directoryRef.remove();
    removePromise.then(function () {
      debugger;
      ui.deleteFromUiDirectory(path);
    });
  }
   var deleteFromStore = function () {
    var storeRef = ui.rootRef.child(ui.storeRefString()+dotPath);
    //var storeRef = ui.storeRef().child(dotPath);
    var removePromise = storeRef.remove();
    removePromise.then(function () {
      debugger;
      deleteFromDirectory(path);
    });
  }
  var ext = pj.afterLastChar(path,'.',true);
  if (ext) {
    ui.directoryValue(path,function (err,rs) {
      debugger;
      var storageRef = ui.storage.refFromURL(rs);
      var deletePromise = storageRef.delete();
      deletePromise.then(function () {
        debugger;
        deleteFromDirectory();
      })
    });
  } else {
    deleteFromStore();
  }
}
  


ui.addToDirectory = function (parentPath,name,link,cb) {
  //var isSvg = pj.endsIn('.svg');
  var directoryRef = ui.directoryRef();
  var uv,pRef;
  if (directoryRef) {
    pRef = directoryRef.child(parentPath);
    uv = {};
    //var name = isSvg?pj.beforeLastChar(iname,'.'):iname;
    uv[name] = link;
    pRef.update(uv,cb);
  }
}


ui.directoryValue = function (path,cb) {
  debugger;
  var uid = ui.currentUser.uid;
  //var dburl = pj.databaseUrl(uid,path)'?callback=pj.returnStorage'
  //var childPath = 'svg'+path.substr(0,path.length-4);
  var directoryRef = ui.rootRef.child(ui.directoryRefString()+path.replace('.',pj.dotCode));
  directoryRef.once("value",function (snapshot) {
    debugger;
    var rs = snapshot.val();
    cb(null,rs);
  });
}

ui.getFromStore = function (uid,path,cb) {
  var ref = ui.rootRef.child(uid+path);
  ref.once("value",function (snapshot) {
    var rs = snapshot.val();
    cb(null,rs);
  });
}

  
ui.testStore = function () {
  var uid = encodeURIComponent(ui.authData.uid);
  var directoryRef = new Firebase(ui.firebaseHome+'/'+uid+'/directory');
  directoryRef.set({});return;
//return;
  directoryRef.update({'a':'def'});
}


pj.databaseUrl = function (uid,path) {
  return 'https://protochart.firebaseio.com/'+uid+'/directory'+path+'.json';//.replace('.',pj.dotCode)
}
pj.indirectUrl = function (iurl) { // deals with urls of the form [uid]path
  if (pj.beginsWith(iurl,'[')) {
    var closeBracket = iurl.indexOf(']');
    var uid = iurl.substr(1,closeBracket-1);
    var path = iurl.substring(closeBracket+1).replace('.',pj.dotCode)
     return pj.databaseUrl(uid,path)
    //return {uid:uid,path:path,url:pj.databaseUrl(uid,path)};
  }
}
//end extract

})(prototypeJungle);