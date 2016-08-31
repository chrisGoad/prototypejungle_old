
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
    //  for the form [blah|[uid]/blah]
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
    //var rs = path?pj.evalPath(item,path):item;
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


var inodes ;

var installAtomicProperties 
pj.ii = function (x,relto) {
  var atomicProperties = x.atomicProperties;
  var children = x.children;
  var arrays = x.arrays;
  var installAtomicProperties = function (parentCode) {
    var parent = inodes[parentCode];
    if (!parent) {
      return;
    }
    //if (pj.Array.isPrototypeOf(parent)) {
    //  debugger;
    //}
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
    //if (pj.Array.isPrototypeOf(parent)) {
    //  debugger;
    //}
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
  var buildIchain = function (chain) {
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
  externalItems = {};
  inodes = {};
  //var requires = x.requires;
  //requires.forEach(function (ref) {
  //  resolveExternalReference(ref);
 // });
  externals = x.externals;
  var ln = externals.length;
  for (var i=0;i<ln;i++) {
    var rs = resolveExternalReference(externals[i]);
    if (rs !== undefined) {
      externalItems['x'+i] =rs;
    } 
  }
  x.chains.forEach(buildIchain);
  for (var code in arrays) {
    var a = pj.Array.mk();
    var aln = arrays[code];
    if (aln) {
      a.length = arrays[code];
    }
    inodes[code] = a;
  }
  debugger;
  ln = atomicProperties.length;
  for (i=0;i<ln;i++) {
 // for (var code in atomicProperties) {
    installAtomicProperties(i);
    installChildren(i);
  }
  var ee = externalItems;
  var nn = inodes;
  debugger;
 
}





//end extract
})(prototypeJungle);