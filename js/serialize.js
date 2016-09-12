
/* Serialization of deep prototypes.
 * Technique: each node in the JavaScript graph constituting the prototype is assigned a code (either a number or string). 
 * Then, then objects are assembled which describe each node N by assiging attributes to its code.
 * These descriptive arrays and objects are packaged together into a  single object R, which is serialized as JSON.
 * 
 *  The codes for nodes which are internal to the prototype are sequential integers starting with 0.
 *  Codes for objects referenced by the prototype, but external to it, are needed too.  Such external objects might have been
 *  loaded separately, or built into the application. In any case, external codes have 
 *  the form xN for sequential non-negative integers N.
 *  
 *  Here are the arrays and objects which represent the the attributes of node N with code C
 *  (1)  R.atomicProperties, an array. R.atomicProperties[C] is  an object which maps each atomic-valued property P of N to the value of N.P.
 *  (2) R.objectProperties, an array. R.objectProperties[C]  is an object which maps each object-valued property P of N
 *    to the code for the value of N.P.
 *  (3) R.arrays.  An object where R.arrays[C] is defined when N is an array.  R.arrays[C] === length(N).
 *  (4) R.chains: this  contains an array of prototype-chain descriptions, one per head-of-chain. Each description is an array of the codes
 *    of nodes in the chain. Each chain description ends  with the code for an external node.
 * (5) R.externals, an array which gives the meanings of the codes xN for externals.
 *
 *  An external is described by string of one the forms:  [<built-in>]/<path> or [<url>]/<path>
 *
 *  The built-ins for the ProtoChart application are things like "geom", and "ui". For example, "/geom/Point" refers to
 *  the  Point prototype as defined in pj.geom. Any deep prototype which contains Points will define a code 
 *  which is assigned  the value "/geom/Point" in R.externals.
 *
 *  For separately loaded item, [url] denotes the URl from which it was loaded.
 *
 *  In either case,   <path> specifies the sequence of selections which yield the referred-to object when starting with the external object.
 *  For example, [htps://protochart/repo1/chart/column.js]/graph/axis denotes the object X.graph.axis, where X is the item that was loaded
 *  from https://protochart/repo1/chart.column.js. 
 *  
 *  , that is, one which is either built into  the application,
 *  or has been loaded separately. 
 *
 * R.chains[0][0] is the root of the serialization.
 * 
 *  for each code, the following data is included, its atomic properties node is a protoChild if its parent has a prototype, and it has the correspondingly named child of the parent as prototype
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
 // } else if (pj.getval(x,'__sourcePath')||pj.getval(x,'__builtIn')) {
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

var dependencies;

var externalReference = function (x) {
  if (x.__referenceString) {
    return x.__referenceString;
  }
  //var path = x.__sourcePath;
  //var relto = x.__sourceRelto;
  var url = x.__sourceUrl;
  //var rs = '['+(pj.isFullUrl(path)?path:(relto?relto:'')+'|'+path)+']';
  var rs = '['+url+']';
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

pj.serialize = function (root) {
  //root.set('graph2',root.graph.instantiate());
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
  
  // properties that are used in serialization, and that should not themselves be serialized
  var excludedProps = {__code:1,__notHead:1};

  var theProps = function (x,atomic) {
    var rs = undefined;
    var addToResult = function(prop,atomicProp) {
      if (excludedProps[prop]) {
        return;
      }
      var v = x[prop];
      if (atomicProp) {
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
      if (x.__name === 'gridLines') {
        debugger;
      }
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
  buildProperties();
  var rs = {};
  rs.chains = chains;
  rs.arrays = theArrays;
  rs.atomicProperties = atomicProperties;
  rs.children = theChildren;
  rs.externals = externals;
  rs.__requires = Object.getOwnPropertyNames(dependencies);
  externalizeCleanup();
  debugger;
 // pj.internalize2(rs);
  return rs;
  
}


    
pj.beforeStringify = [];// a list of callbacks
pj.afterStringify = []; // ditto




pj.stringify = function (node) {
  var srcp = node.__sourceUrl;
  node.__sourceUrl = undefined;// for reference generaation in externalize
  pj.beforeStringify.forEach(function (fn) {fn(node);});
  var x = pj.serialize(node);
  node.__sourceUrl = srcp;
  //x.__requires = requireRepsFromDependencies(dependencies);
  //x.__repo = xrepo;
  pj.afterStringify.forEach(function (fn) {fn(node);});
  //x.__requires = dependencies;
  var rs =  pj.prettyJSON?JSON.stringify(x,null,4):JSON.stringify(x);
  debugger;
  return rs;
}
