// the displayable shapes, which aren't needed for draw.js


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var dom = __pj__.dom;
  var draw = __pj__.draw;
  var dataOps = __pj__.dataOps;
  var shapes = __pj__.set("shapes",om.DNode.mk());
  
  //var drawops = draw.drawOps;
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
  
  
  geom.Line.draw = function (canvas) {
    var e0 = this.e0;
    var e1 = this.e1;
    var df = function () {
      canvas.beginPath();
      canvas.moveTo(e0.x,e0.y);
      canvas.lineTo(e1.x,e1.y);
      canvas.stroke();
    }
    canvas.save();
    this.draw1d(canvas,df);
    canvas.restore();
  }
  
  geom.Line.bounds = function () {
    return geom.boundingRectangle([this.e0,this.e1]);
  }
  
/* for speed, now Object.create, not an instatiate isdone, so these lines would have no effect.
  geom.Rectangle.set("style",draw.Style.mk({strokeStyle:"black",fillStyle:"red",lineWidth:1}));
  geom.Rectangle.set("corner",geom.Point.mk(0,0));
  geom.Rectangle.set("extent",geom.Point.mk(100,100));
*/
    
  geom.Rectangle.draw = function (canvas) {
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
    canvas.save();
    var draw1d = function () {
       canvas.strokeRect(lx,ly,wd,ht);
    }
    var draw2d = function() {
      canvas.fillRect(lx,ly,wd,ht);
    }
    this.draw2d(canvas,draw1d,draw2d);
    canvas.restore();
  }
  
  geom.Rectangle.bounds = function () {
    return this;
  }
  geom.set("BezierSegment",geom.Shape.mk()).namedType();
  geom.set("Bezier",geom.Shape.mk()).namedType();

  

  geom.Bezier.set("style",draw.Style.mk({strokeStyle:"black",lineWidth:1})); 
  

  geom.Bezier.draw = function (canvas) {
    var segs = this.segments;
    if (!segs) return;
    var sp = this.startPoint;
    var ln = segs.length;
    var df = function () {
      canvas.beginPath();
      canvas.moveTo(sp.x,sp.y);
      for (var i=0;i<ln;i++) {
        var sg = segs[i];
        var cp1 = sg.cp1;
        var cp2 = sg.cp2;
        var dst = sg.dest;
        canvas.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,dst.x,dst.y)
      }
      canvas.stroke();
    }
    canvas.save();
    this.draw1d(canvas,df);
    canvas.restore();
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
    r = this.radius;
    if (typeof r !== "number") return;
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
    if (a === Math.PI * 2) return a; // allowed in the normal range
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
  
  
  
    
  geom.Arc.draw = function (canvas) {
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
      canvas.beginPath();
      canvas.arc(x,y,r,sa,ea,sa<ea?0:1);
      canvas.stroke();
    }
    canvas.save()
    this.draw1d(canvas,df);
    canvas.restore();
   
  }
  
  
  
  geom.set("Circle",geom.Arc.instantiate()).namedType();
 
 

  geom.Circle.setf("startAngle",0);
  geom.Circle.setf("endAngle",2*Math.PI);
  
  geom.Circle.mk = function (o) { // supports mkLine([1,2],[2,4])
    var rs = geom.Circle.instantiate();
    if (o) {
      rs.setProperties(o,["radius"]);
      rs.style.setProperties(o.style);
      rs.setPoint("center",o.center);
    }
    return rs;   
  }
  geom.Circle.bounds = function () {
    var cnt = this.center;
    var r = this.radius;
    var x = cnt?cnt.x:0;
    var y = cnt?cnt.y:0;
    return geom.Rectangle.mk({corner:[x-r,y-r],extent:[2*r,2*r]});
   
  }
    

  // make its computational variant, located at the origin.  
  geom.Circle.toCCircle = function () {
    return geom.CCircle.mk(this.radius,geom.Point.mk());
  }
  // make CCircles for shapes (typically from a MarkSet. Circles appear at the given paths.) Do this for the first n. 
  geom.shapesToCCircles = function (shapes,pth) {
    var rs = [];
    var ln = shapes.length;
    for (var i=0;i<ln;i++) {
      var s = shapes[i];
      var crc = s.evalPath(pth);
      var ccrc = crc.toCCircle();
      ccrc.shape = s;
      ccrc.index = i;
      rs.push(ccrc);
    }
    // sort by radius
    rs.sort(function (c0,c1) {
      return (c0.radius)<(c1.radius)?-1:1;
    });
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

  
  
  geom.Circle.draw = function (canvas) {
    var r = this.radius;
    if (r === 0) return;
    if (typeof r !== "number") return;
    var c = this.center;
    if (c) {
      var x = c.x;
      var y = c.y;
    } else {
      x=0;
      y=0;
    }
    var draw1d = function () {
      canvas.beginPath();
      canvas.arc(x,y,r,0,Math.PI*2,0);
      canvas.stroke();
    }
    var draw2d = function () {
      canvas.beginPath();
      canvas.arc(x,y,r,0,Math.PI*2,0);
      canvas.fill();
    }
    canvas.save()
    this.draw2d(canvas,draw1d,draw2d);
    canvas.restore();
  }
  geom.set("Text",geom.Shape.mk()).namedType();

  geom.Text.set("style",draw.Style.mk({align:"center",font:"arial",height:10,fillStyle:"black"}));
  
  geom.Text.style.setInputF('height',om,"checkPositiveNumber");
  
  geom.Text.text = "prototypeText";
  geom.Text.set("pos",geom.Point.mk());
  geom.Text.tHide("pos");// hide in the tree
  geom.Text.mk = function (o) {
    var rs = geom.Text.instantiate();
    if (o===undefined) {
      return rs;
    }
    if (o.text) {
      rs.set("text",om.lift(o.text));//might be a computed field
    }
    if (o.pos) {
      rs.set("pos",geom.toPoint(o.pos)); // ext.x, ext.y, might be terms
    } 
    rs.style.setProperties(o.style);
    return rs;   
  }
  
 
  
  
   geom.Text.setupForDraw = function (canvas) {
    var st = this.style;
    var fnt = st.font;
    var ht = st.height;
    var fnt = ht + "px "+fnt;
    canvas.save()
    canvas.setFont(fnt);
  }

  geom.Text.measureWidth = function (canvas) {
    if (!this.text) {
      return 0;
    }
    if (!canvas) {
      canvas = draw.mainCanvas; 
    }
    this.setupForDraw(canvas);
    if (!this.text) {
      debugger;
    }
    var txt = this.text.toString();
    var rs = canvas.measureText(txt).width;
    this.updateBounds(rs);
    canvas.restore();
    return rs;
  }
  
  
  geom.Text.left = function(wd) {
    var st = this.style;
    var align = st.align;
    align=align?align:"left";
    var psx = this.pos.x;
    return (align=="right")?(psx-wd):((align=="center")?(psx-0.5*wd):psx);
  }
  
  geom.Text.updateBounds = function  (wd) {
    var ht = this.style.height;
    var txt = this.text.toString();
    var tln = txt.length;
    var pos = this.pos;
    if (tln === 0) {
      this.__bounds__ = "none";
    } else  {
      var left = this.left(wd);
      var cbnds = this.get("__bounds__");
      if (cbnds && (typeof cbnds === "object")) {
        var crn = cbnds.corner;
        var xt = cbnds.extent;
        crn.x = left;
        crn.y = pos.y-ht;
        xt.x = wd;
        xt.y = ht;
      } else {
        this.__bounds__ = geom.Rectangle.mk({corner:geom.Point.mk(left,pos.y),extent:geom.Point.mk(wd,ht)});
      }
    }
  }
  
  
  geom.Text.draw = function (canvas) {
    if (!this.text) {
      return;
    }
    var sdh = this.scalingDownHere(om.root);
    var st = this.style;
    var ht = st.height;
   if ((sdh * ht) < 6) return;
    //if (sdh > 0.5) console.log("scaling",sdh,"height ",ht);
  
    this.setupForDraw(canvas);
    var pos = this.pos;
    var align = st.align;
    align=align?align:"left";
    var txt = this.text.toString();
    var sel = 0;this.isSelected();
    var wd = canvas.measureText(txt).width;
    var psx = pos.x;
    var leftx = this.left(wd);//(align=="right")?(psx-wd):((align=="center")?(psx-0.5*wd):psx);
    if (sel) {
      this.setFillStyle(canvas,draw.highlightColor);
      canvas.fillRect(leftx,pos.y-ht,wd,Math.floor(ht*1.4));
    }
    canvas.setTextAlign(align);
    this.setFillStyle(canvas,st.fillStyle);
    canvas.fillText(txt,pos.x,pos.y);
    this.updateBounds(wd);
    canvas.restore();     
    return;
   

  }

  geom.set("Polyline",geom.Shape.mk()).namedType();

  geom.Polyline.setN("style",draw.Style.mk({lineWidth:1}));

  geom.Polyline.setPoints = function (pnts) {
    var rs = om.LNode.mk();
    pnts.forEach(function (p) {
      rs.pushChild(geom.toPoint(p));
    });
    this.set("points",rs);
  }
    
  // the points don't need to be points; they need to have x y coords is all
  geom.Polyline.mk = function (o) { // supports mk([[1,2],[2,4],[5,6]\_
    var rs = geom.Polyline.instantiate();
    if (!o) return rs;
    if (o.data) {
      this.setPoints(o.data);
    }
    rs.style.setProperties(o.style);
    return rs;   
  }
  
  
  geom.Polyline.draw = function (canvas) {
    var p = this.points;
    if (p  && p.length>0) {
      var df = function () {
        var ln = p.length;
        var p0 = p[0];
        canvas.beginPath();
        canvas.moveTo(p0.x,p0.y);
        for (var i=1;i<ln;i++) {
          var cp = p[i];
          canvas.lineTo(cp.x,cp.y);
        }
        canvas.stroke();
      }
      canvas.save();
      this.draw1d(canvas,df);
      canvas.restore();
    }
  }
  // dt should be a dataOps.series.@todo reuse the points if present
  geom.Polyline.update = function (d) {
    var dt = this.setData(d);
    if (!dt) return;
    var xf = dt.dataTransform();
    var pnts = om.LNode.mk();
    dt.data.forEach(function (p) {
      var px = dataOps.datumGet(p,"x");
      var py = dataOps.datumGet(p,"y");
      var rs = geom.Point.mk(px,py);
      if (xf) {
        rs = xf(rs);
      }
      pnts.pushChild(rs);
    });
   // this.dataTransform = xf;
    this.setIfExternal("points",pnts);
  
  }
  
  
  
  
  
 // geom.Polyline.monitorColor = function (fn) {
 //   this.style.setInputF("strokeStyle",prototypeJungle.geom,"newMarkColor");
 // }
  
  geom.Polyline.monitorColor = function (fn) {
    this.style.reportChange("strokeStyle","colorChange");
    if (fn) {
      this.onNewColor  = fn;
    }
  }

  
  geom.Polyline.setColor = function (cl) {
    this.style.strokeStyle = cl;
  }
  
  // assume sorted in x for now; do binary search
  //only use x coords. PUNT on the binary search; only for use with the hovering, so assume very near line
  // returns the index
  /* Code not in use: hovered polyline 
  geom.Polyline.nearestDataPoint  = function (p,candidateIdx) {
    var px = p.x;
    var pnts = this.points;
    if (!pnts) return;
    var ln = pnts.length;
    var minx = Infinity;
    var mini;
    for (var i=0;i<ln;i++) {
      var cx = pnts[i].x;
      var d = Math.abs(cx - px);
      if (d < minx) {
        minx = d;
        mini = i;
      }
    }
    return mini;
  }
    
    
  // a polyline has a nearEnd threshhold. If the hover is within that threshold, the function hoverNearEnd is called (on first entry)
  
  
  geom.Polyline.hover = function (rc) {
    if (!this.hoverNearEnd) return;
    var lc = this.toLocalCoords(rc);
    var npi = this.nearestDataPoint(lc);
    var opi = this.__nearestDataPointIndex__;
    console.log("opi, npi",opi,npi);
    if (npi===undefined) {
      if (opi !== undefined) {
        this.unhoverNearEnd();
        this.__nearestDataPointIndex__ = undefined;

      }
    } else {
      if (opi !== npi) {
          if (opi!==undefined) {
            this.unhoverNearEnd();
          }
          console.log("INDEX SWITCH FROM ",opi,"TO",npi);
          this.hoverNearEnd(npi);
          this.__nearestDataPointIndex__ = npi;
      }
    }
    console.log("Polyline HHover",npi,rc,lc);
  }
  
  
  
  geom.Polyline.unhover = function () {
    if (!this.hoverNearEnd) return;

    var opi = this.__nearestDataPointIndex__;
    if (opi!==undefined) {
      this.unhoverNearEnd();
      this.__nearestDataPointIndex__ = undefined;

    }
    console.log("Polyline unhover");
  }
 
  
  geom.Polyline.unhoverNearEnd = function () {
    console.log("unhover near end");
  }
  */
  // a shape built from html; that is, whose content is a bit of DOM
  //behaves differently from other shapes; cannot be scaled or rotated
  // and held in the canvas.domElements LNode
  // fields: omElement /is a dom.OmElement(ement, and __dom__ is the for-real DOM
  // rename to DomShape?
  geom.set("Html",geom.Shape.mk()).namedType();
 // geom.Html.setN("style",{"background-color":"grey"});
  geom.Html.tag = "shape";
  geom.Html.mk = function (o) {
    var rs = geom.Html.instantiate();
    if (typeof o === "string") {
      var ome = dom.OmElement.mk(o);
      rs.set("omElement",ome);
    }

    rs.width = 100; // a default to be overridden, of course
    // the selection rectangle
    rs.set("selectRect",geom.Rectangle.mk({corner:[0,0],extent:[20,30],style:{fillStyle:"rgba(255,0,0,0.2)"}}));
    return rs;
  }

  
    
  
  geom.Html.hideDom = function () { //called to reflect hides further up the ancestry chain.
    if (this.get("_domHidden__")) {
      return;
    }
    var ome = this.cmElement;
    // supervent normal channels; we don't want to actually change the hidden status of the OmElement or Element
    if (ome) {
      ome.hide();
    }
    this.__domHidden__ = 1;
  }
  
  
  geom.Html.showDom = function () { //called to reflect hides further up the ancestry chain.
    if (this.get("_domHidden__")===0) {
      return;
    }
    var ome = this.omElement;
    // supervent normal channels; we don't want to actually change the hidden status of the OmElement or Element
    if (ome) {
      ome.show();
    }
    this.__domHidden__ = 0;
  }
  
  geom.Html.setHtml = function (ht) {
    //this.lastHtml = this.html;
    //this.html = ht;
    var ome = this.omElement;
    if (!ome) {
      var ome = dom.OmElement.mk(ht);
      rs.set("omElement",ome);
    } else {
      ome.setHtml(ht);
    }
  }
    // clear out the dom so it gets rebuilt
  // html's can only live on one canvas at the moment
  geom.Html.draw = function (canvas) {
    // an html element might have a target width in local coords
    var offset=this.offset;
    var offx = offset?(offset.x?offset.x:0):0;
    var offy = offset?(offset.y?offset.y:0):0;
    var ome = this.omElement;
    if (!ome) return
  
    //var dm = ome.__dom__;
   // var dm = this.get("__dom__");
    var thisHere = this;
    var clickInstalled = false;
    // be sure the __dom__ matches the element's  dom; ow there is a new element
    /*if (dm && this.element) {
      if (this.element.__dom__ !== dm) {
        dm = undefined;
      }
    }*/
    //ome.click = function (e) {e.preventDefault();console.log("CLICK ",e);}
    //ome.mousemove = function (e) {e.preventDefault();console.log("mousemove",e);}
    ome.install(canvas.htmlDiv.__element__);
    //if (this.lastHtml !== this.html) {
    //  this.setHtml(this.html);
   // }
    var pos = this.toGlobalCoords(geom.Point.mk(0,0),canvas.contents);
    var scwd = 0;
    var scd = this.scalingDownHere();
    if (this.width) {
      var scwd = this.width*scd;
    }
    
    var xf = canvas.contents.get("transform");
    if (xf) {
      var p = pos.applyTransform(xf);
    } else {
      p = pos;
    }
    var ht = ome.height();
     // var st = {left:(offx + p.x)+"px",top:(offy+p.y-ht)+"px"};
    var st = {"pointer-events":"none",position:"absolute",left:(offx + p.x)+"px",top:(offy+p.y)+"px"};
    if (scwd) {
      st.width = scwd;
    }
    ome.css(st);
    var ht = ome.height();
    var  awd = ome.width();
    //console.log("awd",awd,"width",scwd,"Height",ht);
    var sr = this.selectRect;
    sr.extent.x = awd/scd;
    sr.extent.y = ht/scd;
    var hcl = sr.get("__hitColor__");
    console.log("hitcolor",hcl);
    if (!hcl && canvas.hitCanvasActive) {
      sr.__hitColor__ = hcl = draw.randomRgb();
        draw.shapesByHitColor[hcl] = sr;
      }
    this.selectRect.draw(canvas);
  }
  
  
  geom.set("Caption",geom.Html.mk()).namedType();
  //BubbleI1
  // with n lines
  geom.Caption.mk = function (o) {
    var rs = geom.Caption.instantiate();

    var n = o.lineCount;
    var style = om.lift(o.style);
    var lineStyle = om.lift(o.lineStyle);
    rs.set("offset",o.offset);
    rs.set("lineStyle",lineStyle);
    function mkLine(k) {
      var rs = dom.OmEl('<div id='+k+'>Line'+k+'</div>');
      if (lineStyle) {
        rs.set("style",lineStyle.instantiate());
      }
      return rs;
    }
    var rse = dom.OmEl('<div/>');
    for (var i=0;i<n;i++) {
      rse.set("line"+i,mkLine(i));
    }
    if (style) {
      style.cursor = "pointer";
    } else {
      style = om.lift({cursor:"pointer"});
    }
    rse.set("style",style);
    if (lineStyle) {
      rs.set("lineStyle",lineStyle);
    }
    rs.set("element",rse);
    return rs;
  }
  
  geom.Caption.setLine = function (n,ht) {
    var ln = this.element["line"+n];
    ln.setHtml(ht);
  }
  
  
   
 
  
  geom.Shape.setStyle = function(nm,v) {
    var st = this.get("style");
    if (!st) {
      st = this.set("style",draw.Style.mk());
    }
    st[nm] = v;
  }
  
  geom.CircleSet.install = function (all,useData) {
    //useData = 1;
    var totalD = 0;
    var totalR = 0;
    var totalM = 0;
    if (all) {
      var crcs = this.allCircles;
    }  else {
      var crcs = this.circles;
      crcs.push(this.subject);
    }
    var ln = crcs.length;
    var aln = this.allCircles.length;
    for (var i=0;i<ln;i++) {
      var c = crcs[i];
      //c.shape.setRac.radius);
      var sh = c.shape;
      sh.show();
      if (useData) {
        var d=sh.data;
        var xf = d.dataTransform1d();
        var dm = d.dataDomainValue();
        if (xf) {
          var dxf = xf(dm);
        } else {
          dxf = dm;
        }
        c.shape.translate(geom.Point.mk(dxf,c.center.y));
      } else {
        c.shape.translate(c.center);
      }
      var dt = c.shape.data;
      continue;
      var sn = dt[5];
      var pop = dt[0];
      if ((sn === "DD")||(sn == "DI")){
        var cl = "blue";
        totalD = totalD + pop;
      } else if (sn == "RR") {
        cl="red";
        totalR = totalR + pop;
      } else {
        cl = "magenta";
        totalM = totalM + pop;
      }
     
      c.shape.circle.style.fillStyle = cl;//(r<0.33)?"red":(r<0.66)?"magenta":"blue";
    }
    for (var i=ln;i<aln;i++) {
      var c = this.allCircles[i];
      c.shape.hide();
    }
    if (!all) crcs.pop();
    geom.totalD = totalD;
    geom.totalR = totalR;
    geom.totalM = totalM;
  }
  
  
 
 
  
  
})(prototypeJungle);
