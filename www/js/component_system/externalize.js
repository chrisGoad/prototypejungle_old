
(function (pj) {
  var om = pj.om;

  
// This is one of the code files assembled into pjcs.js. //start extract and //end extract indicate the part used in the assembly

//start extract

// <Section> Externalize ==========================



/* a node is a protoChild if its parent has a prototype, and it has the correspondingly named child of the parent as prototype
 *
 * Any top level externalizable item may have a __requires field.  each component has a name and url
 * if the url has the form "/..." this means that it is relative to it's own repo, whose url is held in __repo
 * In internalization, om.itemsLoaded holds the items loaded so far by url. Every loaded item has  __sourceRepo and __sourcePath
 * fields, describing where it was loaded from.
 * In the externalized object, references to external objects are either urls,
 * or paths of the form componentName/.../  or /<internalpath> such as /om/DNode or /svg/g.  ./path is used for references
 * within the object being externalized.
 */

// this is the repo for the current externalization. Needed to interpret components (but not needed if no components)
var xrepo; 


om.DNode.__isProtoChild = function () {
  var proto = Object.getPrototypeOf(this),
    protoParent;
  if (!proto) return false;
  var parent = this.__get("_parent");
  if (!parent) return false;
  protoParent = Object.getPrototypeOf(parent);
  if (!om.DNode.isPrototypeOf(protoParent)) return false;
  return protoParent[this.__name] === proto;
}

  

Function.prototype.__isProtoChild = function () {return false;}

// rti is the root of the externalization, or null, if this is the root
var exRecursionExclude = {__prototype:1,_name:1,__typePrototype:1,_parent:1,widgetDiv:1,__requires:1} //@todo rename widgetDiv
  
// the object currently being externalized
var currentX ;



var externalizedAncestor = function (x,root) {
  if ((x === root) ||om.getval(x,"__sourceRepo")||om.getval(x,"__builtIn")) {
    return x;
  } else {
    var parent = om.getval(x,"__parent");
    if (parent) {
      return externalizedAncestor(parent,root);
    } else {
      return undefined;
    }
    
  }
}


var findComponent = function (x,root) {
  var requires = root.__requires;
  if (!requires) return undefined;
  var rs = undefined;
  requires.some(function (require) {
    var repo = require.repo;
    if (require.repo === ".") {// relative to current rep
      repo = xrepo;
    }
    if ((x.__sourceRepo === repo) && (x.__sourcePath === require.path)) {
      rs = require.name;
      return true;
    }
  });
  return rs;
}

 
om.refCount = 0;

/* find the reference path for x.  This will be the path relative to its externalized ancestor, prepended by the path to that ancestor.
 * If this ancestor is repo, then just use "." to denote it (relative path). 
 */

om.refPath = function (x,repo) {
  var extAncestor = externalizedAncestor(x,repo),
    builtIn,relative,componentPath,relPath,builtInPath;
  if (extAncestor === undefined) {
    om.error("Cannot build reference");
  }
  builtIn = om.getval(extAncestor,"__builtIn");
  relative = extAncestor === repo;
  if ( !(builtIn || relative)) {
    var componentPath = findComponent(extAncestor,repo);
    if ( !componentPath) {
      throw(om.Exception.mk("Not in a require",x));
    }
  }
  var relPath = x.__pathOf(extAncestor).join("/");                                  
  if (builtIn) {
    builtInPath = extAncestor.__pathOf(pj);
    return builtInPath.join("/") + "/" + relPath;
  }
  if (relative) {
    return "./"+relPath;
  }
  return (relPath==="")?componentPath:componentPath+"/"+relPath;
}

  
om.externalizeDNode = function (node,rootin) {
  if (rootin) {
    var root = rootin;
  } else {
    root = node;
  }
  var rs = {};
  //currentX = root;
  var protoChild = this.__isProtoChild();
  if (protoChild) { // in this case, when internalize, we can compute the value of __prototype from the parent and its prototype
    rs.__protoChild = 1;
  } else {
    var proto =  Object.getPrototypeOf(node);
    var reference = om.refPath(proto,root);
    if (reference) {
      rs.__prototype = reference;
     
    }
  }
  //var thisHere = this;      
  om.mapOwnProperties(node,function (child,prop) {
    var childReference,requireReps;
    if (!om.treeProperty(node,prop,1)) { //1 means includeLeaves
      childReference = om.refPath(child,root);
      if (childReference) rs[prop] = {__reference:childReference};
      return; 
    }
    if (!exRecursionExclude[prop]) {
      if (om.isNode(child)) {
        rs[prop] = om.externalize(child,root);
      } else {
        rs[prop] = child;
      } 
    }
  });
  if (node === root) {
    var requires = node.__requires;
    if (requires) {
      var requireReps = requires.map(function (c) {
        return {name:c.name,repo:c.repo,path:c.path};
      });
    } else {
      requireReps = [];
    }
    rs.__requires = requireReps;
  }
  return rs;
}
 
  // __properties of the LNode are placed in the first element of the form {__props:1,,, At the moment, only __setIndex is involved.
om.externalizeLNode = function (node,rootin) {
  var setIndex,ln,i,element,rs;
  if (rootin) {
    var root = rootin;
  } else {
    root = node;
  }
  var setIndex = node.__setIndex;
  if (setIndex !== undefined) {
    rs = [{__props:1,__setIndex:setIndex}];
  } else {
    rs = [];
  }
  var ln = node.length;
  for (i=0;i<ln;i++) {
    element = node[i];
    rs.push(om.isNode(element)?om.externalize(element,root):element);
  }
  return rs;
}

om.externalize = function (node,root) {
  if (om.LNode.isPrototypeOf(node)) {
    return om.externalizeLNode(node,root);
  } else {
    return om.externalizeDNode(node,root);
  }
}
  
    
om.beforeStringify = [];// a list of callbacks
om.afterStringify = [];

om.stringify = function (node,repo) {
  var x,jsonX,rs;
  xrepo = repo;
  om.beforeStringify.forEach(function (fn) {fn(node);});
  x = om.externalizeDNode(node);
  om.afterStringify.forEach(function (fn) {fn(node);});
  jsonX = JSON.stringify(x);
  rs = "prototypeJungle.om.assertItemLoaded("+jsonX+");\n";
  var fns = node.__funstring();
  rs += fns;
  return rs;
}

//end extract
})(prototypeJungle);