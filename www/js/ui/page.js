/* generates common elements of the html pages */
if (typeof prototypeJungle === "undefined") {
  var prototypeJungle = {};
}


(function (pj) {
  var om = pj.om;
  var ui = pj.ui;


// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract
 
   // lightboxes without dependencies
  var lightBoxWidth = 500;
  var lightBoxHeight = 400;
  var atMain  = location.href.indexOf("http://prototypejungle.org")===0;
  var host = (ui.isDev)?"http://prototype-jungle.org:8000":"http://prototypejungle.org";
  var signedIn = om.signedIn();
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
        console.log("POST DONE");
        localStorage.lastSessionTime = om.seconds();
      }
      ui.dispatchMessageCallback(dt.opId,dt.value);
      //location.href = sdt;
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
    debugger;
    var signedIn = om.signedIn();
    if (signedIn) {
      var domain = 'http://prototype-jungle.org';
      if (ui.isDev) {
        domain += ":8000";
      }
      var wp = ui.useMinified?"/worker.html":"/workerd.html";
      $('#workerIframe').attr('src',domain+wp);
    }
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
       // var rs = $('<a href="'+url+'" class="ubutton">'+text+'</a>');
      } else {
        var rs = document.createElement('a');
        rs.className = "ubutton";
        //var rs = $('<div class="ubutton">'+text+'</div>');
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
 
    addButton('github','GitHub','https://github.com/chrisGoad/prototypejungle/tree/svg');
    addButton('tech','Docs',host+"/doc/choosedoc.html");
    addButton('about','About',host+"/doc/about.html");
    if (signedIn || ui.releaseMode) { //(atTest || atInspect || !atMain) && !down && (!toExclude || !toExclude['sign_in'])) {
      ui.logoutButton = addButton('logout','logout',"http://"+ui.liveDomain+"/logout");
      ui.signInButton = addButton('sign_in',"Sign in","http://"+ui.liveDomain+"/sign_in");
      if (signedIn) {
        if (ui.signInButton) ui.signInButton.style.display = "none";
        if (ui.logoutButton) ui.logoutButton.style.display = "";
      } else {
        if (ui.logoutButton) ui.logoutButton.display="none";
        if (ui.signInButton) ui.signInButton.display="";
      }
    }
    if (0 && fileBut  && ui.filePD) {
      ui.filePD.render($('#outerContainer'));
      fileBut.click(function () {ui.filePD.popFromButton(fileBut)});
    }
    if (cb) cb();
  }
   
  ui.nowLoggedOut = function () {
      om.clearStorageOnLogout();
       localStorage.signedIn=0;
       ui.signInButton.style.display = "";
       ui.logoutButton.style.display = "none";
     }
 
  ui.messageCallbacks.openItem = function (spath) {
    var inspectD = ui.useMinified?"/inspect":"/inspectd";
    var url = inspectD + "?item="+spath;
    location.href = url;
  }
 
    // called from the worker if here at s3 we think the user is logged in, but he is not
  ui.messageCallbacks.notSignedIn = function () {
    ui.nowLoggedOut();
  }
   
  // for use at prototypejungle.org
  
  ui.signInOutHandler = function () {
    if (ui.atLive || ui.isDev) {
      return;
    }
    var hr = location.href;
    var signedIn = hr.indexOf("#signedIn=1")>0;
    if (signedIn) { // at dev, the sessionId will have been set
      localStorage.lastSessionTime = om.seconds();
      var m = hr.match(/handle\=([^\&]*)/);
      //location.href = "http://prototypejungle.org"+om.homePage;
      localStorage.signedIn = 1;
      if (m) {
        localStorage.handle = m[1];  //code
      }
    } else if (hr.indexOf("#logout=1")>0) {
      om.clearStorageOnLogout();
    }
  }

//end extract

  
})(prototypeJungle);

