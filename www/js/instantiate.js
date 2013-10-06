(function (__pj__) {

  var om = __pj__.om;

  // here is the main function, which is placed up front to clarify what follows
  om.DNode.instantiate = function (xt) {
    this.markCopyTree();
    this.addChains(); // insert __chain__ properties, which make the prototype chains explicitly available
    this.collectChains(); // recurse through the tree collecting chains
    om.buildCopiesForChains(); // copy them
    this.buildCopiesForTree(); // copy the rest of the tree structure
    var crs = this.stitchCopyTogether();
    this.cleanupSourceAfterCopy();
    if (xt) crs.setProperties(xt);
    return crs;
  }

  om.theChains = [];
  
  
  om.DNode.markCopyNode = function () {
    this.__inCopyTree__ = 1;
  }
  
  
  om.DNode.markCopyTree = function () {
    this.deepApplyMeth("markCopyNode",null,true);
  }
  

// The argument chainNeeded is true when addToChain is called from an object up the chain, rather than the tree recursor
// We don't bother with chains of length 1.
  
  
  om.DNode.addChain = function (chainNeeded) {
    if (this.hasOwnProperty('__chain__')) {
      return this.__chain__;
    }
    var p = Object.getPrototypeOf(this);
    var tpp = typeof(p);
    if (((tpp=="function")||(tpp=="object")) && (p.get("__parent__"))) { //  a sign that p is in the object tree
      // is it in the tree being copied?
      if (p.__inCopyTree__) {
        var pch = p.addChain(1).concat(); 
        // @todo potential optimization; pch doesn't need copying if chains don't join (ie if there are no common prototypes)
        pch.push(this);
      } else {
        var pch = [this]; // the chain terminates at p for copying purposes
      }
      this.__chain__ = pch;
      return pch;
    } else { // this has no prototype within the object tree (not just the copy tree)
      if (chainNeeded) {
        var rs = [this];
        this.__chain__ = rs;
        return rs;
      } else {
        return undefined;
      }
    }
  }

  
  om.DNode.addChains = function () {
    this.deepApplyMeth("addChain",null,true); 
  }
  
  
  om.DNode.collectChain = function () {
    var ch = this.__chain__;
    if (ch && (ch.length > 1) &&(!ch.collected)) {
      om.theChains.push(ch);
      ch.collected = 1;
    }
  }
  
  
  
  om.DNode.collectChains = function () {
    this.deepApplyMeth("collectChain",null,true); // doEval false, dontStop 1
  }
  
  om.buildCopiesForChain = function (ch) {
    //for [a,b,c] a is a proto of b and b of c
    var pr = ch[0]; // head of the chain, from which copies inherit
    var ln = ch.length;
    for (var i=0;i<ln;i++) { //start with i=0, since the chain begins with the uncopied fellow
      var c = ch[i];
      if (c.get('__copy__')) {
        var cc = c.__copy__;
      } else {
        cc = Object.create(pr);
        if (i==0) {
          cc.__headOfChain__ = 1;
        }
        if (c.__name__) cc.__name__ = c.__name__;
        c.__copy__ = cc;
      }
      pr = cc;
    }
  }
  
  om.buildCopiesForChains = function () {
    om.theChains.forEach(function (ch) {om.buildCopiesForChain(ch);});
  }
  
  om.DNode.buildCopyForNode = function () {
    var cp  = this.__copy__;
    if (!cp) {
      // type nodes get special treatment
      var cp = Object.create(this);
      this.__copy__ = cp;
      cp.__headOfChain__ = 1;
  
    }
  }
  
  // prototypical inheritance is for DNodes only
  
  om.LNode.buildCopyForNode = function () {
    var cp  = this.__copy__;
    if (!cp) {
      var cp = om.LNode.mk();
      this.__copy__ = cp;
    }
  }
  
  
  
  om.DNode.buildCopiesForTree = function () {
    this.deepApplyMeth("buildCopyForNode",null,true);
  }
  
  
  
  
  om.cnt = 0;
  om.DNode.stitchCopyTogether = function () { // add the properties
    var tcp = this.__copy__;
    if (!tcp) om.error("unexpected");
    om.cnt++;
   
    for (var k in this) {
      if (this.hasOwnProperty(k) && (!om.internal(k))) {
        var cv = this[k];
        var tp = typeof cv;
        if (cv && (tp == "object")) {
          var ccp = om.getval(cv,"__copy__");
          if (ccp) {
            tcp[k]=ccp;
            ccp.__name__ = k;
            ccp.__parent__ = tcp;
          }
          if (om.getval(cv,"__parent__") == this)  {// k is a tree property; recurse
            cv.stitchCopyTogether();
          }
        } else {
          if (!tcp.get('__headOfChain__')) {
            tcp[k] = cv; //atomic value
          }
        }
      }
    }
    return tcp;
  }
  
  om.LNode.stitchCopyTogether = function () { // add the properties
    var tcp = this.get('__copy__');
    if (!tcp) om.error("unexpected");
    var ln = this.length;
    for (var i=0;i<ln;i++) {
      var cv = this[i];
        // some things should not be inherited
      var tp = typeof cv;
      if (cv && (tp=="object")) {
        var ccp = cv.get("__copy__");
        if (ccp) {
          tcp.push(ccp);
          ccp.__name__ = i;
          ccp.__parent__ = tcp;
        } else {
          tcp.push(cv); //cv is outside the copy tree
        }
        if (cv.get("__parent__") == this)  {// k is a tree property; recurse
          cv.stitchCopyTogether();
        }
      } else {
        tcp.push(cv);
      }
    }
    return tcp;
  }
  
  
  om.DNode.cleanupSourceAfterCopy1 = function () {
    delete this.__inCopyTree__;
    delete this.__chain__;
    delete this.__copy__;
  }
  
  
  
  om.LNode.cleanupSourceAfterCopy1 = function () {
    delete this.__inCopyTree__;
    delete this.__copy__;
    //delete this.__headOfChain__;
  }
  
  om.DNode.cleanupSourceAfterCopy = function () {
    this.deepApplyMeth("cleanupSourceAfterCopy1",null,true);
    om.theChains = [];
  }
  
  
  // how many times is x hereditarily instantiated within this?
  om.DNode.instantiationCount = function (x) {
    var rs = 0;
    if (x.isPrototypeOf(this)) {
      var rs = 1;
    } else {
      rs = 0;
    }
    this.iterTreeItems(function (v) {
      var c = v.instantiationCount(x);
      rs = rs +c;
    },true);
    return rs;
  }
  
  om.LNode.instantiationCount = om.DNode.instantiationCount;
  
  // instantiate this for each member of d, and then bindd it to that member
  om.DNode.mbindd = function(da) {
    var thisHere = this;
    var rs = om.LNode.mk();
    da.forEach(function (d) {
      var i = thisHere.instantiate();
      i.deepBind(d);
      rs.pushChild(i);
    });
    return rs;
  }
    
  
  
  // something simpler: just point prototypes back at nodes in the tree being copied
  om.DNode.copyNode = function () {
    var rs = Object.create(this);
    var thisHere = this;
    this.iterTreeItems(function (v,k) {
      var cp = v.copyNode();
      cp.__parent__ = rs;
      cp.__name__= k;
      rs[k] = cp;
    },true);
    return rs;
  }
  
  
  // no prototype chains for LNodes
  om.LNode.copyNode = function () {
    var rs = om.LNode.mk();
    this.forEach(function (v) {
      if (om.isNode(v)) {
        var cp = v.copyNode();
        rs.pushChild(cp);
      } else {
        rs.push(v);
      }
    });
    return rs;
  }
  
  
})(prototypeJungle);

