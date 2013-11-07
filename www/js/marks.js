


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
  
  // if p is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype

  function boundShape(p,d,dataTransform) {
    if (typeof p=="function") {
      return p(d,dataTransform);
    } else {
      var rs=p.instantiate().show();
      rs.setData(d,dataTransform);
      return rs;
    }
  }
  /*
  geom.Marks.data = function (dt) { // just set the data; don't sync
    this.setIfExternal("__data__",om.lift(dt));
  }
  */
  // brings shapes and data into sync
  // rebinds data, adds missing shapes,or removes them
  // if they have no associated data
  geom.Marks.update = function (xf) {
    var shps = this.get("shapes");
    if (!shps) {
      shps = this.set("shapes",om.LNode.mk());
    }
    shps.computed();
    var sln = shps.length;
    var data = this.__data__;
    if (!data) return this;//not ready
   
    var dt = data.data;
    var dln =dt.length;
    // set data for existing shapes
    for (var i=0;i<sln;i++) {
      if (i<dln) {
        shps[i].setData(dt[i]);
        shps[i].update(xf);
      }
    }
    var p = this.markConstructor;
    var isf = typeof p == "function";
    // make new shapes
    for (var i=sln;i<dln;i++) {
      var d = dt[i];
      var nm = boundShape(p,d,xf);
      shps.pushChild(nm);
      nm.update();
    }
    // remove exiting shapes
    for (var i=dln;i<sln;i++) {
      shps[i].remove();
    }
    shps.length = dln;
    return this;
  }
  
  
  
    // if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype

  geom.Marks.mk = function (cns) {
    //var data = om.lift(idata);
    var rs = Object.create(geom.Marks);
    if (cns.inWs()) {
      rs.markConstructor = cns;
    } else {
      rs.set("markConstructor",cns.instantiate());
    }
    //rs.setIfExternal("__data__",data);
    rs.set("shapes",om.LNode.mk());
    rs.shapes.computed();
    //if (data) {
    //  rs.sync();
    //}
    //rs.computed();
    return rs;
  }
  
  
  
  geom.Marks.mapOverShapes = function (fn) {
    var shps = this.shapes;
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
   // this.shapes.forEach(function (shp) {
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
    om.twoArraysForEach(this.shapes,cls,function (s,c) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(c);
        //code
      }
    });
  }
  
  geom.Marks.setColor = function (cl) {
    this.shapes.forEach(function (s) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(cl);
        //code
      }
    });
  }
      
   geom.Marks.setNthColor = function (n,cl) {
    var s = this.shapes[n];
    var sc = s.setColor;
    if (sc) {
      s.setColor(cl);
    }
  }

})(prototypeJungle);

