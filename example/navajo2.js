//navajo


core.require('/kit/multiTree.js','/shape/textPlain.js','/arrow/multiOut.js','/data/navajo.json',function (treeP,vertexPP,multiPP,data) {
  debugger;
let tree = treeP.instantiate();//svg.Element.mk('<g/>');
let vertexP = core.installPrototype('vertexP',vertexPP);
tree.vertexP = vertexP;
vertexP.width = 150;
let multiP = core.installPrototype('edgeP',multiPP);
tree.multiP = multiP;
tree.vertical = false;
tree.hSpacing = 250;
tree.vSpacing = 20;

tree.initialize = function () {
  tree.show();
  debugger;
  tree.buildFromData(data);
}
return tree;
});
