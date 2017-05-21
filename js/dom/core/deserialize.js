
//(function (pj) {

// This is one of the code files assembled into pjcore.js. 'start extract' and 'end extract' indicate the part used in the assembly


//start extract


// <Section> internalize ====================================================


pj.splitRefToUrl = function (ref) {
  var splitRef = ref.split('|');
  var isSplit = splitRef.length > 1;
  return (isSplit)?pj.fullUrl(splitRef[0],splitRef[1]):ref;
}


pj.externalReferenceToUrl = function (ref,includesPath) {
  var firstChar = ref[0];
  if (firstChar === '[') {

    var closeBracket = ref.lastIndexOf(']')
    var url = ref.substr(1,closeBracket-1);
  } else {
    url = ref;
  }
  if (includesPath) {
    var path = ref.substring(closeBracket+1);
    return {url:url,path:path};
  } else {
    return url;
  }
}

var resolveExternalReference = function (ref) {
  var firstChar = ref[0];
  if (firstChar === '[') {
    var urlAndPath = pj.externalReferenceToUrl(ref,true);
    var item = pj.installedItems[urlAndPath.url];
    if (!item) {
      return undefined;
    }
    var rs = pj.evalPath(item,urlAndPath.path);
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



var installAtomicProperties 
pj.deserialize = function (x) {
  var inodes = {};
  var externalItems = {};
  var atomicProperties = x.atomicProperties;
  var children = x.children;
  var arrays = x.arrays;
  var externals = x.externals;
  var value;
  
  var installAtomicProperties = function (parentCode) {
    var parent = inodes[parentCode];
    if (!parent) {
      return;
    }
    var values = atomicProperties[parentCode];
    for (var prop in values) {
      value = values[prop];
      if (Array.isArray(value)) {// a function
        parent[prop]  = eval('('+value+')');
      } else {
        parent[prop] = values[prop];
      }
    }
  }
  
  var installChildren = function (parentCode) {
    var parent = inodes[parentCode];
    if (!parent) {
      return;
    }
    var values = children[parentCode];
    for (var prop in values) {
      var childCode = values[prop];
      if (typeof childCode === 'number') {
        var child = inodes[childCode];
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
  
  var buildChain = function (chain) {
    chain.reverse();
    var cx;
    chain.forEach(function (code) {
      if (typeof code === 'number') {
        var node = inodes[code];
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
  var eln = externals.length;
  for (var i=0;i<eln;i++) {
    var rs = resolveExternalReference(externals[i]);
    if (rs !== undefined) {
      externalItems['x'+i] =rs;
    } 
  }
  x.chains.forEach(buildChain);
  for (var acode in arrays) {
    var code = Number(acode);
    var a = pj.Array.mk();
    var aln = arrays[code];
    if (aln) {
      a.length = arrays[code];
    }
    inodes[code] = a;
  };
  var ln = atomicProperties.length;
  for (i=0;i<ln;i++) {
    installAtomicProperties(i);
    installChildren(i);
  }
  return inodes[0];
 
}





//end extract
//})(prototypeJungle);