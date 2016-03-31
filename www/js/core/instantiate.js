
(function (pj) {

// This is one of the code files assembled into pjcore.js. //start extract and //end extract indicate the part used in the assembly

//start extract
// <Section> instantiate ====================================================

// For monitoring.
pj.instantiateCount = 0;
pj.internalChainCount = 0;
    


var internalChain;

/* Here is the main function, which is placed up front to clarify what follows.
 * If count is defined, it tells how many copies to deliver.
 */


pj.Object.instantiate = function (count) {
  var n = count?count:1;
  var multiRs,singleRs,i;
  if (n>1) {
    multiRs = [];
  }
  internalChain = 0;
  markCopyTree(this);
  addChains(this);
  // recurse through the tree collecting chains
  collectChains(this);
  // the same chains can be used for each of the n
  // instantiations
  for (i=0;i<n;i++) {
    buildCopiesForChains(); // copy them
    buildCopiesForTree(this); // copy the rest of the tree structure
    singleRs = stitchCopyTogether(this);
    clearCopyLinks(this);
    if (n > 1) {
      multiRs.push(singleRs);
    }
  }
  cleanupSourceAfterCopy(this);
  pj.instantiateCount++;
  if (internalChain) {
    pj.internalChainCount++
  }
  return (n>1)?multiRs:singleRs;
}

pj.theChains = [];




var markCopyNode = function (node) {
  node.__inCopyTree = 1;
}


var markCopyTree = function (node) {
  pj.deepApplyFun(node,markCopyNode);
}

/* Compute the prototype chain for node - an explicit array of the prototypes.
 * The argument chainNeeded is true when addToChain is called from an object up the chain, rather than the tree recursor
 * We don't bother with chains of length 1.
 */


var addChain = function (node,chainNeeded) {
  var proto,typeOfProto,chain;
  if (node.hasOwnProperty('__chain')) {
    return node.__chain;
  }
  var proto = Object.getPrototypeOf(node);
  var typeOfProto = typeof(proto);
  if (((typeOfProto === 'function')||(typeOfProto === 'object')) && (proto.__get('__parent'))) { //  a sign that proto is in the object tree
    // is it in the tree being copied?
    if (proto.__inCopyTree) {
      var chain = addChain(proto,1).concat(); 
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
      var rs = [node];
      node.__chain = rs;
      return rs;
    } else {
      return undefined;
    }
  }
}


var addChains = function (node) {
  pj.deepApplyFun(node,addChain);
}


var collectChain = function (node) {
  var chain = node.__chain;
  if (chain && (chain.length > 1) &&(!chain.collected)) {
    pj.theChains.push(chain);
    chain.collected = 1;
  }
}



var collectChains = function (node) {
  pj.deepApplyFun(node,collectChain); 
}

var buildCopiesForChain = function (chain) { 
  /**
   * for [a,b,c], a is a proto of b, and b of c
   * current is the last member of the new chain. This is initially the
   * head of the chain back in the old tree.
   */
  var current = chain[0];
  var ln = chain.length;
  var i,proto,protoCopy;
  /**
   * build the chain link-by-link, starting with the head. proto is the current element of the chain.
   * Start with the head, ie chain[0];
   */
  for (i=0;i<ln;i++) { 
    var proto = chain[i];
    var protoCopy = proto.__get('__copy');
    if (!protoCopy) {
      //anchor  protoCopy back in the original
      protoCopy = Object.create(current); 
      if (i === 0) {
        protoCopy.__headOfChain = 1;
      }
      if (chain.__name) protoCopy.__name = proto.__name;
      proto.__copy = protoCopy;
    }
    current = protoCopy; 
  }
}

var buildCopiesForChains = function () {
  pj.theChains.forEach(function (ch) {buildCopiesForChain(ch);});
}

// __setIndex is used for  ordering children of a Object (eg for ordering shapes), and is sometimes associated with Arrays.

var buildCopyForNode = function (node) {
  var cp  = node.__get('__copy');//added __get 11/1/13
  if (!cp) {
    if (pj.Array.isPrototypeOf(node)) {
      var cp = pj.Array.mk();
      var setIndex = node.__setIndex;
      if (setIndex !== undefined) {
        cp.__setIndex = setIndex;
      }
    } else {
      cp = Object.create(node);
    }
    node.__copy = cp;
    cp.__headOfChain = 1;

  }
}

// prototypical inheritance is for Objects only


var buildCopiesForTree = function (node) {
  buildCopyForNode(node);
  pj.forEachTreeProperty(node,function (child,property){
    if (!child.__head) {  // not declared as head of prototype chain
      buildCopiesForTree(child);
    }
  });
}


var stitchCopyTogether = function (node) { // add the __properties
  var isArray = pj.Array.isPrototypeOf(node),
    nodeCopy = node.__get('__copy'),
    ownProperties,thisHere,perChild,childType,child,ln,i,copiedChild;
  if (!nodeCopy) pj.error('unexpected');
  ownProperties = Object.getOwnPropertyNames(node);
  thisHere = node;
  // perChild takes care of assigning the child copy to the  node copy for Objects, but not Arrays
  var perChild = function (prop,child,isArray) {
      var childType = typeof child, 
        childCopy,treeProp;
      if (child && (childType === 'object')  && (!child.__head)) {
        childCopy = pj.getval(child,'__copy');
        treeProp =  pj.getval(child,'__parent') === thisHere; 
        if (childCopy) {
          if (!isArray) nodeCopy[prop]=childCopy;
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
        if (isArray) {
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
    node.forEach(function (child) {
      nodeCopy.push(perChild(null,child,1));
    });
  } else {
    ownProperties.forEach(function (prop) {
      if (!pj.internal(prop)) {
        perChild(prop,thisHere[prop]);
      }
    });
  }
  return nodeCopy;
}


var cleanupSourceAfterCopy1 = function (node) {
  delete node.__inCopyTree;
  delete node.__chain;
  delete node.__copy;
  delete node.__headOfChain;
}

var cleanupSourceAfterCopy = function (node) {
  pj.deepApplyFun(node,cleanupSourceAfterCopy1);
  pj.theChains = [];
}






var clearCopyLinks = function (node) {
  pj.deepDeleteProp(node,'__copy');
}



// A utility: how many times is x hereditarily instantiated within this?
pj.Object.__instantiationCount = function (x) {
  var rs = 0;
  if (x.isPrototypeOf(this)) {
    var rs = 1;
  } else {
    rs = 0;
  }
  pj.forEachTreeProperty(this,function (v) {
    var c = v.__instantiationCount(x);
    rs = rs +c;
  });
  return rs;
}

pj.Array.__instantiationCount = pj.Object.__instantiationCount;

// instantiate the  Object's  protptype
pj.Object.__clone = function () {
  var p = Object.getPrototypeOf(this);
  if (pj.Object.isPrototypeOf(p)) {
    return p.instantiate();
  } else {
    pj.error("Attempt to clone a non-Object",this.__name);
  }
}

//end extract
})(prototypeJungle);