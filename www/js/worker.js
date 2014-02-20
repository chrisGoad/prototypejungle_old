// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code


prototypeJungle.work = {};
(function (pj) {
  var om = pj.om;
  var work = pj.work;
  var page = pj.page;
  work.initPage = function () {
    //  expected message: {apiCall:,postData:,opId:} opid specifies the callback
    window.addEventListener("message",function (event) {
      var jdt = event.data;
      var dt = JSON.parse(jdt);
      var cmd = dt.command; // only "post" for now
      apiPost(dt.apiCall,dt.postData,dt.opId);
    });
  om.checkSession(function (rs) {
      if (rs.status !=="ok") {
	page.sendTopMsg(JSON.stringify({opId:"notSignedIn"}));
      }
    });
  }

  
  
function apiPost(cmd,dt,opId) {
    om.ajaxPost(cmd,dt,function (rs) {
      var rmsg = JSON.stringify({opId:opId,value:rs});
      page.sendTopMsg(rmsg);
    });
  }
})(prototypeJungle);

