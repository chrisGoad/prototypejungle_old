 
(function (pj) {
  var om = pj.om;
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  var geom = pj.set("geom",pj.om.DNode.mk());
  geom.__builtIn = 1;
  geom.set("Point",om.DNode.mk()).namedType;
 
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
  
  // input might already be a Point
  geom.toPoint = function (a) {
    if (Array.isArray(a)) {
      return geom.Point.mk(a[0],a[1]);
    } else {
      return a;
    }
  }
  
  // set the property p of this to v
  
  om.DNode.__setPoint = function (p,v) {
    if (v) {
      var pnt = geom.toPoint(v);
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
  
  geom.Point.copy = function () {
    return geom.Point.mk(this.x,this.y);
  }
  
  
  
  
  geom.Point.direction = function () {
    return geom.normalizeAngle(Math.atan2(this.y,this.x));
  }
  
  geom.Point.difference = function (q) {
    var p = this;
    return geom.Point.mk(p.x - q.x,p.y - q.y);
  }
  
  geom.set("Interval",om.DNode.mk()).namedType();


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
    if (p) {
      var vx = this.x - p.x;
      var vy = this.y - p.y;
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
  
  geom.set("Transform",om.DNode.mk()).namedType();

  // every transform will have all three of scale, rotation,translation defined.
  // scale might be scale or a point. In the latter case, the scaling in  x and y are the scale's coordinates.
  geom.Transform.mk = function (o) {
    var rs = Object.create(geom.Transform);
    rs.scale = 1;
    rs.rotation = 0;
    if (!o) {
      rs.set("translation",geom.Point.mk());
      return rs;
    }
    var ort = o.rotation;
    if (typeof ort === "number") {
      rs.rotation = ort;
    } else {
      rs.rotation = 0;
    }
    var s = o.scale;
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
// x might be an array, or a point, or x and y might be numbers
  geom.pointify = function (mkNew,x,y) {
    if (x === undefined) {
      var p = geom.Point.mk(0,0);
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
  
  geom.newPoint = function (x,y) {
    return geom.pointify(1,x,y);
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
  
  // move to a given location in nd's own coordinates
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
    if (!s) s = 1;
    if (typeof s === "number"){
      var ns = 1/s;
      var nsx = ns;
      var nsy = nsy;
    } else {
      var nsx = 1/(s.x);
      var nsy = 1/(s.y);
      ns = geom.Point.mk(nsx,nsy);
    }
    var tr = this.translation;
    if (tr) {
      var nx = -(tr.x) * nsx;
      var ny = -(tr.y) * nsy;
      return geom.Transform.mk({scale:ns,translation:geom.Point.mk(nx,ny)});
    } else {
      return geom.Transform.mk({scale:ns});
    }
    }
  
   
   geom.Point.applyTransform = function (tr) {
    // order: rotation,scaling  translation
    var scx,scy;
    var trns = tr.translation;
    var tx = trns.x,ty = trns.y;
    var sc = tr.scale;
    if (sc === undefined) {
       scx = scy = 1;
    } else if (typeof sc === "number") {
      scx = scy = sc;
    } else {
      scx = sc.x;
      scy = sc.y;
    }
    var rt = tr.rotation;
    var x = this.x,y = this.y;
    if (rt === 0) {
      var rx = x,ry = y;
    } else {
      var s = Math.sin(rt);
      var c = Math.cos(rt);
      var rx = c*x - s*y;
      var ry = s*x + c*y;
    }
    var fx = scx*rx + tx;
    var fy = scy*ry + ty;
    return geom.Point.mk(fx,fy);
  }

  
  geom.Transform.applyInverse = function (p) {
    // reverse order: translation, scaling, rotation
    var trns = this.translation;
    var sc = this.scale;
    var rt = this.rotation;
    var px = p.x - trns.x;
    var py = p.y - trns.y;
    var isc = 1/sc;
    px = px * isc;
    py = py * isc;
    if (rt === 0) {
      var fx = px,fy = py;
    } else {
      var s = Math.sin(-rt);
      var c = Math.cos(-rt);
      var fx = c*px - s*py;
      var fy = s*px + c*py;
    }
   
    return geom.Point.mk(fx,fy);
  }

  
  geom.Transform.applyToPoints = function (pnts) {
    var rs = om.LNode.mk();
    var thisHere = this;
    pnts.forEach(function (p) {
      rs.push(p.applyTransform(thisHere));
    });
    return rs;
  }
      

  // ip is in this's coords. Return ip's coords relative to the root of the tree.
  // the transform of the root itself is not included (this last takes care of the zoom and pan)
  // globalObject, if ommitted,is effectively pj
  geom.toGlobalCoords = function (nd,ip) {
    var p = ip?ip:geom.Point.mk(0,0);
    var pr = nd.__get("__parent");
    var atRoot = !(pj.svg.Element.isPrototypeOf(pr) || om.LNode.isPrototypeOf(pr));
    if (atRoot) return p;
    var xf =nd.__get("transform");
    if (xf) {
      p = p.applyTransform(xf);
    }
    return geom.toGlobalCoords(pr,p);
  }
  
  
  geom.scalingDownHere = function (nd,sofar) {
    var s = (sofar===undefined)?1:sofar;
    var pr = nd.__get("__parent");
    var atRoot = !(pj.svg.Element.isPrototypeOf(pr) || om.LNode.isPrototypeOf(pr));
    if (atRoot) return s;
    var xf =nd.__get("transform");
    if (xf) {
      s = xf.scale * s;
    }
    return geom.scalingDownHere(pr,s);
  }
  
   // ip is in global coords. Return ip's coords relative to this
  geom.toLocalCoords = function (nd,ip) {
    var p = ip?ip:geom.Point.mk(0,0);
    var pr = nd.__get("__parent");
    var atRoot = !(pj.svg.Element.isPrototypeOf(pr) || om.LNode.isPrototypeOf(pr));
    if (atRoot) return p;
    p = geom.toLocalCoords(pr,p); // p in the coords of the parent
    var xf = pr.__get("transform");
    if (xf) {
      p = xf.applyInverse(p);
    }
    return p;
  }

  om.DNode.getTranslation = function () {
    var xf = this.transform;
    if (xf) {
      return xf.translation;
    }
    return geom.Point.mk(0,0);
  }
  
  
  
  om.DNode.getScale = function () {
    var xf = this.transform;
    if (xf) {
      return xf.scale;
    }
    return 1;
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
    var xf = geom.mkTranslation(0,y);
    nd.set("transform",xf);
  }
  
  geom.setScale = function (nd,s) {
    var xf = nd.transform;
    if (xf) {
      xf.scale = s;
      return;
    }
    var xf = geom.mkScaling(s);
    nd.set("transform",xf);
  }
  
  
  
  geom.rotate = function (nd,r) {
    var xf = nd.transform;
    if (xf) {
      xf.rotation = r;
      return xf;
    }
    var xf = geom.mkRotation(r);
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
  
  

  geom.set("Rectangle",om.DNode.mk()).namedType();

  // takes corner,extent or {corner:c,extent:e,style:s} style being optional, or no args
  // Rectangles without styles are often used for purely computational purpose - never drawn.
  geom.Rectangle.mk = function (a0,a1) {
    var rs = Object.create(geom.Rectangle);//geom.Rectangle.instantiate();
    if (!a0) return rs;
    if (a1) {
      var c = a0;
      var e = a1;
    } else {
      if (a0.style) {
        var style = pj.__draw.Style.mk();
        rs.set("style",style);
        om.extend(style,a0.style);
      }
      var c = a0.corner;
      var e = a0.extent;
    }
    rs.__setPoint("corner",c);
    rs.__setPoint("extent",e);
    return rs;
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
    var xtx = xt.x,xty = xt.y;
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
  
  geom.Rectangle.contains1 = function (p) {
    var c = this.corner;
    var px = p.x;
    if (px < c.x) return false;
    var py = p.y;
    if (py < c.y) return false;
    var ex = this.extent;
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
     if (rt === 0) {
      var crn = this.corner;
      var xt = this.extent;
      var sc = tr.scale;
      var rcrn = crn.applyTransform(tr);
      var rxt = xt.times(sc);
      return geom.Rectangle.mk({corner:rcrn,extent:rxt});
    } else {
      var corners = this.corners();
      var xcorners = corners.map(function (c) {return c.applyTransform(tr)});
      return geom.boundingRectangle(xcorners);
    }
    // the transform which fitst the rectangle this evenly into the rectangle dst
  }
//  does not work with rotations
  geom.Transform.times = function (tr) {
    var sc0 = this.scale;
    if (typeof sc0 === "number") {
      var sc0N = 1;
      var sc0x = sc0;
      var sc0y = sc0;
    } else {
      sc0x = sc0.x;
      sc0y = sc0.y;
    }
    var sc1 = tr.scale;
    if (typeof sc1 === "number") {
      var sc1N = 1;
      var sc1x = sc1;
      var sc1y = sc1;
    } else {
      sc1x = sc0.x;
      sc1y = sc0.y;
    }
    var tr0 = this.translation;
    var tr1 = tr.translation;
    if (sc0N && sc1N) {
      var sc = sc0 * sc1;
    } else {
      var scx = sc0x*sc1x;
      var scy = sc0y*sc1y;
      var sc = geom.Point.mk(scx,scy);
    } 
    var trX = sc1x * tr0.x + tr1.x;
    var trY = sc1y * tr0.y + tr1.y;
    var tr = geom.Point.mk(trX,trY);
    var rs = geom.Transform.mk({scale:sc,translation:tr});
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
    if ((wd == 0)||(ht==0)) {
      return geom.Transform.mk({translation:geom.Point.mk(0,0),scale:1});
    }
    var wdr = dwd/wd;
    var htr = dht/ht;
    var r = Math.min(wdr,htr);
    var x = dcnt.x - (cnt.x)*r;
    var y = dcnt.y - (cnt.y)*r;
    var rs = geom.Transform.mk({translation:geom.Point.mk(x,y),scale:r});
    return rs;
  }
  
  geom.mkSquare = function (center,sz) {
    var x = center.x;
    var y = center.y;
    var hsz = sz/2;
    var lx = x-hsz;
    var ly = y-hsz;
    return geom.Rectangle.mk([lx,ly],[sz,sz]);
  }
  
  

  
  
  om.DNode.__countShapes = function () {
    var cnt = 1;
    this.shapeTreeIterate(function (c) {
      cnt = cnt + c.__countShapes();
    });
    return cnt;
  }
  
  
  om.LNode.__countShapes = om.DNode.__countShapes;

  om.DNode.__displaceBy = function (p) {
    var xf = s.xform;
    if (xf) {
      tr.setXY(xf.translation.plus(p));
    } else {
      geom.translate(s,p);
    }
  }
  
  geom.flipY = function (pnts,bias) {
    var rs = om.LNode.mk();
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
  
//end extract
})(prototypeJungle);

