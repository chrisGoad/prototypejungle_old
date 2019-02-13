

'use strict';
core.require('/shape/circle.js','/shape/angledBorder1.js',function (circlePP,borderPP) {

let {geom,svg,ui} = core;


let item =  svg.Element.mk('<g/>');

/* adjustable parameters */
item.height = 50;
item.width = 50;
item.angleFactor=0.2; // as multiple of max height,width
item.dotFactor = 0.3; //diameter of dot as multiple of angleDim
item.stroke = "black";
item.fill = "transparent";
item['stroke-width'] = 2;

/* end adjustable parameters */
item.set('dotP',circlePP.instantiate());
item.dotP.fill = "black";
item.dotP.stroke = "transparent";
item.set('border',borderPP.instantiate().__show());
item.border.__unselectable = true;
item.set('dot1',item.dotP.instantiate()).__show();
item.set('dot2',item.dotP.instantiate()).__show();
item.set('dot3',item.dotP.instantiate()).__show();
item.set('dot4',item.dotP.instantiate()).__show();

item.__adjustable = true;
item.__draggable = true;


item.update = function () {
  this.border.angleFactor = this.angleFactor;
  this.border.width = this.width;
  this.border.height = this.height;
  var hwidth = 0.5 * this.width;
  var hheight = 0.5 * this.height;
  let hAngleDim = this.angleFactor * Math.min(this.width,this.height);
  this.border.update();
  this.dotP.__dimension = this.dotFactor * hAngleDim;
  let dotOff = 0.2*hAngleDim;
  this.dot1.__moveto(geom.Point.mk(-hwidth+dotOff,-hheight+dotOff));
  this.dot2.__moveto(geom.Point.mk(hwidth-dotOff,-hheight+dotOff));
  this.dot3.__moveto(geom.Point.mk(-hwidth+dotOff,hheight-dotOff));
  this.dot4.__moveto(geom.Point.mk(hwidth-dotOff,hheight-dotOff));
  //this.dot1.update();
}
 

// support for the resizer 


item.__setExtent = function (extent) {
  this.width= extent.x;
  this.height = extent.y;
}

ui.hide(item,['d']);
//item.__setFieldType('solidHead','boolean');
ui.installRectanglePeripheryOps(item);
ui.setTransferredProperties(item,ui.stdTransferredProperties);

return item;

});

