
(function (pj) {
  'use strict'
  var om = pj.om;

// This is one of the code files assembled into pjom.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> update

/* When a DNode has a method called update, the state of that node is maintained by application of that method
 * when there are changes. update might modify the state of the tree. If a node has a property __overrides, the intent is that the override tree should
 * be merged back into the main tree after each update. This allows specifying hand-tweaked variants of auto-computed items.
 */


om.declareComputed = function (node) {
  node.__computed = 1; 
  return node;
}


om.isComputed = function (node) {
  if (node.__computed) return true;
  if (node === pj) return false;
  return om.isComputed(node.__parent);
}
  
// overrides should  only  be specified in the top level call

om.updateErrors = [];
om.debugMode = 1; // no tries in debug mode, to ease catching of errors
om.updateCount = 0;

/* add an override to the override tree in root, for node, with respect to the given root. If the override is already there, does nothing
 * but returns it.
 */

om.addOverride = function (root,node) {
  var path,overrides;
  if (!node) {
    om.error('Bad argument');
  }
  var overrides = root.__overrides;
  if (!overrides) {
    overrides = root.set('__overrides',om.DNode.mk());
  }
  var path = node.__pathOf(root);
  return om.createPath(overrides,path);
}

/* transfer the __values of the specified __properties to the override overrides; nothing is done if there is no corresponding prop in overrides
 * only atomic props will be transferred
 * root is the DNode corresponding to the root node of overrides
 */

om.transferToOverride = function (root,node,prop) {
  var overrideNode = om.addOverride(root,node),
   value = node.__get(prop);
  if (value && (typeof value === 'object')) {
    om.error('Only atomic data can be transferred to overrides');
  }
  if (value===undefined) {
    return  0;
  }
  // preface numbers with __ so as to stay away from numerical properties of dictionaries
  var overrideProp = (typeof prop==='number')?'__'+prop:prop;
  overrideNode[prop] = value;
}

// stickySet means set and recall in the overrides  
om.stickySet = function (root,node,prop,value) {
  node.set(prop,value);
  om.transferToOverride(root,node,prop);
}



var updateParents = {};
var installOverridesTop; // the top level node upon which this method is called

om.installOverrides = function (node,overrides,notTop) {
  var props = Object.getOwnPropertyNames(overrides);
  props.forEach(function (prop) {
    var value,newValue;
    if (om.internal(prop)) {
      return;
    }
    value = overrides[prop];
    if (om.isObject(value)) {
      newValue = node[prop];
      if (om.isNode(newValue)) {
        om.installOverrides(newValue,value,1);
      }
    } else {
      node[prop] = value;
      var ancestorWithUpdate = om.ancestorWithMethod(node,'update');
      if (ancestorWithUpdate && (ancestorWithUpdate !== installOverridesTop)) {
        var path = om.pathOf(ancestorWithUpdate,installOverridesTop).join('/');
        updateParents[prop] = 1;
      }
    }
  });
}

om.DNode.outerUpdate = function () {
  if (this.update) {
    this.update();
  }
  var overrides = this.__overrides;
  if (overrides) {
    om.installOverrides(this,overrides);
  }
}
om.outerUpdate = function (node) {
  node.outerUpdate();
}


om.resetComputedLNode = function (node,prop) {
  var child = node[prop];
  if (child) {
    om.removeChildren(child);
  } else {
    child = om.declareComputed(node.set(prop,om.LNode.mk()));
  }
  return child;
}

// create a new fresh value for node[prop], all set for computing a new state

om.resetComputedDNode = function (node,prop,factory) {
  var value = node[prop],
    newValue;
  if (value) {
    om.removeChildren(value);
  } else {
    if (factory) {
      var newValue = factory();
    } else {
      newValue = om.DNode.mk();
    }
    value = om.declareComputed(node.set(prop,newValue));
  }
  return value;
}
  
/* if stash is nonnull, save the computed nodes to stash
 * the stash option is used when saving an item, but wanting its state to persist after the save
 */

om.removeComputed = function (node,stash) {
  var thisHere = this,
    found = 0;
  om.forEachTreeProperty(node,function (child,prop) {
    var stashChild;
    if (child.__computed) {
      found = 1;
      if (stash) {
        stash[prop] = child;
      }
      child.remove();
    } else {
      if (stash) {
        stashChild = stash[prop] = {__internalNode:1};
      } else {
        stashChild = undefined;
      }
      if (om.removeComputed(child,stashChild)) {
        found = 1;
      } else {
        if (stash) {
          delete stash[prop];
        }
      }
    }
  });
  return found;
}


om.restoreComputed = function (node,stash) {
  for (var prop in stash) {
    if (prop === '__internalNode') continue;
    var stashChild = stash[prop];
    if (!stashChild) {
      return;
    }
    if (stashChild.__internalNode) {
      om.restoreComputed(node[prop],stashChild);
    } else {
      node[prop] = stashChild;
    }
  }
}
 
//end extract

})(prototypeJungle);