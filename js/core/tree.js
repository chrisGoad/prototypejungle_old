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
  //Sconsole.log('dest name',dest.__name,'source name',source.__name,'dontcopy',dontCopy);
  if (!source) return;
  if (!dest) {
    pj.error('Bad arguments')
  }
  let destIsPJObject =  pj.Object.isPrototypeOf(dest);
  if (props) {
    props.forEach(function (prop) {
      let sourceVal = fromOwn?pj.getval(source,prop):source[prop];
      if (sourceVal !== undefined) {
        let srcIsPJNode = pj.isNode(sourceVal);
        let sourceCopy = dontCopy?sourceVal:pj.deepCopy(sourceVal);
        if (destIsPJObject && srcIsPJNode) {
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
pj.pushHooks.push(function (array,child) { //called after the push
   if (pj.isNode(child)) {
    let ln = array.length - 1;
    //if (child.__parent) { 
      child.__name = ln;
      child.__parent = array;
    //}
  } else if (child && (typeof child==='object')) {
    pj.error('Attempt to push non-node object onto an Array');
  }
});

pj.Array.push = function (element) {
  arrayPush.call(this,element);
  pj.pushHooks.forEach((fn) => {fn(this,element);});
  return this.length;
}

pj.Array.concat = function (elements) {
  let rs = pj.Array.mk();
  this.forEach((element) => rs.push(element))
  elements.forEach((element) => rs.push(element))
  return rs;
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
      rs = pj.toObject(o,null);
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

pj.forEachAtomicProperty = function (node,fn) {
  let perChild = function (notUsed,prop) {
    let value = node[prop];
    let tp = typeof value;
    if ((value === null) || ((tp !== 'object')  && (tp !== 'function'))) {
       fn(node[prop],prop,node);
    }
  }
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


pj.ancestorWithSourceUrl = function (node,source) {
  return pj.findAncestor(node,function (x) {
      return x.__sourceUrl === source;
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

// dontRemoveFromArray is used when all of the elements of an array are removed (eg  in removeChildren)
pj.nodeMethod('remove',function (dontRemoveFromArray) {
  let parent = this.__parent;
  let isArray = pj.Array.isPrototypeOf(parent);
  let __name = this.__name;
  pj.removeHooks.forEach((fn) => {
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
    child.remove(true);
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