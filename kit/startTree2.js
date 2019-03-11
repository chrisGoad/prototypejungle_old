core.require('/kit/multiTree.js','/arrow/multiOut.js','/container/roundedRectangle.js',function (treeP,multiPP,circlePP) {
let tree = treeP.instantiate();

let dataString ='{"d":[{},{}]}';
let data = {d:[{},{}]};

tree.initialize = function () {
  tree.vvertical = true;
  let vertexP = core.installPrototype('vertexP',circlePP);
  let multiP = core.installPrototype('edgeP',multiPP);
  vertexP.fill = "transparent";
  vertexP.stroke = "black";
  vertexP.width = 40;
   vertexP.height = 30;
 /*
  edgeP.headGap = 5;
  edgeP.tailGap = 7;
  edgeP['stroke-width'] = 3;
  edgeP.headWidth = 15;
  edgeP.headLength = 12;
  */
  this.hSpacing = 100;
  this.vSpacing = 100;
  this.__internalDataString=dataString;
  //this.data =
  this.vertexP = vertexP;
  this.multiP = multiP;
 // this.buildFromData(null,vertexP,edgeP);
  let data = core.getData(this);
  this.buildFromData(data);
}


return tree;
});
