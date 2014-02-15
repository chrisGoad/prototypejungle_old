
  geom.CircleSet.computeClosest1 = function (c,n) { // compute distances from c to the other circles, as [ocIndex,ocDistance]
    om.error(8,'geo');
    var rs = [];
    this.allCircles.forEach(function (oc) {
      if (oc === c) return;
      var d = c.originalCenter.distance(oc.originalCenter);
      rs.push([oc.index,d]);
    });
    rs.sort(function (c0,c1) {return c0[1]>c1[1]?1:-1});
    var crs = [];
    var nm = Math.min(rs.length,n);
    for (var i=0;i<nm;i++) {
      crs.push(rs[i][0]);
    }
    c.closest = crs;
    return crs;
  }
  
  
  geom.CircleSet.computeClosest = function (n) {
    om.error(10,'geo');
    var thisHere = this;
    this.allCircles.forEach(function (c) {
      thisHere.computeClosest1(c,n);
    });
  }
  
   geom.CircleSet.closestInSofar = function () {
    om.error(8,'geo');
    var closest0 = om.arrayToObject(this.subject.closest)
    var rs = [];
    this.circles.forEach(function (c) {
      if (closest0[c.index]) {
        rs.push(c);
      }
    });
    return rs;
  }
  
  geom.CircleSet.cg = function (crcs,original) { // center of gravity
    om.error(9,'geo');
    var ln = crcs.length;
    var ax = 0;
    var ay = 0;
    for (var i=0;i<ln;i++) {
      var c = crcs[i];
      var dtp = original?c.originalCenter:c.center;
      ax = ax + dtp.x;
      ay = ay + dtp.y;
    }
    var rs = geom.Point.mk(ax/ln,ay/ln);
    return rs;
  }
  
  
      
  
  geom.CircleSet.nearest = function (exclusions) { // find the n nearest circles to the subject, excluding the contact, and exclusions
    om.error(8,'geo');
    var contact = this.contact;
    if (exclusions) {
      var excl = function (c) {
        return ((c===contact) || exclusions[c.index]);
      }
    } else {
      excl = function (c) {return c===contact;}
    }
    var subject = this.subject;
    return geom.findMinimal(this.circles,function (c) { return c.distance(subject);},excl)[0];
  }
  
     
      
  // does the subject intersect some member of circles?
  geom.CircleSet.collision = function () {
    om.error(8,'geo');
    var ln = this.circles.length;
    var subject = this.subject;
    var p = subject.center;
    for (var i=0;i<ln;i++) {
      var c = this.circles[i];
      if (c ===  subject) continue;
      if (subject.intersects(c)) {
        //console.log(subject.caption,"COLLIDES WITH",c.caption);
        return c;
      }
    }
  }
  
   // exclude the contact
  geom.CircleSet.circlesWithin = function (s,d,except) {
    om.error(8,'geo');
    var circles = this.circles;
    var ln = circles.length;
    var rs = [];
    for (var i=0;i<ln;i++) {
      var c = circles[i];
      if ((c===s)||(c===except)) continue;
      var cd = c.distance(s);
      if (cd < d) {
        rs.push(c);
      }
    }
    return rs;
  }
    
    
  geom.CircleSet.nearestContactAlongVector = function (v) {
    om.error(9,'geo');
    var tm = Date.now();
    var dsf = Infinity;
    var sb = this.subject;
    var sbc = sb.center;
    var rs;
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
        var d=c.distance(sb); // first use a simple test.
        if (d<dsf) {
          var intr = c.vectorIntersect(v,sb.radius);
          var i0 = intr[0];
          var dst  = v.distanceAlong(i0);
          if (dst < dsf) {
            dsf = dst;
            rs = [c,i0];
          }
        }
      }
    });
    geom.logTime("nearestContactAlongVector",tm);
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
  
   geom.CircleSet.moveAlongContact = function  (maxAngDiff) {
    om.error('geo');
    this.show();
    var tm = Date.now();
    // Edge case: if there is only one circle placed so far, and this is the contact, already done
    var isContact = typeof (this.contact) === "object";
    if (!this.contact) return;
    if (this.circles.length === 1) return;
    var subject = this.subject;
    
    var sc = subject.center;
    if (subject.caption ==="WA") {
      debugger;
    }
   
    //problem: to bring the subject into contact with the nearest circle other than the , while maintaining contact with "contact"
    // Suppose N is the circle with which we wish contact.  Let h be the radius of S the subject.
    // Then the contact point c is the intersection of the circle N blown up by h, and C blown up by h.
    // How do we choose N? The candidates are those at distance less than 2*S.radius from C.
    // Among these candidates, the closes to S must surely be the right one, though I don' have a proof.
    
    
    // a trig problem; find the point to put subject at which will contact both the existing contact, and cn
      // dont allow moving the fellow around its original contact by more than maxAngDiff
      // However, if the nearest is not itself in contact with the contact too, just leave the subject where it is.
      
    var contact = this.contact;

    var candidates = this.circlesWithin(contact,2*subject.radius,subject);
    var ang = Math.atan2(sc.y,sc.x);
    
    var nearestp = geom.findMinimal(candidates,function (c) {
      return subject.distance(c)});
    if (!nearestp) return;
    var nearest = nearestp[0];
    var nc = nearest.center;
    var crad = contact.radius;
    var nrad = nearest.radius;
    var h = subject.radius;
    contact.radius = crad + h;
    nearest.radius = nrad + h;
    var intr = contact.intersection(nearest);
    if (intr.length==1) {
      var cp = intr[0]; // contact point
    } else {
      var cp0 = intr[0];
      var cp1 = intr[1];
      var d0 = cp0.distance(subject.center);
      var d1 = cp1.distance(subject.center);
      cp = (d0<d1)?cp0:cp1;
     // this.indicator.translate(cp);
     // this.indicator.show();
      this.show();
    }
     contact.radius = crad;
    nearest.radius = nrad;

    // now we have the contact point. We need to back out to the new center for the subject
    var vc = cp.difference(nearest.center).normalize();
    var ncnt = nearest.center.plus(vc.times(nearest.radius + subject.radius));
    // ok now see what angle of move this entails
    var cc = contact.center;
    var cvec = subject.center.difference(cc); //the current vector from contact
    var nvec = ncnt.difference(cc); // the proposed new vector
    var cAng = Math.atan2(cvec.y,cvec.x);
    var nAng = Math.atan2(nvec.y,nvec.x);
    var angDiff = Math.abs(geom.standardizeAngle(cAng - nAng));
    var angDiffD = geom.radiansToDegrees(angDiff);
    //console.log("Angle diff",angDiffD);
    if (angDiffD < maxAngDiff) {
      subject.center = ncnt;
    }
    this.show();
    return;
    var c1fi = geom.CCircle.mk(nearest.radius + subject.radius,nc);
    var c2fi = geom.CCircle.mk(contact.radius + subject.radius,contact.center);
    var ints = c1fi.intersection(c2fi);
    var d0 = sc.distance(ints[0]);
    var d1 = sc.distance(ints[1]);
    var cint = (d0<d1)?ints[0]:ints[1]; // choose the closer of the intersections
    var cvec = cc.difference(sc); // the current vector from contact
    var nvec = cc.difference(cint);
    var cAng = Math.atan2(cvec.y,cvec.x);
    var nAng = Math.atan2(nvec.y,nvec.x);
    var angDiff = Math.abs(geom.standardizeAngle(cAng - nAng));
    var angDiffD = geom.radiansToDegrees(angDiff);
    //console.log("Angle diff",angDiffD);
    if (angDiffD < maxAngDiff) {
      var svc = subject.center;
      subject.center = cint; // ok now the subject is in contact with nearest and contact. If it bumps into anyone else, no good
      if (this.collision()) {
        subject.center = svc;
      }
    }
    var etm = Math.floor(Date.now() - tm);
    //console.log("MovetoNearest took ",etm," milliseconds");
    this.show();
    return;
  }
   // where does the subject first contact circle c along dir
  
    
  geom.CircleSet.moveToNearest= function  () {
    om.error('geo');
    var tm = Date.now();
    // Edge case: if there is only one circle placed so far, and this is the contact, already done
    var subject = this.subject;
    var dir = subject.directionToMoveAlong;
    var sc = subject.center;
    if (dir) {
      var nc = this.nearestContactAlongVector(geom.Vector.mk(subject.center,dir));
      if (nc) {
        var nearest = nc[0];
      } else {
        nearest = this.nearest();
      }
      var cp = nc[1];//contact point
      var vec2contact = geom.Vector.mk(nearest.center,cp.difference(nearest.center).normalize())
      subject.center =  vec2contact.along(subject.radius + nearest.radius);
      this.contact = nearest;
      //this.show(null,1);
      
      //this.moveIntoContactAlongDir(nearest,dir);
      return;
    }
    var nearest = this.nearest();
    var nc = nearest.center;
    var v = sc.difference(nc).normalize();
    var rsc = nc.plus(v.times(subject.radius + nearest.radius));
    //var dst = rsc.distance(sc);
    subject.center = rsc;
    this.contact = nearest;
  }
        
        
  geom.CircleSet.setScale = function () {
    om.error(1,'geo');
    debugger;
    var r = this.radius();
  
    var a = this.area();
    // with tight packing the area should be something more than pi*r*r.
    // if the radii of each circle were scaled by s, then the cummulative area of the circles would be s*s*a
    // So we want s*s*a = scaleFactor * pi * r * r;
    // s = sqrut((scaleFactor * pi * r * r)/a);
    
    var scaleFactor = 0.05;
    var rs = Math.sqrt((scaleFactor * Math.PI * r * r)/a);
    this.radiusScale = rs; // meaning that all of the radii are scaled from the data by this
    this.allCircles.forEach(function (c) {
      c.radius = rs * c.radius;
    });
    var na = this.area();//for debugging
    
    return rs;
  }
  
  // moves the subject out to where it does not intersect any other circle.
  // Algorithm is primitive: if it intersects with any of the target set, move it out along the vector to the center
  // a long way, ow, leave it alonef
  
  // algorithm. Find the nearest neighbor to the subject. Take the original vector from that neighbor and
  // go outwards on that vector from its current position
  
  geom.CircleSet.moveOutwards  = function (n) {
    var outby = 200;
    //console.log("outby ",outby);
    var sb = this.subject;
    
    //var n = this.nearest();
    var sbo = sb.originalCenter;
    //var no = n.originalCenter;
    var no = this.cg(n,1); //  original center of gravity
    var vc = sbo.difference(no).normalize();
    //var ncnt = n.center.plus(vc.times(outby));
    var ncnt = this.cg(n).plus(vc.times(outby));
    sb.center = ncnt;
    sb.directionToMoveAlong = vc.minus();
    return;
    
  }
  
  // the  biggest circle is normalized at radius 50;
  // choose x and y coords of the bubbles to vary from 0 to 1000
  
  geom.CircleSet.toInitialPositionsGeo = function () {
    om.error(4,'geo');
    var bnds = this.geoBounds;
    var crn = bnds.corner;
    var xt = bnds.extent;
    var d = this.markSet.data;
    debugger;
    var latf = d.fieldIndex('latitude');
    var lngf  = d.fieldIndex('longitude');
    this.allCircles.forEach(function (c) {
      var d = c.shape.data;
      var lat = d[latf];//d.getDataField("latitude");
      var lng = d[lngf];//.getDataField("longitude");
      var x = 1000* (lng - (crn.x))/(xt.x);
      var y = 1000 * (1 - (lat - (crn.y))/(xt.y));// graphics y runs downwards
      c.center = c.originalCenter = geom.Point.mk(x,y);
    });
  }
    
    
    
  geom.CircleSet.sortFromCenter = function () {
    om.error(88,'geo');
    var dc = this.dataCenter;
    function compare(c0,c1) {
      var p0 = c0.center;
      var p1 = c1.center;
      var dst0 = p0.distance(dc);
      var dst1 = p1.distance(dc);
      return (dst0<dst1)?-1:1;
      //code
    }
    this.allCircles.sort(compare);
    this.setIndices();

  }
  
  
  geom.arrangeGeoStep2 = function (cs) {
    om.error(6,'geo');
    var tm = Date.now();
    //var cs = geom.theCset;
    var maxAngDiff = 60;
    cs.moveAlongContact(maxAngDiff); //bring into contact with two
    var sofar = cs.sofar + 1;
            geom.logTime("Step2",tm);

    if (sofar < cs.allCircles.length) {
       cs.sofar = sofar;
       cs.show(function () {geom.arrangeGeoStep0(cs)});
    } else {
      cs.computeDataCenter();
      om.tlog("Arrangement done");
      console.log("Center After",cs.dataCenter);
      cs.disableShow = 0;
      cs.show();
    }
  }
  /*
  geom.arrange0 = function (shapes,path,drop) {
    function show(all) { // for debugging
       circleSet.install(all);
      __pj__.draw.fit();
      __pj__.draw.refresh();
     // debugger;
    }
    var sofar = 1;
  //  debugger;
    
    var allCircles = geom.shapesToCCircles(shapes,path);
    var dc = geom.CCirclesDataCenter(allCircles);
    geom.CCirclesSortFrom(allCircles,dc);
    
    var ln = shapes.length;
    while (sofar <= ln) {
      var tm = Date.now();
      var circles = allCircles.slice(0,sofar);
      
      var circleSet = geom.CircleSet.mk(sofar,circles,allCircles);
      circleSet.dataCenter = dc;
      var dr = drop.call(circleSet);
      var etm = Math.floor(Date.now()-tm);
      console.log("STAGE 1 ",sofar,etm);
      circleSet.moveSubjectTo(dr);
      var etm = Math.floor(Date.now()-tm);
      console.log("STAGE 2 ",sofar,etm);
    
      var maxAngDiff = 45;//(sofar < 8)?60:90;
     // show();
      circleSet.moveToNearest();// bring into contact with one circle
     // show();
      circleSet.moveToNearest(maxAngDiff); //bring into contact with two
      sofar ++;
      //show();
    }// and another
    circleSet.install();
    show();

  }
  */
 
    
    
   geom.geoArrange = function (bubbleSet) {
    om.error(7,'geo');
    om.tlog("Starting arrangement");
    /*
    var bigStates = 0;
    var cs = geom.theCset.prune(function (c) {
      vi = c.valueIndex;
      return bigStates?vi < 16:vi >= (50 - 16);
    })
    geom.theCset = cs;
    */
    var ms = bubbleSet.bubbles;
    var cs = geom.CircleSet.mkFromMarkSet(ms);

    cs.assignValueIndices();// sorts by radius
    geom.theCset = cs;
    cs.bubbleSet = bubbleSet;
    //cs.setFromData();
    cs.setScale2(50);
    
    //var cs = geom.theCset;
    
    
    //cs.setFromData();
   // cs.setScale2(50);
    cs.setGeoBounds();
    cs.computeDataCenter();
    console.log("Center Before",cs.dataCenter);

    cs.toInitialPositionsGeo();
    cs.show(null,1,1);
    geom.theCset = cs;
    cs.computeDataCenter();
    //rs.dataCenter = rs.findCaption('NY').center;
    //cs.shapes = shapes;
    //cs.computeClosest();
    cs.sortFromCenter();
    cs.subject = cs.allCircles[0];
    //rs.sortByY(0);
    cs.disableShow = 1;
    cs.computeClosest(10);
    
    geom.arrangeGeoStep0(cs);
   }
  // assumes shape is mark set with things at its marks positioned by translation, and with a radius transform
  // looks for the bubble that contains the current
  svg.shape.bubbleHover = function (pnt,indc) {
    om.error(8,"geo");
    var tpnt = this.toLocalCoords(pnt);
    var chv = this.__nowHovered__;
    var shps = this.marks;
    var ln = shps.length;
    for (var i=0;i<ln;i++) {
      var s = shps[i];
      var trns = s.transform;
      if (trns) {
        var tr = trns.translation;
      } else {
        tr = geom.Point.mk();
      }
      var r = s.radius * s.scale;
      if (tpnt.distance(tr)<r) {
        if (chv === s) {
          //console.log('no change');
        } else {
          if (chv) {
            chv.forUnhover();
          }
          if (indc) {
            indc.e0.x = tr.x;
            indc.e1.x = tr.x;
           // indc.e0.y = tr.y+50;
          }
          //__pj__.draw.mainCanvas.surrounders = s.computeSurrounders(1000);
          s.forHover();      
         // console.log('new hover ',s.data.getDataField("caption"));
          this.__nowHovered__ = s;
        }
        return;
      }
    }
    ////.log("Nothing hovered");
    if (chv) {
      this.__nowHovered__ = undefined;
      chv.forUnhover();
    }
  }
  
  svg.shape.bubbleUnhover = function () {
    var hv = this.__nowHovered__;
    if (hv) {
      hv.forUnhover();
    }
    this.__nowHovered__ = undefined;
  }
 
  
  
  