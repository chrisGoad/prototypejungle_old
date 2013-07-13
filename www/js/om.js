//om = __pj__.om; // TEMPORARY!
(function () {

var om = __pj__.om;
// a hole 


om.__externalReferences__ = [];

om.isObject = function (o) {
  if (o) {
    var tp = typeof(o);
    return (tp == "object") || (tp == "function");
  }
  return false;
}

om.DNode.createDescendant = function (pth) {
  var cnd = this;
  pth.forEach(function (k) {
    var d = cnd[k];
    if (d === undefined) {
      var nnd = om.DNode.mk();
      cnd.set(k,nnd);
      cnd = nnd;
    } else {
      if (!cnd.hasOwnProperty(k)) om.error("Conflict in createDescencant",pth.join("/"));
      if (!om.DNode.isPrototypeOf(d)) om.error("Conflict in createDescendant ",pth.join("/"));
      cnd = d;
    }
  });
  return cnd;
}

//  in application code, we record when prim-values properties are modified by code.
om.activeFunction = undefined;
om.nowRecording = 0;

// key might be a path
om.DNode.set = function (key,val,setComputationally) { // returns val
  if (typeof(key)=="string") {
    var idx = key.indexOf("/");
  } else { // key might be a number
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
  pr[nm] = val;
  if (om.isObject(val)) {
    val.__name__ = nm;
    val.__parent__ = pr;
  } else if (setComputationally) {
    var af = om.activeFunction;
    if (!af) af = "__anonymous__";
    var r = this.__record__;
    if (!r) {
      r = om.DNode.mk();
      this.set("__record__",r);
    }
    r[nm] = af;
  }
  return val;
}

// for setting prim values, and declaring them set computationally 
om.DNode.setc = function (key,val) {
  return this.set(key,val,true);
}



om.DNode.setBy = function(k) {
  if (!this.hasOwnProperty(k)) return undefined;
  var r = this.get("__record__");
  if (r) {
    return r[k];
  }
}
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




om.arrayForEach = function (a,fn) {
  if (a.forEach) {
    a.forEach(fn);
    return;
  }
  var ln = a.length;
  for (var i=0;i<ln;i++) {
    fn(a[i]);
  }
}


om.arrayMap = function (a,fn) {
  //if (!dbug) return a.map(fn); //the code below aids in debugging
  if (a.forEach) {
    a.forEach(fn);
    return;
  }
  var ln = a.length;
  var rs = [];
  for (var i=0;i<ln;i++) {
    rs.push(fn(a[i]));
  }
  return rs;
}


// the central structure is a tree, made of 2 kinds of internal nodes (DNode,LNode), and primitive leaves (numbers,null,or functions)
// internal nodes have __name__ and __parent__attributes

// a DNode is what python calls a dictionary 


om.forKeys = function (x,fn) {
  var pnms = Object.keys(x);
  var ln = pnms.length;
  for (var i=0;i<ln;i++) {
    var k = pnms[i];
    var cv = x[k];
    fn(cv,k);
  }
  
}


// the new way

om.DNode.mk = function () {
  return Object.create(om.DNode);
}

// old way
om.mkDNode = function () {
  return om.DNode.mk();
}

om.set("LNode",Array());


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

om.mkLNode = function(a) {
  return om.LNode.mk(a);
}


//om.set("LNode",Array());


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

 // a convenience for building DNode objects. In place
 om.propsToDNode = function (o) {
  var rs = {};
  for (var k in o) {
    var cv = o[k];
    if (cv && (typeof cv == "object")) {
      rs[k] = om.toDNode(k);
    } else if (Array.isArray(cv)) {
      rs[k] = om.toLNode(cv);
    } else {
      rs[k] = cv;
    }
  }
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


om.DNode.map = function (d,fn) {
  var rs = {};
  for (var k in d) {
    if (d.hasOwnProperty(k) && !om.internal(k)) {
      rs[k] = fn(d[k],k);
    }
  }
  return rs;
}


om.DNode.iterItems = function (fn) {
  for (var k in this) {
    if (this.hasOwnProperty(k) && !om.internal(k))  {
      fn(this[k],k);
    }
  }
  return this;
}



om.DNode.iterTreeItems = function (fn,excludeAtomicProps) {
  for (var k in this) {
    if (this.treeProperty(k,excludeAtomicProps))  {
      fn(this[k],k);
    }
  }
  return this;
}

om.DNode.iterInheritedItems = function (fn,includeFunctions) {
  for (var k in this) {
    var kv = this[k];
    if ((typeof kv == "function")&&(!includeFunctions)) {
      continue;
    }
    if (!om.internal(k)) fn(this[k],k);
  }
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
// of the path
om.pathOf = function (x,rt) {
  var rs = [];
  var pr = om.getval(x,"__parent__");// no inheritance version of this.__parent__;
  if (!pr) return undefined;
  var cx = x;
  while (cx) {
    if (cx == rt) return rs;
    if (cx == __pj__) {
      rs.unshift("/");
      return rs;
    }
    rs.unshift(cx.__name__);
    cx = om.getval(cx,"__parent__");
  }
  return undefined

  if (x == rt) return [];
  var pr = om.getval(x,"__parent__");// no inheritance version of this.__parent__;
  if (!pr) return ["/"];
  var pp = om.pathOf(pr,rt);
  pp.push(x.__name__);
  return pp;
}

/*
  
  om.DNode.pathFrom = function (a,x) {
    var pth = [];
    var cn = x;
    while (true) {
      if (!cn) return undefined;
      if (cn == a) {
        return pth.join("/");
      }
      pth.unshift(cn.__name__);
      cn = cn.__parent__;
    }
  }
  */      
om.topAncestorName = function (x,rt) {
  if (x == rt) return [];
  var pr = om.getval(x,"__parent__");// no inheritance version of this.__parent__;
  if (!pr) return undefined;
  if (pr == rt) return x.__name__;
  return om.topAncestorName(pr,rt);

}

//var stdLibs = {om:1,geom:1};
var stdLibs = {om:1};

om.inStdLib = function (x) {
  var nm = om.topAncestorName(x,__pj__);
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


om.DNode.remove = function () {
  var pr = this.__parent__;
  var nm = this.__name__;
  pr[nm] = undefined;
}

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
 
  // if a relative path use x as the start point. ow start with root (which is set to __pj__ if missing)
  
  om.evalPath = function (x,iipth,root) {
    // if path starts with "" or "/" , take this out
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
      cv = x;
      pth = ipth;
    }
    var ln = pth.length;
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
  
// todo clean this up; get rid of above function
om.DNode.evalPath = function (path) {
  return om.evalPath(this,path);
}

om.pathSetValue = function (o,path,v) {
  var lnm1 = path.length - 1;
  var spth = path.slice(0,lnm1);
  var lst = path[lnm1];
  var fp = om.evalPath(o,spth);
  if (fp) {
    fp[lst] = v;
  }
}

om.DNode.pathSetValue = function (path,v) {
  om.pathSetValue(this.path,v);
}

om.applyMethod = function (m,x,a) {
  if (x && ((typeof(x)=="object")||(typeof(x)=="function"))) {
    var mth = x[m];
    if (mth && (typeof mth == "function")) {
      return mth.apply(x,a);
    }
  }
  return x;
}


om.error = function () {
  var a = arguments;
  console.log("ERROR",a);
  debugger;
}

// internal properties are excluded from the iterators and recursors (including copy) 

om.internalProps = {"__parent__":1,"__protoChild__":1,"__value__":1,"__hitColor__":1,"__chain__":1,"__copy__":1,__name__:1,widgetDiv:1,__protoLine__:1};
om.internal = function (nm) {
   return om.internalProps[nm];
}

// only consider objects on the chain which are in the tree
om.DNode.findPropertyOnInheritanceChain = function (p) {
  var v = this.get(p);  // @recent
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
om.DNode.treeProperty = function (p,excludeAtomicProps) {
  if ((!this.hasOwnProperty(p)) ||  om.internal(p)) return false;
  var ch = this[p];
  var tpc = typeof ch;
  if (ch && (tpc=="object")) {
    var pr = ch.__parent__;
    return (pr == this);
  } else {
    return !excludeAtomicProps; // an atom
  }
}

om.DNode.nonAtomicTreeProperty = function (p) {
 return this.treeProperty(p,1);
}


om.LNode.treeProperty = function (p,excludeAtomicProps) {
  var ch = this[p];
  var tpc = typeof ch;
  if (ch && ((tpc=="object")||(tpc=="function"))) {
    var pr = ch.__parent__;
    return (pr == this);
  } else {
    return !excludeAtomicProps; // a constant
  }
}


om.LNode.nonAtomicTreeProperty = function (p) {
 return this.treeProperty(p,1);
}


om.DNode.anyTrue = function (fn) {
  for (var k in this) {
    if (this.hasOwnProperty(k) && !om.internal(k)) {
      var v = this[k];
      if (fn(v)) return true;
    }
  }
  return false;
}


om.DNode.keyCount = function () {
  var rs = 0;
  for (var k in this) {
    if (this.hasOwnProperty(k) && !om.internal(k)) {
      rs++;
    }
  }
  return rs;
}

om.DNode.someKey = function () {
  for (var k in this) {
    if (this.hasOwnProperty(k) && !om.internal(k)) {
      return k;
    }
  }
}

om.DNode.filterByKey  = function (fn) {
  var rs = om.DNode.mk();
  for (var k in this) {
    if (this.hasOwnProperty(k)) {
      if (fn(k)) rs[k] = this[k];
    }
  }
  return rs;
}

om.DNode.children = function () { // only the object children
  var rs = [];
  this.iterValues(function (k,v) {
    if (om.isObject(v)) {
      rs.push(v);
    }});
  return rs;
}

om.isObject = function (o) {
  if (o) {
    var tp = typeof(o);
    return (tp == "object") || (tp == "function");
  }
  return false;
}

om.DNode.createDescendant = function (pth) {
  var cnd = this;
  pth.forEach(function (k) {
    if (k == "") return;
    var d = cnd[k];
    if (d === undefined) {
      var nnd = om.DNode.mk();
      cnd.set(k,nnd);
      cnd = nnd;
    } else {
      if (!cnd.hasOwnProperty(k)) om.error("Conflict in createDescencant",pth.join("/"));
      if (!om.DNode.isPrototypeOf(d)) om.error("Conflict in createDescendant ",pth.join("/"));
      cnd = d;
    }
  });
  return cnd;
}
// key might be a path within this, eg a/b/c


om.setval = function (f,key,val) {
  return om.DNode.set.call(f,key,val);
}


om.DNode.sett = function (key,val) { // returns this
  this.set(key,val);
  return this;
}

om.DNode.pathToAncestor = function (a) { // returns a pair the first parent which has a __prototype__ link.
  var rs = [];
  var cv = this;
  while (true) {
    if (cv == a) return rs;
    var nm = cv.__name__;
    rs.unshift(nm);
    var pr = cv.__parent__;
    if (!pr) return undefined;
    cv = pr;
  }
}


om.parentIs = function (x,parent) {
  var tpx = typeof x;
  if ((tpx == "object") || (tpx == "function")) {
    return x.__parent__ == parent;
  }
  return false;
}


om.hasMethod = function(x,name) {
  var tpx = typeof x;
  if (x && (tpx == "object")) {
    var mth = x[name];
    if (typeof mth == "function") return mth;
  }
  return undefined;
}


om.DNode.getMethod = function(x,name) {
  var tpx = typeof x;
  if (x && (tpx == "object")) {
    var mth = x[name];
    if (typeof mth == "function") return mth;
  }
  return undefined;
}
// an LNode is a kind of Node too 

om.isNode = function(x) { 
  return om.DNode.isPrototypeOf(x) || om.LNode.isPrototypeOf(x);
}




om.DNode.deepUpdate = function () {
  if (this.__isPrototype__) return;
  var mthi = om.getMethod(this,"update");
  if (mthi) {
      mthi.apply(this);
      return;
  }
  this.iterTreeItems(function (nd) {
    nd.deepUpdate();
  },true);
}


om.LNode.deepUpdate = om.DNode.deepUpdate;


om.DNode.deepContract = function () {
  if (this.__isPrototype__) return;
  var mthi = om.getMethod(this,"contract");
  if (mthi) {
      mthi.apply(this);
      return;
  }
  this.iterTreeItems(function (nd) {
    nd.deepContract();
  },true);
}


om.LNode.deepContract = om.DNode.deepContract;

om.hideNode = function (x) {
  x.hidden = 1;
}

om.deepHide = function (x) {
    om.deepApplyMeth(x,"hideNode");
}

om.showNode = function (x) {
  x.hidden = 0;
}

om.showAncestors = function (x) {
  x.hidden = 0;
  var px = x.__parent__;
  if (px) {
    om.showAncestors(px);
  }
}



om.toInt = function (s) { // vs string other than Int ; other numbers not considered in this context
  if (typeof s == "number") return s;
  var pin = parseInt(s);
  if (pin.toString() === s) return pin;
  return false;
}

om.LNode.iterValues = function (fn) {
  var ln = this.length;
  var rs = false;
  for (var i=0;i<ln;i++) {
    var v = this[i];
    if (fn(v)) rs = true;
  }
  var xf = om.getval(this,"transform");
  if (xf) {
    if (fn(xf)) rs = true;
  }
  return rs;
}

om.LNode.deepExpand  = om.DNode.deepExpand;

om.LNode.set = function (key,val) { // returns val
  this[key] = val;
  if (om.isObject(val)) {
    var cp = val.get("__parent__");
    var nm = val.get("__name__");
    if (cp && nm) {
      cp[nm] = undefined; // detach val from its current parent, if any
    }
    val.__name__ = key;
    val.__parent__ = this;
  }
  return val;
}

om.adopt = function (parent,name,child) {
  var tpc = typeof child;
  if (child && ((tpc == "object")||(tpc == "function"))) {
    child.__parent__ = parent;
    child.__name__ = name;
  }
}

om.LNode.pushChild = function (nc) {
  this.push(nc);
  om.adopt(this,cln,nc);
}

om.LNode.extend = function (ncs) {
  var thisHere = this;
  ncs.forEach(function (nc) {
    thisHere.pushChild(nc);
  });
}

om.LNode.setElements = function (a) {
  this.length = 0;
  var ln = a.length;
  for (var i=0;i<ln;i++) {
    var ch = a[i];
    this.push(ch);
    om.adopt(this,i,ch);
  }
}

om.LNode.setChild = function (key,nch) {
  this[key] = nch;
  nch.__parent__ = this;
  nch.__name__ = key;
}
  
  // always use this instead of push
om.LNode.pushChild = function (nch) {
  var ln = this.length;
  this.push(nch);
  nch.__parent__ = this;
  nch.__name__ = ""+ln;
}

om.isAtomic = function (x) {
  if (!x) return true;
  var tp = typeof x;
  return (tp != "object") && (tp != "function");
}
  
  om.removeValues =  function (x) {
    x.deepApplyMeth("removeValue",null,true); // true means dont stop - recurse past where removeValue works
  }  
  
 
  om.DNode.setTransient = function (prop,vl) {
    var tr = this.__transient__;
    if (!tr) {
      tr = {};
      this.__transient__ = tr;
    }
    tr[prop]=vl;
  }
  
  om.DNode.getTransient = function (prop) {
    var tr = this.__transient__;
    if (tr) {
      return tr[prop];
    }
    return undefined;
  }
  
  
  om.LNode.getTransient = om.DNode.getTransient;
  om.LNode.setTransient = om.DNode.setTransient;
  
  
  
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
  
  om.DNode.setProperties = function (src,props,setComputationally) {
    if (props) {
      var pd = om.arrayToDict(props);
    }
    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        if (props) {
          if (pd[k]===undefined) continue;
        }
        this.set(k,src[k],setComputationally);
      }
    }
  }
  
  // used in new<T>type; converts property values to nodes when appropriate
  
  om.DNode.setPropertiesN= function (src,props,setComputationally) {
    if (props) {
      var pd = om.arrayToDict(props);
    }
    for (var k in src) {
      if (props) {
        if (pd[k]===undefined) continue;
      }
      var cv = src[k];
      if (cv && (typeof cv == "object")) {
        this.set(k,om.toNode(cv),setComputationally);
      } else {
        this.set(k,cv,setComputationally);
      }
    }
    return this;
  }
  
  // used in new<T>type ; converts property values to nodes when appropriate
  
  // check that a tree with correct parent pointers and names descends from this node. For debugging.
  om.DNode.checkTree = function () {
    var thisHere = this;
    this.iterItems(function (v,k) {
      if (!om.isNode(v)) return;
      if ((v.__parent__) != thisHere) om.error(thisHere,v,"bad parent");
      if ((v.__name__) != k) om.error(thisHere,v,"bad name");
      v.checkTree();
    });
  }
  
   om.LNode.checkTree = function () {
    var thisHere = this;
    this.iterItems(function (v,k) {
      if (!om.isNode(v)) return;
      if ((v.__parent__) != thisHere) om.error(thisHere,v,"bad parent");
      if ((v.__name__) != k) om.error(thisHere,v,"bad name");
      v.checkTree();
    });
  }
  
  om.setPropE = function (dst,src,p) {
    var pv = src[p];
    if (pv !== undefined) {
      dst[p] = pv;
      return pv;
    }
    return undefined;
  }
  
  om.isAtomic = function (x) {
    var tp = typeof(x);
    return (x == null) || ((tp != "object") && (tp != "function"));
  }
  
  // gets rid of __parent__ pointers, brings atomic data over from prototypes
  om.DNode.stripOm = function () {
    var rs = {};
    for (var k in this) {
      if (this.nonAtomicTreeProperty(k)) {
        var kv = this[k];
        rs[k] = kv.stripOm();
      } else {
        kv = this[k];
        if (om.isAtomic(kv)) {
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
        if (om.isAtomic(kv)) {
          rs.push(kv);
        }
      }
    }
    return rs;
  }
  
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
    rs.__isFunction__ = 1;
    return rs;
  }
  
  om.toFunction = function (f) {
    if (typeof(f) != "function") om.error("Expected function");
    var pt = om.parseFunctionText(f.toString());
    return new om.Function(pt);
  }
  
  
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
  
  
  // the path of the proto of this fellow
  // if the proto is inside rt, return eg a/b/c ow return /a/b/c
  
  
  om.DNode.protoPath = function (rt) {
    var pr = Object.getPrototypeOf(this);
    var ppr = om.getval(pr,"__parent__");
    if (!ppr) return undefined;
    var rs = om.pathOf(pr,rt);
    return rs;
  }
  
  om.DNode.get = function (k) { // get without inheritance from proto
    if (this.hasOwnProperty(k)) {
      return this[k];
    }
    return undefined;
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

  om.LNode.get = om.DNode.get;
  
    om.DNode.getName = function (){return this.get("__name__")}


// might be itself
om.DNode.lastProtoInTree = function () {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent__; 
  if (!pr) return this;
  return p.lastProtoInTree();
}

  
// name of the nearest prototype in the chain which is a type
 om.DNode.typeName = function () {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent__; 
  if (!pr) return "";
  if (p.get("__isType__")) {
    var nm = p.__name__;
    return nm?nm:"";
  }
  return p.typeName();
}

// is there any prototype with this name?
om.DNode.hasTypeName = function (name) {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent__; 
  if (!pr) return false;
  if (p.get("__isType__")) {
    var nm = p.__name__;
    if (nm==name) return true;
  }
  return p.typeName();
}

 om.LNode.typeName = function () {
  return "LNode";
 }
 
 om.storageDir = "/mnt/ebs1/termite/storage/"
 om.walkToTree = function (w) {
  function stripTop(pth) {
    var ln = om.storageDir.length;
    return pth.substr(ln);
  }
  function insertPath(tr,pth) {
    if (pth=="") return tr;
    var sp = pth.split("/");
    var ct = tr;
    sp.forEach(function (nm) {
      var cv = ct[nm];
      if (!cv) {
        cv = om.DNode.mk();
        ct.set(nm,cv);
      }
      ct = cv;
    });
    return ct;
  }  
  var rs = om.DNode.mk();
  w.forEach(function (v) {
    var irs = rs;//for debugging
    var pth = v[0];
    var fls = v[2];
    var spth = stripTop(pth);
    console.log("spth",spth);
    var tr = insertPath(rs,spth);
    fls.forEach(function (v) {
      var lf = om.DNode.mk();
      lf.set("__leaf__",1);
      tr.set(v,lf);
    })
  });
  return rs;
  
 }
 om.walkDir = function (pth,cb) {
  var dt = {path:pth,pw:om.pw}
  om.ajaxPost("/api/walkDirectory",dt,function (rs) {
    var abc = 55;
    rs.path = pth;
    var tr = om.walkToTree(rs.value);
    
    cb(tr);
  });
 }
 
 om.DNode.hasTreeProto = function () {
   var pr = Object.getPrototypeOf(this);
   return pr && (pr.__parent__);
 }
 
 Function.prototype.hasTreeProto = function () {return false;}
 
  om.LNode.hasTreeProto = function () {
    return false;
  }
  
  
  om.DNode.addIfMissing = function (nm,v) {
    var rs = this[nm];
    if (!rs) {
      if (v) {
        rs = v;
      } else {
        rs = om.DNode.mk();
      }
      this.set(nm,rs);
    }
    return rs;
  }
  
  om.DNode.copy = function () { //shallow
    var pr = Object.getPrototypeOf(this);
    var rs = Object.create(pr);
    for (var k in this) {
      if (this.hasOwnProperty(k)) {
        var kv = this[k];
        if (this.treeProperty(k,true)) {
          rs[k] = kv.copy();
        } else {
          rs[k] = kv;
        }
      }
    }
    return rs;
  }
  
  
  om.DNode.nthAncestor = function (n) {
    var rs = this;
    for (var i=0;i<n;i++) {
      var pr = rs.get("__parent__");
      if (!pr) return rs;
      rs = pr;
    }
    return rs;
  }
  
  
  om.DNode.deepApplyFun = function (fn) {
    fn(this);
    this.iterTreeItems(function (c) {
      c.deepApplyFun(fn);
    },true);
  }
  
  om.LNode.deepApplyFun = om.DNode.deepApplyFun;
  
  
  om.DNode.applyFunToAncestors = function (fn,stopAt) {
    fn(this);
    if (this == stopAt) return;
    var pr = this.__parent__;
    if (pr) {
      pr.applyFunToAncestors(fn,stopAt);
    }
  }
  
  

  om.LNode.applyFunToAncestors = om.DNode.applyFunToAncestors;

  om.DNode.deepApplyMeth = function (mth,args,dontStop) { // dontstop recursing once the method applies
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
  }
   
  om.LNode.deepApplyMeth = om.DNode.deepApplyMeth;
  
  om.DNode.deepSetProp = function (p,v) {
    this.deepApplyFun(function (nd) {nd[p]=v;});
  }
  
  
  om.DNode.setPropForAncestors = function (p,v,stopAt) {
    this.applyFunToAncestors(function (nd) {nd[p]=v;},stopAt);
  }
  
  
  
  om.DNode.unexpand = function (p,v) {
    this.deepApplyFun(function (x) {
      if (om.hasMethod(x,"update")) delete x.value;});
  }
  

om.LNode.deepSetProp = om.DNode.deepSetProp;

om.DNode.addAtPath = function (ipth,x) {
  var cnd = this;
  if (typeof ipth == "string") {
    var pth = ipth.split("/");
  } else {
    pth = ipth;
  }
  var ln = pth.length;
  for (var i=0;i<ln-1;i++) {
    var k = pth[i];
    var nnd =  om.getval(cnd,k);
    if (nnd == undefined) {
      var nnd = om.mkNode();
      cnd.setChild(k,nnd);
      cnd = nnd;
    } else if (om.DNode.isPrototypeOf(ch)) {
      cnd = ch;
    } else {
      om.error("conflict in addAtPath ",pth.join("/")," at ",k);
    }
  }
  k = pth[ln-1];
  var nnd =  om.getval(cnd,k);
  if (nnd !==undefined) {
    om.error("conflict in addAtPath ",pth.join("/")," at ",k);
  }
  cnd.set(k,x);
  return x;

}

om.LNode.max = function (fld) {
  var rs = undefined;
  this.forEach(function (v) {
    var f = v[fld];
    if (typeof rs == "number") {
      rs = Math.max(rs,f);
    } else {
      rs = f;
    }
  });
  return rs;
}


om.LNode.min = function (fld) {
  var rs = undefined;
  this.forEach(function (v) {
    var f = v[fld];
    if (typeof rs == "number") {
      rs = Math.min(rs,f);
    } else {
      rs = f;
    }
  });
  return rs;
}


om.LNode.eval = function () {return this;}


om.DNode.funstring1 = function (sf,whr) {
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
}


om.LNode.funstring1 = om.DNode.funstring1;

om.DNode.funstring = function (forAnon) {
  if (forAnon) {
    var whr = "__pj__.anon.";
  } else {
    var p = om.pathOf(this,__pj__);
    var whr ="__pj__."+p.join(".")+".";
  }
  var rs = [""];
  this.funstring1(rs,whr);
  return rs[0];
}


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
      //code
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
  
  //does any node in the tree descending from this inherit a property value from nd[p]?
  om.DNode.treeInheritsPropertyFrom = function (nd,p) {
    if (this.inheritsPropertyFrom(nd,p)) return true;
    for (var k in this) {
    if (this.treeProperty(k,true))  {
      var v = this[k];
      if (v.treeInheritsPropertyFrom(nd,p)) return true;
        //code
      }
    }
    return false;
  }
  
  om.LNode.inheritsPropertyFrom = function () {return false;}

  
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
  
  //does any node in the tree descending from this inherit a property value from nd[p]?
  om.DNode.treeInheritsPropertyFrom = function (nd,p) {
    if (this.inheritsPropertyFrom(nd,p)) return true;
    for (var k in this) {
    if (this.treeProperty(k,true))  {
      var v = this[k];
      if (v.treeInheritsPropertyFrom(nd,p)) return true;
        //code
      }
    }
    return false;
  }
  
  om.LNode.treeInheritsPropertyFrom = om.DNode.treeInheritsPropertyFrom;
  
  om.DNode.treeInheritsSomePropertyFrom = function (nd,p) {
    if (this.inheritsSomePropertyFrom(nd,p)) return true;
    for (var k in this) {
      if (this.treeProperty(k,true))  {
        var v = this[k];
        if (v.treeInheritsSomePropertyFrom(nd,p)) return true;
      }
    }
    return false;
  }
  
  
  om.LNode.treeInheritsSomePropertyFrom = om.DNode.treeInheritsSomePropertyFrom;
  
  om.installType("DataSource");
  
  om.DataSource.mk = function (url) {
    var rs = Object.create(om.DataSource);
    rs.url = url;
    return rs;
  }
  
  om.dataSourceBeingLoaded = null;
  om.loadedData = [];
  om.loadDataTimeout = 2000;
  
  // this is the functino which should  wrap the data in the external file, jsonp style
  __pj__.loadData = function (x) {
    var cb = om.loadDataCallback;
    om.loadedData[om.dataSourceBeingLoaded] = 1;
    if (cb) cb(x); // simulatewha
  }
  
  om.loadDataError = function (url) {
    alert('Could not load '+url);
  }
  
  om.DataSource.loadTheData = function (cb) {
    setTimeout(function () {
      var cds = om.dataSourceBeingLoaded;
      if (!om.loadedData[cds]) {
        om.loadDataError(cds);
      }
    },om.loadDataTimeout
    );
    var url = this.url;
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
        om.loadNextDataSource(n+1,cb);
    }
    dts.loadTheData(afterLoad);
  }
  
  
  
  om.loadTheDataSources = function (x,cb) {
    om.loadedData = [];
    om.collectDataSources(x);
    om.loadNextDataSource(0,cb);
  }
  
  om.DNode.createDNodeChild = function (k) {
    var rs = this[k];
    if (rs) return rs;
    rs = om.DNode.mk();
    this.set(k,rs);
    return rs;
  }
  
  
  om.DNode.setNote = function (k,note) {
    var notes = this.createDNodeChild('__notes__');
    notes[k] = note;
  }
  
  
  om.DNode.setInputF = function (k,inf) {
    var infs = this.createDNodeChild('__inputFunctions__');
    infs[k] = inf;
  }
  
  
  
  om.DNode.setOutputF = function (k,outf) {
    var outfs = this.createDNodeChild('__outputFunctions__');
    outfs[k] = outf;
  }
  
  om.DNode.getInputF = function (k) {
    var infs = this.__inputFunctions__;
    if (infs) return infs.get(k);
  }
  
  om.LNode.getInputF = function (k) {
    return undefined;
  }
  
  
  om.DNode.getOutputF = function (k) {
    var outfs = this.__outputFunctions__;
    if (outfs) return outfs.get(k);
  }
  
  om.LNode.getOutputF = function (k) {
    return undefined;
  }

  
  om.DNode.getNote = function (k) {
    var notes = this.__notes__;
    if (notes) return notes.get(k);
  }
  
  om.LNode.getNote = function (k) {
    return undefined;
  }
 // om.DNode.setInspectable = function () {} // for backward compatability @todo REMOVE when the time comes
 
})();

