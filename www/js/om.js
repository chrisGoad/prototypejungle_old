
(function (pj) {
  "use strict"
  var om = pj.om;
// This is one of the code files assembled into pjcs.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract


//<Section> Tree operations ==================================
 // om ("object model") is a built-in module.
 
 om.__builtIn = 1;

// the central structure is a tree, made of 2 kinds of internal nodes (DNode,LNode), and atomic leaves (numbers,null,functions,strings)
// internal nodes have __name and __parent  attributes

// a DNode is what python calls a dictionary, and LNode is like a python list or Javascript array ([] is its prototype).



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


//  make the same method fn work for DNodes,Lnodes
om.nodeMethod = function (nm,fn) {
  om.LNode[nm] = om.DNode[nm] = fn;
}

// only strings that pass this test may  be used as names of nodes
om.checkName = function (s) {
  if (s === undefined) {
    debugger;
  }
  if (s==='') return false;
  if (s==='$') return true;
  if (typeof s==="number") {
    return s%1 === 0;
  }
  return !!s.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
}


om.checkPath = function (s) {
  var sp = s.split("/");
  var ln = sp.length;
  if (ln===0) return false;
  for (var i=0;i<ln;i++) {
    var e = sp[i];
    if (((i>0) || (e !== "")) // "" is allowed as the first element here, corresponding to a path starting with "/"
      &&  !om.checkName(sp[i])) {
      return false;
    }
  }
  return true;
}

// if the path starts with "/" this means start at pj, regardless of origin 
om.evalPath = function (origin,ipth) {
  if (!ipth) return; // it is convenient to allow this option
  if (typeof ipth === "string") {
    var pth = ipth.split("/");
  } else {
    pth = ipth;
  }
  var ln = pth.length;
  if (ln===0) return origin;
  if (pth[0]==="") {
    var cv = pj;
    var sti = 1;
  } else {
    cv = origin;
    sti = 0;
  }
  for (var i=sti;i<ln;i++) {
    var k = pth[i];
    if (cv && (typeof(cv) === "object")) {
      cv = cv[k];
    } else {
      return undefined;
    }
  }
  return cv;
}


// path relative to rt. If rt is undefined return the chain up to where __parent is undefined. If rt === pj,
// return the path in absolute form: ie starting with "" (so its string version will start with a /)
//If pj is in the ancestor chain, and rt does not appear earlier in the chain
//an absolute path is returned. This is a path that starts with "" (so its string version will start with a /)
//  If neither rt nor pj is in the ancestor chain, undefined is returned. If rt is null, the path
// imply that only absolute paths are returned.
/*
om.nodeMethod("__pathOf",function (rt) {
  //var rs = om.Path.mk();
  var rs = [];
  var pr = this.__parent;
  if (!pr) return undefined;
  var cx = this;
  while (true) {
    if (cx === rt) return rs;
    if (!cx || cx === pj) {
      rs.unshift("");
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
*/

// path relative to rt. if if rt is not in the ancestor chain, "" occurs at the beginning
// of the path returned (so its string version will start with a /)
/*om.nodeMethod("__pathOf",function (rt) {
  //var rs = om.Path.mk();
  var rs = [];
  var cx = this;
  var rtispj = rt === pj;
  while (true) {
    if (cx === undefined) return rt?undefined:rs;
    if (cx === rt)  {
      if (rt === pj) {
        rs.unshift("");
      }
      return rs;
    }
    var nm = om.getval(cx,"__name");
    if (nm===undefined) {// we have reached an unnamed node; should not have a parent either
      return rs;
    }
    rs.unshift(nm);
    cx = om.getval(cx,"__parent");
  }
  return undefined;
});


om.nodeMethod("__pathOf",function (irt) {
  
  //var rs = om.Path.mk();
  var rs = [];
  var cx = this;
  var rt=irt?rt:pj;
  while (true) {
    if (cx === undefined) return undefined;
    if (cx === rt)  {
      if (rt === pj) {
        rs.unshift("");
      }
      return rs;
    }
    var nm = om.getval(cx,"__name");
    if (nm===undefined) {// we have reached an unnamed node; should not have a parent either
      return undefined;//
    }
    rs.unshift(nm);
    cx = om.getval(cx,"__parent");
  }
  return undefined;
});
*/

om.pathOf = function (nd,irt) {
  var rs = [];
  var cx = nd;
  var rt=irt;//?irt:pj;
  while (true) {
    if (cx === undefined) {
      return rt?undefined:rs;
    }
    if (cx === rt)  {
      if (rt === pj) {
        rs.unshift("");
      }
      return rs;
    }
    var nm = om.getval(cx,"__name");
    if (nm!==undefined) {// if we have reached an unnamed node, it should not have a parent either
      rs.unshift(nm);
    }
    cx = om.getval(cx,"__parent");
  }
  return undefined;
}

om.nodeMethod("__pathOf",function (rt) {return om.pathOf(this,rt);});


om.isObject = function (o) {
  return o && (typeof(o) === "object");
}


om.isAtomic = function (x) {
  return !om.isObject(x);
}
  

om.isNode = function(x) { 
  return om.DNode.isPrototypeOf(x) || om.LNode.isPrototypeOf(x);
}



om.createPath = function (nd,pth) {
// creates DNodes if missing so that path pth descending from this exists
  var cnd = nd;
  pth.forEach(function (k) {
    // ignore "" ; this means that createPath can be used on pj
    if (k==="") return;
    if (!om.checkName(k)){
      om.error('Ill-formed name "'+k+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
    }
    if (!cnd.__get) {
      debugger;
    }
    var d = cnd.__get(k);
    
    if (d === undefined) {
      var nnd = om.DNode.mk();
      cnd.set(k,nnd);
      cnd = nnd;
    } else {
     // if (!cnd.hasOwnProperty(k)) om.error("Conflict in createDescencant",pth.join("/"));
      if (!om.isNode(d)) om.error("Conflict in createPath ",pth.join("/"));
      cnd = d;
    }
  });
  return cnd;
}
  

// gets own properties only
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

om.preSetChildHooks = [];
om.setChildHooks = [];

//if x.__k_watched then some field k of x is watched. If any field of x is watched x.__watched is set.
// For watched fields, a change event is emitted of the form {name:change node:node property:nm}

var setChild = function (node,nm,c) {
  // this needs to work before om.ComputedField is defined
  om.preSetChildHooks.forEach(function (fn) {fn(node,nm);});
  adopt(node,nm,c);
  var prv = node[nm];
  node[nm] = c;
  om.setChildHooks.forEach(function (fn) {fn(node,nm,c);});
  if (node.__watched && node["__"+nm+"_watched"]) {
    var event = om.Event.mk("change",node);
    event.property=nm;
    event.emit();
  }
}

om.watch = function (node,property) {
  node.__watched = 1;
  node["__"+property+"_watched"]=1;
}

// set has several variants:

// x.set(nm,v)  where nm is a simple name (no /'s). This causes v to be the new child of x if v is a node, other wise just does x[nm] = v

// x.set(path,v) where path looks like a/b/../nm. This creates the path a/b/... if needed and sets the child nm to v. Whatever part of the path
// is already there is left alone.

//x.set(src)  extends x by src, in the sense of jQuery.extend in deep mode


om.DNode.set = function (key,val) { // returns val
  if (arguments.length === 1) {
    om.extend(this,key);
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
    var pr = om.createPath(this,pth);
  } else {
    pr = this;
    nm = key;
  }
  if (!om.checkName(nm)){
    om.error('Ill-formed name "'+nm+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
  }
  setChild(pr,nm,val);
  return val;
}


om.LNode.set = function (key,val) {
  setChild(this,key,val);
  return val;
}


om.setIfExternal = function (pr,nm,vl) { // adopts vl below this if it is not already in a tree,ow just refers
  var tp = typeof vl;
  if ((tp === "object") && vl && vl.__get("__parent")) {
    pr[nm] = vl;
  } else {
    pr.set(nm,vl);
  }
  return vl;
}
  
// this is similar to jquery.extend in deep mode: it merges src into dst. Note that it does not include properties from the prototypes.
om.extend = function (dst,src) {
  if (!src) return dst;
  for (var k in src) {
    if (src.hasOwnProperty(k)) {
      var newVal = om.lift(src[k]);
      if (newVal === undefined) continue;
      var existingVal = dst[k];
      // merge if existingVal is a DNode; replace otherwise
      if (existingVal && om.DNode.isPrototypeOf(existingVal) && om.DNode.isPrototypeOf(newVal)) {
        om.DNode.extend(existingVal,newVal);
      }
      dst.set(k,newVal);
    }
  }
  return dst;
}


om.arrayToDict = function (a) {
  var rs = {};
  a.forEach(function (k) {rs[k] = 1;});
  return rs;
}


// transfer properties from src. If props is missing, extend dst by src
om.DNode.setProperties = function (dst,src,props,dontLift) {
  if (!src) return;
  if (!dst) {
    debugger;
  }
  var hasSet = dst.set; // include the case !hasSet so this will work for an ordinary object
  if (props) {
    props.forEach(function (k) {
        var sk = src[k];
        if (sk !== undefined) {
          if (hasSet) {
            dst.set(k,om.lift(sk));
          } else {
            dst[k] = sk;
          }
        }
    });
  } else {
    om.extend(dst,src);
  }
  return dst;
}

// Some LNode methods



om.LNode.toArray = function () {
  var rs = [];
  this.forEach(function (e) {rs.push(e);});
  return rs;
}
var arrayPush = Array.prototype.push;
om.pushHooks = [];
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
  var thisHere = this;
  om.pushHooks.forEach(function (fn,i) {fn(thisHere,i);});
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




// Some utilities for maping functions over trees.

// internal __properties are excluded from the iterators and recursors 

om.internalProps = {"__parent":1,"__protoChild":1,"__value__":1,"__hitColor":1,"__chain":1,"__copy":1,__name:1,widgetDiv:1,
  __protoLine:1,__inCopyTree:1,__headOfChain:1,__element:1,__domAttributes:1};
om.internal = function (nm) {
   return om.internalProps[nm];
}


  // a proper element of the tree: an own property with the right __parent link. If includeLeaves, then atomic own properties are included too

om.treeProperty = function (nd,p,includeLeaves,knownOwn) {
  if ((!knownOwn && !nd.hasOwnProperty(p)) ||  om.internal(p)) return false;
  var ch = nd[p];
  if (om.isNode(ch)) {
    return ch.__parent === nd;
  } else {
    return includeLeaves?(typeof ch !== "object"):false;
  }
}


 om.treeProperties = function (nd,includeLeaves) {
    var nms = Object.getOwnPropertyNames(nd);
    var rs = [];
    nms.forEach(function (nm) {
      if (om.treeProperty(nd,nm,includeLeaves,true)) rs.push(nm);
    });
    return rs;
  }

// apply fn(node[p],p,node) to each non-internal own property p. 
om.mapOwnProperties = function (nd,fn) {
  var ownprops = Object.getOwnPropertyNames(nd);
  ownprops.forEach(function (k) {
     if (!om.internal(k))  { //true: already known to be an owned property
      fn(nd[k],k,nd);
    }
  });
  return nd;
}
/*
om.ownProperties = function (nd) {
    var nms = Object.getOwnPropertyNames(nd);
    var rs = [];
    nms.forEach(function (nm) {
      if (properProperty(nd,nm,true)) rs.push(nm);
    });
    return rs;
  }
*/

// apply fn(node[p],p,node) to each treeProperty p  of node. Used extensively for applying functions through a tree
om.forEachTreeProperty = function (nd,fn,includeLeaves) { 
  var ownprops = Object.getOwnPropertyNames(nd);
  ownprops.forEach(function (k) {
     if (om.treeProperty(nd,k,includeLeaves,true))  { //true: already known to be an owned property
      fn(nd[k],k,nd);
    }
  });
  return this;
}

 // if nd itself has gthe propety, return true
om.ancestorHasOwnProperty  = function (nd,p) {
  var cv = nd;
  while (cv) {
    if (cv.__get(p)) return true;
    cv = cv.__get("__parent");
  }
  return false;
}

om.DNode.__inCore = function () {
  return om.ancestorHasOwnProperty(this,"__builtIn");
}
  // used eg for iterating through styles.
  // apply fn(nd[p],p,nd) to each atomic property of nd, including properties defined in prototypes, but excluding
  // those defined in core modules.
// sofar has the properties where fn has been called so far (absent except in the recursive call)
om.mapNonCoreLeaves = function (nd,fn,allowFunctions,isoFar) {
  var soFar = isoFar?isoFar:{};
  if (!nd) {
    debugger; 
  }
  if (!nd.__inCore || nd.__inCore()) return;
  var op = Object.getOwnPropertyNames(nd);
  op.forEach(function (k) {
    if (soFar[k]) return;
    if (!om.treeProperty(nd,k,true,true)) return true;
    soFar[k] = 1;
    var v = nd[k];
    var tpv = typeof v;
    if (v && (tpv === "object" )||((tpv==="function")&&!allowFunctions)) return;
    fn(v,k,nd);
  });
  var pr = Object.getPrototypeOf(nd);
  if (pr) {
    om.mapNonCoreLeaves(pr,fn,allowFunctions,soFar);
  }
}


om.deepApplyFun = function (nd,fn) {
  fn(nd);
  om.forEachTreeProperty(nd,function (c) {
    om.deepApplyFun(c,fn);
  });
}
  


om.deepDeleteProps = function (nd,props) {
  om.deepApplyFun(nd,function (ch) {
    props.forEach(function (p) {
      delete ch[p];
    });
  });
}



om.deepDeleteProp = function (nd,prop) {
  om.deepApplyFun(this,function (nd) {
    delete nd[prop]
  });
}


om.findAncestor = function (nd,fn) {
  if (nd===undefined) return undefined;
  if (fn(nd)) return nd;
  var pr = nd.__get("__parent");
  return om.findAncestor(pr,fn);
}
  

om.ancestorWithProperty = function (nd,p) {
  return om.findAncestor(nd,function (x) {
      return x[p]!==undefined;
  });
}

om.ancestorWithMethod = function (nd,p) {
  return om.findAncestor(nd,function (x) {
    return typeof x[p] === "function";
  });
}

om.removeHooks = [];

om.nodeMethod("remove",function () {
  var thisHere = this;
  om.removeHooks.forEach(function (fn) {
      fn(thisHere);
  });
  var pr = this.__parent;
  var nm = this.__name;
  // @todo if the parent is an LNode, do somethind different
  delete pr[nm];
});


om.removeChildren =  function (nd) {
  om.forEachTreeProperty(nd,function (v) {
    v.remove();
  });
  if (om.LNode.isPrototypeOf(nd)) {
    nd.length = 0;
  }
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



// check that a tree with correct parent pointers and names descends from this node. For debugging.
om.nodeMethod("__checkTree",function () {
  var thisHere = this;
  om.forEachTreeProperty(this,function (v,k) {
    if ((v.__parent) !== thisHere) om.error(thisHere,v,"bad parent");
    if ((v.__name) !== k) om.error(thisHere,v,"bad name");
    v.__checkTree();
  });
});




om.DNode.namedType = function () { // shows up in the inspector
  this.__isType = 1;
  return this;
}

om.nodeMethod("__get",function (k) { // __get without inheritance from proto
  if (this.hasOwnProperty(k)) {
    return this[k];
  }
  return undefined;
});



// collect function definitions below this
om.nodeMethod("__funstring1",function (sf,whr) {
  om.forEachTreeProperty(this,function (v,k) {
    var kn = parseInt(k);
    var isnum = isFinite(kn);
    if (om.isNode(v)) {
      var nwhr = (isnum)?whr+"["+k+"]":whr+"."+k;
      v.__funstring1(sf,nwhr);
    } else {
      if (typeof v === "function") {
        var s = sf[0];
        var fnc = v.toString();//.replace(/(;|\{|\})/g,"$&\n");
        if (isnum) {
          s += whr+"["+k+"]="+fnc;
        } else {
          s += whr+"."+k+"=" + fnc;
        }
        s += ";\n";
        sf[0] = s;
      }
    }
  },true);//true: include leaves
});


om.nodeMethod("__funstring",function () {
  var rs = ["\n(function () {\nvar item = prototypeJungle.om.lastItemLoaded;\n"];
  this.__funstring1(rs,"item");
  var rss = rs[0];
  //var ps = "/"+p.join("/");
  //rss+='prototypeJungle.om.assertCodeLoaded("'+ps+'");\n';
  rss+="})()\n"
  return rss;
});


  // in strict mode, the next 4 functions return undefined if c does not appear in s, ow the whole string
  om.afterChar = function (s,c,strict) {
    var idx = s.indexOf(c);
    if (idx < 0) return strict?undefined:s;
    return s.substr(idx+1);
  }
  
  
  om.afterLastChar = function (s,c,strict) {
    var idx = s.lastIndexOf(c);
    if (idx < 0) return strict?undefined:s;
    return s.substr(idx+1);
  }
  
  
  om.beforeLastChar = function (s,c,strict) {
    var idx = s.lastIndexOf(c);
    if (idx < 0) return strict?undefined:s;
    return s.substr(0,idx);
  }
  
  
  om.beforeChar = function (s,c,strict) {
    var idx = s.indexOf(c);
    if (idx < 0) return strict?undefined:s;
    return s.substr(0,idx);
  }
  
  om.pathExceptLast = function (s,c) {
    return om.beforeLastChar(s,c?c:"/");
  }
  
  
  
  om.endsIn = function (s,p) {
    var ln = s.length;
    var pln = p.length;
    if (pln > ln) return false;
    var es = s.substr(ln-pln);
    return es === p;
  }
  
  om.beginsWith = function (s,p) {
    var ln = s.length;
    var pln = p.length;
    if (pln > ln) return false;
    var es = s.substr(0,pln);
    return es === p;
  }
  
    
  om.stripInitialSlash = function (s) {
    if (s==="") return s;
    if (s[0]==="/") return s.substr(1);
    return s;
  }
  
  om.pathLast = function (s) {
    return om.afterLastChar(s,"/");
  }
  
  om.pathReplaceLast = function (s,rep,sep) {
    var sp = sep?sep:"/";
    var idx = s.lastIndexOf(sp);
    var dr = s.substring(0,idx+1);
    return dr + rep;
  }
    
   
  om.setIfNumeric = function (nd,prp,v) {
    var n = parseFloat(v);
    if (!isNaN(n)) {
      this[prp] = v;
    }
  }
  
  // an atomic property which does not inherit currently, but could,
  // in that there is a property down the chain with the same typeof
  om.inheritableAtomicProperty = function (nd,k) {
    if (k === "backgroundColor") {
      return 0;
    }
    if (!nd.hasOwnProperty(k)) return 0;
    var vk = nd[k];
    var p = Object.getPrototypeOf(nd);
    var pvk = p[k];
    return (typeof vk === typeof pvk);
  }
    
  
  om.UnpackedUrl = {};
  
  om.UnpackedUrl.mk = function (scheme,domain,repo,path) {
    var rs = Object.create(om.UnpackedUrl);
    rs.scheme = scheme;
    rs.domain = domain;
    rs.repo = repo;
    rs.path = path;
    return rs;
  }
  
// if variant, then the path does not include the last id, only the urls do
// path

  om.unpackUrl = function (url) {
    if (!url) return undefined;
    if (om.beginsWith(url,"http:")) {
      var r = /http\:\/\/([^\/]*)\/([^\/]*)\/([^\/]*)\/(.*)$/
      var idx = 1;
    } else {
       r = /\/([^\/]*)\/([^\/]*)\/(.*)$/
       idx = 0;
    }
    var m = url.match(r);
    if (!m) return undefined;
    if (idx) {
      var domain = m[1];
    } else {
      var domain = "prototypejungle.org";
    }
    var repo = "http://"+domain+"/"+m[idx+1]+"/"+m[idx+2];
    var path = m[idx+3];
    return om.UnpackedUrl.mk("http",domain,repo,path);
  }
  

//end extract
})(prototypeJungle);