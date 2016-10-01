 
var geom = pj.set("geom",pj.Object.mk());
geom.__builtIn = true;
geom.set("Point",pj.Object.mk()).__namedType;

geom.Point.mk = function (x,y) {
  var rs = Object.create(geom.Point);
  if (typeof x==="number") {
    rs.x = x;
    rs.y = y;
  } else {
    rs.x = 0;
    rs.y =0;
  }
  return rs;
}
  
geom.Point.nonNegative = function () {
  this.x = Math.max(0,this.x);
  this.y = Math.max(0,this.y);
  return this;
}

geom.Point.hasNaN = function () {
  return isNaN(this.x) || isNaN(this.y);
}

  
  
  // set the property p of this to v construed as a point 
  
pj.Object.__setPoint = function (p,v) {
  var pnt;
  if (v) {
    pnt = geom.toPoint(v);
  } else {
    pnt = geom.Point.mk();
  }
  this.set(p,pnt);
  return pnt;
}



geom.Point.x = 0;
geom.Point.y = 0;



geom.Point.plus = function (q) {
  var p = this;
  return geom.Point.mk(p.x + q.x,p.y + q.y);
};

geom.Point.plusX = function (x) {
  return geom.Point.mk(this.x + x,this.y);
}
  
  
geom.Point.plusY = function (y) {
  return geom.Point.mk(this.x,this.y+y);
}

geom.Point.length = function () {
  var x = this.x;
  var y = this.y;
  return Math.sqrt(x*x + y*y);
}

// x might be an array, or a point, or x and y might be numbers
geom.pointify = function (mkNew,x,y) {
  var p;
  if (x === undefined) {
    p = geom.Point.mk(0,0);
  } else if (typeof(y)==="number") {
    p = geom.Point.mk(x,y);
  } else if (Array.isArray(x)) {
    p = geom.Point.mk(x[0],x[1])
  } else {
    p = mkNew?geom.Point.mk(x.x,x.y):x;
  }
  return p;
}



geom.toPoint = function (x,y) {
  return geom.pointify(0,x,y);
}

geom.Point.copy = function () {
  return geom.Point.mk(this.x,this.y);
}
  
  
geom.Point.copyto = function (src) {
  this.x = src.x;
  this.y = src.y;
  return this; 
}


geom.newPoint = function (x,y) {
  return geom.pointify(1,x,y);
}


geom.Point.direction = function () {
  return geom.normalizeAngle(Math.atan2(this.y,this.x));
}

geom.Point.difference = function (q) {
  var p = this;
  return geom.Point.mk(p.x - q.x,p.y - q.y);
}

geom.set("Interval",pj.Object.mk()).__namedType();


geom.Interval.mk = function (lb,ub) {
  var rs = Object.create(geom.Interval);
  rs.lb = lb;
  rs.ub = ub;
  return rs;
}

geom.mkInterval = function (lb,ub) {
  return geom.Interval.mk(lb,ub);
}

geom.Point.setCoords = function (x,y) {
  this.set("x",x);
  this.set("y",y);
}

// if p is null, compute distance from origin
geom.Point.distance = function (p) {
  var vx,vy;
  if (p) {
    vx = this.x - p.x;
    vy = this.y - p.y;
  } else {
    vx = this.x;
    vy = this.y;
  }
  return Math.sqrt(vx*vx + vy * vy);
  
}


geom.Point.times = function (f) {
  var p = this;
  return geom.Point.mk(f*p.x,f*p.y);
}


geom.Point.normalize = function () {
  var ln = this.length();
  return geom.Point.mk(this.x/ln,this.y/ln);
}


geom.Point.normal = function () {
  return geom.Point.mk(-this.y,this.x);
}

geom.Point.minus = function () {
  return geom.Point.mk(-this.x,-this.y);
}

geom.Point.dotp = function (p) {
  return this.x * p.x + this.y * p.y;
}

geom.mkRadialPoint = function (r,a) {
  return geom.Point.mk(r*Math.cos(a),r*Math.sin(a));
}


geom.Point.interpolate = function (dst,fc) {
   var d = dst.difference(this);
   var vc  = d.times(fc);
   var rs = this.plus(vc);
   return  rs;
}

geom.Point.toRectangle = function () {
  var x = this.x;
  var y = this.y;
  var xt = geom.Point.mk(Math.abs(x),Math.abs(y));
  var cx = (x<0)?x:0;
  var cy = (y<0)?y:0;
  var crn = geom.Point.mk(cx,cy);
  return geom.Rectangle.mk({corner:crn,extent:xt});
}

geom.Point.toString = function () {
  var x = this.x;
  var y = this.y;
  return "["+x+","+y+"]";
}

geom.set("Transform",pj.Object.mk()).__namedType();

// every transform will have all three of scale, rotation,translation defined.
// scale might be scale or a point. In the latter case, the scaling in  x and y are the scale's coordinates.
geom.Transform.mk = function (o) {
  var rs = Object.create(geom.Transform);
  var ort,s;
  rs.scale = 1;
  rs.rotation = 0;
  if (!o) {
    rs.set("translation",geom.Point.mk());
    return rs;
  }
  ort = o.rotation;
  if (typeof ort === "number") {
    rs.rotation = ort;
  } else {
    rs.rotation = 0;
  }
  s = o.scale;
  if (s===undefined) {
    s = 1;
  }
  if (typeof s === "object") {
    rs.__setPoint("scale",s);
  } else {
    rs.scale = s;
  }
  rs.__setPoint("translation",o?o.translation:undefined);
  return rs;
  
}

geom.Transform.hasNaN = function() {
  if (isNaN(this.scale)) return true;
  if (isNaN(this.rotation)) return true;
  var tr = this.translation;
  if (tr) {
    return tr.hasNaN();
  }
}


geom.normalizeAngle = function (a) { // normalize to between 0 and 2*Pi
  var m = a%(Math.PI*2);
  if (m < 0) m = m + Math.PI*2;
  return m;
}
  
// see __draw: __properties translation (a point), subject and optionally scale,rotation (later matrix xform)
// if the subject is another translation

  
  
geom.mkRotation = function (r) {
  var trns =  geom.Transform.mk();
  trns.rotation = r;
  return trns;

}

// x might be a point; this is in the object's own coord system
geom.mkTranslation = function (x,y) {
  var p = geom.newPoint(x,y);
  var trns = geom.Transform.mk({translation:p});
  return trns;
}

geom.mkScaling = function (s) {
  var trns = geom.Transform.mk();
  trns.scale = s;
  return trns;
}
  
// move to a given location where x,y are in global coords
geom.movetoInGlobalCoords = function (nd,x,y) { // only for points for now; inputs are in global coordinates
  var p = geom.toPoint(x,y);
  var pr = nd.__parent;
  var lp = geom.toLocalCoords(nd,p);//desired position of this relative to its parent
  // we want to preserve the existing scaling
  var xf = nd.transform;
  var o = {};
  if (xf) {
    xf.translation.setTo(lp);
  } else {
    o.translation = lp;
    var trns = geom.Transform.mk(o);
    nd.set("transform", trns);
  }
  nd.__transformToSvg();

}

  
geom.Transform.inverse =  function () {
  var s = this.scale;
  var ns,nsx,nsy,tr;
  if (!s) s = 1;
  if (typeof s === "number"){
    ns = 1/s;
    nsx = ns;
    nsy = nsy;
  } else {
    nsx = 1/(s.x);
    nsy = 1/(s.y);
    ns = geom.Point.mk(nsx,nsy);
  }
  tr = this.translation;
  if (tr) {
    nx = -(tr.x) * nsx;
    ny = -(tr.y) * nsy;
    return geom.Transform.mk({scale:ns,translation:geom.Point.mk(nx,ny)});
  } else {
    return geom.Transform.mk({scale:ns});
  }
  }

   
geom.Point.applyTransform = function (tr) {
 // order: rotation,scaling  translation
 var trns = tr.translation;
 var tx = trns.x,ty = trns.y;
 var sc = tr.scale;
 var scx,scy,rt,x,y,s,c,rx,ry,fx,fy;
 if (sc === undefined) {
    scx = scy = 1;
 } else if (typeof sc === "number") {
   scx = scy = sc;
 } else {
   scx = sc.x;
   scy = sc.y;
 }
 rt = tr.rotation;
 x = this.x;
 y = this.y;
 if (rt === 0) {
   var rx = x,ry = y;
 } else {
   s = Math.sin(rt);
   c = Math.cos(rt);
   rx = c*x - s*y;
   ry = s*x + c*y;
 }
 fx = scx*rx + tx;
 fy = scy*ry + ty;
 return geom.Point.mk(fx,fy);
}

geom.Transform.apply = function (p) {
  return p.applyTransform(this);
}

geom.Transform.applyInverse = function (p) {
  // reverse order: translation, scaling, rotation
  var trns = this.translation;
  var sc = this.scale;
  var rt = this.rotation;
  var px = p.x - trns.x;
  var py = p.y - trns.y;
  var isc = 1/sc;
  var s,c,fx,fy;
  px = px * isc;
  py = py * isc;
  if (rt === 0) {
    fx = px,fy = py;
  } else {
    s = Math.sin(-rt);
    c = Math.cos(-rt);
    fx = c*px - s*py;
    fy = s*px + c*py;
  }
 
  return geom.Point.mk(fx,fy);
}

geom.Point.applyInverse = function (tr) {
  return tr.applyInverse(this);
}

geom.Transform.applyToPoints = function (pnts) {
  var rs = pj.Array.mk();
  var thisHere = this;
  pnts.forEach(function (p) {
    rs.push(p.applyTransform(thisHere));
  });
  return rs;
}
    

// ip is in this's coords. Return ip's coords at the top level: ie, at the svg level. // relative to the root of the tree.
// the transform of the root itself is not included (this last takes care of the zoom and pan)
// globalObject, if ommitted,is effectively pj.  If includeRoot is given, then  this means go all the way up
// to svg coords. Otherwise, stop at ui.root

geom.toGlobalCoords = function (nd,ip,includeRoot) {
  var p = ip?ip:geom.Point.mk(0,0);
  var pr = nd.__get('__parent');
  var atRoot = !(pj.svg.Element.isPrototypeOf(pr) || pj.Array.isPrototypeOf(pr));
  var xf;
  if (atRoot && !includeRoot) return p;
  xf =nd.__get("transform");
  if (xf) {
    p = p.applyTransform(xf);
  }
  if (atRoot) return p;
  return geom.toGlobalCoords(pr,p);
}
  
  
geom.scalingDownHere = function (nd,includeRoot,sofar) {
  var s = (sofar===undefined)?1:sofar;
  var pr = nd.__get('__parent');
  var atRoot = !(pj.svg.Element.isPrototypeOf(pr) || pj.Array.isPrototypeOf(pr));
  var xf;
  if (atRoot && !includeRoot) return s;
  xf =nd.__get("transform");
  if (xf) {
    s = xf.scale * s;
  }
  if (atRoot) return s;
 return geom.scalingDownHere(pr,includeRoot,s);
}
// p is in the coords of nd's parent; returns that point in nd's own coords

geom.toCoords = function (nd,p) {
  var xf = nd.__get("transform");
  if (xf) {
    return xf.applyInverse(p);
  } else {
    return p;
  }
}
// ip is in global coords. Return ip's coords in the coords associated with nd's parent
// (If we wish to move nd to p, we want p expressed in nd's parent's coords)
geom.toLocalCoords = function (nd,ip,toOwn) {
 var p = ip?ip:geom.Point.mk(0,0);
 var pr = nd.__get('__parent');
 var prIsRoot = (!pr);
 if (prIsRoot) return toOwn?geom.toCoords(nd,p):p;
 var gpr = pr.__get('__parent');
 var prIsRoot = !(pj.svg.Element.isPrototypeOf(gpr) || pj.Array.isPrototypeOf(gpr));
 if (prIsRoot) return toOwn?geom.toCoords(nd,p):p;
 p = geom.toLocalCoords(pr,p); // p in the coords of the grandparent
 p = geom.toCoords(pr,p);
 return toOwn?geom.toCoords(nd,p):p;
}

geom.toOwnCoords = function (nd,p) {
 return geom.toLocalCoords(nd,p,true);
}

geom.toParentCoords = function (nd,p) {
 return geom.toLocalCoords(nd,p);
}
  
// ip in nd's own coordinates
geom.toOwnCoords = function (nd,ip) {
  var p = geom.toLocalCoords(nd,ip);
  var xf = nd.__get("transform");
  if (xf) {
    p = xf.applyInverse(p);
  }
  return p;
}


 geom.translateX = function (nd,x) {
  var xf = nd.transform;
  if (xf) {
    xf.translation.x =x;
    return;
  }
  var xf = geom.mkTranslation(x,0);
  nd.set("transform",xf);
}


 geom.translateY = function (nd,y) {
  var xf = nd.transform;
  if (xf) {
    xf.translation.y =y;
    return;
  }
  xf = geom.mkTranslation(0,y);
  nd.set("transform",xf);
}
  
geom.setScale = function (nd,s) {
  var xf = nd.transform;
  if (xf) {
    xf.scale = s;
    return;
  }
  xf = geom.mkScaling(s);
  nd.set("transform",xf);
}



geom.rotate = function (nd,r) {
  var xf = nd.transform;
  if (xf) {
    xf.rotation = r;
    return xf;
  }
  xf = geom.mkRotation(r);
  nd.set("transform",xf);
}

    
    
geom.Point.setTo = function (src) {
  this.x = src.x;
  this.y = src.y;
}

geom.Point.setXY = function (x,y) {
  if (y === undefined) { // assume the one arg is a point
    this.x = x.x;
    this.y = x.y;
  } else { 
    this.x = x;
    this.y = y;
  }
}



geom.set("Rectangle",pj.Object.mk()).__namedType();

// takes corner,extent or {corner:c,extent:e,style:s} style being optional, or no args
// Rectangles without styles are often used for purely computational purpose - never drawn.
geom.Rectangle.mk = function (a0,a1) {
  var rs = Object.create(geom.Rectangle);
  var c,e,style;
  if (!a0) return rs;
  if (a1) {
    c = a0;
    e = a1;
  } else {
    if (a0.style) {
      style = pj.__draw.Style.mk();
      rs.set("style",style);
      pj.extend(style,a0.style);
    }
    var c = a0.corner;
    var e = a0.extent;
  }
  rs.__setPoint("corner",c);
  rs.__setPoint("extent",e);
  return rs;
}
  
geom.Rectangle.toString = function () {
  var corner = this.corner;
  var extent = this.extent;
  return '[['+corner.x+','+corner.y+'],['+extent.x+','+extent.y+']]';
}

geom.Rectangle.hasNaN = function () {
  var crn = this.corner;
  var xt = this.extent;
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


geom.Rectangle.set("corner",geom.Point.mk());
geom.Rectangle.set("extent",geom.Point.mk(1,1));

geom.Rectangle.corners = function () {
  var rs = [];
  var c = this.corner;
  var cx = c.x,cy = c.y;
  var xt = this.extent;
  var xtx = xt.x;
  var xty = xt.y;
  rs.push(c);
  rs.push(geom.Point.mk(cx,cy+xty));
  rs.push(geom.Point.mk(cx+xtx,cy+xty));
  rs.push(geom.Point.mk(cx+xtx,cy));
  return rs;
}

geom.Rectangle.expandBy = function (x,y) {
  var xt = this.extent;
  var c = this.corner;
  var nex = xt.x + x;
  var ncx = c.x - 0.5*x;
  var ney =  xt.y + y;
  var ncy =  c.y -0.5*y;
  return geom.Rectangle.mk(geom.Point.mk(ncx,ncy),geom.Point.mk(nex,ney));
}

  
// expand the extent of this to at least x in x and y in y

geom.Rectangle.expandTo = function (x,y) {
  var xt = this.extent;
  var xx = (xt.x < x)?(x-xt.x):0;
  var yx = (xt.y < y)?(y-xt.y):0;
  if ((xx === 0) && (yx === 0)) return  this;
  return this.expandBy(xx,yx);
}
  

// the bounding rectangle of an array of points

geom.boundingRectangle = function (pnts) {
  var ln = pnts.length;
  if (ln===0) return undefined;
  var p0 = pnts[0];
  var minx = p0.x;
  var maxx = minx;
  var miny = p0.y;
  var maxy = miny;
  for (var i=1;i<ln;i++) {
    var p = pnts[i];
    var px = p.x,py = p.y;
    maxx = Math.max(maxx,px);
    minx = Math.min(minx,px);
    maxy = Math.max(maxy,py);
    miny = Math.min(miny,py);
  }
  return geom.Rectangle.mk({corner:geom.Point.mk(minx,miny),extent:geom.Point.mk(maxx-minx,maxy-miny)});
}

// this ignores any transforms the rectangles might have 
geom.Rectangle.extendBy = function (xby) {
  var corners = this.corners().concat(xby.corners());
  return geom.boundingRectangle(corners);
}

geom.boundsForRectangles = function (rectangles) {
  var ln = rectangles.length;
  if (ln === 0) {
    return undefined;
  }
  var allCorners = [];
  rectangles.forEach(function (rectangle) {
    var corners = rectangle.corners();
    corners.forEach(function (corner) {
      allCorners.push(corner);
    });
  });
  return geom.boundingRectangle(allCorners);
}
    
  
geom.Rectangle.center = function () {
  var xt = this.extent;
  var c = this.corner;
  return geom.Point.mk(c.x + 0.5*xt.x,c.y + 0.5*xt.y);
}


geom.Rectangle.width = function () {
  return this.extent.x
}


geom.Rectangle.height = function () {
  return this.extent.y
}

geom.Rectangle.scaleCentered = function (sc) { // while maintaining the same center
  var wd = this.width();
  var ht = this.height();
  var cnt = this.center();
  var swd =  sc * wd;
  var sht =  sc * ht;
  var crn = cnt.plus(geom.Point.mk(-0.5 * swd,-0.5 * sht));
  var xt = geom.Point.mk(swd,sht);
  return geom.Rectangle.mk({corner:crn,extent:xt});
}

geom.Rectangle.plus = function (p) { // __translate
  var rs = geom.Rectangle.mk({corner:this.corner.plus(p),extent:this.extent});
  return rs;
}

geom.Rectangle.contains = function (p) {
  var c = this.corner;
  var px = p.x;
  var py,ex;
  if (px < c.x) return false;
  py = p.y;
  if (py < c.y) return false;
  ex = this.extent;
  if (px > c.x + ex.x) return false;
  if (py > c.y + ex.y) return false;
  return true;
}

  
geom.Rectangle.distance2 = function (p,msf) {
  if (!this.contains1(p)) return undefined;
  var c = this.corner;
  var xt = this.extent;
  var ux = c.x + xt.x;
  var uy = c.y + xt.y;
  var d = Math.min(p.x - c.x,ux - p.x,p.y - c.y,uy - p.y);
  if (d < msf) return d;
  return undefined;
}

// for rotation, all four corners need consideration
geom.Rectangle.applyTransform = function (tr) {
  var rt = tr.rotation;
  var crn,xt,sc,rcrn,rxt,corners,xcorners;
   if (rt === 0) {
    crn = this.corner;
    xt = this.extent;
    sc = tr.scale;
    rcrn = crn.applyTransform(tr);
    rxt = xt.times(sc);
    return geom.Rectangle.mk({corner:rcrn,extent:rxt});
  } else {
    corners = this.corners();
    xcorners = corners.map(function (c) {return c.applyTransform(tr)});
    return geom.boundingRectangle(xcorners);
  }
  // the transform which fitst the rectangle this evenly into the rectangle dst
}
  
geom.Rectangle.upperLeft = function () {
  return this.corner;
}

geom.Rectangle.lowerLeft = function () {
  var corner = this.corner;
  var  x =  corner.x;
  var y = corner.y + this.extent.y;
  return geom.Point.mk(x,y);
}



geom.Rectangle.upperRight = function () {
  var corner = this.corner;
  var  x =  corner.x + this.extent.x;
  var y = corner.y;
  return geom.Point.mk(x,y);
}


geom.Rectangle.lowerRight = function () {
  var corner = this.corner;
  var  x =  corner.x + this.extent.x;
  var y = corner.y + this.extent.y;
  return geom.Point.mk(x,y);
}
    
//  does not work with rotations
geom.Transform.times = function (tr) {
  var sc0 = this.scale;
  var sc0N,sc0x,sc0y,sc1N,sc1x,sc1y,tr0,tr1,sc,scx,scy,sc,trX,trY,rtr,rs;
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
    sc = geom.Point.mk(scx,scy);
  } 
  trX = sc1x * tr0.x + tr1.x;
  trY = sc1y * tr0.y + tr1.y;
  rtr = geom.Point.mk(trX,trY);
  rs = geom.Transform.mk({scale:sc,translation:rtr});
  return rs;
}
    
    
    
geom.Rectangle.transformTo = function (dst) {
  var crn = this.corner;
  var dcrn = dst.corner;
  var cnt = this.center();
  var dcnt = dst.center();
  var wd = this.width();
  var ht = this.height();
  var dwd = dst.width();
  var dht = dst.height();
  var wdr,htr,r,x,y,rs;
  if ((wd == 0)||(ht==0)) {
    return geom.Transform.mk({translation:geom.Point.mk(0,0),scale:1});
  }
  wdr = dwd/wd;
  htr = dht/ht;
  r = Math.min(wdr,htr);
  x = dcnt.x - (cnt.x)*r;
  y = dcnt.y - (cnt.y)*r;
  rs = geom.Transform.mk({translation:geom.Point.mk(x,y),scale:r});
  return rs;
}
  
// rectangle is  given relative  to node's coords
geom.Rectangle.toGlobalCoords = function (node) {
  var corner = this.corner;
  var extent = this.extent;
  var outerCorner = corner.plus(this.extent);
  var globalCorner = geom.toGlobalCoords(node,corner);
  var globalOuter = geom.toGlobalCoords(node,outerCorner);
  return geom.Rectangle.mk(globalCorner,globalOuter.difference(globalCorner));
}

// rectangle is given relative to global coords - returns relative to ownCoords
geom.Rectangle.toOwnCoords = function (node) {
  var corner = this.corner;
  var extent = this.extent;
  var outerCorner = corner.plus(this.extent);
  var ownCorner = geom.toOwnCoords(node,corner);
  var ownOuter = geom.toOwnCoords(node,outerCorner);
  return geom.Rectangle.mk(ownCorner,ownOuter.difference(ownCorner));
}

  
geom.mkSquare = function (center,sz) {
  var x = center.x;
  var y = center.y;
  var hsz = sz/2;
  var lx = x-hsz;
  var ly = y-hsz;
  return geom.Rectangle.mk([lx,ly],[sz,sz]);
}

pj.Object.__countShapes = function () {
  var cnt = 1;
  this.shapeTreeIterate(function (c) {
    cnt = cnt + c.__countShapes();
  });
  return cnt;
}


pj.Array.__countShapes = pj.Object.__countShapes;

pj.Object.__displaceBy = function (p) {
  var xf = s.xform;
  if (xf) {
    tr.setXY(xf.translation.plus(p));
  } else {
    geom.translate(s,p);
  }
}

geom.flipY = function (pnts,bias) {
  var rs = pj.Array.mk();
  pnts.forEach(function (p) {
    var fp = geom.Point.mk(p.x,bias -p.y);
    rs.push(fp);
  });
  return rs;
}

// coverage is data space, extent is image space.
// this maps the former to the later, with a y flip
// used for graphing
geom.transformForGraph = function (coverage,extent) {
  var cvxt = coverage.extent;
  var xtxt = extent.extent;
  var cvc = coverage.corner;
  var xtc = extent.corner;
  var scx = (xtxt.x)/(cvxt.x);
  var scy = -(xtxt.y)/(cvxt.y);
  var tx = xtc.x - scx * cvc.x;
  var ty = (xtc.y + xtxt.y) - scy * cvc.y;
  var tr = geom.Point.mk(tx,ty);
  var sc = geom.Point.mk(scx,scy);
  var rs = geom.Transform.mk({scale:sc,translation:tr});
  return rs;
}

geom.degreesToRadians =  function (n) { return Math.PI * (n/180);}

geom.radiansToDegrees =  function (n) { return 180 * (n/Math.PI);}

geom.Rectangle.randomPoint = function () {
  var c = this.corner;
  var ex = this.extent;
  var x = c.x + (ex.x)*Math.random();
  var y = c.y +(ex.y)*Math.random();
  return geom.Point.mk(x,y);
}
  