
(function (pj) {
'use strict'
var om = pj.om;
// This is one of the code files assembled into pjcs.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract


/*<Section> Tree operations ==================================
 * om ('object model') is a built-in module.
 */

om.__builtIn = 1;



// constructors for nodes

om.DNode.mk = function () {
  return Object.create(om.DNode);
}



om.LNode.mk = function(array) {
  var rs = Object.create(om.LNode),
    child,ln;
  if (array==undefined) return rs;
  ln = array.length;
  for (var i=0;i<ln;i++) {
    child = array[i];
    if (child && (typeof(child) === 'object')){
      child.__parent = rs;
      child.__name = ''+i;
    }
    rs.push(child);
  }
  return rs;
}


//  make the same method fn work for DNodes,Lnodes
om.nodeMethod = function (name,func) {
  om.LNode[name] = om.DNode[name] = func;
}

// only strings that pass this test may  be used as names of nodes
om.checkName = function (string) {
  if (string === undefined) {
    om.error('Bad argument');
  }
  if (string==='') return false;
  if (string==='$') return true;
  if (typeof string==='number') {
    return string%1 === 0;
  }
  return !!string.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
}


om.checkPath = function (string) {
  var strSplit = string.split('/'),
    ln = strSplit.length,
    i = 0;
  if (ln===0) return false;
  for (;i<ln;i++) {
    var pathElement = strSplit[i];
    if (((i>0) || (pathElement !== '')) // '' is allowed as the first element here, corresponding to a path starting with '/'
      &&  !om.checkName(pathElement)) {
      return false;
    }
  }
  return true;
}

/* A path is a sequence of names indicating a traversal down a tree. It may be
 * represented as a '/' separated string, or as an array.
 * When string path starts with '/' (or an array with  empty string as 0th element)
 * this means start at pj, regardless of origin (ie the path is absolute rather than relative).
 */

om.evalPath = function (origin,ipth) {
  var ln,pth,current,startIdx,idx,prop;
  if (!ipth) return; // it is convenient to allow this option
  if (typeof ipth === 'string') {
    pth = ipth.split('/');
  } else {
    pth = ipth;
  }
  ln = pth.length;
  if (ln===0) return origin;
  if (pth[0]==='') {
    current = pj;
    startIdx = 1;
  } else {
    current = origin;
    startIdx = 0;
  }
  for (idx=startIdx;idx<ln;idx++) {
    var prop = pth[idx];
    if (current && (typeof(current) === 'object')) {
      current = current[prop];
    } else {
      return undefined;
    }
  }
  return current;
}

/*
 * Return the path from root, or if root is undefined the path up to where __parent is undefined. In the special case where
 * root === pj, the path begins with '' (so that its string form will start with '/')
 */

om.pathOf = function (node,root) {
  var rs = [],
    current = node,
    name;
  while (true) {
    if (current === undefined) {
      return root?undefined:rs;
    }
    if (current=== root)  {
      if (root === pj) {
        rs.unshift('');
      }
      return rs;
    }
    var name = om.getval(current,'__name');
    // if we have reached an unnamed node, it should not have a parent either
    if (name!==undefined) {
      rs.unshift(name);
    }
    current = om.getval(current,'__parent');
  }
  return undefined;
}

om.nodeMethod('__pathOf',function (root) {return om.pathOf(this,root);});


om.isObject = function (o) {
  return o && (typeof(o) === 'object');
}


om.isAtomic = function (x) {
  return !om.isObject(x);
}
  

om.isNode = function(x) { 
  return om.DNode.isPrototypeOf(x) || om.LNode.isPrototypeOf(x);
}


// creates DNodes if missing so that path pth descending from this exists

om.createPath = function (node,path) {
  var current = node,
    child,next;
  path.forEach(function (prop) {
    // ignore '' ; this means that createPath can be used on pj
    if (prop === '') return;
    if (!om.checkName(prop)){
      om.error('Ill-formed name "'+prop+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
    }
    if (!current.__get) {
      om.error('Unexpected');
    }
    child = current.__get(prop);
    
    if (child === undefined) {
      next = om.DNode.mk();
      current.set(prop,next);
      current = next;
    } else {
      if (!om.isNode(child)) om.error('Conflict in createPath ',path.join('/'));
      current = child;
    }
  });
  return current;
}
  

// gets own properties only
om.getval = function (node,prop) {
  if (!node) {
    om.error('null v');
  }
  if (node.hasOwnProperty(prop)) {
    return node[prop];
  }
}

var separateFromParent = function (node) {
  var parent = om.getval(node,'__parent');
  if (parent) {
    parent[node.__name] = undefined;
  }
}

// assumes node[name] is  child, or will be child. checks child's suitability
var adopt = function (node,name,child) {
  if (om.isNode(child)) {
    separateFromParent(child);
    child.__name = name;
    child.__parent = node;
  } else if (child && (typeof(child)==='object')) {
    om.error('Only Nodes and atomic __values can be set as __children in <Node>.set("'+name+'",<val>)');
  } 
}

om.preSetChildHooks = [];
om.setChildHooks = [];

/* if x.__k_watched then some field k of x is watched. If any field of x is watched x.__watched is set.
 * For watched fields, a change event is emitted of the form {name:change node:node property:name}
 */

function setChild(node,name,child) {
  om.preSetChildHooks.forEach(function (fn) {fn(node,name);});
  adopt(node,name,child);
  node[name] = child;
  om.setChildHooks.forEach(function (fn) {fn(node,name,child);});
  if (node.__watched && node['__'+name+'_watched']) {
    var event = om.Event.mk('change',node);
    event.property=name;
    event.emit();
  }
}

om.watch = function (node,prop) {
  node.__watched = 1;
  node['__'+prop+'_watched']=1;
}

/* set has several variants:
 *
 * x.set(name,v)  where name is a simple name (no /'s). This causes v to be the new child of x if v is a node, other wise just does x[name] = v
 *
 * x.set(path,v) where path looks like a/b/../name. This creates the path a/b/... if needed and sets the child name to v. Whatever part of the path
 * is already there is left alone.
 *
 * x.set(source)  extends x by source, in the sense of jQuery.extend in deep mode
 */

 
// returns val
om.DNode.set = function (key,val) {
  var idx,path,name,parent;
  if (arguments.length === 1) {
    om.extend(this,key);
    return this;
  }
  if (typeof(key)==='string') {
    idx = key.indexOf('/');
  } else { 
    idx = -1;
  }
  if (idx >= 0) {
    path = key.split('/');
    name = path.pop();
    parent = om.createPath(this,path);
  } else {
    parent = this;
    name = key;
  }
  if (!om.checkName(name)){
    om.error('Ill-formed name "'+name+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
  }
  setChild(parent,name,val);
  return val;
}


om.LNode.set = function (key,val) {
  setChild(this,key,val);
  return val;
}

// adopts val below this if it is not already in a tree,ow just refers
om.setIfExternal = function (parent,name,val) { 
  var tp = typeof val;
  if ((tp === 'object') && val && val.__get('__parent')) {
    parent[name] = val;
  } else {
    parent.set(name,val);
  }
  return val;
}
  
// this is similar to jquery.extend in deep mode: it merges source into dest. Note that it does not include properties from the prototypes.
om.extend = function (dest,source) {
  if (!source) return dest;
  for (var prop in source) {
    if (source.hasOwnProperty(prop)) {
      var newVal = om.lift(source[prop]);
      if (newVal === undefined) continue;
      var existingVal = dest[prop];
      // merge if existingVal is a DNode; replace otherwise
      if (existingVal && om.DNode.isPrototypeOf(existingVal) && om.DNode.isPrototypeOf(newVal)) {
        om.DNode.extend(existingVal,newVal);
      }
      dest.set(prop,newVal);
    }
  }
  return dest;
}


om.arrayToDict = function (aarray) {
  var rs = {};
  array.forEach(function (prop) {rs[prop] = 1;});
  return rs;
}


// transfer properties from source. If props is missing, extend dest by source
om.DNode.setProperties = function (dest,source,props,dontLift) {
  if (!source) return;
  if (!dest) {
    debugger;
  }
  // include the case !hasSet so this will work for an ordinary object
  var hasSet = dest.set; 
  if (props) {
    props.forEach(function (prop) {
        var sourceVal = source[prop];
        if (sourceVal !== undefined) {
          if (hasSet) {
            dest.set(prop,om.lift(sourceVal));
          } else {
            dest[prop] = sourceVal;
          }
        }
    });
  } else {
    om.extend(dest,source);
  }
  return dest;
}

// Some LNode methods



om.LNode.toArray = function () {
  var rs = [];
  this.forEach(function (e) {rs.push(e);});
  return rs;
}
var arrayPush = Array.prototype.push;
om.pushHooks = [];

om.LNode.push = function (element) {
  var ln = this.length,
    thisHere = this;
  if (om.isNode(element)) {
    separateFromParent(element);
    element.__name = ln;
    element.__parent = this;
  } else if (element && (typeof element==='object')) {
    om.error('Attempt to push non-node object onto an LNode');
  }
  arrayPush.call(this,element);
  om.pushHooks.forEach(function (fn,element) {fn(thisHere,element);});
  return ln;
}


var arrayUnshift = Array.prototype.unshift;
om.LNode.unshift = function (element) {
  var ln = this.length;
  if (om.isNode(element)) {
    separateFromParent(element);
    element.__name = ln;
    element.__parent = this;
  } else if (element && (typeof element==='object')) {
    om.error('Attempt to shift non-node object onto an LNode');
  }
  arrayUnshift.call(this,element);
  return ln;
}



/* utilities for constructing Nodes from ordinary objects and arrays
 * recurses down to objects that are already nodes
 * o is an array or an object
 */

var toNode1 = function (parent,name,o) {
  var tp = typeof o,
    rs;
  if ((o === null) || (tp != 'object')) {
    parent[name] =  o;
    return;
  }
  if (om.isNode(o)) {
    rs = o;
  } else {
    if (Array.isArray(o)) {
      rs = om.toLNode(o,null);
    } else {
      var rs = om.toDNode(o,null);
    }
    
  }
  rs.__parent = parent;
  rs.__name = name;
  parent[name] = rs;
}

// transfer the contents of ordinary object o into idst (or make a new destination if idst is undefined)
om.toDNode = function (o,idest) {
  var dest,oVal;
  if (om.DNode.isPrototypeOf(o)) return o; // already a DNode
  if (idest) {
    dest = idest;
  } else {
    dest = om.DNode.mk();
  }
  for (var prop in o) {
    if (o.hasOwnProperty(prop)) {
      oVal = o[prop];
      toNode1(dest,prop,oVal);
    }
  }
  return dest;
}

om.toLNode = function (array,idest) {
  if (idest) {
    var dest = idest;
  } else {
    dest = om.LNode.mk();
  }
  array.forEach(function (element) {   
    dest.push(om.toNode(element));
  });
  return dest;
}

om.toNode = function (o) {
  if (om.isNode(o)) {
    // idempotent
    return o;
  }
  if (Array.isArray(o)) {
    return om.toLNode(o);
  } else if (o && (typeof o === 'object')) {
    return om.toDNode(o);
  } else {
    return o;
  }
}

om.lift = om.toNode;




// Some utilities for iterating functions over trees.

// internal __properties are excluded from the iterators and recursors 

om.internalProps = {'__parent':1,'__protoChild':1,'__value__':1,'__hitColor':1,'__chain':1,'__copy':1,__name:1,widgetDiv:1,
  __protoLine:1,__inCopyTree:1,__headOfChain:1,__element:1,__domAttributes:1};
om.internal = function (name) {
   return om.internalProps[name];
}


// a proper element of the tree: an own property with the right __parent link. If includeLeaves, then atomic own properties are included too

om.treeProperty = function (node,prop,includeLeaves,knownOwn) {
  if ((!knownOwn && !node.hasOwnProperty(prop)) ||  om.internal(prop)) return false;
  var child = node[prop];
  if (om.isNode(child)) {
    return child.__parent === node;
  } else {
    return includeLeaves?(typeof child !== 'object'):false;
  }
}


om.treeProperties = function (node,includeLeaves) {
  var rs = [],
    child,names,ln,i;
  if (om.LNode.isPrototypeOf(node)) {
    ln = node.length;
    for (i = 0;i < ln;i++) {
      child = node[i];
      if (includeLeaves) {
        rs.push(i);
      } else if (om.isNode(child) && (child.__parent === node)) {
        rs.push(i);
      }
    }
    return rs;
  }
  names = Object.getOwnPropertyNames(node),
  names.forEach(function (name) {
    if (om.treeProperty(node,name,includeLeaves,true)) rs.push(name);
  });
  return rs;
}
  
// apply fn(node[prop],prop,node) to each non-internal own property p. 
om.mapOwnProperties = function (node,fn) {
  var ownprops = Object.getOwnPropertyNames(node);
  ownprops.forEach(function (prop) {
     if (!om.internal(prop))  { 
      fn(node[prop],prop,node);
    }
  });
  return node;
}

// apply fn(node[p],p,node) to each treeProperty p  of node. Used extensively for applying functions through a tree
om.forEachTreeProperty = function (node,fn,includeLeaves) { 
  var ownprops = Object.getOwnPropertyNames(node);
  ownprops.forEach(function (prop) {
     if (om.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
      fn(node[prop],prop,node);
    }
  });
  return this;
}

 // if node itself has gthe propety, return true
om.ancestorHasOwnProperty  = function (node,p) {
  var cv = node;
  while (cv) {
    if (cv.__get(p)) return true;
    cv = cv.__get('__parent');
  }
  return false;
}

om.DNode.__inCore = function () {
  return om.ancestorHasOwnProperty(this,'__builtIn');
}

/* used eg for iterating through styles.
 * apply fn(node[p],p,node) to each atomic property of node, including properties defined in prototypes, but excluding
 * those defined in core modules.
 * sofar has the properties where fn has been called so far (absent except in the recursive call)
 */

om.mapNonCoreLeaves = function (node,fn,allowFunctions,isoFar) {
  var soFar = isoFar?isoFar:{};
  if (!node) {
    om.error('Bad argument');
  }
  if (!node.__inCore || node.__inCore()) return;
  var op = Object.getOwnPropertyNames(node);
  op.forEach(function (prop) {
    var child,childType;
    if (soFar[prop]) return;
    if (!om.treeProperty(node,prop,true,true)) return true;
    soFar[prop] = 1;
    child = node[prop];
    childType = typeof child;
    if (child && (childType === 'object' )||((childType==='function')&&!allowFunctions)) return;
    fn(child,prop,node);
  });
  var proto = Object.getPrototypeOf(node);
  if (proto) {
    om.mapNonCoreLeaves(proto,fn,allowFunctions,soFar);
  }
}


om.deepApplyFun = function (node,fn) {
  fn(node);
  om.forEachTreeProperty(node,function (c) {
    om.deepApplyFun(c,fn);
  });
}
  


om.deepDeleteProps = function (node,props) {
  om.deepApplyFun(node,function (ch) {
    props.forEach(function (p) {
      delete ch[p];
    });
  });
}



om.deepDeleteProp = function (inode,prop) {
  om.deepApplyFun(inode,function (node) {
    delete node[prop]
  });
}


om.findAncestor = function (node,fn) {
  if (node===undefined) return undefined;
  if (fn(node)) return node;
  var parent = node.__get('__parent');
  return om.findAncestor(parent,fn);
}
  

om.ancestorWithProperty = function (node,prop) {
  return om.findAncestor(node,function (x) {
      return x[prop] !== undefined;
  });
}

om.ancestorWithMethod = function (node,prop) {
  return om.findAncestor(node,function (x) {
    return typeof x[prop] === 'function';
  });
}

om.removeHooks = [];

om.nodeMethod('remove',function () {
  var thisHere = this,
    parent = this.__parent,
    name = this.__name;
  om.removeHooks.forEach(function (fn) {
      fn(thisHere);
  });
  // @todo if the parent is an LNode, do somethind different
  delete parent[name];
});


om.removeChildren =  function (node) {
  om.forEachTreeProperty(node,function (child) {
    child.remove();
  });
  if (om.LNode.isPrototypeOf(node)) {
    node.length = 0;
  }
}




// check that a tree with correct parent pointers and names descends from this node. For debugging.
om.nodeMethod('__checkTree',function () {
  var thisHere = this;
  om.forEachTreeProperty(this,function (child,prop) {
    if ((child.__parent) !== thisHere) om.error(thisHere,child,'bad parent');
    if ((child.__name) !== prop) om.error(thisHere,child,'bad name');
    v.__checkTree();
  });
});




om.DNode.namedType = function () { // shows up in the inspector
  this.__isType = 1;
  return this;
}

// without inheritance from prototype;  x.__get(prop) will return a value only if prop is a direct property of this
om.nodeMethod('__get',function (prop) { 
  if (this.hasOwnProperty(prop)) {
    return this[prop];
  }
  return undefined;
});



/* collect function definitions below this for funstring. where is an expression for where the function appears below
 * the top-level argument to funstring. eg, where = 'a.b' if it appears at path a/b
 * rsContainer is an array containing one string, which is the code being built up.
 * The result string is wrapped in an array so that it can be built up by side effect
 */

om.nodeMethod('__funstring1',function (rsContainer,where) {
  om.forEachTreeProperty(this,function (child,prop) {
    var propAsNum = parseInt(prop),
      isnum = isFinite(propAsNum),
      childNode,rs,fundef;
    if (om.isNode(child)) {
      var childWhere = (isnum)?where+'['+prop+']':where+'.'+prop;
      child.__funstring1(rsContainer,childWhere);
    } else {
      if (typeof child === 'function') {
        // in this case, we have reached the function itself in recursion. time to add the actual function definition
        //unwrap
        var rs = rsContainer[0];
        var fundef= child.toString();
        if (isnum) {
          rs += where+'['+prop+']='+fundef;
        } else {
          rs += where+'.'+prop+'=' + fundef;
        }
        rs += ';\n';
        //rewrap
        rsContainer[0] = rs;
      }
    }
  },1);//1: include leaves
});


om.nodeMethod('__funstring',function () {
  var rsContainer = ['\n(function () {\nvar item = prototypeJungle.om.lastItemLoaded;\n'],
    rs;
  this.__funstring1(rsContainer,'item');
  rs = rsContainer[0];
  rs+='})()\n'
  return rs;
});


// in strict mode, the next 4 functions return undefined if c does not appear in s, ow the whole string
om.afterChar = function (string,chr,strict) {
  var idx = string.indexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(idx+1);
}


om.afterLastChar = function (string,chr,strict) {
  var idx = string.lastIndexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(idx+1);
}


om.beforeLastChar = function (string,chr,strict) {
  var idx = string.lastIndexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(0,idx);
}


om.beforeChar = function (string,chr,strict) {
  var idx = string.indexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(0,idx);
}

om.pathExceptLast = function (string,chr) {
  return om.beforeLastChar(string,chr?chr:'/');
}



om.endsIn = function (string,p) {
  var ln = string.length,
    pln = p.length,es;
  if (pln > ln) return false;
  es = string.substr(ln-pln);
  return es === p;
}

om.beginsWith = function (string,p) {
  var ln = string.length,
    pln = p.length,es;
  if (pln > ln) return false;
  es = string.substr(0,pln);
  return es === p;
}

  
om.stripInitialSlash = function (string) {
  if (string==='') return string;
  if (string[0]==='/') return string.substr(1);
  return string;
}

om.pathLast = function (string) {
  return om.afterLastChar(string,'/');
}

om.pathReplaceLast = function (string,rep,sep) {
  var sp = sep?sep:'/',
    idx = string.lastIndexOf(sp),
    dr = string.substring(0,idx+1);
  return dr + rep;
}
  
 
om.setIfNumeric = function (node,prp,v) {
  var n = parseFloat(v);
  if (!isNaN(n)) {
    this[prp] = v;
  }
}

/* an atomic property which does not inherit currently, but could,
 * in that there is a property down the chain with the same typeof
 */

om.inheritableAtomicProperty = function (node,prop) {
  var propVal;
  if (prop === 'backgroundColor') {
    return 0;
  }
  if (!node.hasOwnProperty(prop)) return 0;
  var proto = Object.getPrototypeOf(node);
  return (typeof node[prop] === typeof proto[prop]);
}
  
/* inheritors(root,proto,filter) computes all of the descendands of root
 * which inherit from proto and for which the filter (if any) is true.
 */

om.inheritors = function (root,proto,filter) {
  var rs = [];
  var recurser = function (node,proto,filter) {
    if (proto.isPrototypeOf(node)) {
      if (filter) {
        if (filter(nd)) rs.push(node);
      } else {
        rs.push(node);
      }
      om.forEachTreeProperty(node,function (child) {
        recurser(child,proto,filter);
      });
    }
  }
  recurser(root,proto,filter);
  return rs;
}

 
  
//end extract
})(prototypeJungle);