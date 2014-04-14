


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var svg = __pj__.svg;
  
  geom.drawMarksUnderConstruction  = 1;
  // a mark set, with type name "Marks" is non-transient, and belongs to the prototypeJungle tree
  geom.set("Marks",svg.g.mk()).namedType(); 
  
  // a utility. Given an array of categories, and a master prototype
  // it fills in missing categories with instances of the master prototype
  
  // assign random colors to the categories
  geom.Marks.fixupCategories = function (icategories,randomizeColors) {
    var categories = icategories?icategories:[];
    var mc = this.categorizedPrototypes;
    if (!mc) {
      mc = this.set("categorizedPrototypes",om.DNode.mk());
      mc.computed();
    }
    var mp = this.masterPrototype;
    var fe = function (c) {
      if (!mc[c]) {
        var cp = mp.instantiate();
        mc.set(c,cp);
        if (randomizeColors && cp.setColor) {
          cp.setColor(__pj__.draw.randomRgb(0,255));
        }
      }
    }
    categories.forEach(fe);
    fe("defaultPrototype");
  }
    
  geom.Marks.attachChangeIdentifier = function () {
    var mc = this.categorizedPrototypes;
    if (mc) {
      mc.changeIdentifier = function (nd) {
        var whichP = nd.findWhichSubtree(mc);
        if (whichP) {
          return whichP.__name__;
        }
      }
      //code
    }
  }

  function categoryCounts(dt,sp) {
    var dln = dt.length;
    var rs = {};
    for (var i=sp;i<dln;i++) {
      var dcat = dt[i].category;
      var cat = (dcat===undefined)?"__default__":dcat;
      var sf = rs[cat];
      rs[cat] = (sf===undefined)?1:sf+1;
    }
    return rs;
  }
  
  
    
  function buildInstanceSupply(ip,dt,sp,categorized) {
    om.tlog("Start Instance supply");
    if (categorized) {
      var ccnts = categoryCounts(dt,sp);
      var rs = {};
      for (var cat in ccnts) {
        if (cat === "__default__") {
          var p = ip.defaultPrototype;
        } else {
          var p = ip[cat];
          if (!p) {
            p = ip.defaultPrototype;
          }
        }
        var n = ccnts[cat];
        if (n===1) {
         var insts = [p.instantiate()];
        } else {
          insts = p.instantiate(n);
        }
        rs[cat] = insts;
      }
    } else {
      n = dt.length - sp;
      rs = ip.instantiate(n);
    }
     om.tlog("finish instance supply");
     return rs;
  }
  

  

  geom.Marks.boundShape = function (dst,instanceSupply,series,index) {
    var element = series.elements[index]
    if (this.categorized) {
      var dcat =  element.category;
      var cat = (dcat===undefined)?"__default__":dcat;
      var insts = instanceSupply[cat];
    } else {
      insts = instanceSupply;
    }
    var rs = insts.pop();
    dst.push(rs);
    rs.show();
    if (geom.drawMarksUnderConstruction)  rs.draw();
    return rs;
    var dt = this.selectData(series,index);
    rs.setData(dt);
    return rs;
  }
  

  geom.Marks.boundShapeN = function (dst,p,d,index) {
    var rs = p.instantiate();
    dst.push(rs);
    rs.show();
    rs.draw();
    rs.setData(d);
    return rs;
  }
  
  // a reset is needed if the set of categories has changed
  geom.Marks.sync = function (doReset) {
    var data = this.data;
    if (!data) return this;//not ready
    var categories = data.categories;
    if (categories) {
      var p = doReset?undefined:this.categorizedPrototypes;
      if (!p) {
        this.fixupCategories(data.categories);
        p = this.categorizedPrototypes;
      }
    } else {
      p = this.masterPrototype;
    }
    var shps = this.get("marks");
    if (!shps) {
      shps = this.set("marks",om.LNode.mk());
      if (geom.drawMarksUnderConstruction) shps.draw();
    } else if (doReset) {
      shps.svgClear();
    }
    
    shps.computed();
    var sln = shps.length;
   
   
    var dt = data.elements;
    var dln =dt.length;
    // set data for existing marks
    if (categories) {
      var p = this.categorizedPrototypes;
    } else {
      p = this.masterPrototype;
    }
    this.categorized = !!categories;
    // make new marks
    var isup = buildInstanceSupply(p,dt,sln,this.categorized);
    for (var i=sln;i<dln;i++) {
      var d = data[i];
      var nm = this.boundShape(shps,isup,data,i);
      continue;
      if (categories) {
        var ct = d.category;
        var pr = p[ct?ct:"default"];
      } else {
        pr = p;
      }
      var nm = this.boundShape(shps,pr,d,i);
    }
    // remove exiting marks
    for (var i=dln;i<sln;i++) {
      shps[i].remove();
    }
    shps.length = dln;
    return this;
  }
  
  geom.Marks.update = function () {
    om.tlog("updating marks");
    if (this.data) {
      this.sync(1);
      this.bind();
    }
    om.tlog("done updating marks");

  }

  
  // if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype
  // A MarkSet mignt be unary (with just one prototype), or categorized, with a prototype per category.

  geom.Marks.mk = function (mp) { // categorized is the default
    var rs = Object.create(geom.Marks);
    //rs.categorized = !unary;
    rs.setIfExternal("masterPrototype",mp);
    mp.__doNotBind__ = 1;
    rs.set("marks",om.LNode.mk());
    rs.marks.computed();
    return rs;
  }
  
  
  
  geom.Marks.bind = function () {
    if (!this.binder) return;
    var d = this.data;
    var els = d.elements;
    var shps = this.marks;
    var thisHere = this;
    var ln = els.length;
    shps.forEach(function (m,i) {
      thisHere.binder(m,els[i],i,ln);
    });
   
  }
  
  
  geom.Marks.mapOverMarks = function (fn) {
    var shps = this.marks;
    if (shps) {
      if (om.LNode.isPrototypeOf(shps)) {
        shps.forEach(fn);
      } else {
        for (var k in shps) {
          if (shps.hasOwnProperty(k) && !om.internal(k)) {
            fn(shps[k],k);
          }
        }
      }
    }
  }
  
  geom.Marks.setFromData = function (p,fn) {
    var shps = this.marks;
    if (shps) {
      shps.forEach(function (s,i) {
        var d = s.data;
        var v = fn(d,i);
        s.set(p,v);
      });
    }
  }
 
  
  om.nodeMethod("marksAncestor",function () {
    if (geom.Marks.isPrototypeOf(this)) {
      return this;
    }
    var pr = this.__parent__;
    if (pr) {
      return pr.marksAncestor();
      //code
    }
  });
  // the idea is to transmit new  from a user's choice of new color up to the containing mark set
 
  geom.Marks.monitorColors = function () {
    this.markConstructor.monitorColor();
  }

  geom.Marks.show = function () {
    this.mapOverShapes(function (s) {
      s.show();
    });
    return this;
  }
  
  
  // marks whose constructor is another set of marks
  
  
  geom.mkMarksSquared = function (cns) {
    var rs = geom.Marks.mk();
    rs.set("markConstructor", geom.Marks.mk(cns));
    return rs;
  }
    
  // a common operation
  geom.Marks.setColors = function (cls) {
    om.twoArraysForEach(this.marks,cls,function (s,c) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(c);
      }
    });
  }
  
  geom.Marks.setColor = function (cl) {
    this.marks.forEach(function (s) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(cl);
      }
    });
  }
      
   geom.Marks.setNthColor = function (n,cl) {
    var s = this.marks[n];
    var sc = s.setColor;
    if (sc) {
      s.setColor(cl);
    }
  }
  geom.Marks.changeIdentifier = function (nd) {
    return nd.lnodeIndex();
  }

})(prototypeJungle);

