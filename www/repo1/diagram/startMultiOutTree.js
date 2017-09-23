'use strict';
pj.require('/diagram/multiOutTree.js',function (treeP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg;
var item = pj.svg.Element.mk('<g/>');
//var tree = pj.root.set('__graph',treeP.instantiate());
var tree =  item.set('tree',treeP.instantiate());
tree.__show();
var data = {text:"text",d:[{text:"text"},{text:"text"}]};
tree.buildFromData(data);
return item;
});
