//"title":"The Cayley graph for dihedral group D3",

pj.require('/diagram/graph2.js','/shape/circle.js','/shape/arcArrow.js',function (graphP,circlePP,arrowPP) {
debugger;
let geom = pj.geom;
let item = pj.svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());
//item.graph.set('__data',Object.create(dataP));//.instantiate());
let arrowP = pj.ui.installPrototype('arcArrow',arrowPP);
//var arrowP = item.graph.set('edgeP',arrowPP.instantiate().__hide());
item.graph.edgeP = arrowP;
let circleP = pj.ui.installPrototype('circle',circlePP);
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
vertexP.fill = 'white';
item.count = 4;
item.builtCount = 0;
item.radius = 100;
item.update = function () {
   debugger;
  let count = this.count;
  let built = this.builtCount;
  for (let i = 0;i< count;i++) {
    let angle = (i* Math.PI * 2)/count;
    let position = geom.Point.mk(Math.cos(angle),Math.sin(angle)) . times(this.radius);
    let vertex;
    let name = 'V'+i;
    if (i < built) {
      vertex = this.graph.vertices[name];
    } else {
      vertex = this.graph.addVertex(null,'V'+i);
      vertex.__show();
    }
    vertex.__moveto(position);
   
  }
  /*const addRingEdge = function (e,v0,v1) {
    let name = 'E'+i;
    let edge = this.graph.addEdge(null,name);
    edge.__show();
    this.graph.connect(name,0,'V'+v0);
    this.graph.connect(name,1,'V'+((i+1)%count));
  }
  if (built === 0) {
    //code
  }*/
  //if (i === count) {
  //  //code
  //}
  for (let i = built;i<count;i++) {
    let edge = this.graph.addEdge();
    edge.__show();
    if (i === 0) {
      this.graph.connect(edge,0,'V'+(count-1));
      this.graph.connect(edge,1,'V0');
    } else {
     this.graph.connect(edge,0,'V'+(i-1));
     this.graph.connect(edge,1,'V'+i);
    }
  }
  this.graph.update();
  this.builtCount =count;

}

item.graph.setRingCount = function (graph,value) {
  debugger;
  var ring = graph.__parent;
  ring.count = value;
  ring.update();
}

//item.graph.__activeTop = true;
item.graph.__topActions = [{id:'count',title:'set count',type:"numericInput",
                           action:"setRingCount",value:item.count}];

return item;
});


 