
(function (__pj__) {
  var om = __pj__.om;
  var page = __pj__.page;
  var LNode = []; // list node, with children named by sequential integers starting with 0
  var DNode = om.DNode;
  om.LNode = LNode;
  om.testMinify = 0;
  
  om.sessionTimeout = 24 * 60 * 60;
  om.useCloudFront =  0;
  om.useS3 = 1;
  om.cloudFrontDomain = "d2u4xuys9f6wdh.cloudfront.net";
  om.s3Domain = "prototypejungle.org.s3.amazonaws.com";

  om.itemDomain = om.useCloudFront?"d2u4xuys9f6wdh.cloudfront.net":"prototypejungle.org";
  
  om.toItemDomain = function (url) {
    if (om.useCloudFront || om.useS3) {
      var dm = om.useCloudFront?om.cloudFrontDomain:om.s3Domain;
      return url.replace("prototypejungle.org",dm);
    } else {
      return url;
    }
  }
  
  // do the work normally performed by "set"  by hand for these initial objects
  om.__parent__ = __pj__;
  om.__name__ = "om";
  DNode.__parent__ = om;
  DNode.__name__ = "DNode";
  LNode.__parent__ = om;
  LNode.__name__ = "LNode";
  page.__parent__ = __pj__;
  page.__name__ = "page";
  
  
  om.activeConsoleTags = (om.isDev)?["error","updateError","installError"]:["error"];//,"drag","util","tree"];
  
  om.addTagIfDev = function (tg) {
    if (om.isDev) {
      om.activeConsoleTags.push(tg);
    }
  }
  
  om.removeConsoleTag = function (tg) {
    om.removeFromArray(om.activeConsoleTags,tg);
  }
  
  om.itemHost = "http://prototypejungle.org";

  om.argsToString= function (a) {
    // only used for slog1; this check is a minor optimization
    if (typeof(console) === "undefined") return "";
    var aa = [];
    var ln = a.length;
    for (var i=0;i<ln;i++) {
      aa.push(a[i]);
    }
    return aa.join(", ");
  }
  
    
  
  om.log = function (tag) {
    if (typeof(console) === "undefined") return;
    if (($.inArray("all",om.activeConsoleTags)>=0) || ($.inArray(tag,om.activeConsoleTags) >= 0)) {
     if (typeof window === "undefined") {
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
  
  
  
  om.ajaxPost = function (url,idata,callback,ecallback) {
    if (typeof data === "string") {
      dataj = data;
    } else {
      var data = idata?idata:{};
      var sid = localStorage.sessionId;
      if (sid) {
        data.sessionId = sid;
        data.userName = localStorage.userName;
      }
      var dataj = JSON.stringify(data);
    }
    util.log("ajax","url",url,"dataj",dataj);
    if (!ecallback) {
      ecallback = function (rs,textStatus,v) {
        om.error("ERROR (INTERNAL) IN POST "+textStatus);
      }
   }
   var wCallback = function (rs) {
    util.log("ajax",url,"returned ",rs);
    if (rs.status === "ok") {
      localStorage.lastSessionTime = om.seconds();
    }
    callback(rs);
   }
   $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:wCallback,error:ecallback});
  }
  
  om.storageVars = ['signedIn','sessionId','userName','handle',"signingInWithTwitter","twitterToken",
    "lastPrefix","lastBuildUrl","email","lastFolder","lastInsertFolder",'lastSessionTime'];
  
  
  
  om.clearStorageOnLogout = function () {
    debugger;
    om.storageVars.forEach(function (v) {localStorage.removeItem(v);});
  }
  
  om.tut = function () { //time until timeout
    var ltm = localStorage.lastSessionTime;
    var tm = om.seconds();
    if (ltm) {
      return tm-parseInt(ltm);
    }
  }

  om.seconds = function () {
    return Math.floor(new Date().getTime()/1000);
  }
  // remaining session time
  om.rst= function () {
    if (localStorage.sessionId) {
      var ltm = localStorage.lastSessionTime;
      if (ltm) {
        return om.seconds() - ltm;
      }
    }
  }
  
  om.signedIn = function (cb) {
    if ((localStorage.signedIn)  || (localStorage.sessionId)) {
      var tm = om.seconds();
      var ltm = localStorage.lastSessionTime;
      if ((!ltm) || ((tm - parseInt(ltm)) > om.sessionTimeout)) {
        om.clearStorageOnLogout();
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  
  
  
  om.checkSession = function (cb) {
    if (localStorage.sessionId) {
      om.ajaxPost('/api/checkSession',{},function (rs) {
        om.log("util","checked session; result:",JSON.stringify(rs));
        if (rs.status === "fail") {
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

  //  swiped from http://paulgueller.com/2011/04/26/parse-the-querystring-with-jquery/
  om.parseQuerystring = function(){
    var nvpair = {};
    var qs = window.location.search.replace('?', '');
    var pairs = qs.split('&');
    $.each(pairs, function(i, v){
      var pair = v.split('=');
      if (pair.length>1) {
        nvpair[pair[0]] = pair[1];
      }
    });
    return nvpair;
  }
 
  
  om.afterChar = function (s,c) {
    var idx = s.indexOf(c);
    if (idx < 0) return s;
    return s.substr(idx+1);
  }
  
  
  om.afterLastChar = function (s,c) {
    var idx = s.lastIndexOf(c);
    if (idx < 0) return s;
    return s.substr(idx+1);
  }
  
  
  
  om.beforeChar = function (s,c) {
    var idx = s.indexOf(c);
    if (idx < 0) return s;
    return s.substr(0,idx);
  }
  
  om.endsIn = function (s,p) {
    var ln = s.length;
    var pln = p.length;
    if (pln > ln) return false;
    var es = s.substr(ln-pln);
    return es === p;
  }
  
  om.beginsWith = function (s,p) {
    var ln = s.length;
    var pln = p.length;
    if (pln > ln) return false;
    var es = s.substr(0,pln);
    return es === p;
  }
 
})(prototypeJungle);