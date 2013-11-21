
/*
 notes on lampba
 
 lambda(<var name>,<type>,<body>)
 
 then om.var.mk
*/
(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  // circles are represented by {center:,radius} ; need not be DNodes
  // A cluster is a set of circles which are a connected subgraph of the "collides with" rwlation.
  // A ClusterContact is a pair of two clusters, and the two circles within the clusters that are in contact.
  // For each circle, its cluster, and the set of circles with which it collides is maintaine.
  
  //Initialization. We need to blow up all circles until there is just one cluster.
  // One way to do this is make sure that every circle is in contact with the largest circle.
  // Let the largest circle be L. To blow up C to be in contact, by scale s, we have s * C.radis + s*L.radius =  C.distance(L);
  // For each C, there is an s. Choose the largest s.
  
  // Now there is just one cluster.
  //inititialize the collision sets.
  
  // The algorithm proceeds by sequential shrinks, while maintaining contact. At each stage.
  // A Cluster has a parent and children, and theses are all  specified by ClusterContact.  
  // basic operations: shrink. Shrink all circles until two that used to be in collision are now in tangential contact.
  
  // Check if removal of this edge from collision graph bifurcates the cluster. containing the two circles.
  // If not, shrink again until a bifuraction takes place.
  
  // At this point, the data structure changes in the following way: if the cluster is the root cluster, choose one of the new children
  // as the root (it doesn't matter which). Otherwise, the parent remains what it was, and the two new parts become its child and grand child.
  // depending on which cluster the contact circle to the parent belongs two.
  // 
  
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
    var cl = geom.Cluster.mk(circles);
    rs.clusters = [cl];
    cl.inSet = rs;
    cl.index = 0;
    rs.circles = circles;
    var n = circles.length;
    for (var i=0;i<n;i++) {
      circles[i].index = i;
    }
    rs.scale = 1;
    rs.tree = {node:0,children:[]};
    cl.treeNode = rs.tree;
    return rs;
  }
    
  
  geom.CCircle.scaleForContact = function (c) {
    var d = this.center.distance(c.center);
    var rs = d/(this.radius + c.radius);
    return rs;
  }
  
  geom.ClusterSet.scaleBy = function (s) {
    this.circles.forEach(function (c) {
      c.radius = s*c.radius;
    });
  }
  
  
  geom.findMinimal = function (a,fn) {
    var sf = Infinity;
    var rs;
    a.forEach(function (m) {
      var v = fn(m);
      if (v<sf) {
        sf = v;
        rs = m;
      }
    });
    return [rs,sf];
  }
  
  geom.findMaximal = function (a,fn) {
    var sf = -Infinity;
    var rs;
    a.forEach(function (m) {
      var v = fn(m);
      if (v>sf) {
        sf = v;
        rs = m;
      }
    });
    return [rs,sf];
  }
     
  geom.ClusterSet.setInitialScale = function (s) {
    var largest = geom.findMaximal(this.circles,function (c) {return c.radius;})[0];
    var needsLargestScale = geom.findMaximal(this.circles,function (c) {return largest.scaleForContact(c);});
    //var isc = largest.scaleForContact(needsLargestScale);
    this.scale = needsLargestScale[1];
  }
  
  geom.ClusterSet.findCaption = function (cap) {
    var rs = this.circles.filter(function (c) {return c.caption === cap});
    if (rs.length) return rs[0]
  }
  
  geom.ClusterSet.maxX = function () {
    return geom.findMaximal(this.circles,function (c) {return c.center.x})[1];
  }
  
    
  geom.ClusterSet.minX= function () {
    return geom.findMinimal(this.circles,function (c) {return c.center.x})[1];
  }
  
  
  
  geom.ClusterSet.maxY = function () {
    return geom.findMaximal(this.circles,function (c) {return c.center.y})[1];
  }
  
    
  geom.ClusterSet.minY= function () {
    return geom.findMinimal(this.circles,function (c) {return c.center.y})[1];
  }
  
  
  geom.ClusterSet.bounds = function () {
    var minx=this.minX();
    var maxx = this.maxX();
    var miny = this.minY();
    var maxy = this.maxY();
    var crn = geom.Point.mk(minx,miny);
    var xt = geom.Point.mk(maxx-minx,maxy-miny);
    return geom.Rectangle.mk({corner:crn,extent:xt});
    
  }
  
  
  geom.ClusterSet.ccomputeCollisions = function (i) {
    // this algoritm could be improved.
    var ln = this.circles.length;
    var ci = this.circles[i];
    var sc = this.scale;
    for (j=i+1;j<ln;j++) {
       var cj = this.circles[j];
       var dst = ci.center.distance(cj.center);
       if (dst <  sc*(ci.radius + cj.radius)) {
        ci.collisions.push(j);
        cj.collisions.push(i);
       }
    }
  }
  
  geom.ClusterSet.computeCollisions = function () {
    this.circles.forEach(function (c) {c.collisions = []});
    var ln = this.circles.length;
    for (var i=0;i<(ln-1);i++) {
      this.ccomputeCollisions(i);
    }
  }
  
  // recompute collisions for a recuded scale
  
  geom.ClusterSet.crecomputeCollisions = function (ci,sc) {
    // this algoritm could be improved.
    var  circles = this.circles;
    var cls = ci.collisions;
    var newcls = cls.filter(function (j) {
      var cj = circles[j];
      var dst = ci.center.distance(cj.center);
      return (dst <  sc*(ci.radius + cj.radius));
    });
    ci.collisions = newcls;
  }
  
  geom.ClusterSet.removeCollision = function (i,j) {
    var ci = this.circles[i];
    var cj = this.circles[j];
    ci.collisions = ci.collisions.filter(function (m) {return m!==j});
    cj.collisions = cj.collisions.filter(function (m) {return m!==i});
  }    
    
  geom.Cluster.recomputeCollisions = function (sc) {
    var cs = this.inSet;
    this.members.forEach(function (c) {cs.crecomputeCollisions(c,sc);});
  }    
  
  geom.initialClusterSet = function (shapes,circlePath) {//circlePath is the path to the circle from the enclosing shape
    var circles = geom.shapesToCCircles(shapes,circlePath);
    circles.forEach(function (c) {c.setFromData()});
    var rs = geom.ClusterSet.mk(circles);
    rs.circlePath = circlePath;
    rs.setInitialScale();
    rs.computeCollisions();

    return rs;
  }

  
  geom.initialClusterSet00 = function (circles) {
    debugger;
    var icl = geom.Cluster.mk(circles);
    var rs = geom.ClusterSet.mk(icl,circles);
    rs.setInitialScale();
    rs.computeCollisions();
    return rs;
  }
  
  geom.Cluster.computeSplitScale = function () { // the maximum scale at which some two now colliding circles would be in contact instead
    var m  = this.members;
    var circles = this.inSet.circles;
    var ln = m.length;
    var maxcs = 0;
    var rs;
    for (var k=0;k<ln-1;k++){
      var ci = m[k];
      var i = ci.index;
      
      var icenter = ci.center;
      var ir = ci.radius;
      var cl = ci.collisions;
      cl.forEach(function (j) {
        //var exi = excludes[i];
        //if (exi && exi[j]) return;
        var jc = circles[j];
        var dst = icenter.distance(jc.center);
        var jr = jc.radius;
        var csc = dst/(ir + jr);
        if (csc > maxcs) {
          maxcs = csc;
          rs = [i,j];
        }
      });
    }
    this.splitScale = maxcs;
    this.splitPair = rs;
  }
  
  geom.Cluster.showSplitPair = function () {
    var sp = this.splitPair;
    var cs = this.inSet;
    cs.showOnly(sp);
  }
    
  
    
  
  
  
  geom.Cluster.computeReachables = function (sp) {
    var reachable  = {};
    reachable[sp] = 1;
    var circles = this.inSet.circles;
    function addToReachable() {
      var fnd  = false;
      for (var ii in reachable) {
        var i = parseInt(ii);
        var ci  = circles[i];
        var cls = ci.collisions;
        var cln = cls.length;
        for (var n = 0;n<cln;n++) {
       
          var j = cls[n];
          //var exi = excludes[i];
          //if (exi && exi[j]) continue;
          if (!reachable[j]) {
            reachable[j] = 1;
            fnd = true;
          }
        }
      }
      return fnd;
    }
    while (addToReachable()) {}
    return reachable;
  }
 
  geom.numKeys = function (o) {
    var rs = 0;
    for (k in o) {
      rs++;
    }
    return rs;
  }
  // if excludes are no longer in contact, is the cluster now bifurcated?
  geom.Cluster.bifurcated = function (excludes) {
    
    var reachable = this.computeReachables(this.members[0].index,excludes);
    
    return geom.numKeys(reachable) < this.members.length;
  }
   
  
  geom.Cluster.computeBifurcateScale = function () { // the scale at which the cluster will first bifurcate
    if (this.members.length === 1) {
      return 0; // ie, cannot be bifurcated
    }
    if (this.bifurcateScale) return this.bifurcateScale; // the bifurcate scale is a property of the cluster, unchanged by other operations
    var circles = this.inSet.circles;
    while (true) {
      this.computeSplitScale();
      var sp = this.splitPair;
      var sc = this.splitScale;
      om.log("bifurcate"," separating ",circles[sp[0]].caption,circles[sp[1]].caption, " at scale ",sc);
      this.inSet.removeCollision(sp[0],sp[1]);
      if (this.bifurcated()) {
         om.log("bifurcate","BIFURCATED");
        this.bifurcateScale = sc;
        return sc;
      }
    }
  }
  
  geom.ClusterSet.computeChildren = function (cl) {
    var cho = {}; // an object which maps indices of clusters to arrays of indices of their children;
    this.clusters.forEach(function (cl) {
      var pr = cl.parent;
      if (pr) {
        var pri = pr[2];
        var chl = cho[pri];
        if (chl) {
          chl.push(cl.index);
        } else {
          cho[pri] = [cl.index];
          //code
        }
      }
    });
    this.clusters.forEach(function (cl) {
      var ch = cho[cl.index];
      cl.children = ch?ch:[];
    })
  }
    
  // if the cluster has a parent link, we want to maintain that
  // the new cluster should be the one which does not contain the parent link
  geom.ClusterSet.splitCluster = function (cl) {
    var clusters = this.clusters;
    var pr = cl.parent;
    var sp = cl.splitPair;
    var sp0 = sp[0];
    if (pr) {
      var sd0 = pr[0];
    } else { //  choose the more populous fellow as parent
      var sd0 = sp[1];
    }
    var circles = this.circles;
    var op0  = cl.computeReachables(sd0);// this will be the set retained in the current cluster
    var p0 = [];
    var sp0inp0 = false;
    for (var k in op0) {
      if (parseInt(k)===sp0) {
        sp0inp0 = true;
      }
      p0.push(circles[parseInt(k)]);
    }
  
    var p1 = [];
    cl.members.forEach(function (m) {
      if (!op0[m.index]) p1.push(m);
    });
    if ((!pr) && (p0.length < Math.floor((cl.members.length)/2))) {
      // make the new cluster the smaller one
      var tmp = p0;
      p0 = p1;
      op0 = {};
      for (var u in p0) op0[u] = 1;
      p1 = tmp;
      sp0inp0 = !sp0inp0;
    }
    var newC = geom.Cluster.mk(p1);
    newC.index = this.clusters.length;
    cl.members = p0;
    cl.bifurcateScale = undefined; // needs recomputation
    
    newC.inSet = this;
    // get the contact pair in the right order
    newC.parent = sp0inp0?[sp[1],sp[0],cl.index]:[sp[0],sp[1],cl.index];
    this.clusters.push(newC);
    //var nd = cl.treeNode;
    //var newNd = {node:newC.index,children:[]}
    //var newCh = newNd.children;
    //var oldCh = nd.children;
    //oldCh.push(newNd);
    //newC.treeNode = newNd;
    // now some of the children of cl might need to be moved over to being children of newC
    //function removeFromArray(a,v) {
   //   return a.filter(function (x) {return x!==v;});
   // }
    cl.children.forEach(function (chi) {
      var ccl = clusters[chi];
      var cpr = ccl.parent;
      // does this attach to cl or newC?
      if (!op0[cpr[1]]) { // not attached to cl, so needs to be moved
        cpr[2] = newC.index;
        //newCh.push(ccl.treeNode);
        //removeFromArray(oldCh,ccl.treeNode);
      }
    });
    this.computeChildren();
    return newC;  
  }
    
  geom.Cluster.tree = function () {
    var ch = this.children;
    var mems = this.members;
    var memcs = mems.map(function (m){return m.caption;});
    var clusters = this.inSet.clusters;
    if (ch.length===0) {
      return memcs;
    } else {
      var rs = {members:memcs};
      var cts = ch.map(function (chi) {
        var cho = clusters[chi];
        return cho.tree();
      });
      rs.children = cts;
    }
    return rs;
  }
 
  //shrink (reduce scale) until we get a bifurcation
  /*
  geom.ClusterSet.shrinkStep = function () {
    var clusters = this.clusters;
    clusters.forEach(function (cl) {cl.excludes = {}});
    // find the cluster with the max scale to get a split
    var nextsc = this.scale;
    clusters.forEach(function (cl) {
      var ss = cl.splitScale();
      
  */
  
  
  
  
  geom.ClusterSet.shrinkStep = function (show) {
    var maxS = geom.findMaximal(this.clusters,function (cl) {
      return cl.computeBifurcateScale();
    });
    var toSplit = maxS[0];
    var ratio = maxS[1]/(this.scale);
    this.scale = maxS[1];
    console.log("SPLITING CLUSTER ",maxS[0].index," at scale ",maxS[1]);
    var newC = this.splitCluster(toSplit);
    var sp = toSplit.splitPair;
    var circles = this.circles; 
    var sides = this.splitAt(newC,toSplit);
    var p0 = circles[sp[0]].center;
    var p1 = circles[sp[1]].center;
    if (show) this.show(1);
    return;
    debugger;
    geom.bringTowardsPoint(sides[0],ratio,p0);
    geom.bringTowardsPoint(sides[1],ratio,p1);
    this.show(1);
  }
  // bring the centers of all circles towards the given fixed point, moving each in by a factor of sc (eg 0.75)
  geom.bringTowardsPoint = function (circles,sc,point) {
    circles.forEach(function (c) {
      var vec = c.center.difference(point);
      var d = vec.length();
      if (d < 0.000001) {
        return;
      }
      var nd = d * sc;
      var n = vec.normalize();
      var nc = point.plus(n.times(nd));
      c.center = nc;
    });
  }
  
  
  geom.Cluster.descendants = function (irs) {
    var clusters = this.inSet.clusters;
    var rs=irs?irs:[];
    rs.push(this);
    this.children.forEach(function (chi) {
      var ch = clusters[chi];
      ch.descendants(rs);
    });
    return rs;
  }
  // cl is the parent of ex, return all of its other descendants,
  geom.Cluster.descendantsExcept = function (ex) {
    var clusters = this.inSet.clusters;
    var ch = this.children;
    var rs = [this];
    ch.forEach(function (chi) {
      var cl = clusters[chi];
      if (cl !== ex) {
        cl.descendants(rs);
      }
    });
    return rs;
  }
  
  // if the tree is split at the cl0,cl1 junction this returns the cl0 side. If cl1 is the parent of cl0,
  // this means the descendants of cl0 and cl0 itself. If cl0 is the parent of cl1, this means cl0, and descendants
  // of siblings other than cl1
  
  geom.ClusterSet.splitAt = function (cl0,cl1) {
    var clusters = this.clusters;
    var pr0 = cl0.parent;
    if (pr0 && (pr0[2] === (cl1.index))) {
      var side0 = cl0.descendants();
      var side1 = cl1.descendantsExcept(cl0);
    } else {
      side0 = cl0.descendantsExcept(cl1);
      side1 = cl1.descendants();
    }
    var crcs0 = [];
    side0.forEach(function (cl) {
      cl.members.forEach(function (m) {crcs0.push(m)});
    });
    var crcs1 = [];
    side1.forEach(function (cl) {
      cl.members.forEach(function (m) {crcs1.push(m)});
    });
    return [crcs0,crcs1];
  }
      
  geom.Cluster.displaceWithChildren = function (mv) {
    var clusters = this.inSet.clusters;
    this.members.forEach(function (m) {
      m.center = m.center.plus(mv);
    });
    this.children.forEach(function (chi) {
      clusters[chi].displaceWithChildren(mv);
    });
  }
  
  geom.Cluster.moveIntoContactWithParent = function () {
    var pr = this.parent;
    if (!pr) return;// the root
    var circles = this.inSet.circles;
    var sc = this.inSet.scale;
    var myside = circles[pr[0]];
    var otherside = circles[pr[1]];
    // compute the move which would bring these two into contact
    var vc = otherside.center.difference(myside.center);
    var d=vc.length();
    var gap = d - sc*(myside.radius + otherside.radius);
    console.log("gap for ",myside.caption,otherside.caption," is ",gap);
    if (gap < 0.00001) {
      return;
    }
    
    var mv = vc.normalize().times(gap);
    // now, displace all of the centers in the cluster by this
    this.displaceWithChildren(mv);
  }
  
  geom.Cluster.bringTogether = function () {
    var ch = this.children;
    var clusters = this.inSet.clusters;
    ch.forEach(function (ci) {
      var c=clusters[ci];
      c.bringTogether();
    });
    this.moveIntoContactWithParent();

  }
  
  geom.ClusterSet.bringTogether = function (show) {
    this.clusters[0].bringTogether();
    if (show) this.show(1);
  }
  
  geom.ClusterSet.step = function () {
    if (this.clusters.length === this.circles.length) return false;//done
    this.shrinkStep();
    this.bringTogether();
    this.show(1);
    return true;
  }
    
  
  geom.Cluster.memberCaptions = function () {
    var mems = this.members.map(function (m) {return m.caption}).join(",");
    var circles = this.inSet.circles;
    var pr = this.parent;
    if (pr) {
      var prs = "Parent="+pr[2]+" via "+circles[pr[0]].caption+"->"+circles[pr[1]].caption;
    }
    return [mems,prs];
  }
  
  geom.ClusterSet.logClusters = function () {
    console.log("Cluster set ");
    var n=0;
    this.clusters.forEach(function (c) {
      var mc = c.memberCaptions();
      var prs = mc[1];
      console.log((n++)+"  "+mc[0]);
      if (prs) {
        console.log("       ",prs);
      }
    //  console.log("      ",JSON.stringify(c.treeNode));
    });
  }
                      
  
  geom.ClusterSet.show = function(fit,cb) {
    if (this.disableShow)  {
      if (cb) cb();
      return;
    }
   
    var tm = Date.now();
    this.install();
    tm = geom.logTime("install",tm);
    if (fit) __pj__.draw.fit();
     __pj__.draw.refresh();
    geom.logTime("refresh",tm);
    this.logClusters();
    if (cb) {
      setTimeout(cb,(sofar>35)?1000:100);
    }
    

  }
    
  /*
   
   var cs =     p.geom.initialClusterSet( p.om.root.bubbles.shapes.slice(0,51),['circle']);
   var bnds = cs.bounds();
   cs.show(1);
   
   for (var i=1;i<40;i++) cs.shrinkStep();cs.shrinkStep(1);
   
   cs.shrinkStep(1);
   cs.bringTogether(1);
   
   var c0 = cs.clusters[0];
      c0.computeBifurcateScale();
   cs.scale = c0.bifurcateScale;
   cs.show(1);
   
   c0.computeSplitScale();
   c0.showSplitPair();
   cs.showOnly(['CA','AK']);
   cs.clusters[0].bifurcated();
   
   
*/
  
  
  // instead of scaling down circles, scale up translations
  geom.ClusterSet.install = function () {
    var path = this.circlePath;
    var sci = 1/(this.scale);
    var crcs = this.circles;
    var ln = crcs.length;
    for (var i=0;i<ln;i++) {
      var c = crcs[i];
      c.shape.caption.textP.style.fillStyle = "black";
      var circle = c.shape.evalPath(path);
      circle.radius = c.radius;
      circle.style.fillStyle = "rgba(0,0,255,0.8)";
      circle.style.lineWidth = 10;
     
      c.shape.translate(c.center.times(sci));
      c.shape.show();
    }
  }
  
  geom.ClusterSet.showOnly = function (a) {
    this.circles.forEach(function (c) {
      c.shape.hide();
    });
    var thisHere = this;
    a.forEach(function (ic) {
      if (typeof ic==="string") {
        var c = thisHere.findCaption(ic);
      } else if (typeof ic==="number") {
        c = thisHere.circles[ic];
      } else {
        ic = c;
      }
      c.shape.show();
    });
    draw.refresh();
  }
  
  
 

})(prototypeJungle);

