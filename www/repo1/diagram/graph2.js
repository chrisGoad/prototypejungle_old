pj.require('/shape/circle.js','/shape/arrow.js',function (vertexPP) {
const ui=pj.ui,geom=pj.geom,svg=pj.svg;
let item = pj.svg.Element.mk('<g/>');
debugger;

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

item.getVertexPP = () => vertexPP;

item.addVertex = function (ivertexP,name) {
  debugger;
  let vertexP = ivertexP?ivertexP:this.vertexP;
  let nm = name?name:'V'+this.lastVertexIndex++;
  let newVertex = vertexP.instantiate();
  this.vertices.set(nm,newVertex);
  newVertex.__show();
   newVertex.update();
  return newVertex;
}


item.replaceVertex = function (replaced,replacementP) {
  let replacement = replacementP.instantiate().__show();
  let nm = replaced.__name;
  let pos = replaced.__getTranslation();
  replaced.remove();
  this.vertices.set(nm,replacement);
  replacement.update();
  replacement.__moveto(pos);
  return replacement;
}

item.addEdge = function (iedgeP) {
  debugger;
  let edgeP = iedgeP?iedgeP:(this.edgeP?this.edgeP:ui.currentConnector);
  let newEdge =edgeP.instantiate();
  newEdge.includeEndControls = true;
  let nm = 'E'+this.lastEdgeIndex++;
  this.edges.set(nm,newEdge);
  newEdge.__show();
  newEdge.update();
  return newEdge;
}


item.addMultiIn = function (multiInP) {
  let newMultiIn =multiInP.instantiate();
  let nm = 'E'+this.lastMultiInIndex++;
  this.multiIns.set(nm,newMultiIn);
  newMultiIn.__show();
  newMultiIn.update();
  return newMultiIn;
}

item.connectMultiIn = function (diagram,edge) {
  debugger;
  //let multiIn = pj.selectedNode;
  let tr = edge.__getTranslation();
  let outEnd =tr.plus(edge.end1);
  let nearest = ui.findNearestVertex(outEnd,'right');
  if (nearest) {
    edge.outVertex = nearest.__name;
    edge.outConnection = 'periphery';
  }
  let inVertices = edge.set('inVertices',pj.Array.mk());
  let inConnections = edge.set('inConnections',pj.Array.mk());
  let inEnds = edge.inEnds;  
  inEnds.forEach(function (inEnd) {
      let nearest = ui.findNearestVertex(tr.plus(inEnd),'left');
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
  let edge = (typeof iedge === 'string')?this.edges[iedge]:iedge;
  let vertex = (typeof ivertex === 'string')?this.vertices[ivertex]:ivertex;
  edge['end'+whichEnd+'vertex'] = vertex.__name;
  edge['end'+whichEnd+'connection'] = connectionType?connectionType:'periphery';
}


item.connected = function (v0,v1) {
  debugger;
  let v0name = v0.__name;
  let v1name = v1.__name;
  let edges = this.edges;
  let rs = false;
  pj.forEachTreeProperty(edges,function (edge) {
    if ((edge.end0vertex === v0name) && (edge.end1vertex === v1name)) {
      rs =  true;
    }
  });
  return rs;
}



item.connectAction = function (diagram,vertex) {
  let connectToVertex = vertex;
  const onSelectFirst = function (itm) {
    debugger;
    if (itm.__role === 'vertex') {
      connectToVertex = pj.selectedNode;
      pj.selectCallbacks.pop();
      ui.setActionPanelForSelect('<p style="text-align:center">Select other<br/> end of connection</p>',onSelectSecond);
    } else {
      ui.unselect();
    }
  }
  const onSelectSecond   = function (itm) {
    debugger;
    console.log('ZZZZZ'+itm.__name);
    if (!diagram.connected(connectToVertex,itm)) {
      let newEdge = diagram.addEdge();
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
  }
  ui.disableTopbarButtons();
  ui.setActionPanelForSelect('<p style="text-align:center">Select other<br/> end of connection</p>',onSelectSecond);
}


// connectionType has the form 'sticky,edge,edgeFractionAlong' or 'periphery'


item.updateMultiInEnds = function (edge) {
  let outConnection = edge.outConnection;
  let vertexName = edge.outVertex;
  let vertex;
  if (vertexName) {
    vertex = this.vertices[vertexName];
    edge.updateConnectedEnd('out',vertex,outConnection);
  }
 // this.updateEnd(edge,'out',geom.Point.mk(-1,0),outConnection);
  let inConnections = edge.inConnections;  
  let inVertexNames = edge.inVertices;
  if (inVertexNames) {
    let ln = inConnections.length;
    for (let i=0;i<ln;i++) {
      vertexName = inVertexNames[i];
      vertex = this.vertices[vertexName];
      edge.updateConnectedEnd(i,vertex,inConnections[i]);
    }
  }
}

item.updateEnds = function (edge) {
  let end0connection = edge.end0connection;
  let end1connection = edge.end1connection;
  if (!end0connection && !end1connection) {
    return;
  }
  let vertex0 = this.vertices[edge.end0vertex];
  let vertex1 = this.vertices[edge.end1vertex];
  edge.updateConnectedEnds(vertex0,vertex1,end0connection,end1connection);
}


item.mapDirectionToPeriphery = function(edge,whichEnd,direction) {
  let vertexName = edge['end'+whichEnd+'vertex'];
  let vertex = this.vertices[vertexName];
  let center = vertex.__getTranslation();
  let ppnt = vertex.peripheryAtDirection(direction);
  let connection = 'sticky,'+(ppnt.side)+','+pj.nDigits(ppnt.sideFraction,4);
  let connectionName = 'end'+whichEnd+'connection';
  edge[connectionName]  = connection;
  edge['end'+whichEnd].copyto(ppnt.intersection);
}

item.mapEndToPeriphery = function(edge,whichEnd,pos) {
  let vertexName = edge['end'+whichEnd+'vertex'];
  let vertex = this.vertices[vertexName];
  let center = vertex.__getTranslation();
  let direction = pos.difference(center).normalize();
  this.mapDirectionToPeriphery(edge,whichEnd,direction);
  //var ppnt = vertex.peripheryAtDirection(direction);
  //var connection = 'sticky,'+(ppnt.side)+','+pj.nDigits(ppnt.sideFraction,4);
  //var connectionName = 'end'+whichEnd+'connection';
  //edge[connectionName]  = connection;
  //edge['end'+whichEnd].copyto(ppnt.intersection);
}




item.buildSimpleGraph = function () {
let i;
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
    let label = edgeData.label;
    if (label) {
      edge.label = label;
    }
  });

  this.update();
}

item.update = function () {
  debugger;
  let edges = this.edges;
  let vertices = this.vertices;
  pj.forEachTreeProperty(vertices,(vertex) => {
    vertex.__update();
    vertex.update();
  });
  pj.forEachTreeProperty(edges,(edge) => {
     this.updateEnds(edge);
     debugger;
     edge.update();
  });
  let multiIns= this.multiIns;
  pj.forEachTreeProperty(multiIns,(edge) => {
     this.updateMultiInEnds(edge);
     edge.update();
  });
  this.__draw();
}

item.deleteVertex = function (vertex) {
  let nm = vertex.__name;
  pj.forEachTreeProperty(this.edges,function (edge) {
    if ((edge.end0vertex === nm) || (edge.end1vertex === nm)) {
      edge.remove();
    }
  });
  ui.standardDelete(vertex);
}

item.vertexActions = () =>  [{title:'Connect',action:'connectAction'}];

item.multiInActions = () =>    [{title:'Multi Connect',action:'connectMultiIn'}];


item.dragVertex = function (vertex,pos) {
  vertex.__moveto(pos);
  this.update();
}


item.__activeTop = true;

//item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
