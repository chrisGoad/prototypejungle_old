// extensions of pj for prototypejungle  (beyond pjcs)
(function (pj) {
  var ui = pj.ui;
  
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly

//start extract


// get the  directory for this user. Create if missing.


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
  
ui.initFirebase = function () {
   firebase.initializeApp(config);
   ui.rootRef =  firebase.database().ref();
   ui.storage = firebase.storage();
   ui.storageRef = ui.storage.ref();
}
//var ref =
//var auth = firebase.auth();
/*
 * Structure: to the user, there is just one tree of objects, some of which have .svg extensions
 * In firebase, these are  stored in four places immediately under the user's uid:
 * s/ svg/ directory/s directory/svg
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

ui.storeRefString = function (svg) {
  if (ui.currentUser) {
    //var uid = 'twitter_14822695';//'t'+encodeURIComponent(ui.currentUser.uid);
    var uid = ui.currentUser.uid;
    return uid+'/s';
  }
}

ui.storageRefString = function () {
  return ui.currentUser.uid;
}

ui.svgMetadata =  {
  contentType: 'image/svg+xml',
};

ui.userRef = function () {
  if (ui.currentUser) {
     var uid = ui.currentUser.uid;
     return ui.rootRef.child(uid);
   }
}
ui.directoryRef = function () {
  var userRef = ui.userRef();
  if (userRef) {
    return userRef.child('directory');
  }
}

/*
var addExtensions1 = function (rs,src,ext) {
  var k;
  for (k in src) {
    var v = src[k];
    if (typeof v === 'object') {
      var child = rs[k];
      if (!child) {
        rs[k] = child = {};
      }
      addExtensions1(child,v,ext);
    } else {
      var key = ext?k+ext:k;
      rs[key] = 1;
    }
  }
}

// merge the directory.s and directory.svg trees, adding .svg extensions to the latter

ui.addExtensions = function (directory) {
  debugger;
  var rs = {};
  var sdir = directory.s;
  var svgdir = directory.svg;
  if (sdir) {
    addExtensions1(rs,sdir);
  }
  if (svgdir) {
    addExtensions1(rs,svgdir,'.svg');    
    //code
  }
  return rs;
}
*/

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
}`
ui.initializeStore = function (cb) {
  debugger;
  var directory = {directory:
                    {s:{data:{metal_densities:1,trade_balance:1}}},
                  s:{data:{metal_densities:ui.metalData,
                           trade_balance:ui.tradeData}
                  }};
    ui.userRef().update(directory).then(function () {
      //ui.directory = ui.addExtensions(directory);
      cb(directory)})                   
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
      /*{
        var userRef = new Firebase(ui.firebaseHome+'/'+uid)
        userRef.update({store:'empty',directory:'empty'},function () {
          console.log("store and directdory created")
          ui.directory = {};
          cb(ui.directory);
        });*/
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

ui.svgUrl = function (path,cb) {
  debugger;
  var childPath = 'svg'+path.substr(0,path.length-4);
  var directoryRef = ui.directoryRef().child(childPath);
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



//end extract

})(prototypeJungle);