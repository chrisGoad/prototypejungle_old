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
     cb();
     return;
  }
  var  auth = firebase.auth();
  ui.currentUser = auth.currentUser;
  if (!ui.currentUser) {
    debugger;
    auth.onAuthStateChanged(function(user) {
      debugger;
      ui.currentUser = user;
      cb();
    });
    return;
  }
  cb();
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
    return uid+(svg?'/svg':'/s');
  }
}

ui.storageRefString = function () {
  return ui.currentUser.uid;
}

ui.svgMetadata =  {
  contentType: 'image/svg+xml',
};

ui.directoryRef = function () {
   if (ui.currentUser) {
    //var uid = 'twitter_14822695';//'t'+encodeURIComponent(ui.currentUser.uid);
    var uid = ui.currentUser.uid;
    return ui.rootRef.child(uid+'/directory');
   }
}


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
ui.getDirectory = function (cb) {
  debugger;
  if (ui.directory) {
    cb(ui.directory);
    return;
  }
  var directoryRef = ui.directoryRef();
  if (directoryRef) {
    directoryRef.once("value",function (snapshot) {
      var rs = snapshot.val();
      if (rs === null) {
        ui.directory = {};
      /*{
        var userRef = new Firebase(ui.firebaseHome+'/'+uid)
        userRef.update({store:'empty',directory:'empty'},function () {
          console.log("store and directdory created")
          ui.directory = {};
          cb(ui.directory);
        });*/
      } else {
        ui.directory = ui.addExtensions(rs);
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

ui.addToDirectory = function (parentPath,iname,cb) {
  var isSvg = pj.endsIn('.svg');
  var directoryRef = ui.directoryRef();
  var pRef,uv,name,v;
  if (directoryRef) {
    pRef = directoryRef.child((isSvg?'svg':'s')+parentPath);
    uv = {};
    var name = isSvg?pj.beforeLastChar(iname,'.'):iname;
    uv[name] = 1;
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
  
ui.testStore = function () {
  var uid = encodeURIComponent(ui.authData.uid);
  var directoryRef = new Firebase(ui.firebaseHome+'/'+uid+'/directory');
  directoryRef.set({});return;
//return;
  directoryRef.update({'a':'def'});
}



//end extract

})(prototypeJungle);