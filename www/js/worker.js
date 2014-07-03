

prototypeJungle.work = {};
(function (pj) {
  var sessionChecked = 0;
  var om = pj.om;
  var work = pj.work;
 // var page = pj.page =
  work.initPage = function () {
    //  expected message: {apiCall:,postData:,opId:} opid specifies the callback
    window.addEventListener("message",function (event) {
      var jdt = event.data;
      var dt = JSON.parse(jdt);
      //var cmd = dt.command; // only "post" for now
      apiPost(dt.apiCall,dt.postData,dt.opId);
    });
 
  }

  
  

  var sendTopMsg = function(msg) {
    // dont send a message to yourself
    if (window !== window.top) {
      window.top.postMessage(msg,"*");
    }
  }
var doThePost = function(cmd,dt,opId) {
  om.ajaxPost(cmd,dt,function (rs) {
    var rmsg = JSON.stringify({opId:opId,value:rs,postDone:1});
    sendTopMsg(rmsg);
  });
}

var apiPost = function (cmd,dt,opId) {
  if (sessionChecked) {
    doThePost(cmd,dt,opId);
  } else {
    om.checkSession(function (rs) {
      if (rs.status ==="ok") {
	sessionChecked = 1;
	doThePost(cmd,dt,opId);
      } else {
	om.clearStorageOnLogout();
	sendTopMsg(JSON.stringify({opId:"notSignedIn"}));
      }
    });
  }
}
sendTopMsg(JSON.stringify({opId:"workerReady"}));
		
})(prototypeJungle);

