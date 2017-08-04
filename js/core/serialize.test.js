
/* Serialization of deep prototypes.
 * Technique: each node in the JavaScript graph constituting the deep prototype is assigned a code (either a number or string). 
 * Then, objects are assembled which describe each node N by assiging attributes to its code.
 * These  are packaged together into a  single object R, which is serialized as JSON.
 * 
 *  The codes for nodes which are internal to the prototype are sequential integers starting with 0.
 *  Codes for objects referenced by the prototype, but external to it, are needed too.  Such external objects might have been
 *  loaded separately, or built into the application. In any case, external codes have 
 *  the form xN for sequential non-negative integers N.
 *  
 *  Here are the  properties of R  which represent the attributes of nodes N with codes C
 *  (1)  R.atomicProperties, an array. R.atomicProperties[C] is  an object which has the same values for atomic-valued properties
 *       as does N; however function values f are encoded by [f.toString()]
 *  (2) R.objectProperties, an array. R.objectProperties[C]  is an object which maps each object-valued property P of N
 *    to the code for the value of N.P, or to '<code> child' if the external object is a child of value(C) [since __parent links
 *    are not available for coding in the external object]
 *  (3) R.arrays.  An object where R.arrays[C] is defined when N is an array.  R.arrays[C] === length(N).
 *  (4) R.chains: this  contains an array of prototype-chain descriptions, one per head-of-chain. Each description is an array of the codes
 *    of nodes in the chain. Each chain description ends  with the code for an external node.
 * (5) R.externals, an array which gives the meanings of the codes xN for externals.
 * (6) R.requires, an array of all the urls mentioned in R.externals (the files that must be loaded prior to interpretation of this serialization)
 
 *  An external is described by string of one the forms:  [<built-in>]/<path> or [<url>]/<path>
 *
 *  The built-ins for the ProtoChart application are things like "geom", and "ui". For example, "/geom/Point" refers to
 *  the  Point prototype as defined in pj.geom. Any deep prototype which contains Points will define a code 
 *  which is assigned  the value "/geom/Point" in R.externals.
 *
 *  For a separately loaded item, [url] denotes the URl from which it was loaded.
 *
 *  In either case,   <path> specifies the sequence of selections which yield the referred-to object when starting with the external object.
 *  For example, [htps://protochart/repo1/chart/column.js]/graph/axis denotes the object X.graph.axis, where X is the item that was loaded
 *  from https://protochart/repo1/chart.column.js. 
 *  
 * R.chains[0][0] is the root of the serialization.
 * 
 */

var serializeFunctions = false;


var externalAncestor = function (x,root) {
  if (x.__name === 'defs') {
    debugger;
  }
  if (x === root) {
    return undefined;
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

var dependencies,externalReferences;


var externalReference = function (x) {
  if (x.__get('__referenceString')) {
    return x.__referenceString;
  }
  var url = x.__sourceUrl;
  debugger;
  var rs = '['+url+']';
  x.__referenceString = rs;
  if (!dependencies[url]) {
    dependencies[url] = true;
  }
  externalReferences.push(x); // these need to be cleared after the serialization
  return rs;
  
}

pj.referencePath = function (x,root,missingOk) {
  let extAncestor = externalAncestor(x,root);
  let  builtIn,relative,componentPath,relPath,builtInPath;
  if (extAncestor === undefined) {
    return undefined;
  }
  builtIn = pj.getval(extAncestor,'__builtIn');
  if ( !builtIn) {
    componentPath = externalReference(extAncestor); //findComponent(extAncestor,repo);
    if ( !componentPath) {
      throw(pj.Exception.mk('Not in a require',x));
    }
  }
  if (!x.__pathOf) {
     pj.error('serialize','unexpected condition'); 
  }
  relPath = (x === extAncestor)?'':x.__pathOf(extAncestor).join('/');                                  
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
  dependencies = {};
  externalReferences = [];
  let nodes = [];
  let externals = [];
  let theObjects  = [];
  let chains = [];
  let theArrays = {};
  let externalItems = [];
  let atomicProperties = [];
  let theChildren = [];
  let nodeCount = 0;  
  const assignCode = function (x,notHead) {
    debugger;
    let rs;
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
       pj.error('deserialize','unexpected condition'); 
    }
    if (notHead) {
      x.__notHead = true;
    }
    if (x.__get('__code')) {
      rs = x.__code;
    } else {
      let reference = pj.referencePath(x,root);
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
      let proto = Object.getPrototypeOf(x);
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
  

  
  const buildChain = function (x) {
    if (pj.Array.isPrototypeOf(x)) {
      return undefined;
    }
    let code = x.__code;
    if (typeof code !== 'number') {
       pj.error('serialize','unexpected condition'); 
      return;
    }
    let cx = x;
    let chain = [code];
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
  const excludedProps = {__code:1,__notHead:1,__headOfChain:1};
  
  
  const theProps = function (x,atomic) {
    let rs = undefined;
    const addToResult = function(prop,atomicProp) {
      let vcode;
      if (excludedProps[prop]) {
        return;
      }
      let v = x[prop];
      if (atomicProp) {
        if (!serializeFunctions && (typeof v === 'function')) {
          return;
        }
        if ((v === null)||(typeof v !== 'object')) {
          if (!rs) {
            rs = {};
          }
          if (typeof v === 'function') {
            rs[prop] = [v.toString()];
          } else {
            rs[prop] = v;
          }
        }
      } else {
        if ((v !== null)&&(typeof v === 'object')) {
          if (!rs) {
            rs = {};
          }
          vcode = v.__code;
          if (typeof vcode === 'string') { //an external reference
            if (v.__parent === x) {
              vcode = vcode + ' child';
            }
          }
          rs[prop] = vcode;
        }
      }
    }
    if (pj.Array.isPrototypeOf(x)) {
      let ln = x.length;
      for (let i=0;i<ln;i++) {
        addToResult(i,atomic);
      }
      if (atomic) {
        addToResult('__name',true);
      } else {
        addToResult('__parent',false);
      }
      return rs;
    }
    let props = {};
    let propNames = Object.getOwnPropertyNames(x);
    rs = undefined;
    propNames.forEach(function (prop) {
      addToResult(prop,atomic);
    });
    console.log('the props',rs);
    return rs;
  }
  
  const buildProperties = function () {
    let ln = nodes.length;
    for (let i=0;i<ln;i++) {
      atomicProperties.push(theProps(nodes[i],true));
      theChildren.push(theProps(nodes[i],false));
    }
  }
  
  const externalizeCleanup = function () {
    nodes.forEach((node) => {node.__code = undefined;});
    externalItems.forEach((ext) => {ext.__code = undefined;});
    externalReferences.forEach((x) => {x.__referenceString = undefined;});
  }

  /* The operations have been defined. NOW for the action */
  assignCode(root);
  findObjects();
  theObjects.forEach(buildChain);
  buildProperties();
  let rs = {};
  rs.chains = chains;
  rs.arrays = theArrays;
  rs.atomicProperties = atomicProperties;
  rs.children = theChildren;
  rs.externals = externals;
  debugger;
  rs.__requires = Object.getOwnPropertyNames(dependencies);
  externalizeCleanup();
  return rs;
}


    
pj.beforeStringify = [];// a list of callbacks
pj.afterStringify = []; // ditto


pj.prettyJSON  = false;

pj.stringify = function (node) {
  debugger;
  let srcp = node.__sourceUrl;
  node.__sourceUrl = undefined;// for reference generaation in externalize
  pj.beforeStringify.forEach(function (fn) {fn(node);});
  let x = pj.serialize(node);
  node.__sourceUrl = srcp;
  pj.afterStringify.forEach(function (fn) {fn(node);});
  return  pj.prettyJSON?JSON.stringify(x,null,4):JSON.stringify(x);
}