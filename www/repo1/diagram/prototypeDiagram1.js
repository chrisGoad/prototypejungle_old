pj.require('/diagram/tree.js','/data/tree.js',function (treeP,dataP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');

item.set('tree',treeP.instantiate());
item.tree.set('__data',Object.create(dataP));


return item;
});
