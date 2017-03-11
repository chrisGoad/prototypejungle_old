// Arrow

'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<line/>');// x1="0" y1="0" x2="500" y2="50" stroke="black" stroke-width="2"/>');

/*adjustable parameters  */
item.set('end0',geom.Point.mk(-50,0));
item.set('end1', geom.Point.mk(50,0));
item.stroke = 'black';
item['stroke-width'] = 2;
/* end adjustable parameters */

item.__customControlsOnly = true;
item.__cloneable = true;
item.__adjustable = true;
item.__draggable = true;
item.__cloneResizable = true;

//item.__cloneable = true;
//item.__cloneResizable = true;
//item.__customControlsOnly = true;
//item.__adjustable = true;


item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

item.__domMap =
  {transfers:svg.commonTransfers,
   mapping:
     function (itm,element) {
      debugger;
       var e0 = itm.end0;
       var e1 = itm.end1;
       element.setAttribute('x1',e0.x);
       element.setAttribute('y1',e0.y);
       element.setAttribute('x2',e1.x);
       element.setAttribute('y2',e1.y);

    }
}


item.__getExtent = function () {
  var xdim = Math.abs(this.end1.x - this.end0.x);
  var ydim = Math.abs(this.end1.y - this.end0.y);
  return geom.Point.mk(xdim,ydim);
}



// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.__setExtent = function (extent,ordered) {
  debugger;
  var center = this.end1.plus(this.end0).times(0.5);
  var ox = ordered?(ordered.x?1:-1):1;
  var oy = ordered?(ordered.y?1:-1):1;
  var end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
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
