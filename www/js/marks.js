

(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var svg = __pj__.svg;
  //var dat = __pj__.dat;
  //dat.drawMarksUnderConstruction  = 1;

om.defineMarks = function (prototypeForMarks) {
  om.set("Marks",prototypeForMarks).namedType(); 
     //om.set("Marks",svg.tag.g.mk()).namedType(); 
  // a utility. Given an array of categories, and a master prototype
  // it fills in missing categories with instances of the master prototype
  
  // instantiate the master prototype for each category. Assign colors
 om.Marks.fixupCategories = function (icategories,randomizeColors) {
    var categories = icategories?icategories:[];
    var mc = this.categorizedPrototypes;
    if (!mc) {
      mc = this.set("categorizedPrototypes",om.DNode.mk());
      om.declareComputed(mc);
    }
    var mp = this.masterPrototype;
    var fe = function (c) {
      if (!mc[c]) {
        var cp = mp.instantiate();
        mc.set(c,cp);
        if (randomizeColors && cp.setColor) {
          cp.setColor(__pj__.__draw.randomRgb(0,255));
        }
      }
    }
    categories.forEach(fe);
    fe("defaultPrototype");
  }
    
 om.Marks.attachChangeIdentifier = function () {
    var mc = this.categorizedPrototypes;
    if (mc) {
      mc.changeIdentifier = function (nd) {
        var whichP = nd.__findWhichSubtree(mc);
        if (whichP) {
          return whichP.__name;
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
      var cat = (dcat===undefined)?"__default":dcat;
      var sf = rs[cat];
      rs[cat] = (sf===undefined)?1:sf+1;
    }
    return rs;
  }
  
  
  // It is more efficient to instantiate a single object multiple times
  // So, we prebuild the supply of marks we will need, building them in batches by category
    
  function buildInstanceSupply(ip,dt,sp,categorized) {
    om.tlog("Start Instance supply");
    if (categorized) {
      var ccnts = categoryCounts(dt,sp);
      var rs = {};
      for (var cat in ccnts) {
        if (cat === "__default") {
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
  

  //  This sets the data of the nth mark from the precomputed instancesupply to the nth omum in the series

 om.Marks.boundShape = function (dst,instanceSupply,series,n) {
    var element = series.elements[n];
    if (this.categorized) {
      var dcat =  element.category;
      var cat = (dcat===undefined)?"__default":dcat;
      var insts = instanceSupply[cat];
    } else {
      insts = instanceSupply;
    }
    var rs = insts.pop();
    dst.push(rs);
    rs.show();
    return rs; 
  }
  // This syncs the set of marks to the dat.  If there are already marks in the set,
  // it reuses them, and builds new ones as required.
  
  // a reset is needed if the set of categories has changed
  
 om.Marks.sync = function (doReset) {
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
    var shps = this.__get("marks");
    if (!shps) {
      shps = this.set("marks",om.LNode.mk());
      //if (om.drawMarksUnderConstruction) shps.__draw();
    } else if (doReset) {
      shps.__svgClear();
    }
    
    om.declareComputed(shps);
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
    }
    // remove exiting marks
    for (var i=dln;i<sln;i++) {
      shps[i].remove();
    }
    shps.length = dln;
    return this;
  }
  
  
  // a mark set may have a "binder" function, which given a mark, its datum, index, and the lenght of the series
  //  adjusts the mark as appropriate. Binders are optional.
  
 om.Marks.bind = function () {
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
  
 om.Marks.update = function () {
    om.tlog("updating marks");
    if (this.data) {
      this.sync(1);
      this.bind();
    }
    om.tlog("done updating marks");

  }

  
  // if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype
  // A MarkSet mignt be unary (with just one prototype), or categorized, with a prototype per category.

 om.Marks.mk = function (mp) { // categorized is the default
    var rs = Object.create(om.Marks);
    //rs.categorized = !unary;
    om.setIfExternal(rs,"masterPrototype",mp);
    //mp.__doNotBind = 1;
    rs.set("marks",om.LNode.mk());
    om.declareComputed(rs.marks);
    return rs;
  }
  
  
  
 om.Marks.mapOverMarks = function (fn) {
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
  
 om.Marks.setFromData = function (p,fn) {
    var shps = this.marks;
    if (shps) {
      shps.forEach(function (s,i) {
        var d = s.data;
        var v = fn(d,i);
        s.set(p,v);
      });
    }
  }
 
  
  om.nodeMethod("__marksAncestor",function () {
    if (om.Marks.isPrototypeOf(this)) {
      return this;
    }
    var pr = this.__parent;
    if (pr) {
      return pr.__marksAncestor();
      //code
    }
  });
  // the idea is to transmit new  from a user's choice of new color up to the containing mark set
 
 om.Marks.monitorColors = function () {
    this.markConstructor.monitorColor();
  }

 om.Marks.show = function () {
    this.mapOverShapes(function (s) {
      s.show();
    });
    return this;
  }
  
  
  // marks whose constructor is another set of marks
  
  
  om.mkMarksSquared = function (cns) {
    var rs =om.Marks.mk();
    rs.set("markConstructor",om.Marks.mk(cns));
    return rs;
  }
    
  // a common operation
 om.Marks.setColors = function (cls) {
    om.twoArraysForEach(this.marks,cls,function (s,c) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(c);
      }
    });
  }
  
 om.Marks.setColor = function (cl) {
    this.marks.forEach(function (s) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(cl);
      }
    });
  }
      
  om.Marks.setNthColor = function (n,cl) {
    var s = this.marks[n];
    var sc = s.setColor;
    if (sc) {
      s.setColor(cl);
    }
  }
 om.Marks.changeIdentifier = function (nd) {
    return nd.__lnodeIndex();
  }
}

})(prototypeJungle);

