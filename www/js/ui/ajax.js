(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly


//start extract
  
  om.ajaxPost = function (url,idata,callback,ecallback) {
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
    om.log("ajax","url",url,"dataj",dataj);
    if (!ecallback) {
      ecallback = function (rs,textStatus,v) {
        debugger;
        callback({status:"fail",msg:"systemDown"});
      }
   }
   var wCallback = function (rs) {
    om.log("ajax",url,"returned ",rs);
    if (rs.status === "ok") {
      localStorage.lastSessionTime = om.seconds();
    }
    callback(rs);
   }
   $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:wCallback,error:ecallback});
   return;
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


  om.storageVars = ['signedIn','sessionId','userName','handle',"signingInWithTwitter","twitterToken",
    "lastPrefix","lastBuildUrl","email","lastFolder","lastInsertFolder",'lastSessionTime'];
  
  om.clearStorageOnLogout = function () {
    om.storageVars.forEach(function (v) {localStorage.removeItem(v);});
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
        debugger;
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
  
    
  
  om.checkUp = function (cb) {
    om.ajaxPost('/api/checkUp',{},function (rs) {
      cb(rs);
    },function (rs) {
      cb({status:"fail",msg:"systemDown"});
    });
  }


//end extract

  
})(prototypeJungle);