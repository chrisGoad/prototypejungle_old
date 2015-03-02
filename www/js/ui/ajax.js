(function (pj) {
  var pt = pj.pt;

// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly


//start extract
  
  pt.ajaxPost = function (url,idata,callback,ecallback) {
    if (typeof idata === "string") {
      var dataj = idata;
    } else {
      var data = idata?idata:{};
      var sid = localStorage.sessionId;
      if (sid) {
        data.sessionId = sid;
        data.userName = localStorage.userName;
      }
      dataj = JSON.stringify(data);
    }
    pt.log("ajax","url",url,"dataj",dataj);
    if (!ecallback) {
      ecallback = function (rs,textStatus,v) {
        callback({status:"fail",msg:"systemDown"});
      }
   }
   var wCallback = function (rs) {
    pt.log("ajax",url,"returned ",rs);
    if (rs.status === "ok") {
      localStorage.lastSessionTime = pt.seconds();
    }
    callback(rs);
   }
   $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:wCallback,error:ecallback});
   return;
  }
  



  pt.seconds = function () {
    return Math.floor(new Date().getTime()/1000);
  }
  // remaining session time
  pt.rst= function () {
    if (localStorage.sessionId) {
      var ltm = localStorage.lastSessionTime;
      if (ltm) {
        return pt.seconds() - ltm;
      }
    }
  }


  pt.storageVars = ['signedIn','sessionId','userName','handle',"signingInWithTwitter","twitterToken",
    "lastPrefix","lastBuildUrl","email","lastFolder","lastInsertFolder",'lastSessionTime'];
  
  pt.clearStorageOnLogout = function () {
    pt.storageVars.forEach(function (v) {localStorage.removeItem(v);});
  }
  
  pt.signedIn = function (cb) {
    if ((localStorage.signedIn)  || (localStorage.sessionId)) {
      var tm = pt.seconds();
      var ltm = localStorage.lastSessionTime;
      if ((!ltm) || ((tm - parseInt(ltm)) > pt.sessionTimeout)) {
        pt.clearStorageOnLogout();
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  
  
  
  pt.checkSession = function (cb) {
    if (localStorage.sessionId) {
      pt.ajaxPost('/api/checkSession',{},function (rs) {
        pt.log("util","checked session; result:",JSON.stringify(rs));
        if (rs.status === "fail") {
          pt.clearStorageOnLogout();
        }
        cb(rs);
      });
    } else {
      cb({status:"fail",msg:"noSession"});
    }
  }
  
    
  
  pt.checkUp = function (cb) {
    pt.ajaxPost('/api/checkUp',{},function (rs) {
      cb(rs);
    },function (rs) {
      cb({status:"fail",msg:"systemDown"});
    });
  }


//end extract

  
})(prototypeJungle);