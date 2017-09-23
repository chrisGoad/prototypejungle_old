pj.require('/axes/labels.js',function (labelsP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//var tree = pj.root.set('__graph',treeP.instantiate());
var labels =  item.set('labels',labelsP.instantiate());
labels.set('__data',pj.Array.mk([1,2,3]));

return item;
});
