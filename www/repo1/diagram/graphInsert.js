 'use strict';
pj.require(function () {
  let item = pj.Object.mk();
  pj.ui.customInsert  = function (proto) {
     var rs;
     if (!proto.__roles) {
       return;
     }
     if (proto.__roles.indexOf('vertex') > -1) {
       rs = pj.root.diagram.addVertex(proto);
     } else if (proto.__roles.indexOf('edge') > -1) {
       rs = pj.root.diagram.addEdge(proto);
     } else if  (proto.__roles.indexOf('multiIn') > -1) {
       rs = pj.root.diagram.addMultiIn(proto);
     } else if  (proto.__roles.indexOf('multiOut') > -1) {
       rs = pj.root.diagram.addMultiOut(proto);
     }
     return rs;
   }
   return item;
 });
