

(function (pj) {
"use strict";

var geom=pj.geom,dat=pj.data,dom=pj.dom,svg=pj.svg,html=pj.html,ui=pj.ui, fb=pj.fb,tree=pj.tree,lightbox=pj.lightbox;

// This is one of the code files assembled into pjeditor.js.

if (!ui) {
  ui = pj.ui = {};
}

var fileBut,signInButton,accountButton;


ui.setSignInOutButtons = function () {
  if (fb.currentUser) {
    signInButton.style.display = "none";
    accountButton.style.display = "inline";
  } else {
    signInButton.style.display = "inline";
    accountButton.style.display = "none";
  }
}

ui.signIn = function  () {
  if (fb.currentUser) {
    ui.setSignInOutButtons();
    return;
  }
  sessionStorage.setItem('preSigninUrl',location.href);
  location.href = "/sign_in.html";
}


ui.addButton =   function (container,id,text,url) {
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

ui.addSpan = function (container,text,padding) {
    var rs = document.createElement('span');
    rs.className = "topbarSpan";
    rs.style['padding-right'] = padding + 'px';
    rs.style['font-size'] = "16";
    rs.innerHTML = text;
    container.appendChild(rs);
    return rs; 
  }

ui.genSignInOutButtons = function (container,cb) {
  accountButton = ui.addButton(container,'signOut','Account','/account.html');
  //signOutButton.addEventListener('click',ui.signOut);
  signInButton = ui.addButton(container,'signIn','Sign in');//,'https://prototype-jungle.org/sign_in.html');
  signInButton.addEventListener('click',ui.signIn);
  ui.setSignInOutButtons(cb);  
}
ui.genStdButtons = function (container) {
  ui.addButton(container,'github','GitHub ','https://github.com/chrisGoad/prototypejungle/tree/master');
  ui.addButton(container,'tech','Docs',"/doc/choosedoc.html");
  ui.addButton(container,'about','About',"/doc/about.html");
  ui.genSignInOutButtons(container);
}

ui.standaloneInit = function () {
  var topbar = document.getElementById('topbarInner');
  ui.genButtons(topbar,{});
}



