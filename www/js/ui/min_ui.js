// so that some ui functions can be included in items that are used in a non-ui context
(function (pj) {
  var  pt = pj.pt;
  
// This is one of the code files assembled into pjtopobar.js. //start extract and //end extract indicate the part used in the assembly
//start extract
  var ui = pj.set("ui",Object.create(pt.DNode));
  ui.setNote = function () {}
  ui.watch = function () {}
  ui.freeze = function (){}
  ui.hide = function () {}

//end extract
  
})(prototypeJungle);