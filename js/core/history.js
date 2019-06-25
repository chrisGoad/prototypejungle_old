let history = [];
// each element of history is either a complete state, or a diff
// at any given moment (except when the mouse is moving), the last element of history represents the current state 
// (perhaps via a diff)
// popping the state means going to history[history.length - 2]



let beforeSaveStateHooks = [];
let afterSaveStateHooks = [];

let historyFailed = false;
const isDiff = (h) => Boolean(h.diffs);
let afterHistoryFailureHooks = [];
let beforeSerializeState = [];
let afterSerializeState = [];

const addStateToHistory = function (kind) { //complete state, that is
  clearLabels(root);
  let srcp = root.__sourceUrl;
  root.__sourceUrl = undefined;// for reference generaation in externalize
  //beforeSerialize.forEach(function (fn) {fn(root);});
  beforeSerializeState.forEach(function (fn) {fn(root);});
  let s = encode(root);
  let state = deserialize(s);
  let map = collectNodes(state,root);
  root.__sourceUrl = srcp;
  afterSerializeState.forEach(function (fn) {fn(root);});
  //let labelMap = buildLabelMap(state); // just for testing
  if (!map) {
	  console.log('CollectNodes failed');//keep
    historyFailed = true;
    debugger;  //keep
	  console.log('history failure');// shouldn't happen; keep
    afterHistoryFailureHooks.forEach((fn) => fn());
  }
  history.push({map,state,kind});

}


const previousState = function (n) {
  for (let i=n;i>=0;i--) {
    let h = history[i];
    if (!isDiff(h)) {
      return i;
    }
  }
}

const mostRecentState = function () {
  return previousState(history.length - 1);
}

const nullDiff = function (diff) {
  return Object.getOwnPropertyNames(diff).length ===0;
}

const nullDiffs = function (diffs) {
  let ln = diffs.length;
  for (let i=0;i<ln;i++) {
    if (!nullDiff(diffs[i])) {
      return false;
    }
  }
  return true;
}
let currentHistoryIndex = -1;

const canRedo = () => (history.length > (currentHistoryIndex + 1));

  
const saveState = function (kind) {
  //debugger;
  //console.log('saveState');
  if (!vars.historyEnabled) {
	return;
  }
  beforeSaveStateHooks.forEach((fn) => {fn();});
  let ln = history.length;
  if (currentHistoryIndex < (ln-1)) {
    history.length = currentHistoryIndex+1;
  }
  // put this all in a catch, because we must be certain to run afterSaveStateHooks
  try {
    if (currentHistoryIndex < 0) {
      addStateToHistory(kind);
    } else {
      let lastState = history[mostRecentState()];
      let diffs = findAllDiffs(lastState.map);
      if (diffs) { 
        if (diffs !== 'none') {
          history.push({diffs,kind});  // add a diff 
        }
      } else { // need a new complete state
        addStateToHistory(kind);
      }
    }
  } catch (e) {
    error('Problem in saving state');
  }
  afterSaveStateHooks.forEach((fn) => {fn();});
  currentHistoryIndex = history.length - 1;

}


let afterRestoreStateHooks = [];

/*
const installMostRecentState = function () {
  let ln = history.length;
  for (i=ln-1;i>=0;i--) {
    let h = history[i];
    if (!isDiff(h)) {
      lastState = h.state;
      lastMap = h.map;
      installMap(lastMap);
      return i;
    }
  }
}
*/


const gotoState= function (n) { // goes to a state, or diff
  //debugger;
  if (!vars.historyEnabled) {
    return;
  }
  let ln = history.length;
  if ((n >= ln) || (currentHistoryIndex === n)) {
    return;
  }
  let current = history[currentHistoryIndex];
  let destination = history[n];
  let currentStateIndex = previousState(currentHistoryIndex);
  let destStateIndex = previousState(n);
  let destState = history[destStateIndex];
  if (currentStateIndex === destStateIndex) { // only need to install a diff
    installMap(destState.map);
    if (n > destStateIndex) {
      installDiffs(destState.map,destination.diffs);
    }
  } else { // we have moved to a new state 
    //debugger;
    root = copyState(destState.state);
    remap(root,destState.map); 
    if (n > destStateIndex) {
      installDiffs(destState.map,destination.diffs);
    }
    if (vars.installRoot) {
	    vars.installRoot();
    }
  }
  if (vars.refresh) {
	   vars.refresh();
  }
  afterRestoreStateHooks.forEach((fn) => {fn();});
  currentHistoryIndex = n;
}


const undo = function () {
  let ln = history.length;
  if (ln > 1) {
    gotoState(currentHistoryIndex-1);
    // history.pop();
  } 
}

const next = function () {
  let ln = history.length; 
  if (currentHistoryIndex < ln-1) {
    gotoState(currentHistoryIndex  + 1);
  }
}

let stepInterval = 1000;

const oneStepPromise = function (interval,then) {
   let pr = new Promise(function (resolve,reject) {
     let ln = history.length;
     if (currentHistoryIndex === ln -1) {
      resolve("end");
     } else {
        setTimeout(() => {
          next();
         resolve('step')
        },interval);
     }
   });
   pr.then(then);
}

const oneStep =function (intv=1000) {
  oneStepPromise(intv,(val) => {});//console.log("Finished one step",val));
}

const animate = function (intv=1000) {
  let then;
  then = function (val) {
    if (val === 'step') {
      oneStepPromise(intv,then);
    } else {
      //console.log('finished animation');
    }
  }
  oneStepPromise(intv,then);
}

const encodeHistory = function () {
  return history.map((h) => isDiff(h)?h:{state:encode(h.state),map:encodeMap(h.state,h.map),kind:h.kind});
}

const decodeMap = function (state,map) {
  return map.map(function (path) {
    return {node1:evalPath(state,path)};
  });
}
   

const decodeHistory = function (h) {
  return h.map((he) => {
   if (isDiff(he)) return he;
   let state = deserialize(he.state);
   let map = decodeMap(state,he.map);
   let kind = he.kind;
   return {state,map,kind};
  });
}


const githubTest = function () {
  httpGet('https://raw.githubusercontent.com/chrisGoad/prototypetrees/dev/src/core/basic_ops.js',
          function (erm,rs) {
              debugger; //keep
          });
}

const turnIntoPromise = function (fn,input) {
  return new Promise(
    function (resolve,reject) {
      fn(input,function (err,rs) {
        if (err) { 
          reject(err); 
        } else {
          resolve(rs);
        }
      });
    });
}

/*
const httpGetPromise = function (url) {
  return new Promise(
    function (resolve,reject) {
      httpGetForInstall(url,function (err,rs) {
        if (err) { 
          reject(err); 
        } else {
          resolve(rs);
        }
      });
    });
}
*/
const collectRequires = function (h) {
  let accum = {};
  h.forEach(function (he) {
    if (!isDiff(he)) {
      let requires = he.state.__requires;
      requires.forEach(function (rq) {
        accum[rq] = 1;
      });
    }
  });
  return Object.getOwnPropertyNames(accum);
}
      

async function installHistory(isrc,cb) {
  //let jrs = await httpGetPromise(isrc);
  let jrs = await turnIntoPromise(httpGetForInstall,isrc);
  let rs = JSON.parse(jrs);
  let requires = collectRequires(rs);
  //await turnIntoPromise(loadRequires,['/shape/circle.js']);//requires);
  await turnIntoPromise(loadRequires,requires);
  history = decodeHistory(rs);

}


  

export {history,historyFailed,afterHistoryFailureHooks,beforeSaveStateHooks,afterSaveStateHooks,saveState,
        gotoState,undo,next,canRedo,currentHistoryIndex,afterRestoreStateHooks,oneStep,animate,encodeHistory,
        githubTest,installHistory,beforeSerializeState,afterSerializeState};
