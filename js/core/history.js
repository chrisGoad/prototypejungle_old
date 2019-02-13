let history = [];

let beforeAddToHistoryHooks = [];

const addToHistory = function () {
  beforeAddToHistoryHooks.forEach((fn) => {fn();});
  history.push(stringify(root));
}

let afterRevertHooks = [];


const revertToState = function (n) {
  let ln = history.length;
  if ((n>=ln) || (n<0)) {
    error('out of bounds'); // will throw if throwOnError is set
    return;
  }
  root = history[n];
  afterRevertHooks.forEach((fn) => {fn();});
}

const undo = function () {
  revertToState(history.length-2);
}

export {history,beforeAddToHistoryHooks,addToHistory,afterRevertHooks,revertToState,undo};
