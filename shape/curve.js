//free curve

core.require(function () {
let item = svg.Element.mk('<path />');

/*adjustable parameters  */
item.set('points',core.ArrayNode.mk());
item.points.push(geom.Point.mk(0,0));
item.stroke = 'black';
item.fill = 'none';
item['stroke-width'] = 2;
item.bendLength  =  20;
/* end adjustable parameters */


item.customControlsOnly = false;
item.resizable = true;

item.bendStartOrEnd = function (start,corner,isStart) {
  let vec = corner.difference(start);
  let dist = vec.length();
  let fraction;
  if (dist < this.bendLength) {
    fraction = 0.5;
  }  else {
    fraction = 0.5*(this.bendLength/dist);
  }
  if (isStart) {
    fraction = 1 - fraction;
  }
  let nrmVec = vec.times(1/dist);
  return start.plus(nrmVec.times(fraction*dist));
}

item.startPointSeries = function () {}

item.completePointSeries = function () {
  delete this.pathCopy;
  let points = this.points;
  let pnt = points[points.length - 1];
  let trns = dom.svgMain.contents.transform;
  let s = 3;
  if (trns) {
    s = trns.scale;
  }
  if (extensionPoint.distance(pnt) > (3/s)) {
     this.points.push(extensionPoint.copy());
  }
  this.update();
  this.draw();
}

item.getBounds = function () {
  let pnts = this.points;
  let ln = pnts.length;
  if (ln === 0) {
    return;
  }
  let pnt0 = pnts[0];
  let lbx = pnt0.x;
  let lby = pnt0.y;
  let ubx = lbx;
  let uby = lby;
  for (let i=1;i<ln;i++) {
    let pnt = pnts[i];
    lbx = Math.min(lbx,pnt.x);
    ubx = Math.max(ubx,pnt.x);
    lby = Math.min(lby,pnt.y);
    uby = Math.max(uby,pnt.y);
  }
  let corner = geom.Point.mk(lbx,lby);
  let extent = geom.Point.mk(ubx-lbx,uby-lby);
  return geom.Rectangle.mk(corner,extent);
}

item.recenter = function () {
  let bnds = this.getBounds();
  let cnt = bnds.center();
  let tr = this.getTranslation();
  this.moveto(tr.plus(cnt));
  let cntx = cnt.x;
  let cnty = cnt.y;
  this.points.forEach(function (p) {
    p.x = p.x - cntx;
    p.y = p.y - cnty;
  });
  return bnds.extent;
}

item.addToPointSeries = function (point) {
  let relPoint = point.difference(this.getTranslation());
  this.points.push(relPoint);
  this.update();
  this.draw();
}

const p2str = function (letter,point,after) {
    return  letter+' '+point.x+' '+point.y+(after?after:' ');
}

let extensionPoint;

item.moveExtensionPoint = function (point) {
  let relPoint = point.difference(this.getTranslation())
  extensionPoint = relPoint;
  this.d = this.pathCopy + ' ' + p2str('L',relPoint,'');
  this.draw();
}

item.deleteLastPoint = function () {
  let points = this.points;
  let ln = points.length;
  if (ln > 1) {
    points.length = ln - 1;
  }
  this.update();
  this.draw();
}

item.update = function (options) {
  // build a quadratic bezier, with bends at the points
  if (!options || !(options.fromSetExtent)) {
    let xt = this.recenter();
    this.width = xt.x;
    this.height = xt.y;
  }
  let path;
  const addToPath = function (letter,point,after) {
    path +=  p2str(letter,point,after);
  }
  let pnts = this.points;
  let ln = pnts.length;
  if (ln < 1) {
    this.d = 'M 0 0 ';
    this.pathCopy = this.d;
    return;
  }
  let controlPoints =[]; // these come in triples bendStart, corner, bendEnd, with straight lines between them
  let i=0;
  path = '';
  addToPath('M',pnts[0]);
  if (ln === 2) {
    addToPath('L',pnts[1]);
    this.d = path;
    this.pathCopy = path;
    return;
  }
  while (i < ln-2) {
    let start = pnts[i];
    let corner = pnts[i+1];
    let dest = pnts[i+2];
    let bendStart = this.bendStartOrEnd(start,corner,true);
    let bendEnd  = this.bendStartOrEnd(corner,dest,false);
    controlPoints.push(bendStart);
    controlPoints.push(corner);
    controlPoints.push(bendEnd);
    i++;
  }
  controlPoints.push(pnts[i+1]);
  i = 0;
  let lncp = controlPoints.length;
  while (i<lncp-3) {
    addToPath('L',controlPoints[i]);
    addToPath('Q',controlPoints[i+1],',');
    addToPath('',controlPoints[i+2]);
    addToPath('L',controlPoints[i+3],'');
    i += 3;
  }
  this.pathCopy = path;
  this.d = path;
}
  
item.controlPoints = function () {
  return this.points;
}

item.updateControlPoint = function (idx,rpos) {
  this.points[idx].copyto(rpos);
  // this.points[idx] = rpos;
  this.update();
  this.draw();
}

let fromSetExtent = {fromSetExtent:1};

//this overrides the standard definition of the method in the geom module
item.setExtent = function (xt) {
  let bnds = this.getBounds();
  let oxt = bnds.extent;
  let xF = (xt.x)/(oxt.x);
  let yF = (xt.y)/(oxt.y);
  let points = this.points;
  points.forEach(function (pnt) {
    pnt.x = xF * pnt.x;
    pnt.y = yF * pnt.y;
  });
  this.width = xt.x;
  this.height = xt.y;
  this.update(fromSetExtent);
}

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['stroke','stroke-width'],own);
  this.set('points',src.points.copy());
}

ui.hide(item,['points','d','roles','pathCopy']);

item.actions = function () {
    return [{title:'Delete Last Curve Point',action:'deleteLastPoint'}];
  }

return item;
});

