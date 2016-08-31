
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
  return (relPath==='')?componentPath:componentPath+relPath;
}

pj.externalize1 = function (root) {
  root.set('graph2',root.graph.instantiate());
  dependencies = {};
  var nodes = [];
  var externals = [];
  var theObjects  = [];
  var chains = [];
  var theArrays = {};
  var externalItems = [];
  var atomicProperties = [];
  var theChildren = [];
  var nodeCount = 0;
  debugger;
  
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
      debugger; // should not happen
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
      return rs;
    }
    var props = {};
    var propNames = Object.getOwnPropertyNames(x);
    var rs = undefined;
    propNames.forEach(function (prop) {
      addToResult(prop);
    });
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
  }

  assignCode(root);
  findObjects();
  theObjects.forEach(buildChain);
  debugger;
  buildProperties();
  var rs = {};
  rs.chains = chains;
  rs.arrays = theArrays;
  rs.atomicProperties = atomicProperties;
  rs.children = theChildren;
  rs.externals = externals;
  rs.requires = Object.getOwnPropertyNames(dependencies);
  externalizeCleanup();
  pj.ii(rs);
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