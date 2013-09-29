// the displayable shapes, which aren't needed for draw.js


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var shapes = __pj__.set("shapes",om.DNode.mk());
  
  var drawops = draw.drawOps;
  // shapes are used in the UI; it has instances of the primitives in the form in which they will initially appear when inserted
   
  geom.Point.setInputF('x',om,"checkNumber");
  geom.Point.setInputF('y',om,"checkNumber");
  geom.Transform.setInputF('scale',om,"checkPositiveNumber")
  
  geom.set("Line",geom.Shape.mk()).namedType();

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
  

  
  geom.Line.setTo = function (src) {
    this.e0.setTo(src.e0);
    this.e1.setTo(src.e1);
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
    drawops.save();
    this.draw1d(df);
    drawops.restore();
  }
  
   
  

  geom.Rectangle.set("style",draw.Style.mk({strokeStyle:"black",fillStyle:"red",lineWidth:1}));
  geom.Rectangle.set("corner",geom.Point.mk(0,0));
  geom.Rectangle.set("extent",geom.Point.mk(100,100));

    
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
  
  geom.Rectangle.bounds = function () {
    return this;
  }
  geom.set("BezierSegment",geom.Shape.mk()).namedType();
  geom.set("Bezier",geom.Shape.mk()).namedType();

  

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
  
  geom.set("Arc",geom.Shape.mk()).namedType();

  geom.Arc.set("style",draw.Style.mk({strokeStyle:"black",lineWidth:1}));
  geom.Arc.radius = 100;
  geom.Arc.startAngle = 0;
  geom.Arc.endAngle = 2 * Math.PI;
  geom.Arc.center = geom.Point.mk();
  
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

  // crude for now. Just collect some points and box them
  
  geom.Arc.bounds = function () {
    var sa = this.startAngle;
    var ea = this.endAngle;
    var ad = (ea - sa);
    var n = 5;
    var inc = ad/n;
    var c = this.center;
    var pnts = [];
    var r = this.radius;
    for (var i=0;i<n;i++) {
      var ca = sa + i*inc;
      var d = geom.Point.mk(Math.cos(ca),Math.sin(ca));
      var p = c.plus(d.times(r));
      pnts.push(p);
    }
    var rs = geom.boundingRectangle(pnts);
    return rs;
  }
  
  
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
    var rs = geom.Circle.instantiate();
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
    drawops.save()
    this.draw2d(draw1d,draw2d);
    drawops.restore();
  }
  
  geom.set("Text",geom.Shape.mk()).namedType();

  geom.Text.set("style",draw.Style.mk({align:"center",font:"arial",height:10}));
  
  geom.Text.style.setInputF('height',om,"checkPositiveNumber");
  
  geom.Text.text = "prototypeText";
  geom.Text.pos = geom.Point.mk();

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
      this.setFillStyle(draw.highlightColor);
      drawops.fillRect(psx,pos.y-ht,wd,Math.floor(ht*1.4));
    }
    this.setFillStyle(st.fillStyle);
    drawops.fillText(txt,psx,pos.y);
    var msr = drawops.measureText(txt);
    // to estimage height, assume letters are square and uniform in width (just an estimate)
    var wd = msr.width;
    var tln = txt.length;
    if (tln == 0) {
      this.__bounds__ = "none";
    } else  {
      var ht = wd/tln;
      var cbnds = this.__bounds__;
      if (cbnds && (typeof cbnds == "object")) {
        var crn = cbnds.corner;
        var xt = cbnds.extent;
        crn.x = psx;
        crn.y = pos.y;
        xt.x = wd;
        xt.y = ht;
      } else {
        this.__bounds__ = geom.Rectangle.mk({corner:geom.Point.mk(psx,pos.y),extent:geom.Point.mk(wd,ht)});
      }
    }    
    drawops.restore()

  }
  
})(prototypeJungle);
