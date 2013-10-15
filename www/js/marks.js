


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;


  
  // a mark set, with type name "Marks" is non-transient, and belongs to the prototypeJungle tree
  geom.set("Marks",geom.Shape.mk()).namedType(); 

  geom.Marks.setData = function (data) {
    var cn = this.constructor;
    var dl = om.lift(data);
    this.setIfExternal("__data__",dl);
    if (cn) {
      this.update();
    }
    return this;
  }
  
  
  
  // if p is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype

  function boundShape(p,d,isfun) {
    if (isfun) {
      return p(d);
    } else {
      return p.instantiate().setData(d);
    }
  }
  
  geom.Marks.data = function (dt) { // just set the data; don't update
    this.setIfExternal("__data__",om.lift(dt));
  }
  
  // brings shapes and data into sync
  // rebinds data, adds missing shapes,or removes them
  // if they have no associated data
  geom.Marks.sync = function () {
    var shps = this.shapes;
    var sln = shps.length;
    var dt = this.__data__;
    var dln =dt.length;
    for (var i=0;i<sln;i++) {
      if (i<dln) {
        shps[i].setData(dt[i]);
      }
    }
    var p = this.constructor;
    var isf = typeof p == "function";
    for (var i=sln;i<dln;i++) {
      var d = dt[i];
      var nm = boundShape(p,d,isf);
      shps.pushChild(nm);
    }
    for (var i=dln;i<sln;i++) {
      shps[i].remove();
    }
    shps.length = dln;
    return this;
  }
  

  
  
  
    // if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype

  geom.Marks.mk = function (idata,cns) {
    var data = om.lift(idata);
    var rs = Object.create(geom.Marks);
    rs.setIfExternal("constructor",cns);
    rs.setIfExternal("__data__",data);
    rs.set("shapes",om.LNode.mk());
    if (cns) {
      rs.update();
    }
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
      
    

})(prototypeJungle);

