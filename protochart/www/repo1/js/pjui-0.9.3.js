(function (pj) {

var geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,ui=pj.ui;
"use strict"

debugger;
var html =  pj.set("html",pj.Object.mk());

html.__builtIn = true;

html.set("Element",Object.create(dom.Element)).__namedType(); // dom elements other than svg

var htag = html.set("tag",pj.Object.mk());
htag.set("html",html.Element.instantiate()).__namedType();// the top level doc
htag.set("head",html.Element.instantiate()).__namedType();
htag.set("body",html.Element.instantiate()).__namedType();
htag.set("div",html.Element.instantiate()).__namedType();
htag.set("span",html.Element.instantiate()).__namedType();
htag.set("select",html.Element.instantiate()).__namedType();
htag.set("option",html.Element.instantiate()).__namedType();
htag.set("pre",html.Element.instantiate()).__namedType();
htag.set("img",html.Element.instantiate()).__namedType();
htag.set("p",html.Element.instantiate()).__namedType();
htag.set("a",html.Element.instantiate()).__namedType();
htag.set("input",html.Element.instantiate()).__namedType();
htag.set("iframe",html.Element.instantiate()).__namedType();
htag.set("textarea",html.Element.instantiate()).__namedType();

htag.textarea.set("attributes",pj.lift({rows:"S",cols:"S"}));

htag.select.set("attributes",pj.lift({selectedindex:"N"}));
htag.option.set("attributes",pj.lift({selected:"N"}));

html.commonAttributes = {"href":"S","type":"S","value":"S","src":"S","width":"S","height":"S","scrolling":"S"};

html.Element.__mkFromTag = function (tag) {
  var tv,rs;
  if (tag) {
    tv = html.tag[tag];
  }
  if (tv) {
    rs  = Object.create(tv);
    rs.set("_eventListeners",pj.Object.mk());
  } else {
    pj.error("This html tag is not implemented",tag);
  }
  return rs;
}
  
  
html.wrap = function (nm,tg,prps) {
  var el,rs;
  if (nm) {
    el = document.getElementById(nm);
  }
  if (el) {
    if (tg !== el.tagName.toLowerCase()) {
      pj.error('Tag mismatch for wrap of ',nm);
      return;
    }
  }    
  rs = dom.Element.__mkFromTag(tg);
  pj.setProperties(rs,prps);
  if (el) rs.__element = el;
  rs.__wraps = nm;
  return rs;
}

/* this will be used for compatability with old scheme for a while */
  
html.Element.addChild = function (a1,a2) {
  var ch;
  if (a2 === undefined) {
    ch = a1;
    if (!ch) {
      debugger;
    }
    if (ch.__get("__name")) {
      this.set(ch.__name,ch);
    } else {
      this.push(ch);
    }
  } else {
    this.set(a1,a2);
  }
  return this;
}

html.Element.addChildren = function (ch) {
  var thisHere = this;
  ch.forEach(function (c) {
    thisHere.addChild(c);
  });
  return this;
}
  
  
html.Element.mk = function (s,inheritFrom) {
  var rs;
  if (s) {
    rs = dom.parseWithDOM(s,false);
  }
  if (!rs) {
    debugger;
  }
  return rs;
}
  
html.Element.$html = function (h) {
  var eel = this.__element;
  var txt;
  if (typeof h === 'string') {
    this.text = h;
    if (eel) { 
      eel.innerHTML = h;
    }
  } else { 
    if (eel) {
      txt = eel.innerHTML;
      this.text = txt;
      return txt;
    }
  }
}
  
html.Element.$focus = function () {
  var eel = this.__element;
  if (eel) {
    eel.focus();
  }
}
  
    
html.Element.$select = function () {
  var eel = this.__element;
  if (eel) {
    eel.select();
  }
}
  
  
  
html.styleToString = function (st) {
  var prps=Object.getOwnPropertyNames(st);
  var rs = "";
  var cl = prps.map(function (p) {return '"'+prp+'":"'+st[prp]+'"'});
  return cl.join(";");
}
  

html.Element.$css = function (ist,v) {
  var cst = dom.getStyle(this);
  var eel,st,prps;
  if (typeof ist === "string") {
    if (v) {
      cst[ist] = v;
      eel =  this.__element;
      if (eel) {
        eel.style[ist] = v;
      }
      return;
    }
    st = dom.parseStyle(ist);
  } else {
    st = ist;
  }
  prps=Object.getOwnPropertyNames(st);
  prps.forEach(function (p) {cst[p] = st[p]});
  this.__setStyle();
}

html.Element.$attr = function (att,v) {
  var prps;
  if (typeof att==="string") {
    this.__setAttribute(att,v);
  } else {
    prps=Object.getOwnPropertyNames(att);
    prps.forEach(function (p) {el[p] = att[p]});
    this.__setAttributes();
  }
}

  
html.Element.$prop= function (p,v) {
  var eel;
  this[p] = v;
  eel = this.__element;
  if (eel) {
    eel[p] = v;
  }
}


html.Element.$setStyle = function (att,value) {
  var cst = dom.getStyle(this);
  var eel;
  cst[att] = value;
  eel = this.__element;
  if (eel) {
    eel.style[att] = value;
  }
}

html.Element.$hide = function () {
  this.$setStyle('display','none');
  /*return;
  var cst = dom.getStyle(this);
  var eel;
  cst.display = "none";
  eel = this.__element;
  if (eel) {
    eel.style.display = "none";
  }*/
}

html.Element.$show = function () {
  this.$setStyle('display','');
  /*return;
  var cst = dom.getStyle(this);
  var eel;
  cst.display = "";
  eel = this.__element;
  if (eel) {
    eel.style.display = "";
  }*/
}

html.Element.setVisibility = function (v) {
  if (v) {
    this.$show();
  } else {
    this.$hide();
  }
}


html.Element.$click = function (fn) {
  this.addEventListener("click",fn);
}


html.Element.$mouseup = function (fn) {
  this.addEventListener("mouseup",fn);
}
  
  
html.Element.$change = function (fn) {
  this.addEventListener("change",fn);
}


html.Element.$enter = function (fn) {
  this.addEventListener("enter",fn);
}
  
  
  
html.Element.$dblclick = function (fn) {
   this.addEventListener("dblclick",fn);
}
  
  
html.Element.$offset = function () {
  var eel = this.__element;
  var rect,x,y;
  if (eel) {
    rect = eel.getBoundingClientRect();
    y = rect.top + document.body.scrollTop;
    x = rect.left + document.body.scrollLeft;
    return geom.Point.mk(x,y);
  }
}
  
dom.Element.$height = function () {
  var eel = this.__element;
  if (eel) {
    return eel.offsetHeight;
  }
}


dom.Element.$width = function () {
  var eel = this.__element;
  if (eel) {
    return eel.offsetWidth;
  }
}
  
html.Element.$prop = function (nm,v) {
  var eel = this.__element;
  if (eel !== undefined) {
    if (v !== undefined) {
      eel[nm] = v;
    } else {
      return eel[nm];
    }
  }
}
  
html.Element.$empty = function () {                            
  this.$html('');
  this.__iterDomTree(function (ch) {
    ch.remove();
  },true); // iterate over objects only
}


// svg serialization:for writing out the svg dom as a string, so that it can be shown independent of prototypejungle
/* Example use:
  pj.svg.main.svgString(200,10);
*/
svg.toPointsString = function (pnts) {
  var rs = "";
  var numd = 4;
  var first = true;
  pnts.forEach(function (p) {
    if (!first) rs += " ";
    first = false;
    rs += pj.nDigits(p.x,numd)+","+pj.nDigits(p.y,numd);
  });
  return rs;
}
  // for the outermost g, a transform is sent in
svg.tag.g.svgStringR = function (dst,itr) {
  var tr;
  if (this.__hidden()) {
    return;
  }
  if (itr) {
    dst[0] += '<g id="outerG" '+itr+'>\n';
  } else {
    tr = this.transform;
    if (tr) {
      dst[0] +="<g "+tr.svgString()+">\n";
    } else {
      dst[0] += "<g>\n";
    }
  }
  this.__iterDomTree(function (ch) {
    if (pj.Array.isPrototypeOf(ch) || svg.Element.isPrototypeOf(ch)) {
      ch.svgStringR(dst);
    }
  });
  dst[0] += "\n</g>\n";
}
  
  
  
pj.Array.svgStringR = svg.tag.g.svgStringR;

svg.tag.g.svgString = function () {
  var dst = [""];
  this.svgStringR(dst);
  return dst[0];
}
  
 
svg.genFitfun = function (bnds) {
  var rs = "function fit() {\n";
  rs += ' var ff = 0.90;\n';
  rs += '  var wd = '+bnds.extent.x+';\n';
  rs += '  var ht = '+bnds.extent.y+';\n';
  rs += '  var xtr = '+bnds.corner.x+'-(0.5*wd*(1-ff));\n';
  rs += '  var ytr = '+bnds.corner.y+'-(0.5*ht*(1-ff));\n';
  rs += '  var wnwd = window.innerWidth;\n';
  rs += '  var wnht = window.innerHeight*(0.90);\n';
  rs += '  var swd = wnwd/wd;\n';
  rs += '  var sht = wnht/ht;\n';
  rs += '  var s = Math.min(swd,sht)*ff;\n';
  rs += '  var og = document.getElementById("outerG");\n';
  rs += '  og.setAttribute("transform","translate("+(-xtr*s)+" "+(-ytr*s)+") scale("+s+")");\n';
  rs += '}\n'
  return rs;
}
  
svg.genHtmlPreamble = function (bnds) {
  var rs = "<!DOCTYPE html>\n";
  rs += '<html>\n<body style="overflow:hidden">\n<script>\n';
  rs += '</script>\n';
  return rs;
}

svg.Root.aspectRatio= function () {
  var cn = this.contents;
  cn.__removeIfHidden(); 
  var bnds = cn.__bounds();
  var ex = bnds.extent;
  return ex.x/ex.y;  
}

 // write out a complete svg file for this root
svg.Root.svgString = function (viewWd,padding,aspectRatio) {
 // var ff = 0.8;
 // var pd = (1 - ff)/2
 alert(aspectRatio);
  var cn = this.contents;
  cn.__removeIfHidden(); 
  var bnds = cn.__bounds();
  var ex = bnds.extent;
  var ar = aspectRatio?aspectRatio:ex.x/ex.y;
  var viewHt = viewWd / ar;    
  var color = pj.root.backgroundColor;
  var destrect = geom.Rectangle.mk(geom.Point.mk(padding*ar,padding),geom.Point.mk(viewWd-2*ar*padding,viewHt-2*padding));
  var tr = 'transform = "'+bnds.transformTo(destrect).toSvg()+'"';
  var rs = '<svg id="svg" baseProfile="full" xmlns="http://www.w3.org/2000/svg" version="1.1" ';
  if (color) {
    rs += 'style = "background:'+color+'" ';
  }
  rs += 'viewBox="0 0 '+ viewWd + ' ' + viewHt + '">\n';
  var dst = [rs];
  this.contents.svgStringR(dst,tr);
  dst += '</svg>';
  return dst;
}
 
 //======= end serialize svg
 
 
  

pj.sessionId = function () {
  var pjkey = localStorage.pjkey;
  var tm = Math.floor(new Date().getTime()/1000000);
  var md5 =  CryptoJS.MD5(pjkey+tm);
  var sid = CryptoJS.enc.Hex.stringify(md5);
  return sid; 
}
pj.ajaxPost = function (url,idata,callback,ecallback) {
  var dataj,data,sid,wCallback;
  if (typeof idata === "string") {
    dataj = idata;
  } else {
    data = idata?idata:{};
    if (!pj.noSession) {
      sid = pj.sessionId();
      if (sid) {
        data.sessionId = sid;
        data.userName = localStorage.userName;
      }
    }
    dataj = JSON.stringify(data);
  }
  pj.log("ajax","url",url,"dataj",dataj);
  if (!ecallback) {
    ecallback = function (rs,textStatus,v) {
      callback({status:"fail",msg:"systemDown"});
    }
 }
 var wCallback = function (rs) {
  pj.log("ajax",url,"returned ",rs,callback);
  if (rs.status === "ok") {
    localStorage.lastSessionTime = pj.seconds();
  }
  callback(rs);
 }
 $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
       success:wCallback,error:ecallback});
 return;
}
  



pj.seconds = function () {
  return Math.floor(new Date().getTime()/1000);
}
// remaining session time
pj.rst= function () {
  if (localStorage.sessionId) {
    var ltm = localStorage.lastSessionTime;
    if (ltm) {
      return pj.seconds() - ltm;
    }
  }
}

pj.storageVars = ['sessionId'];
  
  
pj.checkUp = function (cb) {
  pj.ajaxPost('/api/checkUp',{},function (rs) {
    cb(rs);
  },function (rs) {
    cb({status:"fail",msg:"systemDown"});
  });
}



/*
 * Prototypejungle items can be embedded in pages via iframes. This file provides support
 * for communication with the item via HTML5's postMessage mechanism.
 * An item should have a __commandInterpreter method if it wishes to interpret incoming messages,
 * Conversely, the containing page should listen for messages with origin http://prototypejungle.org.
 */

ui.initPoster = function (item) {
  //  expected message: {apiCall:,postData:,opId:} opid specifies the callback
  window.addEventListener("message",function (event) {
    var cmi = pj.root.__commandInterpreter;
    if (cmi) {
      var jdt = event.data;
      var data = JSON.parse(jdt);
  cmi(data);
    }
  });
}

  
  

ui.postMessage = function(msg) {
  // dont send a message to yourself
  if (window !== window.parent) {
    window.parent.postMessage(msg,"*");
  }
}

if (!ui) {
  ui = pj.set("ui",pj.Object.mk());
}
ui.firebaseHome = "https://prototypejungle.firebaseio.com";
ui.sessionTimeout = 24 * 60 * 60;
//ui.useCloudFront =  0;
//ui.useS3 = 1;
//ui.cloudFrontDomain = "d2u4xuys9f6wdh.cloudfront.net";
//ui.s3Domain = "prototypejungle.org.s3.amazonaws.com";
//ui.messageCallbacks = {};   // for communication between pages on prototypejungle.org, and prototype-jungle.org
//ui.itemDomain = ui.useCloudFront?"d2u4xuys9f6wdh.cloudfront.net":"prototypejungle.org";

//ui.setUIconstants = function () {
//ui.atLive = location.href.indexOf('http://prototype-jungle.org')===0;
//ui.liveDomain = pj.devVersion?"prototype-jungle.org:8000":"prototype-jungle.org";
//ui.useMinified = !pj.devVersion;
//if (pj.devVersion) {
//  ui.homePage = "/indexd.html";
//}
//}

ui.homePage = "";
//pj.activeConsoleTags = (ui.isDev)?["error","updateError","installError"]:["error"];//,"drag","util","tree"];



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
  contentType: 'image/svg+xml',
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
'  "title":"Density in grams per cubic centimeter"\n'+
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


/*
ui.toItemDomain = function (url) {
  var dm;
  if (ui.useCloudFront || ui.useS3) {
    dm = ui.useCloudFront?ui.cloudFrontDomain:ui.s3Domain;
    return url.replace("prototypejungle.org",dm);
  } else {
    return url;
  }
}
*/
//ui.itemHost = "http://"+ui.itemDomain;//"http://prototypejungle.org";
// this is used in install when the s3Domain is wanted
/*
pj.urlMap = function (u) {
  return u.replace(ui.itemDomain,ui.s3Domain);
}
pj.inverseUrlMap = function (u) {return u.replace(ui.s3Domain,ui.itemDomain);}
*/
pj.defineFieldAnnotation("Note");

ui.setNote = function (nd,prop,nt) {
  nd.__setNote(prop,nt);
}



pj.defineFieldAnnotation("FieldType");

pj.defineFieldAnnotation('UIStatus'); // the status of this field
pj.defineFieldAnnotation('InstanceUIStatus');// the status of fields that inherit from this one - ie properties of instances.
pj.defineFieldAnnotation("UIWatched");

/* @remove
ui.watch = function (nd,k) {
  if (typeof k === "string") {
    nd.__setUIWatched(k,1);
  } else {
    k.forEach(function (j) {
      nd.__setUIWatched(j,1);
    });
  }
}*/
  
 
  
  // when a mark is instantiated, some of its fields are should not be modified in the instance,
  // though they may be in the prototype
  
pj.Object.__fieldIsHidden = function (k) {
  var status,proto,istatus;
  if (pj.ancestorHasOwnProperty(this,"__hidden")) return true;
  if (this.__mark) {
    proto = Object.getPrototypeOf(this);
    istatus = proto.__getInstanceUIStatus(k);
    if (istatus === 'hidden') return true;
    if (istatus !== undefined) return false;
  }
  status = this.__getUIStatus(k);
  return status  === "hidden";
}

pj.Object.__fieldIsFrozen = function (k) {
  var status,proto;
  if (ui.devNotSignedIn) {  // dev mode, no draw, no edit either 
    return true;
  }
  if (pj.ancestorHasOwnProperty(this,"__frozen")) return true;
  status = this.__getUIStatus(k);
  if (status === "liquid") {
    return false;
  }
  if (k && (!this.__mark)&& (!this.__markProto) && pj.isComputed(this,k)) {
    return true;
  }
  if (status === "frozen") {
    return true;
  }
  proto = Object.getPrototypeOf(this);
  status = proto.__getInstanceUIStatus(k);
  return (status === 'frozen');
}
 
// a field can be frozen, liquid, hidden, (or neither).  Hidden fields do not even appear in the UI.
  // Frozen fields cannot be modified from the UI. liquid fields can be modified
  // from the UI even if they are fields of computed values.
  
ui.freeze = function (nd,flds) {
  var tpf = typeof flds;
  if (tpf==="undefined") {
    nd.__frozen__ = true;
  } else if (tpf==="string") {
    nd.__setUIStatus(flds,"frozen");
  } else {
    flds.forEach(function (k) {
      nd.__setUIStatus(k,"frozen");
   });
  }
}
  
  
ui.freezeInInstance = function (nd,flds) {
  var tpf = typeof flds;
  if (tpf==="undefined") {
    nd.__frozen__ = true;
  } else if (tpf==="string") {
    nd.__setInstanceUIStatus(flds,"frozen");
  } else {
    flds.forEach(function (k) {
      nd.__setInstanceUIStatus(k,"frozen");
   });
  }
}
/*
 * melt is used to allow access to properties of marks, all of whose properties are
 * frozen by default (since they are computed)
 */
ui.melt = function (nd,flds) {
  var tpf = typeof flds;
  if (tpf==="string") {
    nd.__setUIStatus(flds,"liquid");
  } else {
    flds.forEach(function (k) {
      nd.__setUIStatus(k,"liquid");
   });
  }
}
  
  
  
ui.hide = function (nd,flds) {
  if (typeof flds === "string") {
    nd.__setUIStatus(flds,"hidden");
  } else {
    flds.forEach(function (k) {
      nd.__setUIStatus(k,"hidden");
   });
  }
}


ui.show = function (nd,flds) {
  if (typeof flds === "string") {
    nd.__setUIStatus(flds,"shown");
  } else {
    flds.forEach(function (k) {
      nd.__setUIStatus(k,"shown");
   });
  }
}

var propertiesExcept = function (nd,flds) {
  var fob = {};
  var allProps = pj.treeProperties(nd,true);
  var rs = [];
  flds.forEach(function (f) {
    fob[f] = true;
  })
  allProps.forEach(function (p) {
    if (!fob[p]) {
      rs.push(p);
    }
  });
  return rs;
}
ui.hideExcept = function (nd,flds) {
  ui.hide(nd,propertiesExcept(nd,flds));
}

ui.freezeExcept = function (nd,flds) {
  ui.freeze(nd,propertiesExcept(nd,flds));
}
  
  
ui.hideInInstance = function (nd,flds) {
  var tpf = typeof flds;
  if (tpf==="undefined") {
    nd.__frozen__ = true;
  } else if (tpf==="string") {
    nd.__setInstanceUIStatus(flds,"hidden");
  } else {
    flds.forEach(function (k) { 
      nd.__setInstanceUIStatus(k,"hidden");
   });
  }
}
  
  
pj.defineFieldAnnotation('OutF');


pj.Object.__setOutputF = function (k,lib,fn) {
  var pth = pj.pathToString(lib.__pathOf(pj));
  var fpth = pth+"/"+fn;
  this.__setOutF(k,fpth);
}


pj.Object.__getOutputF = function (k) {
  //var nm = "__outputFunction__"+k;
  var pth = this.__getOutF(k);
  if (pth) return pj.__evalPath(pj,pth);
}

pj.Array.__getOutputF = function (k) {
  return undefined;
}
  
  
pj.applyOutputF = function(nd,k,v) {
  var outf,ftp;
  if (pj.Array.isPrototypeOf(nd)) {
    return v;
  }
  outf = nd.__getOutputF(k);
  if (outf) {
    return outf(v,nd);
  } else {
    ftp = nd.__getFieldType(k);
    return v;
  }
}

pj.applyInputF = function(nd,k,vl) {
  var ftp = nd.__getFieldType(k);
  var cv,n;
  if (ftp === 'boolean') { 
    if ((typeof vl === "string") && ($.trim(vl) === 'false')) {
      return false;
    }
    return Boolean(vl);
  }
  cv = nd[k];  
  if (typeof cv === "number") {
    n = parseFloat(vl);
    if (!isNaN(n)) {
      return n;
    }
  }
  return vl;
}
  
  
  
  ui.objectsModifiedCallbacks = [];
  
  ui.assertObjectsModified = function() {
    pj.root.__objectsModified = true;
    ui.objectsModifiedCallbacks.forEach(function (fn) {fn()});
  }
  
  
//   from http://paulgueller.com/2011/04/26/parse-the-querystring-with-jquery/
ui.parseQuerystring = function(){
  var nvpair = {};
  var qs = window.location.search.replace('?', '');
  var pairs = qs.split('&');
  pairs.forEach(function(v){
    var pair = v.split('=');
    if (pair.length>1) {
      nvpair[pair[0]] = pair[1];
    }
  });
  return nvpair;
}
  
  
// n = max after decimal place; @todo adjust for .0000 case
pj.nDigits = function (n,d) {
  var ns,dp,ln,bd,ad;
  if (typeof n !=="number") return n;
  ns = String(n);
  dp = ns.indexOf(".");
  if (dp < 0) return ns;
  ln = ns.length;
  if ((ln - dp -1)<=d) return ns;
  bd = ns.substring(0,dp);
  ad = ns.substring(dp+1,dp+d+1)
  return bd + "." + ad;
}
  
  
ui.disableBackspace = function () {
  //from http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back
  var rx = /INPUT|SELECT|TEXTAREA/i;
  $(document).bind("keydown keypress", function(e){
    if( e.which === 8 ){ // 8 === backspace
      if(!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly ){
        e.preventDefault();
      }
    }
  });
}

  
  // name of the ancestor just below pj; for tellling which top level library something is in 
 pj.nodeMethod("__topAncestorName",function (rt) {
   var pr;
   if (this === rt) return undefined;
   pr = this.__get('__parent');
   if (!pr) return undefined;
   if (pr === rt) return this.name;
   return pr.__topAncestorName(rt);
 });
 
  
// used eg for iterating through styles. Follows the prototype chain, but stops at objects in the core
// sofar has the properties where fn has been called so far
pj.Object.__iterAtomicNonstdProperties = function (fn,allowFunctions,isoFar) {
  var soFar = isoFar?isoFar:{};
  var op,thisHere,pr;
  if (!this.__inCore || this.__inCore()) return;
  op = Object.getOwnPropertyNames(this);
  var thisHere = this;
  forEach(function (k) {
    var v,tpv;
    if (pj.internal(k) || soFar[k]) return;
    soFar[k] = true;
    v = thisHere[k];
    tpv = typeof v;
    if (v && (tpv === "object" )||((tpv==="function")&&!allowFunctions)) return;
    fn(v,k);
  });
  var pr = Object.getPrototypeOf(this);
  if (pr && pr.__iterAtomicNonstdProperties) {
    pr.__iterAtomicNonstdProperties(fn,allowFunctions,soFar);
  }
}
  
  // an atomic non-internal property, or tree property
 var properProperty = function (nd,k,knownOwn) {
   var v,tp;
   if (!knownOwn &&  !nd.hasOwnProperty(k)) return false;
   if (pj.internal(k)) return false;
   v = nd[k];
   tp = typeof v;
   if ((tp === "object" ) && v) {
     return pj.isNode(v) && (v.__parent === nd)  && (v.__name === k);
   } else {
     return true;
   }
 };
  
// only include atomic properties, or __properties that are proper treeProperties (ie parent child links)
// exclude internal names too
pj.ownProperProperties = function (rs,nd) {
  var nms = Object.getOwnPropertyNames(nd);
  nms.forEach(function (nm) {
    if (properProperty(nd,nm,true)) rs[nm] = 1;
  });
  return rs;
}
  
// this stops at the core modules (immediate descendants of pj)
function inheritedProperProperties(rs,nd) {
  var nms;
  if (!nd.__inCore || nd.__inCore()) return;
  nms = pj.ownProperProperties(rs,nd);
  inheritedProperProperties(rs,Object.getPrototypeOf(nd));
}
 
 
  
pj.Object.__iterInheritedItems = function (fn,includeFunctions,alphabetical) {
  var thisHere = this,ip,keys;
  function perKey(k) {
    var kv = thisHere[k];
    if ((includeFunctions || (typeof kv != "function")) ) {
      fn(kv,k);
    }
  }
  ip = {};
  inheritedProperProperties(ip,this);
  keys = Object.getOwnPropertyNames(ip);
  if (alphabetical) {
    keys.sort();
  }
  keys.forEach(perKey);
  return this;
}
  
  
  
  pj.Array.__iterInheritedItems = function (fn) {
    this.forEach(fn);
    return this;
  }
  
  // is this a property defined in the core modules. 
 pj.Object.__coreProperty = function (p) {
   var proto,crp;
   if (pj.ancestorHasOwnProperty(this,"__builtIn")) {
     return true;
   }
   if (this.hasOwnProperty(p)) return false;
   proto = Object.getPrototypeOf(this);
   crp = proto.__coreProperty;
   if (crp) {
     return proto.__coreProperty(p);
   }
 }
 
 pj.Array.__coreProperty = function (p) {}

pj.nodeMethod("__treeSize",function () {
  var rs = 1;
  pj.forEachTreeProperty(this,function (x) {
    if (x && (typeof x==="object")) {
      if (x.__treeSize) {
        rs = rs + x.__treeSize() + 1;
      } 
    } else {
      rs++;
    }
  });
  return rs;
});

  
// __get the name of the nearest proto declared as a tyhpe for use in tree browser
pj.Object.__protoName = function () {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent;
  var rs,nm;
  if (!pr) return "";
  if (p.__get('__isType')) {
    var nm = p.name();
    rs = nm?nm:"";
  } else {
    rs = p.__protoName();
  }
  return rs;

}

  
pj.Array.__protoName = function () {
  return "Array";
}



pj.Object.__hasTreeProto = function () {
 var pr = Object.getPrototypeOf(this);
 return pr && (pr.__parent);
}

Function.prototype.__hasTreeProto = function () {return false;}

pj.Array.__hasTreeProto = function () {
  return false;
}
  
  
  
// how many days since 7/19/2013
pj.dayOrdinal = function () {
  var d = new Date();
  var o = Math.floor(d.getTime()/ (1000 * 24 * 3600));
  return o - 15904;
}

pj.numToLetter = function (n,letterOnly) {
  // numerals and lower case letters
  var a;
  if (n < 10) {
    if (letterOnly) {
      a = 97+n;
    } else {
      a = 48 + n;
    }
  } else  {
    a = 87 + n;
  }
  return String.fromCharCode(a);
}
pj.randomName  = function () {
  var rs = "i";
  for (var i=0;i<9;i++) {
    rs += pj.numToLetter(Math.floor(Math.random()*35),1);
  }
  return rs;
}
 
// omits initial "/"s. Movethis?
pj.pathToString = function (p,sep) {
  var rs,ln,rs,e;
  if (!sep) sep = "/";
  ln = p.length;
  if (sep===".") {
    rs = p[0];
    for (var i=1;i<ln;i++) {
      e = p[i];
      if (typeof e==="number") {
        rs = rs+"["+e+"]";
      } else {
        rs = rs +"."+e;
      }
    }
  } else {
    rs = p.join(sep);
  }
  if (ln>0) {
    if (p[0]===sep) return rs.substr(1);
  }
  return rs;
}


pj.matchesStart = function (a,b) {
  var ln = a.length;
  var i;
  if (ln > b.length) return false;
  for (i=0;i<ln;i++) {
    if (a[i]!==b[i]) return false;
  }
  return true;
}
  
    
ui.stripDomainFromUrl = function (url) {
  var r = /^http\:\/\/[^\/]*\/(.*)$/
  var m = url.match(r);
  return m?m[1]:m;
}

ui.stripPrototypeJungleDomain = function (url) {
  if (pj.beginsWith(url,'http://')) {
    if (pj.beginsWith(url,'http://prototypejungle.org/')) {
      return url.substr(26);
    }  else {
      return undefined;
    }
  } else {
    return url;
  }
}

ui.displayMessage = function (el,msg,isError){
  el.$show();
  el.$css({color:isError?"red":(msg?"black":"transparent")});
  el.$html(msg);
}


ui.displayError = function(el,msg){
  ui.displayMessage(el,msg,true);
}

ui.displayTemporaryError = function(el,msg,itimeout) {
  var timeout = itimeout?itimeout:2000;
  ui.displayMessage(el,msg,true);
  window.setTimeout(function () {el.$hide();},timeout);
}


// <Section> browser ====================================================

ui.safariSupported = true;

ui.browser = function () {
  var userAgent = window.navigator.userAgent,
    match,version;
  var genResult = function (browser) {
    if ((browser === 'Safari') || (browser === 'Googlebot')) {
      return {browser:browser}
    }
    version = parseInt(match[1]);
    return {browser:browser,version:version};
  } 
  match = userAgent.match(/Chrome\/(\d*)/);
  if (match) return genResult('Chrome');
  match = userAgent.match(/Firefox\/(\d*)/);
  if (match) return genResult('Firefox');
  match = userAgent.match(/MSIE (\d*)/);
  if (match) return genResult('IE');
  match = userAgent.match(/Safari/);
  if (match) return genResult('Safari');
  match = userAgent.match(/Googlebot/);
  if (match) return genResult('Googlebot');
  match = userAgent.match(/rv\:(\d*)/);
  if (match) return genResult('IE');
  return undefined;
}


ui.supportedBrowser = function () {
  var browserVersion = ui.browser();
  var browser;
  if (!browserVersion) {
    return false;
  }
  browser =  browserVersion.browser;
  if ((browser === 'IE') && (browserVersion.version < 11)) {
    return false;
  }
  if ((browser === 'Safari') && !ui.safariSupported) {
    return false;
  }
  return true;
}

ui.checkBrowser = function () {
  var br = ui.supportedBrowser();
  if (!br) {
    window.location.href = '/unsupportedbrowser';
  }
}
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



// html components for the UI : pulldown (select), and tab; some utilities too
  dom.Select = pj.Object.mk();
  
  dom.Select.mk = function (o) {
    var rs = Object.create(dom.Select);
    pj.extend(rs,o);
    return rs;
  }
  
dom.Select.build = function () {
  var el = this.domEl;
  var opts,oids,cnt,op,ln,thisHere,opels,sl,i,o,opel,opid;
  if (el) return el;
  var opts = this.options;
  oids = this.optionIds;
  cnt = this.containerP.instantiate();
  op = this.optionP;
  ln=opts.length;
  thisHere = this;
  // generate a separate closure for each n
  function selector(n) {
    return function () {
      thisHere.__select(n);
      thisHere.domEl.$css({"display":"none"})
    }
  }
  opels = [];
  sl = this.selected;
  this.disabled = {};
  for (i=0;i<ln;i++) {
    o = opts[i];
    opel = op.instantiate();
    opels.push(opel);
    cnt.addChild(opel);

    opid = oids[i];
    opel.$click(selector(i));
    opel.text = (this.isOptionSelector)&(i===sl)?"&#x25CF; "+o:o
  }
  this.optionElements = opels;
  this.domEl = cnt;
  return cnt;
}

dom.Select.hide = function () {
  if (this.domEl) {
    this.domEl.$hide();
  }
}
dom.Select.setDisabled = function (oId,iv) {
  var v = iv?true:false; 
  var  disabled = this.disabled;
  var cd = disabled[oId];
  var idx,opels,thisHere,opel;
  if (cd == v) return;//no change
  disabled[oId] = v;
  idx = this.optionIds.indexOf(oId);
  opels = this.optionElements;
  if (!opels) return;
  thisHere = this;
  opel = opels[idx];
  if (v) {
    opel.$css('color','gray');
  } else {
    opel.$css('color','black');
  }
}
   
   
  
dom.Select.updateDisabled = function () {
  var  disabled = this.disabled;
  var opIds = this.optionIds;
  var ln = opIds.length;
  var opEls = this.optionElements;
  var i,d,opel;
  for (i=0;i<ln;i++) {
    d = disabled[opIds[i]];
    opel = opEls[i];
    //var oel = opel.__element;
    if (d) {
      opel.$css('color','gray');
    } else {
      opel.$css('color','black');
    }
  }
}

dom.Select.__select = function (n) {
 var opts = this.options;
 var optels = this.optionElements;
 var ln = opts.length;
 var i,oi,oe;
 this.selected = n;
 for (i=0;i<ln;i++) {
   oi = opts[i];
   oe  = optels[i];
   if (i===n) {
     oe.$html(((this.isOptionSelector)?"&#x25CF; ":"") + oi);
   } else {
     oe.$html(oi);
   }
 }
 if (this.onSelect) {
   this.onSelect(n);
 }
}

dom.popped = {};

dom.popFromButton = function (nm,button,toPop) {
  var p,pr,pof,ht,ofs,rofL,rofT;
  dom.unpop(nm);
  var p = dom.popped;

  if (p[nm]) {
    toPop.$css({"display":"none"});
    p[nm] = false;
    return;
  }
  pr = toPop.__parent;
  pof = pr.$offset();
  ht = button.$height();
  ofs = button.$offset();
  rofL = ofs.x-pof.x;
  rofT = ofs.y-pof.y;
  toPop.$css({"display":"block","left":rofL+"px","top":(rofT+ht)+"px"});
  p[nm] = toPop;
}
  

dom.unpop = function (except) {
  var p = dom.popped;
  var k,pp;
  for (k in p) {
    if (k === except) continue;
    pp = p[k];
    if (pp) {
      pp.$css({"display":"none"});
      p[k] = false;
    }
  }
}

dom.Tab = pj.Object.mk();

dom.Tab.mk = function (elements,initialState,action) {
  var rs = Object.create(dom.Tab);
  rs.elements = elements;
  rs.action = action;
  rs.initialState = initialState;
  return rs;
}
  
dom.Tab.build= function () {
  var jq = this.domEl;
  var cnt,els,jels,thisHere;
  if (jq) return jq;
  cnt =  html.Element.mk('<div style="border:solid thin black;position:absolute"/>');
  els = this.elements;
  jels = {};
  thisHere = this;
  els.forEach(function (el) {
    var del = html.Element.mk('<div class="tabElement"/>');
    del.$click(function () {thisHere.selectElement(el);});
    del.$html(el);
    cnt.set(el,del);
    jels[el] = del;
  });
  this.domEl = cnt;
  this.domElements = jels;
  if (this.initialState) {
    this.selectElement(this.initialState,true);
  }
  return cnt;    
}
  
dom.Tab.selectElement = function (elName,noAction) {
  var jels,jel,k,kel;
  if (elName === this.selectedElement) {
    return;
  }
  this.selectedElement = elName;
  jels = this.domElements;
  jel = jels[elName];
  jel.$css({"background-color":"#bbbbbb",border:"solid thin #777777"});
  for (k in jels) {
    if (k!==elName) {
      kel = jels[k];
      kel.$css({"background-color":"#dddddd",border:"none"});
    }
  }
  if (!noAction && this.action) this.action(elName);
}

dom.Tab.enableElement = function (elName,vl) {
  var jel = this.domElements[elName];
  jel.$css({color:vl?"black":"grey"});
}
  
// for processing an input field; checking the value, inserting it if good, and alerting otherwise. Returns a message if there is an error
// the value true if there was a change, and false otherwise (no change);
// inherited will be set to false if this fellow is at the frontier;

// If the current value of a field is numerical, it is enforced that it stay numerical.
dom.processInput = function (inp,nd,k,inherited,computeWd,colorInput) { //colorInput comes from the color chooser
  var isbk = (k==="backgroundColor") && (nd === pj.root);// special case
  var ipv = nd.__get(k);
  var pv = (ipv===undefined)?"inherited":pj.applyOutputF(nd,k,ipv);  // previous value
  var isnum = typeof(nd[k])==="number";
  var vl,nv,nwd;
  if (colorInput) {
    vl = colorInput.toName();
    if (!vl) {
      vl =  colorInput.toRgbString();
    }
  
  } else {
    vl = inp.$prop("value");
  }
  if (vl === "") {
    if (inherited) {
      inp.$prop("value","inherited");
    } else {
      delete nd[k];
    }
  } else {
    if (vl === "inherited") return false;
    if (colorInput) { // no need for check in this case, but the input function might be present as a monitor
      nv = vl;
      pj.applyInputF(nd,k,vl,"colorChange");
    } else {
      nv = pj.applyInputF(nd,k,vl);
      if (nv) {
        if (pj.isObject(nv)) { // an object return means that the value is illegal for this field
          inp.$prop("value",pv);// put previous value back in
          return nv.message;
        }
      } else {
        if (isnum) {
          nv = parseFloat(vl);
          if (isNaN(nv)) {
            return "Expected number"; 
          }
        } else if (typeof nv === 'string') {

          nv = $.trim(nv); 
        }
      }
    }
    if (pv == nv) {
      pj.log("tree",k+" UNCHANGED ",pv,nv);
      return false;
    } else {
      pj.log("tree",k+" CHANGED",pv,nv);
    }
    nd.set(k,nv);
    nd.__update();
    if (isbk) {
      pj.svg.main.addBackground();
    }
    dom.afterSetValue(nd);
    nwd = computeWd(String(nv));
    if (inp) inp.$css({'width':nwd+"px"});
    /*
    if (nd.__mark) {
      marks = nd.__parent.__parent;
      marks.assertModified(nd);
    }
    ui.assertObjectsModified();
    */
    return true;
  }
}

dom.afterSetValue = function (node) {
  if (node.__mark) { // part of a spread
    marks = node.__parent.__parent;
    marks.assertModified(node);
  }
  ui.assertObjectsModified();  
}

dom.measureText = function (txt,font) {
  var sp = dom.measureSpan;
  var rs;
  if (sp) {
    sp.$show();
  } else {
    sp = html.Element.mk('<span/>');
    sp.$css('font','8pt arial');
    sp.__draw(document.body);
    dom.measureSpan = sp;
  }
  sp.$html(txt)
  rs = sp.$width();
  sp.$hide();
  return rs;
  }
var proportion; // y/x
var controlled;
var controlPoints; // in global coords
var customControlPoints; // in the local coords of controlled, and set by code in controlled
var protoBox;
var protoOutline;
var protoCustomBox;
var controlledShiftOnly = false;
//var controlledAdjustPrototype = 1;
var shifter;
var svgRoot;

ui.protoToAdjust = 1; // for mark sets, adjust the prototype of the selected  object by default
  //  for now, always centered on 0,0
var controlBounds = geom.Rectangle.mk(geom.Point.mk(),geom.Point.mk());
var controlCenter = geom.Point.mk();
// all adjustable objects have their origins at center
ui.updateControlPoints = function () {
  ui.computeControlBounds(controlled);
  // the control points are c00, c01, c02 for the left side of the rectangle. c10, c12 for the middle, c20,c21,c22 for the right 
  var bnds = controlBounds,
    corner = bnds.corner,
    extent = bnds.extent,
    cp = controlPoints,
    cx = corner.x,cy = corner.y,
    ex = extent.x,ey = extent.y,
    hex = 0.5 * ex,hey = 0.5 * ey;
  if (!cp) {
    cp = controlPoints = {};
  }
  pj.log('control','controlBounds',cx,cy,ex,ey);
  cp['c00'] = geom.Point.mk(cx,cy);
  cp['c01'] = geom.Point.mk(cx,cy+hey);
  cp['c02'] = geom.Point.mk(cx,cy+ey);
  cp['c10'] = geom.Point.mk(cx+hex,cy);
  cp['shifter'] = cp['c10'];
  cp['c12'] = geom.Point.mk(cx+hex,cy+ey);
  cp['c20'] = geom.Point.mk(cx+ex,cy);
  cp['c21'] = geom.Point.mk(cx+ex,cy+hey);
  cp['c22'] = geom.Point.mk(cx+ex,cy+ey);
  return cp;
}
  
  
  
ui.initControlProto = function () {
  if  (!protoBox) {
    protoBox = svg.Element.mk(
       '<rect  fill="rgba(0,0,255,0.5)" stroke="black" stroke-width="1" x="-5" y="-5" width="10" height="10"/>');
   ui.protoBox = protoBox;
   protoOutline = svg.Element.mk('<rect  fill="transparent" stroke="black" stroke-width="1" x="-50" y="-50" width="100" height="100"/>');
   ui.protoOutline = protoOutline;
  }
}
  
  
ui.mkShifter = function () {
  var reflectX = function (p) {
    return geom.Point.mk(p.x,-p.y);
  }
  var reflectY = function (p) {
    return geom.Point.mk(-p.x,p.y);
  }
  var reflectXY = function (p) {
    return geom.Point.mk(-p.x,-p.y);
  }
  var dim = 10;
  var headFraction = 0.4;
  var widthFraction = 0.1;
  var smallDim = dim * widthFraction;
  var top = geom.Point.mk(0,-dim);
  var right = geom.Point.mk(dim,0);
  var bottom = geom.Point.mk(0,dim);
  var left = geom.Point.mk(-dim,0);
  var topToRight = right.difference(top);
  var topArrowR = top.plus(topToRight.times(headFraction))
  var topArrowHBR = geom.Point.mk(smallDim,topArrowR.y);
  var topArrowBR = geom.Point.mk(smallDim,-smallDim);
  var rightArrowT =right.plus(topToRight.minus().times(headFraction));
  var rightArrowHBT = geom.Point.mk(rightArrowT.x,-smallDim);
  var pstring = '';
  var bstring = '';
  var pseq =
    [top,topArrowR,topArrowHBR,topArrowBR,
     rightArrowHBT,rightArrowT,right,reflectX(rightArrowT),reflectX(rightArrowHBT),
     reflectX(topArrowBR),reflectX(topArrowHBR),reflectX(topArrowR),
     bottom,reflectXY(topArrowR),reflectXY(topArrowHBR),reflectXY(topArrowBR),
     reflectXY(topArrowBR),reflectXY(rightArrowHBT),reflectXY(rightArrowT),
     left,reflectY(rightArrowT),reflectY(rightArrowHBT),
     reflectY(topArrowBR),reflectY(topArrowHBR),reflectY(topArrowR),top];
  pseq.forEach(function (p) {
    pstring += p.x + ',' + p.y + ' ';
  });
  var bseq = [top,right,bottom,left,top];
  bseq.forEach(function (p) {
    bstring += p.x + ',' + p.y + ' ';
  });
  var pline = '<polyline stroke-width="1" fill="red" stroke="black" points="'+pstring+'"/>'
  var bline = '<polyline stroke-width="1" fill="rgba(0,0,255,0.5)" stroke="black" points="'+bstring+'"/>'
  pj.log('control',pline);
  var rs = svg.Element.mk('<g/>');
  rs.set('bline',svg.Element.mk(bline));
  rs.bline.__unselectable = true;
  rs.set('pline',svg.Element.mk(pline));
  rs.pline.__unselectable = true;
  return rs;
}
  
ui.initCustomProto = function () {
  if  (!protoCustomBox) {
    protoCustomBox = svg.Element.mk(
       '<rect  fill="yellow" stroke="black" stroke-width="1" x="-5" y="-5" width="10" height="10"/>');
    ui.protoCustomBox = protoCustomBox;
  }
   
}

 
ui.initBoundsControl = function () {
  ui.initControlProto();
  var boxes = pj.root.__controlBoxes;
  if (boxes) {
    boxes.__bringToFront();
  } else {
    boxes = pj.root.set("__controlBoxes",svg.Element.mk('<g/>'));
    boxes.set('outline',protoOutline.instantiate());
    boxes.outline["pointer-events"] = "none";
    boxes.outline.__unselectable = true; 
    for (var nm in controlPoints) {
      if (nm !== 'shifter') {
        var box = protoBox.instantiate();
        box.__controlBox = true;
        boxes.set(nm,box);   
      }
      shifter = ui.mkShifter();
      boxes.set('shifter',shifter);
    }
  }
}
 
  
/*
 * if a user clicks where a custom box appears, then treat matters as if the box had been clicked
 */
var clickedInBox = false;
var clickIsInBox = function (p) {
  if (svgRoot.clickedPoint) {
    var cx = svgRoot.clickedPoint.x;
    var cy = svgRoot.clickedPoint.y;
    var px = p.x;
    var py = p.y;
    var hbx = 0.5 * boxSize;
    pj.log('control','clickIsInBox',hbx,cx,cy,px,py);
   return (Math.abs(px - cx) < hbx) && (Math.abs(py -cy) < hbx);
  } else {
    return false;
  }
}

ui.updateCustomBoxes = function (points) {
  var boxes,ln,sc,nm,ps,sps,idx,i;
  pj.log('control','UPDATECUSTOMBOXES');
  ui.updateBoxSize();
  controlCenter = geom.toGlobalCoords(controlled);//,localCenter);
  boxes = pj.root.__customBoxes;
  boxes.__moveto(controlCenter);
  ln = points.length;
  sc = geom.scalingDownHere(controlled);
  clickedBoxIndex = -1;
  for (i=0;i<ln;i++) {
    nm = "c"+i;
    ps = points[i];
    sps = ps.times(sc); //geom.toGlobalCoords(controlled,points[i]);//,localCenter);
    if (clickIsInBox(sps)) {
      
      pj.log('control','CLICKED BOX INDEX',i);
      clickedInBox = true;
      svgRoot.dragee = boxes[nm];
      controlActivity = 'draggingCustomControl';
      svgRoot.refPos = sps;
      draggedCustomControlName = nm;
      idx = parseInt(nm.substr(1));
//      ui.showAdjustSelectors(idx);
      svgRoot.clickedPoint = undefined;
    }
    boxes[nm].__moveto(sps);
  }
  boxes.__draw();
  ui.showAdjustSelectors(idx);
}
 
  ui.initCustomControl = function (points) {
    var ln,boxes,i,nm,box,n,nm,box;
    ui.initCustomProto();
    ln = points.length;
    boxes = pj.root.__customBoxes;
    if (boxes) {
       boxes.__unhide();
       boxes.__bringToFront();
    } else {
      boxes = pj.root.set("__customBoxes",svg.Element.mk('<g/>'));
    }
    for (i=0;i<ln;i++) {
      nm = "c"+i;
      box = boxes[nm];
      if (box) {
        box.__unhide();
      } else {
        boxes.set(nm,protoCustomBox.instantiate());
      }
    }
    // now hide the unused boxes, if any
    n = ln;
    while (true) {
      nm = "c"+n;
      box = boxes[nm];
      if (box) {
        box.__hide();
      } else {
        break;
      }
      n++;
    }
    ui.updateCustomBoxes(points);
  }
    


var boxSize = 15; // in pixels
var boxDim; // in global coords
ui.updateBoxSize = function () {
  var sc,setDim;
  if (!controlled && !shifter) {
    return;
  }
  sc = pj.root.__getScale();
  boxDim = boxSize/sc;
  setDim = function (bx) {
    bx.width = boxDim;
    bx.height = boxDim;
    bx.x = bx.y = -0.5*boxDim;
    bx["stroke-width"] = 0.05 * boxDim;
  }
  if (shifter) {
    setDim(shifter);
    shifter.__draw();
  }
  if (protoBox) {
    setDim(protoBox);
  }
  if (protoCustomBox) {
    setDim(protoCustomBox);
  }
}
  
var boxesToHideForScaling = {c00:1,c10:1,c20:1,c02:1,c12:1,c22:1,shifter:1};
  
ui.updateControlBoxes = function (firstCall) {
  pj.log('control','updateControlBoxes')
  var boxes,updateControlBox,showBox,box,extent,corner,element,dst;
  if (!controlled) {
    return;
  }
  ui.updateBoxSize();  
  if (controlled.__controlPoints) {
    points = controlled.__controlPoints();
    pj.log('control','ncp',points[0].y);
    ui.updateCustomBoxes(points);
  }
  if (controlled.__customControlsOnly) return;
  ui.updateControlPoints();
  boxes = pj.root.__controlBoxes;
  updateControlBox = function(nm) {
    showBox = true;
    box = boxes[nm];
    if (proportion) {
      if (boxesToHideForScaling[nm]) {
        showBox = false;
      }
    } else {
       if (nm === 'c10') {
         showBox = !controlled.__draggable;
         pj.log('control','c01',showBox,firstCall);
       } else if (!controlled.__adjustable) {
         showBox = false;
       }
    }
    if (nm === 'shifter') {
        showBox = controlled.__draggable;
    }
    if (controlled.__showBox) {
      var sb = controlled.__showBox(nm);
      if (sb !== undefined) {
        showBox = sb;
        firstCall = true;
      }
    }
    //if (nm == 'extent') {
    //  showBox = 0;
    //}
    if (showBox) {
      if (firstCall) box.__show();
      if (nm === 'outline') {
        extent = controlBounds.extent;
        corner = controlBounds.corner;
        element = box.__element;
        element.setAttribute('x',corner.x);
        element.setAttribute('y',corner.y);
        element.setAttribute('width',extent.x);
        element.setAttribute('height',extent.y);
     
      } else {
        dst = controlPoints[nm];//.plus(geom.Point.mk(-0.5*boxDim,-0.5*boxDim))
        box.__moveto(dst);
      }
    } else if (firstCall) {
      box.__hide();
      box.__draw();
    }
  }
  for (nm in controlPoints) {
    updateControlBox(nm);
  }
  updateControlBox('outline');
  boxes.__moveto(controlCenter);
  boxes.__draw();
  if (!controlled) {
    debugger;
  }

}

  
ui.hideControl = function () {
  var boxes = pj.root.__controlBoxes;
  var nm;
  if (boxes) {
    for (nm in controlPoints) {
      if (boxes[nm]) {
        boxes[nm].__hide();
      }
    }
    boxes.outline.__hide();
    boxes.__draw();
  }
}
  
  
ui.hideCustomControl = function () {
  var boxes = pj.root.__customBoxes;
  if (boxes) {
    boxes.__hide();
    boxes.__draw();
  }
}
    

ui.clearControl = function () {
  proportion = 0;
  ui.controlled = controlled = undefined;
  ui.hideControl();
  ui.hideCustomControl();
  controlActivity = undefined;
  if (shifter) {
    shifter.__hide();
  }
}

ui.hasSelectablePart = function (node) {
  return pj.someTreeProperty(node,function (child) {
    if (svg.Element.isPrototypeOf(child)) {
      if (!(child.__unselectable)) return 1;
      return ui.hasSelectablePart(child);
    } else {
      return false;
    }
  });
}

ui.computeControlBounds = function (node) {
  var localExtent = node.__getExtent();
  var sc = geom.scalingDownHere(node);
  var controlExtent = localExtent.times(sc);
  controlCenter = geom.toGlobalCoords(node);//,localCenter);
  controlBounds = geom.Rectangle.mk(controlExtent.times(-0.5),controlExtent);
  proportion = node.__scalable?(controlExtent.y)/(controlExtent.x):0;
  return controlBounds; 
}
  
      
ui.setControlled = function (node) {
  var points;
  ui.controlled = controlled  = node; 
  ui.computeControlBounds(controlled);
  if (!controlled.__customControlsOnly) {
    ui.updateControlPoints();
    ui.initBoundsControl();
  }
  if (controlled.__controlPoints) {
    points = controlled.__controlPoints(1);
    ui.initCustomControl(points);
  } else {
    if (pj.root.__customBoxes) {
      pj.root.__customBoxes.__hide();
      pj.root.__customBoxes.__draw();
    }
  }
  return  controlBounds;
}
  
ui.showControl = function () {
  if (controlled) {
    ui.computeControlBounds(controlled);
    ui.updateControlBoxes(true);
  }
}

  // standard method, which adjusts the bounds 
  
  
   ui.dragBoundsControl = function (controlled,nm,ipos) {
      var bnds,corner,extent,outerCorner,localExtent,cr,originalPos,pos,ULpos,gtr,bx,allowDisplace;
    pj.log('control','dragging bounds control ',nm,ipos.x,ipos.y);
    bx = pj.root.__controlBoxes[nm];
    allowDisplace = false;
    bnds = controlBounds;
    pos = geom.toOwnCoords(pj.root.__controlBoxes,ipos);
    ULpos = pos.plus(bnds.extent.times(0.5)); // relative to the upper left corner
    corner = bnds.corner;
    extent = bnds.extent;
    outerCorner = corner.plus(extent);
    // generate new bounds with corner at upper left (recenter later)  
    switch (nm) {
      case "c00":
        bnds.extent =  outerCorner.difference(pos);
        break;
      case "c01":
        extent.x = outerCorner.x - pos.x;
        if (proportion) {
          extent.y = (extent.x)*proportion;
        }
        break;
      case "c02":
        extent.x = outerCorner.x - pos.x;
        extent.y = pos.y - corner.y;
        break;
      case "c10": 
        extent.y = outerCorner.y - pos.y;
        if (proportion) {
          extent.x = (extent.y)/proportion;
        }
        break;
      case "c12":
        extent.y = pos.y - corner.y;
        if (proportion) {
          extent.x = (extent.y)/proportion;
        }
        break;
      case "c20":
        extent.x = pos.x - corner.x;
        extent.y = outerCorner.y - pos.y;
        break;
      case "c21": 
        extent.x = pos.x - corner.x;
        if (proportion) {
          extent.y = (extent.x)*proportion;
        }
        break;
      case "c22":
        bnds.extent = pos.difference(corner);
        break;
    }
    bx.__moveto(pos);
    pj.log("control","NEW EXTENT",bnds.extent);
    var sc =1/geom.scalingDownHere(controlled);
    pj.log("control","OLD CENTER",controlCenter);
    bnds.corner =  bnds.extent.times(-0.5);
  
    localExtent = bnds.extent.times(sc);
    pj.log('control','WHAT TO ADJUST ',ui.whatToAdjust);
    if (ui.whatToAdjust) {
      var wta  = ui.whatToAdjust;
      wta.__setExtent(localExtent,nm);
      if (wta.__mark) {
        marks = wta.__parent.__parent;
        if (marks.assertModified) marks.assertModified(wta);
      }
      pj.root.__draw();
      ui.needsUpdate = false;
    } else {
      ui.needsUpdate = true;
    }
    ui.updateControlBoxes();
  }
 
   // ipos is in global coords 
ui.dragCustomControl = function (controlled,nm,ipos) {
  var pos = geom.toOwnCoords(controlled,ipos); 
  var idx,boxes,bx,npos,sc,bxnpos;
  pj.log('control','dragging custom control ',nm);
  idx = parseInt(nm.substr(1));
  boxes = pj.root.__customBoxes;
  bx = boxes[nm];
  npos = controlled.__updateControlPoint(idx,pos);
  pj.log('control','npos',idx,npos);
  if (npos === 'drag') {
    var rf  = pj.svg.main.refPos;
    var delta = ipos.difference(rf);
    pj.log('control','delta',rf.x,rf.y,' ',ipos.x,ipos.y,' ',delta.x,delta.y);
    var rfcontrolled = pj.svg.main.refControlledPos;
    controlled.__moveto(rfcontrolled.plus(delta));
    npos = undefined;
  }
  if (!npos) {
    pj.log('control','updatingBOxes');
    var points = controlled.__controlPoints();
    ui.updateCustomBoxes(points);
    return;
  }
  sc = geom.scalingDownHere(controlled);
  if (!npos.times) {
    debugger;
  }
  bxnpos = npos.times(sc); // the new point relative to the control boxes
  bx.__moveto(bxnpos);
  bx.__draw();
   ui.needsUpdate = true;
}
 


// properties of a node relevant to mouse control. __draggable,__unselectable,__adjustPrototype

// if a node has a selectable part, a central control square is added, so it can be dragged around.

// at any given time when the mouse is down, there is a controlActivity, which is one of
// shifting, panning, draggingControl (dragging one of the little control boxes), draggingCustomControl,
// draggingControlled (dragging the whole controlled)
// There are, in the general case, three objects involved: pj.selectedNode, shiftee, and controlled

var controlActivity = undefined;

  ui.needsUpdate = false; // this should be set if an update is expected with a mouseUp 

  
var draggedControlName = 0;
var draggedCustomControlName = 0;
var surrounded = undefined;

svg.Element.__setSurrounders  = function (fromControl) {
  var sz,surs,rt,b,rct,cr,xt,lx,ly,efc,ext,efcm,st;
  if (!svg.surroundersEnabled) {
    return;
  }
  sz = 5000;
  surs = pj.root.surrounders;
  if (!surs) {
    surs = svg.main.addSurrounders();
  }
  rt = svg.main.contents;
  if (this.__draggable || (this.__adjustable && this.__setExtent)) {
  //if (this.__setExtent) {
    b = ui.computeControlBounds(this);//ui.setControlled(this);
  } else {
    b = this.__bounds(rt);
  }
  if (!b) {
    surs.__hide();
    surs.__draw();
    return;
  }
  surs.__show();
  surrounded = this;
  rct = b.expandTo(5,5); // Lines have 0 width in svg's opinion, but we want a surround anyway
  cr = rct.corner;
  xt = rct.extent;
  // first top and bottom
  lx = cr.x - sz;
  ly = cr.y - sz;
  pj.log("svg","surrounders ",lx,ly);
  efc = 1.05; // add this much space around the thing
  ext = 5;// absolute 
  efcm = efc - 1;
  st = {fill:"rgba(0,0,0,0.4)"};
  
  surs.s0.set({x:lx,y:ly,width:sz*2,height:sz-ext});// above
  surs.s1.set({x:lx,y:cr.y+xt.y + ext,width:sz*2,height:sz}); //below    
  surs.s2.set({x:lx,y:cr.y-ext,width:sz-ext,height:xt.y+2*ext});//to left
  surs.s3.set({x:cr.x+xt.x + ext,y:cr.y-ext,width:sz,height:xt.y + 2*ext});// to right
  surs.visibility = "inherit";
  surs.__draw();
}
  
svg.resetSurrounders = function () {
  var slnd = pj.selectedNode;
  if (slnd) {
    slnd.__setSurrounders();
  }
}
 
  
svg.Root.setZoom = function (trns,ns) {
  var cntr = geom.Point.mk(this.width()/2,this.height()/2);// center of the screen
  var ocntr = trns.applyInverse(cntr);
  var ntx,nty,tr;
  trns.scale = ns;
  ntx = cntr.x - (ocntr.x) * ns;
  nty = cntr.y - (ocntr.y) * ns;
  tr = trns.translation;
  tr.x = ntx;
  tr.y = nty;
  ui.updateBoxSize();
  }
  
  
  // zooming is only for the main canvas, at least for now
function zoomStep(factor) {
  var trns = svg.main.contents.transform;
  var s;
  if (!trns) return;
  var s = trns.scale;
  pj.log("svg","zoom scaling",s);
  svg.main.setZoom(trns,s*factor);
  svg.draw();
}
  
var nowZooming = false;
var zoomFactor = 1.1;
var zoomInterval = 150;
var zoomer = function zoomer() {
  if (nowZooming) {
    zoomStep(cZoomFactor);
    setTimeout(zoomer,zoomInterval);
  }
}


svg.startZooming = function () {
  pj.log("svg","start zoom");
  cZoomFactor = zoomFactor;
  if (!nowZooming) {
    nowZooming = true;
    zoomer();
  }
}
  
svg.startUnZooming = function () {
  cZoomFactor = 1/zoomFactor;
  if (!nowZooming) {
    nowZooming = true;
    zoomer();
  }
}

svg.stopZooming = function() {
  pj.log("svg","stop zoom");
  nowZooming = false;
}
  

svg.initDiv = function (dv) {
  var jdv = $(dv);
  var wd = jdv.width();
  var ht = jdv.height();
  var dom = pj.dom;
  var svgDiv =  dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>');;
  svgDiv.install(dv);
  svg.init(svgDiv.__element[0],wd,ht);
}


svg.surrounderP = svg.Element.mk('<rect fill="rgba(0,0,0,0.4)"  x="0" y="0" width="100" height="10"/>');
svg.surrounderP["pointer-events"] = "none";

  pj.selectCallbacks = [];

  // what to do when an element is selected by clicking on it in graphics or tree
pj.Object.__select = function (src,dontDraw) { // src = "svg" or "tree"
  console.log('select',src);
  ui.closeSidePanel();
  pj.selectedNodePath =this.__pathOf(pj.root);
  if (pj.selectedNode && (pj.selectedNode !== this) && pj.selectedNode.__whenUnselected) {
    pj.selectedNode.__whenUnselected();
  }
  pj.selectedNode = this;
  this.__selected = true;
  if (src === 'tree') {
    controlActivity = undefined;
    ui.clearControl();
  }
  ui.nowAdjusting = this.__draggable || (this.__adjustable && (this.__setExtent || this.__controlPoints));
  //ui.nowAdjusting =  (this.__setExtent || this.__controlPoints);

  if (src === "svg") {

    var thisHere = this;
    pj.selectCallbacks.forEach(function (c) {
      c(thisHere);
    });
  }
  if (ui.nowAdjusting) {
        //ui.whatToAdjust = undefined;
        ui.setControlled(this);
        ui.updateControlBoxes(1);
        ui.hideSurrounders();
  } else {
    ui.nowAdjusting = false;
    ui.clearControl();
    this.__setSurrounders();// highlight
  }
  }
   
ui.zoomToSelection = function () {
  var rt = svg.main;
  var snd = pj.selectedNode;
  var bnds,xf;
  if (snd) { 
    var bnds = snd.__bounds(rt.contents);
    var xf = rt.fitBounds(0.2,bnds);
  }
}
ui.hideSurrounders =  function () {
  var surs = pj.root.surrounders;
  if (surs) {
    surs.__hide();
    surs.__draw();
  }
  surrounded = undefined;
}

ui.unselect = function () {
  if (pj.selectedNode) {
    if (pj.selectedNode.__whenUnselected) {
      pj.selectedNode.__whenUnselected();
    }
    pj.selectedNode.__selected = false;
    pj.selectedNode = undefined;
    controlActivity = undefined;
    ui.clearControl();
    ui.nowAdjusting = undefined;
 
  }
  ui.hideSurrounders();

  /* if (ui.replaceMode) {
      ui.replaceMode = 0;
      ui.layout();
  }*/
}
  
//  refresh the whole UI, 
ui.refresh = function (doFit) {
  var selectedPath;
  selectedPath = undefined;
  if (pj.selectedNode) {
    selectedPath = pj.pathOf(pj.selectedNode,pj.root);
  }
  svg.main.updateAndDraw(doFit);
  if (pj.tree) {
    pj.tree.refresh();
  }
  if (selectedPath) {
    var cselection = pj.evalPath(pj.root,selectedPath);
    if (cselection) {
      if  (cselection !== pj.selectedNode) {
        cselection.__select();
      }
    } else {
      ui.unselect();
    }
  }
  ui.needsUpdate = false;
}
  
  
svg.Root.addSurrounders = function () {
  var cn,surs,rct,nm;
  if (!svg.surroundersEnabled) {
    return;
  }
  cn = this.contents;
  if (cn.surrounders) {
    return cn.surrounders;
  }
  surs = svg.tag.g.mk();
  for (var i=0;i<4;i++) {
    var rct = svg.surrounderP.instantiate();
    var nm = "s"+i;
    surs.set(nm,rct);
  }
  surs.visibility="visible";
  cn.set("surrounders",surs);
  return surs;
}
 
  
// this is the nearest ancestor of the hovered object which has a forHover method
 
 svg.hoverAncester = undefined;
 // the node currently hovered over
 
 svg.hoverNode = undefined;
 
 
 pj.Object.__isSelectable = function () {
   return !this.__unselectable;
 }
 
 pj.Array.__isSelectable = function () {
   return false;
 }
 
 ui.selectableAncestor = function (node) {
   return pj.ancestorWithoutProperty(node,"__unselectable");
 }
  
  
   // for selection in the inspector, and hovering generally
pj.md = 0;

var mouseDownListener = function (root,e) {
  console.log('mouseDown');
  if (ui.hideFilePulldown) {
    ui.hideFilePulldown();
  }
  if (pj.md) {
    debugger;
  }
    var trg,id,cp,xf,iselnd,oselnd,b,xf,xfip,dra,rfp,idx,clickedPoint;
    svgRoot = root;
    ui.mouseDownEvent = e;
    e.preventDefault();
    trg = e.target;
    id = trg.id;
    cp = root.cursorPoint(e);
    xf = root.contents.transform;
    clickedPoint = xf.applyInverse(cp);// in coordinates of content
    if (ui.nowInserting) {
      pj.log('control','Completing insert of ',ui.nowInserting.name,JSON.stringify(cp),JSON.stringify(clickedPoint));
      ui.completeInsert(clickedPoint,cp);
      return;
    }
    root.refPoint = cp; // refpoint is in svg coords (ie before the viewing transformation)
    root.clickedPoint = clickedPoint;// in coordinates of content
    oselnd = trg.__prototypeJungleElement;
    if (oselnd) {
      if (ui.protoOutline && ui.protoOutline.isPrototypeOf(oselnd)) {
        oselnd = undefined;
      }
    }
    pj.log('control',"svg","mousedown ",id);
    if (oselnd) {
      pj.log('control',"ZUUUB");
      iselnd = ui.selectableAncestor(oselnd);

      if (oselnd.__parent === shifter) {
        pj.log('control','control',"SHIFTER111RRR!!");
        controlActivity = 'shifting';
        selectedPreShift = pj.selectedNode;
        ui.hideSurrounders();
        pj.log('control','control','controlActivity set to ',controlActivity);
        dra = controlled;
      } else if (iselnd.__controlBox) {
        dra = iselnd;
        controlActivity = 'draggingControl';
        pj.log('control','controlActivity set to ',controlActivity);
        //ui.showAdjustSelectors();
        draggedControlName = iselnd.__name;
        pj.log('control','dragging '+draggedControlName);
      } else if (protoCustomBox && protoCustomBox.isPrototypeOf(iselnd)) {
        dra = iselnd;
        idx = parseInt(iselnd.__name.substr(1));
       //ui.showAdjustSelectors(idx);
        controlActivity = 'draggingCustomControl';
        pj.log('control','controlActivity set to ',controlActivity);
        draggedCustomControlName = iselnd.__name;
        root.refControlledPos = ui.controlled.__getTranslation().copy();
        pj.log('control','dragging custom control '+draggedCustomControlName);
      } else {
        iselnd.__select("svg");
        pj.log('control',"DRA",dra);
      }
      if (dra) {
        root.dragee = dra;
        pj.log('control','dragee on');
        rfp = geom.toGlobalCoords(dra);
        pj.log("control",'dragging ',dra.__name,'refPos',rfp.x,rfp.y);
        root.refPos = rfp;
        if (dra.startDrag) {
          dra.startDrag(rfp);
        }
      } else if (!clickedInBox) {
      delete root.dragee;
      pj.log('control','dragee off');
      delete root.refPos;
    }
  } else { // if not iselnd; nothing selected
    root.refTranslation = root.contents.__getTranslation().copy();
    if (controlled) { // this happens when the user clicks on nothing, but something is under adjustment
      b = controlled.__bounds(root.contents);
      xf = root.contents.transform;
      xfip = xf.applyInverse(root.refPoint);
      ui.unselect();
      controlActivity = 'panning';
      pj.log('control','controlActivity set to ',controlActivity);  
    } else {
      ui.unselect();
      controlActivity = 'panning';
      pj.log('control','controlActivity set to ',controlActivity);
    }
  }
}


ui.points = [];
var mouseMoveListener = function (root,e) {

  var cp,pdelta,tr,s,refPoint,delta,dr,trg,id,rfp,s,npos,drm,xf,clickedPoint;
  cp = root.cursorPoint(e);
  xf = root.contents.transform;
  clickedPoint = xf.applyInverse(cp);// in coordinates of content
  ui.points.push({a:cp,b:clickedPoint})
  e.preventDefault();
  pj.log('control','control','mousemove  controlActivity',controlActivity,root.dragee,cp);
  if (controlActivity === 'panning') { 
    pdelta = cp.difference(root.refPoint);
    tr = root.contents.__getTranslation();
    s = root.contents.transform.scale;
    tr.x = root.refTranslation.x + pdelta.x;// / s;
    tr.y = root.refTranslation.y + pdelta.y;//
    pj.log("svg","drag","doPan",pdelta.x,pdelta.y,s,tr.x,tr.y);
    svg.main.draw();
    return;
  }
  refPoint = root.refPoint;
  if (refPoint) { 
    delta = cp.difference(refPoint); 
  } 
  dr = root.dragee;
  if (dr) {
    pj.log('control','dragEEE',dr.__name);
    trg = e.target;
    id = trg.id;
     rfp = root.refPos;
    s = root.contents.transform.scale;
    npos = rfp.plus(delta.times(1/s));
    if (controlActivity === 'draggingControl') {
      ui.dragBoundsControl(controlled,draggedControlName,npos);
      if (ui.needsUpdate && controlled.update) {
        controlled.update();
        controlled.__draw();
      }
    } else if (controlActivity === 'draggingCustomControl') {
      pj.log('control','NOW DOING THE CUSTOM DRAG');
      ui.dragCustomControl(controlled,draggedCustomControlName,npos);
    } else {
      ui.draggee = dr;
      if (controlActivity === 'shifting') {
        if (dr.dragStep) { 
          pj.log('control','drag stepping');
          dr.dragStep(npos);
          ui.updateControlBoxes();

        } else {
          pj.log('control',"SHIFTING ",dr.__name);
          if (controlled.__dragVertically) {
            npos.x = rfp.x;
          }
          var toDrag = dr.__affixedChild?dr.__parent:dr;
          geom.movetoInGlobalCoords(toDrag,npos);
          controlCenter = geom.toGlobalCoords(toDrag);
          ui.updateControlBoxes();
        }
      }
    }
    drm = dr.onDrag;
    if (drm) {
      dr.onDrag(delta);
    }
  }
}

ui.updateOnMouseUp = true;


var mouseUpOrOutListener = function (root,e) {
  var cp,xf,clickedPoint;
    cp = root.cursorPoint(e);
    xf = root.contents.transform;
    clickedPoint = xf.applyInverse(cp);// in coordinates of content
    ui.lastPoint = {a:cp,b:clickedPoint};
 
  if (controlActivity === 'draggingControl') {
    //if (controlled.__extentEvent) {
    //  debugger;
    //  controlled.__extentEvent.emit();
    //}
    if (controlled.__stopAdjust) {
      controlled.__stopAdjust();
    }
  }
  if (controlActivity === 'shifting') {
    if (controlled.__stopDrag) {
      controlled.__stopDrag();
    }
  }
  pj.log('control',"mouseUpOrOut");
  delete root.refPoint;
  delete root.refPos;
  delete root.dragee;
  pj.log('control','dragee off');
  delete root.refTranslation;
  svg.mousingOut = true;
  //if (ui.updateOnMouseUp || (0 && controlActivity)) {
  if (ui.updateOnMouseUp || controlActivity) {
    svg.main.updateAndDraw();
  }
  if (e.type === 'mouseup') {
    pj.tree.refresh();
  }
  controlActivity = undefined;
  pj.log('control','controlActivity set to ',controlActivity);
  ui.showControl();
  svg.mousingOut = false;

}

svg.Root.activateInspectorListeners = function () {
  var del,thisHere;
  if (this.inspectorListenersActivated) {
    return;
  }
  cel = this.__element;
  thisHere = this;
  cel.addEventListener("mousedown",function (e) {mouseDownListener(thisHere,e)});     
  cel.addEventListener("mousemove",function (e) {mouseMoveListener(thisHere,e)});     
  cel.addEventListener("mouseup",function (e) {mouseUpOrOutListener(thisHere,e)});
  cel.addEventListener("mouseleave",function (e) {mouseUpOrOutListener(thisHere,e)});

  this.inspectorListenersActivated = true;
}
   
   
  
   
// when inspecting dom, the canvas is a div, not really a canvas
svg.Root.addButtons = function (navTo) {
  var plusbut,minusbut,navbut,div;
  this.navbut = navbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">'+navTo+'</div>');
  navbut.__addToDom(div);
  div = this.__container;
  this.plusbut = plusbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">+</div>');
  this.minusbut = minusbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">&#8722;</div>');
  plusbut.__addToDom(div);
  minusbut.__addToDom(div);
  this.initButtons();
  }
  

svg.Root.positionButtons = function (wd) {
  this.plusbut.$css({"left":(wd - 50)+"px"});
  this.minusbut.$css({"left":(wd - 30)+"px"});
  this.navbut.$css({"left":"0px"});
}

svg.Root.initButtons = function () {
  this.plusbut.addEventListener("mousedown",svg.startZooming);
  this.plusbut.addEventListener("mouseup",svg.stopZooming);
  this.plusbut.addEventListener("mouseleave",svg.stopZooming);
  this.minusbut.addEventListener("mousedown",svg.startUnZooming);
  this.minusbut.addEventListener("mouseup",svg.stopZooming);
  this.minusbut.addEventListener("mouseleave",svg.stopZooming);
}

var tree =pj.set("tree",pj.Object.mk());


svg.Element.__setFieldType("fill","svg.Rgb");
svg.Element.__setFieldType("stroke","svg.Rgb");
svg.Element.__setFieldType("backgroundColor","svg.Rgb");
dom.Style.__setFieldType("fill","svg.Rgb");


pj.inspectEverything = true;
tree.showFunctions = false;
tree.showNonEditable = true;
var showProtosAsTrees = false;
tree.set("TreeWidget",pj.Object.mk()).__namedType();
tree.enabled = true; 
tree.fullyExpandThreshold = 20;
tree.highlightColor = "rgb(100,140,255)"
tree.viewableStringMaxLength = 45;
tree.newTreeWidget = function (o) {
    pj.setProperties(this,o,["textProto","rootPos"]);
}
  // ground level operators
  
var jqp = pj.jqPrototypes;
var mpg = pj.mainPage;
var wline = tree.set("WidgetLine",pj.Object.mk());// holds methods and data for a widgetline; will be .w. of each dom element for a widgetline
var nonPrim = tree.set("NonPrimLine", html.Element.mk('<div style="font-size:small;color:black;width:100%"/>')).__namedType();
// prototype for widget lines
var mline = nonPrim.set("main",html.Element.mk('<div style="font-size:small"/>'));
mline.set("note",html.Element.mk('<span style="margin-right:5px;color:blue;cursor:pointer">?</span>'));
mline.set("toggle",html.Element.mk('<span style="cursor:pointer;color:black">&#9655;</span>'));
      
mline.set("theName",html.Element.mk('<span style="padding-right:20px;color:black;font-size:small"/>')); 
pj.nonPrim = nonPrim; // for debugging
tree.wline = wline;

tree.dpySelected = html.Element.mk('<div style="color:black"/>');


tree.WidgetLine.forNode = function () {
  return pj.evalXpath(pj.root,this.nodePath);
}
/*
 * Special case. When a mark is modified, it moves from the marks array to the modified object.
 * In some cases , the paths over on the tree side are not kept up to date. But we can patch this
 * efficiently: in this case the parentNode path will evaluate to "__modified", and we know to look over
 * into the modified array.
 */
 
tree.WidgetLine.forParentNode = function () {
  var pnp = this.parentNodePath;
  var rs = pj.evalXpath(pj.root,pnp);
  if (rs === '__modified') { 
      pnp[pnp.length-2] = 'modifications';
      rs = pj.evalXpath(pj.root,pnp);
  }
  return rs;
}
  
pj.Object.__getTheNote = function () {
  if (this === pj.root ) {
    var rs = this.__topNote;
  } else if (this.__parent) {
    rs = this.__parent.__getNote(this.__name)
  }
  return rs;
}
  
pj.Array.__getTheNote = pj.Object.__getTheNote;
  
pj.Object.__mkWidgetLine = function (options) {
  var top,thisHere,ww,rs,el,m,isLnode,tg,pth,noteSpan,notePop,txt,tspan,nspan,hp,clr;
  if (tree.onlyShowEditable && this.__mfrozen) return;
  top = options.top;
  thisHere = this;
  ww = wline; // for debugging
  rs = Object.create(tree.WidgetLine);
  el = nonPrim.instantiate();
  el.main.$css("font-size","small"); // fixStyles
  el.set("w",rs);
  if (this.__parent) {
    rs.parentNodePath = pj.xpathOf(this.__parent,pj.root);
    rs.forProp = this.__name;
  }
  m = el.main;

  isLNode = pj.Array.isPrototypeOf(this);
  if (!isLNode && (this.forProto || this.noToggle)) {
    tg = m.toggle;
    tg.$hide();
  }
  pth = pj.xpathOf(this,pj.root);
  if (!pth) {
    return;
  }
  rs.__treeTop = !!top;
  noteSpan = m.note;
   
  if (this.__getTheNote()) {
    
    notePop = function () {rs.popNote()};
    noteSpan.$click(notePop);
    noteSpan.$show();
  } else {
    noteSpan.$hide();
  }

  txt = tree.withTypeName(this,this.__name,top);

  thisHere = this;
  tspan = m.toggle;
  if (this.noToggle) {
    tspan.$hide();
  } else if (this.__leaf) {
    tspan.$html(" ");
  }  else {
    tspan.$click(function (){rs.toggle();});
  }
 
  nspan = m.theName;
  nspan.$html(txt);
  hp = this.__hasTreeProto();
  clr = "black";
  nspan.style.color = clr;
  m.addEventListener("mouseover",function (e) {
      var inheritors;
      m.$css({"background-color":"rgba(0,100,255,0.2)"});
      if (pj.Array.isPrototypeOf(thisHere)) {
        svg.highlightNodes(thisHere);
      } else { 
        inheritors = pj.inheritors(thisHere,function (x) {
          return x.__get("__element");
        });
        svg.highlightNodes(inheritors);
      }
  });
  m.addEventListener("mouseout",function (e) {
      m.$css({"background-color":"white"});
      svg.unhighlight();
  });
  nspan.$click(function () {
    rs.selectThisLine("tree");
  });
  if (this.forProto) {
    this.hasWidgetLine = true;
  }
  rs.nodePath = pth;
  return rs;
}
  

pj.Array.__mkWidgetLine = pj.Object.__mkWidgetLine;
  
  // operations on the widget tree, as opposed to the dom tree
tree.WidgetLine.treeChild = function (id) {
  var fc = this.__parent.forChildren;
  var elc;
  if (fc) {
    elc = fc[id];
    if (elc) {
      return elc.w;
    }
  }
  return undefined;
}
  
tree.WidgetLine.treeParent = function() {
  var pr = this.__parent.__parent;
  var pel;
  if (pr) {
    pel =  pr.__parent;
    if (pel) {
      return pel.w;
    }
  }
  return undefined;
}
  
tree.WidgetLine.treePath = function () {
  var rs = [];
  var el = this.__parent; 
  while (el && !(el.w.__treeTop)) {
    rs.push(el.__name);
    el = el.__parent.__parent;
  }
  return rs.reverse();
}
  
  
tree.WidgetLine.addTreeChild = function (nm,ch) {
  var el = this.__parent;
  var fc = el.forChildren;
  if (!fc) {
    fc = html.Element.mk('<div  style="margin-left:20px">');
    this.set("forChildren",ch);
  }
  fc.set(nm,ch.__parent);
}
 
  
tree.WidgetLine.treeTop = function () {
  if (this.__treeTop) return this;
  var pr = this.treeParent(); // the forChildren node intervenes in the ancestry chain
  return pr.treeTop();
}
  
tree.WidgetLine.forTreeChildren = function (fn) {
  var el,fch;
  if (this.__prim) return;
  el = this.__parent;
  fch = el.forChildren;
  if (fch) {
    var prps = Object.getOwnPropertyNames(fch);
    prps.forEach(function (p) {
      var v;
      if (pj.internal(p)) return;
      v = fch[p];
      if (v.__parent !== fch) return;
      if (html.Element.isPrototypeOf(v)) {
       fn(v.w);
      }
    });
  }
}
  
tree.WidgetLine.forTreeDescendants = function (fn) {
  var perChild = function (ch) {
    ch.forTreeDescendants(fn);
  }
  fn(this);
  this.forTreeChildren(perChild);
}
    
  
tree.WidgetLine.treeChildren = function () {
  var rs = [];
  var perChild = function (ch) {
    rs.push(ch);
  }
  this.forTreeChildren(perChild);
  return rs;
}
  
tree.WidgetLine.childrenNames = function () {
  var rs = [];
  var el = this.__parent;
  var fch = el.forChildren;
  var prps = Object.getOwnPropertyNames(fch);
  prps.forEach(function (p) {
    var v;
    if (pj.internal(p)) return;
    v = fch[p];
    if (v.__parent !== fch) return;
    if (html.Element.isPrototypeOf(v)) {
      rs.push(p);
    }
  });
  return rs;
}

// this finds widget lines whose nodes inherit from this fellow's node
// method: Find the lines athe same path
  
tree.WidgetLine.upOrDownChain = function (returnNodes,up) {
  var pth = this.treePath();
  var rs = [];
  var tops = tree.tops;
  var idx,myTop,ln,i,ptop,cl,topnode,nd;
  if (!tops) {
    return [];
  }
  if (up) {
    idx = 0;
  } else {
    myTop = this.treeTop();
    idx = tops.indexOf(myTop)+1;
  } 
  ln = tops.length;
  for (i=idx;i<ln;i++) {
    ptop = tops[i];
    cl =  ptop.treeSelectPath(pth);
    if (!cl) {
      return rs.reverse();
    }
    if (cl === this) { //done
      return rs.reverse(); // in order going up the chain
    } else  {
      if (returnNodes) {
        topnode = ptop.forNode();
        nd = pj.evalPath(topnode,pth);
        if (nd) { // nd undefined might indicate trouble todo look into this
          rs.push(nd);
        }
      } else {
        rs.push(cl);
      }
    }
  }
  return rs;
}

tree.WidgetLine.upChain = function (returnNodes) {
  return this.upOrDownChain(returnNodes,true);
}



tree.WidgetLine.downChain = function (returnNodes) {
  return this.upOrDownChain(returnNodes,false);
}
  
  // now find the widget lines which represent the prim fields which inherit from the child named k of this
tree.WidgetLine.inheritors = function (k) {
  var upc = this.upChain();
  var rs = [];
  var ln = upc.length;
  var i,u,und,ch;
  for (i=0;i<ln;i++) {
    u = upc[i];
    und = u.forNode();
    if (!und.hasOwnProperty(k)) {
      ch = u.treeSelect(k);
      if (ch) {
        rs.push(ch);
      }
    }
  }
  return rs;
}
  
tree.WidgetLine.fieldIsOverridden = function () {
  var k = this.forProp;
  var pr = this.treeParent();
  var upc,ln,i;
  if (!pr) {
    return false;
  }
  upc  = pr.upChain(true);
  ln = upc.length;
  for (i=0;i<ln;i++) {
    if (upc[i].hasOwnProperty(k)) return 1;
  }
  return false;
}
 
// selectChild is at the Element level. this is at the tree level
tree.WidgetLine.treeSelect = function (nm) {
  var rc,chel;
  if (this.__prim) return undefined;
  fc = this.__parent.forChildren;
  if (fc) {
    chel = fc[nm];
    if (chel) {
      return chel.w;
    }
  }
  return undefined;
}
  
tree.WidgetLine.treeSelectPath = function (path) {
  var ln = path.length;
  var idx = 0;
  var cw = this;
  var i,cpe,cw;
  for (var i=0;i<ln;i++) {
    var cpe = path[i];
    cw = cw.treeSelect(cpe)
    if (!cw) return undefined;
  }
  return cw;
}

tree.WidgetLine.selectedLine = function () {
  var tp = this.treeTop();
  return tp.__selectedLine;
}
  
  
tree.WidgetLine.highlightedPart = function () {
  if (this.__prim) {
    return this.__parent.title;
  } else if (this.__ref) {
    return this;
  } else {
    return this.__parent.main;
  }
}

tree.WidgetLine.unselectThisLine = function () {
  this.__selected = false;
  var el = this.highlightedPart();
  el.$css("background-color","white");
}
  
  
tree.WidgetLine.selectChildLine = function (nm) {
  var ch;
  this.expand();
  ch = this.treeChild(nm);
  if (ch) ch.selectThisLine('tree');
}

  
tree.WidgetLine.selectThisLine = function (src,forceRedisplay) { // src = "canvas" or "tree"
  var prnd,selnd,prp,nd,tp,isProto,isShapeTree,drawIt,ds,
    p,ps,sl,cntr,el,cht,coffy,ely,soff,hiddenBy;
  if (this.__prim) {
    prnd = this.forParentNode();
    selnd = prnd;
    prp = this.forProp;
  } else {
    nd = this.forNode();
    selnd = nd;
  }
  tree.selectedLine = this;
  if (this.__selected && !forceRedisplay) return;
  tree.selectedNode = selnd;
  if (prnd) return;
  tp = this.treeTop();
  isProto = tp.protoTree; // is this the prototype panel? 
  isShapeTree = !(isProto);// the shape panel 
  drawIt =  (src === "tree");
  if (isShapeTree && !ui.forDraw) tree.clearProtoTree();
  ds = tp.dpySelected;
 
  if (isProto) {
    p = pj.xpathOf(selnd,pj.root)
    ps = p.join(".");
  }
  sl = tp.__selectedLine;
  cntr = $(tp.__parent.__container);
  this.__selected = true;
  if (sl) sl.unselectThisLine();
  el = this.highlightedPart();
  el.$css("background-color",tree.highlightColor );
  tp.__selectedLine = this;
  // take  care of scrolling
  cht = cntr.height();
  coffy = cntr.offset().top;
  // now scroll the fellow into view if needed
  ely = el.$offset().top;
  soff = cntr.scrollTop();
  hiddenBy = ely - (coffy+cht); // how far is this element below the visible area?
  if (hiddenBy > -40) {
    cntr.scrollTop(soff + hiddenBy+40);
  } else {
    hiddenBy = coffy -ely;
    if (hiddenBy > -40) {
      cntr.scrollTop(soff-hiddenBy-40);
    }
  }
  pj.log("tree","SELECTION STAGE 1");
  if (isShapeTree) { // show the prototype in its panel
    if (this.__ref) {
      tree.showRef(this.refValue);
    } else {
      tree.showProtoChain(nd);
    }
  }
  if (drawIt) {
    selnd.__select('tree');
    pj.originalSelectionPath = undefined;
    tree.shownItem = selnd;

    pj.ui.enableTreeClimbButtons();
  }    
  pj.log("tree","SELECTION DONE");
}
  
tree.WidgetLine.ancestorIsSelected = function () {
  var pr;
  if (this.__selected) return true;
  pr = this.treeParent();
  if (!pr) return false;
  return pr.ancestorIsSelected();
}


tree.hiddenProperties = {__record:1,__isType:1,__record_:1,__mark:1,__external:1,__selected:1,__selectedPart__:1,__doNotBind:1,
                          __notes__:1,computedd:1,__descendantSelected:1,__fieldStatus:1,__source:1,__about:1,__UIStatus:1,__markProto:1,
                          __FieldType:1, __shifter:1,__repo:1,__computed:1,__internalized:1,__customControlsOnly:1,
                          __InstanceUIStatus:1,__UIWatched:1,__Note:1,__forMeasurment:1, data:1,__controlBoxes:1,
                          __editPanelName:1,__hideInEditPanel:1,__customBoxes:1,__controlBoxes:1,__idata:1,__dragVertically:1,
                          __dragHorizontally:1,__draggable:1,__sourceRelto:1,__adjustable:1,__requireDepth:1,__signature:1,
                          __newData:1,__updateCount:1,__originPath:1,__topLevel:1,
                          __overrides:1,__mfrozen:1,visibility:1,__current:1,transform:1,__sourcePath:1,__sourceRepo:1,
                          __beenModified:1,__autonamed:1,__origin:1,__from__:1,__objectsModified:1,__topNote:1,
                          __saveCount:1,__saveCountForNote:1,__setCount:1,__setIndex:1,__doNotUpdate:1,__components:1,__unselectable:1,
                          __listeners:1,transformm:1,noData:1,surrounders:1,__selectable:1,__eventListeners:1,dataSource:1,
                          __outsideData:1,attributes:1,__requires:1,categorized:1,categoryCount:1};
  
tree.frozenProperties = {dataSource:1};  
  
tree.hiddenProperty = function (p) {
  if (typeof p !== "string") return false;
  if (tree.hiddenProperties[p]) return 1;
  return (pj.beginsWith(p,"__fieldType")||pj.beginsWith(p,"__inputFunction__")||pj.beginsWith(p,"__status")||
          pj.beginsWith(p,"__uiWatched")|| pj.beginsWith(p,"__note"));
}
  
pj.Object.__fieldIsEditable = function (k) {
  var ch,tp;
  console.log('IS EDITABLE ',k);
  if (tree.frozenProperties[k]) {
    return false;
  }
  if (pj.internal(k) || tree.hiddenProperty(k)) return false; // for now;
  ch = this[k];
  tp = typeof ch;
  if (k==="data") return false;
  if (!this.__inWs()) {
    console.log(k,' NOT EDITABLE BECAUSE WS');
    return false;
  }
  if (tp === "function") return false;
  return !this.__fieldIsFrozen(k)
}
  
pj.Array.__fieldIsEditable = function (k) {
  var ch = this[k];
  var tp = typeof ch;
  if (tp === "function") return false;
  return true;
}
  
  
tree.hasEditableField = function (nd,overriden) { // hereditary'
  var k,ch;
  for (k in nd) {
    if (nd.__fieldIsEditable(k,overriden)) return true;
  
    ch = nd[k];
    if (pj.isNode(ch) && tree.hasEditableField(ch,chovr)) return true;
  }
  return false;
}
  
  
tree.WidgetLine.popNote= function () {
  var prp = this.forProp;
  var prnd,nt,nd;
  if (this.__prim) {
    prnd = this.forParentNode();
    if (prnd) {
      nt = prnd.__getNote(prp);
    }
  } else {
    nd = this.forNode();
    if (nd === pj.root) {
      nt = nd.__topNote;
    } else {
      nt = nd.__parent.__getNote(prp);
    }
  }
  if (nt) tree.viewNote(prp,nt);

}
 
var dontShowFunctionsFor = [pj.geom];
    
  function externalizeString (s) {
    var t = tree.viewableStringMaxLength;
    if (s.length > t) {
      s = s.slice(0,t) +"...";
    }
    return '"'+s+'"';
  }
    
  function dataString(dt) {
    var tp = typeof dt;
    var nms,a,v,c,tp;
    if ((tp === "string") || (tp === "number") ) return dt;
    if (pj.Object.isPrototypeOf(dt)) {
      nms = Object.getOwnPropertyNames(dt);
      a = [];
      nms.forEach(function (k) {
        if (!pj.internal(k)) {
          v = dt[k];
          if (v === null) v = "null";
          c = "";
          tp = typeof v;
          if (tp !== "object") {
            c += k+':';
            if (tp === "string") {
              c += externalizeString(v);
            } else if (tp === "number") {
              c += pj.nDigits(v, 2);
            } else {
              c += v;
            }
            a.push(c);
          }
        }
        //code
      });
      if (a.length > 0) {
        return "{"+a.join(",")+"}";
      }
    }
  }
  
  /* the correspondence between widgetLines and nodes is represented on the widgetLine side by the xpaths of the associated
   node: nodePath of non-prim widget lines and parentNodePath for prims. Nodes that have a corresponding widget line have
   the hasWidgetLine property. To look this line up, follow the node's xpath. */
  
pj.Object.__widgetLineOf = function () {d
  var pth,wl;
  if (!this.hasWidgetLine) {
    return undefined;
  }
  var pth = pj.xpathOf(this,pj.root);
  var wl = tree.mainTop.treeSelectPath(pth);
  return wl;
}
  
pj.Array.__fieldIsHidden = function (k) { return false;}
  
// should  property k of this be shown? Returns 0, "prim" "function" "ref" or "node"
pj.Object.__showInTreeP = function (k,overriden) {
  if (k === 'fill') {
    debugger;
  }
  var dataValue,hidden,vl,tp,isFun,editable,isob,isnd;
  if (this.__coreProperty(k)) return false; // a  property defined down in core modules of the proto chain.
  if (tree.hiddenProperty(k)) return false;
  if (k === "data") {
    dataValue = dataString(this.data);
    return dataValue?"prim":false;
  }
  hidden = this.__fieldIsHidden(k); // hidden from this browser
  if (hidden) return false;
  if (ui.forDraw && 0) {
    if (overriden || !(this.__atProtoFrontier() || this.hasOwnProperty(k))) {
      return false;
    }
  }
  vl = this[k];
  tp = typeof vl;
  isFun = tp === "function";

  if (isFun) {
    if (!tree.showFunctions) return false;
    if (dontShowFunctionsFor.indexOf(this.__parent()) >= 0) return false;// excludes eg geom functions
    return "function";
    
  }
  editable = this.__fieldIsEditable(k);
   if (tree.onlyShowEditable && !editable ) {
      return false;
  }
  isnd = pj.isNode(vl);
  if (isnd && !pj.treeProperty(this,k)) {
    if (!this.hasOwnProperty(k)) return false; // inherited references are not shown
    return "ref";
  }
  isob = tp === "object";
  if (isob && !isnd) return false;// Outside the tree
  return isnd?"node":"prim";
}
 
pj.Array.__showInTreeP = pj.Object.__showInTreeP;
tree.inputFont = "8pt arial";

tree.computeStringWd = function (s) {
   var wm = dom.measureText(s,tree.inputFont);
   return Math.max(20,wm+20)
}
 
pj.Object.__mkPrimWidgetLine = function (options) { // for constants (strings, nums etc).  nd is the node whose property this line displays
  var nd = this;
  var clickFun = options.clickFun;
  var isProto = options.isProto;
  var overriden = options.overridden;
  var k = options.property;
  var rs = Object.create(tree.WidgetLine);
  var atFrontier = rs.__atFrontier = nd.__atProtoFrontier(); // the next fellow in the prototype chain is outside the ws
  var ownp = nd.hasOwnProperty(k);
  var inherited = !ownp;
  var canBeInherited = pj.inheritableAtomicProperty(nd,k);
  var prnd = nd;
  var frozen = nd.__fieldIsFrozen(k);
  var el = html.Element.mk('<div style="padding-bottom:2px"></div>');
  var isFun,txt,qm,sp,vl,ovrEl,inheritedEl,editable,onInput,handleInput,inheritEl,notePop,inpwd,inp,enterH,ftp;

  el.set('w',rs);
  el.$click(function () {
    rs.selectThisLine("tree");
  });
  rs.__prim = true;
  rs.parentNodePath = pj.xpathOf(nd,pj.root);
  rs.forProp = k;
  isFun = typeof v === "function";
  txt = k;
  if (nd.__getNote(k)) {
    qm =  html.Element.mk('<span style="color:blue;margin-right:5px;cursor:pointer;font-weight:bold">?</span>');
    el.set("qm",qm);
    notePop = function () {rs.popNote()};
    qm.$click(notePop);
    sp =  html.Element.mk('<span style="cursor:pointer;color:cl;padding-right:5px">'+txt+'</span>');
    sp.$click(notePop);
  } else {
    sp =  html.Element.mk('<span style="padding-right:5px;font-size:small">'+txt+'</span>');

  }
  el.set("title",sp);
  ftp = nd.__getFieldType(k);
  // assumption: color and functino fields stay that way
  vl = nd[k];
  ovrEl = html.Element.mk('<span/>');
  ovrEl.$html(' overriden ');
  el.set('ovr',ovrEl);
  rs.ovr = ovrEl;
  if (!ui.forDraw) {
    inheritedEl = html.Element.mk('<span/>');
    inheritedEl.$html(' inherited ');
    el.set('inherited',inheritedEl);
    rs.inherited = inheritedEl;
  }
  editable = this.__fieldIsEditable(k);
  if (!editable) {
    inp =  html.Element.mk('<span/>');
    el.set("valueField",inp);
    rs.kind = "value";
    return rs;
  }
  
  if  (!ui.forDraw) {
    inheritEl = html.Element.mk('<span style="cursor:pointer;text-decoration:underline"> inherit </span>');
    el.set('inherit',inheritEl);
    rs.inherit = inheritEl;
  }
  

    //  the input field, and its handler
  onInput = function (chv) {
    debugger;
    var rsinh,event;
    if (typeof chv === "string") {
      page.alert(chv);
    } else if (chv) {
      ui.setSaved(false);
      rsinh = rs.upChain();
      rsinh.forEach(function (wlc) {
        if (!wlc.colorPicker) { //handled in __newColor__
          wlc.updateValue({});
        }
      }); 
        // special case, obviously
      if (k !== "backgroundColor"  ||  ui.draw) {
        if (rs.inherited) rs.inherited.$hide(); // this field is no longer inherited, if it was before
        if (rs.inherit) rs.inherit.$show();
      }
      //if (nd.__getUIWatched(k)) { //  || svg.isStateProperty(nd,k))) { 
        event = pj.Event.mk('UIchange',nd);
         event.property=k;
         event.emit();
      //}
      pj.tree.refresh();
      svg.main.updateAndDraw();
      pj.tree.refreshValues();
      //svg.draw();

    }
  }   
  doInherit = function () {
    var prt = Object.getPrototypeOf(nd);
    var dwc,cp,cl;
    delete nd[k];
    rs.updateValue({});
    dwc = rs.downChain();
    dwc.forEach(function (cm) {
      cm.updateValue({});
    });
    svg.draw();
  }
  if (!ui.forDraw) {
    inheritEl.$click(doInherit);
  }
    // put in a color picker
  if (ftp == "svg.Rgb") {
    cp = html.Element.mk('<input type="input" value="CP"/>');
    cl = nd[k];
    cl = cl?cl:"black";
    cp.__color__ = cl; // perhaps the inherited value
    cp.__newColor__ = function (color) {
      var cls,inh,icp;
      var chv = dom.processInput(inp,nd,k,inherited&&(!atFrontier),tree.computeStringWd,color);
      onInput(chv);
      cls = color.toRgbString();
      inh = rs.upChain();
      inh.forEach(function (wlc) {
        icp = wlc.colorPicker;
        if (icp) {
          $(icp.__element).spectrum("set",cls);
        }
      });
    }
    el.set("colorPicker",cp);
    rs.kind = "colorPicker";
    return rs;
  }
  if (ftp === 'boolean') {
    var sel = html.Element.mk('<select><option value="true">true</option><option value="false">no</option></select>');
    pj.selectSv = sel;
    sel[2].text = 'false';
    if (nd[k]) {
      sel[1].selected = true;
    } else {
      sel[2].selected = true;
    }
    //sel.selectedindex = 1;
    el.set('select',sel);
    sel.addEventListener("change",function () {
      var idx = sel.__element.selectedIndex;
      var value = (idx===0)?true:false;
      nd.set(k,value);
      dom.afterSetValue(nd);
      onInput(true);      
    });

    //sel.selectedIndex = 2;

    rs.kind = "boolean";
    return rs;
  }
    // the remaining case
    //put in a text input field 
  inpwd = 100;// this gets replaced anyway when the value is measured
  inp = html.Element.mk('<input type="input" value="" style="font-size:8pt;font:tree.inputFont;background-color:#e7e7ee;width:'+
                           inpwd+'px;margin-left:10pt"/>');
  handleInput = function () {
    var chv = dom.processInput(inp,nd,k,inherited,tree.computeStringWd);
    onInput(chv);
    return;
  }
  enterH = function (e) {    
    if((e.key === 13)||(e.keyCode === 13)) {
       handleInput();
    }
   }
  inp.addEventListener("blur",handleInput);
  el.set("inputField",inp);
  rs.kind = "input";
  inp.addEventListener("keyup",enterH);
  return rs;
}

// TO HERE
pj.Array.__mkPrimWidgetLine = pj.Object.__mkPrimWidgetLine;

// it is convenient to erase "inherited" when the user starts to type into the field
 
tree.stringLengthLimit = 60;
  // for prim widget lines only
tree.WidgetLine.updateValue = function (options) {
  var el = this.__parent;
  var ind = options.node;
  var nd=ind?ind:this.forParentNode();
  if (!nd) {
    debugger;
    return;
  }
  var atFrontier = this.__atFrontier;
  var k = this.forProp;
  var ds = (k === 'data')?dataString(nd.data):undefined;
  var vl = nd[k]; 
  var ovr = this.fieldIsOverridden(k);
  var ownp = nd.hasOwnProperty(k);
  var canBeInherited = pj.inheritableAtomicProperty(nd,k);
  var inherited =  !ownp;
  var isFun = typeof vl === "function";
  var ftp = nd.__getFieldType(k);
  // assumption: once a field is a color or function this remains true
  var editable = this.__fieldIsEditable(k);
  var prt = Object.getPrototypeOf(nd);
  var inheritEl,inheritedEl,ovrEl,proto,knd,vts,inf,cwd,cp,jel;
  if (isFun) return; // assumed stable
  if (!ui.forDraw) {
    inheritEl = el.inherit;
    inheritedEl = el.inherited;
    inheritedEl.setVisibility(inherited);
    if (inheritEl) inheritEl.setVisibility(canBeInherited);
  }
  ovrEl = el.ovr;
  if (ovrEl) {
    ovrEl.setVisibility(ovr);
  }
  proto =  Object.getPrototypeOf(nd);
  knd = this.kind;
  vts = ds?ds:pj.applyInputF(nd,k,vl);
  if (typeof vts === "number") {
    vts = pj.nDigits(vts,4);
  }
  if (knd === "input") {
    inf = el.inputField;
    inf.$prop("value",vts);// I don't understand why this is needed, but is
    inf.$attr("value",vts);
    cwd = tree.computeStringWd(vts);
    inf.$css("width",cwd+"px");
  } else if (knd == "colorPicker") {
    cp = el.colorPicker;
    cp.__color__ = vl; // perhaps the inherited value
    jel = $(cp.__element);
    if (jel) jel.spectrum("set",vl);

  } else {
    if (typeof vts === "string") {
      if (vts.length > tree.stringLengthLimit) {
        vts = vts.substr(0,tree.stringLengthLimit)+"...";
      }
    }
    if (el.valueField) {
      el.valueField.$html(vts);
    }
  }
}

  
tree.mkRangeWidgetLine = function (nd,lb,ub,increment) {
  // usually increment = (ub+1-lb) but not always for the last range
  var cl = "black";
  var rs = wline.instantiate();
  var txt,nm,tspan,nspan,cl;
  rs.__range = true;
  var pth = pj.xpathOf(nd,pj.root);
  rs.nodePath = pth;
  rs.lowerBound = lb;
  rs.upperBound = ub;
  rs.increment = increment;
  txt = "["+lb+"..."+ub+"]";
  m = rs.main;
  m.note.$hide();
  nspan = m.theName;
  nspan.html = txt;
  rs.id = txt;
  tspan = m.toggle;
  cl = function () {
    rs.toggle();
  };
  tspan.$click(cl);
 
  return rs;
}
  
    
tree.mkRangeWidgetLine = function (nd,lb,ub,increment) {
  // usually increment = (ub+1-lb) but not always for the last range
  var cl = "black";
  var rs = Object.create(tree.WidgetLine);
  var el = nonPrim.instantiate();
  var txt,m,nspan,tspan,cl,pth;
  el.set("w",rs);
  rs.__range = true;
  pth = pj.xpathOf(nd,pj.root);
  rs.nodePath = pth;
  rs.lowerBound = lb;
  rs.upperBound = ub;
  rs.increment = increment;
  txt = "["+lb+"..."+ub+"]";
  m = el.main;
  m.note.$hide();
  nspan = m.theName;
  nspan.$html(txt);
  rs.id = txt;
  tspan = m.toggle;
  cl = function () {
    rs.toggle();
  };
  tspan.$click(cl);
 
  return rs;
}
  
tree.mkRefWidgetLine = function (top,nd,k,v) { // for constants (strings, nums etc).  nd is the node whose property this line displays
  var rf = pj.refPath(v,top);
  var cl,rs,sp;
  if (!rf) return undefined;
  cl = "black";
  rs = tree.WidgetLine.mk({tag:"div",style:{color:cl}});
  sp =  html.Element.mk('<span>'+(k + " REF ")+'</span>');
  rs.set("ttl",sp);
  rs.$click(function () {
    rs.selectThisLine("tree");
  });
  rs.__ref =true;
  rs.refValue = v;
  return rs;
}


tree.WidgetLine.visible = function () {
  var pr;
  if (this.__treeTop) return true;
  pr = this.treeParent();
  return pr.visible() && pr.expanded;
}

// the workspace tree might have been recomputed or otherwise modified, breaking the two-way links between widgetlines
// and nodes. This fixes them up, removing subtrees where there are mismatches. It also installs new __values into primwidgetlines.

// returns true if this line does not have a match in the workspace, that is, if the parent needs reexpansion

// first parent which is not a range; that is, parent if ranges are passed through

tree.WidgetLine.nonRangeParent = function () {
  var rs = this.treeParent();
  if ( !rs) return undefined;
  if (rs.__range) {
    return rs.nonRangeParent();
  } else {
    return rs;
  }
}

// the corresponding operation going down the tree; goes past range nodes; accumulate in rs
tree.WidgetLine.childrenPastRanges = function (rs) {
  var frs,tch;
  if (!rs) {
     frs = [];
     this.childrenPastRanges(frs);
     return frs;
  }
  tch = this.treeChildren();
  if (!tch) return;
  tch.forEach(function (ch) {
    if (ch.__range) {
      ch.childrenPastRanges(rs);
    } else {
      rs.push(ch);
    }
  });                 
  }
 
  
  
      
  // for widgetlines whose forNode is an Array, check that counts match up on node and widget

tree.WidgetLine.checkRanges = function () {
  var nd = this.forNode;
  var fsz = this.rangesForSize;
  var tch,rs;
  if (fsz === undefined) {
    tch = this.treeChildren();
    rs = tch.length === nd.length;
  } else {
    rs  = fsz === nd.length;
  }
  pj.log("tree","checked range for",this.id," result=",rs);
  return rs;
}
  
 
//  only works and needed on the workspace side, not on protos, hence no ovr
// showProto shows the __values of __children, as inherited


tree.showRef = function (nd,dpysel) {
  var wl = tree.showProtoTop(nd,0);
  if (!wl) {
    return;
  }
  tree.setProtoTitle("Reference");
  tree.protoPanelShowsRef = true;
  wl.expand();
  return wl;
}
  
  // cause the tree below here to be expanded in the same places as src, when possible. For keeping the main and prototrees in synch 
   
tree.WidgetLine.expandLike = function (src,ovr) {
  var nms,thisHere;
  if (src.expanded) {
    this.expand(ovr);
    nms = src.childrenNames();
    thisHere = this;
    nms.forEach(function (nm) {
      var ch,mych,chovr;
      if (pj.internal(nm)) {
        return;
      }
      ch = src.treeSelect(nm);
      mych = thisHere.treeSelect(nm);
      if (mych) {
        chovr = ovr?ovr[nm]:ovr;
        if (chovr) mych.expandLike(chovr);
      }
    });
  } else {
    this.contract();
  }
  }
  
tree.WidgetLine.reExpand = function (force) {
  var ch = this.__parent.forChildren;
  if (!ch) {
    if (force) this.expand();
    return;
  }
  ch.removeChildren();
  ch.__reExpanding = true;
  this.expanded = false;
  this.expand();
  ch.__reExpanding = false;
}
  // assure that the __children are visible; unless there are more than tree.WidgetLine.maxChildren.
  //In this case, display only the target
  //  tree.WidgetLine.expand = function (targetName,showTargetOnly) {
  
tree.WidgetLine.expand = function (ovr,noEdit,__atFrontier) {
  var nd = this.forNode();
  var tp,isProto,isLNode,el,ch,newCh,lb,up,incr,toIter,nln,lg10,incr,dt,addLine,
    addRangeLine,addRanges;
  if (tree.onlyShowEditable && !tree.hasEditableField(nd,ovr)) return false;
  tp = this.treeTop();
  isProto = tp.protoTree && (!tree.protoPanelShowsRef);
  isLNode = pj.Array.isPrototypeOf(nd);
  if (this.expanded) return;
  el = this.__parent;
  ch = el.forChildren;
  if (!ch) {
    ch  = html.Element.mk('<div style="margin-left:25px"/>');
    el.addChild("forChildren",ch);
    newCh = true;
  } else {
    newCh = ch.__reExpanding;
    ch.$show();
  }
    
  tree.nameDec = "_t_";
  // primitive decoration scheme.  ch is an html element. Its children are the html elements for the children of the node it represents
  // These children must be named in a way that does not conflict with ch's properties such style or id.
  // So they are decorated with tree.nameDec ("_t_")
  
  addLine = function (ch,nd,k,tc) { // ch = element to add to nd = the parent, k = prop, tc = child
    var dk = tree.nameDec + k;
    var overriden,knd,options,ln;
    if (ch[dk]) return; //already there
    overriden = ovr && ovr[k];
    knd = nd.__showInTreeP(k,overriden);
    options = {addTo:ch,treeTop:tp,property:k};
    if (!knd) {
      return;
    } else if (knd === "node") {
      ln = tc.__mkWidgetLine(options);
    } else {
      ln = nd.__mkPrimWidgetLine(options);
    }
    if (ln) {
      ch.addChild(dk,ln.__parent);
      if (knd === "prim") ln.updateValue({node:nd});
    }
    return ln;
  }
  
  addRangeLine = function (nd,lb,ub,increment) { // nd = the parent, k = prop, tc = child
    var  ln = tree.mkRangeWidgetLine(nd,lb,ub,increment);
    ch.addChild(lb,ln.__parent);
    return ln;
  }

  addRanges= function (nd,lb,ub,incr) {
    var rk,rv,nln,ci,cub,lb,ub,incr,nln,lg10,dt;
    if (incr < 10) {
      for (rk=lb;rk<=ub;rk++) {
        rv = nd[rk];
        addLine(ch,nd,rk,rv);
      }
      return;
    }
    nln = ub+1-lb;
    ci = lb;
    cub = lb;
    while (cub  < ub) {
      cub = Math.min(ub,ci+incr-1);
      if ((cub + 1) >= ub) {
        cub = ub;
      }
      addRangeLine(nd,ci,cub,incr);
      ci = ci + incr;
    }
  }
  if (this.__range && newCh) {
    lb = this.lowerBound;
    ub = this.upperBound;
    incr = this.increment;
    incr = incr/10;
    addRanges(nd,lb,ub,incr);
    finishOff(this);
    return;
  }
  rs = undefined;
  if (newCh) { //new __children
    toIter =   function (tc,k) {
      addLine(ch,nd,k,tc);
    }   
    if (isLNode) {
      nln = nd.length;
      lg10 = Math.floor(Math.log(nln)/Math.log(10));
      incr = Math.pow(10,lg10);
      if (incr*2 > nln) {
        incr = incr/10;
      }
      addRanges(nd,0,nln-1,incr);
      this.rangesForSize = nln;
    } else {

       dt =  nd.data;
       if (dt) {
         addLine(ch,nd,"data",dt);
       }
       nd.__iterInheritedItems(toIter,tree.showFunctions,true); // true = alphabetical
    }
     // want prototype in there, though it is not enumerable
  } else {
    ch.$show();
  }
  finishOff = function (w){
    var el,tg;
    w.expanded = true;
    w.hasBeenExpanded = true;
    el = w.__parent;
    tg = el.main.toggle;
    tg.$html('&#9698;');

  }
  finishOff(this);
  return rs;
  }
  
tree.WidgetLine.fullyExpand = function (ovr,noEdit,__atFrontier) {
  var ch;
  if (pj.Array.isPrototypeOf(this.forNode)) {
    return;
  }
  this.expand(ovr,noEdit,__atFrontier);
  ch = this.treeChildren();
  if (ch) {
    ch.forEach(function (c) {
      var cnd,nm,covr;
      if (!c.__prim) {
        cnd = c.forNode;
        nm = cnd.__name;
        covr = ovr?ovr[nm]:undefined;
        c.fullyExpand(covr,noEdit,__atFrontier);
      }
    });
  }
  }

tree.WidgetLine.fullyExpandIfSmall = function(ovr,noEdit,__atFrontier) {
  var tsz = this.forNode().__treeSize(tree.hiddenProperties);
  if (tsz <= tree.fullyExpandThreshold) {
    this.fullyExpand(ovr,noEdit,__atFrontier);
  } else {
    this.expand(ovr,noEdit,__atFrontier);
  }
}

 

// this adds a Object into the widget tree structure. There are two cases
// If this's parent is in the tree, then whichTree is not needed
// ow, the node is being added to a multiRoot, given by whichTree.
// this is for the protos, which are rooted at i.

  
// find the range child, if any which contains n
tree.WidgetLine.findRangeChild = function (n) {
  var tc = this.treeChildren();
  var c0,rng,ln,i,c,lb,up;
  if  (tc && (tc.length)) {
    c0 = tc[0]; // if any __children are ranges, the first will be
    rng = c0.__range;
    if (rng) {
      ln = tc.length;
      for (i=0;i<ln;i++) {
        c = tc[i];
        lb = c.lowerBound;
        ub = c.upperBound;
        if ((lb <= n) && (n <= ub)) {
          return c;
        }
      }
    }
  }
  return undefined;
}


// this assures that the parent is expanded, and this node is visible
pj.Object.__expandToHere = function () {
  var wd = tree.findWidgetLine(this);
  var pr,pwd,n,cw,isLNode;
  if (wd && wd.visible()) {
    return;
  }
  pr = this.__parent;
  pr.__expandToHere();
  // pr might have range kids if pr is an Array
  pwd = tree.findWidgetLine(this);
  pwd.expand();
  isLNode = pj.Array.isPrototypeOf(pr);
  if (isLNode) {
    n = this.__name;
    cw = pwd;
    while (cw) {
      cw = cw.findRangeChild(n);
      if (cw) {
        cw.expand();
      }
    }
  }
}
  
  pj.Array.__expandToHere = pj.Object.__expandToHere;
 
  
tree.WidgetLine.contract = function () {
  // generates widget lines for the childern
  var el,ch,tg;
  if (!this.expanded) return;
  el = this.__parent;
  ch = el.forChildren;
  ch.$hide();
  this.expanded = false;
  tg = el .main.toggle;
  tg.$html('&#9655;');
}

tree.WidgetLine.assertOverridden = function (k) {
  var ch = this.treeSelect(k);
  if (ch) {
    var ovr = ch.ovr;
    if (ovr) {
      ovr.show();
    }
  }
}
    
  
// find the widget line for this node

tree.findWidgetLine = function (nd) {
  var pth = nd.__pathOf(pj.root);
  var tp = tree.tops[0];
  return tp.treeSelectPath(pth); 
}

tree.applyToTops = function (fn,except) {
  var tops = tree.tops;
  tops.forEach(function (tp) {
    if (tp  !== except) {
      fn(tp);
    }
  });
}

tree.forAllWidgetLines = function (fn) {
  var perTop = function (top) {
    top.forTreeDescendants(fn);
  }
  tree.applyToTops(perTop);
}

  
tree.refreshValues = function () {
  tree.forAllWidgetLines(function (w) {
    w.updateValue({});
  });
}

tree.WidgetLine.expandTops = function (except) {
  this.applyToTops(function (wl) {
    wl.expand();
  },except);
}

tree.expandTopsLike = function (wl) {
  var wtop = wl.treeTop();
  tree.applyToTops(function (tp) {
    tp.expandLike(wtop);
  },wtop);
}

tree.WidgetLine.toggle = function () {
  if (this.expanded) {
    this.contract();
  } else {
    this.expand();
  }
  tree.expandTopsLike(this);
 
}
pj.Array.expandWidgetLine = pj.Object.expandWidgetLine;
pj.Array.contractWidgetLine = pj.Object.contractWidgetLine;
pj.Array.toggleWidgetLine =  pj.Object.toggleWidgetLine;
 
tree.attachTreeWidget = function (options) {
  var div = options.div;
  var root = options.root;
  var wOptions = pj.Object.mk();
  var ds,wline;
  pj.setProperties(wOptions,options,["forProto","__inWs","__atFrontier"]);
  wOptions.top = 1;
  var ds = tree.dpySelected.instantiate();
  var wline = root.__mkWidgetLine(wOptions);
  ds.__draw(div); // interupt the Element tree here
  wline.__parent.__draw(div);
  wline.dpySelected = ds;
  return wline;
}
 
pj.Object.__atProtoFrontier = function () { // the next fellow in the prototype chain is outside the ws
  prnd = Object.getPrototypeOf(this);
  return (!prnd.__parent)||(!prnd.__inWs());
}
pj.Array.__atProtoFrontier = function () {
  return false;
}

tree.protoLines = [];
//n = nth in  proto chain.
// ovr is an object with __properties k:1 where k is overriden further up the
// chain, or k:covr , where covr is the ovr tree for prop k
tree.showProto = function (prnd,n,ovr) {
  var __inWs = prnd.__inWs();
  var atF,wl;
  if (__inWs) {
    atF =  !(Object.getPrototypeOf(prnd).__inWs());
  } else {
    atF = false;
  }
  wl = tree.showProtoTop(prnd,atF,__inWs,ovr);
  if (!wl) {
    return;
  }
  tree.protoTops.push(wl);
  tree.tops.push(wl);
  wl.expandLike(tree.mainTop,ovr);
}
tree.showWsOnly = true;
  
tree.showProtoChain = function (nd) {
  var cnd,n,ovr,addToOvr,__inWs,prnd,atF;
  tree.protoPanelShowsRef = false;
  tree.protoState = {nd:nd}
  tree.setProtoTitle("Prototype Chain");
  if (tree.protoDivRest) tree.protoDivRest.$empty();
  tree.protoTops = [];
  tree.tops = [tree.mainTop];
  cnd = nd;
  n = 0;
  ovr = {}; 
  // ovr is a tree structure which contains, hereditarily, the __properties set in the node nd,, rather than the prototype prnd
  // in other words, ovr shows what is overriden
  var addToOvr = function (nd,prnd,ov) {
    var op = Object.getOwnPropertyNames(nd);
    op.forEach(function (p) {
      var v = nd[p];
      var pv = prnd[p];
      var covr;
      if (pj.isAtomic(v)||(typeof v === "function")) {
        ov[p] = true;
      } else if (pj.treeProperty(nd,p)) {
        if (!pv) { // this branch did not come from a prototype
          return;
        }
        covr = ovr[p];
        if (!covr) {
          ovr[p] = covr = {};
        }
        addToOvr(v,pv,covr);
      }
    });
  }
  addToOvr(nd,Object.getPrototypeOf(nd),ovr);
  var __inWs = true;
  while (true) {
    prnd = Object.getPrototypeOf(cnd);
    if ((!prnd.__parent)||(prnd === cnd)) {
     return;
    }
    atF = __inWs && (!prnd.__inWs());
    if (atF) {
      if (tree.showWsOnly) {
        return; 
      }
      tree.protoDivRest.push(html.Element.mk("<div style='margin-top:10px;margin-bottom:10pt;width:100%;height:2px;color:white;background-color:red'>_</div>"));
      tree.protoDivRest.push(html.Element.mk("<div style='font-size:8pt'>The prototypes below are outside the workspace and cannot be edited</div>"));
      __inWs = false;
    }
    tree.showProto(prnd,n++,ovr);
    cnd = prnd;
    addToOvr(cnd,Object.getPrototypeOf(cnd),ovr);
  }
}
  
tree.refreshProtoChain = function () {
  var s= tree.protoState;
  if (s) {
    tree.showProtoChain(s.nd);
  }
}
tree.pathToTerm = function (pth,fromRoot) {
  var rs = "";
  pth.forEach(function (p) {
    if (p === "/") {
      return;
    } else if (p === ".") {
      rs = "ws";
      return;
    } else if (p === "") {
      return;
    } else if (typeof p === "string") {
      if (pj.beginsWith(p,"http://prototypejungle.org/")) {
        rs = p.substr(26);
        if (pj.endsIn(rs,"/item.js")) {
          rs = rs.substring(0,rs.length-8);
        }
      } else {
        if (rs === "") {
          rs = p;
        } else {
          rs += "."+p;
        }
      }
    } else {
      rs += "["+p+"]";
    }
  });
  return rs;
}
  
tree.withTypeName = function (nd,nm,top) {
  var ntu,rp,tpn;
  if (top) {
    if (nd === pj.root) {
      ntu = "ws";
    } else {
      rp = pj.xpathOf(nd,pj.root);
      if (rp) {
        ntu = tree.pathToTerm(rp,true);
      } else {
        pj.error('unexpected');
        //ntu = tree.pathToTerm(nd.__pathOf());
      }
    }
  } else {
    ntu = nm;
  }
  tpn=nd.__protoName();
  if (tpn === "Object" || ntu === tpn) {
    return ntu;
  } else {
    return ntu+ " : " + tpn;
  }
}

tree.shapeTextFun = function (nd) {
  var tnm = nd.__name;
  var nm = (typeof tnm === "undefined")?"root":tnm;
  return tree.withTypeName(nd,nm);
}
  
// n  is the index of this tree in the prototype chain

tree.setProtoTitle = function (txt) {
  if (!tree.showProtosInObDiv) tree.protoDivTitle.$html(txt);
}

tree.showProtosInObDiv = true;

// Treatment of which member of the prototype chain is under adjustment
var adjustRequestedFor;
var adjusteeFound = false;


  
  
  
tree.setWhatToAdjust = function (iindex) {
  //var index = (pj.selectedNode.inheritsAdjustment())?iindex:0;
  pj.log('adjust','setWhatToAdust',iindex);
  var index = (adjustRequestedFor === undefined)?iindex:adjustRequestedFor;
  var n;
  ui.whatToAdjust = tree.adjustingSubjects[index];
  ui.whatToAdjustIndex = index;
  ui.adjustInheritors = pj.inheritors(ui.whatToAdjust);//.concat(ui.whatToAdjust);
  pj.log("tree","WHAT TO ADJUST ",index,ui.whatToAdjust);
  n = 0;
  tree.adjustingCheckboxes.forEach(function (el) {
    el.__element.checked = index === n++;
  });
}
 
  
var addAdjustSelector = function (div,itm) {
    pj.log('adjust','addAdjustSelector');
    if (adjustmentOwnedBy) {
      return;
    }
  adjustmentOwnedBy = (itm.__ownsExtent && itm.__ownsExtent())?itm:undefined;
  var adjustingEl = html.Element.mk('<span style="padding-left:10px;font-style:italic">Adjusting this:</span>');
  var adjustingCheckbox,idx;
  div.addChild(adjustingEl);
  //adjustingEl.$hide();
  adjustingCheckbox = html.Element.mk('<input style="position:relative;top:3px" type="checkbox" />');
  div.addChild(adjustingCheckbox);
  //adjustingCheckbox.$hide();
  tree.adjustingSubjects.push(itm);
  tree.adjustingCheckboxes.push(adjustingCheckbox);
  tree.adjustingEls.push(adjustingEl);
  idx = tree.adjustingEls.length-1;
  adjustingCheckbox.$change(function (x) {
    if (adjustingCheckbox.__element.checked) {
      adjustRequestedFor = idx;
      tree.setWhatToAdjust();
    }
  });
 // ui.showAdjustSelectors();
}

// should be called when a particular custom control box is clicked, with the index of that box
// idx is defined for the custom boxes, and undefined for control boxes (extent adjusters)
ui.showAdjustSelectors = function () {
  console.log("SHOWADJUSTSELECTORS");
  pj.log('adjust','showAdjustSelectors');
  if (!tree.adjustingSubjects) {
    return;
  }
  var ln = tree.adjustingSubjects.length;
    pj.log('adjust','adustingSubects length',ln);
  if (i === 0) {
    return;
  }
  var adjusteeFound = false;
  var thisIsAdjustee = false;
  var holdsControl;
  var i;
  var startsWithMark = tree.adjustingSubjects[0].__mark;
  for (i=0;i<ln;i++) {
    var itm = tree.adjustingSubjects[i];
    var el = tree.adjustingEls[i];
    var checkbox = tree.adjustingCheckboxes[i];
    if (adjusteeFound) {
      el.$hide();
      checkbox.$hide();
    } else  {
      el.$show();
      checkbox.$show();
      /*if (idx === undefined) {  // for extent controllers
        // default is the selected item, if there is no "holds" function
        holdsControl = itm.__holdsExtent?itm.__holdsExtent():i===0;
      } else {
        holdsControl =itm.__holdsControlPoint?itm.__holdsControlPoint(idx,i===0):i===0;
      }*/
      //thisIsAdjustee = ((i === ln-1) && !adjusteeFound) || (i === adjustRequestedFor) || holdsControl || !Object.getPrototypeOf(itm).__inWs();
    //  thisIsAdjustee = (itm === adjustmentOwnedBy) || (startsWithMark && (i === 2));
      thisIsAdjustee = (itm === adjustmentOwnedBy) || (i === ln - 1);
      if (thisIsAdjustee) {
        adjusteeFound = true;
        tree.setWhatToAdjust(i);
      } else {
        checkbox.__element.checked = false;
      }
    }
  }
}
  // This does the display of each but the first element o of the prototype chain
tree.showProtoTop = function (o,__atFrontier,__inWs,ovr) {
  var editName,subdiv,divForProto,thisProto,rs,clickFun;
  if (o.__get('__hideInEditPanel')) {
    return;
  }
  editName = o.__get('__editPanelName');
  if (!editName) {
    editName = 'Prototype';
  }
  subdiv = tree.protoSubDiv.instantiate();
  if (tree.showProtosInObDiv) {
    divForProto = tree.obDiv;
    thisProto = html.Element.mk('<span>'+editName+'</span>');;
     subdiv.addChild(thisProto);
  } else {
    divForProto = tree.protoDivRest;
  }
  divForProto.addChild(subdiv);
  if (ui.nowAdjusting) addAdjustSelector(subdiv,o);
  subdiv.__draw();
  clickFun = function (wl) {
     pj.log("tree","CLICKKK ",wl);
    wl.selectThisLine("tree");
  }
  rs = tree.attachTreeWidget({div:subdiv.__element,root:o,__atFrontier:__atFrontier,__inWs:__inWs,forProto:true});
  rs.protoTree = true;
  return rs;
}


    

tree.clearProtoTree = function (o) {
  tree.protoDivRest.$empty();
}
    
    
tree.attachShapeTree= function (root) {
  var clickFun = function (wl) {
    pj.log("tree","CLICKKK ",wl);
    wl.selectThisLine("tree");
  }
  var tr,mtop;
  tree.obDivRest.$empty();
  tr = tree.attachTreeWidget({div:tree.obDivRest.__element,root:root,clickFun:clickFun,textFun:tree.shapeTextFun});
  if (tree.mainTop) {
    mtop = tree.mainTop;
    tree.mainTop = tr;
    tree.tops = [tr];
    tr.isShapeTree = true;
    tr.expandLike(mtop);
  } else {
    tree.mainTop = tr;
    tree.tops = [tr];
    tr.isShapeTree = true;
  }
}

  
tree.excludeFromProtos = {pj:1,fileTree:1,jqPrototypes:1,lightbox:1,geom:1,mainPage:1,top:1,trees:1,__draw:1};

tree.initShapeTreeWidget = function () {
  tree.attachShapeTree(pj.root);
  tree.mainTop.expand();
  tree.showProtoChain(pj.root);

}
// this is for the dual panel file browser
  
function pathsToTree (fls) {
  var sfls = fls.map(function (fl) {return fl.split("/")});
  var rs = {};
  sfls.forEach(function (sfl) {
    var  cnd = rs;
    var ln = sfl.length;
    var nm,nnd;
    for (var i=0;i<ln;i++) {
      nm = sfl[i];
      nnd = cnd[nm];
      if (!nnd) {
        if (i === (ln-1)) {
          cnd[nm] = "leaf";
        } else {
          cnd[nm] = nnd = {};
        }
      }
      cnd = nnd;
    }
  });
  return rs;
}


tree.itemTextFun = function (nd) {
  var nm = (typeof tnm === "undefined")?"root":tnm;
  if (nd.__parent) {
    nm = nd.__name;
  } else {
    nm = 'root';
  }
  return nm;
}
  
tree.itemClickFun = function (wl) {
  wl.selectThisLine();
}
   
tree.selectInTree = function (nd) {
  if (tree.enabled && nd) {
    nd.__expandToHere();
    var wd =  tree.findWidgetLine(nd); 
    if (wd) wd.selectThisLine("canvas",true);
  }
}
 

tree.selectPathInTree = function (path) {
  var nd;
  if (tree.enabled && path) {
    var nd = pj.evalXpath(pj.root,path);
    tree.selectInTree(nd);
  }
}
   

pj.attachItemTree= function (el,itemTree) {
 tree.itemTree = tree.attachTreeWidget({div:el,root:itemTree,clickFun:tree.itemClickFun,textFun:tree.itemTextFun,forItems:true});
 tree.itemTree.forItems = true;
}




tree.openTop = function () {
 tree.mainTop.expand();
}

var adjustmentOwnedBy = undefined; // while cruising down the proto chain, we don't wish to allow adjustments beyond the owner of adjustment

tree.showItem = function (itm,mode,noSelect,noName) {
  var editName,tpn,notog,subdiv,sitem,tr,atf;
  tree.shownItem = itm;
  if (!itm) {
    return;
  }
  tree.obDivRest.$empty();
  if (itm.__get('__hideInEditPanel')) {
    return;
  }
  editName = itm.__get('__editPanelName');
  if (!editName) {
    editName = 'Selected Item';
  }
  tpn = itm.__protoName();
  notog = 0 && mode==="fullyExpand";
  subdiv = tree.protoSubDiv.instantiate();
  tree.obDivRest.addChild(subdiv);
  if (!noName) {
    sitem = subdiv.addChild(html.Element.mk('<span>'+editName+'</span>'));
  }
  if (ui.nowAdjusting) {
    adjusteeFound = false;
    adjustRequestedFor = undefined;
    adjustmentOwnedBy = undefined;
    tree.adjustingSubjects = [];
    tree.adjustingEls = [];
    tree.adjustingCheckboxes = [];
    addAdjustSelector(subdiv,itm);
  }
  if (itm.__mark && (itm.__parent.__name === 'modifications')) {
    var revertBut = subdiv.addChild(html.Element.mk('<div class="roundButton">revert to prototype </div>'));
    revertBut.addEventListener("click",function () {
      var spread = itm.__parent.__parent;
      spread.unmodify(itm);
      //itm.__revertToPrototype(propertiesNotToRevert);
      itm.__update();
      itm.__draw();
      pj.tree.refresh();
      ui.nowAdjusting = false;
      ui.clearControl();
      //this.__setSurrounders();// highlight
      //pj.ui.unselect();
    });
  }
  tr = tree.attachTreeWidget({div:subdiv.__element,root:itm,textFun:tree.shapeTextFun,noToggle:notog});
  tree.mainTop = tr;
  tr.noToggle = notog;
  tr.isShapeTree = true;
  tree.tops = [tr];
  atf = itm.__atProtoFrontier();
  if (mode==="fullyExpand") {
    tr.fullyExpand(undefined,false,atf);
  } else if (mode==="expand") {
    tr.expand(undefined,false,atf);
  }  else if (mode ==="auto") {
    tr.fullyExpandIfSmall(undefined,false,atf);

  }
  tree.mainTree = tr;
  if (!noSelect) itm.__select('tree');
  subdiv.__draw();
}

tree.showItemAndChain = function(itm,mode,noSelect,noName) {
  adjustmentOwnedBy = undefined;
  tree.showItem(itm,mode,noSelect,noName);
  tree.showProtoChain(itm);
   ui.showAdjustSelectors();
}

tree.refresh = function () {
  var shownItem = tree.shownItem;
  if (shownItem) {
    tree.showItemAndChain(shownItem,'auto',true);
    //tree.showProtoChain(shownItem);
  }
}

 tree.getParent = function (top) {
  var sh,pr;
  // are we climbing from a different start point?
  if (!pj.originalSelectionPath || !pj.matchesStart(pj.selectedNodePath,pj.originalSelectionPath)) {
    pj.originalSelectionPath = pj.selectedNodePath;
  }
  sh = tree.shownItem;
  if (sh) {
    if (sh===pj.root) {
      return undefined;
    }
    if (top ) {
      pr = pj.root;
    } else {
      pr = sh.__parent;
      while (!pr.__isSelectable()) {
        pr = pr.__parent;
      }
    }
    return pr;
  }
  return undefined;
}
  
  // returns false if at root, true if there is another parent to go
tree.showParent = function (top,force) {
  var sh,pr;
  // are we climbing from a different start point?
  if (!pj.originalSelectionPath || !pj.matchesStart(pj.selectedNodePath,pj.originalSelectionPath)) {
    pj.originalSelectionPath = pj.selectedNodePath;
  }
  sh = tree.shownItem;
  if (sh) {
    if (sh===pj.root) {
      return [false,true];
    }
    if (top ) {
      pr = pj.root;
    } else {
      pr = sh.__parent;
      while (!pr.__isSelectable()) {
        pr = pr.__parent;
      }
    }
    tree.showItemAndChain(pr,"auto");
    //tree.showProtoChain(pr);
    return [pr !== pj.root,true];
  }
  return [false,false];
}

tree.showTop = function (force) {
  if (force) {
    debugger;
    tree.showItemAndChain(pj.root,"auto",'noSelect','noName');
  } else {
    tree.showParent(true);
  }
}

tree.refreshTop = function () {
  if (!tree.shownItem || (tree.shownItem === pj.root)) {
    tree.showTop('force');
  }
}
// down the originalSelectionPath - ie undoing showParents
// returns [hasParent,hasChild] 

tree.showChild = function () {
  var sh = tree.shownItem;
  var osp,cp,ln,oln,ci,ch;
  if (!sh) return [false,false];
  osp = pj.originalSelectionPath;
  cp = pj.selectedNodePath;
  if (osp) {
    if (!pj.matchesStart(cp,osp)) {
      pj.originalSelectionPath = undefined;
      return [sh!==pj.root,false];
    }
    ln = cp.length;
    oln = osp.length;
    if (oln === ln) return [true,false];
    ci = ln;
    ch = sh[osp[ci]];
    while ((ci < oln) && ch && !ch.__isSelectable()) {
      ci++;
      ch = ch[osp[ci]];
    }
    if (ch) {
      tree.showItemAndChain(ch,"auto");
      //tree.showProtoChain(ch);
      return [true,ci < (oln-1)];
    }
  }
  return [sh!==pj.root,false];
}

tree.selectionHasChild = function () {
  var osp = pj.originalSelectionPath;
  var cp = pj.selectedNodePath;
  if (!osp || !cp) return false;
  if (cp.length >= osp.length) return false;
  return pj.matchesStart(cp,osp);
}

tree.selectionHasParent = function () {
  var sh = pj.selectedNode;
  return (sh && (sh!==pj.root));
}
   
var lightbox = pj.Object.mk();
pj.lightbox = lightbox;

var Lightbox = lightbox.set("Lightbox",pj.Object.mk()).__namedType();
var box  = Lightbox.set("box",html.Element.mk('<div style="border:white black;position:absolute;z-index:5000;background-color:white;color:black"/>'));
        
var topLine = box.set("topLine",
  html.Element.mk('<div style="position:relative;width:100%;background-color:white;color:black;height:30px"></div>'));
              
topLine.set("closeX",
  html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;font-weight:bold;'+
                  'border:thin solid black;font-size:12pt;color:black">X</div>'));
topLine.set("content",html.Element.mk('<div/>'));
box.set("content",html.Element.mk('<div style="bbackground-color:red;z-index:1000"> This  should be replaced using setContent</div>'));

 
// replaced when popped
lightbox.shade =
  html.Element.mk('<div style="position:absolute;top:0px;left:0px;width:600px; height:100px;z-index:500;\
        opacity:0.8;background-color:rgba(0,0,0,0.5);color:white"/>');



lightbox.Lightbox.setTopline = function (ht) {
    this.topLine.html(ht);
}

lightbox.Lightbox.setContent = function (cn) {
  this.box.content.$empty();
  this.box.content.set("content",cn);
}


lightbox.Lightbox.setHtml = function (ht) {
  this.box.content.$css({"padding":"20px"});
  this.box.content.$html(ht);
}

lightbox.Lightbox.dismiss = function () {
  this.box.$hide();
  lightbox.shade.$hide();
}
  
lightbox.Lightbox.pop = function (dontShow,iht,withoutTopline) {
  debugger;
  this.render();
  var wd = $(document).width();
  var ht = $(document).height();
  var w = $(window);
  var stop = w.scrollTop();
  var bht = w.height();
  var bwd = w.width();
  var r = this.rect;
  var lwd = r.extent.x;
  var eht,cn,dims;
  /* center the fellow */
  var lft = Math.max((bwd - lwd)/2,50);
  if (iht) {
    var eht = iht;
  } else {
    eht = Math.max(bht - (r.extent.y) - 50,50);
  }
  if (withoutTopline) {//for the chooser
    eht = Math.min(bht -  100,400);
  }
  this.box.$show();
  this.box.$css({'background-color':'white'});
  var cn = this.box.content;
  cn.$css({height:eht+"px"});
  var dims = {position:"absolute",width:lwd+"px",height:(eht+"px"),top:(stop+35)+"px",left:(lft+"px"),"z-index":3}
  this.box.$css(dims);
  lightbox.shade.$css({width:(wd+"px"),height:(ht+"px"),top:"0px",left:"0px","z-index":2});
  if (this.iframe) {
    this.iframe.attr("width",this.width-25);
  }
  if (!dontShow) {
    lightbox.shade.$show(); 
    this.box.$show();
    if (withoutTopline) {
      this.box.topLine.$hide();
    } else {
      this.box.topLine.$show();
    }
  } else {
    this.dismiss();
  }
}
  

 lightbox.Lightbox.afterClose = function () {
   if (this.afterCloseCallback) {
     this.afterCloseCallback();
   }
 }
 
 
 lightbox.Lightbox.activateClose = function (whenClosed) {
   var thisHere = this;
   this.box.topLine.closeX.$click(function () {
     thisHere.dismiss();thisHere.afterClose();if (whenClosed) whenClosed();});
 }

lightbox.Lightbox.render = function (dontDismiss) {
  var bx = this.box;
  var thisHere,wd,shade,b;
  if (bx.__element) {
    return; // already rendered 
  }
  var thisHere = this;
  var wd =this.container.offsetWidth;    
  var shade = lightbox.shade;
  if (pj.mainPage) {
    var b = pj.mainPage.__element;
  } else { 
    b = document.body;
  }
  if (!shade.__element) {
    shade.__addToDom(b);
  }
  bx.__addToDom(b);
  shade.$hide();
}

  
  
// msg might be a string or an element

lightbox.Lightbox.popMessage = function (msg,centerIt) {
  this.pop();
  this.element.empty();
  this.addClose();
  if (typeof(msg) === 'string') {
    var msgdiv = $('<div/>');
    msgdiv.css({"margin":"20px"});
    if (centerIt)  msgdiv.css({'text-align':'center'});
    msgdiv.html(msg);
  } else {
    msgdiv = msg;
  }
  this.element.append(msgdiv);
}



 lightbox.Lightbox.setRect = function (rect) {
   this.rect  = rect;
   var c = rect.corner;
   var ex = rect.extent;
   var css = {left:(c.x)+"px",top:(c.y)+"px",width:(ex.x)+"px",height:(ex.y)+"px"};
   this.box.css(css);
   this.box.content.css({height:(ex.y-50)+"px",width:(ex.x-20)+"px"});
 }
  


lightbox.newLightbox =  function (rect,content) {
  var rs = lightbox.Lightbox.instantiate();
  rs.set("rect",rect.instantiate());
  if (content) {
    rs.setContent(content);
  }
  rs.container = document.body;
  rs.activateClose();
  return rs;
}
 
pj.noSession = 1;

ui.testPost = function () {
  console.log("TEST POST");
  var url = "http://54.145.180.180/api/anonSave";
  debugger;
  pj.ajaxPost(url,{testData:234},function (rs) {
    debugger;
  },function (rs) { // the error callback
    debugger;
  });
}

})(prototypeJungle);
