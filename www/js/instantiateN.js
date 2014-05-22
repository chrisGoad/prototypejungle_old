(function (__pj__) {

  var om = __pj__.om;
    
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
    //this._addChains(); // insert __chain__ _properties, which make the prototype chains explicitly available
    addChains(this);//this.collectChains(); // recurse through the tree collecting chains
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
   // if (xt) crs._setProperties(xt)
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
  //  this.__inCopyTree__ = 1;
  //}
  
  var markCopyNode = function (nd) {
    nd.__inCopyTree__ = 1;
  }
  
  
  var markCopyTree = function (nd) {
    om._deepApplyFun(nd,markCopyNode);
  }
  
  
  //om.DNode.markCopyTree = function () {
  //  this._deepApplyMeth("markCopyNode",null,true);
  //}
  
  

// The argument chainNeeded is true when addToChain is called from an object up the chain, rather than the tree recursor
// We don't bother with chains of length 1.
  
  
  var addChain = function (nd,chainNeeded) {
  //om.DNode._addChain = function (chainNeeded) {
    if (nd.hasOwnProperty('__chain__')) {
      return nd.__chain__;
    }
    var p = Object.getPrototypeOf(nd);
    var tpp = typeof(p);
    if (((tpp==="function")||(tpp==="object")) && (p._get("_parent"))) { //  a sign that p is in the object tree
      // is it in the tree being copied?
      if (p.__inCopyTree__) {
        var pch = addChain(p,1).concat(); 
        // @todo potential optimization; pch doesn't need copying if chains don't join (ie if there are no common prototypes)
        internalChain = 1;
        pch.push(nd);
      } else {
        var pch = [nd]; // the chain terminates at p for copying purposes
      }
      nd.__chain__ = pch;
      return pch;
    } else { // this has no prototype within the object tree (not just the copy tree)
      if (chainNeeded) {
        var rs = [nd];
        nd.__chain__ = rs;
        return rs;
      } else {
        return undefined;
      }
    }
  }

  
  //om.DNode._addChains = function () {
  //  this._deepApplyMeth("_addChain",null,true); 
  //}
  
  var addChains = function (nd) {
    om._deepApplyFun(nd,addChain);
  }
  
  /*
  var collectChain = function (nd) {
    var ch = nd.__chain__;
    if (ch && (ch.length > 1) &&(!ch.collected)) {
      om.theChains.push(ch);
      ch.collected = 1;
    }
  }
  
  
  
  var collectChains = function (nd) {
    om._deepApplyFun(nd,collectChain); // doEval false, dontStop 1
  }
  */
  om.buildCopiesForChain = function (ch) {
    //for [a,b,c] a is a proto of b and b of c
    var pr = ch[0]; // head of the chain, from which copies inherit
    var ln = ch.length;
    for (var i=0;i<ln;i++) { //start with i=0, since the chain begins with the uncopied fellow
      var c = ch[i];
      if (c._get('__copy__')) {
        var cc = c.__copy__;
      } else {
        cc = Object.create(pr);
        if (i===0) {
          cc.__headOfChain__ = 1;
        }
        if (c._name) cc._name = c._name;
        c.__copy__ = cc;
      }
      pr = cc;
    }
  }
  
  var buildCopiesForChains = function () {
    om.theChains.forEach(function (ch) {buildCopiesForChain(ch);});
  }
  
  var buildCopyForNode = function (nd) {
    var cp  = nd._get('__copy__');//added _get 11/1/13
    if (!cp) {
      if (om.LNode.isPrototypeOf(nd)) {
        var cp = om.LNode.mk();
        var sti = nd.__setIndex__;
        if (sti !== undefined) {
          cp.__setIndex__ = sti;
        }
      } else {
        cp = Object.create(nd);
      }
      nd.__copy__ = cp;
      cp.__headOfChain__ = 1;
  
    }
  }
  
  // prototypical inheritance is for DNodes only
 /* 
  om.LNode._buildCopyForNode = function () {
    var cp  = this._get("__copy__");//added _get 11/1/13
    if (!cp) {
      var cp = om.LNode.mk();
      var sti = this.__setIndex__;
      if (sti !== undefined) {
        cp.__setIndex__ = sti;
      }
      this.__copy__ = cp;
    }
  }
  
  */
  
  var buildCopiesForTree = function (nd) {
    om._deepApplyFun(nd,buildCopyForNode);
  }
  
  
  
  
  om.cnt = 0;
  var stitchCopyTogether = function (nd) { // add the _properties
    var isLNode = om.LNode.isPrototypeOf(nd);
    var tcp = nd._get("__copy__");// added _get 11/1/13
    if (!tcp) om.error("unexpected");
    om.cnt++;
    var nms = Object.getOwnPropertyNames(nd);
    var thisHere = nd;
    var perChild = function (k,cv) {
     //  if (!om.internal(k)) {
      // var cv = thisHere[k];
        var tp = typeof cv;
        if (cv && (tp === "object")) {
          var ccp = om.getval(cv,"__copy__");
          var treeProp =  om.getval(cv,"_parent") === thisHere; // k is a tree property

          if (ccp) {
            tcp[k]=ccp;
            if (treeProp) {
              ccp._name = k;
              ccp._parent = tcp;
            }
          }
          if (treeProp)  {// k is a tree property; recurse
            stitchCopyTogether(cv);
          }
        } else {
          if (!tcp._get('__headOfChain__')) {
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
  /*
  var stitchLnodeCopyTogether = function (nd) { // add the _properties
    var tcp = this._get('__copy__');
    if (!tcp) om.error("unexpected");
    var ln = this.length;
    for (var i=0;i<ln;i++) {
      var cv = this[i];
      var tp = typeof cv;
      if (cv && (tp==="object")) {
        var treeProp =  om.getval(cv,"_parent") === this; // k is a tree property
        var ccp = cv._get("__copy__");
        if (ccp) {
          tcp.push(ccp);
          if (treeProp) {
            ccp._name = i;
            ccp._parent = tcp;
          }
        } else {
          tcp.push(cv); //cv is outside the copy tree
        }
        if (treeProp)  {// k is a tree property; recurse
          cv.stitchCopyTogether();
        }
      } else {
        tcp.push(cv);
      }
    }
    return tcp;
  }
  */
  
  var cleanupSourceAfterCopy1 = function (nd) {
    delete nd.__inCopyTree__;
    delete nd.__chain__;
    delete nd.__copy__;
    delete nd.__headOfChain__;
  }
  
  var cleanupSourceAfterCopy = function (nd) {
    om._deepApplyFun(nd,cleanupSourceAfterCopy1);
    om.theChains = [];
  }
  /*
  
  om.LNode.cleanupSourceAfterCopy1 = function () {
    delete this.__inCopyTree__;
    delete this.__copy__;
    delete this.__headOfChain__;
  }
  
  om.DNode.cleanupSourceAfterCopy = function () {
    this._deepApplyMeth("cleanupSourceAfterCopy1",null,true);
    om.theChains = [];
  }
  
  */
  
  var clearCopyLinks1 = function (nd) {
    delete nd.__copy__;
    //delete this.__headOfChain__;
  }
  
  
  
  var clearCopyLinks = function (nd) {
    om._deepApplyFun(nd,clearCopyLinks1);
  }
  // instantiatiation is somewhat elaborate.  Often the same thing is intantiated over and over
  // For this purpose, we keep the structures built for the process
  // a simple depth first algorithm: 
  
  
  // how many times is x hereditarily instantiated within this?
  om.DNode._instantiationCount = function (x) {
    var rs = 0;
    if (x.isPrototypeOf(this)) {
      var rs = 1;
    } else {
      rs = 0;
    }
    this._iterTreeItems(function (v) {
      var c = v._instantiationCount(x);
      rs = rs +c;
    },true);
    return rs;
  }
  
  om.LNode._instantiationCount = om.DNode._instantiationCount;
  
  // instantiate this for each member of d, and then bindd it to that member
  om.DNode._mbindd = function(da) {
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
  om.DNode._copyNode = function (cnt) {
    var n = cnt?cnt:1;
    if (n > 1) {
      var frs = [];
      for (var i=0;i<n;i++) {
        frs.push(this._copyNode());
      }
      return frs;
    }
    var rs = Object.create(this);
    var thisHere = this;
    this._iterTreeItems(function (v,k) {
      // computedFields are objects, but are not copied
      if (om.ComputedField.isPrototypeOf(v)) return;
      var cp = v._copyNode();
      cp._parent = rs;
      cp._name= k;
      rs[k] = cp;
    },true);
    return rs;
  }
  
  
  // no prototype chains for LNodes
  om.LNode._copyNode = function () {
    var rs = om.LNode.mk();
    this.forEach(function (v) {
      if (om.isNode(v)) {
        var cp = v._copyNode();
        rs.push(cp);
      } else {
        rs.push(v);
      }
    });
    return rs;
  }
  
  
})(prototypeJungle);

