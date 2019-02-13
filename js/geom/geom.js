// Copyright 2019 Chris Goad
// License: MIT

import * as core from "/js/core-1.1.0.min.js";

let codeRoot = core.codeRoot;
let geomr = codeRoot.set("geom",core.ObjectNode.mk());
geomr.__builtIn = true;
geomr.set("Point",core.ObjectNode.mk()).__namedType();
let Point = geomr.Point;
let geometricObject; // defined up in dom by defineGeometric

const isGeometric = function (nd) {
  return core.ArrayNode.isPrototypeOf(nd) || (geometricObject && geometricObject.isPrototypeOf(nd));
}


Point.mk = function (x,y) {
  let rs = Object.create(Point);
  if (typeof x==="number") {
    rs.x = x;
    rs.y = y;
  } else {
    rs.x = 0;
    rs.y =0;
  }
  return rs;
}
  
Point.nonNegative = function () {
  this.x = Math.max(0,this.x);
  this.y = Math.max(0,this.y);
  return this;
}

Point.hasNaN = function () {
  return isNaN(this.x) || isNaN(this.y);
}

  
  
  // set the property p of this to v construed as a point 
  
core.ObjectNode.__setPoint = function (p,v) {
  let pnt;
  if (v) {
    pnt = toPoint(v);
  } else {
    pnt = Point.mk();
  }
  this.set(p,pnt);
  return pnt;
}



Point.x = 0;
Point.y = 0;



Point.plus = function (q) {
  let p = this;
  return Point.mk(p.x + q.x,p.y + q.y);
};

Point.plusX = function (x) {
  return Point.mk(this.x + x,this.y);
}
  
  
Point.plusY = function (y) {
  return Point.mk(this.x,this.y+y);
}

Point.length = function () {
  let {x,y} = this;
  return Math.sqrt(x*x + y*y);
}

// x might be an array, or a point, or x and y might be numbers
const pointify = function (mkNew,x,y) {
  let p;
  if (x === undefined) {
    p = Point.mk(0,0);
  } else if (typeof y ==="number") {
    p = Point.mk(x,y);
  } else if (core.ArrayNode.isPrototypeOf(x) || Array.isArray(x)) {
    p = Point.mk(x[0],x[1])
  } else {
    p = mkNew?Point.mk(x.x,x.y):x;
  }
  return p;
}



const toPoint = function (x,y) {
  return pointify(0,x,y);
}

Point.copy = function () {
  return Point.mk(this.x,this.y);
}
  
  
Point.copyto = function (src) {
  this.x = src.x;
  this.y = src.y;
  return this; 
}


const newPoint = function (x,y) {
  return pointify(1,x,y);
}

core.ObjectNode.setPointProperty = function (prop,pnt) {
  if (this.__get(prop)) {
    this[prop].copyto(pnt);
  } else {
    this[prop] = pnt.copy();
  }
}

Point.angleOf= function () {
  return normalizeAngle(Math.atan2(this.y,this.x));
}

Point.difference = function (q) {
  let p = this;
  return Point.mk(p.x - q.x,p.y - q.y);
}

Point.directionTo = function (pnt) {
    return pnt.difference(this).normalize();
}
geomr.set("Interval",core.ObjectNode.mk()).__namedType();
let Interval = geomr.Interval;

export {Interval};
Interval.mk = function (lb,ub) {
  let rs = Object.create(Interval);
  rs.lb = lb;
  rs.ub = ub;
  return rs;
}

const mkInterval = function (lb,ub) {
  return Interval.mk(lb,ub);
}

Point.setCoords = function (x,y) {
  this.set("x",x);
  this.set("y",y);
}

// if p is null, compute distance from origin
Point.distance = function (p) {
  let vx,vy;
  if (p) {
    vx = this.x - p.x;
    vy = this.y - p.y;
  } else {
    vx = this.x;
    vy = this.y;
  }
  return Math.sqrt(vx*vx + vy * vy);
  
}


Point.times = function (f) {
  let p = this;
  return Point.mk(f*p.x,f*p.y);
}


Point.normalize = function () {
  let ln = this.length();
  return Point.mk(this.x/ln,this.y/ln);
}


Point.normal = function () {
  return Point.mk(-this.y,this.x);
}

Point.minus = function () {
  return Point.mk(-this.x,-this.y);
}

Point.dotp = function (p) {
  return this.x * p.x + this.y * p.y;
}
const angleToDirection = function (a) {
  return Point.mk(Math.cos(a),Math.sin(a));
}

const mkRadialPoint = function (r,a) {
  return Point.mk(r*Math.cos(a),r*Math.sin(a));
}


Point.interpolate = function (dst,fc) {
   let d = dst.difference(this);
   let vc  = d.times(fc);
   let rs = this.plus(vc);
   return  rs;
}


Point.toRectangle = function () {
  let {x,y} = this;
  let xt = Point.mk(Math.abs(x),Math.abs(y));
  let cx = (x<0)?x:0;
  let cy = (y<0)?y:0;
  let crn = Point.mk(cx,cy);
  return Rectangle.mk({corner:crn,extent:xt});
}

Point.toString = function () {
  let {x,y} = this;
  return "["+x+","+y+"]";
}

geomr.set("Transform",core.ObjectNode.mk()).__namedType();

let Transform = geomr.Transform
// every transform will have all three of scale, rotation,translation defined.
// scale might be scale or a point. In the latter case, the scaling in  x and y are the scale's coordinates.
Transform.mk = function (o,scale,rotation) {
  let rs = Object.create(Transform);
  let otranslation,oscale,orotation;
  rs.scale = 1;
  rs.rotation = 0;
  if (!o) {
    rs.set("translation",Point.mk());
    return rs;
  }
  if (Point.isPrototypeOf(o)) {
    rs.set('translation',o.copy());
    if (typeof scale === 'number') {
      rs.scale = scale;
    } else if  (Point.isPrototypeOf(scale)) {
      rs.set('scale',scale.copy());
    }
    if (typeof rotation === 'number') {
      rs.rotation = rotation;
    }
    return rs;
  }
  otranslation = o.translation;
  if (otranslation) {
    rs.set('translation',otranslation.copy());
  }
  oscale = o.scale;
  if (typeof oscale === "number") {
    rs.scale = oscale;
  } else if  (Point.isPrototypeOf(oscale)) {
      rs.set('scale',oscale.copy());
  }
  orotation = o.rotation;
  if (typeof orotation === "number") {
    rs.rotation = orotation;
  } 
  return rs;
}

Transform.hasNaN = function() {
  if (isNaN(this.scale)) {
    return true;
  }
  if (isNaN(this.rotation)) {
    return true;
  }
  let tr = this.translation;
  if (tr) {
    return tr.hasNaN();
  }
}


const normalizeAngle = function (a) { // normalize to between 0 and 2*Pi
  let m = a%(Math.PI*2);
  if (m < 0) {
    m = m + Math.PI*2;
  }
  return m;
}
  
// see __draw: __properties translation (a point), subject and optionally scale,rotation (later matrix xform)
// if the subject is another translation

  
  
const mkRotation = function (r) {
  let trns =  Transform.mk();
  trns.rotation = r;
  return trns;

}

// x might be a point; this is in the object's own coord system
const mkTranslation = function (x,y) {
  let p = newPoint(x,y);
  let trns = Transform.mk({translation:p});
  return trns;
}

const mkScaling = function (s) {
  let trns = Transform.mk();
  trns.scale = s;
  return trns;
}
  
// move to a given location where x,y are in global coords
const movetoInGlobalCoords = function (nd,x,y) { // only for points for now; inputs are in global coordinates
  let p = toPoint(x,y);
  let lp = nd.toLocalCoords(p);//desired position of this relative to its parent
  // we want to preserve the existing scaling
  let xf = nd.transform;
  let o = {};
  if (xf) {
    xf.translation.setTo(lp);
  } else {
    o.translation = lp;
    let trns = Transform.mk(o);
    nd.set("transform",trns);
  }
  if (nd.realizeTransform) {
    nd.realizeTransform();
  }
}

  
Transform.inverse =  function () {
  let s = this.scale;
  let ns,nsx,nsy,tr,nx,ny;
  if (!s) {
    s = 1;
  }
  if (typeof s === "number") {
    ns = 1/s;
    nsx = ns;
    nsy = ns;
  } else {
    nsx = 1/(s.x);
    nsy = 1/(s.y);
    ns = Point.mk(nsx,nsy);
  }
  tr = this.translation;
  if (tr) {
    nx = -(tr.x) * nsx;
    ny = -(tr.y) * nsy;
    return Transform.mk({scale:ns,translation:Point.mk(nx,ny)});
  } else {
    return Transform.mk({scale:ns});
  }
  }

   
Point.applyTransform = function (tr) {
 // order: rotation,scaling  translation
 let trns = tr.translation;
 let tx = trns.x,ty = trns.y;
 let sc = tr.scale;
 let scx,scy,rt,x,y,s,c,rx,ry,fx,fy;
 if (sc === undefined) {
    scx = scy = 1;
 } else if (typeof sc === "number") {
   scx = scy = sc;
 } else {
   scx = sc.x;
   scy = sc.y;
 }
 rt = tr.rotation;
 ({x,y} = this);
 if (rt === 0) {
   rx = x;
   ry = y;
 } else {
   s = Math.sin(rt);
   c = Math.cos(rt);
   rx = c*x - s*y;
   ry = s*x + c*y;
 }
 fx = scx*rx + tx;
 fy = scy*ry + ty;
 return Point.mk(fx,fy);
}

Transform.apply = function (p) {
  return p.applyTransform(this);
}

Transform.applyInverse = function (p) {
  // reverse order: translation, scaling, rotation
  let trns = this.translation;
  let sc = this.scale;
  let rt = this.rotation;
  let px = p.x - trns.x;
  let py = p.y - trns.y;
  let isc = 1/sc;
  let s,c,fx,fy;
  px = px * isc;
  py = py * isc;
  if (rt === 0) {
    fx = px;
    fy = py;
  } else {
    s = Math.sin(-rt);
    c = Math.cos(-rt);
    fx = c*px - s*py;
    fy = s*px + c*py;
  }
 
  return Point.mk(fx,fy);
}

Point.applyInverse = function (tr) {
  return tr.applyInverse(this);
}

Transform.applyToPoints = function (pnts) {
  let rs = core.Array.mk();
  let thisHere = this;
  pnts.forEach(function (p) {
    rs.push(p.applyTransform(thisHere));
  });
  return rs;
}
    
const toCoords = function (nd,p) {
  let xf = nd.__get("transform");
  if (xf) {
    return xf.applyInverse(p);
  } else {
    return p;
  }
}

const toParentCoords = function (nd,p) {
 return nd.toLocalCoords(p);
}
  
// ip in nd's own coordinates
const toOwnCoords = function (nd,ip) {
  let p = nd.toLocalCoords(ip);
  let xf = nd.__get("transform");
  if (xf) {
    p = xf.applyInverse(p);
  }
  return p;
}


 const translateX = function (nd,x) {
  let xf = nd.transform;
  if (xf) {
    xf.translation.x =x;
    return;
  }
  xf = mkTranslation(x,0);
  nd.set("transform",xf);
}


 const translateY = function (nd,y) {
  let xf = nd.transform;
  if (xf) {
    xf.translation.y =y;
    return;
  }
  xf = mkTranslation(0,y);
  nd.set("transform",xf);
}
  



const rotate = function (nd,r) {
  let xf = nd.transform;
  if (xf) {
    xf.rotation = r;
    return xf;
  }
  xf = mkRotation(r);
  nd.set("transform",xf);
}

    
    
Point.setTo = function (src) {
  this.x = src.x;
  this.y = src.y;
}

Point.setXY = function (x,y) {
  if (y === undefined) { // assume the one arg is a point
    this.x = x.x;
    this.y = x.y;
  } else { 
    this.x = x;
    this.y = y;
  }
}

geomr.set("LineSegment",core.ObjectNode.mk()).__namedType();

let LineSegment = geomr.LineSegment;

LineSegment.mk = function (end0,end1,dontCopy) {
  let rs = Object.create(LineSegment);
  if (!end0) {
    return rs;
  }
  if (dontCopy) {
    rs.set('end0',end0);
    rs.set('end1',end1);
  } else {
    rs.set('end0',end0.copy());
    rs.set('end1',end1.copy());
  }
  return rs;
}


LineSegment.length = function () {
  return (this.end1.difference(this.end0)).length();
}

LineSegment.pointAlong = function (fraction) {
  let end0,end1;
  ({end0,end1} = this);
  let d = end1.difference(end0);
  return end0.plus(d.times(fraction));
}

LineSegment.intersect = function (line1) {
  let line0 = this;
  let x0 = line0.end0.x;
  let y0 = line0.end0.y;
  let x1 = line1.end0.x;
  let y1 = line1.end0.y;
  let maxX0 = Math.max(line0.end0.x,line0.end1.x);
  let minX0 = Math.min(line0.end0.x,line0.end1.x);
  let maxX1 = Math.max(line1.end0.x,line1.end1.x);
  let minX1 = Math.min(line1.end0.x,line1.end1.x);
  if ((minX1 > maxX0)||(minX0 > maxX1)) {
    return false;
  }
  let maxY0 = Math.max(line0.end0.y,line0.end1.y);
  let minY0 = Math.min(line0.end0.y,line0.end1.y);
  let maxY1 = Math.max(line1.end0.y,line1.end1.y);
  let minY1 = Math.min(line1.end0.y,line1.end1.y);
  if ((minY1 > maxY0)||(minY0 > maxY1)) {
    return false;
  }
 
  let n = line0.end1.difference(line0.end0).normalize().normal();
  let nx = n.x;
  let ny = n.y;
  let v1 = line1.end1.difference(line1.end0);
  let length = v1.length();
  let d = v1.times(1/length);
  let dx = d.x;
  let dy = d.y;
  let den = (dx*nx + dy*ny);
  if (Math.abs(den) < 0.001) { // lines are parallel
    return false;
  }
  let t = -((y1-y0)*ny + (x1-x0)*nx)/den;
  if ((t<0) || (t > length+0)) {// line1 terminates before it meets line0
    return false;
  }
  let ip = line1.end0.plus(d.times(t));// intersection point
  if (ip.difference(line0.end0).dotp(ip.difference(line0.end1))<=0) {
    return ip;
  }
  return false;
  
}

geomr.set("Rectangle",core.ObjectNode.mk()).__namedType();
let Rectangle = geomr.Rectangle;
// takes corner,extent or {corner:c,extent:e,style:s} style being optional, or no args
// Rectangles without styles are often used for purely computational purpose - never drawn.
Rectangle.mk = function (a0,a1) {
  let rs = Object.create(Rectangle);
  let c,e,style;
  if (!a0) {
    return rs;
  }
  if (a1) {
    c = a0;
    e = a1;
  } else {
    if (a0.style) {
      style = core.draw.Style.mk();
      rs.set("style",style);
      core.extend(style,a0.style);
    }
    c = a0.corner;
    e = a0.extent;
  }
  rs.__setPoint("corner",c);
  rs.__setPoint("extent",e);
  return rs;
}
  
Rectangle.toString = function () {
  let corner,extent;
  ({corner,extent} = this);
  return '[['+corner.x+','+corner.y+'],['+extent.x+','+extent.y+']]';
}

Rectangle.hasNaN = function () {
  let crn = this.corner;
  let xt = this.extent;
  if (crn) {
    if (isNaN(crn.x) || isNaN(xt.y)) {
      return true;
    }
  }
  if (xt) {
    if (isNaN(xt.x) || isNaN(xt.y)) {
      return true;
    }
  }
}


Rectangle.set("corner",Point.mk());
Rectangle.set("extent",Point.mk(1,1));

Rectangle.corners = function () {
  let rs = [];
  let c = this.corner;
  let cx = c.x,cy = c.y;
  let xt = this.extent;
  let xtx = xt.x;
  let xty = xt.y;
  // right hand rule
  rs.push(Point.mk(cx+xtx,cy+xty));
  rs.push(Point.mk(cx+xtx,cy));
  rs.push(c);
  rs.push(Point.mk(cx,cy+xty));
  return rs;
}


Rectangle.sides = function () {
  let corners = this.corners();
  let rs = [];
  rs.push(LineSegment.mk(corners[0].copy(),corners[1].copy()));
  rs.push(LineSegment.mk(corners[1].copy(),corners[2].copy()));
  rs.push(LineSegment.mk(corners[2].copy(),corners[3].copy()));
  rs.push(LineSegment.mk(corners[3].copy(),corners[0].copy()));
  return rs;
}
// The point is some point outide the rectangle. This determines where a ray from the center with the given direction 
// intersects the rectangle. Used in graph construction interface. Could be optimized in several ways
// retuns {interesection:Point,side:integer,sideFraction:real}. sideFraction is the fraction  of the way along the side
// at which the interesection point appears.
Rectangle.peripheryAtDirection = function(direction) {  
  let sides = this.sides();
  let dim = 2*Math.max(this.extent.x,this.extent.y);
  let center = this.center();
  let line = LineSegment.mk(center,center.plus(direction.times(dim)));
  for (let i=0;i<4;i++) {
    let side = sides[i];
    let intersection = line.intersect(sides[i]);
    if (intersection) {
      let fractionAlong =  ((intersection.difference(side.end0)).length())/(side.length());
      return {intersection,side:i,sideFraction:fractionAlong};
    }
  }
}

Rectangle.alongPeriphery = function (edge,fraction) {
  let sides = this.sides();
  let side = sides[edge];
  return side.pointAlong(fraction);
}


Rectangle.expandBy = function (x,y) {
  let xt = this.extent;
  let c = this.corner;
  let nex = xt.x + x;
  let ncx = c.x - 0.5*x;
  let ney =  xt.y + y;
  let ncy =  c.y -0.5*y;
  return Rectangle.mk(Point.mk(ncx,ncy),Point.mk(nex,ney));
}

  
// expand the extent of this to at least x in x and y in y

Rectangle.expandTo = function (x,y) {
  let xt = this.extent;
  let xx = (xt.x < x)?(x-xt.x):0;
  let yx = (xt.y < y)?(y-xt.y):0;
  if ((xx === 0) && (yx === 0)) {
    return  this;
  }
  return this.expandBy(xx,yx);
}
  

// the bounding rectangle of an array of points

const boundingRectangle = function (pnts) {
  let ln = pnts.length;
  if (ln===0) {
    return undefined;
  }
  let p0 = pnts[0];
  let minx = p0.x;
  let maxx = minx;
  let miny = p0.y;
  let maxy = miny;
  for (let i=1;i<ln;i++) {
    let p = pnts[i];
    let px = p.x,py = p.y;
    maxx = Math.max(maxx,px);
    minx = Math.min(minx,px);
    maxy = Math.max(maxy,py);
    miny = Math.min(miny,py);
  }
  return Rectangle.mk({corner:Point.mk(minx,miny),extent:Point.mk(maxx-minx,maxy-miny)});
}

// this ignores any transforms the rectangles might have 
Rectangle.extendBy = function (xby) {
  let corners = this.corners().concat(xby.corners());
  return boundingRectangle(corners);
}

const boundsForRectangles = function (rectangles) {
  let ln = rectangles.length;
  if (ln === 0) {
    return undefined;
  }
  let allCorners = [];
  rectangles.forEach(function (rectangle) {
    let corners = rectangle.corners();
    corners.forEach(function (corner) {
      allCorners.push(corner);
    });
  });
  return boundingRectangle(allCorners);
}
    
  
Rectangle.center = function () {
  let xt = this.extent;
  let c = this.corner;
  return Point.mk(c.x + 0.5*xt.x,c.y + 0.5*xt.y);
}


Rectangle.width = function () {
  return this.extent.x
}


Rectangle.height = function () {
  return this.extent.y
}

Rectangle.scaleCentered = function (sc) { // while maintaining the same center
  let wd = this.width();
  let ht = this.height();
  let cnt = this.center();
  let swd =  sc * wd;
  let sht =  sc * ht;
  let crn = cnt.plus(Point.mk(-0.5 * swd,-0.5 * sht));
  let xt = Point.mk(swd,sht);
  return Rectangle.mk({corner:crn,extent:xt});
}

Rectangle.plus = function (p) { // __translate
  let rs = Rectangle.mk({corner:this.corner.plus(p),extent:this.extent});
  return rs;
}

Rectangle.contains = function (p) {
  let c = this.corner;
  let px = p.x;
  let py,ex;
  if (px < c.x) {
    return false;
  }
  py = p.y;
  if (py < c.y) {
    return false;
  }
  ex = this.extent;
  if (px > c.x + ex.x) {
    return false;
  }
  if (py > c.y + ex.y) {
    return false;
  }
  return true;
}


  
Rectangle.distance2 = function (p,msf) {
  if (!this.contains1(p)) {
    return undefined;
  }
  let c = this.corner;
  let xt = this.extent;
  let ux = c.x + xt.x;
  let uy = c.y + xt.y;
  let d = Math.min(p.x - c.x,ux - p.x,p.y - c.y,uy - p.y);
  if (d < msf) {
    return d;
  }
  return undefined;
}

// for rotation, all four corners need consideration
Rectangle.applyTransform = function (tr) {
  let rt = tr.rotation;
  let crn,xt,sc,rcrn,rxt,corners,xcorners;
   if (rt === 0) {
    crn = this.corner;
    xt = this.extent;
    sc = tr.scale;
    rcrn = crn.applyTransform(tr);
    rxt = xt.times(sc);
    return Rectangle.mk({corner:rcrn,extent:rxt});
  } else {
    corners = this.corners();
    xcorners = corners.map(function (c) {return c.applyTransform(tr)});
    return boundingRectangle(xcorners);
  }
  // the transform which fitst the rectangle this evenly into the rectangle dst
}



Rectangle.applyInverse = function (xf) {
  let tcorner = xf.applyInverse(this.corner);
  let textent = this.extent.times(1/xf.scale);
  let rs = Rectangle.mk(tcorner,textent);
  return rs;
}
  
Rectangle.upperLeft = function () {
  return this.corner;
}

Rectangle.lowerLeft = function () {
  let corner = this.corner;
  let  x =  corner.x;
  let y = corner.y + this.extent.y;
  return Point.mk(x,y);
}



Rectangle.upperRight = function () {
  let corner = this.corner;
  let  x =  corner.x + this.extent.x;
  let y = corner.y;
  return Point.mk(x,y);
}


Rectangle.lowerRight = function () {
  let corner = this.corner;
  let  x =  corner.x + this.extent.x;
  let y = corner.y + this.extent.y;
  return Point.mk(x,y);
}



Rectangle.containsRectangle = function (r) {
  return this.contains(r.upperLeft()) && this.contains(r.lowerRight());
}
 
//  does not work with rotations
Transform.times = function (tr) {
  let sc0 = this.scale;
  let sc0N,sc0x,sc0y,sc1N,sc1x,sc1y,tr0,tr1,sc,sc1,scx,scy,trX,trY,rtr,rs;
  if (typeof sc0 === "number") {
    sc0N = 1;
    sc0x = sc0;
    sc0y = sc0;
  } else {
    sc0x = sc0.x;
    sc0y = sc0.y;
  }
  sc1 = tr.scale;
  if (typeof sc1 === "number") {
    sc1N = 1;
    sc1x = sc1;
    sc1y = sc1;
  } else {
    sc1x = sc0.x;
    sc1y = sc0.y;
  }
  tr0 = this.translation;
  tr1 = tr.translation;
  if (sc0N && sc1N) {
    sc = sc0 * sc1;
  } else {
    scx = sc0x*sc1x;
    scy = sc0y*sc1y;
    sc = Point.mk(scx,scy);
  } 
  trX = sc1x * tr0.x + tr1.x;
  trY = sc1y * tr0.y + tr1.y;
  rtr = Point.mk(trX,trY);
  rs = Transform.mk({scale:sc,translation:rtr});
  return rs;
}
    
    
    
Rectangle.transformTo = function (dst) {
  let cnt = this.center();
  let dcnt = dst.center();
  let wd = this.width();
  let ht = this.height();
  let dwd = dst.width();
  let dht = dst.height();
  let wdr,htr,r,x,y,rs;
  if ((wd===0)&&(ht===0)) {
    return Transform.mk({translation:Point.mk(0,0),scale:1});
  }
  wdr = (wd === 0)?Infinity:dwd/wd;
  htr = (ht === 0)?Infinity:dht/ht;
  r = Math.min(wdr,htr);
  x = dcnt.x - (cnt.x)*r;
  y = dcnt.y - (cnt.y)*r;
  rs = Transform.mk({translation:Point.mk(x,y),scale:r});
  return rs;
}
  
// rectangle is  given relative  to node's coords
Rectangle.toGlobalCoords = function (node) {
  let corner = this.corner;
  let outerCorner = corner.plus(this.extent);
  let globalCorner = node.toGlobalCoords(corner);
  let globalOuter = node.toGlobalCoords(outerCorner);
  return Rectangle.mk(globalCorner,globalOuter.difference(globalCorner));
}

Rectangle.toAncestorCoords = function (node,ancestor) {
  let corner = this.corner;
  let outerCorner = corner.plus(this.extent);
  let ancestorCorner = node.toAncestorCoords(corner,ancestor);
  let ancestorOuter = node.toAncestorCoords(outerCorner,ancestor);
  return Rectangle.mk(ancestorCorner,ancestorOuter.difference(ancestorCorner));
}

// rectangle is given relative to global coords - returns relative to ownCoords
Rectangle.toOwnCoords = function (node) {
  let corner = this.corner;
  let outerCorner = corner.plus(this.extent);
  let ownCorner = toOwnCoords(node,corner);
  let ownOuter = toOwnCoords(node,outerCorner);
  return Rectangle.mk(ownCorner,ownOuter.difference(ownCorner));
}

  
const mkSquare = function (center,sz) {
  let {x,y} = center;
  let hsz = sz/2;
  let lx = x-hsz;
  let ly = y-hsz;
  return Rectangle.mk([lx,ly],[sz,sz]);
}

core.ObjectNode.__countShapes = function () {
  let cnt = 1;
  this.shapeTreeIterate(function (c) {
    cnt = cnt + c.__countShapes();
  });
  return cnt;
}


core.ArrayNode.__countShapes = core.ObjectNode.__countShapes;

const flipY = function (pnts,bias) {
  let rs = core.Array.mk();
  pnts.forEach(function (p) {
    let fp = Point.mk(p.x,bias -p.y);
    rs.push(fp);
  });
  return rs;
}

// coverage is data space, extent is image space.
// this maps the former to the later, with a y flip
// used for graphing
const transformForGraph = function (coverage,extent) {
  let cvxt = coverage.extent;
  let xtxt = extent.extent;
  let cvc = coverage.corner;
  let xtc = extent.corner;
  let scx = (xtxt.x)/(cvxt.x);
  let scy = -(xtxt.y)/(cvxt.y);
  let tx = xtc.x - scx * cvc.x;
  let ty = (xtc.y + xtxt.y) - scy * cvc.y;
  let tr = Point.mk(tx,ty);
  let sc = Point.mk(scx,scy);
  let rs = Transform.mk({scale:sc,translation:tr});
  return rs;
}

const degreesToRadians =  function (n) {return Math.PI * (n/180);}

const radiansToDegrees =  function (n) {return 180 * (n/Math.PI);}

Rectangle.randomPoint = function () {
  let c = this.corner;
  let ex = this.extent;
  let x = c.x + (ex.x)*Math.random();
  let y = c.y +(ex.y)*Math.random();
  return Point.mk(x,y);
}


export {movetoInGlobalCoords,toOwnCoords,toPoint,angleToDirection,Point,Rectangle,Transform,
        LineSegment,boundsForRectangles};
