


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;


  
  // a mark set, with type name "Marks" is non-transient, and belongs to the prototypeJungle tree
  geom.set("Marks",geom.Shape.mk()).namedType(); 

  /*
  geom.Marks.setData = function (data,dataStyle,xf) {
    var cn = this.markConstructor;
    var dl = om.lift(data);
    this.setIfExternal("__data__",dl);
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
  
  geom.Marks.fixupCategories = function (icategories) {
    var categories = icategories?icategories:[];
    var mc = this.categorizedPrototypes;
    if (!mc) {
      mc = this.set("categorizedPrototypes",om.DNode.mk());
    }
    var mp = this.masterPrototype;
    var fe = function (c) {
      if (!mc[c]) {
        mc.set(c,mp.instantiate());
      }
    }
    categories.forEach(fe);
    fe("defaultPrototype");
  }
    
  

  function boundShape(ip,d,categorized) {
    if (categorized) {
      var cat = d.getField("category");
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
    var rs=p.instantiate().show();
    rs.update(d);
    return rs;
  }
  /*
  geom.Marks.data = function (dt) { // just set the data; don't sync
    this.setIfExternal("__data__",om.lift(dt));
  }
  */
  // brings marks and data into sync
  // rebinds data, adds missing marks,or removes them
  // if they have no associated data
 
  geom.Marks.sync = function () {
    var shps = this.get("marks");
    if (!shps) {
      shps = this.set("marks",om.LNode.mk());
    }
    shps.computed();
    var sln = shps.length;
    var data = this.__data__;
    if (!data) return this;//not ready
   
    var dt = data.value;
    var dln =dt.length;
    // set data for existing marks
    for (var i=0;i<sln;i++) {
      if (i<dln) {
        var shp = shps[i];
        if (shp) {
          shp.update(dt[i]);
        }
      }
    }
    if (this.categorized) {
      var p = this.categorizedPrototypes;
    } else {
      p = this.masterPrototype;
    }
    // make new marks
    for (var i=sln;i<dln;i++) {
      var d = dt[i];
      var nm = boundShape(p,d,this.categorized);
      shps.pushChild(nm);
      nm.update();
    }
    // remove exiting marks
    for (var i=dln;i<sln;i++) {
      shps[i].remove();
    }
    shps.length = dln;
    return this;
  }
  
  geom.Marks.update = function (d) {
    if (d) {
      this.setIfExternal("__data__",d);
    }
    this.sync();

  }

  
    // if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype
// A MarkSet mignt be unary (with just one prototype), or categorized, with a prototype per category.

  geom.Marks.mk = function (mp,unary) { // categorized is the default
    //var data = om.lift(idata);
    var rs = Object.create(geom.Marks);
    rs.categorized = !unary;
    rs.setIfExternal("masterPrototype",mp);
    //rs.setIfExternal("__data__",data);
    rs.set("marks",om.LNode.mk());
    rs.marks.computed();
    //if (data) {
    //  rs.sync();
    //}
    //rs.computed();
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

})(prototypeJungle);

