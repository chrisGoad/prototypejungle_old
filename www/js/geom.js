


(function (__pj__) {
  var om = __pj__.om;
  var geom = _=__pj__.set("geom",__pj__.om.DNode.mk());
  geom.__externalReferences__ = [];
  geom.installType("Point");
  
  
  geom.Point.mk = function (x,y) {
    var rs = Object.create(geom.Point);
    if (typeof x=="number") {
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
  
  //geom.Point.properties = ["x","y"];
  
  geom.Point.difference = function (q) {
    var p = this;
     if (!typeof qy == "number") return "__notyet__";
    return geom.Point.mk(p.x - q.x,p.y - q.y);
  }
  
    geom.installType("Interval");



  geom.mkInterval = function (lb,ub) {
    var rs = Object.create(geom.Interval);
    rs.lb = lb;
    rs.ub = ub;
    return rs;
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
  
  
  
  geom.installType("Transform");

  geom.Transform.mk = function (o) {
    var rs = Object.create(geom.Transform);
    rs.setProperties(o,["scale","rotation"]);
    if (!rs.scale) rs.scale = 1;
    rs.setPoint("translation",o.translation);
    return rs;
    
  }
  
  
 
  
  // see draw: properties translation (a point), subject and optionally scale,rotation (later matrix xform)
  // if the subject is another translation
  
  
  
  geom.rotate = function (r) {
    var trns =  Object.create(geom.Transform);
    trns.rotation = r;
    return trns;

}
  // x might be a point
  geom.translate = function (x,y) {
  if (x === undefined) {
    var p = geom.Point.mk(0,0);
  } else if (typeof(y)=="number") {
    var p = geom.Point.mk(x,y);
  } else {
    var p = geom.Point.mk(x.x,x.y);
  }
  var trns =  Object.create(geom.Transform);
  trns.set("translation",p);
  return trns;

}

om.DNode.moveto = function (x,y) { // only for points for now
  var trns = geom.translate(x,y);
  this.set("transform", trns);
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
geom.Transform.applyInverse = function (p) {
  // translation and then scaling is done, so in inverse, we scale first translate later
  var trns = this.translation;
  var sc = this.scale;
  var px = p.x;
  var py = p.y;
  var isc = 1/sc;
  px = px * isc;
  py = py * isc;
  if (trns) {
    px = px - trns.x;
    py = py - trns.y;
  }
  return geom.Point.mk(px,py);
}

geom.Point.applyTransform = function (tr) {
  // scaling and then translation is done
  var trns = tr.translation;
  var sc = tr.scale;
  var px = this.x;
  var py = this.y;
  px = px * sc;
  py = py * sc;
  if (trns) {
    px = px + trns.x;
    py = py + trns.y;
  }
  return geom.Point.mk(px,py);
}


om.DNode.translate = function (pnt) {
  var xf = geom.translate(pnt);
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

    
    
  geom.Point.xferProps = function (src) {
    this.x = src.x;
    this.y = src.y;
  }
  
  geom.Point.setXY = function (x,y) {
    this.x = x;
    this.y = y;
  }
  
  
  

})(__pj__);

