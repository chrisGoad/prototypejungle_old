


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;


  
  // a mark set, with type name "Marks" is non-transient, and belongs to the prototypeJungle tree
  geom.set("Marks",geom.Shape.mk()).namedType(); 

  geom.Marks.setData = function (data,xf) {
    var cn = this.constructor;
    var dl = om.lift(data);
    this.setIfExternal("__data__",dl);
    if (xf) {
      this.dataTransform = xf;
    }
    if (cn) {
      this.sync();
    }
    return this;
  }
  
  
  
  // if p is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype

  function boundShape(p,d,dataTransform) {
    if (typeof p=="function") {
      return p(d,dataTranform);
    } else {
      var rs=p.instantiate().show();
      rs.setData(d,dataTransform);
      return rs;
    }
  }
  
  geom.Marks.data = function (dt) { // just set the data; don't sync
    this.setIfExternal("__data__",om.lift(dt));
  }
  
  // brings shapes and data into sync
  // rebinds data, adds missing shapes,or removes them
  // if they have no associated data
  geom.Marks.sync = function () {
    var shps = this.shapes;
    var sln = shps.length;
    var data = this.__data__;
    var dt = data.data;
    var dln =dt.length;
    for (var i=0;i<sln;i++) {
      if (i<dln) {
        shps[i].setData(dt[i],this.dataTransform);
      }
    }
    var p = this.constructor;
    var isf = typeof p == "function";
    for (var i=sln;i<dln;i++) {
      var d = dt[i];
      var nm = boundShape(p,d,this.dataTransform);
      shps.pushChild(nm);
    }
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
    rs.setIfExternal("constructor",cns);
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
    
    
  geom.Marks.show = function () {
    this.mapOverShapes(function (s) {
      s.show();
    });
    return this;
  }
  
  
  // marks whose constructor is another set of marks
  
  
  geom.mkMarksSquared = function (cns) {
    var rs = geom.Marks.mk();
    rs.set("constructor", geom.Marks.mk(cns));
    return rs;
  }
    
    
      
    

})(prototypeJungle);

