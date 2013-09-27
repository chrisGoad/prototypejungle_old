
(function (__pj__) {
  var om = __pj__.om;
  var page = __pj__.page;
  var LNode = []; // list node, with children named by sequential integers starting with 0
  var DNode = om.DNode;
  om.LNode = LNode;
  om.isDev = location.href.indexOf(':8000')>0;
  om.testMinify = 0;
  

  // do the work normally performed by "set"  by hand for these initial objects
  om.__parent__ = __pj__;
  om.__name__ = "om";
  DNode.__parent__ = om;
  DNode.__name__ = "DNode";
  LNode.__parent__ = om;
  LNode.__name__ = "LNode";
  page.__parent__ = __pj__;
  page.__name__ = "page";
  
  om.activeConsoleTags = ["error","tree","updateError","installError"];//,"drag","util","tree"];
  
  
  om.itemHost = "http://s3.prototypejungle.org";

  om.argsToString= function (a) {
    // only used for slog1; this check is a minor optimization
    if (typeof(console) == "undefined") return "";
    var aa = [];
    var ln = a.length;
    for (var i=0;i<ln;i++) {
      aa.push(a[i]);
    }
    return aa.join(", ");
  }
  
    
  
  om.log = function (tag) {
    if (typeof(console) == "undefined") return;
    if (($.inArray("all",om.activeConsoleTags)>=0) || ($.inArray(tag,om.activeConsoleTags) >= 0)) {
     if (typeof window == "undefined") {
       system.stdout(tag + JSON.stringify(arguments));
    } else {
      var aa = [];
      var ln = arguments.length;
      for (var i=0;i<ln;i++) {
        aa.push(arguments[i]);
      }
      console.log(tag,aa.join(", "));
    }
   }
  };
  
  
  
  om.ajaxPost = function (url,data,callback,ecallback) {
    if (typeof data == "string") {
      dataj = data;
    } else {
      var sid = om.storage.sessionId;
      if (sid) {
        data.sessionId = sid;
        data.userName = om.storage.userName;
      }
      var dataj = JSON.stringify(data);
    }
    if (!ecallback) {
      ecallback = function (rs,textStatus,v) {
        alert("ERROR (INTERNAL) IN POST "+textStatus);
      }
   }
   $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:callback,error:ecallback});
  }
  
  
om.clearStorageOnLogout = function () {
   om.storage.removeItem('sessionId');
   om.storage.removeItem('userName');
   om.storage.removeItem('handle');
   om.storage.removeItem("signingInWithTwitter");
   om.storage.removeItem("twitterToken");
   om.storage.removeItem("lastPrefix");
   om.storage.removeItem("lastBuildUrl");
   om.storage.removeItem("email");
   om.storage.removeItem("lastFolder");
   om.storage.removeItem("lastInsertFolder");

}


om.checkSession = function (cb) {
  if (om.storage.sessionId) {
    om.ajaxPost('/api/checkSession',{},function (rs) {
      om.log("util","checked session; result:",JSON.stringify(rs));
      if (rs.status == "fail") {
        om.clearStorageOnLogout();
      }
      cb(rs);
    });
  } else {
    cb({status:"fail",msg:"noSession"});
  }
}
// for determining if we are on a dev page or not
om.whichPage =    function (iurl) {
  if (iurl) {
    var url = iurl;
  } else {
    url = location.href;
  }
  var r = /http\:\/\/([^\/]*)\/([^\/\?\.]*)(.*)$/
  var m = url.match(r);
  if (m) return m[2];
}

om.setUseMinified = function() {
  var wp = om.whichPage();
  var ln = wp.length;
  var ll = wp[ln-1];
  if (ll == "d") {
    var um = wp == "build";
  } else {
    um = true;
  }
  om.useMinified = um;
}

om.setUseMinified();
console.log("USE MINIFIED",om.useMinified);
 

})(prototypeJungle);