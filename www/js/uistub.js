// so that some ui functions can be included in items that are used in a non-ui context
(function (pj) {
  var  om = pj.om;
  var ui = pj.set("ui",Object.create(om.DNode));
  ui.setNote = function () {}
  ui.watch = function () {}
  ui.freeze = function (){}
  ui.hide = function () {}
 
})(prototypeJungle);