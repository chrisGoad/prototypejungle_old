// so that some ui functions can be included in items that are used in a non-ui context
(function (pj) {
  
// This is one of the code files assembled into pjtopobar.js. //start extract and //end extract indicate the part used in the assembly
//start extract
  var ui = pj.set("ui",Object.create(pj.Object)); 
  ui.setNote = function () {}
  ui.watch = function () {}
  ui.freeze = function (){}
  ui.hide = function () {}
  ui.show= function () {}
  ui.melt = function () {}
  ui.freezeExcept = function () {}
  ui.hideExcept = function () {}
  ui.hideInInstance = function () {}
  pj.Object.__setUIStatus = function () {}
  pj.Object.__setFieldType = function () {}


//end extract
  
})(prototypeJungle);