// computes the diff between core.root, and a state (deserialized from a saved state)
// Theory of operation. A state is just a prototype tree (always distinct from the tree installed as root)
// If a state and root are isomorphic, a map maps the nodes of state to root.
// so, a state remembers the values of primitive and external properties while the root is changing
//After the root has changed, if it remains isomorphic (only prim props have changed), a diff records, node by node
// the prim prop values of the root that differ from the base state. These diffs are used to build a history between changes
// to non-primitive properties.
// Every time a nonprim change happens, a full state is recorded, and a new map built
// To go back to an old state, that state is copied and installed as root

// first copy everything except the cross-tree links, then fix those up
 // assumes the nodes are already labeled

const copyState = function (state) {
  // for now
  return deserialize(serialize(state));
}

vars.debugDiff = false;

const diffDebug = (msg) => {
  if (vars.debugDiff) {
    console.log('DEBUG DIFF ',msg); //keep
    debugger;//keep
  }
}


const buildLabelMap = function (stateTop) {
  let map = {};
  const R = function (state) {
    if (map[state.__label]) {
      return;
    }
    if (state.__label === undefined) {
      error('missing label'); 
    }
    map[state.__label] = state;
    let ownprops = Object.getOwnPropertyNames(state);
    ownprops.forEach((p) => {
      let child = state[p];
      if (child && (typeof child === 'object') &&  (child.__parent === state)) {
        let proto = Object.getPrototypeOf(child);
        if (!externalToTree(proto)) {
          R(proto);
        }
        if (!externalToTree(child)) {
          R(child);
        }
      };
    });
    return map;
  }
  R(stateTop);
  return map;
}

const remap = function (state,map) {
  let labelMap = buildLabelMap(state);
  map.forEach(function (mapEl) {
    let label = mapEl.node1.__label;
    mapEl.node2 = labelMap[label];
  });
}

const encodeMap = function (state,map) {
  let labelMap = buildLabelMap(state);
  return map.map((mapEl) => stringPathOf(mapEl.node1,state));
}
  
    
      
  




const propsToIgnore = ['__code','__element','__container','__setCount','__setIndex','__notHead',
'__parent','__label','__resizeBoxes','__selected','__updateCount','__beenAdjusted'];

//oneWay means that props2 may include more properties than props1, but not vice versa
                       
const propsEquivalent = function (props1,props2,oneWay=false) {
  let ln1 = props1.length;
  let ln2 = props2.length;
  for (let i=0;i<ln1;i++) {
    let p=props1[i];
    if ((propsToIgnore.indexOf(p) === -1) && (props2.indexOf(p) === -1)) {
        diffDebug('props1 not equivalent');
        return false;
    }
  }
  if (oneWay) {
    return true;
  }
  for (let i=0;i<ln2;i++) {
    let p=props2[i];
    if ((propsToIgnore.indexOf(p) === -1) && (props1.indexOf(p) === -1)) {
        diffDebug('props2 not equivalent');
        return false;
    }
  }
  return true;
}

const objectProperties = (node) => {
  let ownprops = Object.getOwnPropertyNames(node);
  let rs = [];
  ownprops.forEach((p) => {
    let child = node[p];
    if (child && (typeof child === 'object')) {
     // if (!child.__computed) {
     rs.push(p);
     // }
    }
  });
  return rs;
}


  
//let collectedNodes1 = [];
let nodeMap; // this maps nodes1 to nodes2; each member has the form {node1:node1,node2:node2}


const collectNodes = function (n1,n2) { // traverse the trees in order given by the ownprops of n1
  let nodeMap = [];
  let labelCount = 0;

	  
	const collectNodesR = function (n1,n2,callDepth=0) { // traverse the trees in order given by the ownprops of n1
	 // n1.__label = n2.label = labelCount++;
    /*let computed1 = n1.__computed;
    let computed2 = n2.__computed;
     if (computed1 !== computed2) {
		  diffDebug('label mismatch false');
		  return false;
	  }
    if (computed1) {
      return true;
    }*/
	  let  label1 = getval(n1,'__label');
	  let  label2 = getval(n2,'__label');
	  if (label1 !== label2) {
		  diffDebug('label mismatch false');
		  return false;
	  }
	  if (label1) {
		  //console.log('found label');
		  return true;
	  }
	  let ext1 = callDepth && externalToTree(n1);
	  let ext2 = callDepth && externalToTree(n2);
	  if (ext1 || ext2) {
		  let rs = ext1 === ext2;
		  if (!rs) {
		    diffDebug('Ext match false');
		  }
		  return rs;
	  }
	  n1.__label = n2.__label = labelCount++;
	  nodeMap.push({node1:n1,node2:n2});
    let obprops1 = objectProperties(n1);
	  let obprops2 = objectProperties(n2);
	  if (!propsEquivalent(obprops1,obprops2,true)) {
		  //console.log('false 0');
		  return false
	  }
	  let ln = obprops1.length;
	  for (let i=0;i<ln;i++) {
		let p = obprops1[i];
      if (propsToIgnore.indexOf(p) > -1) {
        continue;
      }
     // console.log(callDepth,n1.__name,'/',p);
     // if (p === 'data') {
     //   debugger;
     // }
      let child1 = n1[p];
      let child2 = n2[p];
      let extRef1 = child1.__get('__sourceUrl');
	    let extRef2 = child2.__get('__sourceUrl');
      if (extRef1 || extRef2) {
   	    let rs = extRef1 === extRef2;
		    if (!rs) {
		      diffDebug('Ext match false');
          return false;
		    }
        continue;
      }
      let treeChild1 = child1.__parent === n1;
      let treeChild2= child2.__parent === n2;
      if (treeChild1 !== treeChild2) {
        diffDebug('false 2');
        return false;
      }
      if (treeChild1) { //both tree children
        let proto1 = Object.getPrototypeOf(child1);
        let proto2 = Object.getPrototypeOf(child2);
        //console.log('to proto');
        let rs = collectNodesR(proto1,proto2,callDepth+1);
        if (!rs) {
          return false;
        }
        rs = collectNodesR(child1,child2,callDepth+1);
        if (!rs) {
          return false;
        }
        
		  }
	  }
	  //console.log(callDepth,' true');
	  return true;
	}
	  
  let rs = collectNodesR(n1,n2);
  return rs?nodeMap:false;
	
}
  
const findDiff = function (n1,n2) {
  let foundADiff = false;
  let ownprops1 = Object.getOwnPropertyNames(n1);
  let ownprops2 = Object.getOwnPropertyNames(n2);
  let obprops1 = objectProperties(n1);
  let obprops2 = objectProperties(n2);
  if (!propsEquivalent(obprops1,obprops2)) {
     return false;
  }
  let primProps = [];
  let filter = (p) => (propsToIgnore.indexOf(p) === -1) && (primProps.indexOf(p)===-1)&&(obprops1.indexOf(p)===-1);
  ownprops1.forEach((p) => {
    if (filter(p)) {
      primProps.push(p);
    }
  });
  ownprops2.forEach((p) => {
    if (filter(p)) {
      primProps.push(p);
    }
  });
  let diffs = {};
  // first check the object properties; no change is allowed in them
  let ln = obprops1.length;
  for (let i=0;i<ln;i++) {
    let p = obprops1[i];
    let child1 = n1[p];
    let child2 = n2[p];
    if (getval(child1,'__label') !== getval(child2,'__label')) {
      diffDebug('label mismatch false');
      return false;
    };    
  }
  ln = primProps.length;
  for (let i=0;i<ln;i++) {
    let p = primProps[i];
    if (propsToIgnore.indexOf(p) > -1) {
      continue;
    }
    let child1 = n1[p];
    let child2 = n2[p];
    let typ1 = typeof child1;
    let typ2 = typeof child2;
    if ((child1 !== undefined) && (typ1 !== typ2)) {
      if (p !== '__sourceUrl') { // special case
        diffDebug('type mismatch false');
        return false;
      }
    }
    if (child1 !== child2) {
      foundADiff = true;
      diffs[p] = child2;
    }
  }
  return foundADiff?diffs:'none';
}

const findAllDiffs = function (map) {
  let foundADiff = false;
  let ln = map.length;
  let diffs = {};
  for (let i=0;i<ln;i++) {
    let mapEl = map[i];
    let diff = findDiff(mapEl.node1,mapEl.node2);
    if (diff===false) {
      return false;
    } else if (diff && (diff!=='none')) {
      foundADiff = true;
      diffs[i] = diff;
    } 
  }
  return foundADiff?diffs:'none';
}
// installs the state represented by the map, without diffs
const installMap = function (map) {
  root = map[0].node2;
  let cnt = 0; // only for debugging
  map.forEach(function ({node1,node2}) {
	  let ownprops1 = Object.getOwnPropertyNames(node1);
    ownprops1.forEach(function (p) {
      if (node2 === undefined) {
         return;
      }
      let child1 = node1[p];
      let child2 = node2[p];

     /* if (child2 === 'undefined') {
         debugger; //keep
      }*/
      let obChild1 = Boolean(child1 && (typeof child1 === 'object'));
      if (!obChild1) {
        if (child1!== child2) {
          node2[p] = child1;
        }
      }
	  });
    cnt++;
    // we might have to remove some added properties
    let ownprops2 = Object.getOwnPropertyNames(node2);
    ownprops2.forEach(function (p) {
      if ((propsToIgnore.indexOf(p)===-1) && (ownprops1.indexOf(p)===-1)) {
        delete node2[p];
      }
    });

  });
}
  
  const  clearLabels = function (nd) {
	forEachDescendant((node) => {node.__label = undefined;})
  }
	  
	  
		  

	  
  

const installDiffs = function (map,diffs) {
  //let ln = map.length;
  for (let i in diffs) {
  //for (let i=0;i<ln;i++) {
    let node2 = map[i].node2;
    let diff = diffs[i];
    for (let p in diff) {
    //let props = Object.getOwnPropertyNames(diff);
    //props.forEach(function (p) {
      node2[p] = diff[p];
    };
  }
}

const removeFactor = function (n,f) {
  if (n === 1)  return 1;
  let rm = n%f;
  if (rm === 0) {
	return removeFactor(n/f,f);
  }
  return n;
}

const removeFactors = function (n) {
  return removeFactor(removeFactor(removeFactor(n,2),3),7);
}


const listem = function (n) {
  let rs =[];
  for (let i=1;i<n;i++) {
    if (removeFactors(i) === 1) {
      rs.push(i);
	}
  }
  return rs;
}
	 

export {nodeMap,collectNodes,findAllDiffs}


