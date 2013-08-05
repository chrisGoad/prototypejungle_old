


(function (__pj__) {
  var om = __pj__.om;
  var user = __pj__.set("user",__pj__.om.DNode.mk());


  user.signInWithTwitter = function () {
    var host = location.host;
    var url = "http://"+host+"/api/twitterRequestToken";
    //var data = {};
    om.storage.signingInWithTwitter = "yes";
    om.ajaxGet(url,function (rs) {
         var vl = rs.value;
         var vlj = JSON.stringify(vl);
        om.storage.twitterToken=vlj;
        var rtk = vl.oauth_token;

         var url = 'http://api.twitter.com/oauth/authorize?oauth_token='+rtk;
         location.href = url;
  
      });
  }


user.signedInWithPersona = function () {
  var usr = om.storage.userName;
  if (usr) {
    return usr.indexOf("persona_") ==0
  }
  return false;
}

user.clearStorageOnLogout = function () {
   om.storage.removeItem('sessionId');
   om.storage.removeItem('userName');
   om.storage.removeItem('handle');
   om.storage.removeItem("signingInWithTwitter");
   om.storage.removeItem("twitterToken");


}

user.personaSetup = function () {
  navigator.id.watch({
    loggedInUser:"cagoad@gmail.com",
    onlogin: function (assertion) {
      om.ajaxPost('/api/personaLogin',{assertion:assertion,login:1},
        function (rs) {
          debugger;
          if (rs.status == "ok") {
            var vl = rs.value;
            om.storage.sessionId = vl.sessionId;
            var uname = vl.userName;
            var email = om.afterChar(uname,"_");
            om.storage.userName = vl.userName;
            om.storage.email = email;
            var newu = vl.new_user;
            if (newu) {
              location.href = '/handle.html'
            } else {
              om.storage.handle = vl.handle;
              location.href = '/sign_in.html'; // later
              
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
            user.clearStorageOnLogout();
            // location.href = '/';0;
          });
        } 
  });
}

})(__pj__);

