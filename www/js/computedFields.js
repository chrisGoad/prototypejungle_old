
NOT IN USE

  om.set("ComputedField",om.DNode.mk()).namedType();
  
  om.ComputedField.mk = function (fn) {
    var rs = Object.create(om.ComputedField);
    rs.fn = fn;
    return rs;
  }
  // for ease of external syntax, constructors allow computed fields to be represented in the form [function (d) {sflksjl}]
  // x can be a DNode or a plain JSONish structure
  om.toComputedField = function (v) {
     if (Array.isArray(v) && (v.length===1) && (typeof(v[0])==="function")) {
        return om.ComputedField.mk(v[0]);
     } else {
      return v;
     }
  }

  om.DNode.setcf = function (k,fn) {
    var fnv;
    var tp = typeof fn;
    if (tp === "string") {
      var s= "fnv = "+fn;
      eval(s);
    } else if (tp === "function") {
      fnv = fn;
    } else {
      om.error("Expected function in setcf");
    }
    var cf = om.ComputedField.mk(fnv);
    this.set(k,cf);
  }
  // idea: if nd[k] inherits a computed field then use that computation to set its value
  //  because a computed field is a DNode, it will always appear as a DNode in instantiated items, at least
  // until it is replaced by its value.By current assumption, the replacement is  only done at the ends of inheriance
  // chains, or if done in the middle, shields its inheritors and can be repeated by looking at the immediate prototype
  // to look down inheritance chanins.
  
  om.DNode.containsComputedField = function () {
    // todo except separated fields
    if (this.__containsComputedField__) { // maybe we dont need to look at  the proto
      return 1;
    }
    var proto = Object.getPrototypeOf(this);
    if (!proto || (!proto.__parent__)) {
      return undefined;
    }
    return this.__containsComputedField__;
    // this line would search the chain return proto.chainContainsComputedField();
  }
  
  // search in this case
  
    om.LNode.containsComputedField = function () {
      var rs = undefined;
      var ln = this.length;
      for (var i=0;i<n;i++) {
        var cv = this[i];
        if  (cv.containsComputedField) {
          return 1;
        }
      }
    }

  // returns the  computed field at this[k] from this or its prototype
  om.DNode.selectComputedField= function (k) {
    // todo except separated fields
    var v = this[k];
    if (om.ComputedField.isPrototypeOf(v)) {
      return v;
    }
    var proto = Object.getPrototypeOf(this);
    if (!proto || (!proto.__parent__)) {
      return undefined;
    }
    var pv = proto[k];
    if (om.ComputedField.isPrototypeOf(pv)) {
      return pv;
    }
  }
  
  om.DNode.visible = function () {return 0;}
  //  computed fields are evaluated relative the component in which they appear; which is bound to top. 
  // top is the object to which setData has been applied; the this for the functions implementing computed fields
  om.DNode.evaluateComputedField = function (top,src,prp,d) {
    if (om.internal(prp)) return;
    //if ((this !== src) && this.hasOwnProperty(prp)) return; Now, no overriding
    var cf = src[prp];
    if (om.ComputedField.isPrototypeOf(cf)) {
      var cv = cf.fn.call(top,d);
      this[prp] = cv;
    }
  }

  om.nodeMethod("evaluateComputedFields",function (d) {
    var thisHere = this;
  // the recurser
    var r = function(iitem) {
      //if (!iitem.containsComputedField()) return;
      if ((thisHere !== iitem) && (iitem.__externalReferences__  || iitem.__doNotBind__)) return;  // don't go down inside supbcomponents
      var isDNode = om.DNode.isPrototypeOf(iitem);
      if (isDNode) { // first find the computed fields for this node.  These  are ownprops of the immediate prototype which
        // are computed fields
        // see if there are computed fields in the prototype, which are not  overriden
        var ptp = Object.getPrototypeOf(iitem);
        if (!om.inStdLib(ptp)) {
          if (iitem.visible()) { //  &&  ptp.__containsComputedField__) {
            var pop = Object.getOwnPropertyNames(ptp);
            pop.forEach(function (prp) {
              iitem.evaluateComputedField(thisHere,ptp,prp,d);
              return;
              if (om.internal(prp)) return;
              if (iitem.hasOwnProperty(prp)) return;
              var cf = p[prp];
              if (om.ComputedField.isPrototypeOf(cf)) {
                var cv = cf.fn.call(thisHere,d);
                iitem[prp] = cv;
              }
            });
          }
          //code
        }
        // if this is a visible item, evaluate its own computed fields
        if (0 && iitem.visible()) {
          var pop = Object.getOwnPropertyNames(iitem);
          pop.forEach(function (prp) {
            iitem.evaluateComputedField(thisHere,iitem,prp,d);
          });
            

        }
      }
      iitem.iterTreeItems(r,true);// no atomic prop recursion
    }
    r(this);
    return this;
  });
  /*
  Test:
  var ff = function (d) {
    debugger;
    return d[0] + d[1];
  }
  var om = p.om;
  om.root.set("aa",om.DNode.mk());
  om.root.aa.set("bb",om.DNode.mk());
  var cf = om.ComputedField.mk(ff);
  om.root.aa.bb.set("a",cf);
  om.root.set("cc",om.root. aa.instantiate());
  om.root.cc.evaluateComputedFields([1,19]);

  then
  om.root.cc.bb.a
  should be 10
*/
  
  // declare that this node has a descendant which is a computedfield
  om.nodeMethod("declareComputedFieldContainment", function () {
    if (om.DNode.isPrototypeOf(this)) {
      this.__containsComputedField__ = 1;
    }
    var pr = this.__parent__;
    if (!pr || (pr === om.root)) return this;
    pr.declareComputedFieldContainment();
    return this;
  });
  
  
  
   top of om.DNode.mkWidgetLine 
       var cf = om.ComputedField.isPrototypeOf(this);

  
   bottom of same
   
   if (cf) {
      var funBut =  jqp.funbutton.instantiate();
      funBut.html = "Computed Value";
      nspan.addChild("funb",funBut);
      var pth = om.pathToString(this.pathOf(__pj__),".")+".fn";
      funBut.click = function () {showFunction(thisHere.fn,pth)};
    }
    