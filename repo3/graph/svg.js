//realization of graphs in svg
(function () {

var svg = pj.svg;
pj.require([['arrowPP','shape/arrow1.js'],['graphLib','graph/def.js']],function (erm,item) {
var geom = pj.geom;
//item.set('circleP',svg.Element.mk('<circle  fill="red" r="2" cx="0" cy="0" />'));
item.set('arrowP',item.arrowPP.instantiate());
var arrowP = item.arrowP;
var graphLib = item.graphLib;
var graph = graphLib.graph;

//var svgGraph = svg.Element.mk('<g/>');
var svgGraph = item;
// an svgGraph has an abstract graph as its graph property
// it has markSets arrows, vertices, vertexLabels, and edgeLabels


//item.set("EdgeP",
//  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
//    stroke="black"  stroke-width="1"/>'));

//item.set('LabelP', svg.Element.mk('<text font-size="10" fill="black" text-anchor="left"/>'));
svgGraph.set('EdgeLabelP', svg.Element.mk('<text font-size="10" font-weight="bold" fill="blue" text-anchor="left"/>'));
svgGraph.set('VertexLabelP', svg.Element.mk('<text font-size="10" fill="black" text-anchor="middle"/>'));

svgGraph.set("CircleP",
   svg.Element.mk('<circle  visibility="hidden" r="20" cx="0" cy="0" pointer-events="none" fill="black"/>'));

svgGraph.CircleP.__adjustable = 1;

svgGraph.set("arrows",pj.Marks.mk(arrowP));
svgGraph.set("circles",pj.Marks.mk(svgGraph.CircleP));


svgGraph.set('edgeKindsToColors',pj.lift({'proto':'green','prop':'yellow'}));
/* A graph is a vertices object, and an edges array.
 * The form of a vertex {point:, label:, color:} For now only leaves have labels
 * The form of an edge {e0:, e1:,label:,color:}
 */

// svgGraph.edges, svgGraph.vertices  should be set from the outside.

//svgGraph.set("arrows",pj.Array.mk());
//svgGraph.set("vertexSymbols",pj.Array.mk())


// utility for making vertices from the likes of {a:[0,0],b:[10,10]}
/*
svgGraph.mkVertices = function (iverts) {
debugger;
  var keys = Object.keys(iverts);
  var rs = pj.Object.mk();
  keys.forEach(function (key) {
    var v = iverts[key];
    var pnt = pj.geom.Point.mk(v);
    rs.set(key,pnt);
    
  });
  return rs;
}
*/

/*
item.copyVertex = function (v) {
  var rs = pj.Object.mk();
  rs.point = v.point.copy();
  pj.setProperties(rs,v,['color','label']);
  return rs;
}


item.copyEdge = function (v) {
  var rs = pj.Object.mk();
  pj.setProperties(rs,v,['e0','e1','color','label']);
  return rs;
}


item.copyEdge = function (v) {
  var rs = pj.Object.mk();
  pj.setProperties(rs,v,['e0','e1','color','label']);
  return rs;
}


item.displace = function (g,displacement,suffix) {
  var rs = pj.Object.create();
  var vertices = g.vertices;
  var nverts = pj.Object.create();
  var keys = Object.keys(vertices);
  keys.forEach(function (key) {
    var v = vertices[key];
    var nv = pj.Object.create();
    nv.point = v.point.plus(displacement);
    pj.setProperties(nv,v,['color','label']);
    nverts.set(key+suffix,nv);
    
  })
  
}
*/
svgGraph.arrows.binder = function (arrow,edge,indexInSeries,lengthOfDataSeries) {
  var graph = this.__parent.data;
  var vertices = graph.vertices;
  var e0 = vertices[edge.e0];
  var e1 = vertices[edge.e1];
  var p0 = e0.point;
  var p1 = e1.point;
  var k = edge.kind;
  arrow.setEnds(p0,p1);
  var color = this.__parent.edgeKindsToColors[k];
  if (color) {
    arrow.stroke = color;
  }
  //arrow.stroke = 'green';
  arrow.update();
  arrow.forEdge = edge.__name;

}

svgGraph.circles.binder = function (circle,vertex,name) {
  debugger;
  var p = vertex.point;
  circle.cx = p.x;
  circle.cy = p.y;
  circle.forVertex = name;
}




svgGraph.listenForArrowChange = function (ev) {
  console.log("CHANGE",ev.id);
  if (ev.id === "moveArrowEnd") {
    // move the vertex in the data.
    var nd = ev.node;
    var pos = geom.Point.mk(nd.x,nd.y);
    console.log('new arrow pos',pos.x,pos.y);
    var forEdge = nd.__parent.forEdge;
    var graph = pj.ancestorWithName(nd,'theGraph');
    var vertices = graph.data.vertices;
    var edges = graph.data.edges;
    var edge = edges[forEdge];
    var vertex = vertices[edge.e0];
    vertex.set('point',pos);
    graph.update();
    graph.draw();
  }
}

svgGraph.addListener("moveArrowEnd","listenForArrowChange");


svgGraph.update = function () {
  debugger;
  var d = this.data;
  if (d) {
    this.arrows.setData(d.edges);
    debugger;
    this.circles.setData(d.vertices);
  }
}
/*
  pj.forEachTreeProperty(vertices,function (v) {
   var circle = CircleP.instantiate();
   vertexSymbols.push(circle);
   circle.show();
   circle.moveto(v.point);
 },1);
}
*/
  pj.returnValue(undefined,svgGraph);

});
})();


