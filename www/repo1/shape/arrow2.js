// Arrow

'use strict';
//pj.require('/shape/arrow_utils.js',function (utils) {
pj.require('/shape/arrowP.js',function (arrowP) {

  debugger;
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item = arrowP.instantiate();
item.headInMiddle = false;
item.set("head",
  svg.Element.mk('<path fill="black"  stroke="transparent" stroke-width="0"/>'));
item.head.__unselectable = true;

item.update = function () {
  this.updateCommon();
  this.drawSolidHead();
}

ui.hide(item,['HeadP','shaft','includeEndControls']);
ui.hide(item,['head0','head1','LineP','end0','end1']);
return item;
});

