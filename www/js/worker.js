// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code

prototypeJungle.work = {};
(function (pj) {
  var om = pj.om;
  var work = pj.work;
  var page = pj.page;
  
  work.initPage = function () {
    window.addEventListener("message",function (event) {
      var jdt = event.data;
      var dt = JSON.parse(jdt);
      var cmd = dt.command; // only "post" for now
      apiPost(dt.apiCall,dt.postData,dt.opId);
      debugger;
    });
    om.checkSession(function (rs) {
      debugger;
      if (rs.status !=="ok") {
	page.sendTopMsg(JSON.stringify({opId:"notSignedIn"}));
      }
    });
  }

  
  
function apiPost(cmd,dt,opId) {
    debugger;
    om.ajaxPost(cmd,dt,function (rs) {
      var rmsg = JSON.stringify({opId:opId,value:rs});
      page.sendTopMsg(rmsg);
    });
  }
})(prototypeJungle);

