// computes the diff between core.root, and a state (deserialized from a saved state)

const propsToIgnore = ['__code','__element','__container','__setCount','__setIndex','__notHead',
'__parent','__label','__resizeBoxes','__selected','__updateCount'];
                       
const propsEquivalent = function (props1,props2) {
  let ln1 = props1.length;
  let ln2 = props2.length;
  for (let i=0;i<ln1;i++) {
    let p=props1[i];
    if ((propsToIgnore.indexOf(p) === -1) && (props2.indexOf(p) === -1)) {
        debugger;
        return false;
    }
  }
  for (let i=0;i<ln2;i++) {
    let p=props2[i];
    if ((propsToIgnore.indexOf(p) === -1) && (props1.indexOf(p) === -1)) {
        debugger;
        return false;
    }
  }
  return true;
}

const objectProperties(node) {
  let ownprops = Object.getOwnPropertyNames(node);
  let rs = [];
  ownprops.forEach((p) => {
    let child = node[p];
    if (child && (typeof child === 'object')) {
      rs.push(p);
    }
  });
  return rs;


  
//let collectedNodes1 = [];
let nodeMap; // this maps nodes1 to nodes2; each member has the form {node1:node1,node2:node2}

const externalToTree = function (node) {
  return (!getval(node,'__parent')) || Boolean(ancestorWithProperty(node,'__builtIn'));
}


const collectNodes = function (n1,n2) { // traverse the trees in order given by the ownprops of n1
  let nodeMap = [];
  let labelCount = 1;

	  
	const collectNodesR = function (n1,n2,callDepth=0) { // traverse the trees in order given by the ownprops of n1
	 // n1.__label = n2.label = labelCount++;
	  let  label1 = getval(n1,'__label');
	  let  label2 = getval(n2,'__label');
	 
	  if (label1 !== label2) {
		console.log('label mismatch false');
		debugger;
		return false;
	  }
	  if (label1) {
		console.log('found label');
		return true;
	  }
	  let ext1 = callDepth && externalToTree(n1);
	  let ext2 = callDepth && externalToTree(n2);
	  if (ext1 || ext2) {
		let rs = ext1 === ext2;
		if (!rs) {
		  console.log('Ext match false');
		  debugger;
		}
		return rs;
	  }
	  n1.__label = n2.__label = labelCount++;
	  nodeMap.push({node1:n1,node2:n2});
	  let ownprops1 = Object.getOwnPropertyNames(n1);
	  let ownprops2 = Object.getOwnPropertyNames(n2);
	  if (!propsEquivalent(ownprops1,ownprops2)) {
		console.log('false 0');
		debugger;
		 return false
	  }
	  let ln = ownprops1.length;
	  for (let i=0;i<ln;i++) {
		let p = ownprops1[i];
		if (propsToIgnore.indexOf(p) > -1) {
		  continue;
		}
		console.log(callDepth,n1.__name,'/',p);
		let child1 = n1[p];
		let child2 = n2[p];
		let obChild1 = Boolean(child1 && (typeof child1 === 'object'));
		let obChild2 = Boolean(child2 && (typeof child2 === 'object'));
		if (obChild1 !== obChild2) {
		  console.log('false 1');
		  debugger;
		  return false;
		}
		let treeChild1;
		if (obChild1) {
		  treeChild1 = child1.__parent === n1;
		  let treeChild2= child2.__parent === n2;
		  if (treeChild1 !== treeChild2) {
			console.log('false 2');
			debugger;
			return false;
		  }
		}
		if (treeChild1) { //both tree children
		  let proto1 = Object.getPrototypeOf(child1);
		  let proto2 = Object.getPrototypeOf(child2);
		  console.log('to proto');
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
	  console.log(callDepth,' true');
	  return true;
	}
	  
  let rs = collectNodesR(n1,n2);
  return rs?nodeMap:false;
	
}
  
const findDiff = function (n1,n2) {
  let ownprops1 = Object.getOwnPropertyNames(n1);
  let ownprops2 = Object.getOwnPropertyNames(n2);
  if (!propsEquivalent(ownprops1,ownprops2)) {
     debugger;
     return false
  }
  let ln = ownprops1.length;
  let diffs = {};
  for (let i=0;i<ln;i++) {
	let p = ownprops1[i];
	if (propsToIgnore.indexOf(p) > -1) {
	  continue;
	}
	let child1 = n1[p];
    let child2 = n2[p];
    let obChild1 = Boolean(child1 && (typeof child1 === 'object'));
    let obChild2 = Boolean(child2 && (typeof child2 === 'object'));
    if (obChild1 !== obChild2) {
      console.log('false 1');
	  debugger;
      return false;
    }
	if (obChild1) {
	  if (getval(child1,'__label') !== getval(child2,'__label')) {
		console.log('label mismatch false');
		debugger;
	    return false;
	  };
	  continue;
	}
	let typ1 = typeof child1;
	let typ2 = typeof child2;
	if (typ1 !== typ2) {
	  if (p !== '__sourceUrl') { // special case
	    console.log('type mismatch false');
	    debugger;
	    return false;
	  }
	}
	if (child1 !== child2) {
	  diffs[p] = child2;
	}
  }
  return diffs;
}

const findAllDiffs = function (map) {
  debugger;
  let ln = map.length;
  let diffs = [];
  for (let i=0;i<ln;i++) {
    let mapEl = map[i];
    let diff = findDiff(mapEl.node1,mapEl.node2);
    if (diff) {
      diffs.push(diff);
    } else {
      return false;
    }
  }
  return diffs;
}

const installMap = function (map) {
  root = map[0].node2;
  map.forEach(function ({node1,node2}) {
	  let ownprops1 = Object.getOwnPropertyNames(node1);
    ownprops1.forEach(function (p) {
      let child1 = node1[p];
      let child2 = node2[p]
      let obChild1 = Boolean(child1 && (typeof child1 === 'object'));
      if (!obChild1) {
        if (child1!== child2) {
          node2[p] = child1;
        }
      }
	  });
  });
}
  
  const  clearLabels = function (nd) {
	  debugger;
	forEachDescendant((node) => {node.__label = undefined;})
  }
	  
	  
		  

	  
  

const installDiffs = function (map,diffs) {
  let ln = map.length;
  for (let i=0;i<ln;i++) {
    let node2 = nodeMap[ln].node2;
    let diff = diffs[i];
    let props = Object.getOwnPropertyNames(diff);
    props.forEach(function (p) {
      node2[p] = diff[p];
    });
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


