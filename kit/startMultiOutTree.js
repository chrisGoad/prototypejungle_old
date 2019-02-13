
core.require('/kit/multiOutTree.js',function (treeP) {

let dataString = '{"text":"text","d":[{"text":"text"},{"text":"text"}]}';

var tree =  treeP.instantiate();
tree.initialize = function () {
  this.show();
  this.__internalDataString=dataString;
  this.buildFromData();
}
return tree;
});
