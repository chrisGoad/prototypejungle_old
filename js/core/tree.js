// Copyright 2019 Chris Goad
// License: MIT

// tree operations

codeRoot.__builtIn = 1;

// constructors for nodes 

codeRoot.Object.mk = function (src) {
  let rs = Object.create(ObjectNode);
  if (src) {
    extend(rs,src);
  }
  return rs;
}

codeRoot.Array.mk = function (array) {
  let rs = Object.create(codeRoot.Array);
  if (array===undefined) {
    return rs;
  }
  let ln;
  let numerical = typeof array === 'number';
  if (numerical) {
    ln = array;
  } else {
    ln = array.length;
   }
  for (let i=0;i<ln;i++) {
    if (numerical) {
      rs.push(undefined);
    } else {
      let child = array[i];
      if (child && (typeof child === 'object')) {
        child.__parent = rs;
        child.__name = String(i);
      }
      rs.push(child);
    }
  }
  return rs;
}


//  make the same method fn work for Objects, Arrays
const nodeMethod = function (name,func) {
  codeRoot.Array[name] = codeRoot.Object[name] = func;
}



// only strings that pass this test may  be used as names of nodes
// numbers can be used as labels
export const checkName = function (string) {
  if ((string === undefined) || (!string.match)) { 
    error('Bad argument');
  }
  if (string==='') {
    return false;
  }
  if (string==='$') {
    return true;
  }
  return Boolean(string.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/));
}
/* A path is a sequence of names indicating a traversal down a tree. It may be
 * represented as a '/' separated string, or as an array.
 * When string path starts with '/' (or an array with  empty string as 0th element)
 * this means start at pj, regardless of origin (ie the path is absolute rather than relative).
 */

const checkPath = function (string,allowFinalSlash) {
  let strSplit = string.split('/');
  let ln = strSplit.length;
  let  i = 0;
  if (ln===0) {
    return false;
  }
  if (allowFinalSlash && (strSplit[ln-1] === '')) {
    ln = ln - 1;
  }
  for (;i<ln;i++) {
    let pathElement = strSplit[i];
    if (((i>0) || (pathElement !== '')) && // '' is allowed as the first  element here, corresponding to a path starting with '/'
       !checkName(pathElement)) {
      return false;
    }
  }
  return true;
}


const evalPath = function (ipth,iorigin) {
  let pth,current,startIdx;
  let origin = iorigin?iorigin:root;
  if (!ipth) {
    return undefined;//origin; // it is convenient to allow this option
  }
  if (typeof ipth === 'string') {
    pth = ipth.split('/');
  } else {
    pth = ipth;
  }
  let ln = pth.length;
  if (ln===0) {
    return origin;
  }
  if (pth[0]==='') {
    current = codeRoot;
    startIdx = 1;
  } else {
    current = origin;
    startIdx = 0;
  }
  for (let idx=startIdx;idx<ln;idx++) {
    let prop = pth[idx];
    if (current && (typeof current === 'object')) {
      current = current[prop];
    } else {
      return undefined;
    }
  }
  return current;
}

// omits initial "/"s. Movethis?
const pathToString = function (p,isep) {
  let rs,ln,e;
  let sep = isep?isep:"/";
  ln = p.length;
  if (sep===".") {
    rs = p[0];
    for (let i=1;i<ln;i++) {
      e = p[i];
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
    if (p[0]===sep) {
      return rs.substr(1);
    }
  }
  return rs;
}

/*
 * Return the path from root, or if root is undefined the path up to where parent is undefined. In the special case where
 * root === codeRoot, the path begins with '' (so that its string form will start with '/')
 */

const pathOf = function (node,root) {
  let rs = [];
  let current = node;
  while (true) {
    if (current === undefined) {
      //return undefined; // change cg 8/2/18 
      return root?undefined:rs;
    }
    if (current=== root)  {
      if (root === codeRoot) {
        rs.unshift('');
      }
      return rs;
    }
    let name = getval(current,'__name');
    // if we have reached an unnamed node, it should not have a parent either
    if (name!==undefined) {
      rs.unshift(name);
    }
    current = getval(current,'__parent');
  }
}

const stringPathOf = function (node,root,sep = '/') {
  let path = pathOf(node,root);
  return path!==undefined?path.join(sep):undefined;
}



nodeMethod('__pathOf',function (root) {return pathOf(this,root);});


const isObject = function (o) {
  return o && (typeof o === 'object');
}


const isAtomic = function (x) {
  return !isObject(x);
}
  

const isNode = function (x) { 
  return ObjectNode.isPrototypeOf(x) || ArrayNode.isPrototypeOf(x);
}


// creates Objects if missing so that path pth descending from this exists

const createPath = function (node,path) {
  let current = node;
  let child,next;
  path.forEach(function (prop) {
    // ignore '' ; this means that createPath can be used on codeRoot
    if (prop === '') {
      return;
    }
    if (!checkName(prop)) {
      error('Ill-formed __name "'+prop+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
    }
    if (!current.__get) {
      error('Unexpected');
    }
    child = current.__get(prop);
    
    if (child === undefined) {
      next = codeRoot.Object.mk();
      current.set(prop,next);
      current = next;
    } else {
      if (!isNode(child)) {
        error('Conflict in createPath ',path.join('/'));
      }
      current = child;
    }
  });
  return current;
}
  

// gets own properties only
const getval = function (node,prop) {
  if (!node) {
    error('null v');
  }
  if (node.hasOwnProperty(prop)) {
    return node[prop];
  }
}


const separateFromParent = function (node) {
  let parent = getval(node,'__parent');
  if (parent) {
    let name = node.__name;
    if (Array.isArray(parent)) {
      parent[name] = undefined;
    } else {
      delete parent[name];
    }
  }
}

// assumes node[__name] is  child, or will be child. lifts if needed.
const adopt = function (node,name,ichild) {
  let child;
  if (!isObject(ichild)) {
    return;
  }
  if (isNode(ichild)) {
    child = ichild;
    separateFromParent(child);
  } else {
    child = lift(ichild);
  } 
  child.__name = name;
  child.__parent = node;
}

export let preSetChildHooks = [];
export let setChildHooks = [];

/* A property k of a node is watched if the field annotation "Watched" is set for that property. 
 * For watched fields, a change event is emitted of the form {id:change node:node property:__name}
 */

const setChild = function (node,name,child) {
  preSetChildHooks.forEach(function (fn) {fn(node,name);});
  adopt(node,name,child);
  node[name] = child;
  setChildHooks.forEach(function (fn) {
    fn(node,name,child);
  });
  
  let watched = node.__Watched;
  if (watched && watched[name]) {
  //if (node.__watched && node['__'+name+'_watched']) {
    let event = Event.mk('change',node);
    event.property=name;
    event.emit();
  }
}
/*
 * Fields (aka properties) can be annotated. More description needed here.
 */

ObjectNode.__getOwnFieldAnnotation = function (annotationName,prop) {
  let annotations = this.__get(annotationName);
  if (annotations === undefined) {
    return undefined;
  }
  return annotations[prop];
}



ObjectNode.__getFieldAnnotation = function (annotationName,prop) {
  let cp = this;
  while (true) {
    if (cp === ObjectNode) {
      return undefined;
    }
    let rs = cp.__getOwnFieldAnnotation(annotationName,prop);
    if (rs !== undefined) {
      return rs;
    }
    cp = Object.getPrototypeOf(cp);
  }
}
  

ObjectNode.__setFieldAnnotation = function (annotationName,prop,v) {
  let annotations = this.__get(annotationName);
  if (annotations === undefined) {
    annotations = this.set(annotationName,ObjectNode.mk());
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
 
const defineFieldAnnotation = function (functionName) {
  let annotationName = '__'+functionName;
  ObjectNode['__getOwn'+functionName] = function (k) {
    return this.__getOwnFieldAnnotation(annotationName,k);
  };
  ObjectNode['__get'+functionName] = function (k) {
    return this.__getFieldAnnotation(annotationName,k);
  };
  ObjectNode['__set'+functionName] = function (k,v) {
    return this.__setFieldAnnotation(annotationName,k,v);
  };
  ArrayNode['__get'+functionName] = function () {}
}
  
defineFieldAnnotation('Watched');

const watch = function (node,prop) {
  node.__setWatched(prop,1);
}

/* set has several variants
 * :
 *
 * x.set(name,v)  where name is a simple name (no /'s). This causes v to be the new child of x if v is a node, other wise just does x[name] = v
 *
 * x.set(path,v) where path looks like a/b/../name. This creates the path a/b/... if needed and sets the child name to v. Whatever part of the path
 * is already there is left alone.
 *
 * x.set(source)  extends x by source, in the sense of jQuery.extend in deep mode
 */

 
// returns val
ObjectNode.set = function (key,val) {
  let idx,path,name,parent;
  if (arguments.length === 1) {
    extend(this,key);
    return this;
  }
  if (typeof key ==='string') {
    idx = key.indexOf('/');
  } else { 
    idx = -1;
  }
  if (idx >= 0) {
    path = key.split('/');
    name = path.pop();
    parent = createPath(this,path);
  } else {
    parent = this;
    name = key;
  }
  if (!checkName(name)) {
    error('Ill-formed name "'+name+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
  }
  setChild(parent,name,val);
  return val;
}


ArrayNode.set = function (key,val) {
  setChild(this,key,val);
  return val;
}

// adopts val below this if it is not already in a tree,ow just refers
const setIfExternal = function (parent,name,val) { 
  let tp = typeof val;
  if ((tp === 'object') && val && val.__get('__parent')) {
    parent[name] = val;
  } else {
    parent.set(name,val);
  }
  return val;
}

const setIfMissing = function (parent,prop,factory) {
  let rs = parent[prop];
  if (!rs) {
    rs = factory();
    parent.set(prop,rs);
  }
  return rs;
}

// Unless alwaysReplace is set, this similar to jquery.extend in deep mode: it merges source into dest. Note that it does not include properties from the prototypes.
// 
const extend = function (dest,source,merge) {
  let existingVal,newVal;
  if (!source) {
    return dest;
  }
  for (let prop in source) {
    if (source.hasOwnProperty(prop)) {
      newVal = lift(source[prop]);
      if (newVal === undefined) {
        continue;
      }
      if (merge) {
        existingVal = dest[prop];
        // merge if existingVal is a Object; replace otherwise
        if (existingVal && ObjectNode.isPrototypeOf(existingVal) && ObjectNode.isPrototypeOf(newVal)) {
          extend(existingVal,newVal);
        } else {
          dest.set(prop,newVal);
        }
      } else {
        dest.set(prop,newVal);
      }
    }
  }
  return dest;
}


const arrayToObject = function (aarray) {
  let rs = {};
  aarray.forEach(function (prop) {rs[prop] = 1;});
  return rs;
}

/*
let dd = {f:function (n){return n*3}};
let aa = {a:2,b:['a','b'],p:geom.Point.mk(3,4),f:function (n) {return n+n;}}
setProperties(dd,aa,['a','b','p','f']);
*/
// transfer properties from source. 
const setProperties = function (dest,source,props,fromOwn,dontCopy) {
  if (!source) {
    return;
  }
  if (!dest) {
    error('Bad arguments')
  }
  let destIsPJObject =  ObjectNode.isPrototypeOf(dest);
  if (props) {
    props.forEach(function (prop) {
      let sourceVal = fromOwn?getval(source,prop):source[prop];
      if (sourceVal !== undefined) {
        let srcIsTreeProp = false;
        let srcIsNode = isNode(sourceVal);
        if (srcIsNode) {
           srcIsTreeProp = treeProperty(source,prop,false,fromOwn);
        }
        let dontCopyVal = dontCopy || (!srcIsNode) || (!srcIsTreeProp);
        let sourceCopy = dontCopyVal?sourceVal:deepCopy(sourceVal);
        if (destIsPJObject && srcIsNode && srcIsTreeProp) {
          dest.set(prop,sourceCopy);
        } else {
          dest[prop] = sourceCopy;  
        }
      }
    });
  } 
  return dest;
}

const setPropertiesFromOwn = function (dest,source,props,dontCopy) {
  return setProperties(dest,source,props,true,dontCopy);
}

const setPropertiesIfMissing = function (dest,source,props,fromOwn) {
  if (!source) {
    return;
  }
  if (!dest) {
    error('Bad arguments')
  }
  if (props) {
    props.forEach(function (prop) {
      let sourceVal = fromOwn?getval(source,prop):source[prop];
      let destVal = fromOwn?getval(dest,prop):dest[prop];
      if ((sourceVal !== undefined) && (destVal === undefined) && !isObject(sourceVal)) {
        dest.set(prop,source[prop]);
      }
    });
  } 
  return dest;
}

// only for atomic values
const getProperties = function (source,props) {
  let rs = ObjectNode.mk();
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



ArrayNode.toArray = function () {
  let rs = [];
  this.forEach(function (e) {rs.push(e);});
  return rs;
}
const arrayPush = Array.prototype.push;
const arrayUnshift = Array.prototype.unshift;
const arraySplice = Array.prototype.splice;// only used in plain form

let addToArrayHooks = [];

let setNameInArray = function (array,child,n) { //called after the push
   if (isNode(child)) {
     child.__name = n;
     child.__parent = array;
  } else if (child && (typeof child==='object')) {
    error('Attempt to add non-node object to an Array');
  }
};

ArrayNode.push = function (element) {
  arrayPush.call(this,element);
  setNameInArray(this,element,this.length-1);
  addToArrayHooks.forEach((fn) => {fn(this,element);});
  return this.length;
}


ArrayNode.plainPush = function (element) {
  arrayPush.call(this,element);
}

ArrayNode.unshift = function (element) {
  arrayUnshift.call(this,element);
  setNameInArray(this,element,0);
  let ln = this.length;
  for (let i=1;i<ln;i++) {
    this[i].__name = i;
  }
  addToArrayHooks.forEach((fn) => {fn(this,element);});
  return this.length;
}

ArrayNode.plainUnshift = function (element) {
  arrayUnshift.call(this,element);
}



ArrayNode.plainSplice = function (start,deleteCount,element) {
  if (element !== undefined) {
    arraySplice.call(this,start,deleteCount,element);
  } else {
    arraySplice.call(this,start,deleteCount);
  }
}

ArrayNode.splice = function (start,deleteCount,element) {
  if (element !== undefined) {
    arraySplice.call(this,start,deleteCount,element);
    setNameInArray(this,element,start);
  } else {
    arraySplice.call(this,start,deleteCount);
  }
  let ln = this.length;
  for (let i=start;i<ln;i++) {
    this[i].__name = i;
  }
 if (element) {
    addToArrayHooks.forEach((fn) => {fn(this,element);});
 }
  return this.length;
}

  
ArrayNode.concat = function (elements) {
  let rs = ArrayNode.mk();
  this.forEach((element) => rs.push(element));
  elements.forEach((element) => rs.push(element));
  return rs;
}

ArrayNode.copy = function () {
  return this.concat([]);
}

ArrayNode.concatR = function (elements) {
  elements.forEach((element) => this.push(element))
  return this;
}

/* utilities for constructing Nodes from ordinary objects and arrays
 * recurses down to objects that are already nodes
 * o is an array or an object
 */

const toNode1 = function (parent,name,o) {
  let tp = typeof o;
  let  rs;
  if ((o === null) || (tp !== 'object')) {
    parent[name] =  o;
    return;
  }
  if (isNode(o)) {
    rs = o;
  } else {
    if (Array.isArray(o)) {
      rs = toArray(o,null);
    } else {
      rs = toObject(o,null);
    }
  }
  rs.__parent = parent;
  rs.__name = name;
  parent[name] = rs;
}

// transfer the contents of ordinary object o into idst (or make a new destination if idst is undefined)
const toObject= function (o,idest) {
  let dest,oVal;
  if (ObjectNode.isPrototypeOf(o)) {
    return o; // already a Object
  }
  if (idest) {
    dest = idest;
  } else {
    dest = ObjectNode.mk();
  }
  for (let prop in o) {
    if (o.hasOwnProperty(prop)) {
      oVal = o[prop];
      toNode1(dest,prop,oVal); 
    }
  }
  return dest;
}

const toArray = function (array,idest) {
  let dest;
  if (idest) {
    dest = idest;
  } else {
    dest = ArrayNode.mk();
  }
  array.forEach(function (element) {   
    dest.push(toNode(element));
  });
  return dest;
}

const toNode = function (o) {
  if (isNode(o)) {
    // idempotent
    return o;
  }
  if (Array.isArray(o)) {
    return toArray(o);
  } else if (o && (typeof o === 'object')) {
    return toObject(o);
  } else {
    return o;
  }
}

const lift = toNode;




// Some utilities for iterating functions over trees.

// internal __properties are excluded from the iterators and recursors 

let internalProps = {'__parent':1,'__protoChild':1,'__value__':1,'__hitColor':1,'__chain':1,'__copy':1,__name:1,widgetDiv:1,
  __protoLine:1,__inCopyTree:1,__headOfChain:1,__element:1,__domAttributes:1};

const internal = function (__name) {
   return internalProps[__name];
}


// a proper element of the tree: an own property with the right parent link. If includeLeaves, then atomic own properties are included too

const treeProperty = function (node,prop,includeLeaves,knownOwn) {
  let child;
  if ((!knownOwn && !node.hasOwnProperty(prop)) ||  internal(prop)) {
    return false;
  }
  child = node[prop];
  if (isNode(child)) {
    return child.__parent === node;
  } else {
    return includeLeaves?(typeof child !== 'object'):false;
  }
}


const treeProperties = function (node,includeLeaves) {
  let rs = [];
  let child,names,ln,i;
  if (ArrayNode.isPrototypeOf(node)) {
    ln = node.length;
    for (i = 0;i < ln;i++) {
      child = node[i];
      if (includeLeaves) {
        rs.push(i);
      } else if (isNode(child) && (child.__parent === node)) {
        rs.push(i);
      }
    }
    return rs;
  }
  names = Object.getOwnPropertyNames(node);
  names.forEach(function (name) {
    if (treeProperty(node,name,includeLeaves,true)) {
      rs.push(name);
    }
  });
  return rs;
}
  
// apply fn(node[prop],prop,node) to each non-internal own property p. 
const mapOwnProperties = function (node,fn) {
  let ownprops = Object.getOwnPropertyNames(node);
  ownprops.forEach(function (prop) {
     if (!internal(prop))  { 
      fn(node[prop],prop,node);
    }
  });
  return node;
}

const ownProperties = function (node) {
  let rs = [];
  mapOwnPropeties(node,function (child,prop) {
    rs.push(prop);
  });
  return rs; 
}

// apply fn(node[p],p,node) to each treeProperty p  of node. Used extensively for applying functions through a tree
const forEachTreeProperty = function (node,fn,includeLeaves) {
  let perChild = function (value,prop) {
     if (treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       fn(node[prop],prop,node);
    }
  }
  if (ArrayNode.isPrototypeOf(node)) {
    node.forEach(perChild);
  } else {
    let ownprops = Object.getOwnPropertyNames(node);
    ownprops.forEach(perChild.bind(undefined,undefined));
  }
  return this;
}

const forSomeTreeProperty = function (node,fn,includeLeaves) {
  let found = undefined;
  let perChild = function (value,prop) {
     if (treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       let rs = fn(node[prop],prop,node);
       if (rs) {
         found = node[prop];
       }
    }
  }
  if (ArrayNode.isPrototypeOf(node)) {
    node.some(perChild);
  } else {
    let ownprops = Object.getOwnPropertyNames(node);
    ownprops.some(perChild.bind(undefined,undefined));
  }
  return found;
}

const forEachAtomicProperty = function (node,fn) {
  let perChild = function (notUsed,prop) {
    let value = node[prop];
    let tp = typeof value;
    if ((value === null) || ((tp !== 'object')  && (tp !== 'function'))) {
       fn(node[prop],prop,node);
    }
  }
  if (ArrayNode.isPrototypeOf(node)) {
    node.forEach(perChild);
  } else {
    let ownprops = Object.getOwnPropertyNames(node);
    ownprops.forEach(perChild.bind(undefined,undefined));
  }
  return this;
}

const forEachDescendant = function (fn,node=root) {
  fn(node);
  forEachTreeProperty(node,function (child) {
    forEachDescendant(fn,child);
  })
}


const crossTreeLinks = function (onode=root) {
  let accum = [];
  let recurse = function (node) {
    if (node.__name === 'prototypes') { // === stopAt) {
      return;
    }
    let nodePath = pathOf(node,root);
    let props = Object.getOwnPropertyNames(node);
    let prop;
    for (prop in node) {
      if (internal(prop))  {
        continue;
      }
      let child = node[prop];
      if (!isNode(child)) {
         continue;
      }
      if (treeProperty(node,prop,false,true)) {
        recurse(child);
      } else {
        let isOwn = node.hasOwnProperty(prop);
        // a cross tree link inherited from an external object counts as a cross tree link
        if (!isOwn) {
          let proto =  Object.getPrototypeOf(node);
          let isProtoOwn = proto.hasOwnProperty(prop);
          if (!(isProtoOwn && proto.__sourceUrl)) {
            continue;
          }
        }
        let childPath = pathOf(child,root);
        if (childPath) {
          let triple = [nodePath,prop,childPath];
          accum.push(triple);
        } else {
          debugger;// keep; child is not in the tree
        }
      }
    };
  }
  recurse(onode);
  return accum;
}
           
      
    


const installLinks = function (links) {
  links.forEach(function (link) {
    let node = evalPath(link[0]);
    let prop = link[1];
    let child = evalPath(link[2]);
    if (node && child) {
      node[prop] = child;
    }
  });
}
  




const forSomeDescendant = function (node,fn) {
  if (fn(node)) {
    return node;
  }
  forSomeTreeProperty(node,function (child) {
    return forSomeDescendant(child,fn);
  })
}




const everyTreeProperty = function (node,fn,includeLeaves) { 
  let ownprops = Object.getOwnPropertyNames(node);
  return ownprops.every(function (prop) {
     if (treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return 1;
    }
  });
}


const someTreeProperty = function (node,fn,includeLeaves) { 
  let ownprops = Object.getOwnPropertyNames(node);
  return ownprops.some(function (prop) {
     if (treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return false;
    }
  });
}

 // if node itself has gthe propety, return true
const ancestorHasOwnProperty  = function (node,p) {
  let cv = node;
  while (cv) {
    if (cv.__get(p)) {
      return true;
    }
    cv = cv.__get('__parent');
  }
  return false;
}

ObjectNode.__inCore = function () {
  return ancestorHasOwnProperty(this,'__builtIn');
}

/* used eg for iterating through styles.
 * apply fn(node[p],p,node) to each atomic property of node, including properties defined in prototypes, but excluding
 * those defined in core modules.
 * sofar has the properties where fn has been called so far (absent except in the recursive call)
 */

const mapNonCoreLeaves = function (node,fn,allowFunctions,isoFar) {
  let soFar = isoFar?isoFar:{};
  if (!node) {
    error('Bad argument');
  }
  if (!node.__inCore || node.__inCore()) {
    return;
  }
  let op = Object.getOwnPropertyNames(node);
  op.forEach(function (prop) {
    let child,childType;
    if (soFar[prop]) {
      return;
    }
    if (!treeProperty(node,prop,true,true)) {
      return true;
    }
    soFar[prop] = 1;
    child = node[prop];
    childType = typeof child;
    if ((child && (childType === 'object' ))||((childType==='function')&&(!allowFunctions))) {
      return;
    }
    fn(child,prop,node);
  });
  let proto = Object.getPrototypeOf(node);
  if (proto) {
    mapNonCoreLeaves(proto,fn,allowFunctions,soFar);
  }
}
//reverts the atomic properties except those given
ObjectNode.__revertToPrototype = function (exceptTheseProperties) {
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

ObjectNode.__differsFromPrototype =  function (exceptTheseProperties) {
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
  }
  return false;
}


const deepApplyFun = function (node,fn) {
  fn(node);
  forEachTreeProperty(node,function (c) {
    deepApplyFun(c,fn);
  });
}
  


const deepDeleteProps = function (node,props) {
  deepApplyFun(node,function (ch) {
    props.forEach(function (p) {
      delete ch[p];
    });
  });
}



const deepDeleteProp = function (inode,prop) {
  deepApplyFun(inode,function (node) {
    delete node[prop]
  });
}

let findResult = [];
const findDescendant = function (node,fn) {
  const recurser = function (inode) {
    if (fn(inode)) {
      findResult[0] = inode;
      throw findResult;
    } else {
      forEachTreeProperty(inode,function (child) {
        recurser(child);
      });
    }
  }
  try {
    recurser(node);
  } catch(e) {
    if (e === findResult) {
      return e[0];
    } 
  }
}

const descendantWithProperty = function (node,prop) {
  return findDescendant(node,function (x) {
    return x[prop] !== undefined;
  });
}

const findAncestor = function (node,fn,excludeArrays) {
  let excluded;
  if (node===undefined) {
    return undefined;
  }
  excluded = excludeArrays && ArrayNode.isPrototypeOf(node);
  if ((!excluded) && fn(node)) {
    return node;
  }
  let parent = node.__get('__parent');
  return findAncestor(parent,fn,excludeArrays);
}



const findTopAncestor = function (inode,fn,excludeArrays) {
  let rs = undefined;
  const candidate = function (node) {
    let excluded = excludeArrays && ArrayNode.isPrototypeOf(node);
    return (!excluded) && fn(node);
  }
  let node = inode;
  while (node !== undefined) {
    if (candidate(node)) {
      rs = node;
      //return rs;
    }
    node = node.__get('__parent');
  }
  return rs;
}

const isDescendantOf = function (inode,ancestor,notTopCall) {
  let node = inode;
  if (node === undefined) {
    return undefined;
  }
  if ((node === ancestor) && notTopCall)  {
    return true;
  }
  return isDescendantOf(node.__get('__parent'),ancestor,true);
}

const ancestorThatInheritsFrom = function (node,proto) {
  return findAncestor(node,function (x) {
    return proto.isPrototypeOf(x)
  });
}

const ancestorWithProperty = function (node,prop) {
  return findAncestor(node,function (x) {
      return x[prop] !== undefined;
  },1);
}


const ancestorWithPrototype = function (node,proto) {
  return findAncestor(node,function (x) {
      return proto.isPrototypeOf(x);
  },1);
}


const ancestorWithSourceUrl = function (node,source) {
  return findAncestor(node,function (x) {
      return x.__sourceUrl === source;
  },1);
}

const ancestorWithMethod = function (node,prop) {
  return findAncestor(node,function (x) {
    return typeof x[prop] === 'function';
  },1);
}


const ancestorWithName = function (node,name) {
  return findAncestor(node,function (x) {
    return x.__name === name;
  });
}




const ancestorWithoutProperty = function (node,prop) {
  return findAncestor(node,function (x) {
      return x[prop] === undefined;
  },1);
}



const ancestorWithPropertyTrue = function (node,prop) {
  return findAncestor(node,function (x) {
      return x[prop];
  },1);
}


const ancestorWithPropertyValue = function (node,prop,value) {
  return findAncestor(node,function (x) {
      return x[prop] === value;
  },1);
}

const ancestorWithPropertyFalse = function (node,prop) {
  return findAncestor(node,function (x) {
      return !x[prop];
  },1);
}

const containingData = function (node) {
   return findAncestor(node,function (x) {
     return (x.data) || (x.__internalData);
   });
}

const childName = function (parent,child) {
  let rs;
  forEachTreeProperty(parent,function (ch,nm) {
    if (ch === child) {
       rs = nm;
    }
  });
  return rs;
}
export let removeHooks = [];

// dontRemoveFromArray is used when all of the elements of an array are removed (eg  in removeChildren)
nodeMethod('remove',function (dontRemoveFromArray) {
  let parent = this.__parent;
  let isArray = ArrayNode.isPrototypeOf(parent);
  let __name = this.__name;
  removeHooks.forEach((fn) => {
      fn(this);
  });
  if (isArray) {
    if (!dontRemoveFromArray) {
      let idx = parent.indexOf(this);
      let ln = parent.length;
      for (let i=idx+1;i<ln;i++) {
        let child = parent[i];
        child.__name = i-1;
      }
      parent.splice(idx,1);
    }
  } else {
    let anm = __name;
    if (parent[anm] !== this)  { // check from ghost bug
      error('ghost bug back');
    }
    delete parent[anm];
  }
  return this;  
});

const fixTree = function (nd) {  // workaround for ghost bug. Not in use at the moment
  return;
  forEachDescendant((node) => {
    if (node !== nd) {
      let pr = node.__parent;
      let nm = node.__name;
      if (node !== pr[nm]) {
        debugger; //keep
        node.remove();
      }
    }
  },nd);
}

export let reparentHooks = [];

nodeMethod('__reparent',function (newParent,newName) {
  reparentHooks.forEach((fn) => {
      fn(this,newParent,newName);
  });
  adopt(newParent,newName,this);
  newParent[newName] = this;
  return this;  
});


const removeChildren =  function (node) {
  forEachTreeProperty(node,function (child) {
    child.remove(true);
  });
  if (ArrayNode.isPrototypeOf(node)) {
    node.length = 0;
  }
}





 



// without inheritance from prototype;  x.__get(prop) will return a value only if prop is a direct property of this
nodeMethod('__get',function (prop) { 
  if (this.hasOwnProperty(prop)) {
    return this[prop];
  }
  return undefined;
});

nodeMethod('parent',function () {
  return this.__get('__parent');
});

nodeMethod('__nthParent',function (n) {
  let cv = this;
  let i;
  for (i=0;i<n;i++) {
    cv = cv.__parent;
    if (!cv) {
      return undefined;
    }
  }
  return cv;
});

const climbCount = function (itm,ancestor) {
  let rs = 0;
  let citm = itm;
  while (true) {
    if (citm === ancestor) {
      return rs;
    } else if (!citm) {
      return undefined;
    } else {
      citm = citm.__get('__parent');
      rs++;
    }
  }
}


ObjectNode.name = function () {
  return this.__get('__name');
}


// in strict mode, the next 4 functions return undefined if c does not appear in s, ow the whole string
const afterChar = function (string,chr,strict) {
  let idx = string.indexOf(chr);
  if (idx < 0) {
    return strict?undefined:string;
  }
  return string.substr(idx+1);
}




const beforeChar = function (string,chr,strict) {
  let idx = string.indexOf(chr);
  if (idx < 0) {
    return strict?undefined:string;
  }
  return string.substr(0,idx);
}

  
const stripInitialSlash = function (string) {
  if (string==='') {
    return string;
  }
  if (string[0]==='/') {
    return string.substr(1);
  }
  return string;
}


const addInitialSlash = function (string) {
  if (string==='') {
    return string;
  }
  if (string[0]==='/') {
    return string;
  }
  return '/'+string;
}

const pathReplaceLast = function (string,rep,sep) {
  let sp = sep?sep:'/';
  let idx = string.lastIndexOf(sp);
  let  dr = string.substring(0,idx+1);
  return dr + rep;
}
  
 
const setIfNumeric = function (node,prp,v) {
  let n = parseFloat(v);
  if (!isNaN(n)) {
    this[prp] = v;
  }
}

/* an atomic property which does not inherit currently, but could,
 * in that there is a property down the chain with the same typeof
 */

const inheritableAtomicProperty = function (node,prop) {
  if (prop === 'backgroundColor') {
    return false;
  }
  if (!node.hasOwnProperty(prop)) {
    return false;
  }
  let proto = Object.getPrototypeOf(node);
  return (typeof node[prop] === typeof proto[prop]);
}
  
/* inheritors(root,proto,filter) computes all of the descendants of root
 * which inherit from proto (including proto itself) and for which the filter (if any) is true.
 */

 
nodeMethod('__root',function () {
  let pr  = this.__get('__parent');
  return pr?pr.__root():this;
});



const inheritors = function (proto,filter) {
  let rs = [];
  let root = proto.__root();
  let recurser = function (node,iproto) {
    if ((iproto === node) || proto.isPrototypeOf(node)) {
      if (filter) {
        if (filter(node)) {
          rs.push(node);
        }
      } else {
        rs.push(node);
      }
    }
    forEachTreeProperty(node,function (child) {
      recurser(child,iproto);
    });
  }
  recurser(root,proto);
  return rs;
}


const forInheritors = function (proto,fn,filter) {
  let root = proto.__root();
  const recurser = function (node,iproto) {
    if ((iproto === node) || proto.isPrototypeOf(node)) {
      if ((filter && filter(node)) || !filter) {
        fn(node)
      }
    }
    forEachTreeProperty(node,function (child) {
      recurser(child,iproto);
    });
  }
  recurser(root,proto);
}


const forSomeInheritors = function (proto,fn) { 
  let rs = 0;
  let root = proto.__root();
  const recurser = function (node,iproto) {
    
    if ((iproto === node) || iproto.isPrototypeOf(node)) {
      if (fn(node)) {
        rs = 1;
      } else {
        forEachTreeProperty(node,function (child) {
          recurser(child,iproto);
        });
      }
    }
    return rs;
  }
  recurser(root,proto);
  return rs;
}
 


// the first protopy in node's chain with property prop 
const prototypeWithProperty = function (node,prop) {
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

// the first prototype in node's chain with property prop whose value is val
const prototypeWithPropertyValue = function (node,prop,val) {
  if (node[prop] === undefined) {
    return undefined;
  }
  let rs = node;
  while (true) {
    let cval = getval(rs,prop);
    if (cval === val) {
      return rs;
    }
    rs = Object.getPrototypeOf(rs);
    if (!rs) {
      return undefined;
    }
  }
}
// one of prototypes in the chain has this source

const hasSource = function (node,url) {
  return Boolean(prototypeWithPropertyValue(node,'__sourceUrl',url));
}
  
  
  
  
// maps properties to sets (as Arrays) of  values.
let MultiMap = ObjectNode.mk();

MultiMap.mk = function () {
  return Object.create(MultiMap);
}

MultiMap.setValue = function(property,value) {
  let cv = this[property];
  if (!cv) {
    cv = ArrayNode.mk();
    this.set(property,cv);
  }
  cv.push(value);
}

// array should contain strings or numbers
const removeDuplicates = function(array) {
  let rs;
  if (ArrayNode.isPrototypeOf(array)) {
    rs = ArrayNode.mk();
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

const removeFromArray = function (array,value) {
  let index = array.indexOf(value);
  if (index > -1) {
    array.splice(index,1);
  }
  return array;
}

const addToArrayIfAbsent = function (array,value) {
  let index = array.indexOf(value);
  if (index === -1) {
    array.push(value);
  }
  return array;
}
          
      
  

/* a utility for autonaming. Given seed nm, this finds a __name that does not conflict
 * with children of avoid, and has the form nmN, N integer. nm is assumed not to already have an integer at the end
 * Special case. nm might be a number (as it will be when derived from the name of an array element). In this case, nm is replaced
 * by "N" and the usual procedure is followed
 */

 
 const removeTrailingDigits = function (nm) {
    let ln = nm.length;
    for (let i = ln-1;i>=0;i--) {
       let c = nm.charCodeAt(i);
       if ((c <48) || (c > 57)) {
          return nm.substring(0,i+1);
       }
    }
    return 'n';
 }
 
 const autoname = function (avoid,inm) {
    let maxnum = -1;
    let anm;
    let nm = (typeof inm === 'number')?'n':inm;
    nm = removeTrailingDigits(nm);
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
          maxnum = Math.max(maxnum,parseInt(rst));
        }
      }
    }
  let num = (maxnum === -1)?1:maxnum+1;
  return nm + num;
}

  
const fromSource = function (x,src) {
    if (x && (typeof x==='object')) {
      if ((x.__sourceUrl) && (x.__sourceUrl === src)) {
        return true;
      } else {
        let pr = Object.getPrototypeOf(x);
        return fromSource(pr,src);
      } 
    } else {
      return false;
    }
  }

  
nodeMethod("__inWs",function () {
  if (this === root) {
    return true;
  }
  let pr = this.__get('__parent');
  if (!pr) {
    return false;
  }
  return pr.__inWs();
});

//last in the  work space which satisfies fn
ObjectNode.__lastInWs = function (returnIndex,fn) {
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

nodeMethod('__size',function () {
  let n=0;
  if (ObjectNode.isPrototypeOf(this)) {
    forEachTreeProperty(this,function () {
      n++;
    },1);
    return n;
  } else {
    return this.length;
  }
});



ObjectNode.__namedType = function () { // shows up in the inspector
  this.__isType = 1;
  return this;
}

const countDescendants = function (node,fn) {
  let rs = 0;
  forEachDescendant(function (d) {
    rs +=  fn?(fn(d)?1:0):1;
  },node);
  return rs;
}

const numericalSuffix = function (string) {
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
const nDigits = function (n,d) {
  let ns,dp,ln,bd,ad;
  if (typeof n !=="number") {
    return n;
  }
  let pow = Math.pow(10,d);
  let unit = 1/pow;
  let rounded = Math.round(n/unit)/pow;
  ns = String(rounded);
  dp = ns.indexOf(".");
  if (dp < 0) {
    return ns;
  }
  ln = ns.length;
  if ((ln - dp -1)<=d) {
    return ns;
  }
  bd = ns.substring(0,dp);
  ad = ns.substring(dp+1,dp+d+1)
  return bd + "." + ad;
}

ArrayNode.__copy = function (copyElement) {
  let rs = ArrayNode.mk();
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
const deepCopy = function (x) {
  if ((x === null) || (typeof x !== 'object')) {
    return x;
  }
  let proto = Object.getPrototypeOf(x);
  let rs = Object.create(proto);
  const perChild = function (child,hasParent) {
    let cp = deepCopy(child);
    if (hasParent) {
      cp.__parent = rs;
    }
    return cp;
  }
  if (Array.isArray(x)) {
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
       rs[prop] = perChild(child,childHasParent);
     });
     return rs;
  }
}

const objectifyArray = function (a) {
  let rs  = ObjectNode.mk();
  a.forEach(function (element) {
    rs[element] = 1;
  });
  return rs;
}

ObjectNode.setComputedProperties = function (a) {
  this.set('__computedProperties',objectifyArray(a));
}

ObjectNode.add = function (child,ikey) {
  let key = ikey?ikey:'X';
  let nm = autoname(this,key);
  this.set(nm,child);
  return child;
}
  
// an item is a  node suitable for use in  the main tree (if used with the svg dom, an svg group element)
let newItem = function () {
  return objectNode.mk();
}


const setItemConstructor = function (f) {
  newItem = f;
}

vars.installPrototypeDisabled = false;


// in the standard setup, the protypes are kept together under root.prototypes
// accepts either  of the forms installPrototype(proto) or installPrototype(id,proto)
const installPrototype_old = function (idOrProto0,idOrProto1,forceInstantiate) {
  if (vars.installPrototypeDisabled) {
    return;
  }
  let id,proto;
  if (idOrProto1 == undefined) {
    id = 'proto0';
    proto = idOrProto0;
  } else {
    id = idOrProto0;
    proto = idOrProto1;
  }
  let protos = root.prototypes;
  if (!protos) {
    root.set('prototypes',newItem());
  }
  let anm = autoname(root.prototypes,id);
  if (getval(proto,'__parent')) { // already present
    root.prototypes[anm] = proto;
    //proto.__isPrototype = true;
    return proto;
  }
  log('install','Adding prototype '+anm);
  let iproto = (forceInstantiate || proto.__get('__sourceUrl'))?proto.instantiate():proto;
  if (iproto.hide) {
    iproto.hide();
  }
  //iproto.__isPrototype = true;
  root.prototypes.set(anm,iproto);
  return iproto;
}
 // the prototypes are kept together under root.prototypes
 
const installPrototype = function (iid,iprotoProto) {
 let id,protoProto;
 // allow just one argument, the protoProto
 if (iprotoProto) {
   protoProto = iprotoProto;
   id = iid
 } else {
  protoProto = iid;
  id = 'x';
 }
  let protos = root.prototypes;
  if (!protos) {
    protos = root.set('prototypes',newItem());
    protos.visibility = "hidden";
  }
  let external = protoProto.__get('__sourceUrl');
  let rs = external?protoProto.instantiate():protoProto;
  rs.visibility = 'hidden'; // a forward reference of sorts
  let anm = autoname(protos,id);
  protos.set(anm,rs);
  return rs;
}

const replacePrototype = function (where,id,replacementProto) {
  let replaced = where[id];
  let nm = replaced.__name;
  let protos = root.prototypes;
  let anm = autoname(protos,nm);
  let external = replacementProto.__get('__sourceUrl');
 let rs = external?replacementProto.instantiate():replacementProto;
  rs.visibility = "hidden"; // a forward reference of sorts
  protos.set(anm,rs);
  where[id] = rs;
  return rs;
}



const isPrototype = function (node) {
  let rs = findAncestor(node, (anc) => (anc.__name === 'prototypes'));
  return rs;
}



// just a short synonym to save typing when debugging
const pOf = function(x) {
  return Object.getPrototypeOf(x);
}

// value should be primitive (string,value,boole)
ObjectNode.setActiveProperty = function (prop,value) {
  if (this.hasOwnProperty(prop)) {
    this[prop] = value;
  } else {
    let proto = Object.getPrototypeOf(this);
    proto[prop] = value;
  }
}



export {defineFieldAnnotation,nodeMethod,extend,setProperties,getval,internal,crossTreeLinks,
        mapNonCoreLeaves,treeProperty,mapOwnProperties,lift,forEachTreeProperty,stripInitialSlash,descendantWithProperty,
        isNode,ancestorHasOwnProperty,isAtomic,treeProperties,autoname,removeChildren,beforeChar,afterChar,
        isDescendantOf,findAncestor,ancestorWithProperty,ancestorWithPropertyFalse,ancestorWithPropertyTrue,ancestorWithPropertyValue,
        nDigits,evalPath,inheritors,forInheritors,pathToString,climbCount,pOf,setPropertiesIfMissing,
        isObject,hasSource,findDescendant,stringPathOf,isPrototype,containingData,
        newItem,setItemConstructor,installPrototype,replacePrototype,addToArrayHooks,deepCopy
        };
