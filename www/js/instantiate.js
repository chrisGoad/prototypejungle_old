
(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjcs.js. //start extract and //end extract indicate the part used in the assembly

//start extract
// <Section> Instantiate ====================================================

    
// here is the main function, which is placed up front to clarify what follows
om.instantiateTime = 0;
om.instantiateCount = 0;
om.internalChainCount = 0;
om.internalChainTime = 0;

var internalChain;

// if count is defined, it tells how many copies to deliver

om.DNode.instantiate = function (count) {
  var n = count?count:1,
    frs,crs,i;
  if (n > 1) {
    frs = [];
    for (var i=0;i<n;i++) {
      frs.push(this.instantiate());
    }
    return frs;
  }
  internalChain = 0;
  markCopyTree(this);
  addChains(this);
  // recurse through the tree collecting chains
  collectChains(this); 
  for (i=0;i<n;i++) {
    buildCopiesForChains(); // copy them
    buildCopiesForTree(this); // copy the rest of the tree structure
    crs = stitchCopyTogether(this);
    clearCopyLinks(this);
    if (n > 1) {
      frs.push(crs);
    }
  }
  cleanupSourceAfterCopy(this);
  om.instantiateCount++;
  if (internalChain) {
    om.internalChainCount++
    om.internalChainTime += etm;
  }
  if (n > 1) {
    return frs;
  }
  return crs;
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
  var typeOfProto = typeof(p);
  if (((typeOfProto === "function")||(typeOfProto === "object")) && (p.__get("__parent"))) { //  a sign that p is in the object tree
    // is it in the tree being copied?
    if (proto.__inCopyTree) {
      var chain = addChain(p,1).concat(); 
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
  var head = chain[0], // head of the chain, from which copies inherit
    ln = chain.length,
    i,proto,protoCopy;
  // build the chain link-by-link, starting with the head. proto is the current element of the chain.
  // Start with the head, ie chain[0];
  for (var i=0;i<ln;i++) { 
    var proto = chain[i];
    var protoCopy = proto.__get('__copy');
    if (!protoCopy) {
      protoCopy = Object.create(proto); //anchor  protoCopy back in the original
      if (i === 0) {
        protoCopy.__headOfChain = 1;
      }
      if (c.__name) protoCopy.__name = proto.__name;
      proto.__copy = protoCopy;
    }
    proto = protoCopy;
  }
}

var buildCopiesForChains = function () {
  om.theChains.forEach(function (ch) {buildCopiesForChain(ch);});
}

var buildCopyForNode = function (node) {
  var cp  = node.__get('__copy');//added __get 11/1/13
  if (!cp) {
    if (om.LNode.isPrototypeOf(node)) {
      var cp = om.LNode.mk();
      var sti = node.__setIndex;
      if (sti !== undefined) {
        cp.__setIndex = sti;
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




om.cnt = 0;
var stitchCopyTogether = function (node) { // add the __properties
  var isLNode = om.LNode.isPrototypeOf(node);
  var tcp = node.__get("__copy");// added __get 11/1/13
  if (!tcp) om.error("unexpected");
  om.cnt++;
  var nms = Object.getOwnPropertyNames(node);
  var thisHere = node;
  var perChild = function (k,cv) {
      var tp = typeof cv;
      if (cv && (tp === "object")) {
        var ccp = om.getval(cv,"__copy");
        var treeProp =  om.getval(cv,"__parent") === thisHere; // k is a tree property

        if (ccp) {
          tcp[k]=ccp;
          if (treeProp) {
            ccp.__name = k;
            ccp.__parent = tcp;
          }
        }
        if (treeProp)  {// k is a tree property; recurse
          stitchCopyTogether(cv);
        }
      } else {// atomic properties of nodes down the chains need to be copied over, since they will not be inherited
        if (!tcp.__get('__headOfChain')) {
          tcp[k] = cv; 
        }
      }
    }
  if (isLNode) {
    var ln = node.length;
    for (var i=0;i<ln;i++) {
      var cv = node[i];
      perChild(i,cv);
    }
  } else {
    nms.forEach(function (k) {
      if (!om.internal(k)) {
        var cv = thisHere[k];
        perChild(k,cv);
      }
    });
  }
  return tcp;
}

// if, in the original b inherits from a, then in the instance b' will inherit from a'.  Direct properties of p need to be
// copied to b'.  
//var installDownStreamProperties = function (node) {
  

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
  om.deepDeleteProp(node,"__copy");
}
// instantiatiation is somewhat elaborate.  Often the same thing is intantiated over and over
// For this purpose, we keep the structures built for the process
// a simple depth first algorithm: 


// how many times is x hereditarily instantiated within this?
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

// instantiate this for each member of d, and then bindd it to that member
om.DNode.__mbindd = function(da) {
  var thisHere = this;
  var rs = om.LNode.mk();
  da.forEach(function (d) {
    var i = thisHere.instantiate();
    i.deepBind(d);
    rs.push(i);
  });
  return rs;
}
  


// something simpler: just point prototypes back at nodes in the tree being copied
om.DNode.__copyNode = function (cnt) {
  var n = cnt?cnt:1;
  if (n > 1) {
    var frs = [];
    for (var i=0;i<n;i++) {
      frs.push(this.__copyNode());
    }
    return frs;
  }
  var rs = Object.create(this);
  var thisHere = this;
  om.forEachTreeProperty(this,function (v,k) {
    // computedFields are objects, but are not copied
    if (om.ComputedField.isPrototypeOf(v)) return;
    var cp = v.__copyNode();
    cp.__parent = rs;
    cp.__name= k;
    rs[k] = cp;
  });
  return rs;
}


// no prototype chains for LNodes
om.LNode.__copyNode = function () {
  var rs = om.LNode.mk();
  this.forEach(function (v) {
    if (om.isNode(v)) {
      var cp = v.__copyNode();
      rs.push(cp);
    } else {
      rs.push(v);
    }
  });
  return rs;
}
//end extract
})(prototypeJungle);