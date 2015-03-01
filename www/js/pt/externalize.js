
(function (pj) {
  var pt = pj.pt;

  
// This is one of the code files assembled into pjom.js. //start extract and //end extract indicate the part used in the assembly

//start extract

// <Section> Externalize ==========================



/* a node is a protoChild if its parent has a prototype, and it has the correspondingly named child of the parent as prototype
 *
 * Any top level externalizable item may have a __requires field.  each component has a name and url
 * if the url has the form '/...' this means that it is relative to it's own repo, whose url is held in __repo
 * In internalization, pt.itemsLoaded holds the items loaded so far by url. Every loaded item has  __sourceRepo and __sourcePath
 * fields, describing where it was loaded from.
 * In the externalized object, references to external objects are either urls,
 * or paths of the form componentName/.../  or /<internalpath> such as /pt/DNode or /svg/g.  ./path is used for references
 * within the object being externalized.
 */

// this is the repo for the current externalization. Needed to interpret components (but not needed if no components)
var xrepo; 


pt.DNode.__isProtoChild = function () {
  var proto = Object.getPrototypeOf(this),
    protoParent;
  if (!proto) return false;
  var parent = this.__get('_parent');
  if (!parent) return false;
  protoParent = Object.getPrototypeOf(parent);
  if (!pt.DNode.isPrototypeOf(protoParent)) return false;
  return protoParent[this.name] === proto;
}

  

Function.prototype.__isProtoChild = function () {return false;}

// rti is the root of the externalization, or null, if this is the root
var exRecursionExclude = {__prototype:1,_name:1,__typePrototype:1,_parent:1,widgetDiv:1,__requires:1} //@todo rename widgetDiv
  
// the object currently being externalized
var currentX ;



var externalizedAncestor = function (x,root) {
  if ((x === root) ||pt.getval(x,'__sourceRepo')||pt.getval(x,'__builtIn')) {
    return x;
  } else {
    var parent = pt.getval(x,'parent');
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
    if (require.repo === '.') {// relative to current rep
      repo = xrepo;
    }
    if ((x.__sourceRepo === repo) && (x.__sourcePath === require.path)) {
      rs = require.name;
      return true;
    }
  });
  return rs;
}

 
pt.refCount = 0;

/* find the reference path for x.  This will be the path relative to its externalized ancestor, prepended by the path to that ancestor.
 * If this ancestor is repo, then just use '.' to denote it (relative path). 
 */

pt.refPath = function (x,repo) {
  var extAncestor = externalizedAncestor(x,repo),
    builtIn,relative,componentPath,relPath,builtInPath;
  if (extAncestor === undefined) {
    pt.error('Cannot build reference');
  }
  builtIn = pt.getval(extAncestor,'__builtIn');
  relative = extAncestor === repo;
  if ( !(builtIn || relative)) {
    var componentPath = findComponent(extAncestor,repo);
    if ( !componentPath) {
      throw(pt.Exception.mk('Not in a require',x));
    }
  }
  var relPath = x.__pathOf(extAncestor).join('/');                                  
  if (builtIn) {
    builtInPath = extAncestor.__pathOf(pj);
    return builtInPath.join('/') + '/' + relPath;
  }
  if (relative) {
    return './'+relPath;
  }
  return (relPath==='')?componentPath:componentPath+'/'+relPath;
}

  
pt.externalizeDNode = function (node,rootin) {
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
    var protoReference = pt.refPath(proto,root);
        //pt.error('Cannot build reference');

    if (protoReference) {
      rs.__prototype = protoReference;
     
    }
  }
  //var thisHere = this;      
  pt.mapOwnProperties(node,function (child,prop) {
    var childReference,requireReps;
    if (!pt.treeProperty(node,prop,1)) { //1 means includeLeaves
      if (child.__transient) {
        return; 
      }
      childReference = pt.refPath(child,root);
      if (childReference) rs[prop] = {__reference:childReference};
      return; 
    }
    if (!exRecursionExclude[prop]) {
      if (pt.isNode(child)) {
        rs[prop] = pt.externalize(child,root);
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

pt.propertiesOfLNode = ["__setIndex","__head","__computed"];  

  // __properties of the LNode are placed in the first element of the form {__props:1,,, At the moment, only __setIndex is involved.
pt.externalizeLNode = function (node,rootin) {
  var setIndex,head,ln,i,element,rs,props;
  if (rootin) {
    var root = rootin;
  } else { 
    root = node;
  }
  pt.propertiesOfLNode.forEach(function (prop) {
    var val = node[prop];
    if (val !== undefined) {
      if (!props) {
        props = {__props:1};
      }
      props[prop] = val;
    }
  });
  rs = props?[props]:[];
  /* 
  setIndex = node.__setIndex;
  head = node.__head;
  if ((setIndex !== undefined) || head) {
    props = {__props:1};
    rs = [props]; 
    if (setIndex) {
      props.__setIndex = setIndex;
    }
    if (head) {
      props.__head = head;
    }
  } else {
    rs = [];
  }*/
  var ln = node.length;
  for (i=0;i<ln;i++) {
    element = node[i];
    rs.push(pt.isNode(element)?pt.externalize(element,root):element);
  }
  return rs;
}

pt.externalize = function (node,root) {
  if (pt.LNode.isPrototypeOf(node)) {
    return pt.externalizeLNode(node,root);
  } else {
    return pt.externalizeDNode(node,root);
  }
}
  
    
pt.beforeStringify = [];// a list of callbacks
pt.afterStringify = [];

pt.stringify = function (node,repo) {
  var x,jsonX,rs;
  xrepo = repo;
  pt.beforeStringify.forEach(function (fn) {fn(node);});
  x = pt.externalizeDNode(node);
  pt.afterStringify.forEach(function (fn) {fn(node);});
  jsonX = JSON.stringify(x);
  rs = 'prototypeJungle.pt.assertItemLoaded('+jsonX+');\n';
  var fns = node.__funstring();
  rs += fns;
  return rs;
}

//end extract
})(prototypeJungle);