// Copyright 2019 Chris Goad
// License: MIT

// <Section> deserialize  ====================================================


const splitRefToUrl = function (ref) {
  let splitRef = ref.split('|');
  let isSplit = splitRef.length > 1;
  return (isSplit)?fullUrl(splitRef[0],splitRef[1]):ref;
}


const externalReferenceToUrl = function (ref,includesPath) {
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
    return {url,path};
    //return {url:url,path:path};
  } else {
    return url;
  }
}

const resolveExternalReference = function (ref) {
  let urlAndPath,item,rs;
  let firstChar = ref[0];
  if (firstChar === '[') {
    urlAndPath = externalReferenceToUrl(ref,true);
    item = installedItems[urlAndPath.url];
    if (!item) {
      return undefined;
    }
    rs = urlAndPath.path?evalPath(urlAndPath.path,item):item;
  } else if (firstChar === '/') {
    rs = evalPath(ref.substr(1),codeRoot);
  } else {
    error('deserialize','unexpected condition'); 
  }
  //if (!rs) { //seems benign, but I'll leave this in commented in case of later trouble; cg 4/1/2018
 ///   error('deserialize','unexpected condition'); 
  //}
  return rs;
}




const deserialize = function (x) {
  let inodes = {};
  let externalItems = {};
  let atomicProperties,children,arrays,externals;
  ({atomicProperties,children,arrays,externals} = x);
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
        let fn = eval('('+value+')');
        if (!serializeFunctions) {  // only serializing functions with theh serializeMe flag, which needs to be reasserted
          fn.serializeMe = true;
        }
        parent[prop] = fn;
        
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
        if (childCode === undefined) {
          //debugger;
          continue;
        }
        if (childCode.indexOf(' child')>=0) {
          child = externalItems[beforeChar(childCode,' ')];
          child.__parent = parent;                               
        } else {
          child = externalItems[childCode];
        }
      }
      parent[prop] = child;
    }
  }
  
  const buildChain = function (ichain) {
    let chain = ichain.slice(0); // copy it, so that deserialize is idempotent
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
           //error('deserialize','unexpected condition'); //seems benign, but I'll leave this in commented in case of later trouble; cg 4/1/2018
          cx = ObjectNode.mk(); //temporary; 
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
    let a = ArrayNode.mk();
    let aln = arrays[code];
    if (aln) {
      a.length = arrays[code];
    }
    inodes[code] = a;
  }
  let ln = atomicProperties.length;
  for (let i=0;i<ln;i++) {
    installAtomicProperties(i);
    installChildren(i);
  }
  let rs = inodes[0];
  return rs; 
}

export {deserialize};