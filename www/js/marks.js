


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var svg = __pj__.svg;
  
  
  // a mark set, with type name "Marks" is non-transient, and belongs to the prototypeJungle tree
  geom.set("Marks",svg.g.mk()).namedType(); 

  /*
  geom.Marks.setData = function (data,dataStyle,xf) {
    var cn = this.markConstructor;
    var dl = om.lift(data);
    this.setIfExternal("data",dl);
    if (dataStyle) {
      this.dataStyle = dataStyle;
    }
    if (cn) {
      this.sync(xf);
    }
    return this;
  }
  
  */
  
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
      var dcat = dt[i].dataFieldValue("category");
      var cat = (dcat===undefined)?"__default__":dcat;
      var sf = rs[cat];
      rs[cat] = (sf===undefined)?1:sf+1;
    }
    return rs;
  }
  
  
    
  function buildInstanceSupply(ip,dt,sp) {
    om.tlog("Start Instance supply");
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
     //     var insts = [p.copyNode()];
        } else {
       //   insts = p.copyNode(n);
          insts = p.instantiate(n);
       }
        rs[cat] = insts;
     }
     om.tlog("finish instance supply");
     return rs;
  }
  

  

  geom.Marks.boundShape = function (instanceSupply,series,index) {
    var element = series.value[index]
    var dcat =  element.dataFieldValue("category");
    var cat = (dcat===undefined)?"__default__":dcat;
    var insts = instanceSupply[cat];
    var rs = insts.pop();
    rs.show();
    var dt = this.selectData(series,index);
    rs.setData(dt);
    return rs;
  }
  

  geom.Marks.boundShape = function (dst,p,d,index) {
   //var rs = p.copyNode();
    var rs = p.instantiate();
    dst.push(rs);
    rs.show();
    rs.draw();
    rs.setData(d);
    return rs;
  }
  /*
  function boundShape(ip,d,categorized) {
    if (categorized) {
      var cat = d.dataFieldValue("category");
      if (cat){
        var p = ip[cat];
      }
      if (!p) {
        p = ip.defaultPrototype;
      }
      if (!p) {
        return;
      }
    } else {
      p = ip;
    }
    var tm =  Date.now();

    var rs=p.instantiate().show();
    var etm = Date.now() - tm;
  
    rs.update(d);
    return rs;
  }
  */
  /*
  geom.Marks.data = function (dt) { // just set the data; don't sync
    this.setIfExternal("data",om.lift(dt));
  }
  */
  // brings marks and data into sync
  // rebinds data, adds missing marks,or removes them
  // if they have no associated data
  geom.Marks.selectData = function (dt,idx) {
    if (this.dataSelector) {
      return om.lift(this.dataSelector(dt,idx));
    } else {
      return dt.elements[idx];
      // turn the array into an object, with properties from the fields
      var rs = om.DNode.mk();
      var e = dt.elements[idx];
      var flds = dt.fields;
      var fln = flds.length;
      var eln = e.length;
      var ln = Math.min(fln,eln);
      var domain=dt.domain;
      var range = dt.range;
      for (var i=0;i<ln;i++) {
        var f = flds[i];
        if (f === domain) {
          var fn = "domainValue";
        } else if (f === range) {
          fn = "rangeValue";
        } else {
          fn = f;
        }
        rs[fn] = e[i];
      }
      return rs;
    }
  }
  geom.Marks.sync = function () {
    var data = this.data;
    if (!data) return this;//not ready
    if (this.categorized) {
      var p = this.categorizedPrototypes;
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
      debugger;
      shps.draw();
    }
    
    shps.computed();
    var sln = shps.length;
   
   
    var dt = data.elements;
    var dln =dt.length;
    // set data for existing marks
    for (var i=0;i<sln;i++) {
      if (i<dln) {
        var shp = shps[i];
        if (shp) {
          shp.setData(this.selectData(data,i));
        }
      }
    }
    if (this.categorized) {
      var p = this.categorizedPrototypes;
    } else {
      p = this.masterPrototype;
    }
    // make new marks
    //var isup = buildInstanceSupply(p,dt,sln);
    for (var i=sln;i<dln;i++) {
      var d = this.selectData(data,i);
      //var nm = this.boundShape(isup,data,i);
      if (this.categorized) {
        var ct = d.category;
        var pr = p[ct?ct:"default"];
      } else {
        pr = p;
      }
      var nm = this.boundShape(shps,pr,d,i);
      //shps.push(nm);
      //nm.update();
    }
    // remove exiting marks
    for (var i=dln;i<sln;i++) {
      shps[i].remove();
    }
    shps.length = dln;
    return this;
  }
  
  geom.Marks.update = function () {
    if (this.data) {
      this.sync();
    }

  }

  
    // if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype
// A MarkSet mignt be unary (with just one prototype), or categorized, with a prototype per category.

  geom.Marks.mk = function (mp,unary) { // categorized is the default
    var rs = Object.create(geom.Marks);
    rs.categorized = !unary;
    rs.setIfExternal("masterPrototype",mp);
    mp.__doNotBind__ = 1;
    rs.set("marks",om.LNode.mk());
    rs.marks.computed();
    return rs;
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
 /*
  geom.newMarkColor = function(cl,st) {
    var idx = st.lnodeIndex();
    var marks = st.marksAncestor();
    if (marks.onNewColor) {
      marks.onNewColor(idx,cl);
    }
  }
  */
  geom.Marks.monitorColors = function () {
    /*
    this.setListener("colorChange",function (whr,nd,v,ev) {
          var onnc = whr.onNewColor;
          if (onnc) {
            onnc(nd.lnodeIndex(),v);
          }
      });
    if (fn) this.onNewColor = fn;
    */
    this.markConstructor.monitorColor();
   // this.marks.forEach(function (shp) {
  //    shp.monitorColor(fn);
  //  });
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
        //code
      }
    });
  }
  
  geom.Marks.setColor = function (cl) {
    this.marks.forEach(function (s) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(cl);
        //code
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
         // this identifies which prototype change
         return nd.lnodeIndex();

  }

})(prototypeJungle);

