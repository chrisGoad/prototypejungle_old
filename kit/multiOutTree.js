//navajo


//core.require('/kit/multiTree.js','/shape/textPlain.js','/arrow/multiOut.js','/data/navajo.json',function (treeP,vertexPP,multiPP,data) {
core.require('/kit/multiTree.js','/shape/textPlain.js','/arrow/multiOut.js',function (treeP,vertexPP,multiPP) {
let tree = treeP.instantiate();//svg.Element.mk('<g/>');
let vertexP = core.installPrototype('vertexP',vertexPP);
tree.vertexP = vertexP;
vertexP.width = 150;
let multiP = core.installPrototype('edgeP',multiPP);
tree.multiP = multiP;
tree.vertical = false;
tree.includeArrows = false;
tree.hSpacing = 250;
tree.vSpacing = 20;

let data =   
{"text":"text","d":[
  {"text":"text"},
{"text":"text"}]};
  

item.addChildLeftAction = function (person) {
  this.addChild(person,null,true);
  this.layoutTree(person.nodeOf);
  this.afterAdd(person.nodeOf);

}
tree.initialize = function () {
  tree.show();
   tree.buildFromData(data);
}
return tree;
});
