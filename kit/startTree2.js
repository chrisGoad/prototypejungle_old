core.require('/kit/arrowTree.js','/connector/u.js','/container/roundedRectangle.js',function (treeP,arrowPP,circlePP) {
let tree = treeP.instantiate();

let dataString ='{"d":[{},{}]}';
let data = {d:[{},{}]};

tree.initialize = function () {
  let vertexP = core.installPrototype('vertexP',circlePP);
  let edgeP = core.installPrototype('edgeP',arrowPP);
  vertexP.fill = "transparent";
  vertexP.stroke = "black";
  vertexP.dimension = 30;
  edgeP.headGap = 5;
  edgeP.tailGap = 7;
  edgeP['stroke-width'] = 3;
  edgeP.headWidth = 15;
  edgeP.headLength = 12;
  this.hSpacing = 100;
  this.vSpacing = 100;
  this.__internalDataString=dataString;
  //this.data =
  this.vertexP = vertexP;
  this.edgeP = edgeP;
 // this.buildFromData(null,vertexP,edgeP);
  let data = core.getData(this);
  this.buildFromData(data);
}


return tree;
});
