


(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;

  
  geom.set("Marks",geom.Shape.mk()).namedType();

  geom.Marks.setData = function (data) {
    var proto = this.proto;
    var dl = om.lift(data);
    this.setIfExternal("data",dl);
    var hsd = proto.hadMethod("setData");
    function instantiateProto(d) {
      var ind = proto.instantiate();
      if (hsd) {
        ind.setData(d);
      } else {
        ind.evaluateComputedFields(d);
      }
      return ind;
        
    }
    if (om.LNode.isPrototypeOf(dl)) {
      var members = this.set("members",om.LNode.mk());
      dl.forEach(function (d) {
        members.pushChild(instantiateProto(d));
      });
    } else { // must be  a DNode
      var members = this.set("members",om.DNode.mk());
      for (var k in dl) {
        if (dl.hasOwnProperty(k) && !om.internal(k)) {
          members[k] = instantiateProto(d)
        }
      }
    }
    return this;
  }
  
  geom.Marks.mk = function (proto,data) {
    var rs = Object.create(geom.Marks);
    this.setIfExternal("proto",proto);
    if (data) {
      rs.setData(data);
    }
    return rs;
  }
  
  geom.Marks.mapOverMembers = function (fn) {
    var mms = this.members;
    if (mms) {
      if (om.LNode.isPrototypeOf(mms)) {
        mms.forEach(fn);
      } else {
        for (var k in mms) {
          if (mms.hasOwnProperty(k) && !om.internal(k)) {
            fn(mms[k],k);
          }
        }
      }
    }
  }
    
    
  geom.Marks.show = function () {
    this.mapOverMembers(function (m) {
      m.show();
    });
    return this;
  }
      
    

})(prototypeJungle);

