// for bubble charts
(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var svg = __pj__.svg;
   geom.CCircle = {}; // circle for computation only; has center and radius, need not be DNnode
  
  geom.CCircle.mk = function (r,c) {
    var rs = Object.create(geom.CCircle);
    rs.radius = r;
    rs.center = c?c:geom.Point.mk();
    return rs;
  }
  
  geom.Vector = {}; // a vector in affine space:a point and direction. direction is assumed to be of length one
  
  
  geom.Vector.mk = function (p,d) {
    var rs = Object.create(geom.Vector);
    rs.origin = p;
    rs.direction = d;
    return rs;
  }
  
  geom.Vector.normal = function (){
    return geom.Vector.mk(this.origin,this.direction.normal());
  }
  
  geom.Vector.along = function(d) {
    return this.origin.plus(this.direction.times(d));
  }
  
  geom.Vector.distanceAlong = function (p) {
    var o = this.origin;
    return (p.difference(o)).dotp(this.direction);
  }
  
  geom.Vector.distanceAcross = function (p) {
    var o = this.origin;
    return (p.difference(o)).dotp(this.direction.normal());
  }
  
  //interesection of this circle expanded by ex. A circle of radius ex will make contact with the circle at the returned points.
  geom.CCircle.vectorIntersect = function (v,iex) {
    var ex = iex?iex:0;
    var c = this.center;
    var cx = c.x,cy = c.y;
    var p = v.origin;
    var px = p.x,py = p.y;
    var d = v.direction;
    var dx = d.x,dy = d.y;
    var zx = px-cx;
    var zy = py-cy;
    var a = dx*dx + dy*dy;
    var b = 2*(zx*dx + zy*dy);
    var efr = this.radius + ex;
    var c = zx*zx + zy*zy - efr*efr;
    var y = b*b - 4*a*c;
    if (y<0) return undefined;
    if (y==0) {
      var t = -b/(2*a);
      return [p.plus(d.times(t))];
    }
    var sry = Math.sqrt(y);
    var t0 = (-b + sry)/(2*a);
    var t1 = (-b - sry)/(2*a);
    var r0 = p.plus(d.times(t0));
    var r1 = p.plus(d.times(t1));
    // return in order of distance from the origin of v
    var d0 = v.distanceAlong(r0);
    var d1 = v.distanceAlong(r1);
    var a0 = v.distanceAcross(r0); // for checking; should be zero
    var a1 = v.distanceAcross(r1);
    return (d0<d1)?[r0,r1]:[r1,r0];
  }
  
  geom.CCircle.distance = function (ccircle) {
    var d = this.center.distance(ccircle.center);
    return d - (this.radius + ccircle.radius);
  }
  
  
  geom.CircleSet = {}; // an array of circles, and a subject (also a circle), and a contact (a circle to which the subject is tangent)
  // Operations on a circle set move the subject around
 /* geom.CircleSet.mk = function (allCircles) {// sb is an index
    var rs = Object.create(geom.CircleSet);
    var c0 = allCircles[0];
    rs.sofar = 1;
    rs.subject = c0; // the circle we are trying to place
    rs.circles = [c0]; // the circles arranged so far
    rs.allCircles = allCircles;
    rs.dropPoints = [geom.Point.mk()]; //  where to place circles before they drop in 
    return rs;
  }
  */
  geom.CircleSet.setIndices = function () {
    var crcs = this.allCircles;
    var ln = crcs.length;
    for (var i=0;i<ln;i++) {
      crcs[i].index = i;
    }
    this.subject = crcs[0];
  }
   geom.CircleSet.mk = function (allCircles) {
    var rs = Object.create(geom.CircleSet);
    var c0 = allCircles[0];
    rs.sofar = 1;
    rs.subject = c0; // the circle we are trying to place
    rs.circles = [c0]; // the circles arranged so far
    rs.allCircles = allCircles;
    rs.dropPoints = [geom.Point.mk()]; //  where to place circles before they drop in
    rs.setIndices();
    return rs;
  }
/*
  geom.CircleSet.mkFromShapes = function (shapes) {// sb is an index
    var allCircles = shapes.map(function (s) {return s.toCCircle()});
    var rs = geom.CircleSet.mk(allCircles);
    rs.shapes = shapes;
    return rs;
  }
  
*/
  geom.CircleSet.mkFromMarkSet = function (ms) {// sb is an index
    var shapes = ms.marks;
    var allCircles = shapes.map(function (s) {return s.toCCircle()});
    var rs = geom.CircleSet.mk(allCircles);
    rs.markSet = ms;
  //  rs.shapes = shapes;
    return rs;
  }
   
  svg.shape.toCCircle = function () {
    var rs = geom.CCircle.mk(this.radius,geom.Point.mk());
    rs.shape = this;
    rs.setFromData();
    return rs;
  }
    
  //  var cs = geom.CircleSet.mk(crcs);
  
  
  
  om.arrayToObject = function (x) {
    var rs = {};
    x.forEach(function (k) {
      rs[k] = 1;
    });
    return rs;
  }
 
  
  
  // find the value with the minimal value of fn
  
  geom.findMinimal = function (values,fn,exclude) {
    var rs;
    var sf = Infinity;
    values.forEach(function (v) {
      if (exclude && exclude(v)) {
        return;
      }
      var fv = fn(v);
      if (fv<sf) {
        sf = fv;
        rs = v;
      }
    });
    return [rs,sf];
  }
  geom.findMinimum = function (values,fn,exclude) {
    return geom.findMinimal(values,fn,exclude)[1];
  }
  
  
  geom.findMaximal = function (values,fn,exclude) {
    var rs;
    var sf = -Infinity;
    values.forEach(function (v) {
      if (exclude && exclude(v)) {
        return;
      }
      var fv = fn(v);
      if (fv>sf) {
        sf = fv;
        rs = sf;
      }
    });
    return [rs,sf];
  }
  geom.findMaximum = function (values,fn,exclude) {
    return geom.findMaximal(values,fn,exclude)[1];
  }
  
  // find the circle closest to the center of the given set of circles
  geom.CircleSet.centerCircleOf = function (crcs) {
    var cg = this.cg(crcs);
    return geom.findMinimal(crcs,function (c) {return c.center.distance(cg);})[0];
  }
  
  
      
   
  
  geom.CCircle.intersectsVector = function (v,d) { // returns 1 if the vector hits the left side of the circle, -1 the right
    var c = this.center;
    var dn = v.direction.normal();
    var cToP = v.origin.difference(c);
    var dToVec = Math.abs(cToP.dotp(dn));
    if  (Math.abs(dToVec) < (this.radius + (d?d:0))) {
      return (dToVec>=0)?1:-1;
    }
  }
  
 
  geom.Vector.toLine = function (ln) {
    var rs = geom.Line.mk({e0:this.origin,e1:this.origin.plus(this.direction.times(ln))});
    return rs;
  }
  // returns a pair [circle,contact point]
  
  
   geom.CircleSet.allContactsAlongVector = function (v) {
    var tm = Date.now();
    var dsf = Infinity;
    var sb = this.subject;
    var sbc = sb.center;
    var rs = [];
    // the vectors traced by the left and right sides of the subject
    var d = v.direction;
    var nv = d.normal().times(sb.radius);
    
    var thisHere = this;
    this.circles.forEach(function (c) {
      var ndb =  (sb.caption == "NM") && (c.caption == "TX");
      if (ndb && 0) {
        var line = v.toLine(30);
        line.style.lineWidth = 0.02;
       om.root.set("debugLine",line);
      thisHere.show(null,1);
      }
      var iv = c.intersectsVector(v,sb.radius);
      if (iv) {
        var intr = c.vectorIntersect(v,sb.radius);
        var i0 = intr[0];
        rs.push([c,i0]);
      }
    });
    geom.logTime("nearestContactAlongVector",tm);
    return rs;
  }
         
    
    
  geom.CCircle.intersects = function (circle) {
    var d = this.center.distance(circle.center);
    return d < (this.radius+circle.radius)-0.010;
  }
  
 
  
   geom.CCircle.inContact = function (circle) {
    var d = this.center.distance(circle.center);
    return Math.abs(d-(this.radius+circle.radius)) < 0.00001;
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
  
  
   // is there any intersection of the subject with any of the already placed cirles
  geom.CircleSet.subjectIntersects= function () {
    var crcs = this.circles;
    var ln = crcs.length;
    var sb = this.subject;
    for (var i=0;i<ln;i++) {
      var cc = crcs[i];
      if (cc  !== sb) {
        if  (sb.intersects(cc)) {
          return 1;
        }
        //code
      }
    }
    return 0;
  }
  
  
 
  geom.CircleSet.moveSubjectTo = function (dst) {
    // move the subject way out along vc
    var sb = this.subject;
    sb.center = dst;
  }
  // considering the centers, not the radii. The objective here is to compute the scaling factor for area.
  
  geom.CircleSet.radius = function () {
    var rs = 0;
    var dc = this.dataCenter;
    var crcs = this.allCircles;
    crcs.forEach(function (c) {
      var d = c.center.distance(dc);
      if (d > rs) {
        rs = d;
      }
    });
    this.radius = rs;
    return rs;
  }
  // area based on un-scaled radii
  geom.CircleSet.area = function () {
    var rs = 0;
    var crcs = this.allCircles;
    crcs.forEach(function (c) {
      var r = c.radius;
      rs = rs + r*r;
    });
    return Math.PI * rs;
  }
  
  //cause the largest circle to have visible size sz, and also set the radii of the CCircles to match
  // The shapes still have radii set by data, but they are scaled down appropriately
  geom.CircleSet.setScale2 = function(sz) {
    //var mxr = geom.findMaximal(this.allCircles, function (c) {return c.shape.radius;})[1];
    var mxr = geom.findMaximal(this.allCircles, function (c) {return c.radius;})[1];
    var rs = sz/mxr;
    this.radiusScale = rs
    var bs = this.bubbleSet;
    bs.bubbleP.scale = rs;
    this.allCircles.forEach(function (c) {
      c.radius = rs * c.radius;
      c.shape.update();
    });
    return rs;
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
 
  geom.CCircle.dataPoint = function () {
    var dt = this.shape.data;
    return geom.Point.mk(dt[2],-dt[1]);
  }
  
  geom.CCircle.dataArea = function () {
    return Math.sqrt(this.shape.data[0]);
  }
  
  geom.CCircle.setFromData = function () {
    var dt = this.shape.data;
    //if (dt) {
      this.originalCenter = this.center;

      this.center.x = dt.x;

      //this.center = geom.Point.mk(dt.rangeValue,-dt[1]);
      this.caption = dt.caption;
    //}
    //console.log(Math.sqrt(dt[0]));
    this.radius = Math.sqrt(dt.rangeValue);
  }
  
  
  
  geom.CCircle.setFromData1 = function () {
    var dt = this.shape.data;
    var dm = dt.x;
    var r = dt.rangeValue;
    this.center = geom.Point.mk(dm,0);
    this.originalCenter = this.center;
    this.radius = Math.sqrt(parseFloat(r));
  }
  
  geom.CircleSet.computeDataCenter = function () {
    var crcs = this.allCircles;
    var c = this.centerCircleOf(crcs);
    this.dataCenter = c.center;
    return c;
  }
  
  
  geom.CircleSet.setFromData = function () { // put  origin at the data center
    var dc = this.dataCenter;    
    this.allCircles.forEach(function (c) {
      c.setFromData();      
    });
  }
  
  
  
  geom.CircleSet.setFromData1 = function () { // put  origin at the data center
    var dc = this.dataCenter;    
    this.allCircles.forEach(function (c) {
      c.setFromData1();      
    });
  }
  
  geom.CircleSet.setGeoBounds = function () { // min max longitude, latitude
    om.error(3,'geo');
    var xlb = geom.findMinimum(this.allCircles,function (c) {return c.shape.data.dataFieldValue("longitude")});
    var xub = geom.findMaximum(this.allCircles,function (c) {return c.shape.data.dataFieldValue("longitude")});
    var ylb = geom.findMinimum(this.allCircles,function (c) {return c.shape.data.dataFieldValue("latitude")});
    var yub = geom.findMaximum(this.allCircles,function (c) {return c.shape.data.dataFieldValue("latitude")});
    return this.geoBounds =  geom.Rectangle.mk({corner:[xlb,ylb],extent:[xub-xlb,yub-ylb]});
  }
  
  
  // for a 1 dim domain
  geom.CircleSet.setDomainBounds= function () { 
    //var dmi = this.markSet.data.domainIndex();
    var xlb = geom.findMinimum(this.allCircles,function (c) {return c.shape.data.x});
    var xub = geom.findMaximum(this.allCircles,function (c) {return c.shape.data.x});
    
    return this.domainBounds =  geom.Interval.mk(xlb,xub);
  }
  
     
  geom.CircleSet.toInitialPositions0 = function () {
 
    this.allCircles.forEach(function (c) {
     
      c.center = geom.Point.mk(0,0);
    });
  }
  // for 1d domain
    
  geom.CircleSet.toInitialPositions1 = function () {
    var bnds = this.domainBounds;
    var lb = bnds.lb;
    var ub = bnds.ub;
    var xt = ub-lb;
    var d = this.markSet.data;
    var xad = this.xaxisDilation;
    this.allCircles.forEach(function (c) {
      var d = c.shape.data;
      var x = d.x; 
      var mx = 1000* (x - lb)/(xt*xad); // map into a range from lb to 1000/xaxis dilation
     // var y = 1000 * (1 - (lat - (crn.y))/(xt.y));// graphics y runs downwards
      c.center = c.originalCenter = geom.Point.mk(mx,0);
    });
  }
  
  // dropfrom p towards origin
   geom.CircleSet.dropFrom = function (p) {
    var mp = p.minus().normalize();
    var sb = this.subject;
    var c = sb.center;
    var vc = geom.Vector.mk(p,mp);
    sb.center = p;
    this.show(null,1);
    if (this.sofar  > 24) {
      debugger;
    }
    
     var allc =  this.allContactsAlongVector(vc);
    var bestcn;
    var bestd = Infinity;
    var thisHere = this;
    allc.forEach(function  (cn) {
      var cp = cn[1];
      var cd = cp.length();
      if (cd < bestd) {
        sb.center = cp;
        if (!thisHere.subjectIntersects()) {
          bestd = cd;
          bestcn = cn;
        }
      }
    });
    //sb.center = cp;
    var cn =  this.nearestContactAlongVector(vc);
    sb.center =  bestcn[1];
    this.contact = bestcn[0];
  }
  
  
  geom.dropHeight = 1000;
  geom.CircleSet.dropVertically1 = function (fromTop) {
    var sb = this.subject;
   
    var c = sb.center;
    var dp = geom.Point.mk(c.x,fromTop*geom.dropHeight);
    sb.center = dp;
    var vc = geom.Vector.mk(dp,geom.Point.mk(0,-fromTop));
   
    var allc =  this.allContactsAlongVector(vc);
    var bestc;
    var besty = Infinity;
    var thisHere = this;
    allc.forEach(function  (cn) {
      var cp = cn[1];
      var y = Math.abs(cp.y);
      if (y < besty) {
        sb.center = cp;
        if (!thisHere.subjectIntersects()) {
          besty = y;
          bestc = cp;
        }
      }
    });
    sb.center = dp;
      
    return bestc;
   
  }
  
  
  geom.CircleSet.dropVertically = function () {
    // first, if the subject has no interesections, just leave it
    if (!this.subjectIntersects()) {
      return 
    }
    var sb = this.subject;
    var d0 = this.dropVertically1(1);
    var d1 = this.dropVertically1(-1);
    sb.center = (Math.abs(d0.y) < Math.abs(d1.y))?d0:d1;
  }
    
      
  geom.CircleSet.dropRandom = function () {
     var vc = geom.Point.mk(-0.5 + Math.random(),-0.5 + Math.random()).normalize();
     return vc.times(1000);

  }
  
  
  geom.CCirclesSortFrom = function (crcs,dc) {
    function compare(c0,c1) {
      var p0 = c0.dataPoint();
      var p1 = c1.dataPoint();
      var dst0 = p0.distance(dc);
      var dst1 = p1.distance(dc);
      return (dst0<dst1)?-1:1;
      //code
    }
    crcs.sort(compare);
  }
  
  geom.CircleSet.sortByRadius  = function () {
    var crcs = this.allCircles;
    function compare(c0,c1) {
      return (c0.radius < c1.radius)?1:-1;
    }
    crcs.sort(compare);
  }
  
  geom.CircleSet.assignValueIndices = function () {
    this.sortByRadius();
    var crcs = this.circles;
    var ln = crcs.length;
    for (var i=0;i<ln;i++) {
      var crc = crcs[i];
      crc.valueIndex = i;
    }
    this.setIndices();
  }
    
    
  
   geom.CircleSet.sortByX = function (d) {
    function compare(c0,c1) {
      var p0 = c0.dataPoint();
      var p1 = c1.dataPoint();
      var rs = (p0.x < p1.x)?-1:1;
      return d?rs:-rs;
      //code
    }
    this.allCircles.sort(compare);
    this.setIndices();

  }
  
  
   geom.CircleSet.sortByY = function (d) {
    function compare(c0,c1) {
      var p0 = c0.dataPoint();
      var p1 = c1.dataPoint();
      var rs = (p0.y < p1.y)?-1:1;
      return d?rs:-rs;
      //code
    }
    this.allCircles.sort(compare);
        this.setIndices();

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
  
  
  geom.CircleSet.findCaption = function (cap) {
    var crcs = this.allCircles;
    var ln = crcs.length;
    for (var i=0;i<ln;i++) {
      var c = crcs[i];
      if (c.caption === cap) {
        return c;
      }
    }
  }
  
   // bubble arrangement
  // shapes contain circles at relative path pth
   // in each step
  // a new circle becomes the subject, is moved way out yonder, then back into contact
 
  // this is set up as a sequence of steps with timeouts, so that it can be animated
  // But this is also a good scheme for an algorithm that takes a while
  geom.logTimeEnabled = 0;
  geom.logTime = function (msg,tm) {
    if (!geom.logTimeEnabled) return;
    var ctm = Date.now();
    console.log(msg + " took "+Math.floor(ctm-tm)+" Milliseconds ");
    return ctm;
  }
  geom.CircleSet.show = function(cb,fit,all) {
    if (this.disableShow)  {
      if (cb) cb();
      return;
    }
    var tm = Date.now();
    this.install(all);
    var sofar = this.sofar;
    tm = geom.logTime("install",tm);
   // __pj__.draw.fit();
   //   tm = geom.logTime("fit",tm);
   if (0 && fit) __pj__.draw.fit();//1,1);
    svg.refresh();
    geom.logTime("refrseh",tm);
    if (cb) {
      setTimeout(cb,0);//(sofar>35)?1000:100);
    }

  }
  geom.arrangeGeoStep0 = function (cs) {
    var tm = Date.now();
   // var cs = geom.theCset;
    var sofar = cs.sofar;
    var circles = cs.allCircles.slice(0,sofar);
    cs.circles = circles;
    cs.subject = cs.allCircles[sofar];
    cs.contact = undefined;
    var csf = cs.closestInSofar();
  //  var ofrm = csf.length?cs.centerCircleOf(csf):cs.nearest();
    var ofrm = csf.length?csf:[cs.nearest()];
    //var ofrm  = cs.nearest();
    cs.moveOutwards(ofrm); // move subject outwards if needed
  
    geom.logTime("Step0",tm);
    cs.show(function () {geom.arrangeGeoStep1(cs);});
  }
  
  geom.arrangeGeoStep1 = function (cs) {
    var tm = Date.now();
   // var cs = geom.theCset;
    
        geom.logTime("Step1",tm);

    cs.moveToNearest();// bring into contact with one circle
    cs.show(function () {geom.arrangeGeoStep2(cs);});
  }
  
  geom.arrange0Step = function (cs) {
    var tm = Date.now();
    var prevsb = cs.subject;
    var sofar = cs.sofar;
    var circles = cs.allCircles.slice(0,sofar);
    cs.circles = circles;
    var sb = cs.subject = cs.allCircles[sofar];
    if (sofar === 1) {
      var nxtp = geom.Point.mk(-1000,0);
    } else {
      var psbc = prevsb.center;
      var r = prevsb.radius;
      // drop the next fellow just clockwise
      var nxtp = psbc.plus(psbc.normal().normalize().times(r*1.5)).normalize().times(400);
      //var cAngle = Math.atan2(psbc.y,psbc.x);
      //var nxta = cAngle +  Math.PI/4.3;
      //nxtp = geom.Point.mk(1000*Math.cos(nxta),1000*Math.sin(nxta));
    }
    cs.dropFrom(nxtp);
    cs.moveAlongContact(100);
    var sofar = sofar + 1;
    if (sofar < cs.allCircles.length) {
       cs.sofar = sofar;
       cs.show(function () {geom.arrange0Step(cs)});
    } else {
      //done
      om.tlog("FINISHED ARRANGEMENT");
      cs.disableShow = 0;
      cs.show();
    }
  }
  
  
   geom.arrange0 = function (bubbleSet) {
    om.tlog("STARTING ARRANGEMENT");
   __pj__.draw.mainCanvas.fitFactor = 0.5;
    var ms = bubbleSet.bubbles;
    
    var cs = geom.CircleSet.mkFromMarkSet(ms);
    geom.theCset = cs;
    cs.bubbleSet = bubbleSet;
    cs.setFromData1();
    cs.setScale2(100);
    cs.setDomainBounds();
    cs.sortByRadius();
    cs.toInitialPositions0();
    cs.show(null,1,1);
    cs.disableShow = 1;
    geom.arrange0Step(cs);
   }
  
  geom.arrange1Step = function (cs) {
    var tm = Date.now();
    //var cs = geom.theCset;
    var sofar = cs.sofar;
    var circles = cs.allCircles.slice(0,sofar);
    cs.circles = circles;
    cs.subject = cs.allCircles[sofar];
    cs.dropVertically();
    var sofar = sofar + 1;
    if (sofar < cs.allCircles.length) {
       cs.sofar = sofar;
       cs.show(function () {geom.arrange1Step(cs)});
    } else {
      //done
      var xad = cs.xaxisDilation;
      if (0&&xad) {
        cs.allCircles.forEach(function (c) {
          var sh = c.shape;
          var crad = sh.radius;
          sh.setRadius(crad/xad);
        });
      }
      om.tlog("FINISHED ARRANGEMENT");
      cs.disableShow = 0;
      cs.show();
    }
  }
  
  geom.arrange1 = function (bubbleSet,xaxisDilation) {
    om.tlog("STARTING ARRANGEMENT");
   //  __pj__.draw.mainCanvas.fitFactor = 0.5;
    var ms = bubbleSet.bubbles;
    
    var cs = geom.CircleSet.mkFromMarkSet(ms);
    cs.xaxisDilation = xaxisDilation;
    geom.theCset = cs;
    cs.bubbleSet = bubbleSet;
    cs.setFromData1();
    cs.setScale2(100);
    cs.setDomainBounds();
    cs.sortByRadius();
    //cs.toInitialPositions1();
    cs.show(null,1,1);
    cs.disableShow = 1;
    geom.arrange1Step(cs);
   }
  
  __pj__.page.customUIaction = function () {
    var shapes = p.om.root.bubbles.marks;
    var ln = shapes.length;
    var num = 50;
    for (var i=num;i<ln;i++) shapes[i].hide();
    p.geom.arrange1(p.om.root,shapes.slice(0,num),['circle']);
        
  }
  
  
  geom.arrangeInGrid = function (bubbleSet) {
    debugger;
    __pj__.draw.mainCanvas.fitFactor = 0.5;
    var ms = bubbleSet.bubbles;
    var cs = geom.CircleSet.mkFromMarkSet(ms);

    cs.assignValueIndices();// sorts by radius
    debugger;
    geom.theCset = cs;
    cs.bubbleSet = bubbleSet;
    //cs.setFromData();
    cs.setScale2(50);
    
    //p.om.root.update();
    var crcs = cs.circles = cs.allCircles;
     var sumR = 0;
    var  ln = crcs.length;
    crcs.forEach(function (c) {
      sumR += c.radius;
    });
    // shoot for rows of width sumR/count
    var rowwd = (2*sumR)/Math.sqrt(ln);
    // now fill the rows
    var cx = cy = cht = 0;
    var cci = 0;//index of current circle
    var cwd = 0; // width of row so far
    while (true) {
      if (cci == ln) {
        break;
      }
      var cc = crcs[cci];
      var cr = cc.radius;
      if (cwd === 0) {// new row
        cx = 0;
        cy = cy + cr;
        cht = cr;
        cwd = cr;
      } else {
        cx = cwd + cr;
      }
      cc.center = geom.Point.mk(cx,cy);
      if ((cx + cr)>rowwd){ // new row
        cwd = 0;
        cy = cy +  cht;
      } else {
        cwd = cx + cr;
      }
      cci++;
    }
    cs.show(null,1,1);

  }
  
  
  geom.CircleSet.install = function (all,useData) {
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
      var sh = c.shape;
      sh.show();
      if (useData) {
        alert("UNEXPECCTED IN circleset.install");
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
    }
    for (var i=ln;i<aln;i++) {
      var c = this.allCircles[i];
      c.shape.hide();
    }
    if (!all) crcs.pop();
  }
 
  })(prototypeJungle);
