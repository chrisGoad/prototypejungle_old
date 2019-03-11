//navajo


core.require('/kit/multiTree.js','/shape/textPlain.js','/arrow/multiOut.js','/data/navajo.json',function (treeP,vertexPP,multiPP,data) {
  debugger;
let tree = treeP.instantiate();//svg.Element.mk('<g/>');
let vertexP = core.installPrototype('vertexP',vertexPP);
tree.vertexP = vertexP;
let multiP = core.installPrototype('edgeP',multiPP);
tree.multiP = multiP;
//var tree =  item.set('tree',treeP.instantiate());
/*tree.connectorP.width = 100;
tree.leafWidth = 180;
tree.textP.width = 180;
tree.textP.hPadding = 10;
tree.textP['font-size'] = 12;
tree.paddingRight=10;*/
tree.show();
tree.buildFromData(data);
return tree;
});
