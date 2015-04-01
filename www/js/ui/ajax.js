(function (pj) {
  

// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly


//start extract
  

pj.sessionId = function () {
  var pjkey = localStorage.pjkey;
  var tm = Math.floor(new Date().getTime()/1000000);
  console.log('time',tm);
  var md5 =  CryptoJS.MD5(pjkey+tm);
  var sid = CryptoJS.enc.Hex.stringify(md5);
  return sid; 
}
  pj.ajaxPost = function (url,idata,callback,ecallback) {
    debugger;
    if (typeof idata === "string") {
      var dataj = idata;
    } else {
      var data = idata?idata:{};
      if (!pj.noSession) {
        var sid = pj.sessionId();
     // var sid = localStorage.sessionId;
        if (sid) {
          data.sessionId = sid;
          data.userName = localStorage.userName;
        }
      }
      dataj = JSON.stringify(data);
    }
    pj.log("ajax","url",url,"dataj",dataj);
    if (!ecallback) {
      ecallback = function (rs,textStatus,v) {
        callback({status:"fail",msg:"systemDown"});
      }
   }
   var wCallback = function (rs) {
    pj.log("ajax",url,"returned ",rs);
    if (rs.status === "ok") {
      localStorage.lastSessionTime = pj.seconds();
    }
    callback(rs);
   }
   $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:wCallback,error:ecallback});
   return;
  }
  



  pj.seconds = function () {
    return Math.floor(new Date().getTime()/1000);
  }
  // remaining session time
  pj.rst= function () {
    if (localStorage.sessionId) {
      var ltm = localStorage.lastSessionTime;
      if (ltm) {
        return pj.seconds() - ltm;
      }
    }
  }


  pj.storageVars = ['signedIn','sessionId','userName','handle',"signingInWithTwitter","twitterToken",
    "lastPrefix","lastBuildUrl","email","lastFolder","lastInsertFolder",'lastSessionTime'];
  
  pj.clearStorageOnLogout = function () {
    pj.storageVars.forEach(function (v) {localStorage.removeItem(v);});
  }
  /*
  pj.signedIn = function (cb) {
    if ((localStorage.signedIn)  || (localStorage.sessionId)) {
      var tm = pj.seconds();
      var ltm = localStorage.lastSessionTime;
      if ((!ltm) || ((tm - parseInt(ltm)) > pj.sessionTimeout)) {
        pj.clearStorageOnLogout();
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  */
  
  pj.signedIn = function (cb) {
    return localStorage.pjkey;
  }
  
  
  
  
  pj.checkSession = function (cb) {
    if (localStorage.pjkey) {
      pj.ajaxPost('/api/checkSession',{},function (rs) {
        pj.log("util","checked session; result:",JSON.stringify(rs));
        if (rs.status === "fail") {
          pj.clearStorageOnLogout();
        }
        cb(rs);
      });
    } else {
      cb({status:"fail",msg:"noSession"});
    }
  } 

  /*
  pj.checkSession = function (cb) {
    if (localStorage.pjkey) {
      cb({status:"ok"});
    } else {
      pj.clearStorageOnLogout();
      cb({status:"fail",msg:"noSession"});
  }
   */ 
  
  pj.checkUp = function (cb) {
    cb(1);return;
    pj.ajaxPost('/api/checkUp',{},function (rs) {
      cb(rs);
    },function (rs) {
      cb({status:"fail",msg:"systemDown"});
    });
  }


//end extract

  
})(prototypeJungle);