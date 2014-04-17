/
  /* yet another bubble algorithm.  Shrink or distribute circles so that nothing is in contact. Then grow everybody according to
   * the following rules: at any time there will be connected sets: clicques in the contact graph. For each of these, grow it
   * around its center of gravity (taking areas into account). Always grow until the next contact, and then a bigger clique is formed
   * To figure out what the next contact will be: in a clique, each circle has a "grow vector". The vector along which it's center moves
   * when growing. This is just the vector from the center of gravity. There is also the grow speed. How far the circle center will move
   * with a given expansion factor, divided by that factor. This grow speed is just the distance to the cg. These don't change except
   * when a new clique is formed. For each circle we also maintain the identity of its nearest contact. This is a bit complicated:
   *  for every other circle, we compute the contact point and time for our taget circle, with the opposite of the grow vector added to its own.
   */
   
  geom.Cluster = {};
  
  geom.Cluster.mk = function (members) {
    var rs = Object.create(geom.Cluster);
    rs.members = members;
    members.forEach(function (m) {
      m.cluster = rs;
    });
    rs.children = [];
    return rs;
  }
  
  geom.ClusterSet = {};
  
  geom.ClusterSet.mk = function (circles) {
    var rs = Object.create(geom.ClusterSet);
    rs.clusters = [];

    rs.circles = circles;
    var n = circles.length;
    for (var i=0;i<n;i++) {
      circles[i].index = i;
      var cl = geom.Cluster.mk([circles[i]]);
      rs.clusters.push(cl);
      cl.inSet = rs;
    }
  
    return rs;
  }
  
  geom.CCircle.area = function () {
    var r = this.radius;
    return Math.PI * r * r;
  }
  
  geom.Cluster.computeCg = function () {
    var m = this.members;
    var ln = m.length;
    var pnt = geom.Point.mk();
    m.forEach(function (c) {
      pnt = pnt.plus(c.center);
    });
    var rs = pnt.times(1/ln);
    this.cg = rs;
    return rs;
  }
  
  
  geom.Cluster.computeGrowVector = function (c) {
    c.growVector = c.center.difference(this.cg);
  }
  
  geom.Cluster.update = function () {
    this.computeCg();
    var m = this.members;
    var thisHere = this;
    m.forEach(function (c) {
      thisHere.computeGrowVector(c);
    });
  }
  

  
  // returns the expansion at which c0 and c1 will concact.
  geom.ClusterSet.computeContact = function (c0,c1) {
    var cc0 = c0.center;
    var cc1 = c1.center;
    var c0x = cc0.x;
    var c0y = cc0.y;
    var c1x = cc1.x;
    var c1y = cc1.y;
    var v0 = c0.growVector;
    var v1 = c1.growVector;
    if (!v0 && !v1) {
      var d = cc0.distance(cc1);
      var fc = d/(c0.radius + c1.radius);
      return fc;
    }
    if (!v0) {
      v0 = geom.Point.mk();
    }
    if (!v1) {
      v1 = geom.Point.mk();
    }
    var cx = c1x-c0x;
    var cy = c1y-c0y;
    var v0x = v0.x;
    var v0y = v0.y;
    var v1x = v1.x;
    var v1y = v1.y;
    var bx = v1x - v0x;
    var by = v1y - v1y;
    var dc = c0.radius + c1.radius;
    /* the equeation
     (cx + t*bx)**2 + (cy + t*by)**2 = t*t* dc*dc;
     so for the quadratic equation let
     (cx*cx + 2 * t*bx*cx + t*t*bx*bx) + (cy*cy + 2*t*by*cy + t*t*by*by) = t*t*dc
    */
    var a = bx*bx + by*by;
    var b = 2*(bx*cx + by*cy);
    var c = cx*cx - dc*dc;
    var pom =  b*b - 4*a*c;
    if (pom < 0) return undefined;
    var spom = Math.sqrt(pom);
    var rA = (spom - b)/(4*a);
    var rB = (-spom-b)/(4*a);
    if (rA<0) {
      return (rB<0)?undefined:rB;
    }
    if (rB<0) {
      return (rA<0)?undefined:rA;
    }
    var r = Math.min(rA,rB);
    var nc0 = v0.times(r).plus(cc0); // center for c0 at contact time
    var nc1 = v1.times(r).plus(cc1); // center for c1 at contact time
    var cp = nc1.difference(nc0).times(c0.radius).plus(c0.center); // the contact point
    return r;
  }
    
    
  geom.ClusterSet.computeNearestContact = function (c0) {
    var crcs = this.circles;
    var cv = Infinity;
    var cc;
    var ln = crcs.length;
    for (var i=0;i<ln;i++) {
      var c1 = crcs[i];
      if (c1.cluster === c0.cluster) {
        continue;
      }
      var c1n = c1.nearestContact;
      if (c1n) {
        if (c1n === c0) {
          c0.nearestContact = c1;
          var sc = c0.nearestContactScale = c1.nearestContactScale;
          return cv;
        }
        continue;
      }
      var ce = this.computeContact(c0,c1);
      if (ce === undefined) {
        continue;
      }
      if (ce < cv) {
        cv = ce;
        cc = c1;
      }
    }
    c0.nearestContact = cc;
    c0.nearestContactScale = cv;
    return cv;
  }
  
  geom.Cluster.merge = function (c) {
    // merge cluster c into this
    var tm = this.members;
    var thisHere = this;
    var m = c.members;
    m.forEach(function (c) {
      tm.push(c);
      c.cluster = thisHere;
    });
    var cset  = this.inSet;
    cset.clusters = cset.clusters.filter(function (cl) {return cl !== c;});
  }
  
  
  geom.ClusterSet.computeAllNearestContacts = function () {
    // return the very first contact
    var rs;
    var nsf = Infinity;
    var thisHere = this;
    this.circles.forEach(function (c) {
      var s = thisHere.computeNearestContact(c);
      if (s < nsf) {
        nsf = s;
        rs = c;
      }
    });
    this.nearestContact = rs;
    return rs;
  }
  
  geom.Cluster.scaleBy = function(s) {
    var m = this.members;
    var cg = this.cg;
    m.forEach(function (c) {
      c.radius = c.radius*s;
      var gv = c.growVector;
      if (gv) {
        c.center = cg.plus(gv.times(s));
      }
    });
  }
  
  geom.ClusterSet.scaleBy = function (s) {
    this.clusters.forEach(function (c) {c.scaleBy(s);});
  }
  geom.ClusterSet.step = function () {
    var nc = this.nearestContact;
    var ncs  = nc.nearestContactScale;
    console.log("next step ",nc.caption," scale by ",ncs);
    this.scaleBy(ncs);
    var ncc = nc.nearestContact;
    var cl0 = nc.cluster;
    var cl1 = ncc.cluster;
    cl0.merge(cl1);
    cl0.update();
    this.circles.forEach(function (c) {delete c.nearestContact;});
    this.nearestContact = this.computeAllNearestContacts();
  }
    
    
  // for initialization
  // scale to where all circles are out of contact
  geom.CCircle.scaleNeededForContact = function (c) {
    var rs  = c.radius + this.radius;
    var d = c.center.distance(this.center);
    return d/rs;
  }
  
  geom.ClusterSet.initialScaling = function () {
    var sf = Infinity;
    var crcs = this.circles;
    var ln = crcs.length;
    for (var i=0;i<ln-1;i++) {
      var c0 = crcs[i];
      for (var j=i+1;j<ln;j++) {
        var c1 = crcs[j];
        var s = c0.scaleNeededForContact(c1);
        if (s < sf) {
          sf = s;
        }
      }
    }
    this.scaleBy(sf*0.9);
    return sf;
  
  }
  
  
  geom.ClusterSet.setGeoBounds = function () { // min max longitude, latitude
    var xlb = geom.findMinimum(this.circles,function (c) {return c.shape.__data__.getField("longitude")});
    var xub = geom.findMaximum(this.circles,function (c) {return c.shape.__data__.getField("longitude")});
    var ylb = geom.findMinimum(this.circles,function (c) {return c.shape.__data__.getField("latitude")});
    var yub = geom.findMaximum(this.circles,function (c) {return c.shape.__data__.getField("latitude")});
    return this.geoBounds =  geom.Rectangle.mk({corner:[xlb,ylb],extent:[xub-xlb,yub-ylb]});
  }
  
  geom.ClusterSet.toInitialPositions = function () {
    var bnds = this.geoBounds;
    var crn = bnds.corner;
    var xt = bnds.extent;
    this.circles.forEach(function (c) {
      var d = c.shape.__data__;
      var lat = d.getField("latitude");
      var lng = d.getField("longitude");
      var x = 1000* (lng - (crn.x))/(xt.x);
      var y = 1000 * (1 - (lat - (crn.y))/(xt.y));// graphics y runs downwards
      c.center = c.originalCenter = geom.Point.mk(x,y);
    });
  }
    
    
  geom.ClusterSet.show = function(cb,fit,all) {
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
    if (fit) __pj__.draw.fit();
     __pj__.draw.refresh();
    geom.logTime("refrseh",tm);
    if (cb) {
      setTimeout(cb,0);//(sofar>35)?1000:100);
    }

  }
  
  
   geom.geoArrange = function (bubbleSet) {
    debugger;
    var shapes = bubbleSet.bubbles.marks;
    var ln = shapes.length;
    var crcs = [];
    for (var i=0;i<5;i++) {
      var s = shapes[i];
      var rs = geom.CCircle.mk(s.radius,geom.Point.mk());
      rs.caption = s.__data__.getField("caption");
      rs.shape = s;
      rs.index = i;
      crcs.push(rs);
    }
    for (i=5;i<ln;i++) {
      shapes[i].hide();
      //code
    }
    var cs = geom.ClusterSet.mk(crcs);
    cs.bubbleSet = bubbleSet;

    //cs.setFromData();
    //cs.setScale2(50);
    cs.setGeoBounds();
    cs.toInitialPositions();
    cs.show(null,1,1);
    bubbleSet.bubbleP.scale = 1;

    cs.initialScaling();
     cs.show(null,1,1);
    cs.nearestContact = cs.computeAllNearestContacts();
    for (var i=0;i<3;i++) {
      cs.step();
      cs.show(null,1,1);
    }
    
    debugger;
   }
  
  
  geom.ClusterSet.install = function (all) {
    var crcs = this.circles;
    
    var ln = crcs.length;
    for (var i=0;i<ln;i++) {
      var c = crcs[i];
      c.shape.setRadius(c.radius);
      //c.shape.setRac.radius);
      c.shape.show();
      c.shape.translate(c.center);
      var dt = c.shape.data;
    }
  }
  
  })(prototypeJungle);
