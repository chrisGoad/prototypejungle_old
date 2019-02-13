

'use strict';

core.require(function () {
let {geom,svg,ui} = core;


let item =  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
item.height = 50;
item.width = 50;
item.angleFactor=0.1; // as multiple of max height,width
item.stroke = "black";
item.fill = "transparent";
item['stroke-width'] = 2;

/* end adjustable parameters */

item.resizable = true;
item.setComputedProperties(['d']);


item.update = function () {
  let p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  let hwidth = 0.5*this.width;
  let hheight = 0.5*this.height;
  
  let hAngleDim = this.angleFactor * Math.min(this.width,this.height);
  // points (horizontalUpperLeft...) at which the angles start
  let hul = geom.Point.mk(hAngleDim-hwidth,-hheight);
  let hur = geom.Point.mk(hwidth-hAngleDim,-hheight);
  let  hll = geom.Point.mk(hAngleDim-hwidth,hheight);
  let hlr = geom.Point.mk(hwidth-hAngleDim,hheight);
  let vul = geom.Point.mk(-hwidth,hAngleDim-hheight);
  let vur = geom.Point.mk(hwidth,hAngleDim-hheight);
  let vll = geom.Point.mk(-hwidth,hheight-hAngleDim);
  let vlr = geom.Point.mk(hwidth,hheight-hAngleDim);
  // clockwise starting at upper left
  let path = p2str('M',hul,' ');
  path += p2str('L',hur,' ');
  path += p2str('L',vur,' ');
  path += p2str('L',vlr,' ');
  path += p2str('L',hlr,' ');
  path += p2str('L',hll,' ');
  path += p2str('L',vll,' ');
  path += p2str('L',vul,' ');
  path += p2str('L',hul,' ');
  this.d = path;
  
}

// support for the resizer 


item.__setExtent = function (extent) {
  this.width= extent.x;
  this.height = extent.y;
}

ui.hide(item,['d']);
//item.__setFieldType('solidHead','boolean');
graph.installRectanglePeripheryOps(item);
ui.setTransferredProperties(item,ui.stdTransferredProperties);

return item;

});

