
(function (pj) {
  "use strict"
  var om = pj.om;

// This is one of the code files assembled into pjcs.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract

// <Section> The override system.

// When a DNode has a method called update, the state of that node is maintained by application of that method
// when there are changes. update might modify the state of the tree. If a node has a property __overrides, the intent is that the override tree should
// be merged back into the main tree after each update. This allows specifying hand-tweaked variants of auto-computed items.


om.declareComputed = function (nd) {
  nd.__computed = 1; 
  return nd;
}


om.isComputed = function (nd) {
  if (nd.__computed) return true;
  if (nd === pj) return false;
   return om.isComputed(nd.__parent);
}
  
  
// overrides should  only  be specified in the top level call

om.updateErrors = [];
om.debugMode = 1; // no tries in debug mode, to ease catching of errors
om.updateCount = 0;

// add an override to the override tree in root, for nd, with respect to the given root. If the override is already there, does nothing
// but returns it.
om.addOverride = function (root,nd) {
  if (!nd) {
    debugger;
  }
  var ovr = root.__overrides;
  if (!ovr) {
    ovr = root.set("__overrides",om.DNode.mk());
  }
  var p = nd.__pathOf(root);
  return om.createPath(ovr,p);
  return;
}

/*
om.pathLookup = function (ovr,path) {
  var ln = path.length;
  var cv = ovr;
  for (var i=0;i<ln;i++) {
    var nm = path[i];
    var cv = cv[nm];
    if (cv === undefined) {
      return undefined;
    }
  }
  return cv;
}


om.findInOverride = function (root,nd) { // find the correpsponding node in override
  var ovr = root.__overrides;
  if (ovr) {
    var pth = om.pathOf(nd,root);
    
  return om.pathLookup(ovr,pth);
}
    
*/
// transfer the __values of the specified __properties to the override ovr; nothing is done if there is no corresponding prop in ovr
// only atomic props will be transferred
// root is the DNode corresponding to the root node of ovr
// on oct 14, changed this so that it creates the override if not already present

om.transferToOverride = function (root,nd,prop) {
  var ond = om.addOverride(root,nd);
  var v = nd.__get(prop);
  if (v && (typeof v === "object")) {
    om.error("Only atomic data can be transferred to overrides");
  }
  if (v===undefined) {
    return  0;
  }
  var oprop = (typeof prop==="number")?"__"+prop:prop;
  ond[prop] = v;
}
/* stickySet means set and recall in the overrides  */
om.stickySet = function (root,nd,k,v) {
  nd.set(k,v);
  om.transferToOverride(root,nd,k);
}



// overrides sometimes need to be installed via running an update in their nearest parent with this method
// took this feature out, but left the code zeroed out
var updateParents = {};
var installOverridesTop; // the top level node upon which this method is called
om.installOverrides = function (nd,ovr,notTop) {
  if (0 && !notTop) {
    installOverridesTop = nd;
    updateParents = {};
  }
  var ks = Object.getOwnPropertyNames(ovr);
  ks.forEach(function (k) {
    if (om.internal(k)) {
      return;
    }
    var v = ovr[k];
    if (om.isObject(v)) {
      var nv = nd[k];
      if (om.isNode(nv)) {
        om.installOverrides(nv,v,1);
      }
    } else {
      nd[k] = v;
      var upd = om.ancestorWithMethod(nd,"update");
      if (upd && (upd !== installOverridesTop)) {
        var p = om.pathOf(upd,installOverridesTop).join("/");
        updateParents[p] = 1;
      }
    }
  });
  if (0 && !notTop) {
    console.log("UPDATE PARENTS",updateParents);
    for (var pth in updateParents) {
      var und = om.evalPath(nd,pth);
      console.log(und);
      und.update();
    }
  }
}

om.DNode.updateWithOverrides = function () {
  if (this.update) {
    this.update();
  }
  var ovr = this.__overrides;
  if (ovr) {
    om.installOverrides(this,ovr);
  }
}
om.updateWithOverrides = function (nd) {
  nd.updateWithOverrides();
}


  om.resetComputedLNode = function (nd,prp) {
    var cv = nd[prp];
    if (cv) {
      om.removeChildren(cv);
    } else {
      cv = om.declareComputed(nd.set(prp,om.LNode.mk()));
    }
    return cv;
  }
  
  
  om.resetComputedDNode = function (nd,prp,factory) {
    var cv = nd[prp];
    if (cv) {
      om.removeChildren(cv);
    } else {
      if (factory) {
        var nv = factory();
      } else {
        nv = om.DNode.mk();
      }
      cv = om.declareComputed(nd.set(prp,nv));
    }
    return cv;
  }
  // if stash is nonnull, save the computed nodes to stash
  // the stash option is used when saving an item, but wanting its state to persist after the save
  om.removeComputed = function (nd,stash) {
    var thisHere = this;
    var fnd = 0;
    om.forEachTreeProperty(nd,function (ch,k) {
      if (ch.__computed) {
        fnd = 1;
        if (stash) {
          stash[k] = ch;
        }
        ch.remove();
      } else {
        if (stash) {
          var chst = stash[k] = {__internalNode:1};
        } else {
         chst = undefined;
        }
        if (om.removeComputed(ch,chst)) {
          fnd = 1;
        } else {
          if (stash) {
            delete stash[k];
          }
        }
      }
    });
    return fnd;
  }
  
  
  om.restoreComputed = function (nd,stash) {
    for (var k in stash) {
      if (k === "__internalNode") continue;
      var sk = stash[k];
      if (!sk) {
        debugger;
      }
      if (sk.__internalNode) {
        om.restoreComputed(nd[k],sk);
      } else {
        nd[k] = sk;
      }
    }
  }
  
    
  

//end extract
})(prototypeJungle);