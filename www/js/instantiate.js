
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
// if cnt is defined,it is how many copies to deliver
//  om.DNode.instantiate = function (xt,cnt) {

om.DNode.instantiate = function (cnt) {
  var n = cnt?cnt:1;
  if (n > 1) {
    var frs = [];
    for (var i=0;i<n;i++) {
      frs.push(this.instantiate());
    }
    return frs;
  }
  var tm = Date.now();
  internalChain = 0;
  //this.markCopyTree();
  markCopyTree(this);
  //this._addChains(); // insert __chain __properties, which make the prototype chains explicitly available
  addChains(this);
  collectChains(this); // recurse through the tree collecting chains
  if (n > 1) {
    var frs = [];
  }
  for (var i=0;i<n;i++) {
    buildCopiesForChains(); // copy them
    buildCopiesForTree(this); // copy the rest of the tree structure
    var crs = stitchCopyTogether(this);
    clearCopyLinks(this);
    if (n>1) {
      frs.push(crs);
    }
  }
  cleanupSourceAfterCopy(this);
 // if (xt) crs.__setProperties(xt)
  var etm = Date.now() - tm;
  om.instantiateTime += etm;
  om.instantiateCount++;
  if (internalChain) {
    om.internalChainCount++
    om.internalChainTime += etm;
  }
  if (n>1) {
    return frs;
  }
  return crs;
}

om.theChains = [];



//om.DNode.markCopyNode = function () {
//  this.__inCopyTree = 1;
//}

var markCopyNode = function (nd) {
  nd.__inCopyTree = 1;
}


var markCopyTree = function (nd) {
  om.deepApplyFun(nd,markCopyNode);
}

// The argument chainNeeded is true when addToChain is called from an object up the chain, rather than the tree recursor
// We don't bother with chains of length 1.


var addChain = function (nd,chainNeeded) {
  if (nd.hasOwnProperty('__chain')) {
    return nd.__chain;
  }
  var p = Object.getPrototypeOf(nd);
  var tpp = typeof(p);
  if (((tpp==="function")||(tpp==="object")) && (p.__get("__parent"))) { //  a sign that p is in the object tree
    // is it in the tree being copied?
    if (p.__inCopyTree) {
      var pch = addChain(p,1).concat(); 
      // @todo potential optimization; pch doesn't need copying if chains don't join (ie if there are no common prototypes)
      internalChain = 1;
      pch.push(nd);
    } else {
      var pch = [nd]; // the chain terminates at p for copying purposes
    }
    nd.__chain = pch;
    return pch;
  } else { // this has no prototype within the object tree (not just the copy tree)
    if (chainNeeded) {
      var rs = [nd];
      nd.__chain = rs;
      return rs;
    } else {
      return undefined;
    }
  }
}


var addChains = function (nd) {
  om.deepApplyFun(nd,addChain);
}


var collectChain = function (nd) {
  var ch = nd.__chain;
  if (ch && (ch.length > 1) &&(!ch.collected)) {
    om.theChains.push(ch);
    ch.collected = 1;
  }
}



var collectChains = function (nd) {
  om.deepApplyFun(nd,collectChain); // doEval false, dontStop 1
}

var buildCopiesForChain = function (ch) {
  //for [a,b,c] a is a proto of b and b of c
  var pr = ch[0]; // head of the chain, from which copies inherit
  var ln = ch.length;
  for (var i=0;i<ln;i++) { //start with i=0, since the chain begins with the uncopied fellow
    var c = ch[i];
    if (c.__get('__copy')) {
      var cc = c.__copy;
    } else {
      cc = Object.create(pr);
      if (i===0) {
        cc.__headOfChain = 1;
      }
      if (c.__name) cc.__name = c.__name;
      c.__copy = cc;
    }
    pr = cc;
  }
}

var buildCopiesForChains = function () {
  om.theChains.forEach(function (ch) {buildCopiesForChain(ch);});
}

var buildCopyForNode = function (nd) {
  var cp  = nd.__get('__copy');//added __get 11/1/13
  if (!cp) {
    if (om.LNode.isPrototypeOf(nd)) {
      var cp = om.LNode.mk();
      var sti = nd.__setIndex;
      if (sti !== undefined) {
        cp.__setIndex = sti;
      }
    } else {
      cp = Object.create(nd);
    }
    nd.__copy = cp;
    cp.__headOfChain = 1;

  }
}

// prototypical inheritance is for DNodes only


var buildCopiesForTree = function (nd) {
  om.deepApplyFun(nd,buildCopyForNode);
}




om.cnt = 0;
var stitchCopyTogether = function (nd) { // add the __properties
  var isLNode = om.LNode.isPrototypeOf(nd);
  var tcp = nd.__get("__copy");// added __get 11/1/13
  if (!tcp) om.error("unexpected");
  om.cnt++;
  var nms = Object.getOwnPropertyNames(nd);
  var thisHere = nd;
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
    var ln = nd.length;
    for (var i=0;i<ln;i++) {
      var cv = nd[i];
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
//var installDownStreamProperties = function (nd) {
  

var cleanupSourceAfterCopy1 = function (nd) {
  delete nd.__inCopyTree;
  delete nd.__chain;
  delete nd.__copy;
  delete nd.__headOfChain;
}

var cleanupSourceAfterCopy = function (nd) {
  om.deepApplyFun(nd,cleanupSourceAfterCopy1);
  om.theChains = [];
}






var clearCopyLinks = function (nd) {
  om.deepDeleteProp(nd,"__copy");
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