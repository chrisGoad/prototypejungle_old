// Arrow head - used for several kinds of arrows

'use strict';
  
core.require(function () {
  alert('obsolete: shape/arrowHead');
let {geom,svg,ui} = core;


let item = svg.Element.mk('<g/>');
/*adjustable parameters */
item.headWidth = 10;
item.headLength = 20;
item.stroke = "blue";
item['stroke-width'] = 2;
item.solidHead = false;
//item.roles = ['arrowHead'];
item.role = 'arrowHead';
/*end adjustable parameters */

//item.__adjustable = true;
item.customControlsOnly = true;


item.set('headBase0',core.geom.Point.mk(0,-10));
item.set('headBase1',core.geom.Point.mk(0,10));
item.set('headPoint',core.geom.Point.mk(10,0));
item.set('direction',core.geom.Point.mk(1,0));

item.nowSolidHead = undefined;//item.solidHead;

item.buildLineHead = function () {
  if (!this.headP) {
    this.set("headP",
      svg.Element.mk(`<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" 
        stroke="black"  stroke-linecap="round" stroke-width="2"/>`));
  }
  let head = this.set('head',svg.Element.mk('<g/>'));

  head.set("head0",this.headP.instantiate());
  head.set("head1",this.headP.instantiate());
  head.head0.show();
  head.head1.show();
  head.unselectable = true;
  head.head0.unselectable = true;
  head.head1.unselectable = true;
  this.nowSolidHead = false;
}

item.buildSolidHead = function () {
  this.set('head',
    svg.Element.mk('<path stroke-width = "0"/>'));
  this.head.unselectable = true;
  this.nowSolidHead = true;
}

item.drawSolidHead = function () {
  let p2str = function (letter,point) {
    return letter+' '+point.x+' '+point.y+' ';
  }
  
  let d = p2str('M',this.headBase0);
  d += p2str('L',this.headBase1);
  d += p2str('L',this.headPoint);
  d += p2str('L',this.headBase0);
  this.head.d = d;
  this.head.fill = this.stroke;
  this.head.draw();
}

item.drawLineHead = function () {
  this.head.head0.setEnds(this.headBase0,this.headPoint);
  this.head.head1.setEnds(this.headBase1,this.headPoint);
  this.headP.stroke = this.stroke;
  this.headP['stroke-width'] = this['stroke-width'];
 
}

item.update= function () {
  this.switchHeadsIfNeeded();
  let n,sh,h0,h1;
  let normal = this.direction.normal();
  n = normal.times(0.5*this.headWidth);
  sh = this.headPoint.difference(this.direction.times(this.headLength)); //  point on shaft where head projects
  h0 = sh.plus(n);
  this.headBase0.copyto(h0);
  h1 = sh.difference(n);
  this.headBase1.copyto(h1);
  if (this.solidHead) {
    this.drawSolidHead();
  } else {
    this.drawLineHead();
  }
}


item.switchHeadsIfNeeded = function () {
 if (this.head) {
    if (this.solidHead !== this.nowSolidHead) { // head type has changed
      this.head.remove();
      this.head = undefined;
    }
  }
  if (!this.head) {
    //ui.unselect();
    this.solidHead?this.buildSolidHead():this.buildLineHead();
  }
}


item.controlPoint = function () {
  return this.headBase0;
 
}

item.updateControlPoint = function (pos,forMultiOut) {
  let toAdjust,h2shaft,cHeadWidth,cHeadLength;
  if (!forMultiOut) {
    let arrow = this.__parent;
    // if arrow owns headWidth, then it  should be adjusted regardless of ui.whatToAdjust
    if (arrow.hasOwnProperty('headWidth')) {
      toAdjust = arrow;
    } else {
      toAdjust = ui.vars.whatToAdjust?ui.vars.whatToAdjust:arrow;// we might be adjusting the prototype
    }
  }
  let normal = this.direction.normal();
  h2shaft = pos.difference(this.headPoint);
  cHeadWidth = h2shaft.dotp(normal) * 2.0;
  cHeadLength = -h2shaft.dotp(this.direction);
  if (forMultiOut) {
    return [cHeadWidth,cHeadLength];
  }
  toAdjust.headWidth = Math.max(0,cHeadWidth);
  toAdjust.headLength = Math.max(0,cHeadLength); 
  return this.headBase0;
}


item.setEnds = function (p0,p1) {
  let arrow = this.__parent;
  arrow.end0.copyto(p0);
  arrow.end1.copyto(p1);
}

item.computeEnd1 = function (deviation) {
 let arrow = this.__parent;
 return arrow.end1.plus(arrow.direction.times(deviation));
}

// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.setExtent = function (extent,ordered) {
  let ox = ordered?(ordered.x?1:-1):1;
  let oy = ordered?(ordered.y?1:-1):1;
  let end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
  let end0 = end1.times(-1);
  this.setEnds(end0,end1);
}

return item;
});

