(function (pj) {
  "use strict";
  var pt = pj.pt;
  var ui = pj.ui;
  var dat = pj.dat;
  var dom = pj.dom;

  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  
  // some state of an item is not suitable for saving (eg all of the dom links). This sta
  var propsToStash = ["__objectsModified","__xdata","surrounders","__container","__controlBoxes","__customBoxes"];
  var computeStash;
  var domStash;
  var stateStash;
  
  var stashPreSave = function (itm,needRestore) {
      stateStash = needRestore?{}:undefined;
      if (needRestore) {
        pt.setProperties(stateStash,itm,propsToStash,1);
      }
      propsToStash.forEach(function (p) {
        delete itm[p];
      });
      dat.stashData(itm);
      domStash = needRestore?{}:undefined;
      dom.removeDom(itm,domStash);
      computeStash = needRestore?{}:undefined;
      pt.removeComputed(itm,computeStash);
  } 
  
  
  pt.beforeStringify.push( function (itm) {stashPreSave(itm,1)});
  
  var restoreAfterSave = function (itm) {
    pt.setProperties(itm,pt.stashedState,propsToStash,1);
    dat.restoreData(itm);
    pt.restoreComputed(itm,computeStash);
    pt.restoreDom(itm,domStash);
  }
    
  pt.afterStringify.push(restoreAfterSave);

//end extract

 
})(prototypeJungle);