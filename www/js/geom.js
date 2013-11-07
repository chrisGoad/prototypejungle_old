


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.set("geom",__pj__.om.DNode.mk());
  geom.__externalReferences__ = [];
  
  geom.installType("Point");
  
  geom.set("Shape",om.DNode.mk()).namedType();
  
  geom.Shape.mk = function () {
    
    return geom.Shape.instantiate();
  }
  
  geom.shapeOrLNodeChild = function (pr,k) {
    var ch = pr[k];
    if (geom.Shape.isPrototypeOf(ch)||om.LNode.isPrototypeOf(ch)) {
      var cpr = ch.get("__parent__");
      if (cpr !==pr) return;
      return ch;
    }
  }
  
  // like iterTreeItems, but only for shape and LNode descendants.

  om.DNode.shapeTreeIterate = function (fn,sortBySetOrder) {
    var ownprops = Object.getOwnPropertyNames(this);
    var thisHere = this;
    var shapeProps = ownprops.filter(function (k) {
      return !!geom.shapeOrLNodeChild(thisHere,k);
    });

    function compare(j,k) {
      var ij = thisHere[j].__setIndex__;
      var ik = thisHere[k].__setIndex__;
      return ij>ik;
    }
    if (sortBySetOrder) {
      shapeProps.sort(compare);
    }
    shapeProps.forEach(function (k) {
      fn(thisHere[k]);
    });
  }
  
  om.LNode.shapeTreeIterate = function (fn) {
    var thisHere = this;
    this.forEach(function (k) {
      if (!k) return;
      var ch = geom.shapeOrLNodeChild(thisHere,k.__name__);
      if (ch) fn(ch);
    });
  }     
  
    
    
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
  
  // input might already be a Point
  geom.toPoint = function (a) {
    if (Array.isArray(a)) {
      return geom.Point.mk(a[0],a[1]);
    } else {
      return a;
    }
  }
  
  
  om.DNode.setPoint = function (p,v) {
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
  
  geom.Point.length = function () {
    var x = this.x;
    var y = this.y;
    return Math.sqrt(x*x + y*y);
  }
  
  
  
  
  geom.Point.direction = function () {
    return geom.normalizeAngle(Math.atan2(this.y,this.x));
  }
  //geom.Point.properties = ["x","y"];
  
  geom.Point.difference = function (q) {
    var p = this;
    return geom.Point.mk(p.x - q.x,p.y - q.y);
  }
  
    geom.installType("Interval");



  geom.Interval.mk = function (lb,ub) {
    var rs = Object.create(geom.Interval);
    rs.lb = lb;
    rs.ub = ub;
    return rs;
  }
  
  // for compatability with old code
  
  geom.mkInterval = geom.Interval.mk;
  
  
  geom.Point.setCoords = function (x,y) {
    this.set("x",x);
    this.set("y",y);
  }

  //{geom.Point.distance}//for doc
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
    return geom.Point.mk(-this.y,-this.x);
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
  
  geom.installType("Transform");

  // every transform will have all three of scale, rotation,translation defined.
  geom.Transform.mk = function (o) {
    var rs = Object.create(geom.Transform);
    rs.scale = 1;
    rs.rotation = 0;
    rs.setProperties(o,["scale","rotation"]);
    rs.setPoint("translation",o?o.translation:undefined);
    return rs;
    
  }
  
  om.DNode.addTransform = function () {
    var tr = this.transform;
    if (!tr) {
      tr = geom.Transform.mk();
      this.set("transform",tr);
    }
    return tr;
  }
  
  geom.normalizeAngle = function (a) { // normalize to between 0 and 2*Pi
    var m = a%(Math.PI*2);
    if (m < 0) m = m + Math.PI*2;
    return m;
  }
    
  // see draw: properties translation (a point), subject and optionally scale,rotation (later matrix xform)
  // if the subject is another translation
  
  
  
  geom.rotate = function (r) {
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
  
  geom.newPoint = function (x,y) {
    return geom.pointify(1,x,y);
  }
  
  // x might be a point; this is in the object's own coord system
  geom.mkTranslation = function (x,y) {
    var p = geom.newPoint(x,y);
    var trns = geom.Transform.mk({translation:p});
    return trns;
  }
  
  geom.scaling = function (s) {
    var trns = geom.Transform.mk();
    trns.scale = s;
    return trns;
  }
  
  om.DNode.moveto = function (x,y) { // only for points for now; inputs are in global coordinates
    var p = geom.toPoint(x,y);
    var pr = this.__parent__;
    var lp = pr.toLocalCoords(p);//desired position of this relative to its parent
    // we want to preserve the existing scaling
    var xf = this.transform;
    var o = {};
    if (xf) {
      xf.scale = xf.scale;
      xf.rotation = xf.rotation;
      xf.translation.setTo(lp);
    } else {
      o.translation = lp;
      var trns = geom.Transform.mk(o);
      this.set("transform", trns);
    }
  }
  
  om.LNode.moveto = om.DNode.moveto;
  
  geom.Transform.inverse =  function () {
    var s = this.scale;
    if (!s) s = 1;
    var ns = 1/s;
    var tr = this.translation;
    if (tr) {
      var nx = -(tr.x) * ns;
      var ny = -(tr.y) * ns;
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
    var fx = sc*rx + tx;
    var fy = sc*ry + ty;
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


  /*
  
  geom.Point.applyTransform = function (tr) {
    // translation and then scaling is done
    var trns = tr.translation;
    var sc = tr.scale;
    if (sc === undefined) {
      sc = 1;
    }
    var px = this.x;
    var py = this.y;
   
    if (trns) {
      px = px + trns.x;
      py = py + trns.y;
    }
    px = px * sc;
    py = py * sc;
    return geom.Point.mk(px,py);
  }
  */
  // ip is in this's coords. Return ip's global coords
  // globalObject, if ommitted,is effectively __pj__
  om.DNode.toGlobalCoords = function (ip,globalObject) {
    var p = ip?ip:geom.Point.mk(0,0);
    if (this===globalObject) {
      return p;
    }
    var xf =this.getTransform();
    if (xf) {
      p = p.applyTransform(xf);
    }
    var pr = this.get("__parent__");
    if (!pr) {
      return p;
    }
    return pr.toGlobalCoords(p,globalObject);
  }
  
  om.LNode.toGlobalCoords = om.DNode.toGlobalCoords;
  
  // the cummulative scaling applied in transformations down to here; note that the tranformation of the top level is included
  // this is used for measuring text in absolute terms
   om.DNode.scalingDownHere = function (globalObject,sofar) {
    var rt = globalObject?globalObject:om.root;
    var s = (sofar===undefined)?1:sofar;
    var xf =this.getTransform();
    if (xf) {
      s = xf.scale * s;
    }
    if (this===globalObject) {
      return s;
    }
    var pr = this.get("__parent__");
    if (!pr) {
      return s;
    }
    return pr.scalingDownHere(rt,s);
  }
  
  om.LNode.scalingDownHere = om.DNode.scalingDownHere;
  
  
  // ip is in global coords. Return ip's coords relative to this
  om.DNode.toLocalCoords = function (ip) {
    var p = ip?ip:geom.Point.mk(0,0);
    var pr = this.get("__parent__");
    if (pr) {
      p = pr.toLocalCoords(p); // p in the coords of the parent
    }
    var xf =this.getTransform();
    if (xf) {
      p = xf.applyInverse(p);
    }
    return p;
  }
  
  om.LNode.toLocalCoords = om.DNode.toLocalCoords;
  
 
  // supports multiple input formats eg x = Point or array
  om.DNode.translate = function (ix,iy) {
    if (typeof iy=="number") {
      var x = ix;
      var y = iy;
    } else {
      x = ix.x;
      y = ix.y;
    }
    var xf = this.transform;
    if (xf) {
      xf.translation.setXY(x,y);
      return;
    }
    var xf = geom.mkTranslation(x,y);
    this.set("transform",xf);
  }
  
   om.DNode.setScale = function (s) {
    var xf = this.transform;
    if (xf) {
      xf.scale = s;
      return;
    }
    var xf = geom.scaling(s);
    this.set("transform",xf);
  }
  
  om.DNode.rotate = function (r) {
    var xf = this.transform;
    if (xf) {
      xf.rotation = r;
      return xf;
    }
    var xf = geom.rotate(r);
    this.set("transform",xf);
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
  
  geom.set("Rectangle",geom.Shape.mk()).namedType();
 //   geom.set("Rectangle",om.DNode.mk().namedType());



  // takes corner,extent or {corner:c,extent:e,style:s} style being optional, or no args
  geom.Rectangle.mk = function (a0,a1) {
    var rs = geom.Rectangle.instantiate();
    if (!a0) return rs;
    if (a1) {
      var c = a0;
      var e = a1;
    } else {
      if (a0.style) {
        rs.style.setProperties(a0.style);
      }
      var c = a0.corner;
      var e = a0.extent;
    }
    rs.setPoint("corner",c);
    rs.setPoint("extent",e);
    return rs;
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
  
  geom.Rectangle.plus = function (p) { // translate
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

  geom.Rectangle.transformTo = function (dst) {
    var crn = this.corner;
    var dcrn = dst.corner;
    var cnt = this.center();
    var dcnt = dst.center();
    var wd = this.width();
    var ht = this.height();
    var dwd = dst.width();
    var dht = dst.height();
    var wdr = dwd/wd;
    var htr = dht/ht;
    var r = Math.min(wdr,htr);
    var x = dcnt.x - (cnt.x)*r;
    var y = dcnt.y - (cnt.y)*r;
    var rs = geom.Transform.mk({translation:geom.Point.mk(x,y),scale:r});
    return rs;
  }
  
  om.DNode.countShapes = function () {
    var cnt = 1;
    this.shapeTreeIterate(function (c) {
      cnt = cnt + c.countShapes();
    });
    return cnt;
  }
  
  
  om.LNode.countShapes = om.DNode.countShapes;

  
  om.DNode.countNodes = function () {
    var cnt = 1;
    this.iterTreeItems(function (c) {
      cnt = cnt + c.countNodes();
    },true);
    return cnt;
  }
  
  om.LNode.countNodes = om.DNode.countNodes;

  
  // bounds in the parent's coordinate system. IgnoreXform applies only at THIS level
  om.DNode.deepBounds = function (ignoreXform) {
    if ((this.style) && (this.style.hidden)) return undefined;
    var m = om.hasMethod(this,"bounds");
    var b = this.__bounds__;
    if (m || b) {
      if (m) {
        var bnds = m.call(this);
      } else if (b) {
        if (b==="none") {
          return undefined;
        } else {
          bnds = b;
        }
      }
    } else {
      this.shapeTreeIterate(function (c) {
        var cbnds = c.deepBounds();
        
        if (cbnds) {
          if (bnds)  { 
            bnds = bnds.extendBy(cbnds);
            var dbb  = bnds;//for debug
          } else {
            bnds = cbnds;
            dbb = bnds;
          }
        }
      });
    }
    if (!bnds) return bnds;
    if (ignoreXform) return bnds;
    var xf = this.transform;
    if (xf) {
      return bnds.applyTransform(xf);
    }
    return bnds;
  };
  
  om.LNode.deepBounds = geom.Shape.deepBounds;
  
  geom.Shape.displaceBy = function (p) {
    var xf = s.xform;
    if (xf) {
      tr.setXY(xf.translation.plus(p));
    } else {
      s.translate(p);
    }
  }
  
  // for initial distribution of things, for later adjustment
  om.LNode.arrangeOnGrid = function (spacing) {
    var xxt=0,yxt = 0;
    // first compute max extents in x and y
    this.forEach(function (s) {
      if (geom.Shape.isPrototypeOf(s)) {
        var b = s.deepBounds();
        xxt = Math.max(xxt,b.extent.x);
        yxt = Math.max(yxt,b.extent.y);
      }
    });
    // now place on grid based in xxt yxt
    var ln = this.length;
    var sln = Math.ceil(Math.sqrt(ln));
    var i=0,j=0,cidx = 0;
    this.forEach(function (s) {
      var dst = geom.Point.mk(i*xxt,j*yxt);
      s.translate(dst);
      j++;
      if (j>= sln) { //next row
        j = 0;
        i++;
      }
    });
  }
  // more circle arrangement code, for bubble charts
  
   geom.CCircle = {}; // circle for computation only; has center and radius, need not be DNnode
  
  geom.CCircle.mk = function (r,c) {
    var rs = Object.create(geom.CCircle);
    rs.radius = r;
    rs.center = c?c:geom.Point.mk();
    return rs;
  }
  geom.CircleSet = {}; // an array of circles, and a subject (also a circle), and a contact (a circle to which the subject is tangent)
  // Operations on a circle set move the subject around
  geom.CircleSet.mk = function (sb,circles,allCircles) {// sb is an index
    var rs = Object.create(geom.CircleSet);
    rs.subject = sb; // the circle we are trying to place
    rs.circles = circles; // the circles arranged so far
    rs.allCircles = allCircles;
    rs.dropPoints = [geom.Point.mk()]; //  where to place circles before they drop in 
    return rs;
  }
  
  geom.CircleSet.nearest= function () { // find the nearest circle to the subject, excluding the contact
    var d = Infinity;
    var ln = this.circles.length;
    var rs;
    var subject = this.allCircles[this.subject];
    var p = subject.center;
    for (var i=0;i<ln;i++) {
      var c = this.circles[i];
      if (i === this.contact) continue;
      var cd = p.distance(c.center) - c.radius;
      if (cd < d) {
        rs = i;
        d = cd;
      }
    }
    return rs;
  }
  // bring into tangency with nearest circle, while maintaining the contact, if any.
  // sub problem: find intersection of two circles
  
    /*let p be a solution.  Consider the triangle T with long side joining the centers of c1 and c2,
     and the two right triangles T1 and T2 that join to form T.
     let a be the radius of c1, b of c2, c the distance between the centers of c1  , c2
     x and y the lenghts the bases of T1 T2, and z the height of T,T1,T2.
     Then we have:
     
     x*x + z*z = a*a
     y*y + z*z = b*b
     x + y = c
     
    so
    y = c-x
    z*z = a*a - x*x;
    (c-x)*(c-x) + z*z = b*b
    (c-x)*(c-x) + (a*a - x*x) = b*b
    c*c - 2*c*x + x*x + a*a - x*x = b*b
    c*c - 2*c*x + a*a = b*b
    2*c*x = c*c + a*a - b*b;
    x = (c*c + a*a - b*b)/2*c
    I had a hard time believing this was linear.*/
  
  geom.CCircle.intersects = function (circle) {
    var d = this.center.distance(circle.center);
    return d < (this.radius+circle.radius);
  }
  
  geom.CCircle.intersection = function (circle2) {
    var circle1 = this;
    var a = circle1.radius;
    var b = circle2.radius;
    var c1 = circle1.center;
    var c2 = circle2.center;
    var c = c1.distance(c2);
    if (c>a+b) return undefined;
   
    var cv = c2.difference(c1).times(1/c);
    var x = (c*c + a*a - b*b)/(2*c);
    var z = Math.sqrt(a*a - x*x);
    var xv = cv.times(x);
    var p1 = c1.plus(xv);
    var zv = cv.normal().times(z);
    var rs1 = p1.plus(zv);
    var rs2 = p1.difference(zv);
    return [rs1,rs2];
  }
  
    
        
     
  geom.CircleSet.moveToNearest = function  () {
    // Edge case: if there is only one circle placed so far, and this is the contact, already done
    var isContact = typeof (this.contact) === "number";
    if ((this.circles.length === 1) && isContact) return;

    var n = this.nearest();
    var nearest = this.circles[n];
    var subject = this.allCircles[this.subject];
    var sc = subject.center;
    var nc = nearest.center;
    if (isContact) { // a trig problem; find the point to put subject at which will contact both the existing contact, and cn
      //return;
      var contact = this.circles[this.contact];
      var c1fi = geom.CCircle.mk(nearest.radius + subject.radius,nc);
      var c2fi = geom.CCircle.mk(contact.radius + subject.radius,contact.center);
      var ints = c1fi.intersection(c2fi);
      var d0 = sc.distance(ints[0]);
      var d1 = sc.distance(ints[1]);
      var cint = (d0<d1)?ints[0]:ints[1]; // choose the closer of the intersections
      subject.center = cint;
      return;
    }
    var v = sc.difference(nc).normalize();
    var rsc = nc.plus(v.times(subject.radius + nearest.radius));
    subject.center = rsc;
    this.contact = n;
  }
  
  geom.CircleSet.moveSubjectTo = function (dst) {
    // move the subject way out along vc
    var sb = this.allCircles[this.subject];
    sb.center = dst;
  }
    
  // express an angle between  -pi and pi
  geom.standardizeAngle = function (d) {
    if (d < 0) {
     while (d < -Math.PI) {
        d = d + 2 * Math.PI;
     }
    } else {
      while (d > Math.PI) {
        d = d - 2*Math.PI;
      }
    }
    return d;
  }
 
  
  geom.CircleSet.dropRandom = function () {
     var vc = geom.Point.mk(-0.5 + Math.random(),-0.5 + Math.random()).normalize();
     return vc.times(1000);

  }
  
  
  geom.CircleSet.dropClockwise = function () {
    var ln  = this.circles.length;
    if (ln == 1) {
      var vc = geom.Point.mk(-1,0);
    } else {
      var lst = this.circles[this.circles.length-1];
      var c = lst.center;
      var ang = Math.atan2(c.y,c.x) + Math.PI * 0.25;
       var vc = geom.Point.mk(Math.cos(ang),Math.sin(ang)).normalize();
    }
     return vc.times(1000);

  }
   // bubble arrangement
  // shapes contain circles at relative path pth
   // in each step
  // a new circle becomes the subject, is moved way out yonder, then back into contact 
  geom.arrange0 = function (shapes,path,drop) {
    function show() { // for debugging
       circleSet.install();
      __pj__.draw.fit();
      __pj__.draw.refresh();
      debugger;
    }
    var sofar = 1;
    debugger;
    var allCircles = geom.shapesToCCircles(shapes,path);
    var ln = shapes.length;
    while (sofar <= ln) {
      
      var circles = allCircles.slice(0,sofar);
      var circleSet = geom.CircleSet.mk(sofar,circles,allCircles);
      var dr = drop.call(circleSet);
      circleSet.moveSubjectTo(dr);
      show();
      circleSet.moveToNearest();// bring into contact with one circle
      show();
      circleSet.moveToNearest(); //bring into contact with two
      sofar ++;
      show();
    }// and another
    circleSet.install();

  }
    
  /*
   
  p.geom.arrange0( p.om.root.bubbles.shapes,['circle'],p.geom.CircleSet.dropRandom);
    p.geom.arrange0( p.om.root.bubbles.shapes,['circle'],p.geom.CircleSet.dropClockwise);

  */
    
})(prototypeJungle);

