core.require('/kit/familyTree.js',function (treeP) {
//core.require('/kit/multiTree.js','/arrow/multiOut.js','/shape/textPlain.js',function (treeP,multiPP,circlePP) {
let item = svg.Element.mk('<g/>');


item.initialize = function () {
  this.set('tree',treeP.instantiate());
  this.tree.initialize();
}


return item;
});
