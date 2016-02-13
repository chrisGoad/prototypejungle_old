/* generates common elements of the html pages */


(function (pj) {


// This is one of the code files assembled into pjui.js.//start extract and //end extract indicate the part used in the assembly
//start extract

var ui = pj.ui;
if (!ui) {
  ui = pj.ui = {};
}

var fileBut,signInButton,signOutButton;

ui.setSignInOutButtons = function () {
  if (localStorage.signedInAs) {
    signInButton.style.display = "none";
    signOutButton.style.display = "inline";
  } else {
    signInButton.style.display = "inline";
    signOutButton.style.display = "none";
  }
}


/*
var signOut = function () {
  debugger;
  ui.sendWMsg(JSON.stringify({apiCall:"/api/signout",postData:'none',opId:"signOut"}));
}
*/
ui.genButtons = function (container,options,cb) {
  debugger;
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
  addButton('tutorial','Intro ','/ui?intro=1'); 
  addButton('github','GitHub ','https://github.com/chrisGoad/prototypejungle/tree/r3');
  addButton('tech','Docs',"/doc/choosedoc.html");
  addButton('about','About',"/doc/about.html");
  signOutButton = addButton('signOut','Sign out');
  signOutButton.addEventListener('click',function () {
    ui.signOut();
  });
  signInButton = addButton('signIn','Sign in','https://prototype-jungle.org/sign_in.html');
  ui.setSignInOutButtons();
  if (cb) {
    cb();
  }
}

ui.standaloneInit = function () {
  var topbar = document.getElementById('topbarInner');
  ui.genButtons(topbar,{});
}

//end extract

  
})(prototypeJungle);


