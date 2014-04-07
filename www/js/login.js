


(function (__pj__) {
  var om = __pj__.om;
  var user = __pj__.set("user",__pj__.om.DNode.mk());


  user.signInWithTwitter = function () {
    
    var host = location.host;
    var url = "http://"+host+"/api/twitterRequestToken";
    om.storage.signingInWithTwitter = "yes";
    location.href = url;
    return;
  }


user.signedInWithPersona = function () {
  var usr = om.storage.userName;
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
            om.storage.sessionId = vl.sessionId;
            om.storage.lastSessionTime = Math.floor((new Date().getTime())/1000);
            var uname = vl.userName;
            var email = om.afterChar(uname,"_");
            om.storage.userName = vl.userName;
            om.storage.email = email;
            var h = vl.handle;
            if (h) {
              om.storage.handle = vl.handle;
              location.href = (om.homePage==='')?'/':om.homePage;
            } else {
              location.href = om.useMinified?'/handle.html':'/handled.html';
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

