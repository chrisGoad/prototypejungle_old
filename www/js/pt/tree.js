
(function (pj) {
'use strict'
var pt = pj.pt;
// This is one of the code files assembled into pjom.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> pt ====================================================


pt.__builtIn = 1;


// constructors for nodes

pt.DNode.mk = function (src) {
  var rs = Object.create(pt.DNode);
  if (src) {
    pt.extend(rs,src);
  }
  return rs;
}



pt.LNode.mk = function(array) {
  var rs = Object.create(pt.LNode),
    child,ln;
  if (array==undefined) return rs;
  ln = array.length;
  for (var i=0;i<ln;i++) {
    child = array[i];
    if (child && (typeof(child) === 'object')){
      child.parent = rs;
      child.name = ''+i;
    }
    rs.push(child);
  }
  return rs;
}


//  make the same method fn work for DNodes,Lnodes
pt.nodeMethod = function (name,func) {
  pt.LNode[name] = pt.DNode[name] = func;
}

// only strings that pass this test may  be used as names of nodes
pt.checkName = function (string) {
  if (string === undefined) {
    pt.error('Bad argument');
  }
  if (string==='') return false;
  if (string==='$') return true;
  if (typeof string==='number') {
    return string%1 === 0;
  }
  if (!string.match) {
    debugger;
  }
  return !!string.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
}


pt.checkPath = function (string,allowFinalSlash) {
  var strSplit = string.split('/'),
    ln = strSplit.length,
    i = 0;
  if (ln===0) return false;
  if (allowFinalSlash && (strSplit[ln-1] === '')) {
    ln = ln - 1;
  }
  for (;i<ln;i++) {
    var pathElement = strSplit[i];
    if (((i>0) || (pathElement !== '')) // '' is allowed as the first  element here, corresponding to a path starting with '/'
      &&  !pt.checkName(pathElement)) {
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

pt.evalPath = function (origin,ipth) {
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
 * Return the path from root, or if root is undefined the path up to where parent is undefined. In the special case where
 * root === pj, the path begins with '' (so that its string form will start with '/')
 */

pt.pathOf = function (node,root) {
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
    var name = pt.getval(current,'name');
    // if we have reached an unnamed node, it should not have a parent either
    if (name!==undefined) {
      rs.unshift(name);
    }
    current = pt.getval(current,'parent');
  }
  return undefined;
}

pt.stringPathOf = function (node,root) {
  var path = pt.pathOf(node,root);
  return path!==undefined?path.join('/'):undefined;
}

pt.nodeMethod('__pathOf',function (root) {return pt.pathOf(this,root);});


pt.isObject = function (o) {
  return o && (typeof(o) === 'object');
}


pt.isAtomic = function (x) {
  return !pt.isObject(x);
}
  

pt.isNode = function(x) { 
  return pt.DNode.isPrototypeOf(x) || pt.LNode.isPrototypeOf(x);
}


// creates DNodes if missing so that path pth descending from this exists

pt.createPath = function (node,path) {
  var current = node,
    child,next;
  path.forEach(function (prop) {
    // ignore '' ; this means that createPath can be used on pj
    if (prop === '') return;
    if (!pt.checkName(prop)){
      pt.error('Ill-formed name "'+prop+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
    }
    if (!current.__get) {
      pt.error('Unexpected');
    }
    child = current.__get(prop);
    
    if (child === undefined) {
      next = pt.DNode.mk();
      current.set(prop,next);
      current = next;
    } else {
      if (!pt.isNode(child)) pt.error('Conflict in createPath ',path.join('/'));
      current = child;
    }
  });
  return current;
}
  

// gets own properties only
pt.getval = function (node,prop) {
  if (!node) {
    pt.error('null v');
  }
  if (node.hasOwnProperty(prop)) {
    return node[prop];
  }
}

var separateFromParent = function (node) {
  var parent = pt.getval(node,'parent');
  if (parent) {
    parent[node.name] = undefined;
  }
}

// assumes node[name] is  child, or will be child. checks child's suitability
var adopt = function (node,name,child) {
  if (pt.isNode(child)) {
    separateFromParent(child);
    child.name = name;
    child.parent = node;
  } else if (child && (typeof(child)==='object')) {
    pt.error('Only Nodes and atomic __values can be set as __children in <Node>.set("'+name+'",<val>)');
  } 
}

pt.preSetChildHooks = [];
pt.setChildHooks = [];

/* A property k of a node is watched if the field annotation "Watched" is set for that property. 
 * For watched fields, a change event is emitted of the form {name:change node:node property:name}
 */

function setChild(node,name,child) {
  pt.preSetChildHooks.forEach(function (fn) {fn(node,name);});
  adopt(node,name,child);
  node[name] = child;
  pt.setChildHooks.forEach(function (fn) {fn(node,name,child);});
  var watched = node.__Watched;
  if (watched && watched[name]) {
  //if (node.__watched && node['__'+name+'_watched']) {
    var event = pt.Event.mk('change',node);
    event.property=name;
    event.emit();
  }
}

pt.DNode.__getOwnFieldAnnotation = function (annotationName,prop) {
  var annotations = this.__get(annotationName);
  if (annotations === undefined) {
    return undefined;
  }
  return annotations[prop];
}



pt.DNode.__getFieldAnnotation = function (annotationName,prop) {
  var cp = this;
  while (true) {
    var rs = cp.__getOwnFieldAnnotation(annotationName,prop);
    if (rs !== undefined) {
      return rs;
    }
    cp = Object.getPrototypeOf(cp);
    if (cp === pt.DNode) return undefined;
  }
}
  

pt.DNode.__setFieldAnnotation = function (annotationName,prop,v) {
  var annotations = this.__get(annotationName);
  if (annotations === undefined) {
    annotations = this.set(annotationName,pt.DNode.mk());
  }
  if (Array.isArray(prop)) {
    var thisHere = this; 
    prop.forEach(function (ik) {
      annotations[ik] = v;
    });
  } else {
    annotations[prop] = v;
    return v;
  }
}
 
pt.defineFieldAnnotation = function (functionName) {
  var annotationName = "__"+functionName;
  pt.DNode["__getOwn"+functionName] = function (k) {
    return this.__getOwnFieldAnnotation(annotationName,k);
  };
  pt.DNode["__get"+functionName] = function (k) {
    return this.__getFieldAnnotation(annotationName,k);
  };
  pt.DNode["__set"+functionName] = function (k,v) {
    return this.__setFieldAnnotation(annotationName,k,v);
  };
  
    /*
  pt.DNode["__getOwn"+functionName] = function (k) {

    var annotations = this.__get(annotationsName);
    if (annotations === undefined) {
      return undefined;
    }
    return annotations[k];
  };
  
  pt.DNode["__set"+functionName] = function (k,v) {
    var annotations = this[annotationsName];
    if (annotations === undefined) {
      annotations = this.set(annotationsName,pt.DNode.mk());
    }
    if (Array.isArray(k)) {
      var thisHere = this; 
      k.forEach(function (ik) {
        annotations[ik] = v;
      });
    } else {
      annotations[k] = v;
      return v;
    }
  };
  */
  pt.LNode["__get"+functionName] = function (k){}
}
  
pt.defineFieldAnnotation("Watched");//,"__note__");

pt.watch = function (node,prop) {
  node.__setWatched(prop,1);
 // node.__watched = 1;
 // node['__'+prop+'_watched']=1;
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
pt.DNode.set = function (key,val) {
  var idx,path,name,parent;
  if (arguments.length === 1) {
    pt.extend(this,key);
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
    parent = pt.createPath(this,path);
  } else {
    parent = this;
    name = key;
  }
  if (!pt.checkName(name)){
    pt.error('Ill-formed name "'+name+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
  }
  setChild(parent,name,val);
  return val;
}


pt.LNode.set = function (key,val) {
  setChild(this,key,val);
  return val;
}

// adopts val below this if it is not already in a tree,ow just refers
pt.setIfExternal = function (parent,name,val) { 
  var tp = typeof val;
  if ((tp === 'object') && val && val.__get('parent')) {
    parent[name] = val;
  } else {
    parent.set(name,val);
  }
  return val;
}

pt.setIfMissing = function (parent,prop,factory) {
  var rs = parent[prop];
  if (!rs) {
    rs = factory();
    parent.set(prop,rs);
  }
  return rs;
}

// this is similar to jquery.extend in deep mode: it merges source into dest. Note that it does not include properties from the prototypes.
pt.extend = function (dest,source) {
  if (!source) return dest;
  for (var prop in source) {
    if (source.hasOwnProperty(prop)) {
      var newVal = pt.lift(source[prop]);
      if (newVal === undefined) continue;
      var existingVal = dest[prop];
      // merge if existingVal is a DNode; replace otherwise
      if (existingVal && pt.DNode.isPrototypeOf(existingVal) && pt.DNode.isPrototypeOf(newVal)) {
        pt.DNode.extend(existingVal,newVal);
      }
      dest.set(prop,newVal);
    }
  }
  return dest;
}


pt.arrayToDict = function (aarray) {
  var rs = {};
  array.forEach(function (prop) {rs[prop] = 1;});
  return rs;
}


// transfer properties from source. If props is missing, extend dest by source
pt.setProperties = function (dest,source,props,dontLift,fromOwn) {
  if (!source) return;
  if (!dest) {
    pt.error("Bad arguments")
  }
  // include the case !hasSet so this will work for an ordinary object
  var hasSet = dest.set; 
  if (props) {
    props.forEach(function (prop) {
        var sourceVal = fromOwn?pt.getval(source,prop):source[prop];
        if (sourceVal !== undefined) {
          if (hasSet) {
            dest.set(prop,pt.lift(sourceVal));
          } else {
            dest[prop] = sourceVal;
          }
        }
    });
  } else {
    pt.extend(dest,source);
  }
  return dest;
}

pt.setPropertiesFromOwn = function (dest,source,props,dontLift) {
  return pt.setProperties(dest,source,props,dontLift,1);
}

// only for atomic values
pt.getProperties = function (source,props) {
  var rs = pt.DNode.mk();
  props.forEach(function (prop) {
    var sourceVal = source[prop];
    var type = typeof sourceVal;
    if ((sourceVal === null) || ((type !== "undefined") && (type !== "object"))) {
      rs[prop] = sourceVal;
    }
  });
  return rs;
}

// Some LNode methods



pt.LNode.toArray = function () {
  var rs = [];
  this.forEach(function (e) {rs.push(e);});
  return rs;
}
var arrayPush = Array.prototype.push;
pt.pushHooks = [];

pt.LNode.push = function (element) {
  var ln = this.length,
    thisHere = this;
  if (pt.isNode(element)) {
    if (element.parent) {  //R2MOD used to separate from parent in every case
      element.name = ln;
      element.parent = this;
    }
  } else if (element && (typeof element==='object')) {
    pt.error('Attempt to push non-node object onto an LNode');
  }
  arrayPush.call(this,element);
  pt.pushHooks.forEach(function (fn) {fn(thisHere,element);});
  return ln;
}


var arrayUnshift = Array.prototype.unshift;
pt.LNode.unshift = function (element) {
  var ln = this.length;
  if (pt.isNode(element)) {
    separateFromParent(element);
    element.name = ln;
    element.parent = this;
  } else if (element && (typeof element==='object')) {
    pt.error('Attempt to shift non-node object onto an LNode');
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
  if (pt.isNode(o)) {
    rs = o;
  } else {
    if (Array.isArray(o)) {
      rs = pt.toLNode(o,null);
    } else {
      var rs = pt.toDNode(o,null);
    }
    
  }
  rs.parent = parent;
  rs.name = name;
  parent[name] = rs;
}

// transfer the contents of ordinary object o into idst (or make a new destination if idst is undefined)
pt.toDNode = function (o,idest) {
  var dest,oVal;
  if (pt.DNode.isPrototypeOf(o)) return o; // already a DNode
  if (idest) {
    dest = idest;
  } else {
    dest = pt.DNode.mk();
  }
  for (var prop in o) {
    if (o.hasOwnProperty(prop)) {
      oVal = o[prop];
      toNode1(dest,prop,oVal);
    }
  }
  return dest;
}

pt.toLNode = function (array,idest) {
  if (idest) {
    var dest = idest;
  } else {
    dest = pt.LNode.mk();
  }
  array.forEach(function (element) {   
    dest.push(pt.toNode(element));
  });
  return dest;
}

pt.toNode = function (o) {
  if (pt.isNode(o)) {
    // idempotent
    return o;
  }
  if (Array.isArray(o)) {
    return pt.toLNode(o);
  } else if (o && (typeof o === 'object')) {
    return pt.toDNode(o);
  } else {
    return o;
  }
}

pt.lift = pt.toNode;




// Some utilities for iterating functions over trees.

// internal __properties are excluded from the iterators and recursors 

pt.internalProps = {'parent':1,'__protoChild':1,'__value__':1,'__hitColor':1,'__chain':1,'__copy':1,name:1,widgetDiv:1,
  __protoLine:1,__inCopyTree:1,__headOfChain:1,__element:1,__domAttributes:1};
pt.internal = function (name) {
   return pt.internalProps[name];
}


// a proper element of the tree: an own property with the right parent link. If includeLeaves, then atomic own properties are included too

pt.treeProperty = function (node,prop,includeLeaves,knownOwn) {
  if ((!knownOwn && !node.hasOwnProperty(prop)) ||  pt.internal(prop)) return false;
  var child = node[prop];
  if (pt.isNode(child)) {
    return child.parent === node;
  } else {
    return includeLeaves?(typeof child !== 'object'):false;
  }
}


pt.treeProperties = function (node,includeLeaves) {
  var rs = [],
    child,names,ln,i;
  if (pt.LNode.isPrototypeOf(node)) {
    ln = node.length;
    for (i = 0;i < ln;i++) {
      child = node[i];
      if (includeLeaves) {
        rs.push(i);
      } else if (pt.isNode(child) && (child.parent === node)) {
        rs.push(i);
      }
    }
    return rs;
  }
  names = Object.getOwnPropertyNames(node),
  names.forEach(function (name) {
    if (pt.treeProperty(node,name,includeLeaves,true)) rs.push(name);
  });
  return rs;
}
  
// apply fn(node[prop],prop,node) to each non-internal own property p. 
pt.mapOwnProperties = function (node,fn) {
  var ownprops = Object.getOwnPropertyNames(node);
  ownprops.forEach(function (prop) {
     if (!pt.internal(prop))  { 
      fn(node[prop],prop,node);
    }
  });
  return node;
}

// apply fn(node[p],p,node) to each treeProperty p  of node. Used extensively for applying functions through a tree
pt.forEachTreeProperty = function (node,fn,includeLeaves) { 
  var ownprops = Object.getOwnPropertyNames(node);
  ownprops.forEach(function (prop) {
     if (pt.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
      fn(node[prop],prop,node);
    }
  });
  return this;
}

pt.everyTreeProperty = function (node,fn,includeLeaves) { 
  var ownprops = Object.getOwnPropertyNames(node);
  return ownprops.every(function (prop) {
     if (pt.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return 1;
    }
  });
}


pt.someTreeProperty = function (node,fn,includeLeaves) { 
  var ownprops = Object.getOwnPropertyNames(node);
  return ownprops.some(function (prop) {
     if (pt.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return 0;
    }
  });
}

 // if node itself has gthe propety, return true
pt.ancestorHasOwnProperty  = function (node,p) {
  var cv = node;
  while (cv) {
    if (cv.__get(p)) return true;
    cv = cv.__get('parent');
  }
  return false;
}

pt.DNode.__inCore = function () {
  return pt.ancestorHasOwnProperty(this,'__builtIn');
}

/* used eg for iterating through styles.
 * apply fn(node[p],p,node) to each atomic property of node, including properties defined in prototypes, but excluding
 * those defined in core modules.
 * sofar has the properties where fn has been called so far (absent except in the recursive call)
 */

pt.mapNonCoreLeaves = function (node,fn,allowFunctions,isoFar) {
  var soFar = isoFar?isoFar:{};
  if (!node) {
    pt.error('Bad argument');
  }
  if (!node.__inCore || node.__inCore()) return;
  var op = Object.getOwnPropertyNames(node);
  op.forEach(function (prop) {
    var child,childType;
    if (soFar[prop]) return;
    if (!pt.treeProperty(node,prop,true,true)) return true;
    soFar[prop] = 1;
    child = node[prop];
    childType = typeof child;
    if (child && (childType === 'object' )||((childType==='function')&&!allowFunctions)) return;
    fn(child,prop,node);
  });
  var proto = Object.getPrototypeOf(node);
  if (proto) {
    pt.mapNonCoreLeaves(proto,fn,allowFunctions,soFar);
  }
}


pt.deepApplyFun = function (node,fn) {
  fn(node);
  pt.forEachTreeProperty(node,function (c) {
    pt.deepApplyFun(c,fn);
  });
}
  


pt.deepDeleteProps = function (node,props) {
  pt.deepApplyFun(node,function (ch) {
    props.forEach(function (p) {
      delete ch[p];
    });
  });
}



pt.deepDeleteProp = function (inode,prop) {
  pt.deepApplyFun(inode,function (node) {
    delete node[prop]
  });
}


pt.findAncestor = function (node,fn) {
  if (node===undefined) return undefined;
  if (fn(node)) return node;
  var parent = node.__get('parent');
  return pt.findAncestor(parent,fn);
}
  

pt.ancestorWithProperty = function (node,prop) {
  return pt.findAncestor(node,function (x) {
      return x[prop] !== undefined;
  });
}

pt.ancestorWithMethod = function (node,prop) {
  return pt.findAncestor(node,function (x) {
    return typeof x[prop] === 'function';
  });
}



pt.ancestorWithoutProperty = function (node,prop) {
  return pt.findAncestor(node,function (x) {
      return x[prop] === undefined;
  });
}

pt.removeHooks = [];

pt.nodeMethod('remove',function () {
  var thisHere = this,
    parent = this.parent,
    name = this.name;
  pt.removeHooks.forEach(function (fn) {
      fn(thisHere);
  });
  // @todo if the parent is an LNode, do somethind different
  delete parent[name];
});


pt.removeChildren =  function (node) {
  pt.forEachTreeProperty(node,function (child) {
    child.remove();
  });
  if (pt.LNode.isPrototypeOf(node)) {
    node.length = 0;
  }
}




// check that a tree with correct parent pointers and names descends from this node. For debugging.
pt.nodeMethod('__checkTree',function () {
  var thisHere = this;
  pt.forEachTreeProperty(this,function (child,prop) {
    if ((child.parent) !== thisHere) pt.error(thisHere,child,'bad parent');
    if ((child.name) !== prop) pt.error(thisHere,child,'bad name');
    v.__checkTree();
  });
});




pt.DNode.namedType = function () { // shows up in the inspector
  this.__isType = 1;
  return this;
}

// without inheritance from prototype;  x.__get(prop) will return a value only if prop is a direct property of this
pt.nodeMethod('__get',function (prop) { 
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

pt.nodeMethod('__funstring1',function (rsContainer,where) {
  pt.forEachTreeProperty(this,function (child,prop) {
    var propAsNum = parseInt(prop),
      isnum = isFinite(propAsNum),
      childNode,rs,fundef;
    if (pt.isNode(child)) {
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


pt.nodeMethod('__funstring',function () {
  var rsContainer = ['\n(function () {\nvar item = prototypeJungle.pt.lastItemLoaded;\n'],
    rs;
  this.__funstring1(rsContainer,'item');
  rs = rsContainer[0];
  rs+='})()\n'
  return rs;
});


// in strict mode, the next 4 functions return undefined if c does not appear in s, ow the whole string
pt.afterChar = function (string,chr,strict) {
  var idx = string.indexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(idx+1);
}


pt.afterLastChar = function (string,chr,strict) {
  if (string === undefined) {
    debugger;
  } 
  var idx = string.lastIndexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(idx+1);
}


pt.beforeLastChar = function (string,chr,strict) {
  var idx = string.lastIndexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(0,idx);
}


pt.beforeChar = function (string,chr,strict) {
  var idx = string.indexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(0,idx);
}

pt.pathExceptLast = function (string,chr) {
  return pt.beforeLastChar(string,chr?chr:'/');
}



pt.endsIn = function (string,p) {
  var ln = string.length,
    pln = p.length,es;
  if (pln > ln) return false;
  es = string.substr(ln-pln);
  return es === p;
}

pt.beginsWith = function (string,p) {
  var ln = string.length,
    pln = p.length,es;
  if (pln > ln) return false;
  es = string.substr(0,pln);
  return es === p;
}

  
pt.stripInitialSlash = function (string) {
  if (string==='') return string;
  if (string[0]==='/') return string.substr(1);
  return string;
}

pt.pathLast = function (string) {
  return pt.afterLastChar(string,'/');
}

pt.pathReplaceLast = function (string,rep,sep) {
  var sp = sep?sep:'/',
    idx = string.lastIndexOf(sp),
    dr = string.substring(0,idx+1);
  return dr + rep;
}
  
 
pt.setIfNumeric = function (node,prp,v) {
  var n = parseFloat(v);
  if (!isNaN(n)) {
    this[prp] = v;
  }
}

/* an atomic property which does not inherit currently, but could,
 * in that there is a property down the chain with the same typeof
 */

pt.inheritableAtomicProperty = function (node,prop) {
  var propVal;
  if (prop === 'backgroundColor') {
    return 0;
  }
  if (!node.hasOwnProperty(prop)) return 0;
  var proto = Object.getPrototypeOf(node);
  return (typeof node[prop] === typeof proto[prop]);
}
  
/* inheritors(root,proto,filter) computes all of the descendants of root
 * which inherit from proto (including proto itself) and for which the filter (if any) is true.
 */

 

pt.inheritors = function (proto,filter) {
  var rs = [];
  var root = proto.__root();
  var recurser = function (node,proto) {
    if ((proto === node) || proto.isPrototypeOf(node)) {
      if (filter) {
        if (filter(node)) rs.push(node);
      } else {
        rs.push(node);
      }
    }
    pt.forEachTreeProperty(node,function (child) {
      recurser(child,proto);
    });
  }
  recurser(root,proto);
  return rs;
}


pt.forInheritors = function (proto,fn) {
  var root = proto.__root();
  var recurser = function (node,proto) {
    if ((proto === node) || proto.isPrototypeOf(node)) {
      fn(node);
    }
    pt.forEachTreeProperty(node,function (child) {
      recurser(child,proto);
    });
  }
  recurser(root,proto);
}


pt.forSomeInheritors = function (proto,fn) { 
  var rs = 0;
  var root = proto.__root();
  var recurser = function (node,proto) {
    
    if ((proto === node) || proto.isPrototypeOf(node)) {
      if (fn(node)) {
        rs = 1;
      } else {
        pt.forEachTreeProperty(node,function (child) {
          recurser(child,proto);
        });
      }
    }
    return rs;
  }
  recurser(root,proto);
  return rs;
}
 

pt.nodeMethod('__root',function () {
  var pr  = this.__get("parent");
  return pr?pr.__root():this;
});



// the first protopy in node's chain with property prop 
pt.prototypeWithProperty = function (node,prop) {
  if (node[prop] === undefined) {
    return undefined;
  }
  var rs = node;
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
  
  
  
  
// maps properties to sets (as LNodes) of  values.
pt.MultiMap = pt.DNode.mk();

pt.MultiMap.mk = function () {
  return Object.create(pt.MultiMap);
}

pt.MultiMap.setValue = function(property,value) {
  var cv = this[property];
  if (!cv) {
    cv = pt.LNode.mk();
    this.set(property,cv);
  }
  cv.push(value);
}

// array should contain strings or numbers
pt.removeDuplicates = function(array) {
  var rs;
  if (pt.LNode.isPrototypeOf(array)) {
    rs = pt.LNode.mk();
  } else {
    rs = [];
  }
  var d = {};
  array.forEach(function (v) {
    if (d[v] === undefined) {
      rs.push(v);
      d[v] = 1;
    }
  });
  return rs;
}

pt.removeFromArray = function (array,value) {
  var index = array.indexOf(value);
  if (index > -1) {
    array.splice(index,1);
  }
  return array;
}

pt.addToArrayIfAbsent = function (array,value) {
  var index = array.indexOf(value);
  if (index == -1) {
    array.push(value);
  }
  return array;
}
  

/* a utility for autonaming. Given seed nm, this finds a name that does no conflict
 * with children of avoid, and has the form nmN, N integer. nm is assumed not to already have an integer at the end
 */

 
 pt.autoname = function (avoid,nm) {
    var anm,maxnum = -1;
    if (!avoid[nm]) {
      return nm;
    }
    debugger;
    var nmlength = nm.length;
    for (anm in avoid) {
      if (anm === nm) {
	continue;
      }
      var idx = anm.indexOf(nm);
      if (idx === 0) {
	var rst = anm.substr(nmlength);
	if (!isNaN(rst)) {
	  var rint = parseInt(rst);
	  maxnum = Math.max(maxnum,parseInt(rst));
	}
      }
    }
    var num = (maxnum === -1)?1:maxnum+1;
    return nm + num;
  }
  
//end extract
})(prototypeJungle);