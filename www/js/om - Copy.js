//om = __pj__.om; // TEMPORARY!
(function () {

var om = __pj__.om;

om.__externalReferences__ = [];

om.isObject = function (o) {
  return o && (typeof(o) == "object");
}


om.isNode = function(x) { 
  return om.Node.isPrototypeOf(x);
}

// creates DNodes if missing so that path pth descending from this exists
om.Node.createDescendant = function (pth) {
  var cnd = this;
  pth.forEach(function (k) {
    var d = cnd[k];
    if (d === undefined) {
      var nnd = om.DNode.mk();
      cnd.set(k,nnd);
      cnd = nnd;
    } else {
      if (!cnd.hasOwnProperty(k)) om.error("Conflict in createDescencant",pth.join("/"));
      if (!om.Node.isPrototypeOf(d)) om.error("Conflict in createDescendant ",pth.join("/"));
      cnd = d;
    }
  });
  return cnd;
}

om.Node.mfreeze = function (k) {
  if (typeof k == "string") {
    this.setFieldStatus(k,"mfrozen");
  } else {
    this.__mfrozen__=1;
  }
  return this;
}


// causes manual overriding of fields to be recorded
om.DNode.assertComputed = function () {
  this.__computed__ = 1; 
  return this;
}

// key might be a path
// For now, the only meaningful value of status is "mfreeze"
om.DNode.set = function (key,val,status) { // returns this, for chaining
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
  if (om.isNode(val)) {
    pr[nm] = val;
    val.__name__ = nm;
    val.__parent__ = pr;
    return this;
  }
  if (typeof(val)=="object") {
    om.error('Only Nodes and atomic values can be set as children in <Node>.set("'+p+'",<val>)');
  } 
  pr[nm] = val;
  if (status == "mfreeze") {
    pr.mfreeze(nm);
  }
  return this;
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
// of the path returned
om.Node.pathOf = function (rt) {
  var rs = [];
  var pr = this.__parent__;
  if (!pr) return undefined;
  var cx = this;
  while (cx) {
    if (cx == rt) return rs;
    if (cx == __pj__) {
      rs.unshift("/");
      return rs;
    }
    rs.unshift(cx.__name__);
    cx = om.getval(cx,"__parent__");
  }
  return undefined;
}

// name of the ancestor just below __pj__; for tellling which top level library something is in 
om.Node.topAncestorName = function (rt) {
  if (this == rt) return undefined;
  var pr = this.__parent__;
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
 
  // iipth might be a string or an array.  A relative path starts with "/" or with "" if an array.
  // if a relative path use this as the start point. ow start with root (which is set to __pj__ if missing)
  
  om.Node.evalPath = function (iipth,root) {
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
      cv = this;
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
  

om.Node.pathSetValue = function (o,path,v) {
  var lnm1 = path.length - 1;
  var spth = path.slice(0,lnm1);
  var lst = path[lnm1];
  var fp = this.evalPath(spth);
  if (fp) {
    fp[lst] = v;
  }
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

// internal properties are excluded from the iterators and recursors 

om.internalProps = {"__parent__":1,"__protoChild__":1,"__value__":1,"__hitColor__":1,"__chain__":1,"__copy__":1,__name__:1,widgetDiv:1,__protoLine__:1};
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



// TO HERE

om.DNode.children = function () { // only the object children
  var rs = [];
  this.iterValues(function (k,v) {
    if (om.isObject(v)) {
      rs.push(v);
    }});
  return rs;
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
    if (!src) return;
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
    this.iterTreeItems(function (v,k) {
      if ((v.__parent__) != thisHere) om.error(thisHere,v,"bad parent");
      if ((v.__name__) != k) om.error(thisHere,v,"bad name");
      v.checkTree();
    },true);
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

 om.DNode.protoName = function () {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent__; 
  if (!pr) return "";
  var nm = p.__name__;
  return nm?nm:"";
  
}



 om.LNode.protoName = function () {
  return "LNode";
 }

  /*
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
 */
 
 
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
  
  
  
  om.DNode.deepDeleteProps = function (props) {
    this.deepApplyFun(function (nd) {
      props.forEach(function (p) {
        delete nd[p];
      });
    });
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
  
  om.DNode.createChild = function (k,initFun){
    var rs = this[k];
    if (rs) return rs;
    rs = initFun();
    this.set(k,rs);
    return rs;
  }
  
  om.DNode.createDNodeChild = function (k) {
    return this.createChild(k,om.DNode.mk);
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
 
 
 // rules for update. What we want is that when the user modifies things by hand, they should not be overwrittenn by update. Also, manual overrides
 // should be saved so that they can be reinstalled. Generally update operations should only create nodes if they are not already present,
 // and only set those fields as necessary.  Every node that is created by update should be marked __computed__ (or should have an ancestor marked __computed__).
 // A node that is not open to manipulation by hand should be marked __mfrozen__ (or should have an ancestor marked __mfrozen__).
 // If only some fields of a node are to be shielded from manipulation, they should be mfrozen via the operation .setFieldStatus(fieldName,"mfrozen")
 
 
 om.DNode.isComputed = function () {
  if (this.__computed__) return true;
  if (this == __pj__) return false;
  return this.__parent__.isComputed();
 }
 
 om.LNode.isComputed = om.DNode.isComputed;
 
 om.DNode.isMfrozen = function () {
  if (this.__mfrozen__) return true;
  if (this == __pj__) return false;
  return this.__parent__.isMfrozen();
 }
 
 om.LNode.isMfrozen = om.DNode.isMfrozen;
 
  om.DNode.setFieldStatus = function (k,status) {
    var statuses = this.createDNodeChild('__fieldStatus__');
    statuses[k] = status;
  }
  
  
  om.DNode.getFieldStatus = function (k) {
    var statuses = this.get('__fieldStatus__');
    if (statuses) {
      return statuses.get(k);
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

 
  om.done = function (x,local) {
    var pth = om.pathToString(om.pathOf(x,__pj__));
    var cb = om.doneCallback;
    if (cb) {
      cb(x,local);
    }
  }
  // find all of the overrides, return an array of [[path0,value0],[path1,value1]...]
  
  om.DNode.findOverrides1  = function (rs,p) {
    var statuses = this.get('__fieldStatus__');
    if (statuses) {
      for (var k in statuses) {
        vk = statuses[k];
        if (vk == 'overridden') {
          p.push(k);
          var ps = om.pathToString(p);
          rs.push([ps,this[k]]);
          p.pop();
        }
      }
    }
    this.iterTreeItems(function (v,k) {
      p.push(k);
      v.findOverrides1(rs,p);
      p.pop();
    },true);  // excludeAtomicProps = true
  }
  
  om.LNode.findOverrides1 = om.DNode.findOverrides1;
  
  om.DNode.findOverrides = function () {
    var rs = [];
    var p = [];
    this.findOverrides1(rs,p);
    return rs;
  }
  
  
 })();

