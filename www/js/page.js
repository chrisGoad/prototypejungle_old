/* generates common elements of the html pages */
if (typeof __pj__ == "undefined") {
  var __pj__ = {};
}
(function (__pj__) {
   var om = __pj__.om;
   var page = __pj__.page;
    page.genButtons = function (container,options) {
      toExclude = options.toExclude;
      function addButton(text,url) {
        var rs = $('<div class="button">'+text+'</div>');
        container.append(rs);
        rs.click(function () {location.href = url});
        return rs;
      }
      addButton('GitHub','https://github.com/chrisGoad/prototypejungle');
      if (toExclude != 'build') addButton('Build','/build');
      if (toExclude != 'tech') addButton('Tech Docs','/tech');
      if (toExclude != 'about') addButton('About','/about');
      if (toExclude != 'sign_in') {
        page.logoutButton = addButton("logout","/logout");
        page.signInButton = addButton("Sign in","/sign_in");
        var sid = om.storage?om.storage.sessionId:null;
        if (sid) {
          page.signInButton.hide();
          //addButton("logout","/logout");
        } else {
          page.logoutButton.hide();
          //addButton("Sign in","/sign_in");
        }
      }
  }
  
  page.genTopbar  = function (container,options) {
   /*
    container.empty();
    container.append(
      $('<div id="topbarOuter" style="padding-bottom:30px">'+
        '<div id = "topbarInner" style="float:right;">' +
      '</div>'));
      */
    var inr = $('#topbarInner');
    //if (options.includeTitle) page.genMainTitle($('#topbarOuter'),'Prototype Jungle');
    page.genButtons(inr,options);
  }
  page.genMainTitle = function (container,text) {
    var rs = $('<span class="mainTitle">'+text+'</span>');
    rs.css({'cursor':'pointer'});
    container.append(rs);
    rs.click(function () {location.href = "/"})
  }
  
  page.logout = function () {
    om.log("util","page.logout");
    page.logoutButton.hide();
    page.signInButton.show();
    om.clearStorageOnLogout();
  }
  
})(__pj__);


