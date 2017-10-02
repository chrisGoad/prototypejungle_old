// so that some ui functions can be included in items that are used in a non-ui context
(function (pj) {
  
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