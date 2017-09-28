'use strict';
pj.require('/diagram/multiOutTree.js','/diagram/navajoData.js',function (treeP,data) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
var tree =  item.set('tree',treeP.instantiate());
tree.__show();
tree.buildFromData(data);
return item;
});
