// checks for integrity of the state; not needed in normal operation


const checkItem = function (item) {
  let cn = item.content;
  if (cn) {
    let p = pOf(cn);
    if (!isPrototype(p)) {
      console.log('FOUND PROBLEM in ',item.__name);//keep
    }
  }
}

const checkItems = function () {
  forEachTreeProperty(root,checkItem);
}

let treeNodes;

// check that a tree with correct parent pointers and names descends from this node. For debugging.
nodeMethod('__checkTree',function (path) {
  if (this.__get('__inTree')) {
    return;
  }
  let toPush = [this,path];
  let proto = Object.getPrototypeOf(this);
  let source = proto.__get('__sourceUrl');
  if (source) {
    toPush.push('['+source+']');
  }
  treeNodes.push(toPush);
  this.__inTree = true;
  if ((!proto.__get('__inTree')) && ancestorHasOwnProperty(proto,'__inTree')) {
    proto.__checkTree(path.concat('~')); // recurse for the prototype
  } 
  // now recurse for the children
  let pnames = Object.getOwnPropertyNames(this);
  pnames.forEach((nm) =>  {
    if (internal(nm) || (nm === '__element') || (nm === '__container')) {
      return;
    }
    let child = this[nm];
    if (child && isNode(child)) {
      let pr = child.__get('__parent');
      if (pr) {
         let nm = child.__name;
         if (pr !== this)  {
           console.log('Bad node',nm);//keep
           treeNodes.push([this,path,'bad']);
           debugger;//keep
         } else {
           child.__checkTree(path.concat(nm));
         }
      } 
    }
  });
});



const reportTreeNodes = function (n) {
  let cnt = 0;
  treeNodes.forEach((node) => {
    let path = node[1];
    let st = (cnt++) + ' ' + path.join('/');
    let ln = node.length;
    for (let i=2;i<ln;i++) {
      st += ' '+node[i];
    }
    console.log(st);//keep
  });
}
const checkRoot = function () {
   treeNodes = [];
   root.__checkTree([]);
}

const checkPointers1 = function (pathEl) {
  let node = pathEl[0];
  let pnames = Object.getOwnPropertyNames(node);
  pnames.forEach(function (nm) {
    if (internal(nm) || (nm === '__element') || (nm === '__container')) {
      return;
    }
    let vl = node[nm];
    if ((typeof vl === 'object') && vl && ((!isNode(vl)) || (!vl.__get('__inTree')))){
      pathEl.push('Bad property '+nm);
    }
  });
}

const checkProto = function (pathEl) {
  let node = pathEl[0];
  let proto = Object.getPrototypeOf(node);
  let source = proto.__get('__sourceUrl');
  if ((!proto.__inTree) && (proto !== ObjectNode) && (proto !== ArrayNode) && (!source) &&
      (!ancestorHasOwnProperty(proto,'__builtIn')) && (!ancestorHasOwnProperty(proto,'__sourceUrl'))) {
    pathEl.push('??');
  }
}

const checkTree = function () { 
  checkRoot();
  treeNodes.forEach((node) => {
    checkPointers1(node);
    checkProto(node);
  });
  reportTreeNodes();
  treeNodes.forEach((node) => node._inTree = false);
  return treeNodes;
}



// this should not be needed in normal operation, but checks for and fixes a problem that arose on 8/22/18
const fixNames = function (onode,checkOnly) {
  let node = onode?onode:root;
  let recurse = function (node) {
    let props = Object.getOwnPropertyNames(node);
    props.forEach(function (prop) {
      if (internal(prop))  {
        return;
      }
      let child = node[prop];
      if (!isNode(child)) {
         return;
      }
      if (treeProperty(node,prop,false,true)) {
        let childNm = child.__name;
        if (childNm !== prop) {
           console.log('Name mismatch. From parent ',prop,' From child ',childNm);//keep
           if (!checkOnly) child.__name = prop;
        }
        recurse(child,checkOnly);
      } 
    });
  }
  recurse(node,checkOnly);
}


export {checkItem,checkItems,checkTree,checkRoot,treeNodes,fixNames};