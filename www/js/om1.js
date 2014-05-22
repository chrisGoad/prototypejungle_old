(function (__pj__) {
  
  var om = __pj__.om;
  
  
  // to separate  out the methods from the tree, a method holder named just "_" is added to each DNode, which inherits from
  //om.DNodeMethods
  
  
  om.Path = Object.create(om.LNode); // only for transient use; may not appear in externalized structures
  
  om.Path.mk = function () {
    return Object.create(om.Path);
  }
  
  om._external = 1;
  
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
    return this._name;
  }
  
  om.LNode.name = function () {
    return this._name;
  }
  
  
  om.DNode.parent = function() {
    return this._get("_parent");
  }
  
  om.LNode.parent = function () {
    return this._get("_parent");
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
  om.nodeMethod("_computed",function () {
    this._computed = 1; 
    return this;
  });
  
  
  
  om.nodeMethod("_mfreeze",function (k) {
    if (typeof k === "string") {
      this._setFieldStatus(k,"mfrozen");
    } else {
      this._mfrozen=1;
    }
    return this;
  });
  
  om.DNode._freezeField = om.DNode._mfreeze;
  
  om.DNode._freezeFields = function (flds) {
    var thisHere = this;
    flds.forEach(function (k) {
      thisHere._mfreeze(k);
    });
  }
  
  om.DNode._Ifreeze = function (flds) {
    if (typeof flds === "string") {
      this._mfreeze(flds);
    } else {
      var thisHere = this;
      flds.forEach(function (k) {
        thisHere._mfreeze(k);
     });
    }
  }
  
  
  om.DNode._freezeAllFields = function (flds) {
    this._mfrozen = 1;
   
  }
  
  om.DNode._freezeAllFieldsR = function () {
    this._iterTreeItems(function (v,k,pr) {
       if (om.isNode(v)) {
        v._freezeFields();
        v._freezeAllFieldsR();
      }
    });
  }
  om.nodeMethod("_tHide",function (k) {
    if (typeof k === "string") {
      this._setFieldStatus(k,"tHidden");
    } else {
      this._tHidden=1;
    }
    return this;
  });
  
  om.DNode._Ihide = function (flds) {
    if (!flds) {
      this._tHide();
    } else if (typeof flds === "string") {
      this._tHide(flds);
    } else {
      var thisHere = this;
      flds.forEach(function (fld) {
        thisHere._tHide(fld);
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
    var pr = om.getval(node,"_parent");
    if (pr) {
      delete pr[node._name];
    }
  }
  
  // assumes node[nm] is  c, or will be c. checks c's suitability
  function adopt(node,nm,c) {
    if (om.isNode(c)) {
      separateFromParent(c);
      c._name = nm;
      c._parent = node;
    } else if (c && (typeof(c)==="object")) {
      om.error('Only Nodes and atomic _values can be set as _children in <Node>.set("'+nm+'",<val>)');
    } 
  }
  

  om._isDomEL  = function (x) {
    var dom = __pj__.dom;
    if (dom) {
      var domEL = dom.ELement;
      if (domEL) {
        return domEL.isPrototypeOf(x);
      }
    } 
  }
  om._isShape  = function (x) {
    var svg = __pj__.svg;
    if (svg) {
      return svg.Shape.isPrototypeOf(x);
    } 
  }
  
  // since order is important for drawing, order of sets is preserved here.
  // specifically, each dnode has a _setCount just counting how many sets have been done over time
  // each of its Node _children has a _setIndex, which was the value of _setCount when it was set
  // then drawing draws _children in setIndex order
  

  function setChild(node,nm,c) {
    // this needs to work before om.ComputedField is defined
    adopt(node,nm,c);
    var prv = node[nm];
    node[nm] = c;
    if (om._isDomEL(node)) {
      // keep track of shape and lnode _children order
      if (om._isDomEL(c) || om.LNode.isPrototypeOf(c)) {
        if (om._isDomEL(prv)) {
          prv._remove();
        }
        var scnt = om.getval(node,'_setCount');
        scnt = scnt?scnt+1:1;
        node._setCount = scnt;
        c._setIndex = scnt;
        node.installChild(c);
      }
    }
  }
  
  
  // key might be a path
  // For now, the only meaningful value of status is "_mfreeze"
 

  
  om.DNode.set = function (key,val,status) { // returns val
    // one argument version: _setProperties
    if (arguments.length === 1) {
      this._setProperties(key);
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
      pr._mfreeze(nm);
    }
    return val;
  }
  

  
  
  om.LNode.set = function (key,val) {
    setChild(this,key,val);
    return val;
  }
  
  // there is a forward reference here.  The method _isDomEL is set up in geom
  
   
 
  om.DNode._setf = function (key,val) {
    return this.set(key,val,"mfrozen"); // frozen from manual modification
  }
  
  
  om.DNode._seth = function (key,val) {
    return this.set(key,val,"tHidden"); // frozen from manual modification
  }
  
  // set if non-null
  om.DNode._setN = function (key,val) {
    if (val) {
      return this.set(key,om.toNode(val));
    }
  }
  
  
  
  om.DNode._setIfMissing = function (k) {
    if (this._get(k) === undefined) { //11/3/13 until now this was "if (this[k] == ..."  might have repurcussions
      this.set(k,om.DNode.mk());
    }
    return this[k];
  }
  
  // the central structure is a tree, made of 2 kinds of internal nodes (DNode,LNode), and atomic leaves (numbers,null,functions,strings)
  // internal nodes have _name and __parent__attributes
  
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
      ch._parent = rs;
      ch._name = ""+i;
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
    rs._parent = parent;
    rs._name = nm;
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
  
  om.DNode._xferLifted = function(src,p) {
    if (typeof p === "string") {
      var v = src[p];
      if (v!==undefined) {
        this.set(p,om.lift(v));
      }
    } else {
      var thisHere = this;
      p.forEach(function (ip) {thisHere._xferLifted(src,ip);});
    }
  }
  
  om.DNode._iterItems = function (fn) {
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
      return om.isNode(v) && (v._parent === nd)  && (v._name === k);
    } else {
      return true;
    }
  };
  
  // only include atomic _properties, or _properties that are proper treeProperties (ie parent child links)
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
  // _properties from the prototype chain down until stopAt, which defaults to DNode
  om.DNode._properties = function (stopAt) {
    var rs = {};
    dnodeProperties(rs,this,stopAt?stopAt:om.DNode);
    var rsa = [];
    for (var k in rs) rsa.push(k);
    return rsa;
  }

  
  
  om.DNode._iterTreeItems = function (fn,excludeAllAtomicProps,excludeProps) {
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
  
  
  om._iterTreeItems = function (nd,fn,excludeAllAtomicProps,excludeProps) {
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
  om.DNode._drop = function () {
    var rs = {};
    this._iterTreeItems(function (ch,k) {
      if (om.isNode(ch)) {
        var dc = ch._drop();
      } else {
        dc = ch;
      }
      rs[k] = dc;
    });
    return rs;
  }
  
  
  om.LNode._drop = function () {
    var rs = [];
    this.forEach(function (e) {
      if (om.isNode(e)) {
        var de = e._drop();
      } else {
        de = e;
      }
      rs.push(de);
    });
    return rs;
  }
  
  
  om.DNode._iterDomTree = function (fn) {
    var ownprops = Object.getOwnPropertyNames(this);
    var thisHere = this;
    var sch = [];
    ownprops.forEach(function (k) {
    //for (var k in this) {
      if (om.treeProperty(thisHere,k,true,true))  { //true: already known to be an owned property
        var ch = thisHere[k];
        if (om._isDomEL(ch) || om.LNode.isPrototypeOf(ch)) {
          sch.push(ch);
        }
      }
    });// now sort by _setIndex
    var cmf = function (a,b) {
      var ai = a._setIndex;
      if (ai === undefined) {
        ai = parseInt(a._name);
      }
      ai = isNaN(ai)?0:ai;
      var bi = b._setIndex;
      if (bi === undefined) {
        bi = parseInt(b._name);
      }
      bi = isNaN(bi)?0:bi;
      return (ai < bi)?-1:1;
    }
    sch.sort(cmf);
    sch.forEach(function (ch) {
      fn(ch,ch._name);
    });
    return this;
  }
  
  om.LNode._iterDomTree = function (fn) {
    this.forEach(function (ch) {
      if (om._isDomEL(ch) || om.LNode.isPrototypeOf(ch)) {
        fn(ch);
      }
    });
    return this;
  }
 
  
  om.DNode._iterInheritedItems = function (fn,includeFunctions,alphabetical) {
    var thisHere = this;
    function perKey(k) {
      var kv = thisHere[k];
      if ((includeFunctions || (typeof kv != "function")) && !om.internal(k)) {
        fn(kv,k);
      }
    }
    var _keys = this._properties();
    if (alphabetical) {
      _keys.sort();
    }
    _keys.forEach(perKey);
    return this;
  }
  
  om.DNode._iterInheritedTreeItems = function (fn,otherProps) {
    for (var k in this) {
      if (this._inheritedTreeProperty(k)) fn(this[k],k);
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
  om.LNode._iterItems = function (fn) {
    this.forEach(fn);
    return this;
  }
  
  om.LNode._iterTreeItems = function (fn,excludeAtomicProps) {
    var thisHere = this;
    this.forEach(function (v,k) {
      if (om.treeProperty(thisHere,k,excludeAtomicProps))  {
        fn(v,k);
      }
    })
    return this;
  }
  
  
  
  om.LNode._iterInheritedItems = function (fn) {
    this.forEach(fn);
    return this;
  }
  
  // used eg for iterating through styles. Follows the prototype chain, but stops at stdLibs
  // sofar has the _properties where fn has been called so far
  om.DNode._iterAtomicNonstdProperties = function (fn,allowFunctions,isoFar) {
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
    pr._iterAtomicNonstdProperties(fn,allowFunctions,soFar);
  }
    
  
  om.DNode._iterValues = function (fn) {
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
  
  om.DNode._setProps = function (prps) {
    return om._setProperties(this,prps);
  }
  
  
  om.DNode._keys = function () {
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
  om.nodeMethod("_pathOf",function (rt) {
    //var rs = om.Path.mk();
    var rs = [];
    var pr = this._parent;
    if (!pr) return undefined;
    var cx = this;
    while (true) {
      if (cx === rt) return rs;
      if (!cx || cx === __pj__) {
        rs.unshift("/");
        return rs;
      }
      var nm = om.getval(cx,"_name");
      if (nm !== undefined) {
        rs.unshift(cx._name);
      }
      cx = om.getval(cx,"_parent");
    }
    return undefined;
  });
  
  // name of the ancestor just below __pj__; for tellling which top level library something is in 
  om.nodeMethod("_topAncestorName",function (rt) {
    if (this === rt) return undefined;
    var pr = this._get("_parent");
    if (!pr) return undefined;
    if (pr === rt) return this._name;
    return pr._topAncestorName(rt);
  });
  
  //var stdLibs = {om:1,geom:1};
  var stdLibs = {om:1,svg:1,dom:1,geom:1};
  
  om.inStdLib = function (x) {
    var nm = x._topAncestorName(__pj__);
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
  
  om.nodeMethod("_pathAsString",function (rt) {
    return om.pathToString(this._pathOf(rt));
  });
  
  om.removeCallbacks = [];
  
  om.nodeMethod("_remove",function () {
    var thisHere = this;
    om.removeCallbacks.forEach(function (fn) {
        fn(thisHere);
    });
    var pr = this._parent;
    var nm = this._name;
    // @todo if the parent is an LNode, do somethind different
    delete pr[nm];
  });
  
  om.DNode._values = function () {
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
  
  om._evalPath = function (origin,iipth,root,createIfMissing) {
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

  om.DNode._evalPath = function (pth,createIfMissing) {
    return om._evalPath(this,pth,undefined,createIfMissing);
  }
    
  om.createPath = function (origin,pth) {
    return om._evalPath(origin,pth,null,true);
  }
    
  
  om.nodeMethod("_pathSetValue", function (o,path,v) {
    var lnm1 = path.length - 1;
    var spth = path.slice(0,lnm1);
    var lst = path[lnm1];
    var fp = this._evalPath(spth);
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
  
  
  
  
  // internal _properties are excluded from the iterators and recursors 
  
  om.internalProps = {"_parent":1,"_protoChild":1,"__value__":1,"_hitColor":1,"_chain":1,"_copy":1,_name:1,widgetDiv:1,
    _protoLine:1,_inCopyTree:1,_headOfChain:1,_element:1,_domAttributes:1};
  om.internal = function (nm) {
     return om.internalProps[nm];
  }
  // only consider objects on the chain which are in the tree
  om.DNode._findPropertyOnInheritanceChain = function (p) {
    var v = this._get(p);  
    if (typeof v != "undefined") {
      return this;
    }
    var pr = Object.getPrototypeOf(this);
    if (!pr._parent) return undefined;
    return pr._findPropertyOnInheritanceChain(p);
  }
  
  
  // is this a property defined down the chain  from the core modules
  om.DNode._coreProperty = function (p) {
    var pr = this._parent;
    if (!pr) return true; // shouldn't happen, but true is the answer we want if it does;it's not core, but not down the chains either
    if (pr._get("_coreModule")) return true;// if we've gotten to a core module, then the prop must be core
    if (this.hasOwnProperty(p)) return false;
    var proto = Object.getPrototypeOf(this);
    var crp = proto._coreProperty;
    if (crp) {
      return proto._coreProperty(p);
    }
  }
  
  om.LNode._coreProperty = function (p) {}

  
  om._coreModule = 1;
  
    
    
  
  // because non-atomic _properties are duplicated along the inheritance chain,
  // we restrict non-atomic _properties  to the current element of the chain.
  om.DNode._inheritedTreeProperty = function (p,excludeAtomicProps) {
    if (om.internal(p)) return false;  
    var ch = this[p];
    var tpc = typeof ch;
    if (ch && ((tpc==="object")||(tpc==="function"))) {
      var pr = ch._parent;
      return (pr === this);
    } else {
      if (excludeAtomicProps) return false; // an atom
      // we include only _properties inherited from tree members
      var whi = this._findPropertyOnInheritanceChain(p);
      return whi?true:false;
      
    }
  }
  /*
  om.nodeMethod("treeProperty", function (p,excludeAtomicProps,knownOwn) {
    console.log("TREE PROPERTY");
    if ((!knownOwn && !this.hasOwnProperty(p)) ||  om.internal(p)) return false;
    var ch = this[p];
    if (om.isNode(ch)) {
      return ch._parent === this;
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
      return ch._parent === nd;
    } else {
      return excludeAtomicProps?false:(typeof ch !== "object");
    }
  }
  
  om.nodeMethod("_nonAtomicTreeProperty", function (p) {
   return om.treeProperty(this,p,1);
  });
  
  
  
  
  om.nodeMethod("_children",function () { // only the object _children
    var rs = [];
    this._iterValues(function (k,v) {
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
  
  
  om.nodeMethod("_getMethod",function(x,name) {
    var tpx = typeof x;
    if (x && (tpx === "object")) {
      var mth = x[name];
      if (typeof mth === "function") return mth;
    }
    return undefined;
  });
  
  
  // since _computed content will replace things with others at the same path, we need to have
  // a path-based rep of what is selected.
  
  om.nodeMethod("_treeOfSelections",function () {
    var rs;
    this._iterTreeItems(function (c) {
      var nm = c._name;
      if (c._selected) {
        rs = rs?rs:{};
        rs[nm] = 1;
      } else {
        var stos = c._treeOfSelections();
        if (stos) {
          rs = rs?rs:{};
          rs[nm] = stos;
        }
      }
    },true);
    return rs;
  });
  
  
  om.nodeMethod("_installTreeOfSelections",function (tos) {
    if (tos === 1) {
      this._selected = true;
      //this._deepSetProp("__selectedPart__",1);
      this._setPropForAncestors("_descendantSelected",1,__pj__._draw.wsRoot);
    } else if (tos) {
      this._iterTreeItems(function (c) {
        var nm = c._name;
        c._installTreeOfSelections(tos[nm]);
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
    if (nd._doNotUpdate) {
      return;
    }
    var mthi = om._getMethod(nd,"update");
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
      nd._iterTreeItems(function (c) {
        if (ovr) {
          var nm = c._name;
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
    var svcnt = om.root._saveCount;
    return (typeof svcnt === "number")?svcnt:0;
  }
  // add an override to override tree dst, for this, with respect to the given root
  om.addOverride = function (nd,dst,root) {
    if (!nd) {
      debugger;
    }
    var p = nd._pathOf(root);
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
  
  om.DNode._findInOverride = function (ovr,root) { // find the correpsponding node in override
    var pth = this._pathOf(root);
    return om.pathLookup(ovr,pth);
  }
      
    
  // transfer the _values of the specified _properties to the override ovr; nothing is done if there is no corresponding prop in ovr
  // only atomic props will be transferred
  // root is the DNode corresponding to the root node of ovr
  // on oct 14, changed this so that it creates the override if not already present
  om.DNode._transferToOverride = function (ovr,root,props) {
    if (!ovr) return;
    var nd = this._findInOverride(ovr,root);
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
  // _stickySet means set and recall in the overrides
  om.DNode._stickySet = function (k,v) {
    this.set(k,v);
    this._transferToOverride(om.overrides,om.root,[k]);
  }
  // root is normally _draw.wsRoot, and ovrRoot _draw.overrides
  om.addOverridesForInsert = function(nd,root,ovrRoot) {
    var tovr = nd._overrides;
    if (tovr) {
      var pth = nd._parent._pathOf(root);
      var covr = om._evalPath(ovrRoot,pth,null,true);
      covr[nd._name] = tovr;
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
          cv._name = ip;
        }
        ip++;
      }
    }
    a.length = ip;
    if ((ip < ln) && v && (typeof v === "object")) {
      delete v._parent;
      delete v._name;
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
      el._name = ln;
      el._parent = this;
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
      el._name = ln;
      el._parent = this;
    } else if (el && (typeof el==="object")) {
      om.error("Attempt to shift non-node object onto an LNode");
    }
    arrayUnshift.call(this,el);
    return ln;
  }
  
  om.DNode._fromNode = function () {
    var rs = {};
    this._iterTreeItems(function (ch,k) {
      if (ch && (typeof ch === "object")) {
        rs[k] = ch._fromNode();
      } else {
        rs[k] = ch;
      }
    });
    return rs;
  }
  
  
  om.LNode._fromNode = function () {
    var rs = [];
    this.forEach(function (ch) {
      if (ch && (typeof ch === "object")) {
        rs.push(ch._fromNode());
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
    
  om.DNode._setIfNumeric = function (prp,v) {
    var n = om.toNumber(v);
    if (n !== undefined) {
      this[prp] = v;
    }
  }
    
    
   

 })(prototypeJungle);

