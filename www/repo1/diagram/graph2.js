pj.require('/shape/circle.js','/shape/arrow.js',function (vertexPP,edgePP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//item.set('graph',graphP.instantiate());
//item.set('__data',Object.create(dataP));
item.set('edgeP',edgePP.instantiate().__hide());
item.set('vertexP',vertexPP.instantiate().__hide());
item.edgeP.headGap = 0;
item.edgeP.tailGap = 0;
//item.circleP.dimension = 15;
//item.circleP.__draggable = true;
item.edgeP.__draggable = false;
item.vSpacing = 50;
item.hSpacing = 50;
item.set('vertices',svg.Element.mk('<g/>'));
item.set('edges',svg.Element.mk('<g/>'));
item.lastVertexIndex = 0;
item.lastEdgeIndex = 0;

item.vertexP.set('__nonRevertable',pj.lift({incomingEdge:1}));
item.edgeP.set('__nonRevertable',pj.lift({fromVertex:1,toVertex:1}));


item.addVertex = function (ivertexP) {
  var vertexP = ivertexP?ivertexP:this.vertexP;
  var newVertex = vertexP.instantiate().__show();
  var nm = 'V'+this.lastVertexIndex++;
  this.vertices.set(nm,newVertex);
  newVertex.update();
  return newVertex;
}


item.addEdge = function (iedgeP) {
  var edgeP = iedgeP?iedgeP:this.edgeP;
  var newEdge =edgeP.instantiate().__show();
  newEdge.set('end0',geom.Point.mk());
  newEdge.set('end1',geom.Point.mk())
  var nm = 'E'+this.lastEdgeIndex++;
  this.edges.set(nm,newEdge);
  return newEdge;
}
// an edge has properties endN endNVertex, endNConnection (periphery, point0,point1,point2,point3,point) for N = 0,1
// later: multiedges

item.connect = function (iedge,whichEnd,ivertex,connectionType) {
  var edge = (typeof iedge === 'string')?this.edges[iedge]:iedge;
  var vertex = (typeof ivertex === 'string')?this.vertices[ivertex]:ivertex;
  edge['end'+whichEnd+'vertex'] = vertex.__name;
  edge['end'+whichEnd+'connection'] = connectionType?connectionType:'periphery';
}

item.connectAction = function (diagram,vertex) {
  var connectToVertex = vertex;
  var onSelect   = function (itm) {
    debugger;
    console.log('ZZZZZ'+itm.__name);
    var newEdge = diagram.addEdge();
    //delete this.connectToVertex ;
    diagram.connect(newEdge,0,connectToVertex,'periphery');
    diagram.connect(newEdge,1,itm,'periphery');
   
    diagram.update();
    diagram.__draw();
    ui.resumeActionPanelAfterSelect(vertex);

    
  }
  ui.setActionPanelForSelect('<p style="text-align:center">Select other<br/> end of edge</p>',onSelect);
}

item.updateEnd = function (edge,whichEnd,direction,connectionType) {
  var endName = 'end'+whichEnd+'vertex';
  var vertexName = edge[endName];         
  if (!vertexName) {
    return;
  }
  var vertex = this.vertices[vertexName];
  if (connectionType === 'periphery') {
    var pnt = vertex.periphery(direction);
  } else {
    pnt = vertex.cardinalPoint(connectionType);
  }
  edge['end'+whichEnd].copyto(pnt);
}

item.updateEnds = function (edge) {
  var end0connection = edge.end0connection;
  var end1connection = edge.end1connection;
  if (!end0connection &&!end1connection) {
    return;
  }
  if (!end0connection) {
    var vertex = this.vertices[edge.end1vertex];
    this.updateEnd(edge,1,vertex.directionTo(edge.end0),end1connection);
    return;
  }
   if (!end1connection) {
    var vertex = this.vertices[edge.end0vertex];
    this.updateEnd(edge,0,vertex.directionTo(edge.end1),end0connection);
    return;
  }
  if ((end0connection === 'periphery') && (end1connection === 'periphery')) {
    var vertex0pos = this.vertices[edge.end0vertex].__getTranslation();
    var vertex1pos = this.vertices[edge.end1vertex].__getTranslation();
    var direction0 = vertex0pos.directionTo(vertex1pos);
    var direction1 = direction0.minus();
    this.updateEnd(edge,0,direction0,end0connection);
    this.updateEnd(edge,1,direction1,end1connection);
    return;
  }
  debugger;
  if (end0connection === 'periphery') {
    this.updateEnd(edge,1,null,end1connection);
    var vertex0pos = this.vertices[edge.end0vertex].__getTranslation();
    var direction = vertex0pos.directionTo(edge.end1);
    this.updateEnd(edge,0,direction,end0connection);
    return;
  }
   if (end1connection === 'periphery') {
    this.updateEnd(edge,0,null,end0connection);
    var vertex1pos = this.vertices[edge.end1vertex].__getTranslation();
    var direction = vertex1pos.directionTo(edge.end0);
    this.updateEnd(edge,1,direction,end1connection);
    return;
  }
  this.updateEnd(edge,0,null,end0connection);
  this.updateEnd(edge,1,null,end1connection);
}


item.buildSimpleGraph = function () {
var i;
for (i=0;i<3;i++) {
  this.addVertex();
}
for (i=0;i<3;i++) {
  this.addEdge();
}

this.vertices.V1.__moveto(-50,50);
this.vertices.V2.__moveto(50,50);

this.connect('E0',0,'V0');
this.connect('E0',1,'V1');

this.connect('E1',0,'V1','West');
this.connect('E1',1,'V2','East');

this.connect('E2',0,'V2');
this.connect('E2',1,'V0');

this.update();
}

item.update = function () {
  var edges = this.edges;
  var thisHere = this;
  pj.forEachTreeProperty(edges,function (edge) {
     thisHere.updateEnds(edge);
     edge.update();
  });
  this.__draw();
}

item.deleteVertex = function (vertex) {
  debugger;
  //vertex.__unselect();
  var nm = vertex.__name;
  pj.forEachTreeProperty(this.edges,function (edge) {
    if ((edge.end0vertex === nm) || (edge.end1vertex === nm)) {
      edge.remove();
    }
  });
  ui.standardDelete(vertex);
}


item.vertexP.__ddelete = function () {
  var thisHere = this;
  ui.confirm('Are you sure you wish to delete this subtree?',function () {
    debugger;
    var diagram = thisHere.__parent.__parent;
    var root = diagram.vertices.N0;
    if (root === thisHere) {
      diagram.remove();
      ui.setSaved(false);
      pj.root.__draw();
      return;
    }
    diagram.deleteSubtree(thisHere,true);
    diagram.positionVertexs();
    diagram.update();
    ui.setSaved(false);
    diagram.__draw();
  });
}
/*
item.vertexP.__dragStep = function (pos) {
  this.__moveto(pos);
 var graph = this.__parent.__parent;
 graph.update();
}
*/
var connectEnd0 = function () {
  alert('aa');
}
item.edgeP.__actions = [{title:'connect',action:connectEnd0}];

item.dragVertex = function (vertex,pos) {
  vertex.__moveto(pos);
  this.update();
}
//item.buildSimpleGraph();

//item.vertexP.__actions = [{title:'add descendant',action:addDescendant}];


item.__activeTop = true;

item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
