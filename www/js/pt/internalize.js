
(function (pj) {
  var pt = pj.pt;
// This is one of the code files assembled into pjom.js. 'start extract' and 'end extract' indicate the part used in the assembly


//start extract


// <Section> internalize ====================================================

var irepo; // the repo (if any) for the current internalization

var iroot; // the root of the internalization


/* algorithm for internalization, taking prototypes into account.
  recurse from top of tree down.
  when __prototype is found, compute the prototype chain, and attach it to the nodes
  in the chain.
  when __protoChild is found, do the same thing, which will be possible
  because the parent chain will already exist.
  
  next is the object creation phase. First build the objects for the chains. Attach these  at __v
  then build the rest. finally stitch together.
*/

var allEChains = [];
// the last element of a chain is either null
// for chains that terminate inside the object being internalized,
// or an externap pre-existing thing.
//var logCount = 0;
var installParentLinks1 = function (xParent,x) {
  if (x && (typeof x === 'object')) {
    for (var prop in x) {
      if (x.hasOwnProperty(prop)) {
        var v = x[prop];
        if (v && (typeof v === 'object')) {
          if (!v.__reference) {
            v.name = prop;
            installParentLinks1(x,v);
          }
        }
      }
    }
    if (xParent) x.parent = xParent;
    
  }
}

var installParentLinks = function (x) {
  return installParentLinks1(null,x);
}



// dst is the tree into which this is being internalized
// iroot is the root of this internalization;
// we are building the chain for x
// xParent is x's parent
// '__prototypev' is the value of the __prototype path

// the chain[0] is the object outside the iroot from which the internalized part of the chain starts
// for an object in iroot which has no __prototype or __protoChild, chain[0] is null, meaning inherit from pt.DNode only

// the result returned by buildEchain is wrapped in [] if it is external
  

pt.errorOnMissingProto = 0;

var buildEChain = function (x) {
  var protoRef,proto,rs,xParent,protoParent;
  protoRef = x.__prototype;
  if (protoRef) {
    // this might be a path within the internalized object, or somewhere in the
    // existing tree.
    var proto = resolveReference(protoRef);
    if (proto) {
      pt.log('untagged','setting prototypev for ',protoRef);
      x.__prototypev = proto;
    } else {
      if (pt.errorOnMissingProto) {
        pt.error('Missing path in internalize ',protoRef);
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
  if (x.__protoChild) {
    xParent = x.parent;
    if (!xParent) pt.error('__protoChild root of serialization not handled yet');
    // to deal with this, put in __prototype link instead, when serializing
    protoParent = xParent.__prototypev;
    if (!protoParent) {
      pt.error('Missing __prototypev');// this should not happen
     // xParent is external to iroot - already internalized. So the start of the child's prototype chain is xParent's own child named x.name
     proto = xParent[x.name];
     rs = [proto];
    } else {
      proto = protoParent[x.name];
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
    }
    rs.push(x);
    x.__chain = rs;
    x.__prototypev = proto;
    return rs;      
  }
}

var recurseExclude = {__v:1,__prototype:1,__function:1,__prototypev:1,parent:1,name:1,__chain:1,__reference:1};

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
var allLNodes = []; // these need fixing; first els contain xform


var collectEChains = function (x) {

  var chain = x.__chain,
    prop,v;
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
  var ln = chain.length,
    proto,chainCurrent,current,i;
  if (chain[0]) { // a prototype external to the internlization
    proto = chain[0];
  } else {
    proto = pt.DNode.mk();
  }
  for (i=1;i<ln;i++) {
    chainCurrent = chain[i];
    current = chainCurrent.__v;
    if (!current) {    
      current = Object.create(proto);
      current.name = chainCurrent.name;
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
      v = pt.LNode.mk();
    } else {
      v = pt.DNode.mk();
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
  var setIndex,head,xv = x.__v,
    first,iv,prop,parent;
  if (xv === undefined) {
    pt.error('internal');
  }
  if (Array.isArray(x)) {
    var first = 1;;
    x.forEach(function (v,n) {
      if (first && v && (typeof(v) === 'object') && (v.__props)) {
    
        pt.propertiesOfLNode.forEach(function (prop) {
          var val = v[prop];
          if (val !== undefined) {
            xv[prop] = val;
          }
        });
        first = 0;
        return;
      }   
        
      /*  setIndex = v.__setIndex;
        head = v.__head;
        if (setIndex !== undefined) {
          xv.__setIndex = v.__setIndex;
        }
        if (head) {
          xv.__head = head;
        }
        first = 0;
        return;
      }
      */
      first = 0;
      if (v && ((typeof(v) === 'object'))) {
        stitchTogether(v);
        xv.push(v.__v);
      } else {
        xv.push(v);
      }
    });
  } else {
    for (var prop in x) {
      if (x.hasOwnProperty(prop) && !recurseExclude[prop]) {
        var v = x[prop];
        
        if (v && (typeof(v) === 'object')) {
          if (v.__missingProto) {
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
  xv.name = x.name
  var parent = x.parent;
  if (parent) {
    xv.parent = parent.__v;
  }
}


// next 2 functions used only youtside of internalize, but included here because of related code
pt.getRequireUrl =  function (itm,name) {
  var require,repo;
  if (typeof name === 'string') {
    var require = pt.getRequire(itm,name);
  } else {
    require = name;
  }
  if (require) {
    repo = require.repo==='.'?itm.__sourceRepo:require.repo;
    return  repo + '/' + require.path;
  }
}

pt.getRequireValue = function (item,name) {
  var url = pt.getRequireUrl(item,name);
  if (url) {
    return pt.installedItems[url];
  }
}


// reference will have one of the forms componentName/a/b/c, /builtIn/b , ./a/b The last means relative to the root of this internalization
var resolveReference = function (reference) {
  var refSplit = reference.split('/'),
    rln = refSplit.length,
    current,require,repo,url,r0,i;
  if (rln === 0) return undefined;
  r0 = refSplit[0];
  if (r0 === '') {// builtin
    current = pj;
  } else  if (r0 === '.') { // relative to the top
    current = iroot.__v;
    if (current === undefined) {
      current = iroot;
    }
  } else { // relative to a require
    require = pt.getRequire(iroot,r0);
    repo = require.repo==='.'?irepo:require.repo;
    url = repo + '/' + require.path;
    current = pt.installedItems[url];
  }
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
  pt.deepDeleteProps(nd,['__prototypev','__protoChild','__prototype']);
}
// if pth is a url (starting with http), then put this at top
// if x has require, the require mighe be repo-relative (ie c.repo = '.'). In this case, we need the repo argument to find them in the installedItems
pt.internalize = function (x,repo) {
  //pt.repo = pt.repoNodeFromPath(pth);
  irepo = repo;
  iroot = x;
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