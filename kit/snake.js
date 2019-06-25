core.require('/container/roundedRectangle.js','/arrow/arrow.js','/arrow/twoBends.js',function (vertexPP,arrowPP,endArrowPP) {
  
let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.perRow= 2;
item.numRows = 3;
item.endCurveWidth = 20;
item.width = 120;
item.height = 150;
/* end adjustable parameters */


item.resizable = true;
item.isKit = true;
item.numNodesBuilt = 0;
item.hideAdvancedButtons = true;


item.initialize = function () {
  this.vertexP = core.installPrototype('vertexP',vertexPP);
  this.edgeP = core.installPrototype('edgeP',arrowPP);
  this.endEdgeP = core.installPrototype('endEdgeP',endArrowPP);
  this.endEdgeP.elbowWidth = 50;
}


item.updatePositions = function () {
  this.betweenRowSep = (this.height)/(this.numRows - 1);
  this.inRowSep = (this.width)/(this.perRow - 1);
  let {perRow,numRows,inRowSep,betweenRowSep,endCurveWidth,width,height} = this;
  let numNodes= numRows * perRow;
  let startY = -0.5*height;
  let startX =  - 0.5*width;
  let endX =  0.5*width;
  let cnt = 0;
  for (let i=0;i<numRows;i++) {
    let oddRow = i%2 === 1;
    for (let j=0;j<perRow;j++) {
      let vertex = this.vertices['v'+(cnt++)];
      let cx = oddRow?endX - j*inRowSep:startX + j*inRowSep;
      let cy = startY + i*betweenRowSep;
      let pos = Point.mk(cx,cy);
      if (vertex) { // in case it has been deleted
        vertex.moveto(pos);
      }
    }
    if (i<(numRows-1)) {
      let endEdge = this.edges['end'+i];
      if (endEdge) {
        endEdge.depth = oddRow?-endCurveWidth:endCurveWidth;
      }
    }
  }
 
}

item.update = function () {
  let {perRow,numRows,inRowSep,betweenRowSep,endCurveWidth,numNodesBuilt} = this;
  let numNodes = numRows * perRow;
  if (numNodes === numNodesBuilt) {
    this.updatePositions();
    graph.graphUpdate();
    return;
  }
  graph.reset(this);
  let vertex;
  for (let i=0;i<numNodes;i++) {
    let nm = 'v'+i;
    vertex = this.vertexP.instantiate().show();
    this.vertices.set(nm,vertex);
  }
  let vidx,v0,v1;
  let cnt = 0;
  this.updatePositions();
  for (let i=0;i<numRows;i++) {
    let oddRow = i%2 === 1;
    for (let j=0;j<perRow-1;j++) {
      let edge = this.edgeP.instantiate().show();
      this.edges.set('e'+ (cnt++),edge);
      vidx = i*perRow + j;
      v0 = this.vertices['v'+vidx];
      v1 = this.vertices['v'+(vidx+1)];
      graph.connectVertices(edge,v0,v1);
    }
    if (i<(numRows-1)) {
      let endEdge = this.endEdgeP.instantiate().show();
      endEdge.connectionType = 'EastWest';
      endEdge.vertical = true;  
      this.edges.set('end'+ i,endEdge);
      let v2 = this.vertices['v'+(vidx+2)];
      endEdge.depth = oddRow?-50:50;
      graph.connectVertices(endEdge,v1,v2);
      endEdge.update();
      
    }
  }      
  this.updatePositions();
  this.numNodesBuilt = numNodes;
}

ui.hide(item,['builtDimension','vertices','edges','numNodesBuilt','inRowSep','betweenRowSep','hideAdvancedButtons']);

return item;
});
     
