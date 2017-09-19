pj.require('/diagram/graph.js','/shape/arrow.js','/diagram/graphInsert.js',function (graphP,arrowP,inserter) {
  debugger;
  pj.root.set('diagram',graphP.instantiate());
  pj.root.set('__inserter',inserter.instantiate());
  pj.ui.hide(pj.root,['__inserter']);
  pj.ui.installPrototype('arrow',arrowP);
  pj.ui.enableTheGrid = true;
 
});

