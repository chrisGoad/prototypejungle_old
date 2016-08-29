
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
/* format: Call the result R. each node X is assigned a number, called codeOf(X).
* R.objects is an array, in ascending order, of the codes of the heads of chains.

* The members of the prototype chain of each object are assigned sequential numbers. R.count is the total number of nodes.
 * Then, the ownProperty relation is given by two objecds:
 *  R.atomicProperties, which assigns to the number N of an object X, an object Y with the same atomic property values as X had
 * R.children, which assigns to N an object C, with C.p = codeOf(X.p) for each property p.
 *
 * External objects and their children have their own codes of the form "Xn" for consequitive numbers n. For external object X,
 * R.externals[codeOf(X)]=  externalReference(x);
 */

 
 
  
var externalAncestor = function (x,root) {
  if (x === root) {
    return undefined;
  } else if (pj.getval(x,'__sourcePath')||pj.getval(x,'__builtIn')) {
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

var externalReference = function (x) {
  var path = x.__sourcePath;
  var relto = x.__sourceRelto;
  return '['+(pj.isFullUrl(path)?path:(relto?relto:'')+'|'+path)+']';
}


pj.referencePath = function (x,root,missingOk) {
  var extAncestor = externalAncestor(x,root);
  var  builtIn,relative,componentPath,relPath,builtInPath;
  if (extAncestor === undefined) {
    return undefined;
    //return './'+(x.__pathOf(root).join('/'));
  }
  builtIn = pj.getval(extAncestor,'__builtIn');
  if ( !builtIn) {
    var componentPath = externalReference(extAncestor); //findComponent(extAncestor,repo);
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
  return (relPath==='')?componentPath:componentPath+'/'+relPath;
}

var nodes = [];
var theObjects = {};
//var theArrays = {};
var chainTerminators;
var chains = {};
var externals = [];
var count = 0;
var externalCount = 0;
var root;

var assignCode = function (x,notHead) {
  var rs;
  if (pj.Array.isPrototypeOf(x)) {
    if (x.__code) {
      return x.__code;
    } else {
      rs = x.__code = count++;
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
    debugger;
  }
  if (x.__get('__name') === 'graph2') {
    debugger;
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
      return rs;
    }
    nodes.push(x);
    rs = x.__code = count++;
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
  theObjects  = [];
  nodes.forEach(function (x) {
    if (!x.__get('__notHead')) {
      theObjects.push(x);
    }
  });
}
var renumbering;
var theObjects;

var computeRenumbering = function () {
  var count = 0;
  renumbering = {};
  chainTerminators = {};
  theObjects.forEach(function (x) {
    if (pj.Array.isPrototypeOf(x)) {
      if (x.__renumbered) {
        return;
      }
      if (count === 1) {
        debugger;
      }
      renumbering[x.__code] = count++;
      x.__renumbered = true;
      return;
    }
    if (x.__get('__name') === 'graph2') {
      debugger;
    }
    var code = x.__code;
    if (typeof code !== 'number') {
      debugger; // should not happen
      return;
    }
    var cx = x;
    var headCode = count;
    while (true) {
         if (count === 1) {
         debugger;
      }      
      cx.__newnumber = renumbering[code] = count++;
   
      //renumbering[code] = theObjects.push(count++);
      cx.__renumbered = true;
      cx = Object.getPrototypeOf(cx);
      if (!cx) {
        return;
      }
      code = cx.__code;
      if (typeof code !== 'number') {
        chainTerminators[headCode] = code;
        return;
      }
    }
  });
}

var renumber = function () {
  var newNodes = {};
  var ln = nodes.length;
  for (var i=0;i<ln;i++) {
    
  }
  nodes.forEach(function (x) {
    
  })
}
  
pj.externalize1 = function (x) {
  root = x;
 root.set('graph2',root.graph.instantiate());
  var inodes = nodes = [];
  var ix = externals = [];
  pj.nodes = nodes;
  pj.externals = externals;
  debugger;
  assignCode(x);
  findObjects();
  computeRenumbering();
  var nn = renumbering;
  var oo = theObjects;
  var cc = chainTerminators;
  debugger;
}

pj.ss = function (node) {
  var srcp = node.__sourcePath;
  node.__sourcePath = undefined;// for reference generaation in externalize
  pj.beforeStringify.forEach(function (fn) {fn(node);});
  var x = pj.externalize1(node);
  return;
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