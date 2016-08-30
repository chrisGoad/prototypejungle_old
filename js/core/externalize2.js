
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

var dependencies;

var externalReference = function (x) {
  if (x.__referenceString) {
    return x.__referenceString;
  }
  var path = x.__sourcePath;
  var relto = x.__sourceRelto;
  var rs = '['+(pj.isFullUrl(path)?path:(relto?relto:'')+'|'+path)+']';
  x.__referenceString = rs;
  if (!dependencies[rs]) {
    dependencies[rs] = true;
  }
  return rs;
  
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
var theObjects;
//var theArrays = {};
//var chainTerminatorObject;
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
   // debugger;
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
  theObjects.forEach(function (x) {
    if (pj.Array.isPrototypeOf(x)) {
      if (x.__renumbered) {
        return;
      }
      if (count === 1) {
      //  debugger;
      }
      //x.__newnumber = renumbering[x.__code] = count++;
      x.__oldCode = x.__code;
      x.__code = renumbering[x.__code] = count++;
      x.__renumbered = true;
      return;
    }
    if (x.__get('__name') === 'graph2') {
     // debugger;
    }
    var code = x.__code;
    if (typeof code !== 'number') {
      debugger; // should not happen
      return;
    }
    var cx = x;
    var headCode = count;
    //var chainLength = 0;
    while (true) {
         if (count === 1) {
       //  debugger;
      }      
      //cx.__newnumber = renumbering[code] = count++;
      cx.__oldCode = cx.__code;

      cx.__code = renumbering[code] = count++;
      //chainLength++;
      //renumbering[code] = theObjects.push(count++);
      cx.__renumbered = true;
      cx = Object.getPrototypeOf(cx);
      if (!cx) {
        //chainLengths[cx.__code] = chainLength;
        return;
      }
      code = cx.__code;
      if (typeof code !== 'number') {
        x.__chainTerminator = code;
        //chainTerminatorObject[headCode] = cx;
        return;
      }
    }
  });
}

pj.findNode = function (n) {
  debugger;
  var ln = nodes.length;
  for (var i=0;i<ln;i++) {
    var node = nodes[i];
    if (node.__newnumber === n) {
      return node;
    }
    //code
  }
}


pj.findObject = function (n) {
  debugger;
  var ln = theObjects.length;
  for (var i=0;i<ln;i++) {
    var node = theObjects[i];
    if (node.__newnumber === n) {
      return node;
    }
    //code
  }
}
var newNodes = {};

var renumberArray = function (a) {
  var newMap = {};
  var ln = a.length;
  a.forEach(function (x) {
    //newMap[renumbering[x.__code]] = x;
    newMap[x.__code] = x;
  });
  for (var i=0;i<ln;i++) {
    a[i] = newMap[i];
  }
}


var atomicProperties = {};

var theProps = function (x,atomic) {
  var rs = undefined;
  var addToResult = function(prop) {
    var v = x[prop];
    if (atomic) {
      if ((v === null)||(typeof v !== 'object')) {
        if (!rs) {
          rs = {};
        }
        rs[prop] = v;
      }
    } else {
      if ((v !== null)&&(typeof v === 'object')) {
        if (!rs) {
          rs = {};
        }
        rs[prop] = v.__code;      
      }
    }
  }
  if (pj.Array.isPrototypeOf(x)) {
    var ln = x.length;
    for (var i=0;i<ln;i++) {
      addToResult(i);
    }
    if (rs) {
      rs.__isArray = true;
    }
    return rs;
  }
  var props = {};
  var propNames = Object.getOwnPropertyNames(x);
  var rs = undefined;
  propNames.forEach(function (prop) {
    addToResult(prop);
  /*  var v = x[prop];
    if ((v === null)||(typeof v !== 'object')) {
      if (!rs) {
        rs = {};
      }
      rs[prop] = v;
    }*/
  });
  return rs;
}


var atomicProperties;

var buildAtomicProperties = function () {
  atomicProperties = {};
  var ln = nodes.length;
  for (var i=0;i<ln;i++) {
    var aprops = theProps(nodes[i],true);
    if (aprops) {
      atomicProperties[i] = aprops;
    }
  }
}


var theChildren;
var buildChildren = function () {
  theChildren = {};
  var ln = nodes.length;
  for (var i=0;i<ln;i++) {
    var props = theProps(nodes[i]);
    if (props) {
      theChildren[i] = props;
    }
  }
}
pj.externalize1 = function (x) {
  root = x;
 root.set('graph2',root.graph.instantiate());
  var inodes = nodes = [];
  var ix = externals = [];
  dependencies = {};
  pj.nodes = nodes;
  pj.externals = externals;
  debugger;
  assignCode(x);
  findObjects();
  computeRenumbering();
  debugger;
  //var fn = pj.findNode(0);
  var oo = theObjects;
  debugger;
  renumberArray(nodes);
  findObjects();
  //renumberArray(theObjects);

  chainTerminators = [];
  //chainTerminators.length = theObjects.length;
  theObjects.forEach(function (x) {
     chainTerminators.push(x.__chainTerminator);
     //chainTerminators.push(renumbering[x.__code]);
  });
  debugger;
  buildAtomicProperties();
  buildChildren();
  //for (var i in chainTerminatorObject) {
 //   var ob = chainTerminatorObject[i];
  //  chainTerminators[renumbering[i]] = ob;
  //}
  var ee = externals;
  var ccc = theChildren;
  var aa = atomicProperties;
  var oo = theObjects;
  var nn = renumbering;
  var cc = chainTerminators;
  var dd  = dependencies;
  var rs = {};
  var objectCodes = [];
  theObjects.forEach(function (x) {
    objectCodes.push(x.__code);
  });
  var oc = objectCodes;
  rs.nodeCount = nodes.length;
  rs.objects = objectCodes;
  rs.atomicProperties = atomicProperties;
  rs.children = theChildren;
  rs.chainTerminators = chainTerminators;
  rs.externals = externals;
  rs.requires = Object.getOwnPropertyNames(dependencies);
  debugger;
  return rs;
  
}

pj.ss = function (node) {
  var srcp = node.__sourcePath;
  node.__sourcePath = undefined;// for reference generaation in externalize
  pj.beforeStringify.forEach(function (fn) {fn(node);});
  var x = pj.externalize1(node);
  node.__sourcePath = srcp;
  //x.__requires = requireRepsFromDependencies(dependencies);
  //x.__repo = xrepo;
  pj.afterStringify.forEach(function (fn) {fn(node);});
  x.__requires = dependencies;
  var rs =  pj.prettyJSON?JSON.stringify(x,null,4):JSON.stringify(x);
  debugger;
}
  
  
//end extract
})(prototypeJungle);