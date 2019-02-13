// Copyright 2019 Chris Goad
// License: MIT

// some state of an item is not suitable for saving (eg all of the dom links). This sta

let propsToStash = ["__container","__controlBoxes","__customBoxes"];
let computeStash;
let domStash;
let stateStash;
  
const stashPreSave = function (itm,needRestore) {
  stateStash = needRestore?{}:undefined;
  if (needRestore) {
    core.setProperties(stateStash,itm,propsToStash,true);
  }
  propsToStash.forEach(function (p) {
    delete itm[p];
  });
  domStash = needRestore?{}:undefined;
  stashDom(itm,domStash);
  computeStash = needRestore?{}:undefined;
  core.removeComputed(itm,computeStash);
} 
  
  
core.beforeStringify.push( function (itm) {stashPreSave(itm,1)});

const restoreAfterSave = function (itm) {
  core.setProperties(itm,stateStash,propsToStash,true,true);//fromOwn,dontCopy
  core.restoreComputed(itm,computeStash);
  restoreDom(itm,domStash);
}
    
core.afterStringify.push(restoreAfterSave);

