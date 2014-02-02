


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.set("geom",__pj__.om.DNode.mk());
  geom.__externalReferences__ = [];
  geom.__coreModule__ = 1;
  //geom.installType("Point");
  geom.set("Point",om.DNode.mk()).namedType;
  
  /*geom.set("Shape",om.DNode.mk()).namedType();
  

  geom.Shape.mk = function () {
    
    return geom.Shape.instantiate();
  }

  om.DNode.isShape = function () {
    return geom.Shape.isPrototypeOf(this);
  }

  //om.LNode.isShape = function () {
  //  return this.__isShape__;
  //}
  
  geom.shapeOrLNodeChild = function (pr,k) {
    var ch = pr[k];
    var iss = false;
    if (geom.Shape.isPrototypeOf(ch)) {
      iss = true;
    } else if (om.LNode.isPrototypeOf(ch)) {
      iss = true;
    }
    if (iss) {
      var cpr = ch.get("__parent__");
      if (cpr !==pr) return;
      return ch;
    }
  }
  
  
  // like iterTreeItems, but only for shape and LNode descendants.
 // for hovered shapes that should appear on top, a shape can be designated __displayLast__
  
  om.DNode.shapeProperties = function () {
    if (geom.cachedShapeProperties) {
      var shpp = this.__shapeProperties__;
      if (shpp) {
        return shpp;
      }
    }
    var ownprops = Object.getOwnPropertyNames(this);
    var thisHere = this;
    var rs = ownprops.filter(function (k) {
      return !!geom.shapeOrLNodeChild(thisHere,k);
    });
    var thisHere = this;
    function compare(j,k) {
      var ij = thisHere[j].__setIndex__;
      var ik = thisHere[k].__setIndex__;
      if (0 && (ij === undefined || ik === undefined)) {
        debugger;
      }
      ij = ij===undefined?0:ij;
      ik = ik===undefined?0:ik;
       return ij>=ik?1:-1;
    }
    rs.sort(compare);
    //this.__shapeProperties__ = rs;
    return rs;
  }
  
  */
  om.nodeMethod("toDisplayLast", function (props) {
      var ln = this.length;
      for (var i=0;i<ln-1;i++) {
        var sh = this[i];
        if (sh.__displayLast__) {
          return sh;
        }
      }
   
  });
    
  
      
      
    
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
  
  geom.Transform.hasNaN = function () {
    if (isNaN(this.scale)) return true;
    if (isNaN(this.rotation)) return true;
    var tr = this.translation;
    if (tr) {
      return tr.hasNaN();
    }
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
    console.log("MOVETO");
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
    this.transformToSvg();

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
    var xf =this.get("transform");
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
   om.DNode.scalingDownHere = function (globalObject,notTop,sofar) {
    var rt = globalObject?globalObject:om.root;
    var atRoot = rt === this;
    var s = (sofar===undefined)?1:sofar;
    var xf =this.get("transform");
    if (xf && !(atRoot && notTop)) {
      s = xf.scale * s;
    }
    if (this===globalObject) {
      return s;
    }
    var pr = this.get("__parent__");
    if (!pr) {
      return s;
    }
    return pr.scalingDownHere(rt,notTop,s);
  }
  
  om.LNode.scalingDownHere = om.DNode.scalingDownHere;
  
  
  // ip is in global coords. Return ip's coords relative to this
  om.DNode.toLocalCoords = function (ip) {
    var p = ip?ip:geom.Point.mk(0,0);
    var pr = this.get("__parent__");
    if (pr) {
      p = pr.toLocalCoords(p); // p in the coords of the parent
    }
    var xf =this.get("transform");
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
  
   om.DNode.translateX = function (x) {
    var xf = this.transform;
    if (xf) {
      xf.translation.x =x;
      return;
    }
    var xf = geom.mkTranslation(x,0);
    this.set("transform",xf);
  }
  
  
   om.DNode.translateY = function (y) {
    var xf = this.transform;
    if (xf) {
      xf.translation.y =y;
      return;
    }
    var xf = geom.mkTranslation(0,y);
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
  
  

  geom.set("Rectangle",om.DNode.mk()).namedType();
 //   geom.set("Rectangle",om.DNode.mk().namedType());



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
        var style = __pj__.draw.Style.mk();
        rs.set("style",style);
        style.setProperties(a0.style);
      }
      var c = a0.corner;
      var e = a0.extent;
    }
    rs.setPoint("corner",c);
    rs.setPoint("extent",e);
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
    if ((this.style) && (this.hidden)) return undefined;
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
      if (bnds && bnds.hasNaN()) {
          debugger;
          return undefined;
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
      if (xf.hasNaN()) {
        debugger;
        return undefined;
      }
      return bnds.applyTransform(xf);
    }
    return bnds;
  };
  
  
  //  synonym
  om.DNode.computeBounds = function () {
    return this.deepBounds();
  }

  
  om.LNode.deepBounds = om.DNode.deepBounds;
  
  om.DNode.displaceBy = function (p) {
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
  
  
})(prototypeJungle);

