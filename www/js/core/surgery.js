
(function (pj) {
  var om = pj.om;

  //NOT IN USE (not assembled) but might be added
// This is one of the code files assembled into pjom.js. //start extract and //end extract indicate the part used in the assembly

//start extract
// <Section> surgery ====================================================

/* Operations, such as shortening (an optimization) and replacement, which perform "surgery" on the prototype chains
 * Consider a node, its instantiation, inode = node.instantiate(). If no operations are performed on inode except for
 * setting of atomic-valued properties to new atomic values, then  inode is said to be "protomorphic" (short for isomorphic to its prototype,
 * under the tree relation). For such an
 * inode, the tree of inode itself is called layer 0, and node layer 1.
 * Layer 1's   nodes
 * are, as one goes down the tree, the prototypes of corresponding nodes at layer 0.
 * Replacement is done at layer 1.
 * 
 */

 
om.isProtomorphic = function (node) {
  var proto = Object.getPrototypeOf(node);
  var rs = om.everyTreeProperty(node,function (child,prop) {
    var childProto = Object.getPrototypeOf(child);
    var protoChild = proto[prop];
    if (protoChild === childProto) {
      return om.isProtomorphic(child);
    } else { // the prototype chain is also allowed to run parallel in node children and proto children
      var protoChildProto = Object.getPrototypeOf(protoChild);
      return (childProto.__parent === node) && (protoChildProto.__parent === proto);
    }
  });
}


    
  

 
om.deepCopyAtomicProperties = function (dest,source) {
  om.forEachTreeProperty(dest,function (destChild,prop) {
    var sourceChild = source[prop];
    if (om.treeProperty(source,sourceChild)) {
      om.deepCopyAtomicProperties(destChild,sourceChild);
    } else if ((typeof(sourceChild) !== "object") || (sourceChild === null)) {
        dest[prop] = sourceChild;
    }
  });
}

    
    
// For monitoring.
om.instantiateCount = 0;
om.internalChainCount = 0;
    


var internalChain;

/* Here is the main function, which is placed up front to clarify what follows.
 * If count is defined, it tells how many copies to deliver.
 */

om.DNode.instantiate = function (count) {
  var n = count?count:1,
    multiRs,singleRs,i;
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
  om.instantiateCount++;
  if (internalChain) {
    om.internalChainCount++
  }
  return (n>1)?multiRs:singleRs;
}

om.theChains = [];




var markCopyNode = function (node) {
  node.__inCopyTree = 1;
}


var markCopyTree = function (node) {
  om.deepApplyFun(node,markCopyNode);
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
  om.deepApplyFun(node,addChain);
}


var collectChain = function (node) {
  var chain = node.__chain;
  if (chain && (chain.length > 1) &&(!chain.collected)) {
    om.theChains.push(chain);
    chain.collected = 1;
  }
}



var collectChains = function (node) {
  om.deepApplyFun(node,collectChain); 
}

var buildCopiesForChain = function (chain) {
  //for [a,b,c], a is a proto of b, and b of c
  // current is the last member of the new chain. This is initially the
  // head of the chain back in the old tree.
  var current = chain[0],
    ln = chain.length,
    i,proto,protoCopy;
  // build the chain link-by-link, starting with the head. proto is the current element of the chain.
  // Start with the head, ie chain[0];
  for (var i=0;i<ln;i++) { 
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
  om.theChains.forEach(function (ch) {buildCopiesForChain(ch);});
}

// __setIndex is used for  ordering children of a DNode (eg for ordering shapes), and is sometimes associated with LNodes.

var buildCopyForNode = function (node) {
  var cp  = node.__get('__copy');//added __get 11/1/13
  if (!cp) {
    if (om.LNode.isPrototypeOf(node)) {
      var cp = om.LNode.mk();
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

// prototypical inheritance is for DNodes only


var buildCopiesForTree = function (node) {
  om.deepApplyFun(node,buildCopyForNode);
}




var stitchCopyTogether = function (node) { // add the __properties
  var isLNode = om.LNode.isPrototypeOf(node),
    nodeCopy = node.__get('__copy'),
    ownProperties,thisHere,perChild,childType,child,ln,i,copiedChild;
  if (!nodeCopy) om.error('unexpected');
  ownProperties = Object.getOwnPropertyNames(node);
  thisHere = node;
  // perChild takes care of assigning the child copy to the  node copy for DNodes, but not LNodes
  var perChild = function (prop,child,isLNode) {
      var childType = typeof child,
        childCopy,treeProp;
      if (child && (childType === 'object')) {
        childCopy = om.getval(child,'__copy');
        treeProp =  om.getval(child,'__parent') === thisHere; 
        if (childCopy) {
          if (!isLNode) nodeCopy[prop]=childCopy;
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
        if (isLNode) {
          return child;
        } else {
          // atomic properties of nodes down the chains need to be copied over, since they will not be inherited
          if (!nodeCopy.__get('__headOfChain')) {
            nodeCopy[prop] = child; 
          }
        }
      }
    }
  if (isLNode) {
    node.forEach(function (child) {
      nodeCopy.push(perChild(null,child,1));
    });
  } else {
    ownProperties.forEach(function (prop) {
      if (!om.internal(prop)) {
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
  om.deepApplyFun(node,cleanupSourceAfterCopy1);
  om.theChains = [];
}






var clearCopyLinks = function (node) {
  om.deepDeleteProp(node,'__copy');
}



// A utility: how many times is x hereditarily instantiated within this?
om.DNode.__instantiationCount = function (x) {
  var rs = 0;
  if (x.isPrototypeOf(this)) {
    var rs = 1;
  } else {
    rs = 0;
  }
  om.forEachTreeProperty(this,function (v) {
    var c = v.__instantiationCount(x);
    rs = rs +c;
  });
  return rs;
}

om.LNode.__instantiationCount = om.DNode.__instantiationCount;



//end extract
})(prototypeJungle);