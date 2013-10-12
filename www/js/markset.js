


(function (__pj__) {
  var om = __pj__.om;
  
  om.set("ComputedField",om.DNode.mk()).namedType();
  
  om.ComputedField.mk = function (fn) {
    var rs = Object.create(om.ComputedField);
    rs.fn = fn;
    return rs;
  }
  // for ease of external syntax, constructors allow computed fields to be represented in the form [function (d) {sflksjl}]
  // x can be a DNode or a plain JSONish structure
  om.toComputedField = function (v) {
     if (Array.isArray(v) && (v.length==1) && (typeof(v[0]=="function"))) {
        return om.ComputedField.mk(v[0]);
     } else {
      return v;
     }
  }

  // untested
  om.installComputedFields = function (x) {
    function perKey(k) {
      var v = x[k];
      if (v) {
        if (Array.isArray(v) && (v.length==1) && (typeof(v[0]=="function"))) {
          thisHere[k] = om.ComputedField.mk(v[0]);
        } else if (typeof v == "object") {
          om.installComputedFields(v);
        }
      }
    }
    if (Array.isArray(x)) {
      x.forEach(function (v,k) {perKey(k);});
    } else {
      var props = Object.getOwnPropertyNames(x);
      props.forEach(perKey);
    }
    
  }
  
  om.icf = om.installlComputedFields; // used frequently
        
  // this will have only one argument for the top level call
  om.nodeMethod("setData",function (iitem,iid) {
    if (iid) {
      
      var item = iitem; 
      var id = iid;
      //code
    } else {
      var id = iitem; //top level call
      var item  = this;
    }
    var d = om.lift(id);
    if (d.__parent__) {
      this.data = d; // a reference, not an adoption, since the input was already in the pj tree
    } else { // a reference, not an adoption
       this.set("data",d);
    }
    var thisHere = this;
    this.iterInheritedItems(function (v,k) {
      if (om.ComputedField.isPrototypeOf(v)) {
        var fnv = v.fn.call(null,item,d,thisHere,k);
        if (fnv!==undefined) {
          thisHere[k] = fnv;
        }
        return;
      } else if ((typeof v == "object") && v) {
        var rs = v.bindData(item,d);
        if (rs!==undefined) {
          thisHere.set(k,rs);
        }
      }
    },true); // include functions
    return this;
  });
  
  // a set of objects, each associated with data.  The members might be an LNode or a DNode
  
  om.DNode.setIfExternal = function (nm,vl) { // adopts vl below this if it is not already in the pj tree,ow just refers
    if (vl.get("__parent__")) {
      this[nm] = vl;
    } else {
      this.set(nm,vl);
    }
    return vl;
  }
  
  om.set("Marks",om.DNode.mk()).namedType();

  om.Marks.setData = function (data) {
    var dl = om.lift(data);
    this.setIfExternal("data",dl);
    if (om.LNode.isPrototypeOf(dl)) {
      var members = this.set("members",om.LNode.mk());
      dl.forEach(function (d) {
        members.pushChild(proto.instantiate().setData(d));
      });
    } else { // must be  a DNode
      var members = this.set("members",om.DNode.mk());
      for (var k in dl) {
        if (dl.hasOwnProperty(k) && !om.internal(k)) {
          members[k] = proto.instantiate().setData(dl[k]);
        }
      }
    }
    return this;
  }
  
  om.Marks.mk = function (proto,data) {
    var rs = Object.create(om.MarkSet);
    this.setIfExternal("proto",proto);
    if (data) {
      rs.setData(data);
    }
    return rs;
  }
   
      
    

})(prototypeJungle);

