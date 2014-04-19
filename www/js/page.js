/* generates common elements of the html pages */
if (typeof prototypeJungle === "undefined") {
  var prototypeJungle = {};
}


(function (__pj__) {
  var om = __pj__.om;
  var page = __pj__.page;
   // lightboxes without dependencies
  var lightBoxWidth = 500;
  var lightBoxHeight = 400;
  var atMain  = location.href.indexOf("http://prototypejungle.org")===0;
  var host = (om.isDev)?"http://prototype-jungle.org:8000":"http://prototypejungle.org";
  var signedIn = om.signedIn();
  page.releaseMode = 1; // until release, the signin and file buttons are hidden                
               
  // for communication between pages on prototypejungle.org, and prototype-jungle.org
  page.messageCallbacks = {}; // for each opId (eg "saveSource"), function to which to dispatch replies

  
  page.dispatchMessageCallback = function(opid,rs) {
    var cb = page.messageCallbacks[opid];
    if (cb) cb(rs);
  }
  

  var messageListenerAdded = 0;
  page.addMessageListener = function () {
    if (messageListenerAdded) return;
    window.addEventListener("message",function (event) {
      var jdt = event.data;
      var dt = JSON.parse(jdt);
      if (dt.postDone) {
        console.log("POST DONE");
        localStorage.lastSessionTime = Math.floor(new Date().getTime()/1000);
      }
      page.dispatchMessageCallback(dt.opId,dt.value);
      //location.href = sdt;
    });
    messageListenerAdded = 1;
  }
  
  
  // For active pages, worker.html is loaded into an iframe from http://prototype-jungle.org (where the real work, non-s3, goes on)
  // the chooser is also loaded from that domain. postMessage is used for cross frame communication
  
  function workerWindow() {
    var ifrm = $('#workerIframe');
    return ifrm[0].contentWindow;
  }
  
   
  page.sendWMsg = function (msg) {
    var wwin = workerWindow();
    wwin.postMessage(msg,"*");
  }
  

  page.sendTopMsg = function(msg) {
    window.top.postMessage(msg,"*");
  }
  var openItemBut;
  
  var fileBut;
  page.genButtons = function (container,options,cb) {
    var signedIn = om.signedIn();
    if (signedIn) {
      var domain = 'http://prototype-jungle.org';
      if (om.isDev) {
        domain += ":8000";
      }
      $('#workerIframe').attr('src',domain+'/worker.html');
    }
    var toExclude = options.toExclude;
    var down = options.down;
    var includeFile = options.includeFile;
    function addButton(id,text,url) {
      if (down && (id==="file" || id==="sign_in")) return;
      if (toExclude && toExclude[id]) return;
      if (url) {
        var rs = $('<a href="'+url+'" class="ubutton">'+text+'</a>');
      } else {
        var rs = $('<div class="ubutton">'+text+'</div>');
      }
      container.append(rs);
      return rs;
    }
   
    if (includeFile) {
      openItemBut = addButton('openItem',"File");
      openItemBut.click(function () {
        page.popChooser('open');
      });
    }
 
    addButton('github','GitHub','https://github.com/chrisGoad/prototypejungle');
    addButton('tech','Docs',host+"/doc/choosedoc.html");
    addButton('about','About',host+"/doc/about.html");
    if (signedIn || page.releaseMode) { //(atTest || atInspect || !atMain) && !down && (!toExclude || !toExclude['sign_in'])) {
      page.logoutButton = addButton('logout','logout',"http://"+om.liveDomain+"/logout");
      page.signInButton = addButton('sign_in',"Sign in","http://"+om.liveDomain+"/sign_in");
      if (signedIn) {
        if (page.signInButton) page.signInButton.hide();
        if (page.logoutButton) page.logoutButton.show();
      } else {
        if (page.logoutButton) page.logoutButton.hide();
        if (page.signInButton) page.signInButton.show();
      }
    }
    if (0 && fileBut  && page.filePD) {
      page.filePD.render($('#outerContainer'));
      fileBut.click(function () {page.filePD.popFromButton(fileBut)});
    }
    if (cb) cb();
  }
   
  page.nowLoggedOut = function () {
      om.clearStorageOnLogout();
       localStorage.signedIn=0;
       page.signInButton.show();
       page.logoutButton.hide();
     }
 
  page.messageCallbacks.openItem = function (spath) {
    var inspectD = om.useMinified?"/inspect":"/inspectd";
    var url = inspectD + "?item="+spath;
    location.href = url;
  }
 
    // called from the worker if here at s3 we think the user is logged in, but he is not
  page.messageCallbacks.notSignedIn = function () {
    debugger;
    page.nowLoggedOut();
  }
   
  // for use at prototypejungle.org
  
  page.signInOutHandler = function () {
    debugger;
    var hr = location.href;
    var logout  = hr.indexOf("#logout=1")>0;
    if (om.atLive) { // where we land after login
      om.checkSession(function (rs) {
          debugger;
          var url = "http://prototypejungle.org"+(om.homePage)+((rs.status==="ok")?"#signedIn=1&handle="+localStorage.handle:(logout?"#logout=1":""));
          location.href = url;
        });
      return;
    }
    var signedIn = hr.indexOf("#signedIn=1")>0;
    if (signedIn) {
      localStorage.lastSessionTime = Math.floor(new Date().getTime()/1000);
      var m = hr.match(/handle\=([^\&]*)/);
      location.href = "http://prototypejungle.org"+om.homePage;
      localStorage.signedIn = 1;
      if (m) {
        localStorage.handle = m[1];  //code
      }
    } else if (hr.indexOf("#logout=1")>0) {
      om.clearStorageOnLogout();
        //localStorage.signedIn = 0;
    }
  }


  
})(prototypeJungle);


