pj.require('/shape/circle.js','/shape/arrow.js',function (vertexPP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
debugger;
/*var edgeP = ui.findPrototypeWithUrl('/shape/arrow.js');
if (!edgeP) {
  edgeP = edgePP.instantiate();
  ui.installPrototype('arrow',edgeP);
}
ui.currentConnector = edgeP;
edgeP.headGap = 0;
edgeP.tailGap = 0;
edgeP.includeEndControls = false;

edgeP.__draggable = false;
*/
item.set('vertexP',vertexPP.instantiate().__hide());
item.vSpacing = 50;
item.hSpacing = 50;
item.set('vertices',svg.Element.mk('<g/>'));
item.set('edges',svg.Element.mk('<g/>'));
item.set('multiIns',svg.Element.mk('<g/>'));
item.lastVertexIndex = 0;
item.lastEdgeIndex = 0;
item.lastMultiInIndex = 0;

item.vertexP.set('__nonRevertable',pj.lift({incomingEdge:1}));
//edgeP.set('__nonRevertable',pj.lift({fromVertex:1,toVertex:1}));

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
  var edgeP = iedgeP?iedgeP:ui.currentConnector;
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
  if (0 && edge.__connectToEW) {
    var direction = whichEnd?geom.Point.mk(-1,0):geom.Point.mk(1,0);
    this.mapDirectionToPeriphery(edge,whichEnd,direction);
  } else {
    edge['end'+whichEnd+'connection'] = connectionType?connectionType:'periphery';
  }
  //edge.includeEndControls = false;

}

item.connected = function (v0,v1) {
  debugger;
  var v0name = v0.__name;
  var v1name = v1.__name;
  var edges = this.edges;
  var rs = false;
  pj.forEachTreeProperty(edges,function (edge) {
    if ((edge.end0vertex === v0name) && (edge.end1vertex === v1name)) {
      rs =  true;
    }
  });
  return rs;
}



item.connectAction = function (diagram,vertex) {
  var connectToVertex = vertex;
  var onSelectFirst = function (itm) {
    debugger;
    if (itm.__role === 'vertex') {
      connectToVertex = pj.selectedNode;
      pj.selectCallbacks.pop();
      ui.setActionPanelForSelect('<p style="text-align:center">Select other<br/> end of connection</p>',onSelectSecond);
    } else {
      ui.unselect();
    }
  }
  var onSelectSecond   = function (itm) {
    debugger;
    console.log('ZZZZZ'+itm.__name);
    if (!diagram.connected(connectToVertex,itm)) {
      var newEdge = diagram.addEdge();
      //delete this.connectToVertex ;
      //diagram.connect(newEdge,0,connectToVertex,'periphery');
      //diagram.connect(newEdge,1,itm,'periphery');
      let type0 = (newEdge.__connectEnd0EW)?'EastWest':'periphery';
      let type1 = (newEdge.__connectEnd1EW)?'EastWest':'periphery';
      diagram.connect(newEdge,0,connectToVertex,type0);
      diagram.connect(newEdge,1,itm,type1);
      diagram.update();
      diagram.__draw();
    }
    ui.unselect();
    pj.selectCallbacks.pop();
    ui.setActionPanelForSelect('<p style="text-align:center">Select another pair of vertices to connect</p>',onSelectFirst);

   // ui.resumeActionPanelAfterSelect(vertex);
  }
  ui.disableTopbarButtons();
  ui.setActionPanelForSelect('<p style="text-align:center">Select other<br/> end of connection</p>',onSelectSecond);
}


// connectionType has the form 'sticky,edge,edgeFractionAlong' or 'periphery'
/*

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
      debugger;

  if (connectionType === 'periphery') {
    ppnt = vertex.peripheryAtDirection(direction);
    end.copyto(ppnt.intersection.difference(tr));
  } else if (connectionType === 'EastWest') {
    
    let dirPositive = (direction.x > 0);
    let cdir;
    if (whichEnd === 0) {
      cdir = geom.Point.mk(dirPositive?1:-1,0);
    } else {
      cdir = geom.Point.mk(dirPositive?-1:1,0);
    }
    ppnt = vertex.peripheryAtDirection(cdir);
    end.copyto(ppnt.intersection.difference(tr));

  } else {
    let split = connectionType.split(',');
    let side = Number(split[1]);
    let fractionAlong = Number(split[2]);
    pnt = vertex.alongPeriphery(side,fractionAlong);
    end.copyto(pnt);
  }
  
}
*/

item.updateMultiInEnds = function (edge) {
  var outConnection = edge.outConnection;
  let vertexName = edge.outVertex;
  let vertex;
  if (vertexName) {
    vertex = this.vertices[vertexName];
    edge.updateConnectedEnd('out',vertex,outConnection);
  }
 // this.updateEnd(edge,'out',geom.Point.mk(-1,0),outConnection);
  var inConnections = edge.inConnections;  
  let inVertexNames = edge.inVertices;
  if (inVertexNames) {
    var ln = inConnections.length;
    for (var i=0;i<ln;i++) {
      vertexName = inVertexNames[i];
      vertex = this.vertices[vertexName];
      edge.updateConnectedEnd(i,vertex,inConnections[i]);
    }
  }
}

item.updateEnds = function (edge) {
  var end0connection = edge.end0connection;
  var end1connection = edge.end1connection;
  if (!end0connection && !end1connection) {
    return;
  }
  var vertex0 = this.vertices[edge.end0vertex];
  var vertex1 = this.vertices[edge.end1vertex];
  edge.updateConnectedEnds(vertex0,vertex1,end0connection,end1connection);
}


item.mapDirectionToPeriphery = function(edge,whichEnd,direction) {
  var vertexName = edge['end'+whichEnd+'vertex'];
  var vertex = this.vertices[vertexName];
  var center = vertex.__getTranslation();
  var ppnt = vertex.peripheryAtDirection(direction);
  var connection = 'sticky,'+(ppnt.side)+','+pj.nDigits(ppnt.sideFraction,4);
  var connectionName = 'end'+whichEnd+'connection';
  edge[connectionName]  = connection;
  edge['end'+whichEnd].copyto(ppnt.intersection);
}

item.mapEndToPeriphery = function(edge,whichEnd,pos) {
  var vertexName = edge['end'+whichEnd+'vertex'];
  var vertex = this.vertices[vertexName];
  var center = vertex.__getTranslation();
  var direction = pos.difference(center).normalize();
  this.mapDirectionToPeriphery(edge,whichEnd,direction);
  //var ppnt = vertex.peripheryAtDirection(direction);
  //var connection = 'sticky,'+(ppnt.side)+','+pj.nDigits(ppnt.sideFraction,4);
  //var connectionName = 'end'+whichEnd+'connection';
  //edge[connectionName]  = connection;
  //edge['end'+whichEnd].copyto(ppnt.intersection);
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
