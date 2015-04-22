

(function (pj) {
  
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract

// There are two ways of treating categories. In the simpler model, a single prototype is used.
// when the marks are generated, they are placed in a byCategory multi-map, which maps categories to
// sets of indicices. Then the application can, eg, set the colors of these marks by category.
//In the fancier version, a separate prototype is produced for each category; this multiprototye version will be used
// if marks.multiPrototype is true.


// For a Marks object m, m.marks and m.modified hold the individual marks. m.modified is a group with elements m[i] defined in the cases
// where marks[i] === '__modified'.!

// Currently, 3/8/15, multiPrototype is dormant, and the modified case is not yet treated in the code for multiPrototype


pj.defineMarks = function (marksConstructor) {
  pj.set("Marks",marksConstructor()).namedType(); 

  // a utility. Given an array of categories, and a master prototype
  // it fills in missing categories with instances of the master prototype
  
  // instantiate the master prototype for each category. Assign colors
 pj.Marks.fixupCategories = function (icategories,randomizeColors) {
    var categories = icategories?icategories:[];
    var mc = this.categorizedPrototypes;
    if (!mc) {
      mc = this.set("categorizedPrototypes",pj.Object.mk());
      pj.declareComputed(mc);
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
  

  function categoryCounts(dt,startIndex) {
    var dln = dt.length;
    var rs = {};
    for (var i=startIndex;i<dln;i++) {
      var dcat = dt[i].category;
      var cat = (dcat===undefined)?"__default":dcat;
      var sf = rs[cat];
      rs[cat] = (sf===undefined)?1:sf+1;
    }
    return rs;
  }
  
  
  // It is more efficient to instantiate a single object multiple times
  // So, we prebuild the supply of marks we will need, building them in batches by category
    
  function buildInstanceSupply(marks,ip,dt,startIndex,multiPrototype) {
    var i,n,irs,rs,instances,proto,cat,ccnts,dataln,modln,mods,modcnt,mdi;
    pj.tlog("Start Instance supply; multiPrototype",multiPrototype);
    if (marks.multiPrototype) {
      var ccnts = categoryCounts(dt,startIndex);
      rs = {};
      for (cat in ccnts) {
        if (cat === "__default") {
          p = ip.defaultPrototype;
        } else {
          var p = ip[cat];
          if (!p) {
            p = ip.defaultPrototype;
          }
        }
        //p.__mutable = 1;
        n = ccnts[cat];
        if (n===1) {
          instances= [p.instantiate()];
        } else {
          instances= p.instantiate(n);
        }
        rs[cat] = instances;
        instances.forEach(function (i) {i.__mark = 1;});
      }
    } else {
      // use the modifications when possible
      mods = marks.modifications;
      dataln = dt.length;
      modcnt = 0;
      if (mods) {
        for (i=startIndex;i<dataln;i++) {
          if (mods[i]) {
            modcnt++;
          }
        } 
      }
      n = dataln - startIndex - modcnt;
      if (n==0) { 
        return [];
      }
      irs = ip.instantiate(n);
      irs.forEach(function (i) {i.__mark = 1;});
      if (modcnt) { 
        rs = [];
        for (i=startIndex;i<dataln;i++) {
          mdi = mods[i]
          if (mdi) {
            rs.push('__modified');
          } else {
            rs.push(irs.pop());
          }
        }
      } else {
        rs = irs;
      }
    } 
     pj.tlog("finish instance supply"); 
     //rs.forEach(function (i) {i.__immutable = 1;});

     return rs;
  }

  //  This sets the data of the nth mark from the precomputed instancesupply to the nth omum in the series
 // Not in use at the moment because the multiPrototype option is dormant.
 pj.Marks.boundShape = function (instanceSupply,series,n) {
    var dst = this.marks;
    var element = series.elements[n];
    if (this.multiPrototype) {
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
    if (typeof rs === "object") rs.show();//ie not "__modified"
    return rs; 
  }
  // This syncs the set of marks to the dat.  If there are already marks in the set, 
  // it reuses them, and builds new ones as required.
  
  // a reset is needed if the set of categories has changed
  
 pj.Marks.sync = function () {
    var data = this.data;
    if (!data) return this;//not ready
    var categories = data.categories;
    if (this.multiPrototype) {
      var p = this.categorizedPrototypes;
      if (!p) {
        this.fixupCategories(data.categories);
        p = this.categorizedPrototypes;
      }
    } else {
      p = this.masterPrototype; 
      if (categories) {
        if (!this.byCategory) {
          this.set("byCategory",pj.MultiMap.mk());
          ui.hide(this,"byCategory");
          pj.declareComputed(this.byCategory);
        }
      }
    }
    var shps = this.__get("marks");
    if (!shps) {
      shps = this.set("marks",pj.Array.mk());
    }
  
    pj.declareComputed(shps);
    var sln = shps.length;
   
   
    var dt = data.elements;
    var dln =dt.length;
    // set data for existing marks
    if (this.multiPrototype) {
      var p = this.categorizedPrototypes;
    } else {
      p = this.masterPrototype;
    }
    //this.multiPrototype = !!categories; Now set from the   outside
    // make new marks
    var isup = buildInstanceSupply(this,p,dt,sln);
    if (this.multiPrototype) {
      for (var i=sln;i<dln;i++) {
        var d = data[i];
        //var nm = this.boundShape(shps,isup,data,i);  
        this.boundShape(isup,data,i);
      }
    } else {
      for (var i=sln;i<dln;i++) {
        //var nm = this.boundShape(shps,isup,data,i);
        if (this.data.categories) {
          var element = data.elements[i];
          this.byCategory.setValue(element.category,i);
        }
        shps.push(isup[i-sln]);
      }
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
  
 pj.Marks.bind = function () {
    if (!this.binder) return;
    var d = this.data;
    var els = d.elements;
    var shps = this.marks;
    var mds = this.modifications;
    var mln = shps.length;
    var thisHere = this;
    var ln = els.length;
    for (var i=0;i<ln;i++) {
      var m = shps[i]; 
      if (m === "__modified") {
        m = mds[i];
      }
      this.binder(m,els[i],i,ln);
    }
    //shps.forEach(function (m,i) {  
    //  thisHere.binder(m,els[i],i,ln);
    //});
   
  }
  
 pj.Marks.update = function () { 
    pj.tlog("updating marks");
    if (this.data) {
      this.sync(); 
      this.bind();
    }
    pj.tlog("done updating marks");
  }
  
  // a reset is needed when the shape of data changes; when the nth element is asssigned to a new category, or the  count of elements goes down
  pj.Marks.reset = function () {
    var shps = this.__get("marks");
    if (shps) {
      shps.remove();
    }
    var md = this.modifications;
    if (md){
      md.remove();
    }
    this.byCategory = undefined;

  }

  
  // if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype
  // A MarkSet mignt be unary (with just one prototype), or multiPrototype, with a prototype per category.

 pj.Marks.mk = function (mp) { // multiPrototype is the default
    var rs = Object.create(pj.Marks);
    pj.setIfExternal(rs,"masterPrototype",mp);
    rs.set("marks",pj.Array.mk());
    pj.declareComputed(rs.marks);
    return rs;
  }
  
  
  
 pj.Marks.mapOverMarks = function (fn) {
    var shps = this.marks;
    if (shps) {
      if (pj.Array.isPrototypeOf(shps)) {
        shps.forEach(fn);
      } else {
        for (var k in shps) {
          if (shps.hasOwnProperty(k) && !pj.internal(k)) {
            fn(shps[k],k);
          }
        }
      }
    }
  }
  
 pj.Marks.setFromData = function (p,fn) {
    var shps = this.marks;
    if (shps) {
      shps.forEach(function (s,i) {
        var d = s.data;
        var v = fn(d,i);
        s.set(p,v);
      });
    }
  }
 
  
  pj.nodeMethod("__marksAncestor",function () {
    if (pj.Marks.isPrototypeOf(this)) {
      return this;
    }
    var pr = this.__parent;
    if (pr) {
      return pr.__marksAncestor();
      //code
    }
  });
  // the idea is to transmit new  from a user's choice of new color up to the containing mark set
 
 pj.Marks.monitorColors = function () {
    this.markConstructor.monitorColor();
  }

 pj.Marks.show = function () {
    this.mapOverShapes(function (s) {
      s.show();
    });
    return this;
  }
  
  pj.Marks.setColorOfCategory = function (category,color) {
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
  pj.Marks.setColorsByCategory = function (colorsByCategory) {
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
  
  
  pj.mkMarksSquared = function (cns) {
    var rs =pj.Marks.mk();
    rs.set("markConstructor",pj.Marks.mk(cns));
    return rs;
  }
    
  // a common operation
 pj.Marks.setColors = function (cls) {
    pj.twoArraysForEach(this.marks,cls,function (s,c) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(c);
      }
    });
  }
  
 pj.Marks.setColor = function (cl) {
    this.marks.forEach(function (s) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(cl);
      }
    });
  }
      
  pj.Marks.setNthColor = function (n,cl) {
    var s = this.marks[n];
    var sc = s.setColor;
    if (sc) {
      s.setColor(cl);
    }
  }
  
  /*
   pj.Marks.bake = function () {
    this.baked = 1;
    delete this.marks.__computed;
  }
  */
  // move mark number n to the modified node from the array.  
  
  pj.Marks.assertModified = function (mark) {
    var md = this.modifications;
    if (mark.__parent === md) {
      return; // already modified 
    }
    if (!this.modifications) {
      md = this.set("modifications",marksConstructor()); 
      //md = this.set("modifications",pj.Object.mk())
    }
    var n = Number(mark.__name);
    mark.remove();
    md.set(n,mark);
    this.marks[n] = '__modified';
    this.draw();
  }

}

//end extract

})(prototypeJungle);

