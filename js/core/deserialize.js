// Copyright 2017 Chris Goad
// License: MIT

//start extract


// <Section> internalize ====================================================


pj.splitRefToUrl = function (ref) {
  let splitRef = ref.split('|');
  let isSplit = splitRef.length > 1;
  return (isSplit)?pj.fullUrl(splitRef[0],splitRef[1]):ref;
}


pj.externalReferenceToUrl = function (ref,includesPath) {
  let closeBracket,url;
  let firstChar = ref[0];
  if (firstChar === '[') {
    closeBracket = ref.lastIndexOf(']')
    url = ref.substr(1,closeBracket-1);
  } else {
    url = ref;
  }
  if (includesPath) {
    let path = ref.substring(closeBracket+1);
    return {url:url,path:path};
  } else {
    return url;
  }
}

const resolveExternalReference = function (ref) {
  let urlAndPath,item,rs;
  let firstChar = ref[0];
  if (firstChar === '[') {
    urlAndPath = pj.externalReferenceToUrl(ref,true);
    item = pj.installedItems[urlAndPath.url];
    if (!item) {
      return undefined;
    }
    rs = pj.evalPath(item,urlAndPath.path);
  } else if (firstChar === '/') {
    rs = pj.evalPath(pj,ref.substr(1));
  } else {
    pj.error('deserialize','unexpected condition'); 
  }
  if (!rs) {
    pj.error('deserialize','unexpected condition'); 
  }
  return rs;
}




pj.deserialize = function (x) {
  let inodes = {};
  let externalItems = {};
  let atomicProperties = x.atomicProperties;
  let children = x.children;
  let arrays = x.arrays;
  let externals = x.externals;
  let value;
  
  let installAtomicProperties = function (parentCode) {
    let parent = inodes[parentCode];
    if (!parent) {
      return;
    }
    let values = atomicProperties[parentCode];
    for (let prop in values) {
      value = values[prop];
      if (Array.isArray(value)) {// a function
        parent[prop]  = eval('('+value+')');
      } else {
        parent[prop] = values[prop];
      }
    }
  }
  
  const installChildren = function (parentCode) {
    let parent = inodes[parentCode];
    if (!parent) {
      return;
    }
    let values = children[parentCode];
    for (let prop in values) {
      let child;
      let childCode = values[prop];
      if (typeof childCode === 'number') {
        child = inodes[childCode];
      } else {
        if (childCode.indexOf(' child')>=0) {
          child = externalItems[pj.beforeChar(childCode,' ')];
          child.__parent = parent;                               
        } else {
          child = externalItems[childCode];
        }
      }
      parent[prop] = child;
    }
  }
  
  const buildChain = function (chain) {
    chain.reverse();
    let cx;
    chain.forEach(function (code) {
      if (typeof code === 'number') {
        let node = inodes[code];
        if (!node) {
          node = Object.create(cx);
          inodes[code] = node;
        }
        cx = node;
      } else {
        cx = externalItems[code];
        if (!cx) {
           pj.error('deserialize','unexpected condition'); 
          cx = pj.Object.mk(); //temporary; 
        }
      }
    });
  }
  let eln = externals.length;
  for (let i=0;i<eln;i++) {
    let rs = resolveExternalReference(externals[i]);
    if (rs !== undefined) {
      externalItems['x'+i] =rs;
    } 
  }
  x.chains.forEach(buildChain);
  for (let acode in arrays) {
    let code = Number(acode);
    let a = pj.Array.mk();
    let aln = arrays[code];
    if (aln) {
      a.length = arrays[code];
    }
    inodes[code] = a;
  };
  let ln = atomicProperties.length;
  for (let i=0;i<ln;i++) {
    installAtomicProperties(i);
    installChildren(i);
  }
  return inodes[0];
 
}





//end extract
//})(prototypeJungle);