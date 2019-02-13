

'use strict';

core.require('/shape/lozengePeripheryOps.js',function (peripheryOps) {
var geom = core.geom;
var item = core.Object.mk();
var svg = core.svg;
var ui = core.ui;
var geom = core.geom;

var item =  svg.Element.mk('<path fill="none" stroke="grey"  stroke-opacity="1" stroke-linecap="round" stroke-width="0.1"/>');

/* adjustable parameters */
item.lowX = -50;
item.highX = 50;
item.lowY = -50;
item.highY = 50;
item.width = 50;
item.interval = 10;



item.update = function () {
  let lowX = item.lowX;
  let lowY = item.lowY;
  let interval = item.interval;
  let xsize = item.highX - lowX;
  let ysize = item.highY - lowY;
  let numX = Math.ceil(xsize/interval);
  let numY = Math.ceil(ysize/interval);
  let highX = lowX + interval*numX;
  let highY = lowY + interval*numY;
  let path = '';
  for (let i=0;i<=numY;i++) {//the horizontal lines
    let y=lowY + i*interval;
    path += 'M '+lowX+' '+y+' ';
    path += 'L '+highX+' '+y+' ';
  }
   for (let i=0;i<=numX;i++) {// the vertical lines
    let x=lowX + i*interval;
    path += 'M '+x+' '+lowY+' ';
    path += 'L '+x+' '+highY+' ';
  }
  this.d = path;
}


return item;

});

