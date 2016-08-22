(function (pj) {

var geom=pj.geom,dat=pj.dat,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui;tree=pj.tree;lightbox=pj.lightbox;
"use strict"


if (!ui) {
  ui = pj.set("ui",pj.Object.mk());
}
ui.sessionTimeout = 24 * 60 * 60;
//ui.useCloudFront =  0;
//ui.useS3 = 1;
//ui.cloudFrontDomain = "d2u4xuys9f6wdh.cloudfront.net";
//ui.s3Domain = "prototypejungle.org.s3.amazonaws.com";
//ui.messageCallbacks = {};   // for communication between pages on prototypejungle.org, and prototype-jungle.org
//ui.itemDomain = "prototypejungle.firebaseapp.com";//ui.useCloudFront?"d2u4xuys9f6wdh.cloudfront.net":"prototypejungle.org";
//ui.setUIconstants = function () {
//ui.atLive = location.href.indexOf('http://prototype-jungle.org')===0;
//ui.liveDomain = pj.devVersion?"prototype-jungle.org:8000":"prototype-jungle.org";
//ui.useMinified = !pj.devVersion;
//if (pj.devVersion) {
//  ui.homePage = "/indexd.html";
//}
//}
//ui.itemHost = "https://"+ui.itemDomain;//"http://prototypejungle.org";

ui.homePage = "";
//pj.activeConsoleTags = (ui.isDev)?["error","updateError","installError"]:["error"];//,"drag","util","tree"];

var ui = pj.ui;
if (!ui) {
  ui = pj.ui = {};
}

var fileBut,signInButton,signOutButton;


var setSignInOutButtons1 = function () { 
  if (ui.currentUser) {
    signInButton.style.display = "none";
    signOutButton.style.display = "inline";
  } else {
    signInButton.style.display = "inline";
    signOutButton.style.display = "none";
  }
}


ui.setSignInOutButtons = function () {
  ui.setCurrentUser(setSignInOutButtons1);
  return;
  if (!ui.currentUser) {
    var  auth = firebase.auth();
    ui.currentUser = auth.currentUser;
    if (!ui.currentUser) {
      debugger;
      auth.onAuthStateChanged(function(user) {
        debugger;
        ui.currentUser = user;
        setSignInOutButtons1();
      });
      return;
    }
  }
  setSignInOutButtons1();
}


ui.signIn = function  () {
  debugger;
  if (ui.currentUser) {
    ui.setSignInOutButtons();
    return;
  }
  sessionStorage.setItem('preSigninUrl',location.href);
  location.href = "/sign_in.html";
  return;
  var auth = firebase.auth;
  var provider = new auth.TwitterAuthProvider();
  //auth().signInWithPopup(provider).then(function(result) {
  auth().signInWithRedirect(provider).then(function(result) {
    debugger;
    ui.currentUser = result.user;
    ui.setSignInOutButtons();
  }).catch(function(error) {
  console.log('error');
  });
}

ui.signOut = function () {
  if (ui.currentUser) {
    var auth = firebase.auth();
    auth.signOut().then(function () {
      ui.currentUser = undefined;
      ui.setSignInOutButtons();
      alert('signnout')
    })
  }
}

/*
var authHandler = function (error, authData) {
  debugger;
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Authenticated successfully with payload:", authData);
    ui.authData = authData;
    ui.setSignInOutButtons();
  }
}

*/

/*
var signOut = function () {
  debugger;
  ui.sendWMsg(JSON.stringify({apiCall:"/api/signout",postData:'none',opId:"signOut"}));
}
*/

ui.genButtons = function (container,options,cb) {
  var toExclude,down,includeFile,qs;
  var toExclude = options.toExclude;
  var down = options.down;
  var includeFile = options.includeFile;
  function addButton(id,text,url) {
    if (down && (id==="file" || id==="sign_in")) return;
    if (toExclude && toExclude[id]) return;
    if (url) {
      var rs = document.createElement('a');
      rs.className = "ubutton";
      rs.setAttribute('href',url);
    } else {
      var rs = document.createElement('a');
      rs.className = "ubutton";
    }
    rs.innerHTML = text;
    container.appendChild(rs);
    return rs; 
  }
  function addSpan(text) {  
    var rs = document.createElement('span');
    rs.className = "topbarSpan";
    rs.innerHTML = text;
    container.appendChild(rs);
    return rs; 
  }
  //qs = {};// ui.parseQuerystring();
  if (!pj.comingSoon) {
    addButton('tutorial','Intro ','/edit.html?source=/repo1/startchart/column.js&intro=1');
  }
  addButton('github','GitHub ','https://github.com/chrisGoad/prototypejungle/tree/firebase');
  addButton('tech','Docs',"/doc/choosedoc.html");
  addButton('about','About',"/doc/about.html");
  signOutButton = addButton('signOut','Sign out');
  signOutButton.addEventListener('click',ui.signOut);
  signInButton = addButton('signIn','Sign in');//,'https://prototype-jungle.org/sign_in.html');
  signInButton.addEventListener('click',ui.signIn);

  ui.setSignInOutButtons();
  if (cb) {
    cb();
  }
}

ui.standaloneInit = function () {
  var topbar = document.getElementById('topbarInner');
  ui.genButtons(topbar,{});
}



var geom = pj.geom;
var treePadding = 0;
var bkColor = "white";
var docDiv;
var minWidth = 1000;
var plusbut,minusbut;
var flatInputFont = "8pt arial";
var uiDiv,editDiv,topbarDiv,obDivTitle;
var msgPadding = "5pt";
var inspectDom = false;
var uiWidth;
ui.fitMode = false;
ui.editMode = false;
ui.insertMode = false;
var unpackedUrl,unbuiltMsg;
//ui.docMode = 1;
ui.saveDisabled = false; // true if a build no save has been executed.

var buttonSpacing = "10px";
var buttonSpacingStyle = "margin-left:10px";
 var jqp = pj.jqPrototypes;
 // the page structure
var mainTitleDiv = html.wrap('mainTitle','div');
// note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed. 
  var test=html.Element.mk('<div class="roundButton">Top</div>');
  
var mpg = ui.mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).addChildren([
  topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",height:"10px",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).addChildren([
    
  actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').addChildren([
      ui.fileBut = html.Element.mk('<div class="ubutton">File</div>'),
      ui.replaceBut = html.Element.mk('<div class="ubutton">Alternate Marks</div>'),
     ui.viewDataBut = html.Element.mk('<div class="ubutton">View/Change Data</div>'),
      ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')
    ]),
    ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
  ]),

  cols = html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').addChildren([
    
    ui.docDiv = docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
    
    ui.svgDiv = html.Element.mk('<div id="svgDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
      tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').addChildren([
  //    tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;width:600px;padding-left:4px;float:right;border:solid thin black"/>').addChildren([
        ui.noteSpan = html.Element.mk('<span>Click on things to adjust them. To navigate part/subpart hierarchy:</span>'),
        ui.upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
        ui.downBut =html.Element.mk('<div class="roundButton">Down</div>'),
        ui.topBut =html.Element.mk('<div class="roundButton">Top</div>')
        ])
     ]),
    
     tree.objectContainer = uiDiv = html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"/>').addChildren([
       tree.obDivRest = tree.obDiv = html.Element.mk('<div id="obDiv" style="position:absolute;background-color:white;border:solid thin blue;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>').addChildren([
         html.Element.mk('<div style="margin-bottom:0px;border-bottom:solid thin black"/>').addChildren([
                              obDivTitle = html.Element.mk('<span style="margin-bottom:10px;border-bottom:solid thin black">Workspace</span>')
        ]),
      ])
    ]),
     
    ui.editContainer =  html.Element.mk('<div id="editContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').addChildren([
      html.Element.mk('<div style="margin-bottom:5px"></div>').addChildren([
        ui.closeEditBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),
        ui.editTitle = html.Element.mk('<span style="font-size:8pt;margin-left:10px;margin-right:10px">Data source:</span>'),
        ui.editMsg =html.Element.mk('<span style="font-size:10pt">a/b/c</span>'), 
     ]),
     ui.editError =html.Element.mk('<div style="margin-left:10px;margin-bottom:5px;color:red;font-size:10pt">Error</div>'),
      ui.editButtons = html.Element.mk('<div id="editButtons" style="bborder:solid thin red;"></div>').addChildren([
         ui.changeDataSourceBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Change Source</div>'),
         ui.uploadBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Upload</div>'),
      ]),
       ui.editDiv = html.Element.mk('<div id="editDiv" style="border:solid thin green;position:absolute;">Edit Div</div>')
    ]),
    
    /* the insert container is not currently in use */
    ui.insertContainer =  html.Element.mk('<div id="insertContainer" style="border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').addChildren([
       ui.insertButtons = html.Element.mk('<div id="insertButtons" style="border:solid thin red;"></div>').addChildren([
         ui.doInsertBut =html.Element.mk('<div style = "margin-left:30px" class="roundButton">Insert</div>'),
         ui.closeInsertBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

       ]),
       ui.insertDiv = html.Element.mk('<div id="insertDiv" style="border:solid thin green;position:absolute;"></div>').addChildren([
          ui.insertIframe = html.Element.mk('<iframe width="99%" style="overflow:auto" height="200" scrolling="yes" id="insertIframe" />')
      ])
    ]),
    
    ui.replaceContainer =  html.Element.mk('<div id="replaceContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').addChildren([
      ui.replaceButtons = html.Element.mk('<div id="replaceButtons" style="margin-left:10px"></div>').addChildren([
       html.Element.mk('<span>Click to replace the marks with:</span>'),
       ui.closeReplaceBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

      ]),
      ui.replaceDiv = html.Element.mk('<div id="replaceDiv" style="position:absolute;"></div>').addChildren([
       ui.replaceDivCol1 = html.Element.mk('<div id="col1" style="cursor:pointer;borderr:thin solid black;position:absolute;margin-left:20px;margin-top:40px"></div>'),
       ui.replaceDivCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;margin-right:20px;borderr:thin solid green;float:right;margin-top:40px"></div>')
      ])
   ])
 ])
]);
  
 

  
  ui.intro = false;
   
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = true;
ui.layout = function(noDraw) { // in the initialization phase, it is not yet time to __draw, and adjust the transform
  // aspect ratio of the UI
  var bkg = "gray";
  var svgwd = 500;
  var svght = 500;
  var ar = 0.48//0.5;
  var pdw = 0;// minimum padding on sides
  var wpad = 0;
  var vpad = 0;//minimum sum of padding on top and bottom
  var cdims = geom.Point.mk(svgwd,svght);
  var awinwid = $(window).width();
  var awinht = $(window).height();
  var pwinwid = awinwid - 2 * wpad;
  var pwinht = awinht - 2 * vpad;
  if (pwinht < ar * pwinwid) { // the page is bounded by height 
    var pageHeight = pwinht;
    var pageWidth = pageHeight/ar;
    var lrs = (awinwid - pageWidth)/2;  
  } else { // the page is bounded by width
    var pageWidth = pwinwid;
    var pageHeight = ar * pageWidth;
  }
  if (ui.includeDoc) {
    var docTop = pageHeight * 0.8 - 20;
    var docHeight = awinht - pageHeight - 30;
  }
  var  twtp = 2*treePadding;
  var actionWidth  = 0.5 * pageWidth;
  var docwd = 0;
  if (ui.intro) {
    var docwd = 0.25 * pageWidth;
    uiWidth = 0.25 * pageWidth;
  } else if (ui.replaceMode) {
    docwd = 0;
    uiWidth = pageWidth/3;
  } else if (ui.editMode) {
    uiWidth = pageWidth/2;
  } else {
    docwd = 0;
    uiWidth = 0.25 * pageWidth;
    svgwd = 0.75 * pageWidth;
  }
  svgwd = pageWidth - docwd - uiWidth;
  //ui.uiWidth  = uiWidth; //debugging
  var treeOuterWidth = uiWidth;///2;
  var treeInnerWidth = treeOuterWidth - twtp;
  mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-0)+"px"});
  var topHt = 20+topbarDiv.__element.offsetHeight;
  cols.$css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
  ui.ctopDiv.$css({"padding-top":"0px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});
  var actionLeft = ui.includeDoc?docwd +10 + "px":"200px";
  actionDiv.$css({width:(actionWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
  var actionHt = actionDiv.__element.offsetHeight;//+(isTopNote?25:0);
  topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px","padding-top":"10px"});
  var svght = pageHeight - actionHt -0;
  var panelHeaderHt = 26; // the area above the object/code/data/component panels 
  var treeHt = svght;
  tree.myWidth = treeInnerWidth;
  var tabsTop = "20px";
  tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
  ui.svgDiv.$css({id:"svgdiv",left:docwd+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
  ui.svgHt = svght;
  if (ui.editMode) {
    ui.editContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.editDiv.$css({top:"80px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
    ui.editContainer.$show();
    uiDiv.$hide();
    ui.insertContainer.$hide();
    ui.replaceContainer.$hide();
  } else if (ui.insertMode) {
    ui.insertContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
    ui.insertDiv.$css({top:"20px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
    ui.insertContainer.$show();
    uiDiv.$hide();
    ui.editContainer.$hide();
    ui.replaceContainer.$hide();
  } else if (ui.replaceMode) {
    var rwd = (2/3) * uiWidth;
    ui.replaceContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth+ "px"),height:(svght-0)+"px"});
    ui.replaceDiv.$css({top:"20px",left:"0px",width:(uiWidth+ "px"),height:(svght-20)+"px"});
    ui.insertContainer.$hide();
    ui.replaceContainer.$show();
    uiDiv.$hide();
    ui.editContainer.$hide();
  } else {
    uiDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")});
    uiDiv.$show();
    ui.editContainer.$hide();
    ui.insertContainer.$hide();
    ui.replaceContainer.$hide();

  }
  docDiv.$css({left:"0px",width:docwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
  svg.main.resize(svgwd,svght); 
   svg.main.positionButtons(svgwd);
   var noteWidth = Math.min(svgwd-40,570);
   var noteLeft = 0.5 * (svgwd - 40 - noteWidth);
   tree.noteDiv.$css({left:noteLeft+"px",width:noteWidth +"px"});

//   tree.noteDiv.$css({"left":(ui.intro?0:90)+"px","width":(svgwd - (ui.intro?10:140))+"px"});
   //tree.noteDiv.$css({left:"20px",width:svgwd +"px"});
   if (firstLayout) {
     firstLayout = false; 
     ui.layout(noDraw);
   }
   if (!noDraw) {
     svg.main.fitContents();
   }
}
  

/* data sectioon */

/*update the current item from data */

ui.updateFromData =function (dataString,url,cb) {
  debugger;
  var data;
  var ds = dat.findDataSource();
  if (!ds) {
    return;
  }
  var dataContainer = ds[0];
  try {
    data = JSON.parse(dataString);
  } catch (e) {
    debugger;
    ui.editError.$html(e.message);
    return;
  }
  ui.editError.$html('');
  var dt = pj.lift(data);
  dt.__sourceRelto = undefined;
  dt.__sourcePath = url;
  dt.__requireDepth = 1; // so that it gets counted as a require on externalize
  dataContainer.__idata = undefined;
  try {
    dataContainer.setData(dt);
  } catch (e) {
    debugger;
    if (e.kind === dat.badDataErrorKind) {
      ui.editError.$html(e.message);
    }
    return;
  }
  svg.main.updateAndDraw();
  pj.tree.refreshValues();
  if (cb) {
    cb();
  }
}

ui.viewData  = function (dataString) {
  if (!ui.editMode) {
    ui.editMode = true;
    ui.replaceMode = false;
    ui.layout();
  }
  var htmlString = '<pre>'+dataString+'</pre>';
  ui.editDiv.$html(htmlString);
}

ui.viewAndUpdateFromData =  function (dataString,url,cb) {
  ui.viewData(dataString);
  ui.updateFromData(dataString,url,cb);
}

ui.getDataJSONP = function (url,initialUrl,cb,dontUpdate) {
  pj.returnData = function (dataString) {
      if (dontUpdate) {
         ui.viewData(rs,url);
        if (cb) {
          cb();
        }
      } else {
        ui.viewAndUpdateFromData(dataString,initialUrl,cb);
      }
    }
  pj.loadScript(url);
}

ui.getDataJSON = function (url,initialUrl,cb,dontUpdate) {
  debugger;
  pj.httpGet(url,function (erm,rs) {
    if (dontUpdate) {
       ui.viewData(rs);
      if (cb) {
        cb();
      }
    } else {
      ui.viewAndUpdateFromData(rs,initialUrl,cb);
    }
  });
}

ui.getData = function (url,initialUrl,cb,dontUpdate) {
  debugger;
  var ext = pj.afterLastChar(initialUrl,'.');
  if (ext === 'json') {
    ui.getDataJSON(url,initialUrl,cb,dontUpdate);
  } else if (ext === 'js') {
    ui.getDataJSONP(url,initialUrl,cb,dontUpdate);
  }
}

ui.uploadBut.$click(function () {
  ui.editDiv.$html('<iframe width = "100%" height="100%" src="/upload.html"></iframe>');
});
  
ui.changeDataSourceBut.$click(function () {
   ui.getDirectory(function (list) {
     ui.popChooser(list,'dataSource');
  });
})
  
  

ui.viewDataBut.$click(function () {
  ui.hideFilePulldown();
  var ds = dat.findDataSource();
  if (ds) {
    debugger;;
   
    //ui.saveEditBut.$html('Save data');
    ui.editTitle.$html('Data source:')
    var url = ds[1];
    var afterFetch = function () {ui.editMsg.$html(url);};
    if (url[0] === '[') { // url has the form [uid]path .. that is, it is a reference to a user's database, which in turn points to storage
      var iurl = pj.interpretUrl(url).url;
      pj.httpGet(iurl,function (erm,rs) {
                debugger;
                ui.getData(JSON.parse(rs),url,afterFetch);
              });
    } else { // a direct url at which the data itself is present
      ui.getData(url,url,afterFetch);
    }
  }
});

/* end data section */ 

/*begin chooser section */
ui.closer = html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;'+
         'font-weight:bold,border:thin solid black;font-size:12pt;color:black">X</div>');

var chooserClose = ui.closer.instantiate();
ui.chooserIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="chooser" />');
var chooserDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="chooserDiv" />').addChildren([
  chooserClose,
  ui.chooserIframe
]);
var chooserBeenPopped = false;
    
ui.loadAndViewData = function (path) {
  debugger;
  var ext = pj.afterLastChar(path,'.');
  var path0 = path[0];
  var viaDatabase = path0 === '/';  // url has the form [uid]path .. that is, it is a reference via the user's database, which in turn points to storage
  if (viaDatabase) {
    if ((ext === 'js') || (ext === 'json')) {
      if (pj.beginsWith(path,'/')) {
         var rpath = path.replace('.',pj.dotCode);
         var uid = ui.currentUser.uid;
         var url = ui.firebaseHome+'/'+uid+'/directory'+rpath+'.json';
         var displayUrl = '['+uid+']'+path;
       } else {
         pj.error('CASE NOT HANDLED YET');
       }
       pj.httpGet(url,function (erm,rs) {
         var cleanUp = ui.removeToken(JSON.parse(rs));
         ui.getData(cleanUp,displayUrl,function () {
               ui.editMsg.$html(displayUrl);
         });    
       });
    } else {
      pj.error('Data files should have extension js or json')
    }
  } else {
    ui.getData(path,path,function () {
               ui.editMsg.$html(path);
         });
  }
}

  
ui.chooserReturn = function (v) {
  debugger;
  mpg.chooser_lightbox.dismiss();
  switch (ui.chooserMode) {
    case'saveAs':
      ui.saveItem(v.path);
      break;
   case'saveAsSvg':
     debugger;
      ui.saveItem(v.path,undefined,1.25);
      break;
   case 'insertOwn':
      insertOwn(v);
      break;
    case 'open':
      if (v.deleteRequested) {
        ui.deleteFromDatabase(v.path);
        return;
      }
     var ext = pj.afterLastChar(v.path,'.',true);
     if (ext) {
       ui.directoryValue(v.path,function (err,iurl) {
         debugger;
         url = ui.removeToken(iurl);
         if (ext === '.svg') {
           location.href = '/svg.html?svg='+encodeURIComponent(url);
         } else {
           location.href = '/viewtext.html?file='+encodeURIComponent(url);

         }
       });
       return;
     }
     var storeRefString = ui.storeRefString();
      var url = '/' + storeRefString +  v.path;
      var page = 'edit.html';//pj.devVersion?'editd.html':'edit.html';
      var dst = '/'+page+'?'+(pj.endsIn(url,'.js')?'source=':'item=')+url;
      location.href = dst;
      break;
    case "viewSource":
      ui.getEditText("/"+v.path);
      break;
    case "dataSource":
     debugger;
      var path = v.path;
      ui.loadAndViewData(path);
      break;
  }
}
   
ui.popChooser = function(keys,operation) {
  debugger;
  if (operation === 'saveAsSvg') {
    ui.aspectRatio = svg.main.aspectRatio();
  }
  ui.chooserKeys = keys; // this is where the chooser gets its data
  ui.chooserMode = operation;
  //ui.chooserMode = 'open';
  if (mpg.lightbox) {
    mpg.lightbox.dismiss();
  }
  var lb = mpg.chooser_lightbox;
  var src = '/chooser.html';//(pj.devVersion)?"/chooserd.html":"/chooser.html";
  if (!chooserBeenPopped) {
    lb.setContent(chooserDiv);
    chooserBeenPopped = true;

  } else {
    ui.chooserIframe.__element.src = src;
  }
  window.setTimeout(function () {lb.pop(undefined,undefined,1);ui.chooserIframe.__element.src = src},300);
}
  
chooserClose.$click(function () {
  mpg.chooser_lightbox.dismiss();
});

/* end chooser section */

/* file options section */
  
var fsel = ui.fsel = dom.Select.mk();

fsel.containerP = html.Element.mk('<div style="position:absolute;padding-left:5px;padding-right:5px;padding-bottom:15px;border:solid thin black;background-color:white"/>');

fsel.optionP = html.Element.mk('<div class="pulldownEntry"/>');
        
//var fselJQ;
 
ui.initFsel = function () {
  if (pj.developerVersion) {
    fsel.options = ["New Item","New Scripted Item","Open...","Insert Chart...","Add title/legend","Insert own item  ...","View source...","Save","Save As...","Save As SVG..."]; 
    fsel.optionIds = ["new","newCodeBuilt","open","insertChart","addLegend","insertOwn","viewSource","save","saveAs","saveAsSvg"];
  } else {
    fsel.options = ["Open...","Add title/legend","Save","Save As...","Save As SVG..."]; 
    fsel.optionIds = ["open","addLegend","save","saveAs","saveAsSvg"];
  }
 var el = fsel.build();
 el.__name = undefined;
  mpg.addChild(el);
  el.$hide();
}

ui.hideFilePulldown = function () {
 if (pj.ui.fsel) { 
    pj.ui.fsel.hide();
  }
}
  
  
ui.setFselDisabled = function () {
   // ui.setPermissions();
   if (!fsel.disabled) {
      fsel.disabled = {};
   }
   var disabled = fsel.disabled;
   disabled.new = disabled.insertOwn = disabled.save = disabled.saveAs = disabled.saveAsSvg  = !ui.currentUser;

   //fsel.disabled.editText =  !ui.textSelected();
   //fsel.disabled.addLegend = !ui.designatedChart();
   fsel.updateDisabled();
}


var notSignedIn = function () {
  location.href = "https://prototype-jungle.org/sign_in.html"
}


ui.nowInserting = undefined;
ui.startInsert = function (url,name) {
  ui.points = [];
  ui.nowInserting = {name:name,url:url};
}

ui.completeInsert = function (svgPoint) {
  console.log('completing insert at ',JSON.stringify(svgPoint));
  ui.insertItem(ui.nowInserting.url,ui.nowInserting.name,svgPoint);
}
var listAndPop = function (opt) {
  ui.getDirectory(function (list) {
    ui.popChooser(list,opt);
  });
}

ui.hasTitleLegend = function () {
  var  ds = dat.findDataSource();
  if (!ds) {
    return {};
  }
  var dt = ds[0].getData();
  return {hasTitle:!!dt.title,hasLegend:!!dt.categories};
}

ui.addTitleAndLegend = function () {
  var after = function () {
    svg.main.fitContents();
    pj.tree.refreshTop();
    ui.legendAdded = true;
    fsel.disabled.addLegend = 1;

  }
  if (ui.legendAdded) {
    return;
  }
  var htl = ui.hasTitleLegend();
  if (htl.hasTitle && htl.hasLegend) {
    ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',function () { //svg.main.fitContents();return;
      ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',after);
    })
  } else if (htl.hasTitle) {
    ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',after);//svg.main.fitContents();});
  } else if (htl.hasLegend) {
    ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',after);//svg.main.fitContents();});
  }
}


fsel.onSelect = function (n) {
  var opt = fsel.optionIds[n];
  if (fsel.disabled[opt]) return;
  switch (opt) {
    case "delete":
      confirmDelete();
      break;
    case "new":
      var chartsPage = ui.useMinified?"/charts":"/chartsd";
      location.href = chartsPage;
      break;
    case "save":
      ui.resaveItem(pj.root);
      break;
    case "addTitle":
      ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title');
      break;
    case "addLegend":
      ui.addTitleAndLegend();
      return;
      debugger;
      var htl = ui.hasTitleLegend();
      if (htl.hasTitle && htl.hasLegend) {
        ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',function () { //svg.main.fitContents();return;
          ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',function () {
            svg.main.fitContents();
          });
        })
      } else if (htl.hasTitle) {
        ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',function () {svg.main.fitContents();});
      } else if (htl.hasLegend) {
        ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',function () {svg.main.fitContents();});
      }
  
     // ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend');
      break;
    case "open":
    case "insertOwn":
    case "saveAs":
    case "saveAsSvg":
    case "viewSource":
      ui.getDirectory(function (list) {
        debugger;
        ui.popChooser(list,opt);
      });
      break;
  case "insertShape":
    ui.popInserts('shapes');
    break;
  case "insertChart":
    ui.popInserts('charts');
    break;
  }
}
 
ui.fileBut.$click(function () {
  ui.setFselDisabled();
  dom.popFromButton("file",ui.fileBut,fsel.domEl);
});

/* end file options section */

 
var aboveOffset = geom.Point.mk(20,-10);
var toRightOffset = geom.Point.mk(20,10);

var whereToInsert,positionForInsert;
var afterInsert = function (e,rs) {
  debugger;
  var irs = rs.instantiate();
  pj.root.set(whereToInsert,irs);
  if (positionForInsert) {
    irs.__moveto(positionForInsert);
  }
  if ((insertKind === 'legend') || (insertKind === 'title')) {
    var  ds = dat.findDataSource();
    irs.forChart = ds[0];
    irs.__newData = true;
    irs.__update();
    var irsBounds = irs.__bounds();
    var chartBounds = irs.forChart.__bounds();
    debugger;
    if (insertKind === 'title') {
      var above = chartBounds.upperLeft().plus(
                  geom.Point.mk(0.5*irsBounds.extent.x,-0.5*irsBounds.extent.y)).plus(aboveOffset);
      irs.__moveto(above);
    } else {
      var toRight = chartBounds.upperRight().plus(
                  geom.Point.mk(0.5*irsBounds.extent.x,0.5*irsBounds.extent.y)).plus(toRightOffset);
      irs.__moveto(toRight);
    }
  //  svg.main.fitContents();
    if (insertKind === 'legend') {
      irs.setColorsFromChart();
    }
  }
  ui.refresh();
  if (ui.nowInserting) {
    irs.__select('svg');
    ui.nowInserting = undefined;
  }
}
  
ui.insertItem = function (path,where,position,kind,cb) {
  debugger;
  insertKind = kind;
  positionForInsert = position;
  whereToInsert = where;
  pj.install(path,function (erm,rs) {
    debugger;
    afterInsert(erm,rs);
    if (cb) {cb()}
  });
}

var installSettings;

var doReplacement = function (e,rs) {
  debugger;
  var irs = rs.instantiate();
  if (installSettings) {
    irs.set(installSettings);
  }
  irs.__hide();
  pj.replaceableSpread.replacePrototype(irs);
}

ui.replaceItem = function (path,settings) {
  installSettings = settings;
  pj.install(path,doReplacement);
}

var insertOwn = function (v) {
  debugger;
  ui.insertItem('/'+v.path,v.where);
}
  
/* begin buttons in the svg panel */

ui.addButtons = function (div,navTo) {
 var plusbut,minusbut,navbut;
 var divel = div.__element;
 ui.plusbut = plusbut = html.Element.mk('<div id="plusbut" class="button" style="position:absolute;top:0px">+</div>');
 ui.minusbut = minusbut = html.Element.mk('<div id="minusbut" class="button" style="position:absolute;top:0px">&#8722;</div>');
 ui.navbut = navbut = html.Element.mk('<div id="navbut" class="button" style="position:absolute;top:0px">'+navTo+'</div>');
 plusbut.__addToDom(divel);
 minusbut.__addToDom(divel);
 navbut.__addToDom(divel);
}


ui.positionButtons = function (wd) {
  if (ui.plusbut) {
    ui.plusbut.$css({"left":(wd - 50)+"px"});
    ui.minusbut.$css({"left":(wd - 30)+"px"});
    ui.navbut.$css({"left":"0px"});
  }
}

  
  function enableTreeClimbButtons() {
    var isc = tree.selectionHasChild();
    var isp = tree.selectionHasParent();
    ui.upBut.$show();
    ui.topBut.$show();
    ui.downBut.$show();
    enableButton(ui.upBut,isp);
    enableButton(ui.topBut,isp);
    enableButton(ui.downBut,isc);
  }
 
 ui.enableTreeClimbButtons = enableTreeClimbButtons;

ui.topBut.$click(function () {
  if (ui.topBut.disabled) return;
  var top = tree.getParent(1);
  if (top) {
    top.__select('svg');
  }
  //tree.showTop();
  enableTreeClimbButtons();
});

ui.upBut.$click (function () {
  if (ui.upBut.disabled) return;
  var pr = tree.getParent();
  if (pr) {
    pr.__select('svg');
  }
  //tree.showParent();
  enableTreeClimbButtons();
});


ui.downBut.$click(function () {
  if (ui.downBut.disabled) return;
  tree.showChild();
  enableTreeClimbButtons();
});

  
/* end buttons in the svg panel */
  
ui.setInstance = function (itm) {
  if (!itm) {
    return;
  }
  ui.topBut.$show();
  ui.upBut.$show();
  tree.showItemAndChain(itm,'auto');
  enableTreeClimbButtons();
  return;
}

pj.selectCallbacks.push(ui.setInstance); 

  
ui.elementsToHideOnError = [];
  // a prototype for the divs that hold elements of the prototype chain
tree.protoSubDiv = html.Element.mk('<div style="background-color:white;margin-top:20px;border:solid thin green;padding:10px"/>');
ui.errorDiv =  html.wrap('error','div');
ui.elementsToHideOnError.push(cols);
ui.elementsToHideOnError.push(actionDiv);
ui.elementsToHideOnError.push(docDiv);
tree.obDiv.click = function () {dom.unpop();};
  
tree.viewNote = function(k,note) {
  var h = k?'<b>'+k+':</b> '+note:note;
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(h)
  return;
}

function mkLink(url) {
   return '<a href="'+url+'">'+url+'</a>';
 } 

 
ui.saveItem = function (path,cb,aspectRatio) { // aspectRatio is only relevant for svg, cb only for non-svg
  debugger;
  var needRestore = !!cb;
  var savingAs = true;
  var isSvg = pj.endsIn(path,'.svg');
  ui.unselect();
  pj.saveItem(path,pj.root,function (err,path) {
    debugger;
    // todo deal with failure
    if (err) {
      ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
      return;
    } else if (cb) {
      cb(null,path);
      return;
    }
    if (isSvg) {
      var loc = '/svg.html?svg='+encodeURIComponent(path);
    } else {
      var loc = '/edit.html?item=/'+path;//(pj.devVersion?'/editd.html':'/edit.html')+'?item=/'+path;
    }
    location.href = loc;

  },aspectRatio);
}

ui.canbeResaved = function (itm) {
   var path = itm.__sourcePath;
   var repo = itm.__sourceRepo;
   return path && !(pj.endsIn(path,'.js')) &&  ui.stripPrototypeJungleDomain(repo);
}


ui.resaveItem = function (itm) {
  debugger;
  var doneSaving = function () {ui.messageElement.$hide();};
  if (ui.canbeResaved(itm)) {
    var repo = ui.stripPrototypeJungleDomain(itm.__sourceRepo);
    var path = itm.__sourcePath;
    var fullPath = repo+"/"+path;
    ui.displayMessage(ui.messageElement,'Saving...');
    ui.saveItem(fullPath,doneSaving);
  } else {
  }
}

/* Replacement section */

ui.getReplacements = function (selnd) {
  var spread = pj.ancestorThatInheritsFrom(selnd,pj.Spread);
  if (spread && spread.replacements) {
    return spread.replacements();
  }
}


var repDiv = html.Element.mk('<div style="displayy:inline-block"/>');
repDiv.set('img',html.Element.mk('<img width="150"/>'));
repDiv.set('txt',html.Element.mk('<div style="text-align:center">TXT</div>')); 

ui.replaceBut.$click(function () {
  debugger;
  ui.hideFilePulldown();
  var i;
  var replacements =  pj.replaceableSpread.replacements();//ui.getReplacements(pj.selectedNode);
  if (!replacements) {
    return;
  }
  ui.insertMode = false;
  ui.editMode = false;
  ui.replaceMode = true;
  ui.layout();
  ui.replaceDivCol1.$empty();
  ui.replaceDivCol2.$empty();
  var ln = replacements.length;
  var repEls1 = [];
  var repEls2 = [];
  var allEls = [];
  var highlightEl = function (el) {
    allEls.forEach(function (anEl) {
      if (anEl === el) {
        anEl.$setStyle('border','solid  red');
      } else {
        anEl.$setStyle('border','solid thin black');
      }
    });
  }
  var mkClick = function (el,dest,settings) {
    return function() {
      highlightEl(el);
      debugger;
      ui.unselect();
      ui.replaceItem(dest,settings)};
  }
  for (i=0;i<ln;i++) {
    var replacement = replacements[i];
    var repEl = repDiv.instantiate();// replacement.svg;
    repEl.img.width = (uiWidth/2 - 40)+'';
    repEl.img.src = replacement.svg;
    repEl.txt.$html(replacement.title);
    repEl.$click(mkClick(repEl,replacement.url,replacement.settings));
    if (i%2) {
      repEls2.push(repEl);
    } else {
      repEls1.push(repEl);
    }
    allEls.push(repEl);
  }
  ui.replaceDivCol1.addChildren(repEls1);
  ui.replaceDivCol2.addChildren(repEls2);
  highlightEl(allEls[allEls.length-1]); // by convention the original proto is la
  
  });
/* end Replacement section */


ui.closeSidePanel = function () {
  if (!ui.insertMode && !ui.editMode && !ui.replaceMode) {
    return;
  }
  ui.insertMode = false;
  ui.editMode = false;
  ui.replaceMode = false;
  ui.layout();
}


ui.closeEditBut.$click(ui.closeSidePanel);

ui.closeInsertBut.$click(ui.closeSidePanel);
 


ui.closeReplaceBut.$click(ui.closeSidePanel);


ui.alert = function (msg) {
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(msg);
}

var disableGray = "#aaaaaa";

var enableButton = ui.enableButton = function (bt,vl) {
  bt.disabled = !vl;
  bt.$css({color:vl?"black":disableGray});
}

ui.disableButton = function (bt) {
  enableButton(bt,false);
}


  
ui.itemSaved = true; 
 
/*
  ui.messageCallbacks.insertChart = function (v) {
    debugger;
  }
  */
  var mpg = ui.mpg;
  /*
   ui.checkSignedIn = function (cb) {
    ui.currentUser = firebase.auth().currentUser;
    ui.setSignInOutButtons();
  }
    */
  ui.processIncomingItem = function (rs,cb) {
    pj.root = rs;
    pj.replaceableSpread = pj.descendantWithProperty(pj.root,'replacements');
    //rs.__sourceRepo = pj.repo;
    //rs.__sourcePath = pj.path;
    var bkc = rs.backgroundColor;
    if (!bkc) {
      rs.backgroundColor="white";
    }
    if (cb) {
      cb(undefined,rs);
    }
  }
  
  ui.installNewItem = function () {
    var itm = pj.root;
    svg.main.addBackground(pj.root.backgroundColor);
    var mn = svg.main;
    if (mn.contents) {
      dom.removeElement(mn.contents);
    }
    mn.contents=pj.root;
    if (itm.__draw) {
      itm.__draw(svg.main.__element); // update might need things to be in svg
    }
    if (itm.soloInit) { 
      itm.soloInit(); 
    }
    ui.refresh(ui.fitMode);
  }


function displayDone(el,afterMsg) {
  ui.displayMessage(el,"Done");
  setTimeout(function () {
    ui.displayMessage(el,afterMsg?afterMsg:"");
  },500);
}


  
ui.setSaved = function (){}; // stub called from ui

  
  
  ui.genMainPage = function (cb) {
    if (pj.mainPage) return;
    pj.mainPage = mpg;
    if (ui.includeDoc) {
      mpg.addChild("doc",ui.docDiv);
    }
    ui.mpg.__addToDom(); 
    svg.main = svg.Root.mk(ui.svgDiv.__element);
    svg.main.activateInspectorListeners();
    svg.main.addButtons("View");      
    $('.mainTitle').click(function () {
      location.href = "http://prototypejungle.org";
    });
    ui.enableButton(ui.upBut,false);
    ui.enableButton(ui.topBut,false);
    ui.enableButton(ui.downBut,false);
    ui.genButtons(ui.ctopDiv.__element,{}, function () {
      var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
      var insertR = geom.Rectangle.mk({corner:[0,0],extent:[700,500]});
       var lb = lightbox.newLightbox(r);
      lb.box.$css({"padding-left":"20px"}); 
      mpg.set("lightbox",lb);
      mpg.set("insert_lightbox",lightbox.newLightbox(insertR));
      mpg.set("chooser_lightbox",lightbox.newLightbox(insertR));
      if (!pj.replaceableSpread) {
        ui.disableButton(ui.replaceBut);
      }
      if (!dat.findDataSource()) {
        ui.disableButton(ui.viewDataBut);
      }
      var htl = ui.hasTitleLegend();
      fsel.disabled.addLegend = ui.legendAdded || !(htl.hasTitle || htl.hasLegend);
      $('body').css({"background-color":"#eeeeee"});
      if (typeof(pj.root) == "string") {
        ui.editButDiv.$hide();
        ui.editMsg.$hide();
        if (pj.root === "missing") {
          var msg = "404 No Such Item"
        } else {
          msg = "Load failed ";
        }
        ui.svgDiv.setHtml("<div style='padding:100px;font-weight:bold'>"+msg+"</div>");
        pj.root = pj.mkRoot();
      } else {
        cb();
      }
    });
  }
    

  // set some vars in ui. from the query
  
  function processQuery(iq) {
    var q = ui.parseQuerystring();
    var itm = q.item;
    var intro = q.intro;
    if (q.source) {
      ui.source = decodeURIComponent(q.source);
    }
    if (q.config) {
      ui.configUrl = decodeURIComponent(q.config);
    }
    ui.addLegendOnStart = q.addLegend;
    if (intro) {
      //ui.source = "http://prototypejungle.org/sys/repo3|example/bar_chart.js";
      ui.intro = true;
      ui.docDiv.src = "/doc/intro.html"; 
    } else {
      ui.docDiv.$hide();
    }
    if (itm) {
      //var itms = itm.split("|");
      //pj.repo = itms[0];//"http://prototypejungle.org/"+itms[1]+"/"+itms[2];
      pj.path = itm;//itms[1];//itms.slice(3).join("/");
    } else {
      pj.repo=q.repo;
      pj.path=q.path?pj.stripInitialSlash(q.path):undefined;
    }
    //if (q.cf) { // meaning grab from cloudfront, so null out the urlmap
    //  pj.urlMap = undefined;
    //  pj.inverseUrlMap = undefined;
    //}
    if (!pj.path) {
      return false;
    }
    var psp = pj.path.split("/");
    var pln = psp.length;
    ui.itmName = psp[pln-2];
    ui.handle = psp[1];
    ui.url = pj.path; //pj.repo+"/"+pj.path;
    ui.includeDoc = q.intro;
    return true; 
  }
  // the default 
  ui.config =  {insert_chart:'http://prototypejungle.org/sys/repo1/test/insert_chart.html'};
  
  ui.initPage = function (o) {
    ui.inInspector = true;
    var q = ui.parseQuerystring();
    if (!processQuery(q)) {
      var noUrl = true;
    }
          pj.tlog("document  ready");
          $('body').css({"background-color":"#eeeeee",color:"black"});
          ui.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a ui-back inadvertantly
          //ui.addMessageListener();
            function afterInstall(e,rs)  {
              debugger;
              if (e === "noUrl") {
                //ui.shareBut.$css('color','gray');
              }
               pj.tlog("install done");
              if (e) {
                if (!rs) {
                  rs = svg.tag.g.mk(); 
                  rs.__isAssembly = true;
                }
                if (e !== "noUrl") rs.__installFailure = e;
              } 
              ui.processIncomingItem(rs,function (err) {
                ui.initFsel();
                ui.genMainPage(function () {
                  pj.tlog("starting build of page");
                  var ue = ui.updateErrors && (ui.updateErrors.length > 0);
                  if (ue || (e  && (e !== "noUrl"))) {
                    if (ue) {
                      var emsg = '<p>An error was encountered in running the update function for this item: </p><i>'+pj.updateErrors[0]+'</i></p>';
                     } else if (e) {
                      var emsg = '<p style="font-weight:bold">'+e.message+'</p>';
                    }
                    ui.errorInInstall = emsg;
                    ui.svgDiv.$html('<div style="padding:150px;background-color:white;text-align:center">'+emsg+'</div>');                  
                  }
                  ui.installNewItem();
                  ui.layout(); 
                  tree.initShapeTreeWidget();
                  if (ui.addLegendOnStart) {
                    ui.addTitleAndLegend(function () {svg.main.fitContents();pj.tree.showTop('force');});
                  }
                  return;
                  ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',function () { //svg.main.fitContents();return;
                    ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',function () {
                      svg.main.fitContents();
                    });
                  });

                  //ui.setSignInOutButtons();
                });
              });
            }
            pj.tlog("Starting install");
            if (ui.configUrl) {
               pj.returnValue= function (err,item) {
                 ui.config = item;
                // afterInstall("noUrl");
              }
              pj.loadScript(ui.configUrl);
            }
            if (ui.source) {
              pj.main(ui.source,afterInstall);
            } else if (pj.path) {
              var fpath = 'https://prototypejungle.firebaseio.com'+pj.path+'.json?callback=prototypeJungle.assertItemLoaded';
              debugger;
              pj.install(fpath,afterInstall); 
            } else {
              afterInstall("noUrl");
            }
            $(window).resize(function() {
                ui.layout();
                if (ui.fitMode) svg.main.fitContents();
              });   
  }

})(prototypeJungle);
