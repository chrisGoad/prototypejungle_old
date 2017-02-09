// Arrow

'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<line/>');// x1="0" y1="0" x2="500" y2="50" stroke="black" stroke-width="2"/>');
item.set('end0',geom.Point.mk(-50,0));
item.set('end1', geom.Point.mk(50,0));
item.stroke = 'black';
item['stroke-width'] = 2;
//var item = svg.Element.mk('<g/>');
/*item.width = 50;
item.height = 35;
item.fill = 'none';
item.stroke = 'black';
item['stroke-width'] = 2;
*/
item.__cloneable = true;
item.__cloneResizable = false;
item.__customControlsOnly = true;

item.__adjustable = true;
//item.__draggable = false;
/*
 *item.set("__contents",svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke="green" '+
   ' stroke-width="2" fill="red"/>'));
//return item;
item.__contents.__unselectable = true;
item.__contents.__show();
*/

item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

item.__domMap =
  {transfers:svg.commonTransfers,
   mapping:
     function (itm,element) {
      debugger;
       var e0 = item.end0;
       var e1 = item.end1;
       var cx = 0.5 * (e0.x + e1.x);
       var cy = 0.5 * (e0.y + e1.y);
       var hdeltaX = 0.5*(e1.x - e0.x);
       var hdeltaY = 0.5*(e1.y - e0.y);
       element.setAttribute('x1',cx - hdeltaX);
       element.setAttribute('y1',cy - hdeltaY);
       element.setAttribute('x2',cx + hdeltaX);
       element.setAttribute('y2',cy + hdeltaY);

    }
}

item.__getExtentt = function () {
  var xdim = Math.abs(this.end1.x = this.end0.x);
  var ydim = Math.abs(this.end1.x = this.end0.x);
  
}


item.__setExtent = function (extent) {
  var center = this.end1.plus(this.end0).times(0.5);
  var end1  = geom.Point.mk(0.5 * extent.x,0.5 * extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);
}

item.__controlPoints = function () {
  return [this.end0,this.end1];
}

item.__updateControlPoint = function (idx,pos) {
  if (idx === 0) {
    this.end0.copyto(pos);
  } else {
    this.end1.copyto(pos);
  }
  this.__draw();
}

//ui.hide(item,['__contents']);

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

//pj.returnValue(undefined,item);
return item;
});
//();
