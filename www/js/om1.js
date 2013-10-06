(function (__pj__) {
  
  var om = __pj__.om;
  
  om.__externalReferences__ = [];
  
  om.isObject = function (o) {
    return o && (typeof(o) == "object");
  }
  
  
  om.isAtomic = function (x) {
    return !om.isObject(x);
  }
    
  
  om.isNode = function(x) { 
    return om.DNode.isPrototypeOf(x) || om.LNode.isPrototypeOf(x);
  }
  
  om.DNode.name = function() {
    return this.__name__;
  }
  
  om.LNode.name = function () {
    return this.__name__;
  }
  
  
  om.DNode.parent = function() {
    return this.get("__parent__");
  }
  
  om.LNode.get = function () {
    return this.get("__parent__");
  }
  
  // a common thing to do: make the same method work DNodes,Lnodes
  om.nodeMethod = function (nm,fn) {
    om.LNode[nm] = om.DNode[nm] = fn;
  }
  // creates DNodes if missing so that path pth descending from this exists
  om.nodeMethod("createDescendant", function (pth) {
    var cnd = this;
    pth.forEach(function (k) {
      // ignore "" ; this means that createDescendant can be used on __pj__
      if (k=="") return;
      if (!om.checkName(k)){
        om.error('Ill-formed name "'+k+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
      }
      var d = cnd[k];
      if (d === undefined) {
        var nnd = om.DNode.mk();
        cnd.set(k,nnd);
        cnd = nnd;
      } else {
        if (!cnd.hasOwnProperty(k)) om.error("Conflict in createDescencant",pth.join("/"));
        if (!om.isNode(d)) om.error("Conflict in createDescendant ",pth.join("/"));
        cnd = d;
      }
    });
    return cnd;
  })
    
  
  // causes manual overriding of fields to be recorded
  om.nodeMethod("computed",function () {
    this.__computed__ = 1; 
    return this;
  });
  
  om.nodeMethod("mfreeze",function (k) {
    if (typeof k == "string") {
      this.setFieldStatus(k,"mfrozen");
    } else {
      this.__mfrozen__=1;
    }
    return this;
  });
  
  
  
  // assumes node[nm] is  c, or will be c. checks c's suitability
  function adopt(node,nm,c) {
    if (om.isNode(c)) {
      c.__name__ = nm;
      c.__parent__ = node;
    } else if (c && (typeof(c)=="object")) {
      om.error('Only Nodes and atomic values can be set as children in <Node>.set("'+nm+'",<val>)');
    } 
  }
  
  
  
  om.getval = function (v,k) {
    if (!v) {
      om.error("null v");
    }
     if (v.hasOwnProperty(k)) {
      return v[k];
    }
    return undefined;
  }
  
  
 // we need to know if things are shapes, so that set order can be tracked.
 // some forward referencing involved
 
  function isShape(x) {
    var geom = __pj__.geom;
    if (geom) {
      var sh = geom.Shape;
      if (sh) {
        return __pj__.geom.Shape.isPrototypeOf(x);
      }
    } 
  }
  
  // since order is important for drawing, order of sets is preserved here.
  // specifically, each dnode has a __setCount__ just counting how many sets have been done over time
  // each of its Node children has a __setIndex__, which was the value of __setCount__ when it was set
  // then drawing draws children in setIndex order
  

  function setChild(node,nm,c) {
    adopt(node,nm,c);
    node[nm] = c;
    if (isShape(node)) {
      // keep track of shape and lnode children order
      if (isShape(c) || om.LNode.isPrototypeOf(c)) {
        //console.log("setting  shapehild ",c.__name__," of ",node.__name__);
        var scnt = om.getval(node,'__setCount__');
        scnt = scnt?scnt+1:1;
        node.__setCount__ = scnt;
        c.__setIndex__ = scnt;
      }
    }
  }
  // key might be a path
  // For now, the only meaningful value of status is "mfreeze"
 

  
  om.DNode.set = function (key,val,status) { // returns val
    if (typeof(key)=="string") {
      var idx = key.indexOf("/");
    } else { 
      idx = -1;
    }
    if (idx >= 0) {
      var pth = key.split("/");
      var nm = pth.pop();
      var pr = this.createDescendant(pth);
    } else {
      pr = this;
      nm = key;
    }
    if (!om.checkName(nm)){
      om.error('Ill-formed name "'+nm+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
    }
    setChild(pr,nm,val);
    if (status == "mfrozen") {
      pr.mfreeze(nm);
    }
    return val;
  }
  

  
  
  om.LNode.set = function (key,val) {
    setChild(this,key,val);
    return val;
  }
  
  // always use this instead of push
  om.LNode.pushChild = function (val) {
    var ln = this.length;
    adopt(this,ln,val);
    this.push(val);
  }
  
  om.DNode.setf = function (key,val) {
    return this.set(key,val,"mfrozen"); // frozen from manual modification
  }
  
  // set if non-null
  om.DNode.setN = function (key,val) {
    if (val) {
      return this.set(key,om.toNode(val));
    }
  }
  
  
  
  om.DNode.setIfMissing = function (k) {
    if (this[k] === undefined) {
      this.set(k,om.DNode.mk());
    }
    return this[k];
  }
  
  
  
  
  
  
  
  // the central structure is a tree, made of 2 kinds of internal nodes (DNode,LNode), and atomic leaves (numbers,null,functions,strings)
  // internal nodes have __name__ and __parent__attributes
  
  // a DNode is what python calls a dictionary 
  
  
  
  
  
  om.DNode.mk = function () {
    return Object.create(om.DNode);
  }
  
  
  om.LNode.mk = function(a) {
    var rs = Object.create(om.LNode);
    if (a==undefined) return rs;
    var ln = a.length;
    for (var i=0;i<ln;i++) {
      var ch = a[i];
      ch.__parent__ = rs;
      ch.__name__ = ""+i;
      rs.push(ch);
    }
    return rs;
  }
  
  // backward compatability
  
  om.mkLNode = om.LNode.mk;
  
  __pj__.set("anon",om.DNode.mk()); // where code from the anonymous items lives
  
  // utilities for constructing Nodes from ordinary objects and arrays
  // recurses down to objects that are already nodes
  // o is an array or an object
  
  om.toNode1 = function (parent,nm,o) {
    var tp = typeof o;
    if ((o === null) || (tp != "object")) {
      parent[nm] = o;
      return;
    }
    if (om.isNode(o)) {
      var rs = o;
    } else {
      if (Array.isArray(o)) {
        var rs = om.toLNode(o,null);
      } else {
        var rs = om.toDNode(o,null);
      }
      
    }
    rs.__parent__ = parent;
    rs.__name__ = nm;
    parent[nm] = rs;
  }
  
  // transfer the contents of ordinary object o into idst (or make a new destination if idst is undefined)
  om.toDNode = function (o,idst) {
    if (om.DNode.isPrototypeOf(o)) return o; // already a DNode
    if (idst) {
      var dst = idst;
    } else {
      var dst = om.DNode.mk();
    }
    for (k in o) {
      if (o.hasOwnProperty(k)) {
        var ok = o[k];
        om.toNode1(dst,k,ok);
      }
    }
    return dst;
  }
  
  om.toLNode = function (a,idst) {
    if (idst) {
      var dst = idst;
    } else {
      dst = om.LNode.mk();
    }
    a.forEach(function (v) {   
      dst.pushChild(om.toNode(v));
    });
    return dst;
  }
  
  om.toNode = function (o) {
    if (Array.isArray(o)) {
      return om.toLNode(o);
    } else if (o && (typeof o == "object")) {
      return om.toDNode(o);
    } else {
      return o;
    }
  }
  
  om.lift = om.toNode;
  
  
  om.DNode.iterItems = function (fn) {
    for (var k in this) {
      if (this.hasOwnProperty(k) && !om.internal(k))  {
        fn(this[k],k);
      }
    }
    return this;
  }
  
  // an atomic property, or tree property
  om.nodeMethod("properProperty",function (k,knownOwn) {
    if (!knownOwn &&  !this.hasOwnProperty(k)) return false;
    if (om.internal(k)) return false;
    var v = this[k];
    var tp = typeof v;
    if ((tp == "object" ) && v) {
      return om.isNode(v) && (v.__parent__ === this)  && (v.__name__ === k);
    } else {
      return true;
    }
  });
  
  // only include atomic properties, or properties that are proper treeProperties (ie parent child links)
  // exclude internal names too
  om.DNode.ownProperties = function () {
    var nms = Object.getOwnPropertyNames(this);
    var rs = [];
    var thisHere = this;
    nms.forEach(function (nm) {
      if (thisHere.properProperty(nm)) rs.push(nm);
    });
    return rs;
  }
  
  function dnodeProperties(rs,nd,stopAt) {
    if (nd == stopAt) return;
    //var nms = Object.getOwnPropertyNames(nd);
    var nms = nd.ownProperties();
    nms.forEach(function (nm) {
      if (!om.internal(nm)) rs[nm]=1;
    });
    dnodeProperties(rs,Object.getPrototypeOf(nd),stopAt);
  }
  // properties from the prototype chain down until stopAt, which defaults to DNode
  om.DNode.properties = function (stopAt) {
    var rs = {};
    dnodeProperties(rs,this,stopAt?stopAt:om.DNode);
    var rsa = [];
    for (var k in rs) rsa.push(k);
    return rsa;
  }

  
  
  om.DNode.iterTreeItems = function (fn,excludeAtomicProps) {
    var ownprops = Object.getOwnPropertyNames(this);
    var thisHere = this;
    ownprops.forEach(function (k) {
    //for (var k in this) {
      if (thisHere.treeProperty(k,excludeAtomicProps))  {
        fn(thisHere[k],k);
      }
    });
    return this;
  }
  
  om.DNode.iterInheritedItems = function (fn,includeFunctions,alphabetical) {
    var thisHere = this;
    function perKey(k) {
      var kv = thisHere[k];
      if ((includeFunctions || (typeof kv != "function")) && !om.internal(k)) {
        fn(kv,k);
      }
    }
    var keys = this.properties();
    if (alphabetical) {
      //var keys = [];
      //for (k in this) {
      //  keys.push(k);
      //}
      keys.sort();
    }
    keys.forEach(perKey);
  //  } else {
   //   for (var k in this) {
  //      perKey(k);
   //  
    return this;
   
  }
  
  om.DNode.iterInheritedTreeItems = function (fn,otherProps) {
    for (var k in this) {
      if (this.inheritedTreeProperty(k)) fn(this[k],k);
    }
    if (!otherProps) return this;
    var thisHere = this;
    otherProps.forEach(function (k) {
      if (thisHere.treeProperty(k)) {
        var v = thisHere[k];
        fn(v,k);
      }
    });
    return this;
  }
  om.LNode.iterItems = function (fn) {
    this.forEach(fn);
    return this;
  }
  
  om.LNode.iterTreeItems = function (fn,excludeAtomicProps) {
    var thisHere = this;
    this.forEach(function (v,k) {
      if (thisHere.treeProperty(k,excludeAtomicProps))  {
        fn(v,k);
      }
    })
    return this;
  }
  
  
  
  om.LNode.iterInheritedItems = function (fn) {
    this.forEach(fn);
    return this;
  }
  
  
  
  om.DNode.iterValues = function (fn) {
    var rs = false;
    for (var k in this) {
      if (this.treeProperty(k)) {
        if (fn(this[k])) {
          rs = true;
        }
      }
    }
    return rs;
  }
  
  om.DNode.setProps = function (prps) {
    return om.setProperties(this,prps);
  }
  
  
  om.DNode.keys = function () {
    var rs = [];
    for (var k in this) {
      if (this.hasOwnProperty(k) && !om.internal(k)) {
        rs.push(k);
      }
    }
    return rs;
  }
  
  // path relative to rt. if rt is not in the ancestor chain, "/" occurs at the beginning
  // of the path returned
  om.nodeMethod("pathOf",function (rt) {
    var rs = [];
    var pr = this.__parent__;
    if (!pr) return undefined;
    var cx = this;
    while (true) {
      if (cx == rt) return rs;
      if (!cx || cx == __pj__) {
        rs.unshift("/");
        return rs;
      }
      var nm = om.getval(cx,"__name__");
      if (nm !== undefined) {
        rs.unshift(cx.__name__);
      }
      cx = om.getval(cx,"__parent__");
    }
    return undefined;
  });
  
  // name of the ancestor just below __pj__; for tellling which top level library something is in 
  om.nodeMethod("topAncestorName",function (rt) {
    if (this == rt) return undefined;
    var pr = this.get("__parent__");
    if (!pr) return undefined;
    if (pr == rt) return this.__name__;
    return pr.topAncestorName(rt);
  });
  
  //var stdLibs = {om:1,geom:1};
  var stdLibs = {om:1};
  
  om.inStdLib = function (x) {
    var nm = x.topAncestorName(__pj__);
    return stdLibs[nm];
  }
  
  // omits initial "/"s
  om.pathToString = function (p,sep) {
    if (!sep) sep = "/";
    var ln = p.length;
    var rs = p.join(sep);
    if (ln>0) {
      if (p[0]==sep) return rs.substr(1);
    }
    return rs;
  }
  
  om.nodeMethod("pathAsString",function (rt) {
    return om.pathToString(this.pathOf(rt));
  });
  
  om.nodeMethod("remove",function () {
    var pr = this.__parent__;
    var nm = this.__name__;
    // @todo if the parent is an LNode, do somethind different
    pr[nm] = undefined;
  });
  
  om.DNode.values = function () {
    var rs = [];
    for (var k in this) {
      if (this.hasOwnProperty(k) && !om.internal(k)) {
        rs.push(this[k]);
      }
    }
    return rs;
  }
  
  om.removeDups = function (a) {
    var d = {};
    var rs = [];
    a.forEach(function (v) {
      if (d[v]===undefined) {
        d[v] = 1;
        rs.push(v);
      }
    });
    return rs;
  }
   
  // iipth might be a string or an array.  A relative path starts without a "/" or without"" if an array.
  // if a relative path use this as the start point. ow start with root (which is set to __pj__ if missing)
  // this works for trees of nodes, but also for ordinary javascript object hierarchies
  
  om.evalPath = function (origin,iipth,root,createIfMissing) {
    // if path starts with "" or "/" , take this out
    if (!iipth) return; // it is convenient to allow this option
    if (typeof iipth == "string") {
      var ipth = iipth.split("/");
    } else {
      ipth = iipth;
    }
    var p0 = ipth[0];
    // strip initial / or ""
    if ((p0 == "")||(p0 == "/")) {
      if (root) {
        var cv = root;
      } else {
        var cv = __pj__;
      }
      var pth = ipth.concat();
      pth.shift();
    } else {
      cv = origin;
      pth = ipth;
    }
    var ln = pth.length;
    // strip a final "" too
    if ((ln>0) && (pth[ln-1] == "")) {
      pth.pop();
      ln--;
    }
    for (var i=0;i<ln;i++) {
      var k = pth[i];
      var tp = typeof cv;
      if (cv && ((tp == "object"))) {
        var nv = cv[k];
        if (!nv && createIfMissing) {
          if (om.isNode(cv)) {
            var nv = om.DNode.mk();
            cv.set(k,nv);
          } else {
            cv[k] = nv;
          }
        }
        cv = nv;
      } else {
        return undefined;
      }
    }
    return cv;
  }

  om.DNode.evalPath = function (pth,createIfMissing) {
    return om.evalPath(this,pth,undefined,createIfMissing);
  }
    
  om.createPath = function (origin,pth) {
    return om.evalPath(origin,pth,null,true);
  }
    
  
  om.nodeMethod("pathSetValue", function (o,path,v) {
    var lnm1 = path.length - 1;
    var spth = path.slice(0,lnm1);
    var lst = path[lnm1];
    var fp = this.evalPath(spth);
    if (fp) {
      fp[lst] = v;
    }
  });
  
  
  om.applyMethod = function (m,x,a) {
    if (x && ((typeof(x)=="object")||(typeof(x)=="function"))) {
      var mth = x[m];
      if (mth && (typeof mth == "function")) {
        return mth.apply(x,a);
      }
    }
    return x;
  }
  
  
  
  
  // internal properties are excluded from the iterators and recursors 
  
  om.internalProps = {"__parent__":1,"__protoChild__":1,"__value__":1,"__hitColor__":1,"__chain__":1,"__copy__":1,__name__:1,widgetDiv:1,
    __protoLine__:1,__inCopyTree__:1,__headOfChain__:1};
  om.internal = function (nm) {
     return om.internalProps[nm];
  }
  
  // only consider objects on the chain which are in the tree
  om.DNode.findPropertyOnInheritanceChain = function (p) {
    var v = this.get(p);  
    if (typeof v != "undefined") {
      return this;
    }
    var pr = Object.getPrototypeOf(this);
    if (!pr.__parent__) return undefined;
    return pr.findPropertyOnInheritanceChain(p);
  }
  
  // because non-atomic properties are duplicated along the inheritance chain,
  // we restrict non-atomic properties  to the current element of the chain.
  om.DNode.inheritedTreeProperty = function (p,excludeAtomicProps) {
    if (om.internal(p)) return false;  
    var ch = this[p];
    var tpc = typeof ch;
    if (ch && ((tpc=="object")||(tpc=="function"))) {
      var pr = ch.__parent__;
      return (pr == this);
    } else {
      if (excludeAtomicProps) return false; // an atom
      // we include only properties inherited from tree members
      var whi = this.findPropertyOnInheritanceChain(p);
      return whi?true:false;
      
    }
  }
  
  // a proper element of the tree.
  om.nodeMethod("treeProperty", function (p,excludeAtomicProps) {
    if ((!this.hasOwnProperty(p)) ||  om.internal(p)) return false;
    var ch = this[p];
    if (om.isNode(ch)) {
      return ch.__parent__ == this;
    } else {
      return !excludeAtomicProps;
    }
  });
  
  om.nodeMethod("nonAtomicTreeProperty", function (p) {
   return this.treeProperty(p,1);
  });
  
  
  
  
  om.nodeMethod("children",function () { // only the object children
    var rs = [];
    this.iterValues(function (k,v) {
      if (om.isObject(v)) {
        rs.push(v);
      }});
    return rs;
  });
  
  
  
  om.hasMethod = function(x,name) {
    var tpx = typeof x;
    if (x && (tpx == "object")) {
      var mth = x[name];
      if (typeof mth == "function") return mth;
    }
    return undefined;
  }
  
  
  om.nodeMethod("getMethod",function(x,name) {
    var tpx = typeof x;
    if (x && (tpx == "object")) {
      var mth = x[name];
      if (typeof mth == "function") return mth;
    }
    return undefined;
  });
  
  
  // since computed content will replace things with others at the same path, we need to have
  // a path-based rep of what is selected.
  
  om.nodeMethod("treeOfSelections",function () {
    var rs;
    this.iterTreeItems(function (c) {
      var nm = c.__name__;
      if (c.__selected__) {
        rs = rs?rs:{};
        rs[nm] = 1;
      } else {
        var stos = c.treeOfSelections();
        if (stos) {
          rs = rs?rs:{};
          rs[nm] = stos;
        }
      }
    },true);
    return rs;
  });
  
  
  om.nodeMethod("installTreeOfSelections",function (tos) {
    if (tos == 1) {
      this.__selected__ = true;
      this.deepSetProp("__selectedPart__",1);
      this.setPropForAncestors("__descendantSelected__",1,__pj__.draw.wsRoot);
    } else if (tos) {
      this.iterTreeItems(function (c) {
        var nm = c.__name__;
        c.installTreeOfSelections(tos[nm]);
      },true);
    }
  });
 
  
  // overrides should  only  be specified in the top level call
  
  om.updateErrors = [];
  
  function deepUpdate(nd,ovr) {
    if (nd.__doNotUpdate__) {
      return;
    }
    var mthi = om.getMethod(nd,"update");
    if (mthi) {
      try {
        mthi.call(nd,ovr);
      } catch(e) {
        var erm = e.message;
        om.updateErrors.push(erm);
        om.log("updateError",erm);
      }
      
    } else {
      nd.iterTreeItems(function (c) {
        if (ovr) {
          var nm = c.__name__;
          var subovr = ovr[nm];
          if (typeof subovr != "object") {
            subovr = undefined;
          }
        }
        deepUpdate(c,subovr);
      },true);
    }
  }
  om.nodeMethod("deepUpdate",function (ovr,tos) {
    //if (this.__isPrototype__) return;
    if (!tos) {
      tos = this.treeOfSelections();
    }
    deepUpdate(this,ovr);
    if (ovr) {
      this.installOverrides(ovr);
    }
    this.installTreeOfSelections(tos);
  });
  
  
  
  // add an override to override tree dst, for this[k], with respect to the given root
  om.DNode.addOverride = function (dst,k,root) {
    var v = this[k];
    var p = this.pathOf(root);
    var cn  = dst;
    p.forEach(function (nm) {
      var nn = cn[nm];
      if (!om.isObject(nn)) {
        nn = {};
        cn[nm] = nn;
      }
      cn = nn;
    });
    cn[k] = v;
  }
  
  om.pathLookup = function (ovr,path) {
    var ln = path.length;
    var cv = ovr;
    for (var i=0;i<ln;i++) {
      var nm = path[i];
      var cv = cv[nm];
      if (cv === undefined) {
        return undefined;
      }
    }
    return cv;
  }
  
  om.DNode.findInOverride = function (ovr,root) { // find the correpsponding node in override
    var pth = this.pathOf(root);
    return om.pathLookup(ovr,pth);
  }
      
    
  // transfer the values of the specified properties to the override ovr; nothing is done if there is no corresponding prop in ovr
  // only atomic props will be transferred
  // root is the DNode corresponding to the root node of ovr
  
  om.DNode.transferToOverride = function (ovr,root,props) {
    if (!ovr) return;
    var nd = this.findInOverride(ovr,root);
    var thisHere = this;
    if (nd) {
      props.forEach(function (p) {
        var v = thisHere[p];
        var tpv = typeof v;
        if ((tpv == "object") && v) return;
        nd[p] = v;
      });
    }
  }
  
  // root is normally draw.wsRoot, and ovrRoot draw.overrides
  om.DNode.addOverridesForInsert = function(root,ovrRoot) {
    var tovr = this.__overrides__;
    if (tovr) {
      var pth = this.__parent__.pathOf(root);
      var covr = om.evalPath(ovrRoot,pth,null,true);
      covr[this.__name__] = tovr;
    }
  }
   

 })(prototypeJungle);

