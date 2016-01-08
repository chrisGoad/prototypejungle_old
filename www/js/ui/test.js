
(function (pj) {
  
var ui = pj.ui;
var dom = pj.dom;


// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

pj.noSession = 1;

ui.testPost = function () {
  console.log("TEST POST");
  var url = "http://54.145.180.180/api/anonSave";
  debugger;
  pj.ajaxPost(url,{testData:234},function (rs) {
    debugger;
  },function (rs) { // the error callback
    debugger;
  });
}


//end extract	
})(prototypeJungle);

