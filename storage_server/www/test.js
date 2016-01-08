
window.pj = {};

(function (pj) {

// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

pj.noSession = 1;
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
  callback(rs);
 }
 $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
       success:wCallback,error:ecallback});
 return;
}
  

pj.testPost = function () {
  console.log("TEST POST");
  var url = "http://54.145.180.180/api/anonSave";
  //debugger;
  var dt = {value:"124",contentType:"application/javascript"};
  pj.ajaxPost(url,dt,function (rs) {
    //debugger;
  },function (rs,status,ethrown) { // the error callback
    debugger;
  });
}


//end extract	
})(window.pj);

