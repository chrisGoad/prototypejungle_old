
(function (pj) {

// This is one of the code files assembled into pjcore.js. 'start extract' and 'end extract' indicate the part used in the assembly


//start extract


// <Section> internalize ====================================================

var irepo; // the repo (if any) for the current internalization

var iroot; // the root of the internalization

var requiresForInternalize;

/* algorithm for internalization (deserialization), taking prototypes into account.
  recurse from top of tree down.
  when __prototype is found, compute the prototype chain, and attach it to the nodes
  in the chain.
  when __protoChild is found, do the same thing, which will be possible
  because the parent chain will already exist.
  
  next is the object creation phase. First build the objects for the chains. Attach these  at __v
  then build the rest. finally stitch together.
*/

var allEChains = [];

/* the last element of a chain is either null
 * for chains that terminate inside the object being internalized,
 * or an externap pre-existing thing.
 */

var installParentLinks1 = function (xParent,x,d) {
  var prop,v;
  if (!d) {
    d = 0;
  }
  if (d > 100) {
    console.log('Overflow installParentLinks1');
    debugger;
  }
  d++;
  if (x && (typeof x === 'object')) {
    if (!x.__parent) {
      for (prop in x) {
        if (x.hasOwnProperty(prop)) {
          v = x[prop];
          if (v && (typeof v === 'object')) {
            if (!(v.__reference || v.__function)) {
              v.__name = prop;
              installParentLinks1(x,v,d);
            }
          }
        }
      }
    }
    if (xParent) x.__parent = xParent;
    
  }
}

var installParentLinks = function (x) {
  return installParentLinks1(null,x);
}



/* dst is the tree into which this is being internalized
 * iroot is the root of this internalization;
 * we are building the chain for x
 * xParent is x's parent
 * '__prototypev' is the value of the __prototype path

 * The chain[0] is the object outside the iroot from which the internalized part of the chain starts
 * for an object in iroot which has no __prototype or __protoChild, chain[0] is null, meaning inherit from pj.Object only

 * the result returned by buildEchain is wrapped in [] if it is external
 */
  

pj.errorOnMissingProto = 0;

var buildEChain = function (x) {
  var protoRef = x.__prototype;
  var proto,rs,xParent,protoParent,protoParentRef,isPPC;  
  isPPC = (protoRef === '..pc'); // the prototype is reached via the steps __parent,proto,child
  if (protoRef && !isPPC) {
    // this might be a path within the internalized object, or somewhere in the existing tree.
    proto = resolveReference(protoRef,x);
    if (proto) {
      pj.log('untagged','setting prototypev for ',protoRef);
      x.__prototypev = proto;
    } else {
      if (pj.errorOnMissingProto) {
        pj.error('Missing path in internalize ',protoRef);
      } else {
        x.__missingProto = 1;
        return;
      }
    }
    if (protoRef[0] === '.') { // starts with '.', ie the prototype is within iroot
      rs = buildEChain(proto);
      if (!rs) rs = [null,proto]; // explained above
      rs.push(x);
    } else {// proto is outside of the iroot
      rs = [proto,x];
    }
    x.__chain = rs;
    return rs;
  }
  if (isPPC) {
    proto = resolveReference(protoRef,x);
/*
    xParent = x.__parent;
    if (!xParent) pj.error('..pc root of serialization not handled yet');
    // to deal with this, put in __prototype link instead, when serializing
    protoParent = xParent.__prototypev;
    if (!protoParent) {
      protoParentRef = xParent.__prototype;
      if (protoParentRef) {
        protoParent = resolveReference(protoParentRef);
      }
    }
    if (!protoParent) {
      pj.error('Missing __prototypev');// this should not happen
     // xParent is external to iroot - already internalized. So the start of the child's prototype chain is xParent's own child named x.__name
     //proto = xParent[x.__name];
     //rs = [proto];
    } else { 
      proto = protoParent[x.__name];
    */
    if (proto) {
      rs = buildEChain(proto);
    } else {
      rs = undefined;
    }
    // watch out.  maybe proto is external
    if (!rs) {
      // this will happen only when proto is external to iroot
      rs = [proto];
    }
    rs.push(x);
    x.__chain = rs;
    x.__prototypev = proto;
    return rs;      
  }
}

var recurseExclude = {__v:1,__prototype:1,__function:1,__prototypev:1,__parent:1,__name:1,__chain:1,__reference:1};

var buildEChains = function (ix) {
  var x,prop,child;
  if (ix) {
    x = ix;
  } else {
    x = iroot;      
  }
  buildEChain(x);
  for (prop in x) {
    if (x.hasOwnProperty(prop) && (!recurseExclude[prop])) {
      child = x[prop];
      if (child && (typeof child === 'object')) {
        buildEChains(child);
      }
    }
  }
}


var allChains = [];
var allArrays = []; // these need fixing; first els contain xform


var collectEChains = function (x) {
  var chain = x.__chain;
  var prop,v;
  if (chain && (!chain.__collected)) {
    allChains.push(chain);
    chain.__collected = true;
  }
  for (prop in x) {
    if (x.hasOwnProperty(prop) && (!recurseExclude[prop])) {
      v = x[prop];
      if (v && (typeof v === 'object')) {
        collectEChains(v);
      }
    }
  }
}

/* build the objects with __proto__s
 * put names here for debugging; could happen at a later stage
 */

var buildObjectsForChain = function (chain) {
  var ln = chain.length;
  var proto,chainCurrent,current,i;
  if (chain[0]) { // a prototype external to the internlization
    proto = chain[0];
  } else {
    proto = pj.Object.mk();
  }
  for (i=1;i<ln;i++) {
    chainCurrent = chain[i];
    current = chainCurrent.__v;
    if (!current) {    
      current = Object.create(proto);
      current.__name = chainCurrent.__name;
      chainCurrent.__v = current;
    }
    proto = current;
  }
}

var buildObjectsForChains = function () {
  allChains.forEach(function (v) {
    buildObjectsForChain(v);
  })
}

var buildObjectsForTree = function (x) {
  var v,isArray,vType,ln,i,prop;
  if (!x.__v) {
    var isArray=Array.isArray(x);
    if (isArray) {
      v = pj.Array.mk();
    } else if (!x.__function) {
       v = pj.Object.mk(); 
    }
    x.__v = v;
  }
  var buildForChild= function (prop) {
    var v = x[prop];
    if (v) {
      var vType = typeof(v);
      if (vType === 'object') {
        if (!v.__reference) {
          buildObjectsForTree(v);
        }
      }
    }
  }
  if (isArray) {
    ln=x.length;
    for (i=0;i<ln;i++) {
      buildForChild(i);
    }
  } else {
    for (prop in x) {
      if (x.hasOwnProperty(prop) && !recurseExclude[prop]) {
        buildForChild(prop);
      }
    }
  }
  
}

var referencesToResolve;

var stitchTogether = function (x) {
  var xv = x.__v;
  var setIndex,head,first,iv,prop,parent;
  if (xv === undefined) {
    pj.error('internal');
  }
  if (Array.isArray(x)) {
    var first = 1;;
    x.forEach(function (v,n) {
      if (first && v && (typeof(v) === 'object') && (v.__props)) {
    
        pj.propertiesOfArray.forEach(function (prop) {
          var val = v[prop];
          if (val !== undefined) {
            xv[prop] = val;
          }
        });
        first = 0;
        return;
      }   
      first = 0;
      if (v && ((typeof(v) === 'object'))) {
        stitchTogether(v);
        xv.push(v.__v);
      } else {
        xv.push(v);
      }
    });
  } else {
    for (prop in x) {
      if (x.hasOwnProperty(prop) && !recurseExclude[prop]) {
        var v = x[prop];
        
        if (v && (typeof(v) === 'object')) {
          if (v.__missingProto) {
            continue;
          }
          if (v.__function) {
            eval('xv.'+prop+'='+v.__function);
            continue; 
          }
          if (v.__reference) {
            referencesToResolve.push([xv,prop,v.__reference]);
          } else {
            xv[prop] = v.__v; 
            stitchTogether(v);
          }
        } else {
          xv[prop] = v;
        }
      }
    }
  }
  xv.__name = x.__name
  var parent = x.__parent;
  if (parent) {
    xv.__parent = parent.__v;
  }
}


// next 2 functions used only outside of internalize, but included here because of related code
/*
pj.getRequireUrl =  function (itm,id) {
  var require,repo;
  if (typeof id === 'string') {
    var require = pj.getRequire(itm.__requires,id);
  } else {
    require = id;
  }
  if (require) {
    repo = require.repo==='.'?itm.__sourceRepo:require.repo;
    return  repo + '/' + require.path;
  }
}

pj.getRequireValue = function (item,id) {
  var url = pj.getRequireUrl(item,id);
  if (url) {
    return pj.installedItems[url];
  }
}
*/

// reference will have one of the forms ..pc, [componentRef]/a/b/c, /builtIn/b , ./a/b The last means relative to the root of this internalization
// If present,  fromX is the instance whose __prototype is being resolved.
var resolveReference = function (reference,fromX) { 
   var rln,current,url,r0,i,closeB,extref,sextref,refRest,refSplit,parent,parentProto,parentProtoRef;
  if (reference === '..pc') {
    parent = fromX.__parent;
    if (!parent) pj.error('..pc root of serialization not handled yet');
    // to deal with this, put in __prototype link instead, when serializing
    parentProto = parent.__prototypev;
    if (!parentProto) {
      parentProtoRef = parent.__prototype;
      if (parentProtoRef) {
        parentProto = resolveReference(parentProtoRef,parent);
      }
    }
    if (parentProto) {
      return parentProto[fromX.__name]
    }
    //code
  } else if (reference[0] === '[') { // external reference
    closeB = reference.indexOf(']');
    extref = reference.substring(1,closeB);
    sextref = extref.split('|');
    url = sextref[0]+'/'+sextref[1];
    current = pj.installedItems[url];
    refRest = reference.substring(closeB+1);
    refSplit = refRest.split('/');
    rln = refSplit.length;
  } else {
    refSplit = reference.split('/');
    rln = refSplit.length;
    if (rln === 0) return undefined;
    r0 = refSplit[0];
    if (r0 === '') {// builtin
      current = pj;
    } else  if (r0 === '.') { // relative to the top
      current = iroot.__v;
      if (current === undefined) {
        current = iroot;
      }
    } else {
      pj.error('Bad form for reference ',reference);
    }
  } 
  /*{ // relative to a require
    require = pj.getRequire(requiresForInternalize,r0);
    repo = require.repo==='.'?irepo:require.repo; 
    url = repo + '/' + require.path;
    current = pj.installedItems[url];
  }*/
  for (i=1;i<rln;i++) {
    if (current && (typeof current==='object')) {
      current = current[refSplit[i]];
    } else {
      return undefined; 
    }
  }
  return current;
}
// rt 'resolve triple' of the form [parent,property,reference]
var resolveReferences = function () {
  referencesToResolve.forEach(function (toResolve) {
    var resolved = resolveReference(toResolve[2]);
    toResolve[0][toResolve[1]] = resolved;
  });
}



var cleanupAfterInternalize = function (nd) {
  pj.deepDeleteProps(nd,['__prototypev','__protoChild','__prototype']);
}
/**
 * if pth is a url (starting with http), then put this at top
 * if x has require, the require mighe be repo-relative (ie c.repo = '.').
 * In this case, we need the repo argument to find them in the installedItems
 */

pj.internalize = function (x,repo,requires) {
  irepo = repo;
  iroot = x;
  requiresForInternalize = requires;
  referencesToResolve = [];
  installParentLinks(x);
  buildEChains(x);
  collectEChains(x);
  buildObjectsForChains();
  buildObjectsForTree(x);
  stitchTogether(x);
  var rs = x.__v;
  resolveReferences();
  cleanupAfterInternalize(rs);
  return rs;
}


//end extract
})(prototypeJungle);