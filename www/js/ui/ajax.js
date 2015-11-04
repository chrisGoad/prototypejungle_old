(function (pj) {
  

// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly


//start extract
  

pj.sessionId = function () {
  var pjkey = localStorage.pjkey;
  var tm = Math.floor(new Date().getTime()/1000000);
  var md5 =  CryptoJS.MD5(pjkey+tm);
  var sid = CryptoJS.enc.Hex.stringify(md5);
  return sid; 
}
pj.ajaxPost = function (url,idata,callback,ecallback) {
  var dataj,data,sid,wCallback;
  if (typeof idata === "string") {
    dataj = idata;
  } else {
    data = idata?idata:{};
    if (!pj.noSession) {
      sid = pj.sessionId();
      if (sid) {
        data.sessionId = sid;
        data.userName = localStorage.userName;
      }
    }
    dataj = JSON.stringify(data);
  }
  console.log("ajax","url",url,"dataj",dataj);
  if (!ecallback) {
    ecallback = function (rs,textStatus,v) {
      callback({status:"fail",msg:"systemDown"});
    }
 }
 var wCallback = function (rs) {
  console.log("ajax",url,"returned ",rs,callback);
  if (rs.status === "ok") {
    localStorage.lastSessionTime = pj.seconds();
  }
  debugger;
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


 // pj.storageVars = ['signedIn','sessionId','userName','handle',"signingInWithTwitter","twitterToken",
 //   "lastPrefix","lastBuildUrl","email","lastFolder","lastInsertFolder",'lastSessionTime'];
  
  pj.storageVars = ['sessionId'];
  
  
//  pj.clearStorageOnLogout = function () {
//    pj.storageVars.forEach(function (v) {localStorage.removeItem(v);});
//  }
  
 // pj.signedIn = function (cb) {
 //   return localStorage.pjkey;
 // }
  
  
  
  
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
  
pj.checkUp = function (cb) {
  pj.ajaxPost('/api/checkUp',{},function (rs) {
    cb(rs);
  },function (rs) {
    cb({status:"fail",msg:"systemDown"});
  });
}


//end extract

  
})(prototypeJungle);