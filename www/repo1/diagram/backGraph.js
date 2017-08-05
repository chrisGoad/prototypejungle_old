pj.require('/diagram/graph2.js','/shape/arrow.js','/diagram/graphInsert.js',function (graphP,arrowP,inserter) {
  debugger;
  pj.root.set('diagram',graphP.instantiate());
  pj.root.set('insserter',inserter.instantiate());
  pj.ui.installPrototype('arrow',arrowP);
 
});

