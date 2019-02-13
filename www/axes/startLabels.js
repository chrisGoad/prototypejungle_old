core.require('/axes/labels.js',function (labelsP) {
var item = svg.Element.mk('<g/>');
//var tree = core.root.set('__graph',treeP.instantiate());
var labels =  item.set('labels',labelsP.instantiate());
labels.set('data',core.ArrayNode.mk([1,2,3]));

return item;
});
