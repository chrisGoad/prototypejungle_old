'use strict';
pj.require(function () {
const ui=pj.ui,geom=pj.geom,svg=pj.svg;
let item = pj.svg.Element.mk('<g/>');

item.set('vertices',svg.Element.mk('<g/>'));
item.set('edges',svg.Element.mk('<g/>'));
item.set('multiIns',svg.Element.mk('<g/>'));
item.set('multiOuts',svg.Element.mk('<g/>'));
item.__unselectable = true;
item.vertices.__unselectable = true;
item.edges.__unselectable = true;
item.multiIns.__unselectable = true;
item.multiOuts.__unselectable = true;
item.lastVertexIndex = 0;
item.lastEdgeIndex = 0;
item.lastMultiInIndex = 0;
item.lastMultiOutIndex = 0;

// Section: basic operations for graph construction

item.addVertex = function (ivertexP,name) {
  let vertexP = ivertexP?ivertexP:this.vertexP;
  let nm = name?name:'V'+this.lastVertexIndex++;
  let newVertex = vertexP.instantiate();
  newVertex.__role = 'vertex';
  this.vertices.set(nm,newVertex);
  newVertex.__show();
   newVertex.__update();
   newVertex.__draggableInDiagram = true;
  return newVertex;
}


item.addEdge = function (iedgeP) {
  let edgeP = iedgeP?iedgeP:(this.edgeP?this.edgeP:pj.root.prototypes.arrow);
  let newEdge =edgeP.instantiate();
  newEdge.includeEndControls = true;
  newEdge.__role = 'edge';
  let nm = 'E'+this.lastEdgeIndex++;
  this.edges.set(nm,newEdge);
  newEdge.__show();
  newEdge.__update();
  return newEdge;
}



item.addMultiIn = function (multiInP) {
  let newMultiIn =multiInP.instantiate();
  let nm = 'E'+this.lastMultiInIndex++;
  this.multiIns.set(nm,newMultiIn);
  newMultiIn.__show();
  newMultiIn.__update();
  return newMultiIn;
}

item.addMultiOut = function (multiOutP) {
  let newMultiOut =multiOutP.instantiate();
  let nm = 'E'+this.lastMultiOutIndex++;
  this.multiOuts.set(nm,newMultiOut);
  newMultiOut.__show();
  newMultiOut.__update();
  return newMultiOut;
}
// end Section:basic operations for graph construction

// Section: connection support



item.connect = function (iedge,whichEnd,ivertex,connectionType) {
  let edge = (typeof iedge === 'string')?this.edges[iedge]:iedge;
  let vertex = (typeof ivertex === 'string')?this.vertices[ivertex]:ivertex;
  edge['end'+whichEnd+'vertex'] = vertex.__name;
  edge['end'+whichEnd+'connection'] = connectionType?connectionType:'periphery';
}


item.connected = function (v0,v1) {
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

item.updateMultiInEnds = function (edge) {
  let outConnection = edge.outConnection;
  let vertexName = edge.outVertex;
  let vertex;
  if (vertexName) {
    vertex = this.vertices[vertexName];
    edge.updateConnectedEnd('out',vertex,outConnection);
  }
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


item.updateMultiOutEnds = function (edge) {
  let inConnection = edge.inConnection;
  let vertexName = edge.inVertex;
  let vertex;
  if (vertexName) {
    vertex = this.vertices[vertexName];
    edge.updateConnectedEnd('in',vertex,inConnection);
  }
  let outConnections = edge.outConnections;  
  let outVertexNames = edge.outVertices;
  if (outVertexNames) {
    let ln = outConnections.length;
    for (let i=0;i<ln;i++) {
      vertexName = outVertexNames[i];
      vertex = this.vertices[vertexName];
      edge.updateConnectedEnd(i,vertex,outConnections[i]);
    }
  }
}

// end section: connection support

// section: update and buildFromData

item.update = function () {
  if (this.vertexP && !this.vertexP.__nonRevertable) {
     this.vertexP.set('__nonRevertable',pj.lift({incomingEdge:1}));
  }
  let edges = this.edges;
  let vertices = this.vertices;
  pj.forEachTreeProperty(vertices,(vertex) => {
    vertex.__update();
    //vertex.update();
  });
  pj.forEachTreeProperty(edges,(edge) => {
     this.updateEnds(edge);
     edge.__update();
  });
  let multiIns= this.multiIns;
  pj.forEachTreeProperty(multiIns,(edge) => {
     this.updateMultiInEnds(edge);
     edge.__update();
  });
  let multiOuts= this.multiOuts;
  pj.forEachTreeProperty(multiOuts,(edge) => {
     this.updateMultiOutEnds(edge);
     edge.__update();
  });
  this.__draw();
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

  this.__update();
}
// end section: update and buildFromData

// section: auto-connection for multiIns and multiOuts
// This involves automatically finding vertices near to the ins and outs. 

// direction is up,down,left,right . This computes where a ray running in the given direction from way out first intersects the bounds of the item,
// only one number need be return (for up and down, the y coordinate, for left and right, the x)

const boundsHit = function (item,pos,direction) {
  let bnds = item.__bounds(pj.root);
  let px = pos.x;
  let py = pos.y;
  let corner = bnds.corner;
  let extent = bnds.extent;
  let minx = corner.x;
  let maxx = corner.x + extent.x;
  let miny = corner.y;
  let maxy = corner.y + extent.y;
  if ((direction === 'right') || (direction === 'left')) {
    if ((py > maxy) || (py < miny)) {
       return undefined;
    }
    if (direction === 'right') {
      if (px < maxx) {
        return minx
      } else {
        return undefined;
      }
    } else { // direction == 'left'
      if (px > minx) {
        return maxx
      } else {
        return undefined;
      }
    }
  } else { // diretion === 'up' or 'down'
    if ((px > maxx) || (px < minx)) {
       return undefined;
    }
    if (direction === 'down') { // recall, down is increasing y
      if (py < maxy) {
        return miny;
      } else {
        return undefined;
      }
    } else { // direction == 'down'
      if (py > miny) {
        return maxy;
      } else {
        return undefined;
      }
    }
  }
}

item.findNearestVertex = function (pos,direction) {
  let vertices = this.vertices;
  if (!vertices) {
    return;
  }
  let increasing = (direction === 'right') || (direction === 'down');
  let bestHit;
  let nearestSoFar;
  pj.forEachTreeProperty(vertices,function (vertex) {
    let hit = boundsHit(vertex,pos,direction);
    if (hit) {
      if (increasing) {
        if ((bestHit === undefined) || (hit < bestHit)) {
          bestHit = hit;
          nearestSoFar = vertex;
        }
      } else {
         if ((bestHit === undefined) || (hit > bestHit)) {
          bestHit = hit;
          nearestSoFar = vertex;
        }
      }
    }
  });
  return nearestSoFar;
}



item.connectMultiIn = function (diagram,edge) {
  debugger;
  let inEnds = edge.inEnds;  
  let inEnd0 = inEnds[0];
  let toRight = inEnd0.x < edge.end1.x;
  let tr = edge.__getTranslation();
  let outEnd =tr.plus(edge.end1);
  let nearest = this.findNearestVertex(outEnd,toRight?'right':'left');
  if (nearest) {
    edge.outVertex = nearest.__name;
    edge.outConnection = 'periphery';
    edge.nowConnected = true;
  }
  let inVertices = edge.set('inVertices',pj.Array.mk());
  let inConnections = edge.set('inConnections',pj.Array.mk());
  let thisHere = this;
  inEnds.forEach(function (inEnd) {
      let nearest = thisHere.findNearestVertex(tr.plus(inEnd),toRight?'left':'right');
      if (nearest) {
        inVertices.push(nearest.__name);
        inConnections.push('periphery');
        edge.nowConnected = true;
      }
  });
  edge.includeEndControls = false;
  diagram.updateMultiInEnds(edge);
  edge.__update();
  edge.__draw();
  ui.unselect();
}

item.connectMultiOut = function (diagram,edge) {
  //let multiIn = pj.selectedNode;
  let outEnds = edge.outEnds;  
  let outEnd0 = outEnds[0];
  let toRight = edge.end0.x < outEnd0.x;
  let tr = edge.__getTranslation();
  let inEnd =tr.plus(edge.end0);
  let nearest = this.findNearestVertex(inEnd,toRight?'left':'right');
  if (nearest) {
    edge.inVertex = nearest.__name;
    edge.inConnection = 'periphery';
    edge.nowConnected = true;
  }
  let outVertices = edge.set('outVertices',pj.Array.mk());
  let outConnections = edge.set('outConnections',pj.Array.mk());
  let thisHere = this;
  outEnds.forEach(function (outEnd) {
      let nearest = thisHere.findNearestVertex(tr.plus(outEnd),toRight?'right':'left');
      if (nearest) {
        outVertices.push(nearest.__name);
        outConnections.push('periphery');
        edge.nowConnected = true;
      }
  });
  edge.includeEndControls = false;
  diagram.updateMultiOutEnds(edge);
  edge.__update();
  edge.__draw();
  ui.unselect();
}

// end section: auto-connection for multiIns and multiOuts
// section: definition of the action panel, and deletion and dragging, for this diagram type

item.__diagram = true;

item.__actions = (item) => {
  debugger;
  let  role = item.__role;
  switch (role) {
    case 'vertex':
      return [{title:'Connect',action:'connectAction'}];
    case 'multiIn':
      return [{title:'Multi Connect',action:'connectMultiIn'}];
   case 'multiOut':
      return [{title:'Multi Connect',action:'connectMultiOut'}];
  }
}


const graphSource = '/diagram/graph.js';

item.connectAction = function (diagram,vertex) {
  let connectToVertex = vertex;
  let firstVertexDiagram   = pj.ancestorWithSourceUrl(connectToVertex,graphSource);
  let secondVertexDiagram;
  let errorMessage = '';
  const cancelConnect = function () {
    ui.resumeActionPanelAfterSelect();

  }
  const selectOtherEnd= function () {
    debugger;
    ui.disableTopbarButtons();
    ui.setActionPanelForSelect('<p style="text-align:center">'+errorMessage+'Select other<br/> end of connection</p>',onSelectSecond,
                               'Cancel Connect',cancelConnect);
    errorMessage = '';
  }
  
  const onSelectSecond   = function (itm) {
    errorMessage  = '';
    if (connectToVertex === itm) {
      selectOtherEnd();
      return;
    }
    if (itm.__role === 'vertex') {
      secondVertexDiagram =  pj.ancestorWithSourceUrl(itm,graphSource);
     if (firstVertexDiagram !==  secondVertexDiagram) {
        errorMessage = '<span style="color:red">Nodes are from different diagrams; cannot be connected</span><br/>';
      } else if (diagram.connected(connectToVertex,itm)) {
        errorMessage = '<span style="color:red">Already connected</span><br/>';
      } else {
        let newEdge = firstVertexDiagram.addEdge();
        let type0 = (newEdge.__connectEnd0EW)?'EastWest':'periphery';
        let type1 = (newEdge.__connectEnd1EW)?'EastWest':'periphery';
        firstVertexDiagram.connect(newEdge,0,connectToVertex,type0);
        firstVertexDiagram.connect(newEdge,1,itm,type1);
        firstVertexDiagram.__update();
        firstVertexDiagram.__draw();
       ui.resumeActionPanelAfterSelect();
       debugger;
        ui.setActionPanelContents(itm);
        return;
      }
    } else {
      errorMessage = '<span style="color:red">Not a connectable node. </span>';
    }
    selectOtherEnd();'';
  }
  selectOtherEnd();
}



item.__delete = function (node) {
  debugger;
  if (node.__role === 'vertex') {
    let nm = node.__name;
    pj.forEachTreeProperty(this.edges,function (edge) {
      if ((edge.end0vertex === nm) || (edge.end1vertex === nm)) {
        edge.remove();
      }
     });
  }
  ui.standardDelete(node);
}


item.__dragStep = function (vertex,pos) { // pos in global coordinates
  let localPos =  geom.toLocalCoords(this,pos); 
  vertex.__moveto(localPos);
  this.update();
}
// end section: definition of the action panel, and deletion and dragging, for this diagram type

// section: setting up roles, and proper transfer of properties


item.set('__diagramTransferredProperties', pj.lift(['__draggableInDiagram','end0vertex','end1vertex','end0connection','end1connection']));
item.__diagramTransferredProperties.__const = true;


item.setupAsVertex= function (v) {
  v.__role = 'vertex';
  v.__transferExtent = true;
  ui.hide(v,['incomingEdge']);
  return v;
}

item.installAsVertexPrototype = function(itemPP) {
  return this.vertexP = this.setupAsVertex(ui.installPrototype('vertex',itemPP));
}

const edgeInstanceTransferFunction = function (dest,src) {
  if (dest.setEnds) {
    dest.setEnds(src.end0,src.end1);
  }
}


const uiHideEdgeProperties = function (item) {
  ui.hide(item,['end0connection','end1connection','end0vertex','end1vertex']);
}

item.setupAsEdge = function (e) {
  e.__role = 'edge';
  e.__instanceTransferFunction = edgeInstanceTransferFunction;
  uiHideEdgeProperties(e);
  return e;
}


item.installAsEdgePrototype = function(itemPP) {
  return this.edgeP = this.setupAsEdge(ui.installPrototype('edge',itemPP));
}


const multiInInstanceTransferFunction = function (dest,src) {
  // @todo implement this. Not needed until there is more than one kind of multiIn
}


const multiOutInstanceTransferFunction = function (dest,src) {
  // @todo implement this. Not needed until there is more than one kind of multiIn
}

item.setupAsMultiIn = function (mi) {
  mi.__role = 'multiIn';
  mi.__instanceTransferFunction = multiInInstanceTransferFunction;
}


item.setupAsMultiOut= function (mo) {
  mo.__role = 'multiOut';
  mo.__instanceTransferFunction = ui.multiOutInstanceTransferFunction;
}


// end section: setting up roles, and proper transfer of properties

// begin section: support for arrows being directed to the peripheries of vertices
// these functions are called by the implementations of the edge types (eg arrow)

// an edge has properties endN endNVertex, endNSide endNsideFraction  for N = 0,1. The periphery of a vertex has a series
// of sides (which are currently regarded as straight, but might be arcs in future). The sides are numbered from the top in
// clockwise order. endOSide = 3 and endNsideFraction = 0.2 means 20% of the way along the 3rd side.
// later: multiedges



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
}


item.connectVertices = function (v0,v1) {
  let edge = this.addEdge();
  this.connect(edge,0,v0);
  this.connect(edge,1,v1);
}

// end section: support for arrows being directed to the peripheries of vertices

return item;
});
