// the displayable shapes, which aren't needed for draw.js


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var draw = __pj__.draw;  
  var drawops = draw.drawOps;

  //geom.Line = om.mkDNode();
  
  geom.Point.setInputF('x',om,"checkNumber");
  geom.Point.setInputF('y',om,"checkNumber");
  geom.Transform.setInputF('scale',om,"checkPositiveNumber")
  

  geom.installType("Line");


  geom.Line.set("style",draw.Style.mk({strokeStyle:"black",lineWidth:1}));

  draw.Style.setInputF('lineWidth',om,"checkPositiveNumber");

  geom.Line.mk = function (o) { // supports mkLine([1,2],[2,4])
    var e0=geom.toPoint(o.e0);
    var e1=geom.toPoint(o.e1);
    var rs = geom.Line.instantiate();
    rs.set("e0",e0); // ext.x, ext.y, might be terms
    rs.set("e1",e1);
    rs.style.setProperties(o.style);
    return rs;   
  }
  

  
  geom.Line.xferProps = function (src) {
    this.e0.xferProps(src.e0);
    this.e1.xferProps(src.e1);
  }
  
  
  geom.Line.pathLength = function () {
    var e0 = this.e0;
    var e1 = this.e1;
    return e0.distance(e1);
  }
  
  geom.Line.pathPosition = function (t) {
    var e0 = this.e0;
    var e1 = this.e1;
    var vc = e1.difference(e0);
    var svc = vc.times(t);
    return e0.plus(svc);
  }
  
  geom.Line.pointAtDistance = function (d) {
    var ln = this.pathLength();
    var t = d/ln;
    return this.pathPosition(t);
  }
  
  
  geom.distanceToLine = function (e0,e1,p) {
    var p2e0 = p.difference(e0);
    var v = e1.difference(e0);
    var vdot0 = p2e0.dotp(v);
    if (vdot0 <= 0) { // the projection  of p on the line from e0 to e1  lies before e0, so the distance = distance to e0
      return p.distance(e0);
    }
    var e12p = p.difference(e1);
    var vdot1 = e12p.dotp(v);
    if (vdot1 >= 0) { // the projection  of p on the line from e0 to e1  lies before e0, so the distance = distance to e0
      return p.distance(e1);
    }
    // in this case, the distance is the dot product of p-e0 with the normal to e1-e0
    var vn = v.normal().normalize();
    var rs = Math.abs(p2e0.dotp(vn));
    return rs;
  }
  
  
  geom.Line.draw = function () {
    var e0 = this.e0;
    var e1 = this.e1;
    var df = function () {
      drawops.beginPath();
      drawops.moveTo(e0.x,e0.y);
      drawops.lineTo(e1.x,e1.y);
      drawops.stroke();
    }
    //ctx.closePath();
    drawops.save();
    this.draw1d(df);
    drawops.restore();
  }
  
   
  
  geom.installType("Rectangle");

  geom.Rectangle.set("style",draw.Style.mk({strokeStyle:"black",fillStyle:"red",lineWidth:1}));


  geom.Rectangle.mk = function (o) {
    var rs = geom.Rectangle.instantiate();
    if (o) {
      rs.style.setProperties(o["style"]);
      rs.setPoint("corner",o.corner);
      rs.setPoint("extent",o.extent);
    }
    return rs;
  }
  

  geom.Rectangle.set("corner",geom.Point.mk());
  geom.Rectangle.set("extent",geom.Point.mk(1,1));
 

  
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
  
  geom.Rectangle.scale = function (sc) { // while maintaining the same center
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
  
  geom.Rectangle.applyTransform = function (tr) {
    var sc = tr.scale;
    var crn = this.corner;
    var xt = this.extent;
    var rcrn = crn.applyTransform(tr);
    var rxt = xt.times(sc);
    return geom.Rectangle.mk({corner:rcrn,extent:rxt});
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
    // map center to center
    //var x = (dcnt.x)/r - cnt.x;
    //var y = (dcnt.y)/r - cnt.y;
    var rs = Object.create(geom.Transform);
    rs.scale = r;
    rs.set("translation",geom.Point.mk(x,y));
    return rs;
  }
      
      
    
  geom.Rectangle.draw = function () {
    var st = this.style;
    if (!st) { //purely geometric
      return;
    }
    var crn = this.corner;
    var ext = this.extent;
    var wd =  ext.x;
    var ht =  ext.y;
    var lx = crn.x;
    var ly = crn.y;
    drawops.save();
    var draw1d = function () {
       drawops.strokeRect(lx,ly,wd,ht);
    }
    var draw2d = function() {
      drawops.fillRect(lx,ly,wd,ht);
    }
    this.draw2d(draw1d,draw2d);
    drawops.restore();
  }
  
   
  

  
  geom.installType("BezierSegment");

  geom.installType("Bezier");
  geom.Bezier.set("style",draw.Style.mk({strokeStyle:"black",lineWidth:1})); 
  

  geom.Bezier.draw = function (mode) {
    var segs = this.segments;
    if (!segs) return;
    var sp = this.startPoint;
    var ln = segs.length;
    var df = function () {
      drawops.beginPath();
      drawops.moveTo(sp.x,sp.y);
      for (var i=0;i<ln;i++) {
        var sg = segs[i];
        var cp1 = sg.cp1;
        var cp2 = sg.cp2;
        var dst = sg.dest;
        drawops.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,dst.x,dst.y)
      }
      drawops.stroke();
    }
    drawops.save();
    this.draw1d(df);
    drawops.restore();
  }
  
  
  geom.installType("Arc");
  geom.Arc.set("style",draw.Style.mk({strokeStyle:"black",lineWidth:1}));
  geom.Arc.radius = 100;
  geom.Arc.startAngle = 0;
  geom.Arc.endAngle = 2 * Math.PI;
  // r positive for center to the right, negative for center to the left 
  geom.mkArcFromEndPoints = function  (e0,e1,r) {
    var v = e1.difference(e0);
    var hln = v.length()*0.5;
    var nd = Math.sqrt(r * r - hln*hln);//normal distance to center of arc from center of segment
    if (r<0) {
      nd=-nd;
    }
    var vn = v.normalize();
    var vnn = vn.normal();
    var vcnt = e0.plus(v.times(0.5));
    var cnt = vcnt.plus(vnn.times(nd));
    var ve0 = e0.difference(cnt);
    var ve1 = e1.difference(cnt);
    var a0 = geom.angle2normalRange(Math.atan2(ve0.y,ve0.x));
    var a1 = geom.angle2normalRange(Math.atan2(ve1.y,ve1.x));
    var rs = geom.Arc.instantiate();
    rs.startAngle = a0;
    rs.endAngle = a1;
    rs.set("center",cnt);
    rs.radius = Math.abs(r);
    return rs;
  }
  
  geom.Arc.mk = function (o) {
    var rs = geom.Arc.instantiate();
    rs.setProperties(o,["startAngle","endAngle","radius"]);
    rs.style.setProperties(o.style);
    rs.setPoint("center",o.center);
    return rs;
  }

  geom.degreesToRadians =  function (n) { return Math.PI * (n/180);}
  
  geom.radiansToDegrees =  function (n) { return 180 * (n/Math.PI);}

  
  
  
  geom.checkAngle = function (v) {
    return om.check(v,'expected number in units of degrees', function (x) {
      if (isNaN(v)) {
        return undefined;
      } else {
        return geom.degreesToRadians(v);
      }
    });
  }
  
   om.DNode.degreesField = function (k) {
    this.setInputF(k,geom,"checkAngle");
    this.setOutputF(k,geom,"radiansToDegrees");
   }
   geom.Arc.degreesField('startAngle');
   geom.Arc.degreesField('endAngle');
   
  
  geom.Arc.setInputF('radius',om,"checkPositiveNumber");


  
  geom.Arc.pathLength = function () {
    var sa = this.startAngle;
    var ea = this.endAngle;
    var r = this.radius;
    var ln = Math.abs(ea - sa)*r;
    return ln;
  }
  
  geom.Arc.pathPosition = function (t) {
    var cnt = this.center;
    var sa = geom.angle2normalRange(this.startAngle);
    var ea = geom.angle2normalRange(this.endAngle);
    var r = this.radius;
    var dfs = t *  (ea - sa);
    var rsa = sa + dfs;
    var rs = geom.Point.mk(r * Math.cos(rsa),r * Math.sin(rsa)).plus(cnt);
    return rs;
  }
  
  geom.angle2normalRange = function (a) { // to the range 0-2*pi
    if (a == Math.PI * 2) return a; // allowed in the normal range
    var tpi = 2 * Math.PI;
    if (a < 0) {
      var m = Math.floor((-a)/tpi);
      a = a + (m+1) * tpi;
    }
    return a%tpi;
  }
  
  
  geom.angleIsBetween = function (a,lb,ub) {
    // method:the normalized values of (a-lb) must be less than the normalized version  (ub-lb)
    var na = geom.angle2normalRange(a - lb);
    var ul = geom.angle2normalRange(ub - lb);
    return na < ul;
  }
  
  
    
  geom.Arc.draw = function (mode) {
    var sa = this.startAngle;
    var ea = this.endAngle;
    var r = this.radius;
    var c = this.center;
    if (c) {
      var x = c.x;
      var y = c.y;
    } else {
      x = 0;
      y = 0;
    }
    var df = function () {
      drawops.beginPath();
      drawops.arc(x,y,r,sa,ea,sa<ea?0:1);
      drawops.stroke();
    }
    drawops.save()
    this.draw1d(df);
    drawops.restore();
   
  }
  
  
  
  geom.set("Circle",geom.Arc.instantiate()).namedType();
 
 

  geom.Circle.setf("startAngle",0);
  geom.Circle.setf("endAngle",2*Math.PI);
  
  geom.Circle.mk = function (o) { // supports mkLine([1,2],[2,4])
    var rs = Object.geom.Circle.instantiate();
    rs.setProperties(o,["radius"]);
    rs.style.setProperties(o.style);
    rs.setPoint("center",o.center);
    return rs;   
  }
  
 
  
  geom.Circle.xIntercepts = function (yv,expandBy) { // intercepts of the line y = yv
    if (!yv) yv = 0;
    var circle = this;
    var  c = circle.center;
    var r = circle.radius + expandBy;
    // first take center with x = 0
    // d = sqrt(x*x + y*y); x*x = d*d - y*y; x = sqrt(d*d - y*y)
    var cx = c.x;
    var cy = (c.y - yv);
    var acy = Math.abs(cy);
    if (acy > r) return [];
    var dx = Math.sqrt(r*r - cy*cy);
    return [cx - dx,cx + dx];
  }

  geom.Circle.containsPoint = function (p) {
    var cnt = this.center;
    var r = this.radius;
    var d = cnt.distance(p);
    return d <= r;
  }

  
  
  geom.Circle.draw = function () {
    if (this.radius == 0) return;
    var r = this.radius;
    var c = this.center;
    if (c) {
      var x = c.x;
      var y = c.y;
    } else {
      x=0;
      y=0;
    }
    var draw1d = function () {
      drawops.beginPath();
      drawops.arc(x,y,r,0,Math.PI*2,0);
      drawops.stroke();
    }
    var draw2d = function () {
      drawops.beginPath();
      drawops.arc(x,y,r,0,Math.PI*2,0);
      drawops.fill();
    }
    this.draw2d(draw1d,draw2d);
    drawops.restore();
  }
  
  
  geom.installType("Text");
  geom.Text.set("style",draw.Style.mk({align:"center",font:"arial",height:10}));
  
  geom.Text.style.setInputF('height',om,"checkPositiveNumber");

  geom.Text.mk = function (o) {
    var rs = geom.Text.instantiate();
    rs.text = o.text;
    if (o.pos) {
      rs.set("pos",geom.toPoint(o.pos)); // ext.x, ext.y, might be terms
    } else {
      rs.set("pos",geom.Point.mk());
    }
    rs.style.setProperties(o.style);
    return rs;   
  }
  
  
  geom.Text.draw = function () {
    var pos = this.pos;
    var st = this.style;
    var fnt = st.font;
    var ht = st.height;
    var align = st.align;
    if (ht) {
      fnt = ht + "px "+fnt;
      //code
    }
    var txt = this.text;
    var sel = this.isSelected();
    drawops.save()
    drawops.setFont(fnt);
    if (sel || (align=="center")) {
      var wd = drawops.measureText(txt).width;
    }
    if (align == "center") {
      var psx = pos.x - 0.5*wd;
    } else {
      psx = pos.x;
    }
    if (sel) {
      //code
      this.setFillStyle(draw.highlightColor);
      drawops.fillRect(psx,pos.y-ht,wd,Math.floor(ht*1.4));
    }
    this.setFillStyle(st.fillStyle);
    drawops.fillText(txt,psx,pos.y);
    drawops.restore()

  }
  
})(__pj__);
