
(function (pj) {

// This is one of the code files assembled into pjcore.js. 'start extract' and 'end extract' indicate the part used in the assembly


//start extract


// <Section> internalize ====================================================


pj.splitRefToUrl = function (ref) {
  var splitRef = ref.split('|');
  var isSplit = splitRef.length > 1;
  return (isSplit)?pj.fullUrl(splitRef[0],splitRef[1]):ref;
}




var resolveExternalReference = function (ref) {
  var firstChar = ref[0];
  if (firstChar === '[') {
    var closeBracket = ref.indexOf(']')
    var internalOpenBracket = ref.indexOf(']|');
    if (internalOpenBracket > 0) {
        var closeBracket = ref.indexOf(']',closeBracket);
    }
    var splitUrl = ref.substr(1,closeBracket-1);
    var url = pj.splitRefToUrl(splitUrl);
    var item = pj.installedItems[url];
    if (!item) {
      return undefined;
    }
    var path = ref.substring(closeBracket+1);
    var rs = pj.evalPath(item,path);
   
  } else if (firstChar === '/') {
    rs = pj.evalPath(pj,ref.substr(1));
  } else {
    debugger;
  }
  if (!rs) {
    debugger;
  }
  return rs;
}



var installAtomicProperties 
pj.ii = function (x,relto) {
  var inodes = {};
  var externalItems = {};
  var atomicProperties = x.atomicProperties;
  var children = x.children;
  var arrays = x.arrays;
  var externals = x.externals;
  
  var installAtomicProperties = function (parentCode) {
    var parent = inodes[parentCode];
    if (!parent) {
      return;
    }
    var values = atomicProperties[parentCode];
    for (var prop in values) {
      parent[prop] = values[prop];
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
        child = externalItems[childCode]
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
          debugger;
          cx = pj.Object.mk(); //temporary; 
        }
      }
    });
  }
  debugger;
  var eln = externals.length;
  for (var i=0;i<eln;i++) {
    var rs = resolveExternalReference(externals[i]);
    if (rs !== undefined) {
      externalItems['x'+i] =rs;
    } 
  }
  x.chains.forEach(buildChain);
  for (var code in arrays) {
    var a = pj.Array.mk();
    var aln = arrays[code];
    if (aln) {
      a.length = arrays[code];
    }
    inodes[code] = a;
  }
  debugger;
  var ln = atomicProperties.length;
  for (i=0;i<ln;i++) {
    installAtomicProperties(i);
    installChildren(i);
  }
  var ee = externalItems;
  var nn = inodes;
  debugger;
 
}





//end extract
})(prototypeJungle);