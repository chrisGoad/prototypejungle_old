window.prototypeJungle =  (function () {
"use strict";
/* The central structure is a tree, made of 2 kinds of internal nodes (pj.Object,pj.Array), 
 * and leaves which are of primitive type (numbers,boolean,null,strings), or are functions.
 * Internal nodes have __name and __parent  attributes.
 */

// Non-null non-array object. 
var ObjectNode = {}; 

// Sequential, zero-based array
var ArrayNode = [];

// pj is the root of the PrototypeJungle realm.

var pj = Object.create(ObjectNode);

pj.previousPj = window.pj; // for noConflict
pj.noConflict = function noConflict() {
  var ppj = prototypeJungle.previousPj;
  if (ppj  === undefined) {
    delete window.pj;
  } else {
    window.pj = ppj;
  }
}

window.pj = pj;
pj.Object = ObjectNode;
pj.Array = ArrayNode;


// do the work normally performed by 'set'  by hand for these initial objects


ObjectNode.__parent = pj;
ObjectNode.__name = 'Object';
ArrayNode.__parent = pj;
ArrayNode.__name = 'Array';
// tree operations


pj.__builtIn = 1;


// constructors for nodes 

pj.Object.mk = function (src) {
  let rs = Object.create(pj.Object);
  if (src) {
    pj.extend(rs,src);
  }
  return rs;
}

pj.Array.mk = function (array) {
  let rs = Object.create(pj.Array);
  if (array==undefined) return rs;
  let ln = array.length;
  for (let i=0;i<ln;i++) {
    let child = array[i];
    if (child && (typeof(child) === 'object')){
      child.__parent = rs;
      child.__name = ''+i;
    }
    rs.push(child);
  }
  return rs;
}


//  make the same method fn work for Objects, Arrays
pj.nodeMethod = function (name,func) {
  pj.Array[name] = pj.Object[name] = func;
}

// only strings that pass this test may  be used as names of nodes
// numbers can be used as labels
pj.checkName = function (string) {
  if ((string === undefined) || (!string.match)) { 
    pj.error('Bad argument');
  }
  if (string==='') return false;
  if (string==='$') return true;
  return !!string.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
}


/* A path is a sequence of names indicating a traversal down a tree. It may be
 * represented as a '/' separated string, or as an array.
 * When string path starts with '/' (or an array with  empty string as 0th element)
 * this means start at pj, regardless of origin (ie the path is absolute rather than relative).
 */

pj.checkPath = function (string,allowFinalSlash) {
  let strSplit = string.split('/');
  let ln = strSplit.length;
  let  i = 0;
  if (ln===0) return false;
  if (allowFinalSlash && (strSplit[ln-1] === '')) {
    ln = ln - 1;
  }
  for (;i<ln;i++) {
    let pathElement = strSplit[i];
    if (((i>0) || (pathElement !== '')) // '' is allowed as the first  element here, corresponding to a path starting with '/'
      &&  !pj.checkName(pathElement)) {
      return false;
    }
  }
  return true;
}


pj.evalPath = function (origin,ipth) {
  let pth,current,startIdx;
  if (!ipth) return origin; // it is convenient to allow this option
  if (typeof ipth === 'string') {
    pth = ipth.split('/');
  } else {
    pth = ipth;
  }
  let ln = pth.length;
  if (ln===0) return origin;
  if (pth[0]==='') {
    current = pj;
    startIdx = 1;
  } else {
    current = origin;
    startIdx = 0;
  }
  for (let idx=startIdx;idx<ln;idx++) {
    let prop = pth[idx];
    if (current && (typeof(current) === 'object')) {
      current = current[prop];
    } else {
      return undefined;
    }
  }
  return current;
}

/*
 * Return the path from root, or if root is undefined the path up to where parent is undefined. In the special case where
 * root === pj, the path begins with '' (so that its string form will start with '/')
 */

pj.pathOf = function (node,root) {
  let rs = [];
  let current = node;
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
    let name = pj.getval(current,'__name');
    // if we have reached an unnamed node, it should not have a parent either
    if (name!==undefined) {
      rs.unshift(name);
    }
    current = pj.getval(current,'__parent');
  }
  return undefined;
}

pj.stringPathOf = function (node,root) {
  let path = pj.pathOf(node,root);
  return path!==undefined?path.join('/'):undefined;
}



pj.nodeMethod('__pathOf',function (root) {return pj.pathOf(this,root);});


pj.isObject = function (o) {
  return o && (typeof(o) === 'object');
}


pj.isAtomic = function (x) {
  return !pj.isObject(x);
}
  

pj.isNode = function (x) { 
  return pj.Object.isPrototypeOf(x) || pj.Array.isPrototypeOf(x);
}


// creates Objects if missing so that path pth descending from this exists

pj.createPath = function (node,path) {
  let current = node;
  let child,next;
  path.forEach(function (prop) {
    // ignore '' ; this means that createPath can be used on pj
    if (prop === '') return;
    if (!pj.checkName(prop)){
      pj.error('Ill-formed __name "'+prop+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
    }
    if (!current.__get) {
      pj.error('Unexpected');
    }
    child = current.__get(prop);
    
    if (child === undefined) {
      next = pj.Object.mk();
      current.set(prop,next);
      current = next;
    } else {
      if (!pj.isNode(child)) pj.error('Conflict in createPath ',path.join('/'));
      current = child;
    }
  });
  return current;
}
  

// gets own properties only
pj.getval = function (node,prop) {
  if (!node) {
    pj.error('null v');
  }
  if (node.hasOwnProperty(prop)) {
    return node[prop];
  }
}


const separateFromParent = function (node) {
  let parent = pj.getval(node,'__parent');
  if (parent) {
    let name = node.__name;
    if (Array.isArray(parent)) {
      parent[name] = undefined;
    } else {
      delete parent[name];
    }
  }
}

// assumes node[__name] is  child, or will be child. checks child's suitability 
const adopt = function (node,name,child) {
  if (pj.isNode(child)) {
    separateFromParent(child);
    child.__name = name;
    child.__parent = node;
  } else if (child && (typeof(child)==='object')) {
    pj.error('Only Nodes and atomic __values can be set as __children in <Node>.set("'+name+'",<val>)');
  } 
}

pj.preSetChildHooks = [];
pj.setChildHooks = [];

/* A property k of a node is watched if the field annotation "Watched" is set for that property. 
 * For watched fields, a change event is emitted of the form {id:change node:node property:__name}
 */

const setChild = function (node,name,child) {
  pj.preSetChildHooks.forEach(function (fn) {fn(node,name);});
  adopt(node,name,child);
  node[name] = child;
  pj.setChildHooks.forEach(function (fn) {
    fn(node,name,child);
  });
  let watched = node.__Watched;
  if (watched && watched[name]) {
  //if (node.__watched && node['__'+name+'_watched']) {
    let event = pj.Event.mk('change',node);
    event.property=name;
    event.emit();
  }
}
/*
 * Fields (aka properties) can be annotated. More description needed here.
 */

pj.Object.__getOwnFieldAnnotation = function (annotationName,prop) {
  let annotations = this.__get(annotationName);
  if (annotations === undefined) {
    return undefined;
  }
  return annotations[prop];
}



pj.Object.__getFieldAnnotation = function (annotationName,prop) {
  let cp = this;
  while (true) {
    if (cp === pj.Object) return undefined;
    let rs = cp.__getOwnFieldAnnotation(annotationName,prop);
    if (rs !== undefined) {
      return rs;
    }
    cp = Object.getPrototypeOf(cp);
  }
}
  

pj.Object.__setFieldAnnotation = function (annotationName,prop,v) {
  let annotations = this.__get(annotationName);
  if (annotations === undefined) {
    annotations = this.set(annotationName,pj.Object.mk());
  }
  if (Array.isArray(prop)) {
    prop.forEach(function (ik) {
      annotations[ik] = v;
    });
  } else {
    annotations[prop] = v;
    return v;
  }
}
 
pj.defineFieldAnnotation = function (functionName) {
  let annotationName = '__'+functionName;
  pj.Object['__getOwn'+functionName] = function (k) {
    return this.__getOwnFieldAnnotation(annotationName,k);
  };
  pj.Object['__get'+functionName] = function (k) {
    return this.__getFieldAnnotation(annotationName,k);
  };
  pj.Object['__set'+functionName] = function (k,v) {
    return this.__setFieldAnnotation(annotationName,k,v);
  };
  pj.Array['__get'+functionName] = function (k){}
}
  
pj.defineFieldAnnotation('Watched');

pj.watch = function (node,prop) {
  node.__setWatched(prop,1);
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
pj.Object.set = function (key,val) {
  let idx,path,name,parent;
  if (arguments.length === 1) {
    pj.extend(this,key);
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
    parent = pj.createPath(this,path);
  } else {
    parent = this;
    name = key;
  }
  if (!pj.checkName(name)){
    pj.error('Ill-formed name "'+name+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
  }
  setChild(parent,name,val);
  return val;
}


pj.Array.set = function (key,val) {
  setChild(this,key,val);
  return val;
}

// adopts val below this if it is not already in a tree,ow just refers
pj.setIfExternal = function (parent,name,val) { 
  let tp = typeof val;
  if ((tp === 'object') && val && val.__get('__parent')) {
    parent[name] = val;
  } else {
    parent.set(name,val);
  }
  return val;
}

pj.setIfMissing = function (parent,prop,factory) {
  let rs = parent[prop];
  if (!rs) {
    rs = factory();
    parent.set(prop,rs);
  }
  return rs;
}

// this is similar to jquery.extend in deep mode: it merges source into dest. Note that it does not include properties from the prototypes.
pj.extend = function (dest,source) {
  let existingVal,newVal;
  if (!source) return dest;
  for (let prop in source) {
    if (source.hasOwnProperty(prop)) {
      newVal = pj.lift(source[prop]);
      if (newVal === undefined) continue;
       existingVal = dest[prop];
      // merge if existingVal is a Object; replace otherwise
      if (existingVal && pj.Object.isPrototypeOf(existingVal) && pj.Object.isPrototypeOf(newVal)) {
        pj.extend(existingVal,newVal);
      }
      dest.set(prop,newVal);
    }
  }
  return dest;
}


pj.arrayToObject = function (aarray) {
  let rs = {};
  aarray.forEach(function (prop) {rs[prop] = 1;});
  return rs;
}

/*
let dd = {f:function (n){return n*3}};
let aa = {a:2,b:['a','b'],p:pj.geom.Point.mk(3,4),f:function (n) {return n+n;}}
pj.setProperties(dd,aa,['a','b','p','f']);
*/
// transfer properties from source. 
pj.setProperties = function (dest,source,props,fromOwn,dontCopy) {
  if (!source) return;
  if (!dest) {
    pj.error('Bad arguments')
  }
  let destIsPJObject =  pj.Object.isPrototypeOf(dest);
  if (props) {
    props.forEach(function (prop) {
      let sourceVal = fromOwn?pj.getval(source,prop):source[prop];
      if (sourceVal !== undefined) {
        let sourceCopy = dontCopy?sourceVal:pj.deepCopy(sourceVal);
        if (destIsPJObject) {
          dest.set(prop,sourceCopy);
        } else {
          dest[prop] = sourceCopy;  
        }
      }
    });
  } 
  return dest;
}

pj.setPropertiesFromOwn = function (dest,source,props,dontCopy) {
  return pj.setProperties(dest,source,props,true,dontCopy);
}

// only for atomic values
pj.getProperties = function getProperties(source,props) {
  let rs = pj.Object.mk();
  props.forEach(function (prop) {
    let sourceVal = source[prop];
    let type = typeof sourceVal;
    if ((sourceVal === null) || ((type !== 'undefined') && (type !== 'object'))) {
      rs[prop] = sourceVal;
    }
  });
  return rs;
}

// Some Array methods



pj.Array.toArray = function () {
  let rs = [];
  this.forEach(function (e) {rs.push(e);});
  return rs;
}
const arrayPush = Array.prototype.push;
pj.pushHooks = [];

pj.Array.push = function (element) {
  let ln = this.length;
  if (pj.isNode(element)) {
    if (element.__parent) { 
      element.__name = ln;
      element.__parent = this;
    }
  } else if (element && (typeof element==='object')) {
    pj.error('Attempt to push non-node object onto an Array');
  }
  arrayPush.call(this,element);
  pj.pushHooks.forEach((fn) => {fn(this,element);});
  return ln;
}




const arrayUnshift = Array.prototype.unshift;
pj.Array.unshift = function (element) {
  let ln = this.length;
  if (pj.isNode(element)) {
    separateFromParent(element);
    element.__name = ln;
    element.__parent = this;
  } else if (element && (typeof element==='object')) {
    pj.error('Attempt to shift non-node object onto an Array');
  }
  arrayUnshift.call(this,element);
  return ln;
}



/* utilities for constructing Nodes from ordinary objects and arrays
 * recurses down to objects that are already nodes
 * o is an array or an object
 */

const toNode1 = function (parent,name,o) {
  let tp = typeof o;
  let  rs;
  if ((o === null) || (tp != 'object')) {
    parent[name] =  o;
    return;
  }
  if (pj.isNode(o)) {
    rs = o;
  } else {
    if (Array.isArray(o)) {
      rs = pj.toArray(o,null);
    } else {
      let rs = pj.toObject(o,null);
    }
    
  }
  rs.__parent = parent;
  rs.__name = name;
  parent[name] = rs;
}

// transfer the contents of ordinary object o into idst (or make a new destination if idst is undefined)
pj.toObject= function (o,idest) {
  let dest,oVal;
  if (pj.Object.isPrototypeOf(o)) return o; // already a Object
  if (idest) {
    dest = idest;
  } else {
    dest = pj.Object.mk();
  }
  for (let prop in o) {
    if (o.hasOwnProperty(prop)) {
      oVal = o[prop];
      toNode1(dest,prop,oVal); 
    }
  }
  return dest;
}

pj.toArray = function (array,idest) {
  let dest;
  if (idest) {
    dest = idest;
  } else {
    dest = pj.Array.mk();
  }
  array.forEach(function (element) {   
    dest.push(pj.toNode(element));
  });
  return dest;
}

pj.toNode = function (o) {
  if (pj.isNode(o)) {
    // idempotent
    return o;
  }
  if (Array.isArray(o)) {
    return pj.toArray(o);
  } else if (o && (typeof o === 'object')) {
    return pj.toObject(o);
  } else {
    return o;
  }
}

pj.lift = pj.toNode;




// Some utilities for iterating functions over trees.

// internal __properties are excluded from the iterators and recursors 

pj.internalProps = {'__parent':1,'__protoChild':1,'__value__':1,'__hitColor':1,'__chain':1,'__copy':1,__name:1,widgetDiv:1,
  __protoLine:1,__inCopyTree:1,__headOfChain:1,__element:1,__domAttributes:1};
pj.internal = function (__name) {
   return pj.internalProps[__name];
}


// a proper element of the tree: an own property with the right parent link. If includeLeaves, then atomic own properties are included too

pj.treeProperty = function (node,prop,includeLeaves,knownOwn) {
  let child;
  if ((!knownOwn && !node.hasOwnProperty(prop)) ||  pj.internal(prop)) return false;
  child = node[prop];
  if (pj.isNode(child)) {
    return child.__parent === node;
  } else {
    return includeLeaves?(typeof child !== 'object'):false;
  }
}


pj.treeProperties = function (node,includeLeaves) {
  let rs = [];
  let child,names,ln,i;
  if (pj.Array.isPrototypeOf(node)) {
    ln = node.length;
    for (i = 0;i < ln;i++) {
      child = node[i];
      if (includeLeaves) {
        rs.push(i);
      } else if (pj.isNode(child) && (child.__parent === node)) {
        rs.push(i);
      }
    }
    return rs;
  }
  names = Object.getOwnPropertyNames(node),
  names.forEach(function (name) {
    if (pj.treeProperty(node,name,includeLeaves,true)) rs.push(name);
  });
  return rs;
}
  
// apply fn(node[prop],prop,node) to each non-internal own property p. 
pj.mapOwnProperties = function (node,fn) {
  let ownprops = Object.getOwnPropertyNames(node);
  ownprops.forEach(function (prop) {
     if (!pj.internal(prop))  { 
      fn(node[prop],prop,node);
    }
  });
  return node;
}

pj.ownProperties = function (node) {
  let rs = [];
  pj.mapOwnPropeties(function (child,prop) {
    rs.push(prop);
  });
  return rs; 
}

// apply fn(node[p],p,node) to each treeProperty p  of node. Used extensively for applying functions through a tree
pj.forEachTreeProperty = function (node,fn,includeLeaves) {
  let perChild = function (value,prop) {
     if (pj.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       fn(node[prop],prop,node);
    }
  }
  //let perArrayChild = function (value,prop) {
  //   if (pj.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
 //      fn(value,prop,node);
 //   }
 // }
  if (pj.Array.isPrototypeOf(node)) {
    node.forEach(perChild);
  } else {
    let ownprops = Object.getOwnPropertyNames(node);
    ownprops.forEach(perChild.bind(undefined,undefined));
  }
  return this;
}

pj.forEachDescendant = function (node,fn) {
  fn(node);
  pj.forEachTreeProperty(node,function (child) {
    pj.forEachDescendant(child,fn);
  })
}




pj.everyTreeProperty = function (node,fn,includeLeaves) { 
  let ownprops = Object.getOwnPropertyNames(node);
  return ownprops.every(function (prop) {
     if (pj.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return 1;
    }
  });
}


pj.someTreeProperty = function (node,fn,includeLeaves) { 
  let ownprops = Object.getOwnPropertyNames(node);
  return ownprops.some(function (prop) {
     if (pj.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return false;
    }
  });
}

 // if node itself has gthe propety, return true
pj.ancestorHasOwnProperty  = function (node,p) {
  let cv = node;
  while (cv) {
    if (cv.__get(p)) return true;
    cv = cv.__get('__parent');
  }
  return false;
}

pj.Object.__inCore = function () {
  return pj.ancestorHasOwnProperty(this,'__builtIn');
}

/* used eg for iterating through styles.
 * apply fn(node[p],p,node) to each atomic property of node, including properties defined in prototypes, but excluding
 * those defined in core modules.
 * sofar has the properties where fn has been called so far (absent except in the recursive call)
 */

pj.mapNonCoreLeaves = function (node,fn,allowFunctions,isoFar) {
  let soFar = isoFar?isoFar:{};
  if (!node) {
    pj.error('Bad argument');
  }
  if (!node.__inCore || node.__inCore()) return;
  let op = Object.getOwnPropertyNames(node);
  op.forEach(function (prop) {
    let child,childType;
    if (soFar[prop]) return;
    if (!pj.treeProperty(node,prop,true,true)) return true;
    soFar[prop] = 1;
    child = node[prop];
    childType = typeof child;
    if (child && (childType === 'object' )||((childType==='function')&&!allowFunctions)) return;
    fn(child,prop,node);
  });
  let proto = Object.getPrototypeOf(node);
  if (proto) {
    pj.mapNonCoreLeaves(proto,fn,allowFunctions,soFar);
  }
}
//reverts the atomic properties except those given
pj.Object.__revertToPrototype = function (exceptTheseProperties) {
  let proto = Object.getPrototypeOf(this);
  let ownprops = Object.getOwnPropertyNames(this);
  let nonRevertable = this.__nonRevertable;
  ownprops.forEach((p) => {
    if (!exceptTheseProperties[p] && (!nonRevertable || !nonRevertable[p]) && (proto[p] !== undefined)) {
      let cv = this[p];
      if (typeof cv !== 'object') {
        delete this[p];
      }
    }
  });
}

pj.Object.__differsFromPrototype =  function (exceptTheseProperties) {
  let proto = Object.getPrototypeOf(this);
  let ownprops = Object.getOwnPropertyNames(this);
  let ln = ownprops.length;
  let nonRevertable = this.__nonRevertable;
  let computedProperties = this.__computedProperties;
  for (let i=0;i<ln;i++) {
    let p = ownprops[i];
    let computed = computedProperties && computedProperties[p];
    if (!computed && !exceptTheseProperties[p] && (!nonRevertable || !nonRevertable[p])) {
      let pv = proto[p];
      let cv = this[p];
      if ((typeof cv !== 'object') && (cv !== pv)) {
        return true;
      }
    }
  };
  return false;
}


pj.deepApplyFun = function (node,fn) {
  fn(node);
  pj.forEachTreeProperty(node,function (c) {
    pj.deepApplyFun(c,fn);
  });
}
  


pj.deepDeleteProps = function (node,props) {
  pj.deepApplyFun(node,function (ch) {
    props.forEach(function (p) {
      delete ch[p];
    });
  });
}



pj.deepDeleteProp = function (inode,prop) {
  pj.deepApplyFun(inode,function (node) {
    delete node[prop]
  });
}

let findResult = [];
pj.findDescendant = function (node,fn) {
  const recurser = function (node) {
    if (fn(node)) {
      findResult[0] = node;
      throw findResult;
    } else {
      pj.forEachTreeProperty(node,function (child) {
        recurser(child);
      });
    }
  }
  try {
    recurser(node);
  } catch(e) {
    if (e === findResult) {
      return e[0];
    } else {
      throw el
    }
  }
}

pj.descendantWithProperty = function (node,prop) {
  return pj.findDescendant(node,function (x) {
    return x[prop] !== undefined;
  });
}

pj.findAncestor = function (node,fn,excludeArrays) {
  let excluded;
  if (node===undefined) return undefined;
  excluded = excludeArrays && pj.Array.isPrototypeOf(node);
  if ((!excluded) && fn(node)) return node;
  let parent = node.__get('__parent');
  return pj.findAncestor(parent,fn,excludeArrays);
}

pj.ancestorThatInheritsFrom = function (node,proto) {
  return pj.findAncestor(node,function (x) {
    return proto.isPrototypeOf(x)
  });
}

pj.ancestorWithProperty = function (node,prop) {
  return pj.findAncestor(node,function (x) {
      return x[prop] !== undefined;
  },1);
}


pj.ancestorWithPrototype = function (node,proto) {
  return pj.findAncestor(node,function (x) {
      return proto.isPrototypeOf(x);
  },1);
}

pj.ancestorWithMethod = function (node,prop) {
  return pj.findAncestor(node,function (x) {
    return typeof x[prop] === 'function';
  },1);
}


pj.ancestorWithName = function (node,name) {
  return pj.findAncestor(node,function (x) {
    return x.__name === name;
  });
}




pj.ancestorWithoutProperty = function (node,prop) {
  return pj.findAncestor(node,function (x) {
      return x[prop] === undefined;
  },1);
}

pj.removeHooks = [];

pj.nodeMethod('remove',function () {
  let parent = this.__parent;
  let isArray = pj.Array.isPrototypeOf(parent);
  let __name = this.__name;
  pj.removeHooks.forEach((fn) => {
      fn(this);
  });
  if (isArray) {
    let idx = parent.indexOf(this);
    let ln = this.length;
    for (let i=idx+1;i++;i<ln) {
      let child = this[i];
      child.__name = i-1;
    }
    parent.splice(idx,1);
  } else {
    delete parent[__name];
  }
  return this;  
});


pj.reparentHooks = [];

pj.nodeMethod('__reparent',function (newParent,newName) {
  let parent = pj.getval(this,'__parent');
  let name = this.__name;
  pj.reparentHooks.forEach((fn) => {
      fn(this,newParent,newName);
  });
  adopt(newParent,newName,this);
  newParent[newName] = this;
  return this;  
});


pj.removeChildren =  function (node) {
  pj.forEachTreeProperty(node,function (child) {
    child.remove();
  });
  if (pj.Array.isPrototypeOf(node)) {
    node.length = 0;
  }
}




// check that a tree with correct parent pointers and names descends from this node. For debugging.
pj.nodeMethod('__checkTree',function () {
  pj.forEachTreeProperty(this, (child,prop)=> {
    if ((child.__parent) !== this) pj.error(this,child,'bad parent');
    if ((child.__name) !== prop) pj.error(this,child,'bad __name');
    v.__checkTree();
  });
});




// without inheritance from prototype;  x.__get(prop) will return a value only if prop is a direct property of this
pj.nodeMethod('__get',function (prop) { 
  if (this.hasOwnProperty(prop)) {
    return this[prop];
  }
  return undefined;
});

pj.nodeMethod('parent',function () {		
  return this.__get('__parent');		
});

pj.nodeMethod('__nthParent',function (n) {
  let cv = this;
  let i;
  for (i=0;i<n;i++) {
    cv = cv.__parent;
    if (!cv) return undefined;
  }
  return cv;
});

pj.Object.name = function () {		
  return this.__get('__name');		
}		


// in strict mode, the next 4 functions return undefined if c does not appear in s, ow the whole string
pj.afterChar = function (string,chr,strict) {
  let idx = string.indexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(idx+1);
}


pj.afterLastChar = function (string,chr,strict) {
  let idx = string.lastIndexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(idx+1);
}


pj.beforeLastChar = function (string,chr,strict) {
  let idx = string.lastIndexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(0,idx);
}


pj.beforeChar = function (string,chr,strict) {
  let idx = string.indexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(0,idx);
}

pj.pathExceptLast = function (string,chr) {
  return pj.beforeLastChar(string,chr?chr:'/');
}


  
pj.stripInitialSlash = function (string) {
  if (string==='') return string;
  if (string[0]==='/') return string.substr(1);
  return string;
}


pj.addInitialSlash = function (string) {
  if (string==='') return string;
  if (string[0]==='/') return string;
  return '/'+string;
}

pj.pathLast = function (string) {
  return pj.afterLastChar(string,'/');
}

pj.pathReplaceLast = function (string,rep,sep) {
  let sp = sep?sep:'/';
  let idx = string.lastIndexOf(sp);
  let  dr = string.substring(0,idx+1);
  return dr + rep;
}
  
 
pj.setIfNumeric = function (node,prp,v) {
  let n = parseFloat(v);
  if (!isNaN(n)) {
    this[prp] = v;
  }
}

/* an atomic property which does not inherit currently, but could,
 * in that there is a property down the chain with the same typeof
 */

pj.inheritableAtomicProperty = function (node,prop) {
  let propVal;
  if (prop === 'backgroundColor') {
    return false;
  }
  if (!node.hasOwnProperty(prop)) return false;
  let proto = Object.getPrototypeOf(node);
  return (typeof node[prop] === typeof proto[prop]);
}
  
/* inheritors(root,proto,filter) computes all of the descendants of root
 * which inherit from proto (including proto itself) and for which the filter (if any) is true.
 */

 

pj.inheritors = function (proto,filter) {
  let rs = [];
  let root = proto.__root();
  let recurser = function (node,proto) {
    if ((proto === node) || proto.isPrototypeOf(node)) {
      if (filter) {
        if (filter(node)) rs.push(node);
      } else {
        rs.push(node);
      }
    }
    pj.forEachTreeProperty(node,function (child) {
      recurser(child,proto);
    });
  }
  recurser(root,proto);
  return rs;
}


pj.forInheritors = function (proto,fn,filter) {
  let root = proto.__root();
  const recurser = function (node,proto) {
    if ((proto === node) || proto.isPrototypeOf(node)) {
      if ((filter && filter(node)) || !filter) {
        fn(node)
      }
    }
    pj.forEachTreeProperty(node,function (child) {
      recurser(child,proto);
    });
  }
  recurser(root,proto);
}


pj.forSomeInheritors = function (proto,fn) { 
  let rs = 0;
  let root = proto.__root();
  const recurser = function (node,proto) {
    
    if ((proto === node) || proto.isPrototypeOf(node)) {
      if (fn(node)) {
        rs = 1;
      } else {
        pj.forEachTreeProperty(node,function (child) {
          recurser(child,proto);
        });
      }
    }
    return rs;
  }
  recurser(root,proto);
  return rs;
}
 

pj.nodeMethod('__root',function () {
  let pr  = this.__get('__parent');
  return pr?pr.__root():this;
});



// the first protopy in node's chain with property prop 
pj.prototypeWithProperty = function (node,prop) {
  if (node[prop] === undefined) {
    return undefined;
  }
  let rs = node;
  while (true) {
    if (rs.__get(prop)) {
      return rs;
    }
    rs = Object.getPrototypeOf(rs);
    if (!rs) {
      return undefined;
    }
  }
}
  
  
  
  
// maps properties to sets (as Arrays) of  values.
pj.MultiMap = pj.Object.mk();

pj.MultiMap.mk = function () {
  return Object.create(pj.MultiMap);
}

pj.MultiMap.setValue = function(property,value) {
  let cv = this[property];
  if (!cv) {
    cv = pj.Array.mk();
    this.set(property,cv);
  }
  cv.push(value);
}

// array should contain strings or numbers
pj.removeDuplicates = function(array) {
  let rs;
  if (pj.Array.isPrototypeOf(array)) {
    rs = pj.Array.mk();
  } else {
    rs = [];
  }
  let d = {};
  array.forEach(function (v) {
    if (d[v] === undefined) {
      rs.push(v);
      d[v] = 1; 
    }
  });
  return rs;
}

pj.removeFromArray = function (array,value) {
  let index = array.indexOf(value);
  if (index > -1) {
    array.splice(index,1);
  }
  return array;
}

pj.addToArrayIfAbsent = function (array,value) {
  let index = array.indexOf(value);
  if (index == -1) {
    array.push(value);
  }
  return array;
}
  

/* a utility for autonaming. Given seed nm, this finds a __name that does not conflict
 * with children of avoid, and has the form nmN, N integer. nm is assumed not to already have an integer at the end
 * Special case. nm might be a number (as it will be when derived from the name of an array element). In this case, nm is replaced
 * by "N" and the usual procedure is followed
 */

 
 pj.autoname = function (avoid,inm) {
    let maxnum = -1;
    let anm;
    let nm = (typeof inm === 'number')?'N':inm;
    if (!avoid[nm]) {
      return nm;
    }
    let nmlength = nm.length;
    for (anm in avoid) {
      if (anm === nm) {
	    continue;
      }
      let idx = anm.indexOf(nm);
      if (idx === 0) {
	    let rst = anm.substr(nmlength);
	    if (!isNaN(rst)) {
	      let rint = parseInt(rst);
	      maxnum = Math.max(maxnum,parseInt(rst));
	    }
      }
    }
  let num = (maxnum === -1)?1:maxnum+1;
  return nm + num;
}

  
pj.fromSource = function (x,src) {
    if (x && (typeof(x)==='object')) {
      if ((x.__sourceUrl) && (x.__sourceUrl === src)) {
        return true;
      } else {
        let pr = Object.getPrototypeOf(x);
        return pj.fromSource(pr,src);
      } 
    } else {
      return false;
    }
  }

  
pj.nodeMethod("__inWs",function () {
  if (this === pj.root) return true;
  let pr = this.__get('__parent');
  if (!pr) return false;
  return pr.__inWs();
});

//last in the  work space which satisfies fn
pj.Object.__lastInWs = function (returnIndex,fn) {
  let current = this;
  let n = 0;
  let last = current;
  if (last.__inWs() && (!fn || fn(last))) {
    current = Object.getPrototypeOf(last);
    while (current.__inWs() && (!fn || fn(current))) {
      n++;
      last = current;
      current = Object.getPrototypeOf(last);
    }
    return returnIndex?n:last;
  }
  return returnIndex?-1:undefined;
}

pj.nodeMethod('__size',function () {
  let n=0;
  if (pj.Object.isPrototypeOf(this)) {
    pj.forEachTreeProperty(this,function () {
      n++;
    },1);
    return n;
  } else {
    return this.length;
  }
});



pj.Object.__namedType = function () { // shows up in the inspector
  this.__isType = 1;
  return this;
}

pj.countDescendants = function (node,fn) {
  let rs = 0;
  pj.forEachDescendant(node,function (d) {
    rs +=  fn?(fn(d)?1:0):1;
  });
  return rs;
}

// an object X s "pure" if its structure is a pure inheritance from its prototype; that is, if it has only 
// Objects as descendants, and if each of those descendants inherits from the prototype. Furthernore, the protoype should have
// no  non-null object descendant D that has no corresponding node in X. after X = Y.instantiate, X starts out pure

// In serialization, each top level pure object (object whose parent is not pure) is serialized as if it had the structure {__pure:1}. pjObject.__restorePures
// is run after serialization. 

pj.Object.__isPure = function () {
  let names = Object.getOwnPropertyNames(this);
  let proto = Object.getPrototypeOf(this);
  let i,child;

  let nn = names.length;
  for (i=0;i<nn;i++) {
    let name = names[i];
    child = this[name];
    if (!pj.Object.isPrototypeOf(x)) {
      return false;
    }
    childProto = Object.getPrototypeOf(child);
    protoChild = proto[name];
    if (childProto !== protoChild) {
      delete x.__pure;
      return false;
    }
    if (!child.__isPure()) {
      delete x.__pure;
      return false;
    }
  }
  // now make sure the prototype has no extra Object children
  names = Object.getOwnPropertyNames(proto);
  nn = names.length;
  for (i=0;i<nn;i++) {
    let name = names[i];
    child = proto[name];
    if (pj.Object.isPrototypeOf(child)) {
      if (!this[name]) {
        delete x.__pure;
        return false;
      }
    }
  }
  x.__pure = true;
  return true;
}

pj.numericalSuffix = function (string) {
  let i,c,ln;
  let n = Number(string);
  if (!isNaN(n)) {
    return n;
  }
  ln = string.length;
  for (i=ln-1;i>=0;i--) {
    c = string[i];
    if (isNaN(Number(c))) { //that is, if c is a digit
      return Number(string.substring(i+1));
    }
  }
  return Number(string);
}

// c = max after decimal place; @todo adjust for .0000 case
pj.nDigits = function (n,d) {
  let ns,dp,ln,bd,ad;
  if (typeof n !=="number") return n;
  let pow = Math.pow(10,d);
  let unit = 1/pow;
  let rounded = Math.round(n/unit)/pow;
  ns = String(rounded);
  dp = ns.indexOf(".");
  if (dp < 0) return ns;
  ln = ns.length;
  if ((ln - dp -1)<=d) return ns;
  bd = ns.substring(0,dp);
  ad = ns.substring(dp+1,dp+d+1)
  return bd + "." + ad;
}

pj.Array.__copy = function (copyElement) {
  let rs = pj.Array.mk();
  let ln = this.length;
  let i,ce;
  for (i=0;i<ln;i++) {
    ce = this[i];
    if (copyElement) {
      rs.push(copyElement(ce));
    } else {
      rs.push(ce);
    }
  }
  return rs;  
}
// deep for the tree, but not for the prototype chains; copies own properties and not prototypes
// not completely general - cross tree links are skipped
pj.deepCopy = function (x) {
  if ((x === null) || (typeof x !== 'object')) {
    return x;
  }
  let proto = Object.getPrototypeOf(x);
  let rs = Object.create(proto);
  const perChild = function (child,hasParent) {
    let cp = pj.deepCopy(child);
    if (hasParent) {
      cp.__parent = rs;
    }
    return cp;
  }
  if (Array.isArray(x)) {
    let ln = x.length;
    x.forEach(function (child) {
      let childHasParent = child && (typeof child === 'object') && child.__parent;
      rs.push(perChild(child,childHasParent));
    });
    return rs;
  }
  if (typeof x === 'object') {
     let ownprops = Object.getOwnPropertyNames(x);
     ownprops.forEach(function (prop) {
       if (prop === '__parent') {
        return;
       }
       let child = x[prop];
       let childHasParent = child && (typeof child === 'object') && child.__parent;
       if (childHasParent) {
         if (child.__parent !== x) {
           return;  // skip cross-tree link
         }
       }
       rs[prop] = perChild(child);
       return rs;
     });
     return x;
  }
}

pj.objectifyArray = function (a) {
  let rs  = pj.Object.mk();
  a.forEach(function (element) {
    rs[element] = 1;
  });
  return rs;
}

pj.Object.__setComputedProperties = function (a) {
  this.set('__computedProperties',pj.objectifyArray(a));
}

/* a simple event system
 *
 * An Event always has a node and id, and often has many other attributes (eg property)
 * If a field of a node is watched, and its value changes, this generates the change event with given node and property and id "change'
 * pj.Event.emit emits the event into the system.
 * Whenever an event is emitted, as search for listeners for that event is made in the ancestry of the noce. Each node may have a __listeners property, which lists listeners
 * by event id.  A listener is just a function which takes the event as input (and may emit other events, of course)
 *
 * pj.watch(nd,p)  Means that change events will be generated for that field.
 */

pj.set('Event',pj.Object.mk());

pj.Event.mk = function (nm,node) {
  var rs = Object.create(pj.Event);
  rs.id=nm;
  rs.node=node;
  return rs;
}

/* add a listener for events with id nm (the listeners for events with id nm under node is held in an Array at node.__listeners)
 * A listener is a reference to a function
 * It has the form /a/b where  a/b is the path below pj
 * or a/b the path below node
 * The  listener function takes two inputs: the event, and the node at which the listener is fired.
 */

pj.Object.__addListener = function (id,fn) {
  var listeners = this.__get('__listeners');
  if (!listeners) {
    listeners = this.set('__listeners',pj.Object.mk());
  }
  var listenerArray = listeners[id];
  if (!listenerArray) {
    // this is the head of its chain; will not be copied in instantiated
    listenerArray = listeners.set(id,pj.Array.mk());
    listenerArray.__head = 1; // head of chain for instantiate; 
  }
  if (listenerArray.indexOf(fn) < 0) {
    listenerArray.push(fn);
  }
}


pj.fireListenersInChain = function (node,event,startOfChain) {
  var listeners = node.__listeners;
  var  listenerArray,proto,fn;
  if (listeners) {
    listenerArray = listeners.__get(event.id);
    if (listenerArray) {
      listenerArray.forEach(function (listenerRef) {
        fn = pj.evalPath(node,listenerRef);
        if (!fn) pj.error('No such listener '+listenerRef,'event');
        pj.log('event','firing listener ',listenerRef,'for '+event.id);

        //pj.log('event','firing  listener for '+event.name);
        //fn(event,startOfChain);
        fn.call(startOfChain,event);
      });
    }
  }
  proto = Object.getPrototypeOf(node);
  if (proto !== pj.Object) {
    pj.fireListenersInChain(proto,event,startOfChain);
  }
}


pj.fireListenersInAncestry = function (node,event) {
  if (pj.Object.isPrototypeOf(node)) pj.fireListenersInChain(node,event,node);
  var parent = node.__parent;
  if (parent && (parent !== pj)) {
    pj.fireListenersInAncestry(parent,event);
  }
}

/*
 * pj.EventQueue contains the unprocessed events. processing an event consists of finding listeners for it in
 * the ancestry of the node where it occurs, and firing them.  Emitting and event is adding it to the queue.
 */

pj.EventQueue = [];

pj.eventStep = function () {
  var event = pj.EventQueue.shift();
  if (event === undefined) return false;
  pj.fireListenersInAncestry(event.node,event);
  return true;
}

pj.MaxEventSteps = 1000;// throw an error if the queue doesn't empty out after this number of steps

pj.processEvents = function () {
  var cnt=0,notDone=true;
  while (notDone && (cnt < pj.MaxEventSteps)) {
    notDone = pj.eventStep();
    cnt++;
  }
  if (cnt >= pj.MaxEventSteps) {
    pj.error('Event loop','event');
  }
  return cnt;
}

pj.Event.emit = function () {
  pj.log('event','Emitting event '+this.id);
  pj.EventQueue.push(this);
  pj.processEvents();
}

/* Usage example:
 * From a Legend for infographs with colored categories.
 
 pj.watch(item.colorRectP,"fill"); // watches the field "fill", and emits change events when the fill is modified

*/


  
  
  
  
/* a trivial exception setup.  System is meant to indicate which general system generated the error
 * (eg instantiate, install, externalize, or  what not.
 */

pj.Exception = {};

pj.throwOnError = false;
pj.debuggerOnError = true;

pj.Exception.mk = function (message,system,value) {
  var rs = Object.create(pj.Exception);
  rs.message = message;
  rs.system = system;
  rs.value = value;
  return rs;
}

// A default handler
pj.Exception.handler = function () {
  var msg = this.message;
  if (this.system) msg += ' in system '+this.system;
  pj.log('error',msg);
}


pj.error = function (msg,sys) {
  if (sys) {
    pj.log('error',msg+sys?' from '+sys:'');
  } else {
    pj.log('error',msg);
  }
  if (pj.debuggerOnError) {
    debugger;
  }
  if (pj.throwOnError) {
    var ex = pj.Exception.mk(msg,sys);
    throw ex;
  }
}


/* When a Object has a method called update, the state of that node is maintained by application of that method
 * when there are changes. Some nodes within the tree might be generated by update, and in that case, the node is marked computed.
 * Independently, the atomic values of some properties might be set by update, and in that case, the property might me marked computed.
 * Typically, the latter marking is made on the prototype (eg, if width of a bar is computed, this fact is declared in the prototype of the bar)
 */


pj.declareComputed = function (node) {
  node.__computed = 1; 
  return node;
}

pj.defineFieldAnnotation("computed");  // defines __setComputed and __getComputed

pj.isComputed = function (node,k,id) {
  var d = id?id:0;
  if (d > 20) {
     pj.error('update','stack overflow'); 
  }
  if (!node) return false;
  if (node.__computed) return true;
  if (k && node.__getcomputed(k)) {
    return true;
  }
  
  return pj.isComputed(node.__get('__parent'),undefined,d+1);
}



pj.updateErrors = [];
pj.debugMode = 1; // no tries in debug mode, to ease catching of errors
pj.updateCount = 0;
pj.catchUpdateErrors = false;// useful off for debugging;

pj.updateErrorHandler = function (e) {
  pj.updateErrors.push(e.message);
}
pj.Object.__update = function () {
  if (this.update ) {
    pj.log('update','__updating ',this.__name);
    if (pj.catchUpdateErrors) {
      try {
        this.update();     
      } catch(e) {
        pj.updateErrorHandler(e);
        return;
      }
    } else {
      this.update();
    }
    this.__newData = 0;
    if (this.__updateCount) {
      this.__updateCount++;
    } else {
      this.__updateCount = 1;
    }
  }
}
pj.forEachPart = function (node,fn,filter) {
  pj.forEachTreeProperty(node,function (child) {
    if (child.update) {
      if (!filter || filter(child)) {
        fn(child);
      }
    } else {
      pj.forEachPart(child,fn,filter);
    }
  });
}

pj.partsFromSource = function (src) {
  var rs = pj.Array.mk();
  pj.forEachPart(function (part) {
    if (pj.fromSource(src)) {
      rs.push(src);
    }
  })
  return rs;
}
pj.partAncestor = function (node) {
  var rs = node;
  while (1) {
    if (rs.update) {
      return rs;
    }
    var pr = rs.__get('__parent');
    if (pr) {
      rs = pr;
    } else {
      return rs;
    }
  }
}
  


pj.updateParts = function (node,filter) {
  var updateLast = [];
  pj.forEachPart(node,function (node) {
    if (node.__updateLast) {
      updateLast.push(node);
    } else {
      node.__update();
    }
  },filter);
  updateLast.forEach(function (node) {
    node.__update();
  });
}

pj.updateInheritors = function (node,filter) {
  pj.forInheritors(node,function (x) {x.__update()},filter);
}

pj.updateRoot = function (filter) {
  if (pj.root && pj.root.update && (!filter || filter(pj.root)))  {
    pj.root.__update();
  } else if (pj.root) {
      pj.updateParts(pj.root,filter);
  }
}

pj.updateAncestors = function (node) {
  if (node) {
    node.__update();
    pj.updateAncestors(node.__parent);
  }
}


pj.resetArray = function (node,prop) {
  var child = node.__get(prop); 
  if (child) {
    pj.removeChildren(child);
  } else {
    child = node.set(prop,pj.Array.mk());
  }
  return child;
}

pj.resetComputedArray = function (node,prop) {
  var child = pj.resetArray(node,prop);
  pj.declareComputed(child);
  return child;
}


// create a new fresh value for node[prop], all set for computing a new state

pj.resetComputedObject = function (node,prop,factory) {
  var value = node.__get(prop),
    newValue;
  if (value) {
    pj.removeChildren(value);
  } else {
    if (factory) {
      var newValue = factory();
    } else {
      newValue = pj.Object.mk();
    }
    value = node.set(prop,newValue);
  }
  pj.declareComputed(value);
  return value;
}
 
 //pj.resetComputedDNode = pj.resetComputedObject; // old name
 
/* if stash is nonnull, save the computed nodes to stash
 * the stash option is used when saving an item, but wanting its state to persist after the save
 */

pj.removeComputed = function (node,stash) {
  var thisHere = this;
  var  found = 0;
  pj.forEachTreeProperty(node,function (child,prop) {
    if (prop == "__required") {
      return;
    }
    var stashChild;
    if (child.__computed) {
      found = 1;
      if (stash) {
        stash[prop] = child;
      }
      if (pj.Array.isPrototypeOf(child)) {
        node.set(prop,pj.Array.mk());
      } else {
        child.remove();
      }
    } else {
      if (stash) {
        stashChild = stash[prop] = {__internalNode:1};
      } else {
        stashChild = undefined;
      }
      if (pj.removeComputed(child,stashChild)) {
        found = 1;
      } else {
        if (stash) {
          delete stash[prop];
        }
      }
    }
  });
  return found;
}


pj.restoreComputed = function (node,stash) {
  for (var prop in stash) {
    if (prop === '__internalNode') continue;
    var stashChild = stash[prop];
    if (!stashChild) {
      return;
    }
    if (stashChild.__internalNode) {
      pj.restoreComputed(node[prop],stashChild);
    } else {
      node[prop] = stashChild;
    }
  }
}

// the signature of an object tells which of its atomic properties are open for reading and writing
// There is no enforcement. The signature determines the behavior of the transferState operator.


pj.set("Signature",pj.Object.mk()).__namedType();

// if value is a string or item, treat it as the type
pj.Signature.addProperty = function (prop,access,value) {
  if ((typeof(value) === 'string') || pj.Object.isPrototypeOf(value )) {
    var vl = pj.lift({access:access,type:value});
  } else {
    vl = pj.lift(value);
  }
  this.set(prop,vl);
}

pj.Signature.mk = function (writables,readables) {
  var prop,access;
  var rs = Object.create(pj.Signature);
  for (prop in writables) {
    rs.addProperty(prop,'W',writables[prop]);
  }
  if (readables) {
    for (prop in readables) {
      rs.addProperty(prop,'W',readables[prop]);
    }   //code
  }
  return rs;
}

pj.transferState = function (dest,src,ownOnly) {
  var srcsig = src.__signature;
  var destsig = dest.__signature;
  if (srcsig && destsig) {
    pj.forEachTreeProperty(destsig,function (child,prop) {
      var destp = destsig[prop];
      var pv;
      if (destp && (destp.access === 'W')) {
        pv = (ownOnly)?src.__get(prop):src[prop];
        if (pv !== undefined) {
          dest[prop] = pv;
        }
      }
    });
    dest.__update();
    return dest;
  }
}


pj.replacePrototype = function (target,newProto) {
  var oldProto = Object.getPrototypeOf(target);
  var rs  = newProto.instantiate();
  pj.transferState(rs,target);
  var nm = target.__name;
  var parent = target.__parent;
  var ta = parent.textarea;
  //ta.remove();
  //target.remove();
  parent.set(nm,rs);
  rs.__update();
  rs.__draw();
  ta.__bringToFront();
  //parent.set('textarea',ta);
  //ta.__draw();
  return rs;
}

/* pj.replacements is initialized from the replacement data base, and maps paths to replacement descriptions
 * A replacement description has the form: {svg:<url>,replacement:<url>}
 */


// For monitoring.
pj.instantiateCount = 0;
pj.internalChainCount = 0;
    


var internalChain;
var includeComputed = false;
var headsOfChains; // for cleanup

/* Here is the main function, which is placed up front to clarify what follows.
 * If count is defined, it tells how many copies to deliver.
 */


pj.Object.instantiate = function (count) {
  var n = count?count:1;
  
  var multiRs,singleRs,i;
  if (n>1) {
    multiRs = [];
  }
  internalChain = false;
  headsOfChains = [];
  markCopyTree(this);
  addChains(this);
  // recurse through the tree collecting chains
  collectChains(this);
  // the same chains can be used for each of the n
  // instantiations
  for (i=0;i<n;i++) {
    buildCopiesForChains(); // copy them
    buildCopiesForTree(this); // copy the rest of the tree structure
    singleRs = stitchCopyTogether(this);
    clearCopyLinks(this);
    if (n > 1) {
      multiRs.push(singleRs);
    }
  }
  cleanupSourceAfterCopy(this);
  pj.theChains = [];
  pj.instantiateCount++;
  if (internalChain) {
    pj.internalChainCount++
  }
  headsOfChains.forEach(function (x) {
    delete x.__headOfChain;
  });
  return (n>1)?multiRs:singleRs;
}

pj.theChains = [];



var markCopyTree = function (node) {
  node.__inCopyTree = 1;
  if (includeComputed || !node.__computed) {
    pj.forEachTreeProperty(node,function (c) {
      markCopyTree(c);
    });
  }
}

/* Compute the prototype chain for node - an explicit array of the prototypes.
 * The argument chainNeeded is true when addToChain is called from an object up the chain, rather than the tree recursor
 * We don't bother with chains of length 1.
 */


var addChain = function (node,chainNeeded) {
  var proto,typeOfProto,chain;
  if (node.hasOwnProperty('__chain')) {
    return node.__chain;
  }
  var proto = Object.getPrototypeOf(node);
  var typeOfProto = typeof(proto);
  if (((typeOfProto === 'function')||(typeOfProto === 'object')) && (proto.__get('__parent'))) { //  a sign that proto is in the object tree
    // is it in the tree being copied?
    if (proto.__inCopyTree) {
      var chain = addChain(proto,1).concat(); 
      // @todo potential optimization; pch doesn't need copying if chains don't join (ie if there are no common prototypes)
      internalChain = 1;
      chain.push(node);
    } else {
      // the chain terminates at node for copying purposes
      chain = [node];
    }
    node.__chain = chain;
    return chain;
  } else {
    // this has no prototype within the object tree (not just the copy tree)
    if (chainNeeded) {
      var rs = [node];
      node.__chain = rs;
      return rs;
    } else {
      return undefined;
    }
  }
}

var addChains = function (node) {
  addChain(node);
  if (includeComputed || !node.__computed) {
    pj.forEachTreeProperty(node,function (c) {
      addChains(c);
    });
  }
}

var collectChain = function (node) {
  var chain = node.__chain;
  if (chain && (chain.length > 1) &&(!chain.collected)) {
    pj.theChains.push(chain);
    chain.collected = 1;
  }
}

var collectChains = function (node) {
  collectChain(node);
  if (includeComputed || !node.__computed) {
    pj.forEachTreeProperty(node,function (c) {
      collectChains(c);
    });
  }
}

var buildCopiesForChain = function (chain) { 
  /**
   * for [a,b,c], a is a proto of b, and b of c
   * current is the last member of the new chain. This is initially the
   * head of the chain back in the old tree.
   */
  var current = chain[0];
  var ln = chain.length;
  var i,proto,protoCopy;
  /**
   * build the chain link-by-link, starting with the head. proto is the current element of the chain.
   * Start with the head, ie chain[0];
   */
  for (i=0;i<ln;i++) { 
    var proto = chain[i];
    var protoCopy = proto.__get('__copy');
    if (!protoCopy) {
      //anchor  protoCopy back in the original
      protoCopy = Object.create(current); 
      if (i === 0) {
        protoCopy.__headOfChain = 1;
        headsOfChains.push(protoCopy);
      }
      if (chain.__name) protoCopy.__name = proto.__name;
      proto.__copy = protoCopy;
    }
    current = protoCopy; 
  }
}

var buildCopiesForChains = function () {
  pj.theChains.forEach(function (ch) {buildCopiesForChain(ch);});
}

// __setIndex is used for  ordering children of a Object (eg for ordering shapes), and is sometimes associated with Arrays.

var buildCopyForNode = function (node) {
  var cp  = node.__get('__copy');//added __get 11/1/13
  if (!cp) {
    if (pj.Array.isPrototypeOf(node)) {
      var cp = pj.Array.mk();
      var setIndex = node.__setIndex;
      if (setIndex !== undefined) {
        cp.__setIndex = setIndex;
      }
    } else {
      cp = Object.create(node);
    }
    node.__copy = cp;
    cp.__headOfChain = 1;
    headsOfChains.push(cp);

  }
}

// prototypical inheritance is for Objects only


var buildCopiesForTree = function (node) {
  buildCopyForNode(node);
  if (includeComputed || !node.__computed) {
    pj.forEachTreeProperty(node,function (child,property){
      if (!child.__head) {  // not declared as head of prototype chain
        buildCopiesForTree(child);
      }  
    });
  }
}


var stitchCopyTogether = function (node) { // add the __properties
  var isArray = pj.Array.isPrototypeOf(node),
    nodeCopy = node.__get('__copy'),
    ownProperties,thisHere,perChild,childType,child,ln,i,copiedChild;
  if (!nodeCopy) pj.error('unexpected');
  if (node.__computed) {
    nodeCopy.__computed = 1;
    if (!includeComputed) return nodeCopy;
  }
  ownProperties = Object.getOwnPropertyNames(node);
  thisHere = node;
  // perChild takes care of assigning the child copy to the  node copy for Objects, but not Arrays
  var perChild = function (prop,child,isArray) {
      var childType = typeof child, 
        childCopy,treeProp;
      if (child && (childType === 'object')  && (!child.__head)) {
        childCopy = pj.getval(child,'__copy');
        treeProp =  pj.getval(child,'__parent') === thisHere; 
        if (childCopy) {
          if (!isArray) nodeCopy[prop]=childCopy;
          if (treeProp) {
            childCopy.__name = prop;
            childCopy.__parent = nodeCopy;
          }
        }
        if (treeProp)  {
          stitchCopyTogether(child);
        }
        return childCopy;
      } else {
        if (isArray) {
          return child;
        } else {
          // atomic properties of nodes down the chains need to be copied over, since they will not be inherited
          if (!nodeCopy.__get('__headOfChain')) {
            nodeCopy[prop] = child; 
          }
        }
      }
    }
  if (isArray) {
    node.forEach(function (child) {
      nodeCopy.push(perChild(null,child,1));
    });
  } else {
    ownProperties.forEach(function (prop) {
      if (!pj.internal(prop)) {
        perChild(prop,thisHere[prop]);
      }
    });
  }
  return nodeCopy;
}


var cleanupSourceAfterCopy1 = function (node) {
  delete node.__inCopyTree;
  delete node.__chain;
  delete node.__copy;
  delete node.__headOfChain;
}


var cleanupSourceAfterCopy = function (node) {
  cleanupSourceAfterCopy1(node);
  if (includeComputed || !node.__computed) {
    pj.forEachTreeProperty(node,function (c) {
      cleanupSourceAfterCopy(c);
    });
  }
}

var clearCopyLinks = function (node) {
  pj.deepDeleteProp(node,'__copy');
}


// A utility: how many times is x hereditarily instantiated within this?
pj.Object.__instantiationCount = function (x) {
  var rs = 0;
  if (x.isPrototypeOf(this)) {
    var rs = 1;
  } else {
    rs = false;
  }
  pj.forEachTreeProperty(this,function (v) {
    var c = v.__instantiationCount(x);
    rs = rs +c;
  });
  return rs;
}

pj.Array.__instantiationCount = pj.Object.__instantiationCount;

// instantiate the  Object's  prototype
pj.Object.__clone = function () {
  var p = Object.getPrototypeOf(this);
  if (pj.Object.isPrototypeOf(p)) {
    return p.instantiate();
  } else {
    pj.error("Attempt to clone a non-Object",this.__name);
  }
}

/* Serialization of deep prototypes.
 * Technique: each node in the JavaScript graph constituting the deep prototype is assigned a code (either a number or string). 
 * Then, objects are assembled which describe each node N by assiging attributes to its code.
 * These  are packaged together into a  single object R, which is serialized as JSON.
 * 
 *  The codes for nodes which are internal to the prototype are sequential integers starting with 0.
 *  Codes for objects referenced by the prototype, but external to it, are needed too.  Such external objects might have been
 *  loaded separately, or built into the application. In any case, external codes have 
 *  the form xN for sequential non-negative integers N.
 *  
 *  Here are the  properties of R  which represent the attributes of nodes N with codes C
 *  (1)  R.atomicProperties, an array. R.atomicProperties[C] is  an object which has the same values for atomic-valued properties
 *       as does N; however function values f are encoded by [f.toString()]
 *  (2) R.objectProperties, an array. R.objectProperties[C]  is an object which maps each object-valued property P of N
 *    to the code for the value of N.P, or to '<code> child' if the external object is a child of value(C) [since __parent links
 *    are not available for coding in the external object]
 *  (3) R.arrays.  An object where R.arrays[C] is defined when N is an array.  R.arrays[C] === length(N).
 *  (4) R.chains: this  contains an array of prototype-chain descriptions, one per head-of-chain. Each description is an array of the codes
 *    of nodes in the chain. Each chain description ends  with the code for an external node.
 * (5) R.externals, an array which gives the meanings of the codes xN for externals.
 * (6) R.requires, an array of all the urls mentioned in R.externals (the files that must be loaded prior to interpretation of this serialization)
 
 *  An external is described by string of one the forms:  [<built-in>]/<path> or [<url>]/<path>
 *
 *  The built-ins for the ProtoChart application are things like "geom", and "ui". For example, "/geom/Point" refers to
 *  the  Point prototype as defined in pj.geom. Any deep prototype which contains Points will define a code 
 *  which is assigned  the value "/geom/Point" in R.externals.
 *
 *  For a separately loaded item, [url] denotes the URl from which it was loaded.
 *
 *  In either case,   <path> specifies the sequence of selections which yield the referred-to object when starting with the external object.
 *  For example, [htps://protochart/repo1/chart/column.js]/graph/axis denotes the object X.graph.axis, where X is the item that was loaded
 *  from https://protochart/repo1/chart.column.js. 
 *  
 * R.chains[0][0] is the root of the serialization.
 * 
 */

 

var externalAncestor = function (x,root) {
  if (x === root) {
    return undefined;
  } else if (pj.getval(x,'__sourceUrl')||pj.getval(x,'__builtIn')) {
    return x;
  } else {
    var parent = pj.getval(x,'__parent');
    if (parent) {
      //return externalizedAncestor(parent,root);
      return externalAncestor(parent,root);
    } else {
      return undefined;
    }
    
  }
}

var dependencies,externalReferences;


var externalReference = function (x) {
  if (x.__referenceString) {
    return x.__referenceString;
  }
  var url = x.__sourceUrl;
  var rs = '['+url+']';
  x.__referenceString = rs;
  if (!dependencies[url]) {
    dependencies[url] = true;
  }
  externalReferences.push(x); // these need to be cleared after the serialization
  return rs;
  
}


pj.referencePath = function (x,root,missingOk) {
  var extAncestor = externalAncestor(x,root);
  var  builtIn,relative,componentPath,relPath,builtInPath;
  if (extAncestor === undefined) {
    return undefined;
  }
  builtIn = pj.getval(extAncestor,'__builtIn');
  if ( !builtIn) {
    var componentPath = externalReference(extAncestor); //findComponent(extAncestor,repo);
    if ( !componentPath) {
      throw(pj.Exception.mk('Not in a require',x));
    }
  }
  if (!x.__pathOf) {
     pj.error('serialize','unexpected condition'); 
  }
  var relPath = (x === extAncestor)?'':x.__pathOf(extAncestor).join('/');                                  
  if (builtIn) {
    if (extAncestor === pj) {
      return relPath;
    } else {
      builtInPath = extAncestor.__pathOf(pj);
      return builtInPath.join('/') + '/' + relPath;
    }
  }
  return (relPath==='')?componentPath:componentPath+relPath;
}

pj.serialize = function (root) {
  dependencies = {};
  externalReferences = [];
  var nodes = [];
  var externals = [];
  var theObjects  = [];
  var chains = [];
  var theArrays = {};
  var externalItems = [];
  var atomicProperties = [];
  var theChildren = [];
  var nodeCount = 0;  
  var assignCode = function (x,notHead) {
    var rs;
    if (pj.Array.isPrototypeOf(x)) {
      if (x.__code) {
        return x.__code;
      } else {
        rs = x.__code = nodeCount++;
        nodes.push(x);
        x.forEach(function (child) {
          if (child && (typeof child === 'object')) {
            assignCode(child);
          }
        });
        return rs;
      }
    }
    if (!x || !(x.__get)) {
       pj.error('deserialize','unexpected condition'); 
    }
    if (notHead) {
      x.__notHead = true;
    }
    if (x.__get('__code')) {
      rs = x.__code;
    } else {
      var reference = pj.referencePath(x,root);
      if (reference) {
        rs = 'x'+externals.length;
        externals.push(reference);
        x.__code = rs;
        externalItems.push(x);
        return rs;
      }
      nodes.push(x);
      rs = x.__code = nodeCount++;
      pj.forEachTreeProperty(x,function (child) {
        assignCode(child);
      });
    }
    if (typeof rs === 'number') {
      var proto = Object.getPrototypeOf(x);
      if (proto) {
        assignCode(proto,true);
      }
    }
    return rs;
  }
  
  var findObjects = function () {
  
    var ln = nodes.length;
    for (var i=0;i<ln;i++) {
      var node = nodes[i];
      if (pj.Array.isPrototypeOf(node)) {
        theArrays[i] = node.length;
      } else if (!node.__get('__notHead')) {
        theObjects.push(node);
      }
    };
  }
  
  var buildChain = function (x) {
    if (pj.Array.isPrototypeOf(x)) {
      return undefined;
    }
    var code = x.__code;
    if (typeof code !== 'number') {
       pj.error('serialize','unexpected condition'); 
      return;
    }
    var cx = x;
    var chain = [code];
    while (true) {
      cx = Object.getPrototypeOf(cx);
      if (!cx) {
        chains.push(chain);
        return;
      }
      code = cx.__code;
      chain.push(code);
      if (typeof code !== 'number') {
        chains.push(chain);
        return;
  
      }
    }
  }
  
  // properties that are used in serialization, and that should not themselves be serialized
  var excludedProps = {__code:1,__notHead:1,__headOfChain:1};

  var theProps = function (x,atomic) {
    var rs = undefined;
    var addToResult = function(prop,atomicProp) {
      var vcode;
      if (excludedProps[prop]) {
        return;
      }
      var v = x[prop];
      if (atomicProp) {
        if ((v === null)||(typeof v !== 'object')) {
          if (!rs) {
            rs = {};
          }
          if (typeof v === 'function') {
            rs[prop] = [v.toString()];
          } else {
            rs[prop] = v;
          }
        }
      } else {
        if ((v !== null)&&(typeof v === 'object')) {
          if (!rs) {
            rs = {};
          }
          vcode = v.__code;
          if (typeof vcode === 'string') { //an external reference
            if (v.__parent === x) {
              vcode = vcode + ' child';
            }
          }
          rs[prop] = vcode;
        }
      }
    }
    if (pj.Array.isPrototypeOf(x)) {
      var ln = x.length;
      for (var i=0;i<ln;i++) {
        addToResult(i,atomic);
      }
      if (atomic) {
        addToResult('__name',true);
      } else {
        addToResult('__parent',false);
      }
      return rs;
    }
    var props = {};
    var propNames = Object.getOwnPropertyNames(x);
    var rs = undefined;
    propNames.forEach(function (prop) {
      addToResult(prop,atomic);
    });
    console.log('the props',rs);
    return rs;
  }
  
  var buildProperties = function () {
    var ln = nodes.length;
    for (var i=0;i<ln;i++) {
      atomicProperties.push(theProps(nodes[i],true));
      theChildren.push(theProps(nodes[i],false));
    }
  }
  
  var externalizeCleanup = function () {
    nodes.forEach(function (node) {
      node.__code = undefined;
    });
    externalItems.forEach(function (ext) {
      ext.__code = undefined;
    });
    externalReferences.forEach(function (x) {
      x.__referenceString = undefined;
    });
  }

  /* The operations have been defined. NOW for the action */
  assignCode(root);
  findObjects();
  theObjects.forEach(buildChain);
  buildProperties();
  var rs = {};
  rs.chains = chains;
  rs.arrays = theArrays;
  rs.atomicProperties = atomicProperties;
  rs.children = theChildren;
  rs.externals = externals;
  rs.__requires = Object.getOwnPropertyNames(dependencies);
  externalizeCleanup();
  return rs;
  
}


    
pj.beforeStringify = [];// a list of callbacks
pj.afterStringify = []; // ditto


pj.prettyJSON  = false;

pj.stringify = function (node) {
  var srcp = node.__sourceUrl;
  node.__sourceUrl = undefined;// for reference generaation in externalize
  pj.beforeStringify.forEach(function (fn) {fn(node);});
  var x = pj.serialize(node);
  node.__sourceUrl = srcp;
  pj.afterStringify.forEach(function (fn) {fn(node);});
  var rs =  pj.prettyJSON?JSON.stringify(x,null,4):JSON.stringify(x);
  return rs;
}

//(function (pj) {

// This is one of the code files assembled into pjcore.js. 'start extract' and 'end extract' indicate the part used in the assembly


//start extract


// <Section> internalize ====================================================


pj.splitRefToUrl = function (ref) {
  var splitRef = ref.split('|');
  var isSplit = splitRef.length > 1;
  return (isSplit)?pj.fullUrl(splitRef[0],splitRef[1]):ref;
}


pj.externalReferenceToUrl = function (ref,includesPath) {
  var firstChar = ref[0];
  if (firstChar === '[') {

    var closeBracket = ref.lastIndexOf(']')
    var url = ref.substr(1,closeBracket-1);
  } else {
    url = ref;
  }
  if (includesPath) {
    var path = ref.substring(closeBracket+1);
    return {url:url,path:path};
  } else {
    return url;
  }
}

var resolveExternalReference = function (ref) {
  var firstChar = ref[0];
  if (firstChar === '[') {
    var urlAndPath = pj.externalReferenceToUrl(ref,true);
    var item = pj.installedItems[urlAndPath.url];
    if (!item) {
      return undefined;
    }
    var rs = pj.evalPath(item,urlAndPath.path);
  } else if (firstChar === '/') {
    rs = pj.evalPath(pj,ref.substr(1));
  } else {
    pj.error('deserialize','unexpected condition'); 
  }
  if (!rs) {
    pj.error('deserialize','unexpected condition'); 
  }
  return rs;
}



var installAtomicProperties 
pj.deserialize = function (x) {
  var inodes = {};
  var externalItems = {};
  var atomicProperties = x.atomicProperties;
  var children = x.children;
  var arrays = x.arrays;
  var externals = x.externals;
  var value;
  
  var installAtomicProperties = function (parentCode) {
    var parent = inodes[parentCode];
    if (!parent) {
      return;
    }
    var values = atomicProperties[parentCode];
    for (var prop in values) {
      value = values[prop];
      if (Array.isArray(value)) {// a function
        parent[prop]  = eval('('+value+')');
      } else {
        parent[prop] = values[prop];
      }
    }
  }
  
  var installChildren = function (parentCode) {
    var parent = inodes[parentCode];
    if (!parent) {
      return;
    }
    var values = children[parentCode];
    for (var prop in values) {
      var childCode = values[prop];
      if (typeof childCode === 'number') {
        var child = inodes[childCode];
      } else {
        if (childCode.indexOf(' child')>=0) {
          child = externalItems[pj.beforeChar(childCode,' ')];
          child.__parent = parent;                               
        } else {
          child = externalItems[childCode];
        }
      }
      parent[prop] = child;
    }
  }
  
  var buildChain = function (chain) {
    chain.reverse();
    var cx;
    chain.forEach(function (code) {
      if (typeof code === 'number') {
        var node = inodes[code];
        if (!node) {
          node = Object.create(cx);
          inodes[code] = node;
        }
        cx = node;
      } else {
        cx = externalItems[code];
        if (!cx) {
           pj.error('deserialize','unexpected condition'); 
          cx = pj.Object.mk(); //temporary; 
        }
      }
    });
  }
  var eln = externals.length;
  for (var i=0;i<eln;i++) {
    var rs = resolveExternalReference(externals[i]);
    if (rs !== undefined) {
      externalItems['x'+i] =rs;
    } 
  }
  x.chains.forEach(buildChain);
  for (var acode in arrays) {
    var code = Number(acode);
    var a = pj.Array.mk();
    var aln = arrays[code];
    if (aln) {
      a.length = arrays[code];
    }
    inodes[code] = a;
  };
  var ln = atomicProperties.length;
  for (i=0;i<ln;i++) {
    installAtomicProperties(i);
    installChildren(i);
  }
  return inodes[0];
 
}





//end extract
//})(prototypeJungle);
/* This installs components implemented by js scripts. The scripts should have the form
 * pj.require(file1,file2...fileN,function (v1,v2... vn)){...return value});. Such code builds an item, and returns it, utilizing
 * the items already defined in the dependencies file1... filen, bound to v1... vn.
 * How it works: each script goes through 3 stages: loading, recording dependendencies, and installation.
 *  as soon as a script is loaded, its contained pj.require is executed in a mode which records its dependendcies, but does not run its funcdtion
 *  Those depedencies are, in turn loaded, and their dependencies recorded
 *  pj.requireEdges holds the graph of dependencies
 *  Once the graph is complete, the requires are installed from bottom up; that is each f(v1,...vn) is run with values
 *  that have already been computed for file1.. filen
 */
    

/* first, the error handler (throw doesn't work, since much of the activity is invoked from async callbacks) */

var debugInstall = false;

var installDebug = function () {
  if (debugInstall) {
    debugger;
  }
}
pj.installError = function (erm) {
  debugger;
  pj.afterInstall(erm);
}
pj.loadedUrls = [];
pj.getCache = {};

pj.getPending = {};
var httpGetForInstall = function (iurl,cb) {
  pj.log('install','httpGet',iurl);
  var cache = pj.getCache[iurl];
  var rs;
  if (cache) {
    installDebug();
    cb(undefined,cache);
    return;
  }
  if (pj.getPending[iurl]) {
    return;
  }
  pj.getPending[iurl] =true;
  pj.log('install',"getting ",iurl);

  var url = pj.mapUrl(iurl);
  var request = new XMLHttpRequest();
  
  request.open('GET',url, true);// meaning async
  request.onload = function() {
    pj.log('install','httpGet loaded',iurl);
    if (cb) {
      if (request.status >= 200 && request.status < 400) {
      // Success!
       rs = request.responseText;
       pj.log('install',"GOT ",iurl);
       delete pj.getPending[iurl];
       pj.loadedUrls.push(iurl);
       pj.getCache[iurl] = rs;
       cb(undefined,rs);
        
      } else {
        pj.installError('Failed to load '+iurl);
      }
      // We reached our target server, but it returned an error
    }
  };
  
  request.onerror = function() {
      pj.installError('Failed to load '+iurl);
  };
  request.send();
}



pj.installedItems = {};
pj.loadedScripts = {};
pj.evaluatedScripts = {};

var resetLoadVars = function () {
  pj.evaluatedScripts = {};
  pj.requireActions = {};
  pj.requireEdges = {}; // maps urls of nodes to urls of their children (dependencies listed in the pj.require call)
}

var installRequire;


var dependenciesEvaluated = function (src) {
  if ((src !== pj.requireRoot) && !pj.evaluatedScripts[src]) {
    return false;
  }
  var dependencies = pj.requireEdges[src];
  var ln = dependencies?dependencies.length:0;
  for (var i=0;i<ln;i++) {
    if (!dependenciesEvaluated(dependencies[i])) {
      pj.log('install','missing dependency',dependencies[i]);
      return false;
    }
  }
  return true;
}


var installRequires;

// the requester is the url of the script in which pj.require of these sources occurred
var require1 = function (requester,sources) {
  installDebug();
  var numRequires = sources.length;
  var numLoaded = 0;
  var afterLoads = [];
  var sourceAction = function (erm,src,rs) {
    //if (!pj.loadedScripts[src]) {
  //  if (!pj.installedItems[src]) {
    if (pj.endsIn(src,'.js')) {
        pj.loadedScripts[src] = rs;
        pj.currentRequire = src;
        pj.log('install','RECORDING DEPENDENCIES FOR',src);
        if (pj.catchInstall) {
          try {
            eval(rs);
            pj.evaluatedScripts[src] = rs;
          } catch (e) {
            pj.installError(e.message);
            return;
          }
        } else {
          eval(rs);
          pj.evaluatedScripts[src] = rs;
        }
        pj.log('install','RECORDED DEPENDENCIES FOR',src);
    } else if (pj.endsIn(src,'.json')) {
        pj.installedItems[src] = JSON.parse(rs);
    } else if (pj.endsIn(src,'.item')) {
      var prs = JSON.parse(rs);
      pj.loadedScripts[src] = prs;
      var requires = prs.__requires;
      require1(src,requires);
    }
    if (dependenciesEvaluated(pj.requireRoot)) {
         pj.log('install','INSTALLING REQUIRES AFTER',src);
         installRequires();
    }
  }
  pj.requireEdges[requester] = [].concat(sources);
  sources.forEach(function (src) {
    var script  = pj.loadedScripts[src];
    if (script) {
      sourceAction(undefined,src,script);
      return;
    }
    httpGetForInstall(src,function (erm,rs) {
      //delete pj.scriptsPendingLoad[src];
      sourceAction(erm,src,rs);
    });
  });
}

var installErrorIndicator = {};
pj.catchInstall = true; // false is useful for debugging, but should be on for normal usage

installRequire = function (src) {
  installDebug();
  var val = pj.installedItems[src];
  if (val) {
    return val;
  }
  var children = pj.requireEdges[src];
  var values = children?children.map(installRequire):[];
  if (values.indexOf(installErrorIndicator) !== -1)  {
    return installErrorIndicator;
  }
  if (pj.endsIn(src,'.item')) {
    val = pj.deserialize(pj.loadedScripts[src]);//pj.loadedItem);;
  } else {
    var action = pj.requireActions[src];
    if (!action) {
      installDebug();
    }
    pj.log('install','RUNNING ACTIONN',src);
    if (pj.catchInstall) {
      try {
        val = action.apply(undefined,values);
      } catch (e) {
        pj.installError(e.message);
        return installErrorIndicator;
      }
    } else {
      val = action.apply(undefined,values);
    }
  }
  pj.installedItems[src]= val;
  val.__sourceUrl = src;
  return val;
}


var installRequires1 = function (src) {
  var dependencies = pj.requireEdges[src];
  if (dependencies) {
    dependencies.forEach(installRequires1);
  }
  return installRequire(src);
}

var installRequires = function () {
  var val = installRequires1(pj.requireRoot);
  pj.log('install','AFTER INSTALL');
  pj.afterInstall(undefined,val);
}

pj.require = function () {
  var cr = pj.currentRequire;
  installDebug();
  var sources,numRequires,src,i;
  numRequires = arguments.length-1;
  var sources = [];
  for (i=0;i<numRequires;i++) {
    var src = arguments[i];
    sources.push(src);
  }
  pj.requireActions[pj.currentRequire] = arguments[numRequires];
  if (numRequires === 0 && (pj.currentRequire === pj.requireRoot)) {
    installRequires();
  } else {
    require1(pj.currentRequire,sources);
  }
}

pj.loadItem = function (src) {
  httpGetForInstall(src,function (erm,rs) {
    //installDebug();
    var prs = JSON.parse(rs);
    pj.loadedScripts[src] = prs;
    var requires = prs.__requires;
   require1(src,requires);
    
  })
}

pj.install = function (src,cb) {
  //installDebug();
  var rs = pj.installedItems[src];
  if (rs) {
    cb(undefined,rs);
    return;
  }
  resetLoadVars();
  pj.requireRoot = src;
  pj.currentRequire = src;
  pj.afterInstall = cb;
  if (pj.endsIn(src,'.item')) {
    pj.loadItem(src);
    return;
  }
  var scr = pj.loadedScripts[src];
  if (scr) {
    eval(scr);
    return;
  }
  httpGetForInstall(src,function (erm,rs) {
    pj.loadedScripts[src] = rs;
    eval(rs);
  });
}




/* A normal setup for managing pj items,  is for there to be a current item which
 * is being manipulated in a running state, a state which contains various other items installed from external sources.
 * Each node in such a set up can be assigned a path, call it an 'xpath' (x for 'possibly external'). The first element
 * of this path is either '.' (meaning the current item), '' (meaning pj itself)  or the url of the source of the item.
 * pj.xpathOf(node,root) computes the path of node relative to root, and pj.evalXpath(root,path) evaluates the path
 */


pj.xpathOf = function (node,root) {
  var rs = [];
  var current = node;
  var url,name;
  while (true) {
    if (current === undefined) {
      return undefined;
    }
    if (current === root) {
      rs.unshift('.');
      return rs;
    }
    if (current === pj) {
      rs.unshift('');
      return rs;
    }
    //var sourceRelto = current.__get('__sourceRelto');
    //var sourcePath = current.__get('__sourcePath')
    var sourceUrl = current.__get('__sourceUrl');
    //if (sourcePath) {
    if (sourceUrl) {
     // url = pj.fullUrl(sourceRelto,sourcePath); ///sourceRepo + '/' + current.__sourcePath;
      rs.unshift(sourceUrl);
      return rs;
    }
    var name = pj.getval(current,'__name');
    if (name!==undefined) {// if we have reached an unnamed node, it should not have a parent either
      rs.unshift(name);
    }
    current = pj.getval(current,'__parent');
  }
  return undefined;
} 

pj.evalXpath = function (root,path) {
  var p0,current,ln,prop,i;
  if (!path) {
    pj.error('No path');
  }
  p0 = path[0];
  if (p0 === '.') {
    var current = root;
  } else if (p0 === '') {
    current = pj;
  } else { 
    current = pj.installedItems[p0];
  }
  ln=path.length;
  for (i=1;i<ln;i++) {
    prop = path[i];
    if (current && (typeof(current) === 'object')) {
      current = current[prop];
    } else {
      return undefined; 
    }
  }
  return current;
}

pj.activeConsoleTags = ['error'];//,'drag','util','tree'];

pj.addConsoleTag = function (tag) {
  pj.addToArrayIfAbsent(pj.activeConsoleTags,tag);
}

pj.removeConsoleTag = function (tag) {
  pj.removeFromArray(pj.activeConsoleTags,tag);
}
  

pj.log = function (tag) {
  if (typeof(console) === 'undefined') return;
  if ((pj.activeConsoleTags.indexOf('all')>=0) || (pj.activeConsoleTags.indexOf(tag) >= 0)) { 
    // transform arguments list into array
    var aa = [].slice.call(arguments);
    console.log(tag,aa.join(', '));
  }
};


pj.startTime = Date.now()/1000;
// time log, no tag


pj.resetClock = function () {
  pj.startTime = Date.now()/1000;
}

pj.elapsedTime = function () {
  var now = Date.now()/1000;
  var elapsed = now-pj.startTime;
  return  Math.round(elapsed * 1000)/1000;
}

pj.tlogActive = false;
pj.tlog = function () {
  var elapsed,aa,rs;
  if (!pj.tlogActive) {
    return;
  }
  if (typeof(console) === 'undefined') return;
  elapsed = pj.elapsedTime();
  // turn arguments into array
  aa = [].slice.call(arguments);
  rs = 'At '+elapsed+': '+aa.join(', ');
  console.log(rs);
  return;
}

return pj;

})();



// minimal utilities needed for a PrototypeJungle web page (used in the minimal and firebase_only modules)



pj.endsIn = function (string,p) {
  var ln = string.length;
  var  pln = p.length;
  var es;
  if (pln > ln) return false;
  es = string.substr(ln-pln);
  return es === p;
}

pj.beginsWith = function (string,p) {
  var ln = string.length;
  var pln = p.length;
  var es;
  if (pln > ln) return false;
  es = string.substr(0,pln);
  return es === p;
}


pj.ready = function (fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}


pj.httpGet = function (iurl,cb) { // there is a fancier version in core/install.js
/* from youmightnotneedjquery.com */
  var url = pj.mapUrl?pj.mapUrl(iurl):iurl;
  var request = new XMLHttpRequest();
  request.open('GET',url, true);// meaning async
  request.onload = function() {
    if (cb) {
      if (request.status >= 200 && request.status < 400) {
      // Success!
        cb(undefined,request.responseText);
      } else {
        cb('http GET error for url='+url);
      }
      // We reached our target server, but it returned an error
    }
  };
  
  request.onerror = function() {
      cb('http GET error for url='+url);
  };
  request.send();
}


var ff = () => 33;
pj.parseQuerystring = function(){
    var nvpair = {};
    var qs = window.location.search.replace('?', '');
    var pairs = qs.split('&');
    pairs.forEach(function(v){
      var pair = v.split('=');
      if (pair.length>1) {
        nvpair[pair[0]] = pair[1];
      }
    });
    return nvpair;
}