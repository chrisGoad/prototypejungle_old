

const hasRole = function (node,role) {
  return node.role === role;
}

const toRole = function (roles) { //temporary during transition from roles to role
  if (typeof roles === 'object') {
    return roles[0];
  }
  return roles;
}

const descendantWithRole = function (item,role,roles) {  
  let rs;
  const recurser = (node) => {
    if (node.__name === 'prototypes') return undefined;
    let nodeRole = node.role;
    if ((role && nodeRole === role) ||
        (roles && (roles.findIndex((candidate) => candidate === nodeRole))>-1)) {
      rs = node;
      throw nul;
    } else {
      forEachTreeProperty(node,recurser);
    }
  }
  try {
    recurser(item);
  } catch(e) {
  }
  return rs;
}

const ancestorWithRole = function (item,role,roles) {
  return findAncestor(item,function (node) {
    let nodeRole = node.role;
    if ((role && nodeRole === role) ||
        (roles && (roles.findIndex((candidate) => candidate === nodeRole))>-1)) {
      return node;
    }}); 
}


// make sure that, in each prototype, if it has an own dimension, its width and height are set to it.
const propagateDimension  = function (item) {
  if (item === ObjectNode) {
    return;
  }
  let dim = item.__get('dimension');
  if (dim !== undefined) {
    item.width = item.height = dim;
  }
  propagateDimension(Object.getPrototypeOf(item));
}

const transferExtent = function (dest,src,own) {
  let destDim = own?dest.__get('dimension'):dest.dimension;
  let dim = own?src.__get('dimension'):src.dimension;
  let width = own?src.__get('width'):src.width;
  let height = own?src.__get('height'):src.height;
  if (Number(destDim)) {
    if (dim) {
      dest.dimension = dim;
    }
    if (width) {
      dest.dimension = Math.max(width,height);
    }
    return;
  }
  if (Number(dim)) {
    dest.width = dim;
    dest.height = dim;
    return;
  }
  if (Number(width)) {
    dest.width = width;
  }
  if (Number(height)) {
    dest.height = height;
  }
}

const transferOwnExtent = function (dest,src) {
  transferExtent(dest,src,true);
}

const containingKit = function (item) {
  return findTopAncestor(item,(node) => node.isKit);
}


// transferState is used in copying as well as replacement
const transferState = function (dest,src,settings,own=true,forCopy) {
  let transferState = dest.transferState;
  if (transferState) {
    dest.transferState(src,own);
  }
  if (!forCopy) {
    let kit = containingKit(dest);
    if (kit && kit.transferElementState) {
      kit.transferElementState(dest,src,own);
    }
  }
  setProperties(dest,src,['role','unselectable','neverselectable','visibility','__singleton']);
  dest.role = src.role;
  if (dest.resizable) {
    transferExtent(dest,src,own);
  }
  if (settings) {
    dest.set(settings);
  }
}

// fix the cross-tree links 
const fixLinks = function (node,replaced,replacement) {
  let names = Object.getOwnPropertyNames(node);
  names.forEach(function (nm) {
    let treeProp = treeProperty(node,nm,false,true);
    if (treeProp) {
      fixLinks(node[nm],replaced,replacement);
    } else if (node[nm] === replaced) {
      node[nm] = replacement;
    }
  });
}


  
  

// climbCount if present tells how many steps to go up the tree to what is updated
// used for replacing parts

const ireplace = function (replaced,replacementProto,climbCount,settings) {
  let inPrototypesTree  = isPrototype(replaced);
  let position;
  if (!inPrototypesTree) {
    position = replaced.getTranslation();
  }
  let parent = replaced.__parent;
  let replacement = replacementProto.instantiate();
  if (inPrototypesTree) {
    replacement.hide();
  } else {
    replacement.unhide();
  }
  if (settings) {
    replacement.set(settings);
  }
  parent.__replaceChild(replaced,replacement); // keeps the order of children intact; FORWARD REFERENCE
  if (replacement.initialize && !inPrototypesTree) {  transferState(replacement,replaced,undefined,!inPrototypesTree/*own*/);
    replacement.initialize();
  }
  transferState(replacement,replaced,settings,!inPrototypesTree/*own*/);//mod cg 1/8/19
  if (position) {
    replacement.moveto(position);
  }
  // if replaced is in the prototype tree, cause all of the inheritors to inherit from the replacement
  if (inPrototypesTree) {
    forInheritors(replaced,function (ireplaced) {
      if (ireplaced === replaced) { // any node counts as an inheritor of itself - we're  only interested in strict inheritors
        return;
      }
      ireplace(ireplaced,replacement,climbCount);
    });
  }
  return replacement;
}

let afterReplaceHooks = [];

const replace = function (replaced,replacementProto,climbCount,settings) {
  let links = crossTreeLinks();
  let rs = ireplace(replaced,replacementProto,climbCount,settings);
  installLinks(links);
  afterReplaceHooks.forEach( (fn) => fn());
  return rs;
}

ObjectNode.swapPrototypeOf = function (replacementProto) {
  return replace(this,replacementProto);
}


ObjectNode.swapThisPrototype = function (replacementProto) {
  return replace(this,replacementProto);
}

// this copies the item itself (ie the head of its prototype chain, but the copy inherits from Object.getPrototyepOf(item)
// TransferState is used to populate the copy, and the result is added as a sibling of item in the tree

const copyItem = function (item,iunder) {
  let proto = Object.getPrototypeOf(item);
  let rs = proto.instantiate();
  transferState(rs,item,undefined,true,true);
  transferOwnExtent(rs,item);
  propagateDimension(rs);
  let under = iunder?iunder:item.__parent;
  let newName = autoname(under,item.__name);
  under.set(newName,rs);
  return rs;
}

ObjectNode.copy = function (placeUnder) {
  return copyItem(this,placeUnder);
}

export {propagateDimension,containingKit,transferState,replace,toRole,
        descendantWithRole,ancestorWithRole,copyItem,hasRole,afterReplaceHooks};
