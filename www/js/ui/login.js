


(function (pj) {
  var pt = pj.pt;
  var ui = pj.ui;
  
  
// This is one of the code files assembled into pjloginout.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  var user = pj.set("user",pj.pt.DNode.mk());


  user.signInWithTwitter = function () {
    
    var host = location.host;
    var url = "http://"+host+"/api/twitterRequestToken";
    localStorage.signingInWithTwitter = "yes";
    location.href = url;
    return;
  }


user.signedInWithPersona = function () {
  var usr = localStorage.userName;
  if (usr) {
    return usr.indexOf("persona_") ===0
  }
  return false;
}


user.personaSetup = function () {
  pt.log("persona","setup","email["+localStorage.email+"]");
  navigator.id.watch({
    loggedInUser:localStorage.email, 
    onlogin: function (assertion) {
      pt.ajaxPost('/api/personaLogin',{assertion:assertion,login:1},
        function (rs) {
          if (rs.status === "ok") {
            var vl = rs.value;
            localStorage.sessionId = vl.sessionId;
            localStorage.lastSessionTime = pt.seconds();
            var uname = vl.userName;
            var email = pt.afterChar(uname,"_");
            localStorage.userName = vl.userName;
            localStorage.email = email;
            var h = vl.handle;
            if (h) {
              localStorage.handle = vl.handle;
              //var dm = "http://"+(ui.isDev?"prototype-jungle.org:8000":"prototypejungle.org");
              var dm = "http://prototypejungle.org";
              var url = dm+(ui.homePage)+"#signedIn=1&handle="+vl.handle;
              location.href = url;
            } else {
              location.href = ui.useMinified?'/handle':'/handled';
            } 
          } else {
            navigator.id.logout();
            if (rs.msg === "maxUsersExceeded") {
              location.href = "http://prototypejungle.org/limit.html";
            } else {
              $('#results').html('Login did not succeed');
            }
          }
        } 
      )},
    onlogout: function (assertion) {
      if (user.signedInWithPersona()) {}
        pt.ajaxPost('/api/logOut',{},
          function (rs) {
            pt.clearStorageOnLogout();
            // location.href = '/';0;
          });
        } 
  });
}

// for extracting names from email addresses and and twitter account names
  ui.mainName = function(nm) {
    var bf = pt.beforeChar(nm,"_");
    var af = pt.afterChar(nm,"_");
    if (bf === "persona") {
      return pt.beforeChar(af,"@");
    } else {
      return af;
    }
  }
  
   ui.setOnEnter = function(jel,fn) {
    jel.keyup(function (e) {
      if (e.keyCode === 13) {
         fn(e);
      }
    });
  }

//end extract

})(prototypeJungle);

