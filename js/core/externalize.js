
(function (pj) {

  
// This is one of the code files assembled into pjcore.js. //start extract and //end extract indicate the part used in the assembly

//start extract

// <Section> Externalize ==========================



/* a node is a protoChild if its parent has a prototype, and it has the correspondingly named child of the parent as prototype
 *
 * 
 * Any top level externalizable item may have a __requires field.  each component has an id  and url
 * if the url has the form '/...' this means that it is relative to it's own repo, whose url is held in __repo
 * In internalization, pj.itemsLoaded holds the items loaded so far by url. Every loaded item has  __sourceRepo and __sourcePath
 * fields, describing where it was loaded from.
 * In the externalized object, references to external objects have the form repo|path where repo = "." means from
 * the objects own repo. References may also take the forms
 * /<internalpath> such as /pj/Object or /svg/g.  ./path is used for references
 * within the object being externalized.
 */ 

// this is the repo for the current externalization. Needed to interpret components (but not needed if no components)
//var xrepo; 


pj.Object.__isProtoChild = function () {
  var proto = Object.getPrototypeOf(this);
  var  protoParent;
  if (!proto) return false;
  var parent = this.__get('__parent');
  if (!parent) return false;
  protoParent = Object.getPrototypeOf(parent);
  if (!pj.Object.isPrototypeOf(protoParent)) return false;
  return protoParent[this.__name] === proto;
}

  

Function.prototype.__isProtoChild = function () {return false;}

// rti is the root of the externalization, or null, if this is the root
var exRecursionExclude = {__prototype:1,__name:1,__typePrototype:1,_parent:1,widgetDiv:1};//,__requires:1} //@todo rename widgetDiv
  
// the object currently being externalized
var currentX ;



var dependencies;

var externalizedAncestor = function (x,root) {
  if (x === root) {
    return undefined;
  } else if (pj.getval(x,'__sourcePath')||pj.getval(x,'__builtIn')) {
    return x;
  } else {
    var parent = pj.getval(x,'__parent');
    if (parent) {
      //return externalizedAncestor(parent,root);
      return externalizedAncestor(parent,root);
    } else {
      return undefined;
    }
    
  }
}

var genExtRef = function (x) {
  var path = x.__sourcePath;
  var relto = x.__sourceRelto;
  return '['+(pj.isFullUrl(path)?path:(relto?relto:'')+'|'+path)+']';
}
  

pj.refCount = 0;

/* find the reference path for x.  This will be the path relative to its externalized ancestor, prepended by the path to that ancestor.
 * If this ancestor is repo, then just use '.' to denote it (relative path). 
 */

pj.refPath = function (x,root,missingOk) {
  var extAncestor = externalizedAncestor(x,root);
  var  builtIn,relative,componentPath,relPath,builtInPath;
  if (extAncestor === undefined) {
    return './'+(x.__pathOf(root).join('/'));
  }
  /*  if (missingOk) {
      return undefined; 
    } else {
      debugger;
    }
    pj.error('Cannot build reference');
  }*/
  builtIn = pj.getval(extAncestor,'__builtIn');
  //relative = extAncestor === repo;
  if ( !builtIn) {// || relative)) {
    var componentPath = genExtRef(extAncestor); //findComponent(extAncestor,repo);
    if ( !componentPath) {
      throw(pj.Exception.mk('Not in a require',x));
    }
  }
  if (!x.__pathOf) {
    debugger;
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
  //if (relative) {
  //  return './'+relPath;
  //}
  return (relPath==='')?componentPath:componentPath+'/'+relPath;
}

   
pj.externalizeObject = function (node,rootin) {
  if (node.__name === 'legend') {
    debugger;
  }
  var rs = {};  
  if (rootin) {
    var root = rootin;
  } else {
   root = node;
  }
  var sourcePath = node.__sourcePath;
  if (sourcePath) { //for identifying components
    rs.__hasSourcePath = 1;
    if (node.__requireDepth === 1) {
      var url = pj.fullUrl(node.__sourceRelto,sourcePath);
      dependencies.push(url);
      debugger;

    }
  }
 var root = undefined;
  var protoChild = node.__isProtoChild();
  if (protoChild) { // in this case, when internalize, we can compute the value of __prototype from the parent and its prototype
    rs.__prototype = "..pc";
  } else {
    var proto =  Object.getPrototypeOf(node);
    var protoReference = pj.refPath(proto,root,1);
        //pj.error('Cannot build reference');

    if (protoReference) {
      rs.__prototype = protoReference;
     
    }
  }
  pj.mapOwnProperties(node,function (child,prop) {
    if (prop === 'forChart') {
      debugger;
    }
    var childReference,requireReps;
    var isNode = pj.isNode(child);
    if (isNode && !pj.treeProperty(node,prop,1)) { //1 means includeLeaves
      childReference = pj.refPath(child,root,1);//1 means tolerate missing 
      if (childReference) rs[prop] = {__reference:childReference};
      return; 
    }
    if (!exRecursionExclude[prop]) {
      if (pj.isNode(child)) {
        rs[prop] = pj.externalize(child,root);
      } else {
        if (typeof child === 'function') {
          rs[prop] = {'__function':child.toString()}
        } else {
          rs[prop] = child;
        }
      } 
    }
  });
  return rs;
}

pj.propertiesOfArray = ["__setIndex","__head","__computed"];  

  // __properties of the Array are placed in the first element of the form {__props:1,,, At the moment, only __setIndex is involved.
pj.externalizeArray = function (node,rootin) {
  var setIndex,head,ln,i,element,rs,props;
  if (rootin) {
    var root = rootin;
  } else { 
    root = node;
  }
  pj.propertiesOfArray.forEach(function (prop) {
    var val = node[prop];
    if (val !== undefined) {
      if (!props) {
        props = {__props:1};
      }
      props[prop] = val;
    }
  });
  rs = props?[props]:[];
  var ln = node.length;
  for (i=0;i<ln;i++) {
    element = node[i];
    rs.push(pj.isNode(element)?pj.externalize(element,root):element);
  }
  return rs;
}

pj.externalize = function (node,root) {
  if (pj.Array.isPrototypeOf(node)) {
    return pj.externalizeArray(node,root);
  } else {
    return pj.externalizeObject(node,root);
  }
}

  
    
pj.beforeStringify = [];// a list of callbacks
pj.afterStringify = [];
/*
var requireRepsFromDependencies = function (dependencies) {
  var tops = [];
  var rest = [];
  // sort so that the top level dependencies appear first
  dependencies.map(function (dep) {
    //return dep.__sourceRepo + '|' + dep.__sourcePath;
    var src =  dep.__sourcePath;
    if (dep.__topLevel) {
      tops.push(src);
    } else {
      rest.push(src);
    }
  });
  return tops;
}
*/
pj.prettyJSON = 0;

//pj.stringify = function (node,repo) { 
pj.stringify = function (node) {
  var srcp = node.__sourcePath;
  node.__sourcePath = undefined;// for reference generaation in externalize
  var x;
  dependencies = [];
  pj.beforeStringify.forEach(function (fn) {fn(node);});
  x = pj.externalizeObject(node);
  node.__sourcePath = srcp;
  //x.__requires = requireRepsFromDependencies(dependencies);
  //x.__repo = xrepo;
  pj.afterStringify.forEach(function (fn) {fn(node);});
  x.__requires = dependencies;
  debugger;
  return pj.prettyJSON?JSON.stringify(x,null,4):JSON.stringify(x);
}

//end extract
})(prototypeJungle);