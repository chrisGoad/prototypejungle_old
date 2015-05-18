/* generates common elements of the html pages */
if (typeof prototypeJungle === "undefined") {
  var prototypeJungle = {};
}


(function (pj) {
  
  var ui = pj.ui;


// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract
 
   // lightboxes without dependencies
  var lightBoxWidth = 500;
  var lightBoxHeight = 400;
  var atMain  = location.href.indexOf("http://prototypejungle.org")===0;
  var host = (ui.isDev)?"http://prototype-jungle.org:8000":"http://prototypejungle.org";
  var signedIn = pj.signedIn();
  ui.releaseMode = 1; // until release, the signin and file buttons are hidden                
               
  // for communication between pages on prototypejungle.org, and prototype-jungle.org
  ui.messageCallbacks = {}; // for each opId (eg "saveSource"), function to which to dispatch replies

  
  ui.dispatchMessageCallback = function(opid,rs) {
    var cb = ui.messageCallbacks[opid];
    if (cb) cb(rs);
  }
  

  var messageListenerAdded = 0;
  ui.addMessageListener = function () {
    if (messageListenerAdded) return;
    window.addEventListener("message",function (event) {
      var jdt = event.data;
      var dt = JSON.parse(jdt);
      if (dt.postDone) {
        localStorage.lastSessionTime = pj.seconds();
      }
      ui.dispatchMessageCallback(dt.opId,dt.value);
    });
    messageListenerAdded = 1;
  }
  
  
  // For active pages, worker.html is loaded into an iframe from http://prototype-jungle.org (where the real work, non-s3, goes on)
  // the chooser is also loaded from that domain. postMessage is used for cross frame communication
  
  function workerWindow() {
    var ifrm = document.getElementById('workerIframe');
    return ifrm.contentWindow;
  }
  
   
  ui.sendWMsg = function (msg) {
    var wwin = workerWindow();
    wwin.postMessage(msg,"*");
  }
  

  ui.sendTopMsg = function(msg) {
    // dont send a message to yourself
    if (window !== window.top) {
      window.top.postMessage(msg,"*");
    }
  }
  var openItemBut;
  
  var fileBut;
  ui.genButtons = function (container,options,cb) {
    var signedIn = pj.signedIn();
    var domain = 'http://prototype-jungle.org';
    if (ui.isDev) {
      domain += ":8000";
    }
    if (pj.ui.forDraw) {
      var wp = pj.devVersion?"/worker_nosessiond.html":"/worker_nosession.html";
    } else {
       wp = pj.devVersion?"/workerd.html":"/worker.html";
    }
   $('#workerIframe').attr('src',domain+wp);
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
   
    if (includeFile) {
      openItemBut = addButton('openItem',"File");
      openItemBut.click(function () {
        ui.popChooser('open');
      });
    }
    var qs = ui.parseQuerystring();
    if (qs.intro) {
       addButton('charts','Charts','/charts'); 
    } else {
     addButton('tutorial','Charts Intro ','/charts?intro=1'); 
    } 
    addButton('github','GitHub ','https://github.com/chrisGoad/prototypejungle/tree/r2');
    addButton('tech','Docs',host+"/doc/choosedoc.html");
    addButton('about','About',host+"/doc/about.html");
    if ((!ui.forDraw) && (signedIn || ui.releaseMode)) { //(atTest || atInspect || !atMain) && !down && (!toExclude || !toExclude['sign_in'])) {
      ui.logoutButton = addButton('logout','logout',"http://"+ui.liveDomain+"/logout");
      ui.signInButton = addButton('sign_in',"Sign in","http://"+ui.liveDomain+"/sign_in");
      if (signedIn) {
        ui.signInButton.style.display = "none";
        ui.logoutButton.style.display = "";
      } else {
        ui.logoutButton.style.display = "none";
        ui.signInButton.style.display = "";
      }
    }
    if (cb) cb();
  }
   
  ui.nowLoggedOut = function () {
      debugger;
      pj.clearStorageOnLogout();
       localStorage.signedIn=0;
       ui.signInButton.style.display = "";
       ui.logoutButton.style.display = "none";
     }
 
    // called from the worker if here at s3 we think the user is logged in, but he is not
  ui.messageCallbacks.notSignedIn = function () {
    ui.nowLoggedOut();
  }
   
  // for use at prototypejungle.org
  
  ui.signInOutHandler = function () {
    debugger;
    if (ui.atLive) { // || ui.isDev) {
      return;
    }
    var hr = location.href;
    var signedIn = hr.indexOf("#signedIn=1")>0;
    if (signedIn) { // at dev, the sessionId will have been set
      debugger;
      localStorage.lastSessionTime = pj.seconds();
      var m = hr.match(/handle\=([^\&]*)/);
      localStorage.signedIn = 1;
      if (m) {
        localStorage.handle = m[1];  //code
      }
    } else if (hr.indexOf("#logout=1")>0) {
      pj.clearStorageOnLogout();
    }
  }

//end extract

  
})(prototypeJungle);


