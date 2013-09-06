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
  
  function setChild(node,nm,c) {
    adopt(node,nm,c);
    node[nm] = c;
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
  
  
      //code
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
  
  
  om.DNode.ownProperties = function () {
    var nms = Object.getOwnPropertyNames(this);
    var rs = [];
    nms.forEach(function (nm) {
      if (!om.internal(nm)) rs.push(nm);
    });
    return rs;
  }
  
  function dnodeProperties(rs,nd,stopAt) {
    if (nd == stopAt) return;
    var nms = Object.getOwnPropertyNames(nd);
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
      if (!cx || cx == __pj__) {
        rs.unshift("/");
        return rs;
      }
      if (cx == rt) return rs;
      var nm = om.getval(cx,"__name__");
      if (nm) {
        rs.unshift(cx.__name__);
      }
      cx = om.getval(cx,"__parent__");
    }
    return undefined;
  });
  
  // name of the ancestor just below __pj__; for tellling which top level library something is in 
  om.nodeMethod("topAncestorName",function (rt) {
    if (this == rt) return undefined;
    var pr = this.__parent__;
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
   
  // iipth might be a string or an array.  A relative path starts with "/" or with "" if an array.
  // if a relative path use this as the start point. ow start with root (which is set to __pj__ if missing)
  
  om.evalPath = function (origin,iipth,root) {
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
      if (cv && ((tp == "object")||(tp == "function"))) {
        cv = cv[k];
      } else {
        return undefined;
      }
    }
    return cv;
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
  
  function deepUpdate(nd,ovr) {
    var mthi = om.getMethod(nd,"update");
    if (mthi) {
      mthi.call(nd,ovr);
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
   
    
  om.nodeMethod("removeComputed",function () {
    if (this.__computed__) {
      this.remove();
    } else {
      this.iterTreeItems(function (nd) {
        nd.removeComputed();
      },true);  
    }
  });


  om.removeValues =  function (x) {
    x.deepApplyMeth("removeValue",null,true); // true means dont stop - recurse past where removeValue works
  }  
  
 
  
  om.arrayToDict = function (a) {
    var rs = {};
    a.forEach(function (k) {rs[k] = 1;});
    return rs;
  }
  
  // doesn't set if not defined
  om.DNode.xferProperty = function (p,src) {
    var v = src[p];
    if (v===undefined) return undefined;
    this[p] = v;
    return v;
  }
  
  
  // if autoConvert then ordinary objects eg {a:1,b:2} are converted to nodes
  om.DNode.setProperties = function (src,props,status,autoConvert) {
    if (!src) return;
    if (props) {
      var pd = om.arrayToDict(props);
    }
    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        if (props) {
          if (pd[k]===undefined) continue;
        }
        var val = src[k];
        if (val === undefined) continue;
        if (autoConvert) {
          val = om.toNode(val);
        }
        this.set(k,val,status);
      }
    }
    return this;
  }
  
  // used in new<T>type; converts property values to nodes when appropriate
  
  om.DNode.setPropertiesN= function (src,props,status) {
    return this.setProperties(src,props,status,1);
  }
  
  // used in new<T>type ; converts property values to nodes when appropriate
  
  // check that a tree with correct parent pointers and names descends from this node. For debugging.
  om.nodeMethod("checkTree",function () {
    var thisHere = this;
    this.iterTreeItems(function (v,k) {
      if ((v.__parent__) != thisHere) om.error(thisHere,v,"bad parent");
      if ((v.__name__) != k) om.error(thisHere,v,"bad name");
      v.checkTree();
    },true);
  });
  
  
  // gets rid of __parent__ pointers, brings atomic data over from prototypes; no functions
  om.DNode.stripOm = function () {
    var rs = {};
    for (var k in this) {
      if (this.nonAtomicTreeProperty(k)) {
        var kv = this[k];
        rs[k] = kv.stripOm();
      } else {
        kv = this[k];
        var tp = typeof kv;
        if (kv && (tp != "object") && (tp != "function")) {
          rs[k] = kv;
        }
      }
    }
    return rs;
  }
  
   om.LNode.stripOm = function () {
    var rs = [];
    var ln = this.length;
    for (var i=0;i<ln;i++) {
      if (this.nonAtomicTreeProperty(i)) {
        var kv = this[i];
        rs.push(kv.stripOm());
      } else {
        kv = this[i];
        var tp = typeof kv;
        if (kv && (tp != "object") && (tp != "function")) {
          rs.push(kv);
        }
      }
    }
    return rs;
  }
  
  
  // this functxion stuff is obsolete, I think
// so that we can get the effect of new Function with an arbitrary number of arguments
  om.createJsFunction = (function() {
    function F(args) {
        return Function.apply(this, args);
    }
    F.prototype = Function.prototype;

    return function(args) {
        return new F(args);
    }
})();

  
  om.pw = "vMfm7i1r";
  

  om.parseFunctionText = function (x) {
    xnc = x;
    var r = /\s*function\s*\w*\s*\(([^\)]*)\)/
    var m = xnc.match(r);
    var args = m[1].split(",");
    var idx = xnc.indexOf(")");
    var body = xnc.substring(idx+1);
    var bidx = body.indexOf("{");
    var lbidx = body.lastIndexOf("}");
    var sbd = body.slice(bidx+1,lbidx);
   var allArgs = args.concat(sbd);
    var rs =om.createJsFunction(allArgs);
    return rs;
  }
  
  om.toFunction = function (f) {
    if (typeof(f) != "function") om.error("Expected function");
    var pt = om.parseFunctionText(f.toString());
    return new om.Function(pt);
  }
  
   // declares something as a type. This makes no difference to anything, except displaying the type of an object in the tree browser
   om.DNode.installType = function (nm,ipr) {
    if (!ipr) {
      var pr = om.DNode.mk();
    } else {
      pr = ipr;
    }
    pr.__isType__ = 1;
    this.set(nm,pr);
    return pr;
    
  }
  
  
  
  om.DNode.namedType = function () { // shows up in the inspector
    this.__isType__ = 1;
    return this;
  }

  // the path of the proto of this fellow
  // if the proto is inside rt, return eg a/b/c ow return /a/b/c
  
  
  om.DNode.protoPath = function (rt) {
    var pr = Object.getPrototypeOf(this);
    var ppr = om.getval(pr,"__parent__");
    if (!ppr) return undefined;
    var rs = om.pathOf(pr,rt);
    return rs;
  }
  
  om.nodeMethod("get",function (k) { // get without inheritance from proto
    if (this.hasOwnProperty(k)) {
      return this[k];
    }
    return undefined;
  });
  
  om.getval = function (v,k) {
    if (!v) {
      om.error("null v");
    }
     if (v.hasOwnProperty(k)) {
      return v[k];
    }
    return undefined;
  }

 

// might be itself
om.DNode.lastProtoInTree = function () {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent__; 
  if (!pr) return this;
  return p.lastProtoInTree();
}


// get the name of the nearest proto declared as atyhpe
 om.DNode.protoName = function () {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent__; 
  if (!pr) return "";
  if (p.get('__isType__')) {
    var nm = p.__name__;
    return nm?nm:"";
  }
  return p.protoName();
  
}



 om.LNode.protoName = function () {
  return "LNode";
 }

 
 
 om.DNode.hasTreeProto = function () {
   var pr = Object.getPrototypeOf(this);
   return pr && (pr.__parent__);
 }
 
 Function.prototype.hasTreeProto = function () {return false;}
 
  om.LNode.hasTreeProto = function () {
    return false;
  }
  
  
  
  
  om.nodeMethod("deepApplyFun", function (fn) {
    fn(this);
    this.iterTreeItems(function (c) {
      c.deepApplyFun(fn);
    },true);
  });
  
  
  
  om.nodeMethod("applyFunToAncestors",function (fn,stopAt) {
    fn(this);
    if (this == stopAt) return;
    var pr = this.__parent__;
    if (pr) {
      pr.applyFunToAncestors(fn,stopAt);
    }
  });
  
  


  om.nodeMethod("deepApplyMeth",function (mth,args,dontStop) { // dontstop recursing once the method applies
    var mthi = om.getMethod(this,mth);
    var keepon = true;
    if (mthi) {
      mthi.apply(this,args);
      if (!dontStop) keepon = false;
    }
    if (keepon) {
      this.iterTreeItems(function (c) {
        c.deepApplyMeth(mth,args,dontStop);
      },true);
    }
  });
   
  
  om.nodeMethod("deepSetProp",function (p,v) {
    this.deepApplyFun(function (nd) {nd[p]=v;});
  });
  
  
  
  om.nodeMethod("deepDeleteProps",function (props) {
    this.deepApplyFun(function (nd) {
      props.forEach(function (p) {
        delete nd[p];
      });
    });
  });
  
  
  om.nodeMethod("setPropForAncestors",function (p,v,stopAt) {
    this.applyFunToAncestors(function (nd) {nd[p]=v;},stopAt);
  });
  
    
  
  // max,min value of c[fld] for children of this
  om.LNode.maxOrMin= function (fld,isMax) {
    var rs = isMax?-Infinity:Infinity;
    this.forEach(function (v) {
      var f = v[fld];
      if (typeof rs == "number") {
        rs = isMax?Math.max(rs,f):Math.min(rs,f)
      }
    });
    return rs;
  }
  
  
  om.LNode.min = function (fld) {
    return this.maxOrMin(fld,false);
  }
  
  
  
  om.LNode.max = function (fld) {
    return this.maxOrMin(fld,true);
  }
  
  // collect function definitions below this
  om.nodeMethod("funstring1",function (sf,whr) {
    this.iterTreeItems(function (v,k) {
      if (om.isNode(v)) {
        v.funstring1(sf,whr+k+".");
      } else {
        if (typeof v == "function") {
          var s = sf[0];
          var fnc = v.toString();//.replace(/(;|\{|\})/g,"$&\n");
          s += whr+k+" = " + fnc;
          s += "\n\n";
          sf[0] = s;
        }
      }
    })
  });
  
  
  
  om.nodeMethod("funstring",function (forAnon) {
    if (forAnon) {
      var whr = "__pj__.anon.";
    } else {
      var p = this.pathOf(__pj__);
      var whr ="__pj__."+p.join(".")+".";
    }
    var rs = [""];
    this.funstring1(rs,whr);
    return rs[0];
  });
  
  
  // assumed: this[k] is defined. Which proto did the value of k come from? 
  om.DNode.findOwner = function (k) {
    var cv = this;
    while (cv) {
      if (cv.hasOwnProperty(k)) return cv;
      cv = Object.getPrototypeOf(cv);
    }
  }
    
  
  // is the value of this[p] inherited from nd[p]?
  om.DNode.inheritsPropertyFrom = function( nd,p) {
    var would = true; // at the moment, we only care if this[p] would be inherited from nd[p], not if it actually does
    if (this == nd) {
      return this.hasOwnProperty(p);
    }
    if (!nd.isPrototypeOf(this)) return false;
    var v = nd[p];
    if (v === undefined) {
      return false;
    }
    var cpr = this;
    while (true) {
      var npr =  Object.getPrototypeOf(cpr);
      if (npr == nd) {
        if (would) {  // this would inherit  from this slot, if it were defined
          return true;
        } else {
          return npr.hasOwnProperty(p);
        }
      }
      cpr = npr;
    }
  }
  
  
  om.LNode.inheritsPropertyFrom = function( nd,p) {
    return false;// no inheritance for LNodes
  }
  
  //does any node in the tree descending from this inherit a property value from nd[p]?
  om.nodeMethod("treeInheritsPropertyFrom",function (nd,p) {
    if (this.inheritsPropertyFrom(nd,p)) return true;
    for (var k in this) {
    if (this.treeProperty(k,true))  {
      var v = this[k];
      if (v.treeInheritsPropertyFrom(nd,p)) return true;
        //code
      }
    }
    return false;
  });
  

  
  // is the value of this[p] inherited from nd[p]?
  
  // is some property among props (an object which has p:1 for each prop p) inherited from nd?
  om.DNode.inheritsSomePropertyFrom = function( nd) {
    // first compute the candidate properties for inheritance.
    if (this==nd) return true;
    if (!nd.isPrototypeOf(this)) return false;
    var props = Object.getOwnPropertyNames(nd);
    var ln = props.length;
    for (var i=0;i<ln;i++) {
      var p = props[i];
      if (!om.internal(p)) {
        if (this.inheritsPropertyFrom(nd,p)) return true;
      }
    }
    return false;
  }

  om.LNode.inheritsSomePropertyFrom = function () {return false;}
  
  om.nodeMethod("treeInheritsSomePropertyFrom",function (nd,p) {
    if (this.inheritsSomePropertyFrom(nd,p)) return true;
    for (var k in this) {
      if (this.treeProperty(k,true))  {
        var v = this[k];
        if (v.treeInheritsSomePropertyFrom(nd,p)) return true;
      }
    }
    return false;
  });
  
  // so LNodes can be included as raw data, in a slot where an evaluatable object might appear instead
  om.LNode.eval = function () {
    return this;
  }
  
  
  om.DNode.createChild = function (k,initFun){
    var rs = this[k];
    if (rs) return rs;
    rs = initFun();
    this.set(k,rs);
    return rs;
  }
  
  
  
  om.DNode.setNote = function (k,note) {
    var notes = this.setIfMissing('__notes__');
    notes[k] = note;
  }
  
  // lib is the library where defined, fn is the function name
  om.DNode.setInputF = function (k,lib,fn) {
    var infs = this.setIfMissing('__inputFunctions__');
    var pth = om.pathToString(lib.pathOf(__pj__));
    var fpth = pth+"/"+fn;
    infs[k] = fpth;
  }
  /*
  om.DNode.setInputF = function (k,inf) {
    var infs = this.setIfMissing('__inputFunctions__');
    var pth = lib.patc
    infs[k] = inf;
  }
  */
  
  
  
  om.DNode.setOutputF = function (k,lib,fn) {
    var outfs = this.setIfMissing('__outputFunctions__');
    var pth = om.pathToString(lib.pathOf(__pj__));
    var fpth = pth+"/"+fn;    
    outfs[k] = fpth;
  }
  
  // get from the prototype chain, but before you hit DNode itself
  
  om.DNode.getBeforeDNode = function (k) {
    if (this == om.DNode) return undefined;
    var rs = this.get(k);
    if (rs !== undefined) return rs;
    var p = Object.getPrototypeOf(this);
    return p.getBeforeDNode(k);
  }
  
  om.DNode.getInputF = function (k) {
    var infs = this.__inputFunctions__;
    if (infs) {
      var pth = infs.getBeforeDNode(k);;
      return om.evalPath(__pj__,pth);
    }
  }
  
  om.LNode.getInputF = function (k) {
    return undefined;
  }
  
  
  
  om.DNode.getOutputF = function (k) {
    var outfs = this.__outputFunctions__;
    if (outfs) {
      var pth = outfs.getBeforeDNode(k);;
      return om.evalPath(__pj__,pth);
    }
  }
  
  om.LNode.getOutputF = function (k) {
    return undefined;
  }

  
  om.DNode.getNote = function (k) {
    var notes = this.__notes__;
    if (notes) return notes[k];
  }
  
  om.LNode.getNote = function (k) {
    return undefined;
  }
 
 
 // rules for update. What we want is that when the user modifies things by hand, they should not be overwrittenn by update. Also, manual overrides
 // should be saved so that they can be reinstalled. Generally update operations should only create nodes if they are not already present,
 // and only set those fields as necessary.  Every node that is created by update should be marked __computed__ (or should have an ancestor marked __computed__).
 // A node that is not open to manipulation by hand should be marked __mfrozen__ (or should have an ancestor marked __mfrozen__).
 // If only some fields of a node are to be shielded from manipulation, they should be mfrozen via the operation .setFieldStatus(fieldName,"mfrozen")
  
  
  om.nodeMethod("isComputed",function () {
   if (this.__computed__) return true;
   if (this == __pj__) return false;
   return this.__parent__.isComputed();
  });
  
  
  om.nodeMethod("isMfrozen",function () {
   if (this.__mfrozen__) return true;
   if (this == __pj__) return false;
   return this.__parent__.isMfrozen();
  });
  
 
  om.DNode.setFieldStatus = function (k,status) {
    var statuses = this.setIfMissing('__fieldStatus__');
    statuses[k] = status;
  }
  
  
  om.DNode.getFieldStatus = function (k) {
    var statuses = this.get('__fieldStatus__');
    if (statuses) {
      return statuses[k]; // allow inheritance after all. Might it sometimes be useful to override a status, eg mfrozen?
      //return statuses.get(k);
    }
  }
  
 // the form of status might be "mfrozen <function that did the setting>"
  om.DNode.fieldIsFrozen = function (k) {
    if (this.isMfrozen()) return true;
    var status = this.getFieldStatus(k);
    return status && (status.indexOf('mfrozen') == 0);
  }
  
 
  
 // When a computed node nd is modified by hand, nd.set
 // the fields of an object might have a status. The possibilities are "mfrozen" "computed" "overridden"
 // For the case of mfrozen and computed, the value of the field has been set by the update operation. In
 // the former case the intention is that it never be manually overriden,  and the latter that it is open to this.
 // "overriden" is the status of a field that has been subject to a manual override. Updates don't touch overriden fields
 
 // Here are the detailed rules. The update computation can mark whole objects as __mfrozen__. If it marks them as __computed__
 // this means that when its descendant fields are edited manually, those fields are marked as "overridden", and protected
 // from later interference by update, and also saved off amont the overrides when the item is saved (the overrid)

  
  
  
  
  
  om.nodeMethod("installOverrides",function (ovr) {
    for (var k in ovr) {
      var v = ovr[k];
      if (om.isObject(v)) {
        var nv = this[k];
        if (om.isNode(nv)) {
          nv.installOverrides(v);
        }
      } else {
        this[k] = v;
      }
    }
  });
  
  
  
/* small version  
om.DNode.instantiate = function () {
  var rs = Object.create(this);
  var thisHere = this;
  this.iterTreeItems(function (v,k) {
    var cp = v.instantiate();
    cp.__parent__ = rs;
    cp.__name__= k;
    rs[k] = cp;
  },true);
  return rs;
}


// no prototype chains for LNodes
om.LNode.instantiate = function () {
  var rs = om.LNode.mk();
  this.forEach(function (v) {
    if (om.isNode(v)) {
      var cp = v.instantiate();
      rs.pushChild(cp);
    } else {
      rs.push(v);
    }
  });
  return rs;
}

*/


  om.installType("DataSource");
  
  om.DataSource.mk = function (url) {
    var rs = Object.create(om.DataSource);
    rs.url = url;
    rs.setf("link",""); // for display in the tree
   // rs.set("data",om.LNode.mk());
    om.setDataSourceLink(url,rs);
    return rs;
  }
  
  om.dataSourceBeingLoaded = null;
  om.loadedData = [];
  om.loadDataTimeout = 2000;
  
  // this is the functinon which should  wrap the data in the external file, jsonp style
  __pj__.loadData = function (x) {
    var cb = om.loadDataCallback;
    om.loadedData[om.dataSourceBeingLoaded] = 1;
    if (cb) cb(x); // simulatewha
  }
  
  om.loadDataError = function (url) {
    __pj__.page.genError('Could not load '+url);
  }
  
  om.DataSource.loadTheData = function (cb) {
    setTimeout(function () {
      var cds = om.dataSourceBeingLoaded;
      if (!om.loadedData[cds]) {
        om.loadDataError(cds);
      }
    },om.loadDataTimeout
    );
    var url = om.mapUrlToDev(this.url);
    om.dataSourceBeingLoaded = url;
    om.loadDataCallback = cb;
     $.ajax({
        crossDomain: true,
        dataType: "script",
        url: url
     
    });
  }
  
  om.collectedDataSources = undefined;
  
  om.DataSource.collectThisDataSource = function () {
    om.collectedDataSources.push(this);
  }
  
  // collect below x
  om.collectDataSources = function (x) {
    om.collectedDataSources = [];
    x.deepApplyMeth("collectThisDataSource");
    return om.collectedDataSources;
  }
  
  om.loadNextDataSource  = function (n,cb) {
    var ds = om.collectedDataSources;
    var ln = ds.length;
    if (n == ln) {
      cb();
      return;
    }
    var dts = ds[n];
    var afterLoad = function(vl) {
        dts.set("data",om.toNode(vl));
        dts.__current__ = 1;
        om.loadNextDataSource(n+1,cb);
    }
     if (dts.__current__) { // already in loaded state
      om.loadNextDataSource(n+1,cb);
      return;
    }
    dts.loadTheData(afterLoad);
  }
  
  
  
  om.loadTheDataSources = function (x,cb) {
    om.loadedData = [];
    x.forEach(function (itm) {
      om.collectDataSources(itm);
    });
    om.loadNextDataSource(0,cb);
  }
  
  om.newDataSource = function(url,dts) {
    dts.url = url;
    dts.__current__ = 0;
    var afterLoad = function(vl) {
      dts.set("data",om.toNode(vl));
      dts.__current__ = 1;
      __pj__.tree.updateAndShow();
    }
    dts.loadTheData(afterLoad);
    return url;
  }
  
  
  om.setDataSourceLink = function(url,dts) {
    var durl = dts.url;
    dts.link = "<a href='"+durl+"'>"+durl+"</a>";
    return url;
  }
  om.DataSource.setInputF('url',om,'newDataSource');
  om.DataSource.setOutputF('url',om,'setDataSourceLink');
  
  om.DNode.ownProperties = function () {
    var nms = Object.getOwnPropertyNames(this);
    var rs = [];
    nms.forEach(function (nm) {
      if (!om.internal(nm)) rs.push(nm);
    });
    return rs;
  }
  
  function dnodeProperties(rs,nd,stopAt) {
    if (nd == stopAt) return;
    var nms = Object.getOwnPropertyNames(nd);
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



 })(__pj__);

