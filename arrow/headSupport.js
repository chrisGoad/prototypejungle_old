
core.require(function () {

let item = core.ObjectNode.mk();

item.updateBases = function (head) {
  let n,sh,h0,h1;
  let normal = head.direction.normal();
  n = normal.times(0.5*head.headWidth);
  sh = head.headPoint.difference(head.direction.times(head.headLength)); //  point on shaft where head projects
  h0 = sh.plus(n);
  head.headBase0.copyto(h0);
  h1 = sh.difference(n);
  head.headBase1.copyto(h1);
}



item.controlPoint = function () {
  return this.headBase0;
 
}

item.updateControlPoint = function (head,pos,forMultiOut) {
  let toAdjust,h2shaft,cHeadWidth,cHeadLength;
  let arrow = head.__parent;
  let strokeWidth = 0;
  if (arrow) {
    let sw = arrow['stroke-width'];
    if (typeof sw === 'number') {
      strokeWidth = sw;
    }
  }
  if (!forMultiOut) {
    let arrow = head.__parent;
    // if arrow owns headWidth, then it  should be adjusted regardless of ui.whatToAdjust
    if (arrow.hasOwnProperty('headWidth')) {
      toAdjust = arrow;
    } else {
      toAdjust = ui.vars.whatToAdjust?ui.vars.whatToAdjust:arrow;// we might be adjusting the prototype
    }
  }
  let normal = head.direction.normal();
  h2shaft = pos.difference(head.headPoint);
  cHeadWidth = h2shaft.dotp(normal) * 2.0;
  cHeadLength = -h2shaft.dotp(head.direction);
  if (forMultiOut) {
    return [cHeadWidth,cHeadLength];
  }
  toAdjust.headWidth = Math.max(2*strokeWidth,cHeadWidth);
  toAdjust.headLength = Math.max(strokeWidth,cHeadLength); 
  return head.headBase0;
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

