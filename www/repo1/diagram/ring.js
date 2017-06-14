//"title":"The Cayley graph for dihedral group D3",

pj.require('/diagram/graph2.js','/text/textcircle.js','/shape/arcArrow.js',function (graphP,circlePP,arrowPP) {
debugger;
const geom = pj.geom,ui = pj.ui
let item = pj.svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());


item.count = 4;
item.__dimension = 100;
item.__defaultSize = geom.Point.mk(100,100);



item.__adjustable = true;
item.__draggable = true;
//item.graph.set('__data',Object.create(dataP));//.instantiate());
let arrowP = pj.ui.installPrototype('arcArrow',arrowPP);
//var arrowP = item.graph.set('edgeP',arrowPP.instantiate().__hide());
item.graph.edgeP = arrowP;
let circleP = pj.ui.installPrototype('circle',circlePP);
//var arrowP = item.graph.set('edgeP',arrowPP.instantiate().__hide());
item.graph.vertexP = circleP;
circleP.__dimension = 35;
arrowP.labelSep = 15;
arrowP.radius = 0.93;
arrowP.clockwise = true;
arrowP.stroke = 'black';
arrowP.headWidth = 15;
arrowP['stroke-width'] = 3;
arrowP.headGap = 5;
arrowP.tailGap = 5;
arrowP['stroke-width'] = 3;
var vertexP = item.graph.vertexP;
vertexP.fill = 'white';
item.builtCount = 0;
item.update = function () {
   debugger;
  let count = this.count;
  let built = this.builtCount;
  let radius = this.__dimension/2;
  debugger;
  for (let i = 0;i< count;i++) {
    let angle = (i* Math.PI * 2)/count;
    let position = geom.Point.mk(Math.cos(angle),Math.sin(angle)) . times(radius);
    let vertex;
    let name = 'V'+i;
    if (i < built) {
      vertex = this.graph.vertices[name];
    } else {
      //vertex = this.graph.addVertex(null,'V'+i);
      vertex = this.graph.addVertex();
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
  if (count < built) {
    for (let i = count;i<built;i++) {
      let vname = 'V'+i;
      let vertex = this.graph.vertices[vname];
      vertex.remove();
      debugger;
      let ename = 'E'+i;
      let edge = this.graph.edges[ename];
      edge.remove();
    }
    let edge = this.graph.edges['E0'];
    edge['end0vertex'] = 'V'+(count-1);
    ui.unselect();
    this.graph.lastVertexIndex = this.graph.lastEdgeIndex = count;
  } else {
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
    if (built > 0) {
      let edge = this.graph.edges['E0'];
      edge['end0vertex'] = 'V'+(count-1);
    }
  }
  this.graph.update();
  if (pj.selectedNode) {
    ui.updateControlBoxes();
  }
  this.graph.__draw();
  this.builtCount =count;

}

item.__setExtent = function (extent,nm) {
  let event,ext;
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if ((nm === 'c10') || (nm === 'c12'))  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.__dimension = ext;
}

item.graph.setRingCount = function (graph,value) {
  debugger;
  var ring = graph.__parent;
  ring.count = value;
  ring.update();
 
}

//item.graph.__activeTop = true;
item.graph.__topActions = [{id:'count',title:'Count',type:"numericInput",
                           action:"setRingCount",value:(graph) => graph.__parent.count}];

return item;
});


 