// Copyright 2019 Chris Goad
// License: MIT

// some state of an item is not suitable for saving (eg all of the dom links). This sta

let propsToStash = ["__container","__controlBoxes","__customBoxes"];
let computeStash;
let domStash;
let stateStash;
  
const stashPreSave = function (itm,needRestore,removeComputed=true) {
  stateStash = needRestore?{}:undefined;
  domStash = needRestore?{}:undefined;
  stashDom(itm,domStash);
  
  if (needRestore) {
    core.setProperties(stateStash,itm,propsToStash,true);
  }
  propsToStash.forEach(function (p) {
    delete itm[p];
  });
  //domStash = needRestore?{}:undefined;
  //stashDom(itm,domStash);
  if (removeComputed) {
    computeStash = needRestore?{}:undefined;
    core.removeComputed(itm,computeStash);
  }
} 
  
  
core.beforeSerialize.push( function (itm) {stashPreSave(itm,1)});
core.beforeSerializeState.push( function (itm) {stashPreSave(itm,1,false)});

const restoreAfterSave = function (itm,restoreComputed=true) {
  core.setProperties(itm,stateStash,propsToStash,true,true);//fromOwn,dontCopy
  if (restoreComputed) {
    core.restoreComputed(itm,computeStash);
  }
  restoreDom(itm,domStash);
}
    
core.afterSerialize.push(restoreAfterSave);
core.afterSerializeState.push(function (itm) {restoreAfterSave(itm,false)});

