core.require('/kit/multiTree.js','/arrow/multiOut.js','/container/roundedRectangle.js',function (treeP,multiPP,circlePP) {
let tree = treeP.instantiate();

let dataString ='{"d":[{},{}]}';
let data = {d:[{},{}]};

tree.initialize = function () {
  tree.vertical = false;
  let vertexP = core.installPrototype('vertexP',circlePP);
  let multiP = core.installPrototype('edgeP',multiPP);
  vertexP.fill = "transparent";
  vertexP.stroke = "black";
  vertexP.width = 40;
  vertexP.height = 30;
  this.vSpacing = 30;
  this.hSpacing = 70;
  this.__internalDataString=dataString;
  //this.data =
  this.vertexP = vertexP;
  this.multiP = multiP;
  this.hideProperties();
 // this.buildFromData(null,vertexP,edgeP);
  let data = core.getData(this);
  this.buildFromData(data);
}


return tree;
});
