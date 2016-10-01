

(function (pj) {
"use strict";

var geom=pj.geom,dat=pj.data,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui, fb=pj.fb,tree=pj.tree,lightbox=pj.lightbox;

// This is one of the code files assembled into pjeditor.js.

if (!ui) {
  ui = pj.ui = {};
}

var fileBut,signInButton,signOutButton;


var setSignInOutButtons1 = function () { 
  if (fb.currentUser) {
    signInButton.style.display = "none";
    signOutButton.style.display = "inline";
  } else {
    signInButton.style.display = "inline";
    signOutButton.style.display = "none";
  }
}


ui.setSignInOutButtons = function () {
  fb.setCurrentUser(setSignInOutButtons1);
  return;
  if (!fb.currentUser) {
    var  auth = firebase.auth();
    fb.currentUser = auth.currentUser;
    if (!fb.currentUser) {
      debugger;
      auth.onAuthStateChanged(function(user) {
        debugger;
        fb.currentUser = user;
        setSignInOutButtons1();
      });
      return;
    }
  }
  setSignInOutButtons1();
}


ui.signIn = function  () {
  debugger;
  if (fb.currentUser) {
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
    fb.currentUser = result.user;
    ui.setSignInOutButtons();
  }).catch(function(error) {
  console.log('error');
  });
}

ui.signOut = function () {
  if (fb.currentUser) {
    var auth = firebase.auth();
    auth.signOut().then(function () {
      fb.currentUser = undefined;
      ui.setSignInOutButtons();
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
  addButton('github','GitHub ','https://github.com/chrisGoad/protochart/tree/master');
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



