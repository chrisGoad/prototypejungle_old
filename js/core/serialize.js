// Copyright 2019 Chris Goad
// License: MIT

/* Serialization of prototype trees.
 * Technique: each node in the JavaScript graph constituting the prototype tree is assigned a code (either a number or string). 
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
 *  (2) R.children, an array. R.children[C]  is an object which maps each object-valued property P of N
 *    to the code for the value of N.P
 *  (3) R.arrays.  An object where R.arrays[C] is defined when N is an array.  R.arrays[C] === length(N).
 *  (4) R.chains: this  contains an array of prototype-chain descriptions, one per head-of-chain. Each description is an array of the codes
 *    of nodes in the chain. Each chain description ends  with the code for an external node.
 * (5) R.externals, an array which gives the meanings of the codes xN for externals.
 * (6) R.__requires, an array of all the urls mentioned in R.externals (the files that must be loaded prior to interpretation of this serialization)
 
 *  An external is described by string of one the forms:  [<built-in>]/<path> or [<url>]/<path>
 *
 *  The built-ins for the PrototypeJungle application are things like "geom", and "ui". For example, "/geom/Point" refers to
 *  the  Point prototype as defined in pj.geom. Any prototype tree which contains Points will define a code 
 *  which is assigned  the value "/geom/Point" in R.externals.
 *
 *  For a separately loaded item, [source] denotes the URl from which it was loaded.  URLs come in two forms: <path> (eg /shape/arrow.js),
 *  and (username)<path> (eg (sys)/test/circle.js). 
 *  The former denotes a path in PrototypeJungle's own repository (https://prototypejungle.org/repo1),
 and latter a path in the repository of the given user.
 *
 *  In either case,   <path> specifies the sequence of selections which yield the referred-to object when starting with the external object.
 *  For example, [/shape/arrow.js]/head denotes the object X.head, where X is the item that was loaded from /shape/arrow.js 
 *  
 * R.chains[0][0] is the root of the serialization.
 * 
 */


let serializeFunctions = false;

const externalAncestor = function (x,root) {
  if (x === root) {
    return undefined;
  } else if (getval(x,'__sourceUrl')||getval(x,'__builtIn')) {
    return x;
  } else {
    let parent = getval(x,'__parent');
    if (parent) {
      //return externalizedAncestor(parent,root);
      return externalAncestor(parent,root);
    } else {
      return undefined;
    }
    
  }
}

let dependencies,externalReferences;


const externalReference = function (x) {
  if (x.__get('__referenceString')) {
    return x.__referenceString;
  }
  let url = x.__sourceUrl;
  let rs = '['+url+']';
  x.__referenceString = rs;
  if (!dependencies[url]) {
    dependencies[url] = true;
  }
  externalReferences.push(x); // these need to be cleared after the serialization
  return rs;
  
}


const referencePath = function (x,root) {
  let extAncestor = externalAncestor(x,root);
  let  builtIn,componentPath,relPath,builtInPath;
  if (extAncestor === undefined) {
    return undefined;
  }
  builtIn = getval(extAncestor,'__builtIn');
  if ( !builtIn) {
    componentPath = externalReference(extAncestor); //findComponent(extAncestor,repo);
    if ( !componentPath) {
      throw(Exception.mk('Not in a require',x));
    }
  }
  if (!x.__pathOf) {
     error('serialize','unexpected condition'); 
  }
  relPath = (x === extAncestor)?'':x.__pathOf(extAncestor).join('/');                                  
  if (builtIn) {
    if (extAncestor === codeRoot) {
      return relPath;
    } else {
      builtInPath = extAncestor.__pathOf(codeRoot);
      return builtInPath.join('/') + '/' + relPath;
    }
  }
  return (relPath==='')?componentPath:componentPath+relPath;
}

const encode = function (root) {
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
  const assignCode = function (x,depth,notHead) {
    let rs;
    if (ArrayNode.isPrototypeOf(x)) {
      if (x.__code) {
        return x.__code;
      } else {
        rs = x.__code = nodeCount++;
        nodes.push(x);
        x.forEach(function (child) {
          if (child && (typeof child === 'object')) {
            assignCode(child,depth+1);
          }
        });
        return rs;
      }
    }
    if (!x || !(x.__get)) {
       error('deserialize','unexpected condition'); 
    }
    if (notHead) {
      x.__notHead = true;
    }
    if (x.__get('__code')) {
      rs = x.__code;
    } else {
      let reference = referencePath(x,root);
      if (reference) {
        rs = 'x'+externals.length;
        externals.push(reference);
        x.__code = rs;
        externalItems.push(x);
        return rs;
      }
      nodes.push(x);
      rs = x.__code = nodeCount++;
      forEachTreeOrExternalProperty(x,function (child) {
        assignCode(child,depth+1);
      });
    }
    if (typeof rs === 'number') {
      let proto = Object.getPrototypeOf(x);
      if (proto) {
        assignCode(proto,depth+1000,true);
      }
    }
    return rs;
  }


  
  const findObjects = function () {
  
    let ln = nodes.length;
    for (let i=0;i<ln;i++) {
      let node = nodes[i];
      if (ArrayNode.isPrototypeOf(node)) {
        theArrays[i] = node.length;
      } else if (!node.__get('__notHead')) {
        theObjects.push(node);
      }
    }
  }
  
  const buildChain = function (x) {
    if (ArrayNode.isPrototypeOf(x)) {
      return undefined;
    }
    let code = x.__code;
    if (typeof code !== 'number') {
       error('serialize','unexpected condition'); 
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
        if (!serializeFunctions && (typeof v === 'function')  && !(v.serializeMe)) {
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
    /*
    if (ArrayNode.isPrototypeOf(x)) {
      debugger; //keep
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
    }*/
    let propNames = Object.getOwnPropertyNames(x);
    rs = undefined;
    let isArray = ArrayNode.isPrototypeOf(x);
    let ln;
    if (isArray) {
      ln = x.length;
    }
    propNames.forEach(function (prop) {
      if (isArray) {
        let n = Number(prop);
        if (isNaN(n) || (n < ln)) {
          addToResult(prop,atomic);
        }
      } else {
        addToResult(prop,atomic);
      }
    });
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
    nodes.forEach((node) => {node.__notHead = undefined;});
    externalItems.forEach((ext) => {ext.__code = undefined;});
    externalReferences.forEach((x) => {x.__referenceString = undefined;});
  }

  /* The operations have been defined. NOW for the action */
  assignCode(root,0);
  findObjects();
  theObjects.forEach(buildChain);
  buildProperties();
  let rs = {};
  rs.chains = chains;
  rs.arrays = theArrays;
  rs.atomicProperties = atomicProperties;
  rs.children = theChildren;
  rs.externals = externals;
  rs.__requires = Object.getOwnPropertyNames(dependencies);
  externalizeCleanup();
  return rs;
}


    
let beforeSerialize = [];// a list of callbacks
let afterSerialize = []; // ditto
  
const serialize = function (node) {
  let srcp = node.__sourceUrl;
  node.__sourceUrl = undefined;// for reference generaation in externalize
  beforeSerialize.forEach(function (fn) {fn(node);});
  let rs = encode(node);
  node.__sourceUrl = srcp;
  afterSerialize.forEach(function (fn) {fn(node);});
  return rs;
}

let prettyJSON  = false;


const stringify = function (node) {
  let x = serialize(node);
  return  prettyJSON?JSON.stringify(x,null,4):JSON.stringify(x);
}

export {encode,serialize,stringify,referencePath,beforeSerialize,afterSerialize};