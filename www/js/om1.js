(function (__pj__) {
  "usee strict";
  var om = __pj__.om;
  
  
  // to separate  out the methods from the tree, a method holder named just "_" is added to each DNode, which inherits from
  //om.DNodeMethods
  
  
  om.Path = Object.create(om.LNode); // only for transient use; may not appear in externalized structures
  
  om.Path.mk = function () {
    return Object.create(om.Path);
  }
  
  om.__external = 1;
  
  om.isObject = function (o) {
    return o && (typeof(o) === "object");
  }
  
  
  om.isAtomic = function (x) {
    return !om.isObject(x);
  }
    
  
  om.isNode = function(x) { 
    return om.DNode.isPrototypeOf(x) || om.LNode.isPrototypeOf(x);
  }
  /*
  om.DNode.name = function() {
    return this.__name;
  }
  
  om.LNode.name = function () {
    return this.__name;
  }
  
  
  om.DNode.parent = function() {
    return this.__get("__parent");
  }
  
  om.LNode.parent = function () {
    return this.__get("__parent");
  }
  */
  
  // a common thing to do: make the same method work DNodes,Lnodes
  om.nodeMethod = function (nm,fn) {
    om.LNode[nm] = om.DNode[nm] = fn;
  }
  
  var createDescendant = function (nd,pth) {
  // creates DNodes if missing so that path pth descending from this exists
  //om.nodeMethod("createDescendant", function (pth) {
    var cnd = nd;
    pth.forEach(function (k) {
      // ignore "" ; this means that createDescendant can be used on __pj__
      if (k==="") return;
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
  }
    
  
  // causes manual overriding of fields to be recorded
  om.nodeMethod("computed",function () {
    this.computed = 1; 
    return this;
  });
  
  
  
  om.nodeMethod("__mfreeze",function (k) {
    if (typeof k === "string") {
      this.__setFieldStatus(k,"mfrozen");
    } else {
      this.__mfrozen=1;
    }
    return this;
  });
  
  om.DNode.__freezeField = om.DNode.__mfreeze;
  
  om.DNode.__freezeFields = function (flds) {
    var thisHere = this;
    flds.forEach(function (k) {
      thisHere.__mfreeze(k);
    });
  }
  
  om.DNode.Ifreeze = function (flds) {
    if (typeof flds === "string") {
      this.__mfreeze(flds);
    } else {
      var thisHere = this;
      flds.forEach(function (k) {
        thisHere.__mfreeze(k);
     });
    }
  }
  
  
  om.DNode.__freezeAllFields = function (flds) {
    this.__mfrozen = 1;
   
  }
  
  om.DNode.__freezeAllFieldsR = function () {
    this.__iterTreeItems(function (v,k,pr) {
       if (om.isNode(v)) {
        v.__freezeFields();
        v.__freezeAllFieldsR();
      }
    });
  }
  om.nodeMethod("__tHide",function (k) {
    if (typeof k === "string") {
      this.__setFieldStatus(k,"tHidden");
    } else {
      this.__tHidden=1;
    }
    return this;
  });
  
  om.DNode.Ihide = function (flds) {
    if (!flds) {
      this.__tHide();
    } else if (typeof flds === "string") {
      this.__tHide(flds);
    } else {
      var thisHere = this;
      flds.forEach(function (fld) {
        thisHere.__tHide(fld);
      });
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
  
  function separateFromParent(node) {
    return;
    var pr = om.getval(node,"__parent");
    if (pr) {
      delete pr[node.__name];
    }
  }
  
  // assumes node[nm] is  c, or will be c. checks c's suitability
  function adopt(node,nm,c) {
    if (om.isNode(c)) {
      separateFromParent(c);
      c.__name = nm;
      c.__parent = node;
    } else if (c && (typeof(c)==="object")) {
      om.error('Only Nodes and atomic __values can be set as __children in <Node>.set("'+nm+'",<val>)');
    } 
  }
  

  om.__isDomEL  = function (x) {
    var dom = __pj__.dom;
    if (dom) {
      var domEL = dom.ELement;
      if (domEL) {
        return domEL.isPrototypeOf(x);
      }
    } 
  }
  om.__isShape  = function (x) {
    var svg = __pj__.svg;
    if (svg) {
      return svg.Shape.isPrototypeOf(x);
    } 
  }
  
  // since order is important for drawing, order of sets is preserved here.
  // specifically, each dnode has a __setCount just counting how many sets have been done over time
  // each of its Node __children has a __setIndex, which was the value of __setCount when it was set
  // then drawing draws __children in setIndex order
  

  function setChild(node,nm,c) {
    // this needs to work before om.ComputedField is defined
    adopt(node,nm,c);
    var prv = node[nm];
    node[nm] = c;
    if (om.__isDomEL(node)) {
      // keep track of shape and lnode __children order
      if (om.__isDomEL(c) || om.LNode.isPrototypeOf(c)) {
        if (om.__isDomEL(prv)) {
          prv.remove();
        }
        var scnt = om.getval(node,'__setCount');
        scnt = scnt?scnt+1:1;
        node.__setCount = scnt;
        c.__setIndex = scnt;
        node.installChild(c);
      }
    }
  }
  
  
  // key might be a path
  // For now, the only meaningful value of status is "__mfreeze"
 

  
  om.DNode.set = function (key,val,status) { // returns val
    // one argument version: __setProperties
    if (arguments.length === 1) {
      this.__setProperties(key);
      return this;
    }
    if (typeof(key)==="string") {
      var idx = key.indexOf("/");
    } else { 
      idx = -1;
    }
    if (idx >= 0) {
      var pth = key.split("/");
      var nm = pth.pop();
      var pr = createDescendant(this,pth);
    } else {
      pr = this;
      nm = key;
    }
    if (!om.checkName(nm)){
      om.error('Ill-formed name "'+nm+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
    }
    setChild(pr,nm,val);
    if (status === "mfrozen") {
      pr.__mfreeze(nm);
    }
    return val;
  }
  

  
  
  om.LNode.set = function (key,val) {
    setChild(this,key,val);
    return val;
  }
  
  // there is a forward reference here.  The method __isDomEL is set up in geom
  
   
 
  om.DNode.__setf = function (key,val) {
    return this.set(key,val,"mfrozen"); // frozen from manual modification
  }
  
  
  om.DNode.__seth = function (key,val) {
    return this.set(key,val,"tHidden"); // frozen from manual modification
  }
  
  // set if non-null
  om.DNode.__setN = function (key,val) {
    if (val) {
      return this.set(key,om.toNode(val));
    }
  }
  
  
  
  om.DNode.__setIfMissing = function (k) {
    if (this.__get(k) === undefined) { //11/3/13 until now this was "if (this[k] == ..."  might have repurcussions
      this.set(k,om.DNode.mk());
    }
    return this[k];
  }
  
  // the central structure is a tree, made of 2 kinds of internal nodes (DNode,LNode), and atomic leaves (numbers,null,functions,strings)
  // internal nodes have __name and __parent__attributes
  
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
      ch.__parent = rs;
      ch.__name = ""+i;
      rs.push(ch);
    }
    return rs;
  }
  
  // backward compatability
  
  om.mkLNode = om.LNode.mk;
  
 // __pj__.set("anon",om.DNode.mk()); // where code from the anonymous items lives
  
  // utilities for constructing Nodes from ordinary objects and arrays
  // recurses down to objects that are already nodes
  // o is an array or an object
  
  var toNode1 = function (parent,nm,o) {
    var tp = typeof o;
    if ((o === null) || (tp != "object")) {
      parent[nm] =  o;
      return;
    }
    if (om.isNode(o)) {
      var rs = o;
    } else {
      if (Array.isArray(o)) {
        rs = om.toLNode(o,null);
      } else {
        var rs = om.toDNode(o,null);
      }
      
    }
    rs.__parent = parent;
    rs.__name = nm;
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
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        var ok = o[k];
        toNode1(dst,k,ok);
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
      dst.push(om.toNode(v));
    });
    return dst;
  }
  
  om.toNode = function (o) {
    if (om.isNode(o)) { // idempotent
      return o;
    }
    if (Array.isArray(o)) {
      return om.toLNode(o);
    } else if (o && (typeof o === "object")) {
      return om.toDNode(o);
    } else {
      return o;
    }
  }
  
  om.lift = om.toNode;
  
  om.DNode.__xferLifted = function(src,p) {
    if (typeof p === "string") {
      var v = src[p];
      if (v!==undefined) {
        this.set(p,om.lift(v));
      }
    } else {
      var thisHere = this;
      p.forEach(function (ip) {thisHere.__xferLifted(src,ip);});
    }
  }
  
  om.DNode.__iterItems = function (fn) {
    for (var k in this) {
      if (this.hasOwnProperty(k) && !om.internal(k))  {
        fn(this[k],k);
      }
    }
    return this;
  }

  
  
  // an atomic property, or tree property
  var properProperty = function (nd,k,knownOwn) {
    if (!knownOwn &&  !nd.hasOwnProperty(k)) return false;
    if (om.internal(k)) return false;
    var v = nd[k];
    var tp = typeof v;
    if ((tp === "object" ) && v) {
      return om.isNode(v) && (v.__parent === nd)  && (v.__name === k);
    } else {
      return true;
    }
  };
  
  // only include atomic __properties, or __properties that are proper treeProperties (ie parent child links)
  // exclude internal names too
  om.ownProperties = function (nd) {
    var nms = Object.getOwnPropertyNames(nd);
    var rs = [];
    nms.forEach(function (nm) {
      if (properProperty(nd,nm,true)) rs.push(nm);
    });
    return rs;
  }
  
  function dnodeProperties(rs,nd,stopAt) {
    if (nd === stopAt) return;
    //var nms = Object.getOwnPropertyNames(nd);
    var nms = om.ownProperties(nd);
    nms.forEach(function (nm) {
      if (!om.internal(nm)) rs[nm]=1;
    });
    dnodeProperties(rs,Object.getPrototypeOf(nd),stopAt);
  }
  // __properties from the prototype chain down until stopAt, which defaults to DNode
  om.DNode.__properties = function (stopAt) {
    var rs = {};
    dnodeProperties(rs,this,stopAt?stopAt:om.DNode);
    var rsa = [];
    for (var k in rs) rsa.push(k);
    return rsa;
  }

  
  
  om.DNode.__iterTreeItems = function (fn,excludeAllAtomicProps,excludeProps) {
    //console.log("itertree");
    var ownprops = Object.getOwnPropertyNames(this);
    var thisHere = this;
    ownprops.forEach(function (k) {
    //for (var k in this) {
      //if (om.internal(k)) return;
      if (excludeProps && excludeProps[k]) return;
      if (om.treeProperty(thisHere,k,excludeAllAtomicProps,true))  { //true: already known to be an owned property
        fn(thisHere[k],k,thisHere);
      }
    });
    return this;
  }
  
  
  om.__iterTreeItems = function (nd,fn,excludeAllAtomicProps,excludeProps) {
    //console.log("itertree");
    var ownprops = Object.getOwnPropertyNames(nd);
    var thisHere = nd;
    ownprops.forEach(function (k) {
    //for (var k in this) {
      //if (om.internal(k)) return;
      if (excludeProps && excludeProps[k]) return;
      if (om.treeProperty(thisHere,k,excludeAllAtomicProps,true))  { //true: already known to be an owned property
        fn(thisHere[k],k,thisHere);
      }
    });
    return this;
  }
  
  
  // inverse of lift. Go from DNode,LNode down to ordinary objects
  om.DNode.__drop = function () {
    var rs = {};
    this.__iterTreeItems(function (ch,k) {
      if (om.isNode(ch)) {
        var dc = ch.__drop();
      } else {
        dc = ch;
      }
      rs[k] = dc;
    });
    return rs;
  }
  
  
  om.LNode.__drop = function () {
    var rs = [];
    this.forEach(function (e) {
      if (om.isNode(e)) {
        var de = e.__drop();
      } else {
        de = e;
      }
      rs.push(de);
    });
    return rs;
  }
  
  
  om.DNode.__iterDomTree = function (fn) {
    var ownprops = Object.getOwnPropertyNames(this);
    var thisHere = this;
    var sch = [];
    ownprops.forEach(function (k) {
    //for (var k in this) {
      if (om.treeProperty(thisHere,k,true,true))  { //true: already known to be an owned property
        var ch = thisHere[k];
        if (om.__isDomEL(ch) || om.LNode.isPrototypeOf(ch)) {
          sch.push(ch);
        }
      }
    });// now sort by __setIndex
    var cmf = function (a,b) {
      var ai = a.__setIndex;
      if (ai === undefined) {
        ai = parseInt(a.__name);
      }
      ai = isNaN(ai)?0:ai;
      var bi = b.__setIndex;
      if (bi === undefined) {
        bi = parseInt(b.__name);
      }
      bi = isNaN(bi)?0:bi;
      return (ai < bi)?-1:1;
    }
    sch.sort(cmf);
    sch.forEach(function (ch) {
      fn(ch,ch.__name);
    });
    return this;
  }
  
  om.LNode.__iterDomTree = function (fn) {
    this.forEach(function (ch) {
      if (om.__isDomEL(ch) || om.LNode.isPrototypeOf(ch)) {
        fn(ch);
      }
    });
    return this;
  }
 
  
  om.DNode.__iterInheritedItems = function (fn,includeFunctions,alphabetical) {
    var thisHere = this;
    function perKey(k) {
      var kv = thisHere[k];
      if ((includeFunctions || (typeof kv != "function")) && !om.internal(k)) {
        fn(kv,k);
      }
    }
    var __keys = this.__properties();
    if (alphabetical) {
      __keys.sort();
    }
    __keys.forEach(perKey);
    return this;
  }
  
  om.DNode.__iterInheritedTreeItems = function (fn,otherProps) {
    for (var k in this) {
      if (this.__inheritedTreeProperty(k)) fn(this[k],k);
    }
    if (!otherProps) return this;
    var thisHere = this;
    otherProps.forEach(function (k) {
      if (om.treeProperty(thisHere,k)) {
        var v = thisHere[k];
        fn(v,k);
      }
    });
    return this;
  }
  om.LNode.__iterItems = function (fn) {
    this.forEach(fn);
    return this;
  }
  
  om.LNode.__iterTreeItems = function (fn,excludeAtomicProps) {
    var thisHere = this;
    this.forEach(function (v,k) {
      if (om.treeProperty(thisHere,k,excludeAtomicProps))  {
        fn(v,k);
      }
    })
    return this;
  }
  
  
  
  om.LNode.__iterInheritedItems = function (fn) {
    this.forEach(fn);
    return this;
  }
  
  // used eg for iterating through styles. Follows the prototype chain, but stops at stdLibs
  // sofar has the __properties where fn has been called so far
  om.DNode.__iterAtomicNonstdProperties = function (fn,allowFunctions,isoFar) {
    var soFar = isoFar?isoFar:{};
    if (om.inStdLib(this)) return;
    var op = Object.getOwnPropertyNames(this);
    var thisHere = this;
    op.forEach(function (k) {
      if (om.internal(k) || soFar[k]) return;
      soFar[k] = 1;
      var v = thisHere[k];
      var tpv = typeof v;
      if (v && (tpv === "object" )||((tpv==="function")&&!allowFunctions)) return;
      fn(v,k);
    });
    var pr = Object.getPrototypeOf(this);
    pr.__iterAtomicNonstdProperties(fn,allowFunctions,soFar);
  }
    
  
  om.DNode.__iterValues = function (fn) {
    var rs = false;
    for (var k in this) {
      if (om.treeProperty(this,k)) {
        if (fn(this[k])) {
          rs = true;
        }
      }
    }
    return rs;
  }
  
  om.DNode.__setProps = function (prps) {
    return om.__setProperties(this,prps);
  }
  
  
  om.DNode.__keys = function () {
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
  om.nodeMethod("__pathOf",function (rt) {
    //var rs = om.Path.mk();
    var rs = [];
    var pr = this.__parent;
    if (!pr) return undefined;
    var cx = this;
    while (true) {
      if (cx === rt) return rs;
      if (!cx || cx === __pj__) {
        rs.unshift("/");
        return rs;
      }
      var nm = om.getval(cx,"__name");
      if (nm !== undefined) {
        rs.unshift(cx.__name);
      }
      cx = om.getval(cx,"__parent");
    }
    return undefined;
  });
  
  // name of the ancestor just below __pj__; for tellling which top level library something is in 
  om.nodeMethod("__topAncestorName",function (rt) {
    if (this === rt) return undefined;
    var pr = this.__get("__parent");
    if (!pr) return undefined;
    if (pr === rt) return this.__name;
    return pr.__topAncestorName(rt);
  });
  
  //var stdLibs = {om:1,geom:1};
  var stdLibs = {om:1,svg:1,dom:1,geom:1};
  
  om.inStdLib = function (x) {
    var nm = x.__topAncestorName(__pj__);
    return stdLibs[nm];
  }
  
  // omits initial "/"s
  om.pathToString = function (p,sep) {
    var rs;
    if (!sep) sep = "/";
    var ln = p.length;
    if (sep===".") {
      var rs = p[0];
      for (var i=1;i<ln;i++) {
        var e = p[i];
        if (typeof e==="number") {
          rs = rs+"["+e+"]";
        } else {
          rs = rs +"."+e;
        }
      }
    } else {
      rs = p.join(sep);
    }
    if (ln>0) {
      if (p[0]===sep) return rs.substr(1);
    }
    return rs;
  }
  
  om.nodeMethod("__pathAsString",function (rt) {
    return om.pathToString(this.__pathOf(rt));
  });
  
  om.removeCallbacks = [];
  
  om.nodeMethod("remove",function () {
    var thisHere = this;
    om.removeCallbacks.forEach(function (fn) {
        fn(thisHere);
    });
    var pr = this.__parent;
    var nm = this.__name;
    // @todo if the parent is an LNode, do somethind different
    delete pr[nm];
  });
  
  om.DNode.__values = function () {
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
  // if a relative path use origin as the start point. ow start with root (which is set to __pj__ if missing)
  // this works for trees of nodes, but also for ordinary javascript object hierarchies
  
  om.__evalPath = function (origin,iipth,root,createIfMissing) {
    // if path starts with "" or "/" , take this out
    if (!iipth) return; // it is convenient to allow this option
    if (typeof iipth === "string") {
      var ipth = iipth.split("/");
    } else {
      ipth = iipth;
    }
    if (ipth.length === 0) return origin;
    
    var p0 = ipth[0];
    if ((p0 === "")||(p0 === "/")) {
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
    if ((ln>0) && (pth[ln-1] === "")) {
      pth.pop();
      ln--;
    }
    for (var i=0;i<ln;i++) {
      var k = pth[i];
      var tp = typeof cv;
      if (cv && ((tp === "object"))) {
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

  om.DNode.__evalPath = function (pth,createIfMissing) {
    return om.__evalPath(this,pth,undefined,createIfMissing);
  }
    
  om.createPath = function (origin,pth) {
    return om.__evalPath(origin,pth,null,true);
  }
    
  
  om.nodeMethod("__pathSetValue", function (o,path,v) {
    var lnm1 = path.length - 1;
    var spth = path.slice(0,lnm1);
    var lst = path[lnm1];
    var fp = this.__evalPath(spth);
    if (fp) {
      fp[lst] = v;
    }
  });
  
  
  om.applyMethod = function (m,x,a) {
    if (x && ((typeof(x)==="object")||(typeof(x)==="function"))) {
      var mth = x[m];
      if (mth && (typeof mth === "function")) {
        return mth.apply(x,a);
      }
    }
    return x;
  }
  
  
  
  
  // internal __properties are excluded from the iterators and recursors 
  
  om.internalProps = {"__parent":1,"__protoChild":1,"__value__":1,"__hitColor":1,"__chain":1,"__copy":1,__name:1,widgetDiv:1,
    __protoLine:1,__inCopyTree:1,__headOfChain:1,__element:1,__domAttributes:1};
  om.internal = function (nm) {
     return om.internalProps[nm];
  }
  // only consider objects on the chain which are in the tree
  om.DNode.__findPropertyOnInheritanceChain = function (p) {
    var v = this.__get(p);  
    if (typeof v != "undefined") {
      return this;
    }
    var pr = Object.getPrototypeOf(this);
    if (!pr.__parent) return undefined;
    return pr.__findPropertyOnInheritanceChain(p);
  }
  
  
  // is this a property defined down the chain  from the core modules
  om.DNode.__coreProperty = function (p) {
    var pr = this.__parent;
    if (!pr) return true; // shouldn't happen, but true is the answer we want if it does;it's not core, but not down the chains either
    if (pr.__get("__coreModule")) return true;// if we've gotten to a core module, then the prop must be core
    if (this.hasOwnProperty(p)) return false;
    var proto = Object.getPrototypeOf(this);
    var crp = proto.__coreProperty;
    if (crp) {
      return proto.__coreProperty(p);
    }
  }
  
  om.LNode.__coreProperty = function (p) {}

  
  om.__coreModule = 1;
  
    
    
  
  // because non-atomic __properties are duplicated along the inheritance chain,
  // we restrict non-atomic __properties  to the current element of the chain.
  om.DNode.__inheritedTreeProperty = function (p,excludeAtomicProps) {
    if (om.internal(p)) return false;  
    var ch = this[p];
    var tpc = typeof ch;
    if (ch && ((tpc==="object")||(tpc==="function"))) {
      var pr = ch.__parent;
      return (pr === this);
    } else {
      if (excludeAtomicProps) return false; // an atom
      // we include only __properties inherited from tree members
      var whi = this.__findPropertyOnInheritanceChain(p);
      return whi?true:false;
      
    }
  }
  /*
  om.nodeMethod("treeProperty", function (p,excludeAtomicProps,knownOwn) {
    console.log("TREE PROPERTY");
    if ((!knownOwn && !this.hasOwnProperty(p)) ||  om.internal(p)) return false;
    var ch = this[p];
    if (om.isNode(ch)) {
      return ch.__parent === this;
    } else {
      return excludeAtomicProps?false:(typeof ch !== "object");
    }
  });
  */
    // a proper element of the tree.

  om.treeProperty = function (nd,p,excludeAtomicProps,knownOwn) {
    //console.log("omTREE");
    if ((!knownOwn && !nd.hasOwnProperty(p)) ||  om.internal(p)) return false;
    var ch = nd[p];
    if (om.isNode(ch)) {
      return ch.__parent === nd;
    } else {
      return excludeAtomicProps?false:(typeof ch !== "object");
    }
  }
  
  om.nodeMethod("__nonAtomicTreeProperty", function (p) {
   return om.treeProperty(this,p,1);
  });
  
  
  
  
  om.nodeMethod("__children",function () { // only the object __children
    var rs = [];
    this.__iterValues(function (k,v) {
      if (om.isObject(v)) {
        rs.push(v);
      }});
    return rs;
  });
  
  
  
  om.hasMethod = function(x,name) {
    var tpx = typeof x;
    if (x && (tpx === "object")) {
      var mth = x[name];
      if (typeof mth === "function") return mth;
    }
    return undefined;
  }
  
  
  om.nodeMethod("__getMethod",function(x,name) {
    var tpx = typeof x;
    if (x && (tpx === "object")) {
      var mth = x[name];
      if (typeof mth === "function") return mth;
    }
    return undefined;
  });
  
  
  // since computed content will replace things with others at the same path, we need to have
  // a path-based rep of what is selected.
  
  om.nodeMethod("__treeOfSelections",function () {
    var rs;
    this.__iterTreeItems(function (c) {
      var nm = c.__name;
      if (c.__selected) {
        rs = rs?rs:{};
        rs[nm] = 1;
      } else {
        var stos = c.__treeOfSelections();
        if (stos) {
          rs = rs?rs:{};
          rs[nm] = stos;
        }
      }
    },true);
    return rs;
  });
  
  
  om.nodeMethod("__installTreeOfSelections",function (tos) {
    if (tos === 1) {
      this.__selected = true;
      //this.__deepSetProp("__selectedPart__",1);
      this.__setPropForAncestors("__descendantSelected",1,__pj__.__draw.wsRoot);
    } else if (tos) {
      this.__iterTreeItems(function (c) {
        var nm = c.__name;
        c.__installTreeOfSelections(tos[nm]);
      },true);
    }
  });
  
  // overrides should  only  be specified in the top level call
  
  om.updateErrors = [];
  om.debugMode = 1; // no tries in debug mode, to ease catching of errors
  om.updateCount = 0;
  function deepUpdate(nd,d,ovr) {
    om.error("OBSOLETE");
    om.updateCount++;
    console.log("update",om.updateCount);
    if (nd.__doNotUpdate) {
      return;
    }
    var mthi = om.__getMethod(nd,"update");
    if (mthi) {
      if (om.debugMode) {
        mthi.call(nd,d,ovr);
      } else {
        try {
          mthi.call(nd,d,ovr);
        } catch(e) {
          var erm = e.message;
          debugger;
          om.updateErrors.push(erm);
          om.log("updateError",erm);
        }
      }
      
    } else {
      nd.__iterTreeItems(function (c) {
        if (ovr) {
          var nm = c.__name;
          var subovr = ovr[nm];
          if (typeof subovr != "object") {
            subovr = undefined;
          }
        }
        deepUpdate(c,d,subovr);
      },true);
    }
  }
  
  om.updateRoot = function () {
    om.root.deepUpdate(null,om.overrides);
  }
  
  om.saveCount = function () {
    if (!om.root) return 0
    var svcnt = om.root.__saveCount;
    return (typeof svcnt === "number")?svcnt:0;
  }
  // add an override to override tree dst, for this, with respect to the given root
  om.addOverride = function (nd,dst,root) {
    if (!nd) {
      debugger;
    }
    var p = nd.__pathOf(root);
    var cn  = dst;
    p.forEach(function (nm) {
      var nn = cn[nm];
      if (!om.isObject(nn)) {
        nn = {};
        cn[nm] = nn;
      }
      cn = nn;
    });
    return cn;
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
  
  om.DNode.__findInOverride = function (ovr,root) { // find the correpsponding node in override
    var pth = this.__pathOf(root);
    return om.pathLookup(ovr,pth);
  }
      
    
  // transfer the __values of the specified __properties to the override ovr; nothing is done if there is no corresponding prop in ovr
  // only atomic props will be transferred
  // root is the DNode corresponding to the root node of ovr
  // on oct 14, changed this so that it creates the override if not already present
  om.DNode.__transferToOverride = function (ovr,root,props) {
    if (!ovr) return;
    var nd = this.__findInOverride(ovr,root);
    if (!nd) {
      nd = om.addOverride(this,ovr,root);
      //code
    }
    var thisHere = this;
    props.forEach(function (p) {
      var v = thisHere[p];
      var tpv = typeof v;
      if ((tpv === "object") && v) return;
      nd[p] = v;
    });
  }
  // __stickySet means set and recall in the overrides
  om.DNode.__stickySet = function (k,v) {
    this.set(k,v);
    this.__transferToOverride(om.overrides,om.root,[k]);
  }
  // root is normally __draw.wsRoot, and ovrRoot __draw.overrides
  om.addOverridesForInsert = function(nd,root,ovrRoot) {
    var tovr = nd.__overrides;
    if (tovr) {
      var pth = nd.__parent.__pathOf(root);
      var covr = om.__evalPath(ovrRoot,pth,null,true);
      covr[nd.__name] = tovr;
    }
  }
  
  om.matchesStart = function (a,b) {
    var ln = a.length;
    if (ln > b.length) return false;
    for (var i=0;i<ln;i++) {
      if (a[i]!==b[i]) return false;
    }
    return true;
  }
  
  
  om.removeFromArray = function (a,v) {
    var isLNode = om.LNode.isPrototypeOf(a)
    var ln = a.length;
    var ip = 0; // insert pointer
    for (var i=0;i<ln;i++) {
      var cv = a[i];
      if (cv !== v) {
        a[ip] = cv;
        if (cv && (typeof cv==="object")) {
          cv.__name = ip;
        }
        ip++;
      }
    }
    a.length = ip;
    if ((ip < ln) && v && (typeof v === "object")) {
      delete v.__parent;
      delete v.__name;
    }
    return ip < ln; // something removed
  }
  
  om.LNode.toArray = function () {
    var rs = [];
    this.forEach(function (e) {rs.push(e);});
    return rs;
  }
  var arrayPush = Array.prototype.push;
  om.LNode.push = function (el) {
    var ln = this.length;
    if (om.isNode(el)) {
      separateFromParent(el);
      el.__name = ln;
      el.__parent = this;
    } else if (el && (typeof el==="object")) {
      om.error("Attempt to push non-node object onto an LNode");
    }
    arrayPush.call(this,el);
    return ln;
  }
  
  
  var arrayUnshift = Array.prototype.unshift;
  om.LNode.unshift = function (el) {
    var ln = this.length;
    if (om.isNode(el)) {
      separateFromParent(el);
      el.__name = ln;
      el.__parent = this;
    } else if (el && (typeof el==="object")) {
      om.error("Attempt to shift non-node object onto an LNode");
    }
    arrayUnshift.call(this,el);
    return ln;
  }
  
  om.DNode.__fromNode = function () {
    var rs = {};
    this.__iterTreeItems(function (ch,k) {
      if (ch && (typeof ch === "object")) {
        rs[k] = ch.__fromNode();
      } else {
        rs[k] = ch;
      }
    });
    return rs;
  }
  
  
  om.LNode.__fromNode = function () {
    var rs = [];
    this.forEach(function (ch) {
      if (ch && (typeof ch === "object")) {
        rs.push(ch.__fromNode());
      } else {
        rs.push(ch);
      }
    });
    return rs;
  }
  
  // doesn't work correctly on e numbers, eg 4e5
  
  om.toNumber = function (x) {
    var tp = typeof x;
    if (tp === "number") {
      return x;
    }
    if (tp === "string") {
      if (isNaN(x)) {
        return undefined;
      }
    }
    return undefined;
  }
    
  om.DNode.__setIfNumeric = function (prp,v) {
    var n = om.toNumber(v);
    if (n !== undefined) {
      this[prp] = v;
    }
  }
    
    
   

 })(prototypeJungle);

