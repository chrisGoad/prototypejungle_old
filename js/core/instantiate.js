// Copyright 2019 Chris Goad
// License: MIT


// For monitoring.


let instantiateCount = 0;
let internalChainCount = 0;
  


let internalChain;
let includeComputed = false;
let headsOfChains; // for cleanup

/* Here is the main function, which is placed up front to clarify what follows.
 * If count is defined, it tells how many copies to deliver.
 */


ObjectNode.instantiate = function (count) {
  let n = count?count:1;
  let multiRs,singleRs;
  if (n>1) {
    multiRs = [];
  }
  internalChain = false;
  headsOfChains = [];
  markCopyTree(this);
  addChains(this);
  // recurse through the tree collecting chains
  collectChains(this);
  // the same chains can be used for each of the n
  // instantiations
  for (let i=0;i<n;i++) {
    buildCopiesForChains(); // copy them
    buildCopiesForTree(this); // copy the rest of the tree structure
    singleRs = stitchCopyTogether(this);
    clearCopyLinks(this);
    if (n > 1) {
      multiRs.push(singleRs);
    }
  }
  cleanupSourceAfterCopy(this);
  theChains = [];
  instantiateCount++;
  if (internalChain) {
    internalChainCount++;
  }
  headsOfChains.forEach(function (x) {
    delete x.__headOfChain;
  });
  return (n>1)?multiRs:singleRs;
}

let theChains = [];



const markCopyTree = function (node) {
  if (node.__const) {
    return;
  }
  node.__inCopyTree = 1;
  if (includeComputed || !node.__computed) {
    forEachTreeProperty(node,function (c) {
      markCopyTree(c);
    });
  }
}

/* Compute the prototype chain for node - an explicit array of the prototypes.
 * The argument chainNeeded is true when addToChain is called from an object up the chain, rather than the tree recursor
 * We don't bother with chains of length 1.
 */


const addChain = function (node,chainNeeded) {
  if (node.hasOwnProperty('__chain')) {
    return node.__chain;
  }
  let proto = Object.getPrototypeOf(node);
  let typeOfProto = typeof proto;
  let chain;
  if (((typeOfProto === 'function')||(typeOfProto === 'object')) && (proto.__get('__parent'))) { //  a sign that proto is in the object tree
    // is it in the tree being copied?
    if (proto.__inCopyTree) {
      chain = addChain(proto,1).concat(); 
      // @todo potential optimization; pch doesn't need copying if chains don't join (ie if there are no common prototypes)
      internalChain = 1;
      chain.push(node);
    } else {
      // the chain terminates at node for copying purposes
      chain = [node];
    }
    node.__chain = chain;
    return chain;
  } else {
    // this has no prototype within the object tree (not just the copy tree)
    if (chainNeeded) {
      let rs = [node];
      node.__chain = rs;
      return rs;
    } else {
      return undefined;
    }
  }
}

const addChains = function (node) {
  if (node.__const) {
    return;
  }
  addChain(node);
  if (includeComputed || !node.__computed) {
    forEachTreeProperty(node,function (c) {
      addChains(c);
    });
  }
}

const collectChain = function (node) {
  let chain = node.__chain;
  if (chain && (chain.length > 1) &&(!chain.collected)) {
    theChains.push(chain);
    chain.collected = 1;
  }
}

const collectChains = function (node) {
  if (node.__const) {
    return;
  }
  collectChain(node);
  if (includeComputed || !node.__computed) {
    forEachTreeProperty(node,function (c) {
      collectChains(c);
    });
  }
}

const buildCopiesForChain = function (chain) { 
  /**
   * for [a,b,c], a is a proto of b, and b of c
   * current is the last member of the new chain. This is initially the
   * head of the chain back in the old tree.
   */
  let current = chain[0];
  let ln = chain.length;
  /**
   * build the chain link-by-link, starting with the head. proto is the current element of the chain.
   * Start with the head, ie chain[0];
   */
  for (let i=0;i<ln;i++) { 
    let proto = chain[i];
    let protoCopy = proto.__get('__copy');
    if (!protoCopy) {
      //anchor  protoCopy back in the original
      protoCopy = Object.create(current); 
      if (i === 0) {
        protoCopy.__headOfChain = 1;
        headsOfChains.push(protoCopy);
      }
      if (chain.__name) {
        protoCopy.__name = proto.__name;
      }
      proto.__copy = protoCopy;
    }
    current = protoCopy; 
  }
}

const buildCopiesForChains = function () {
  theChains.forEach(function (ch) {buildCopiesForChain(ch);});
}

// __setIndex is used for  ordering children of a Object (eg for ordering shapes), and is sometimes associated with Arrays.

const buildCopyForNode = function (node) {
  let cp  = node.__get('__copy');//added __get 11/1/13
  if (!cp) {
    if (ArrayNode.isPrototypeOf(node)) {
      cp = ArrayNode.mk();
      let setIndex = node.__setIndex;
      if (setIndex !== undefined) {
        cp.__setIndex = setIndex;
      }
    } else {
      cp = Object.create(node);
    }
    node.__copy = cp;
    cp.__headOfChain = 1;
    headsOfChains.push(cp);

  }
}

// prototypical inheritance is for Objects only


const buildCopiesForTree = function (node) { 
  if (node.__const) {
    return;
  }
  buildCopyForNode(node);
  if (includeComputed || !node.__computed) {
    forEachTreeProperty(node,function (child) {
      if (!child.__head) {  // not declared as head of prototype chain
        buildCopiesForTree(child);
      }  
    });
  }
}


const stitchCopyTogether = function (node) { // add the __properties
  if (node.__const) {
    return;
  }
  let isArray = ArrayNode.isPrototypeOf(node),
    nodeCopy = node.__get('__copy'),
    ownProperties,thisHere;
  if (!nodeCopy) {
    error('unexpected');
  }
  if (node.__computed) {
    nodeCopy.__computed = 1;
    if (!includeComputed) {
      return nodeCopy;
    }
  }
  ownProperties = Object.getOwnPropertyNames(node);
  thisHere = node;
  // perChild takes care of assigning the child copy to the  node copy for Objects, but not Arrays
  const perChild = function (prop,child,iisArray) {
      let childType = typeof child, 
        childCopy,treeProp;
      if (child && (childType === 'object')  && (!child.__head)) {
        childCopy = getval(child,'__copy');
        treeProp =  getval(child,'__parent') === thisHere; 
        if (childCopy) {
          if (!iisArray) {
            nodeCopy[prop]=childCopy;
          }
          if (treeProp) {
            childCopy.__name = prop;
            childCopy.__parent = nodeCopy;
          }
        }
        if (treeProp)  {
          stitchCopyTogether(child);
        }
        return childCopy;
      } else {
        if (iisArray) {
          return child;
        } else {
          // atomic properties of nodes down the chains need to be copied over, since they will not be inherited
          if (!nodeCopy.__get('__headOfChain')) {
            nodeCopy[prop] = child; 
          }
        }
      }
    }
  if (isArray) {
    node.forEach(function (ichild) {
      nodeCopy.push(perChild(null,ichild,1));
    });
  } else {
    ownProperties.forEach(function (prop) {
      if (!internal(prop)) {
        perChild(prop,thisHere[prop]);
      }
    });
  }
  return nodeCopy;
}


const cleanupSourceAfterCopy1 = function (node) {
  delete node.__inCopyTree;
  delete node.__chain;
  delete node.__copy;
  delete node.__headOfChain;
}


const cleanupSourceAfterCopy = function (node) {
  if (node.__const) {
    return;
  }
  cleanupSourceAfterCopy1(node);
  if (includeComputed || !node.__computed) {
    forEachTreeProperty(node,function (c) {
      cleanupSourceAfterCopy(c);
    });
  }
}

const clearCopyLinks = function (node) {
  deepDeleteProp(node,'__copy');
}


// A utility: how many times is x hereditarily instantiated within this?
ObjectNode.__instantiationCount = function (x) {
  let rs = 0;
  if (x.isPrototypeOf(this)) {
    rs = 1;
  } else {
    rs = false;
  }
  forEachTreeProperty(this,function (v) {
    let c = v.__instantiationCount(x);
    rs = rs +c;
  });
  return rs;
}

ArrayNode.__instantiationCount = ObjectNode.__instantiationCount;

// instantiate the  Object's  prototype
ObjectNode.__clone = function () {
  let p = Object.getPrototypeOf(this);
  if (ObjectNode.isPrototypeOf(p)) {
    return p.instantiate();
  } else {
    error("Attempt to clone a non-Object",this.__name);
  }
}