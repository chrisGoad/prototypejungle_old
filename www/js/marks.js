


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;


  
  // a mark set, with type name "Marks" is non-transient, and belongs to the prototypeJungle tree
  geom.set("Marks",geom.Shape.mk()).namedType(); 

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
  
  
  
  // if p is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype

  function boundShape(p,d,dataStyle,dataTransform) {
    if (typeof p=="function") {
      return p(d,dataStyle,dataTransform);
    } else {
      var rs=p.instantiate().show();
      rs.setData(d,dataStyle,dataTransform);
      return rs;
    }
  }
  
  geom.Marks.data = function (dt) { // just set the data; don't sync
    this.setIfExternal("__data__",om.lift(dt));
  }
  
  // brings shapes and data into sync
  // rebinds data, adds missing shapes,or removes them
  // if they have no associated data
  geom.Marks.sync = function (xf) {
    if (xf) {
      this.dataTransform = xf;
    }
    var shps = this.shapes;
    var sln = shps.length;
    var data = this.__data__;
    var dt = data.data;
    var dataStyle = this.dataStyle;
    if (dataStyle) {
      var dts = dataStyle.data;
      var allDts = dataStyle.allData;
    }
    var dln =dt.length;
    var dsln = dts?dts.length:0;
    for (var i=0;i<sln;i++) {
      if (i<dln) {
        var dtsi = (i<dsln)?dts[i]:allDts;
        shps[i].setData(dt[i],dtsi,this.dataTransform);
      }
    }
    var p = this.markConstructor;
    var isf = typeof p == "function";
    for (var i=sln;i<dln;i++) {
      var d = dt[i];
      dtsi = (i<dsln)?dts[i]:allDts;
      var nm = boundShape(p,d,dtsi,this.dataTransform);
      shps.pushChild(nm);
    }
    for (var i=dln;i<sln;i++) {
      shps[i].remove();
    }
    shps.length = dln;
    return this;
  }
  
  geom.Marks.update = geom.Marks.sync;

  
  
    // if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype

  geom.Marks.mk = function (cns) {
    //var data = om.lift(idata);
    var rs = Object.create(geom.Marks);
    //rs.setIfExternal("markConstructor",cns);
    rs.set("markConstructor",cns.instantiate());
    //rs.setIfExternal("__data__",data);
    rs.set("shapes",om.LNode.mk());
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
  geom.newMarkColor = function(cl,st) {
    var idx = st.lnodeIndex();
    var marks = st.marksAncestor();
    if (marks.onNewColor) {
      marks.onNewColor(idx,cl);
    }
  }
  
  geom.Marks.monitorColors = function (fn) {
    this.onNewColor = fn;
    this.shapes.forEach(function (shp) {
      shp.monitorColor(fn);
    });
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
      
   geom.Marks.setNthColor = function (n,cl) {
    var s = this.shapes[n];
    var sc = s.setColor;
    if (sc) {
      s.setColor(cl);
    }
  }

})(prototypeJungle);

