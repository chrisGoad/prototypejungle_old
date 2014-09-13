

prototypeJungle.work = {};
(function (pj) {
  var om = pj.om;
// This is one of the code files assembled into pjworker.js. //start extract and //end extract indicate the part used in the assembly
//start extract
  var sessionChecked = 0;
  var work = pj.work = {};
  work.initPage = function () {
    //  expected message: {apiCall:,postData:,opId:} opid specifies the callback
    window.addEventListener("message",function (event) {
      debugger;
      var jdt = event.data;
      var dt = JSON.parse(jdt);
      if (pj.systemDown) {
	sendDownMsg(dt.opId);
      } else {
        apiPost(dt.apiCall,dt.postData,dt.opId);
      }
    });
 
  }

  
  

  var sendTopMsg = function(msg) {
    // dont send a message to yourself
    if (window !== window.top) {
      window.top.postMessage(msg,"*");
    }
  }

  
var sendDownMsg = function (opId) {
  om.clearStorageOnLogout();
  var rmsg = JSON.stringify({opId:opId,value:{status:"fail",msg:"systemDown"}});
  sendTopMsg(rmsg);
}
  
var doThePost = function(cmd,dt,opId) {
  debugger;
  om.ajaxPost(cmd,dt,function (rs) {
    var rmsg = JSON.stringify({opId:opId,value:rs,postDone:1});
    sendTopMsg(rmsg);
  },function (rs) { // the error callback
    sendDownMsg(opId);
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
      } else if (rs.msg === "systemDown") {
	sendDownMsg(opId);
      } else {
	om.clearStorageOnLogout();
	sendTopMsg(JSON.stringify({opId:"notSignedIn"}));
      }
    });
  }
}
sendTopMsg(JSON.stringify({opId:"workerReady"}));

//end extract	
})(prototypeJungle);

