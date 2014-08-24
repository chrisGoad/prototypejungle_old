(function (pj) {
  "use strict";
  var om = pj.om;
  var ui = pj.ui;
  var dat = pj.dat;
  var dom = pj.dom;

  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  
  // some state of an item is not suitable for saving (eg all of the dom links). This sta
  var propsToStash = ["__objectsModified","__xdata","surrounders","__container"];
  var computeStash;
  var domStash;
  var stateStash;
  //var itemSaved;
  
  var stashPreSave = function (itm,needRestore) {
   // itemSaved = itm;
      stateStash = needRestore?{}:undefined;
      if (needRestore) {
        om.setProperties(stateStash,itm,propsToStash,1);
      }
      propsToStash.forEach(function (p) {
        delete itm[p];
      });
      dat.stashData(itm);
      domStash = needRestore?{}:undefined;
      dom.removeDom(itm,domStash);
      computeStash = needRestore?{}:undefined;
      om.removeComputed(itm,computeStash);
     
      //if (needRestore) itemSaved = itm;
  } 
  
  
  om.beforeStringify.push( function (itm) {stashPreSave(itm,1)});
  
  var restoreAfterSave = function (itm) {
    //var itm = itemSaved;
    om.setProperties(itm,om.stashedState,propsToStash,1);
    dat.restoreData(itm);
    om.restoreComputed(itm,computeStash);
    om.restoreDom(itm,domStash);
  }
    
  om.afterStringify.push(restoreAfterSave);

//end extract

 
})(prototypeJungle);