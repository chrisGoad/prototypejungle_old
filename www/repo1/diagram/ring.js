//"title":"The Cayley graph for dihedral group D3",

pj.require('/diagram/graph2.js','/shape/circle.js','/shape/arcArrow.js','/data/cayley_d3.js',function (graphP,circlePP,arrowPP,data) {
debugger;
const geom = pj.geom;
var item = pj.svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());
//item.graph.set('__data',Object.create(dataP));//.instantiate());
var arrowP = pj.ui.installPrototype('arcArrow',arrowPP);
//var arrowP = item.graph.set('edgeP',arrowPP.instantiate().__hide());
item.graph.edgeP = arrowP;
var circleP = pj.ui.installPrototype('circle',circlePP);
//var arrowP = item.graph.set('edgeP',arrowPP.instantiate().__hide());
item.graph.vertexP = circleP;
arrowP.labelSep = 15;
arrowP.radius = 0.93;
arrowP.clockwise = true;
arrowP.stroke = 'black';
arrowP.headWidth = 15;
arrowP['stroke-width'] = 3;
arrowP.headGap = 5;
arrowP.tailGap = 5;
var vertexP = item.graph.vertexP;
vertexP.fill = 'red';
item.count = 8;
item.radius = 100;
item.built = false;
item.update = function () {
  if (this.built) {
    return;
  }
  let count = this.count;
  for (let i = 0;i< count;i++) {
    let angle = (i* Math.PI * 2)/count;
    let position = geom.Point.mk(Math.cos(angle),Math.sin(angle)) . times(this.radius);
    let vertex = this.graph.addVertex(null,'V'+i);
    vertex.__show();
    vertex.__moveto(position);
   
  }
  for (let i = 0;i< count;i++) {
    let nm = 'E'+i;
    let edge = this.graph.addEdge(null,nm);
    edge.__show();
    this.graph.connect(nm,0,'V'+i);
    this.graph.connect(nm,1,'V'+((i+1)%count));
  }
  this.graph.update();
    this.built = true;

}

return item;
});


 