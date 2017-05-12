pj.require('/shape/circle.js','/shape/arrow.js',function (vertexPP,edgePP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//item.set('graph',graphP.instantiate());
//item.set('__data',Object.create(dataP));
item.set('edgeP',edgePP.instantiate().__hide());
item.set('vertexP',vertexPP.instantiate().__hide());
item.edgeP.headGap = 0;
item.edgeP.tailGap = 0;
item.edgeP.includeEndControls = false;
//item.circleP.dimension = 15;
//item.circleP.__draggable = true;
item.edgeP.__draggable = false;
item.vSpacing = 50;
item.hSpacing = 50;
item.set('vertices',svg.Element.mk('<g/>'));
item.set('edges',svg.Element.mk('<g/>'));
item.set('multiIns',svg.Element.mk('<g/>'));
item.lastVertexIndex = 0;
item.lastEdgeIndex = 0;
item.lastMultiInIndex = 0;

item.vertexP.set('__nonRevertable',pj.lift({incomingEdge:1}));
item.edgeP.set('__nonRevertable',pj.lift({fromVertex:1,toVertex:1}));

item.getVertexPP = () => vertexPP;

item.addVertex = function (ivertexP,name) {
  debugger;
  var vertexP = ivertexP?ivertexP:this.vertexP;
  var nm = name?name:'V'+this.lastVertexIndex++;
  var newVertex = vertexP.instantiate();
  this.vertices.set(nm,newVertex);
  newVertex.__show();
   newVertex.update();
  return newVertex;
}


item.replaceVertex = function (replaced,replacementP) {
  var replacement = replacementP.instantiate().__show();
  var nm = replaced.__name;
  var pos = replaced.__getTranslation();
  replaced.remove();
  this.vertices.set(nm,replacement);
  replacement.update();
  replacement.__moveto(pos);
  return replacement;
}

item.addEdge = function (iedgeP) {
  var edgeP = iedgeP?iedgeP:this.edgeP;
  var newEdge =edgeP.instantiate();
  newEdge.includeEndControls = true;

  //newEdge.set('end0',geom.Point.mk());
  //newEdge.set('end1',geom.Point.mk())
  var nm = 'E'+this.lastEdgeIndex++;
  this.edges.set(nm,newEdge);
  newEdge.__show();
  newEdge.update();
  return newEdge;
}


item.addMultiIn = function (multiInP) {
  var newMultiIn =multiInP.instantiate();
  var nm = 'E'+this.lastMultiInIndex++;
  this.multiIns.set(nm,newMultiIn);
  newMultiIn.__show();
  newMultiIn.update();
  return newMultiIn;
}

item.connectMultiIn = function (diagram,edge) {
  debugger;
  //var multiIn = pj.selectedNode;
  var tr = edge.__getTranslation();
  var outEnd =tr.plus(edge.end1);
  var nearest = ui.findNearestVertex(outEnd,'right');
  if (nearest) {
    edge.outVertex = nearest.__name;
    edge.outConnection = 'periphery';
  }
  var inVertices = edge.set('inVertices',pj.Array.mk());
  var inConnections = edge.set('inConnections',pj.Array.mk());
  var inEnds = edge.inEnds;  
  inEnds.forEach(function (inEnd) {
      var nearest = ui.findNearestVertex(tr.plus(inEnd),'left');
      if (nearest) {
        inVertices.push(nearest.__name);
        inConnections.push('periphery');
      }
  });
  diagram.updateMultiInEnds(edge);
  edge.update();
  edge.__draw();
}

// an edge has properties endN endNVertex, endNSide endNsideFraction  for N = 0,1. The periphery of a vertex has a series
// of sides (which are currently regarded as straight, but might be arcs in future). The sides are numbered from the top in
// clockwise order. endOSide = 3 and endNsideFraction = 0.2 means 20% of the way along the 3rd side.
// later: multiedges

item.connect = function (iedge,whichEnd,ivertex,connectionType) {
  var edge = (typeof iedge === 'string')?this.edges[iedge]:iedge;
  var vertex = (typeof ivertex === 'string')?this.vertices[ivertex]:ivertex;
  edge['end'+whichEnd+'vertex'] = vertex.__name;
  edge['end'+whichEnd+'connection'] = connectionType?connectionType:'periphery';
  edge.includeEndControls = false;

}



item.connectAction = function (diagram,vertex) {
  var connectToVertex = vertex;
  var onSelect   = function (itm) {
    debugger;
    console.log('ZZZZZ'+itm.__name);
    var newEdge = diagram.addEdge();
    //delete this.connectToVertex ;
    //diagram.connect(newEdge,0,connectToVertex,'periphery');
    //diagram.connect(newEdge,1,itm,'periphery');
   
    diagram.connect(newEdge,0,connectToVertex,'periphery');
    diagram.connect(newEdge,1,itm,'periphery');
    diagram.update();
    diagram.__draw();
    ui.resumeActionPanelAfterSelect(vertex);
  }
  ui.setActionPanelForSelect('<p style="text-align:center">Select other<br/> end of edge</p>',onSelect);
}


// connectionType has the form 'sticky,edge,edgeFractionAlong' or 'periphery'


item.updateEnd = function (edge,whichEnd,direction,connectionType) {
  let vertexProperty,end,vertexName;
  let tr = edge.__getTranslation();
  
  if (edge.__role === 'multiIn') {
    let inVertexNames = edge.inVertices;
    if (typeof whichEnd === 'number') {
      end = edge.inEnds[whichEnd];
      vertexName = inVertexNames[whichEnd];
      //vertexProperty = 'inVertex'+whichEnd;
    } else {
      end = edge.end1;
      vertexName = edge.outVertex;
    }
  }  else {
    end = edge['end'+whichEnd];
    vertexProperty = 'end'+whichEnd+'vertex';
    vertexName = edge[vertexProperty];
  }
  if (!vertexName) {
    return;
  }
  var vertex = this.vertices[vertexName];
  let pnt,ppnt;
  if (connectionType === 'periphery') {
    ppnt = vertex.peripheryAtDirection(direction);
    end.copyto(ppnt.intersection.difference(tr));
  } else {
    let split = connectionType.split(',');
    let side = Number(split[1]);
    let fractionAlong = Number(split[2]);
    pnt = vertex.alongPeriphery(side,fractionAlong);
    end.copyto(pnt);
  }
  
}


item.updateMultiInEnds = function (edge) {
  var outConnection = edge.outConnection;
  this.updateEnd(edge,'out',geom.Point.mk(-1,0),outConnection);
  var inConnections = edge.inConnections;
  var ln = inConnections.length;
  for (var i=0;i<ln;i++) {
    this.updateEnd(edge,i,geom.Point.mk(1,0),inConnections[i]);
  }
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
  var periphery0 = (end0connection === 'periphery');
  var periphery1 = (end1connection === 'periphery');
  if (periphery0 && periphery1) {
    var vertex0pos = this.vertices[edge.end0vertex].__getTranslation();
    var vertex1pos = this.vertices[edge.end1vertex].__getTranslation();
    var direction0 = vertex0pos.directionTo(vertex1pos);
    var direction1 = direction0.minus();
    this.updateEnd(edge,0,direction0,end0connection);
    this.updateEnd(edge,1,direction1,end1connection);
    return;
  }
  if (periphery0) {
    this.updateEnd(edge,1,null,end1connection);
    var vertex0pos = this.vertices[edge.end0vertex].__getTranslation();
    var direction = vertex0pos.directionTo(edge.end1);
    this.updateEnd(edge,0,direction,end0connection);
    return;
  }
   if (periphery1) {
    this.updateEnd(edge,0,null,end0connection);
    var vertex1pos = this.vertices[edge.end1vertex].__getTranslation();
    var direction = vertex1pos.directionTo(edge.end0);
    this.updateEnd(edge,1,direction,end1connection);
    return;
  }
  this.updateEnd(edge,0,null,end0connection);
  this.updateEnd(edge,1,null,end1connection);
}

item.mapEndToPeriphery = function(edge,whichEnd,pos) {
  var vertexName = edge['end'+whichEnd+'vertex'];
  var vertex = this.vertices[vertexName];
  var center = vertex.__getTranslation();
  var direction = pos.difference(center).normalize();
  var ppnt = vertex.peripheryAtDirection(direction);
  var connection = 'sticky,'+(ppnt.side)+','+pj.nDigits(ppnt.sideFraction,4);
  var connectionName = 'end'+whichEnd+'connection';
  edge[connectionName]  = connection;
  edge['end'+whichEnd].copyto(ppnt.intersection);
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

item.buildFromData = function (data) {
  data.vertices.forEach((vertexData) => {
    let vertex = this.addVertex(null,vertexData.id);
    let position = vertexData.position;
    if (position) {
      vertex.__moveto(geom.toPoint(position));
    }
  });
  data.edges.forEach((edgeData) => {
    let edge = this.addEdge();
    this.connect(edge,0,edgeData.end0);
    this.connect(edge,1,edgeData.end1);
    var label = edgeData.label;
    if (label) {
      edge.label = label;
    }
  });

  this.update();
}

item.update = function () {
  debugger;
  var edges = this.edges;
  var vertices = this.vertices;
  var thisHere = this;
  pj.forEachTreeProperty(vertices,function (vertex) {
    vertex.__update();
    vertex.update();
  });
  pj.forEachTreeProperty(edges,function (edge) {
     thisHere.updateEnds(edge);
     debugger;
     edge.update();
     //edge.__draw();
  });
  var multiIns= this.multiIns;
  pj.forEachTreeProperty(multiIns,function (edge) {
     thisHere.updateMultiInEnds(edge);
     edge.update();
  });
  this.__draw();
}

item.deleteVertex = function (vertex) {
  //vertex.__unselect();
  var nm = vertex.__name;
  pj.forEachTreeProperty(this.edges,function (edge) {
    if ((edge.end0vertex === nm) || (edge.end1vertex === nm)) {
      edge.remove();
    }
  });
  ui.standardDelete(vertex);
}

item.vertexActions = () =>  [{title:'connect',action:'connectAction'}];

item.multiInActions = () =>    [{title:'connect',action:'connectMultiIn'}];

/*
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
*/
/*
item.vertexP.__dragStep = function (pos) {
  this.__moveto(pos);
 var graph = this.__parent.__parent;
 graph.update();
}

var connectEnd0 = function () {
  alert('aa');
}
item.edgeP.__actions = [{title:'connect',action:connectEnd0}];
*/
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
