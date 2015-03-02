

(function (pj) {
  var pt = pj.pt;
  
  
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract

// There are two ways of treating categories. In the simpler model, a single prototype is used.
// when the marks are generated, they are placed in a byCategory multi-map, which maps categories to
// sets of indicices. Then the application can, eg, set the colors of these marks by category.
//In the fancier version, a separate prototype is produced for each category.


pt.defineMarks = function (prototypeForMarks) {
  pt.set("Marks",prototypeForMarks).namedType(); 

  // a utility. Given an array of categories, and a master prototype
  // it fills in missing categories with instances of the master prototype
  
  // instantiate the master prototype for each category. Assign colors
 pt.Marks.fixupCategories = function (icategories,randomizeColors) {
    var categories = icategories?icategories:[];
    var mc = this.categorizedPrototypes;
    if (!mc) {
      mc = this.set("categorizedPrototypes",pt.DNode.mk());
      pt.declareComputed(mc);
    }
    var mp = this.masterPrototype;
    var fe = function (c) {
      if (!mc[c]) {
        var cp = mp.instantiate();
        mc.set(c,cp);
        if (randomizeColors && cp.setColor) {
          cp.setColor(pj.__draw.randomRgb(0,255));
        }
      }
    }
    categories.forEach(fe);
    fe("defaultPrototype");
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
    pt.tlog("Start Instance supply; categorized",categorized);
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
        //p.__mutable = 1;
        var n = ccnts[cat];
        if (n===1) {
         var insts = [p.instantiate()];
        } else {
          insts = p.instantiate(n);
        }
        rs[cat] = insts;
        insts.forEach(function (i) {i.__mark = 1;});

      }
    } else {
      //ip.__mutable = 1;
      n = dt.length - sp;
      rs = ip.instantiate(n);
      rs.forEach(function (i) {i.__mark = 1;});
    } 
     pt.tlog("finish instance supply"); 
     //rs.forEach(function (i) {i.__immutable = 1;});

     return rs;
  }
  

  //  This sets the data of the nth mark from the precomputed instancesupply to the nth omum in the series

 pt.Marks.boundShape = function (dst,instanceSupply,series,n) {
    var element = series.elements[n];
    if (this.categorized) {
      var dcat =  element.category;
      var cat = (dcat===undefined)?"__default":dcat;
      var insts = instanceSupply[cat];
    } else {
      insts = instanceSupply;
      if (this.data.categories) {
        this.byCategory.setValue(element.category,n);
      }
    }
    var rs = insts.pop();
    dst.push(rs);
    rs.show();
    return rs; 
  }
  // This syncs the set of marks to the dat.  If there are already marks in the set,
  // it reuses them, and builds new ones as required.
  
  // a reset is needed if the set of categories has changed
  
 pt.Marks.sync = function (doReset) {
    var data = this.data;
    if (!data) return this;//not ready
    var categories = data.categories;
    if (this.categorized) {
      var p = doReset?undefined:this.categorizedPrototypes;
      if (!p) {
        this.fixupCategories(data.categories);
        p = this.categorizedPrototypes;
      }
    } else {
      p = this.masterPrototype;
      if (categories) {
        this.set("byCategory",pt.MultiMap.mk());
        pt.declareComputed(this.byCategory);

      }
    }
    var shps = this.__get("marks");
    if (doReset && shps) {
      shps.__svgClear();
    }
    if (!shps || doReset) {
      shps = this.set("marks",pt.LNode.mk());
    }
  
    pt.declareComputed(shps);
    var sln = shps.length;
   
   
    var dt = data.elements;
    var dln =dt.length;
    // set data for existing marks
    if (this.categorized) {
      var p = this.categorizedPrototypes;
    } else {
      p = this.masterPrototype;
    }
    //this.categorized = !!categories; Now set from the   outside
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
  
 pt.Marks.bind = function () {
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
  
 pt.Marks.update = function (doReset) {
    pt.tlog("updating marks");
    if (this.data) {
      this.sync(1);
      //this.sync(doReset); 
      this.bind();
    }
    pt.tlog("done updating marks");
  }

  
  // if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype
  // A MarkSet mignt be unary (with just one prototype), or categorized, with a prototype per category.

 pt.Marks.mk = function (mp) { // categorized is the default
    var rs = Object.create(pt.Marks);
    pt.setIfExternal(rs,"masterPrototype",mp);
    rs.set("marks",pt.LNode.mk());
    pt.declareComputed(rs.marks);
    return rs;
  }
  
  
  
 pt.Marks.mapOverMarks = function (fn) {
    var shps = this.marks;
    if (shps) {
      if (pt.LNode.isPrototypeOf(shps)) {
        shps.forEach(fn);
      } else {
        for (var k in shps) {
          if (shps.hasOwnProperty(k) && !pt.internal(k)) {
            fn(shps[k],k);
          }
        }
      }
    }
  }
  
 pt.Marks.setFromData = function (p,fn) {
    var shps = this.marks;
    if (shps) {
      shps.forEach(function (s,i) {
        var d = s.data;
        var v = fn(d,i);
        s.set(p,v);
      });
    }
  }
 
  
  pt.nodeMethod("__marksAncestor",function () {
    if (pt.Marks.isPrototypeOf(this)) {
      return this;
    }
    var pr = this.parent;
    if (pr) {
      return pr.__marksAncestor();
      //code
    }
  });
  // the idea is to transmit new  from a user's choice of new color up to the containing mark set
 
 pt.Marks.monitorColors = function () {
    this.markConstructor.monitorColor();
  }

 pt.Marks.show = function () {
    this.mapOverShapes(function (s) {
      s.show();
    });
    return this;
  }
  
  pt.Marks.setColorOfCategory = function (category,color) {
    var byCatIndices = this.byCategory;
    var marks = this.marks;
    var indices = byCatIndices[category];
    indices.forEach(function (n) {
      var mark = marks[n];
      if (mark.__setColor) {
        mark.__setColor(color);
      }
    });
  }
  
  /*
  pt.Marks.setColorsByCategory = function (colorsByCategory) {
    var byCatIndices = this.byCategory;
    var categories = this.data.categories;
    var marks = this.marks;
    categories.forEach(function (category) {
      var color = colorsByCategory[category];
      if (color) {
        var indices = byCatIndices[category];
        indices.forEach(function (n) {
          marks[n].setColor(color);
        });
      }
    });
  }
  */   
  // marks whose constructor is another set of marks
  
  
  pt.mkMarksSquared = function (cns) {
    var rs =pt.Marks.mk();
    rs.set("markConstructor",pt.Marks.mk(cns));
    return rs;
  }
    
  // a common operation
 pt.Marks.setColors = function (cls) {
    pt.twoArraysForEach(this.marks,cls,function (s,c) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(c);
      }
    });
  }
  
 pt.Marks.setColor = function (cl) {
    this.marks.forEach(function (s) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(cl);
      }
    });
  }
      
  pt.Marks.setNthColor = function (n,cl) {
    var s = this.marks[n];
    var sc = s.setColor;
    if (sc) {
      s.setColor(cl);
    }
  }
}

//end extract

})(prototypeJungle);

