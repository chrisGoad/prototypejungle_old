(function () {

// a hole 
var om = __pj__.om;


// as a preliminary step to copying, we compute the prototype chains. next the copies of individual objects; the chains come first,
// and they are built from proto-free (within the tree) down the chain. finally the copied tree is "stictched together; the property links are put
// in
// chainNeeded is true when addToChain is called from an object up the chain, rather than the tree recursor
// we don't bother which chains of length 1.

om.theChains = [];


om.DNode.markCopyNode = function () {
  this.__inCopyTree__ = 1;
}


om.DNode.markCopyTree = function () {
  //om.deepApplyMethod(this,"markCopyNode",false,1); // doEval false, dontStop 1
  this.deepApplyMeth("markCopyNode",null,true);
}


om.DNode.addChain = function (chainNeeded) {
  if (this.hasOwnProperty('__chain__')) {
    return this.__chain__;
  }
  var p = Object.getPrototypeOf(this);
  var tpp = typeof(p);
  if (((tpp=="function")||(tpp=="object")) && (p.get("__parent__"))) { //  a sign that p is in the object tree
    // is it in the tree being copied?
    if (p.__inCopyTree__) {
      var pch = p.addChain(1);
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
  //om.deepApplyMethod(this,"addChain",false,1); // doEval false, dontStop 1
  this.deepApplyMeth("addChain",null,true); 
}


om.DNode.collectChain = function () {
  var ch = this.__chain__;
  if (ch && (!ch.collected)) {
    om.theChains.push(ch);
    ch.collected = 1;
  }
}



om.DNode.collectChains = function () {
 // om.deepApplyMethod(this,"collectChain",false,1); // doEval false, dontStop 1
  this.deepApplyMeth("collectChain",null,true); // doEval false, dontStop 1
}

om.buildCopiesForChain = function (ch) {
  //for [a,b,c] a is a proto of b and b of c
  var pr = ch[0]; // head of the chain, from which copies inherit
  var ln = ch.length;
  for (var i=0;i<ln;i++) {
    var c = ch[i];
    var cc = Object.create(pr);
    //if (i==0) cc.__note__ = "head";
   if (c.__name__) cc.__name__ = c.__name__;
    c.__copy__ = cc;
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
  //om.deepApplyMethod(this,"buildCopyForNode",false,true);// doEval=false; dontStop=true
  this.deepApplyMeth("buildCopyForNode",null,true);
}



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


om.LNode.copyNode = om.DNode.copyNode;




om.cnt = 0;
om.DNode.stitchCopyTogether = function () { // add the properties
 
  var tcp = this.__copy__;
  if (!tcp) om.error("unexpected");
  om.cnt++;
  for (var k in this) {
    if (this.hasOwnProperty(k) && (!om.internal(k))) {
      var cv = this[k];
      // some things should not be inherited
      if (cv && ((k == "__isType__") || (k == "__isFunction__"))) {
        tcp[k] = cv;
        continue;
      }
      var tp = typeof cv;
      if (tp == "object") {
        var ccp = om.getval(cv,"__copy__");
        if (ccp) {
          tcp[k]=ccp;
          ccp.__name__ = k;
          ccp.__parent__ = tcp;
        } else {
          if (!(cv.__isFunction__)) { // these act like primitive values, and are inherited in the prototype chain
            tcp[k] = cv; //cv is outside the copy tree
          }
        }
        if (om.getval(cv,"__parent__") == this)  {// k is a tree property; recurse
          cv.stitchCopyTogether();
        }
      }
    }
  }
  return tcp;
}

om.LNode.stitchCopyTogether = function () { // add the properties
  var tcp = this.get('__copy__');
  if (!tcp) om.error("unexpected");
  var xf = this.transform;
  if (!xf) {
    var xf = this.__xform__;//backward compatibility
    if (xf) this.__xform__ = xf;
  }
  if (xf) {
    var xfcp = xf.get("__copy__");
    tcp.set("__xform__",xfcp);
  }
  var ln = this.length;
  for (var i=0;i<ln;i++) {
    var cv = this[i];
      // some things should not be inherited
    var tp = typeof cv;
    if ((tp=="function") || (tp=="object")) {
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
}

om.DNode.cleanupSourceAfterCopy = function () {
  this.deepApplyMeth("cleanupSourceAfterCopy1",null,true);
  om.theChains = [];
}

om.DNode.complexInstantiate = function () {
  this.markCopyTree();
  this.addChains();
  this.collectChains();
  om.buildCopiesForChains();
  this.buildCopiesForTree();
  var crs = this.stitchCopyTogether();
  this.cleanupSourceAfterCopy();
  return crs;
}

om.DNode.instantiate = function () {
  var rs = this.copyNode();
  return rs;
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

})();

