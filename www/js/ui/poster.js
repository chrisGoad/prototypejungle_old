(function (pj) {
  
  //var page = pj.set("page",pj.Object.mk());
  var geom = pj.geom;
  var svg = pj.svg;
   var dat = pj.dat;
   var ui = pj.ui;
    
// This is one of the code files assembled into pjview.js. "start extract" and "end extract" indicate the part used in the assembly
  
//start extract


/*
 * Prototypejungle items can be embedded in pages via iframes. This file provides support
 * for communication with the item via HTML5's postMessage mechanism.
 * An item should have a __commandInterpreter method if it wishes to interpret incoming messages,
 * Conversely, the containing page should listen for messages with origin http://prototypejungle.org.
 */

  ui.initPoster = function (item) {
    //  expected message: {apiCall:,postData:,opId:} opid specifies the callback
    window.addEventListener("message",function (event) {
      var cmi = ui.root.__commandInterpreter;
      if (cmi) {
        var jdt = event.data;
        var data = JSON.parse(jdt);
	cmi(data);
      }
    });
  }

  
  

  ui.postMessage = function(msg) {
    // dont send a message to yourself
    if (window !== window.parent) {
      window.parent.postMessage(msg,"*");
    }
  }

//end extract	
})(prototypeJungle);

