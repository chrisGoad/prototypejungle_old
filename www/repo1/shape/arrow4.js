// Arrow
++OBSOLETE++

'use strict';
pj.require('/shape/arrowP.js',function (arrowP) {
debugger;
var svg = pj.svg;
var ui = pj.ui;
var item = arrowP.instantiate();
item.headInMiddle = true;
item.set("head",
  svg.Element.mk('<path fill="black"  stroke="transparent" stroke-width="0"/>'));
item.head.__unselectable = true;

item.update = function () {
  this.updateCommon();
  this.drawSolidHead();
}

ui.hide(item,['head']);
return item;
});

