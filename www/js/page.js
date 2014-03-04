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

  var signedIn = (localStorage.signedIn==="1") || (localStorage.sessionId);
  //var usePort8000 = 1;
  page.releaseMode = 1; // until release, the signin and file buttons are hidden 
  var atTest = (location.href.indexOf("http://prototype-jungle.org:8000/tindex.html")===0) ||
               (location.href.indexOf("http://prototypejungle.org/tindex.html")===0) ||
               (location.href.indexOf("http://prototypejungle.org/inspectd.html")===0);
               
               
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
  
  var fileBut;
    page.genButtons = function (container,options,cb) {
      if ((localStorage.signedIn === "1") || localStorage.sessionId) {
        $('#workerIframe').attr('src','http://prototype-jungle.org:8000/worker.html');
      }
      //$('#workerDiv').css({position:'absolute',top:'0px',width:'10px',height:'10px','background-color':'blue'});
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
        if (0 && url) {
          rs.click(function () {
              location.href = url+(down?"?down=1":"");
          //    page.checkLeave(url+(down?"?down=1":""));
          });
        }
        return rs;
      }
     
      if (includeFile && (signedIn||page.releaseMode)) fileBut = addButton('file',"File");
      addButton('github','GitHub','https://github.com/chrisGoad/prototypejungle');
      addButton('tech','Docs','http://prototypejungle.org/choosedoc.html');
      addButton('about','About','http://prototypejungle.org/about.html');
      if (signedIn || page.releaseMode) { //(atTest || atInspect || !atMain) && !down && (!toExclude || !toExclude['sign_in'])) {
        page.logoutButton = addButton('logout','logout',"http://"+om.liveDomain+"/logout");
        page.signInButton = addButton('sign_in',"Sign in","http://"+om.liveDomain+"/sign_in");
        if (signedIn) {
          if (page.signInButton) page.signInButton.hide();
          if (page.logoutButton) page.logoutButton.show();
        } else{
          if (page.logoutButton) page.logoutButton.hide();
          if (page.signInButton) page.signInButton.show();
        }
     
      }
      if (fileBut  && page.filePD) {
        page.filePD.render($('#outerContainer'));
        fileBut.click(function () {page.filePD.popFromButton(fileBut)});
      }
      if (cb) cb();
  
      //page.checkTheSession(cb);
    }
   
  page.nowLoggedOut = function () {
       localStorage.signedIn=0;
       page.signInButton.show();
       page.logoutButton.hide();
     }
  /*  
  page.checkTheSession = function (cb) {
    if (localStorage.signedIn==="1") {
      om.checkSession(function (rs) {
        debugger;
        if (rs.status === "fail") {
          page.nowLoggedOut();
        }
        cb();
      });
    }
  }
  */
  page.messageCallbacks.openItem = function (spath) {
    var inspectD = om.useMinified?"/inspect.html":"/inspectd.html";
    var url = inspectD + "?item="+spath;
    //if (localStorage.sessionId) {
    //  url = "http://"+om.liveDomain+url;
   // }
    location.href = url;
  }
  
    page.messageCallbacks.dismissChooser = function () {
      if (__pj__.mainPage && __pj__.mainPage.chooser_lightbox) {
        __pj__.mainPage.chooser_lightbox.dismiss();
      }
      }
    //lightbox.hide();
    //shade.hide();
    // called from the worker if here at s3 we think the user is logged in, but he is not
   page.messageCallbacks.notSignedIn = function () {
    debugger;
    page.nowLoggedOut();
   }


  
})(prototypeJungle);


