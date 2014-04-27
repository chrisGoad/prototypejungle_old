


(function (__pj__) {
  var om = __pj__.om;
  var user = __pj__.set("user",__pj__.om.DNode.mk());


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
  om.log("persona","setup","email["+localStorage.email+"]");
  navigator.id.watch({
    loggedInUser:localStorage.email, 
    onlogin: function (assertion) {
      om.ajaxPost('/api/personaLogin',{assertion:assertion,login:1},
        function (rs) {
          if (rs.status === "ok") {
            debugger;
            var vl = rs.value;
            localStorage.sessionId = vl.sessionId;
            localStorage.lastSessionTime = om.seconds();
            var uname = vl.userName;
            var email = om.afterChar(uname,"_");
            localStorage.userName = vl.userName;
            localStorage.email = email;
            var h = vl.handle;
            if (h) {
              localStorage.handle = vl.handle;
              var dm = "http://"+(om.isDev?"prototype-jungle.org:8000":"prototypejungle.org");
              var url = dm+(om.homePage)+"#signedIn=1&handle="+vl.handle;
              location.href = url;
            } else {
              location.href = om.useMinified?'/handle':'/handled';
            } 
          } else {
            $('#results').html('Login did not succeed');
             navigator.id.logout();
          }
        }
      )},
    onlogout: function (assertion) {
      if (user.signedInWithPersona()) {}
        om.ajaxPost('/api/logOut',{},
          function (rs) {
            om.clearStorageOnLogout();
            // location.href = '/';0;
          });
        } 
  });
}

})(prototypeJungle);

