//pj.require('/shape/circle.js','/shape/arrow.js',function (vertexPP) {
pj.require(function () {
const ui=pj.ui,geom=pj.geom,svg=pj.svg;
let item = pj.svg.Element.mk('<g/>');

//item.set('vertexP',vertexPP.instantiate().__hide());
item.vSpacing = 50;
item.hSpacing = 50;
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


//item.getVertexPP = () => vertexPP;

item.addVertex = function (ivertexP,name) {
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

item.addMultiOut = function (multiOutP) {
  let newMultiOut =multiOutP.instantiate();
  let nm = 'E'+this.lastMultiOutIndex++;
  this.multiOuts.set(nm,newMultiOut);
  newMultiOut.__show();
  newMultiOut.update();
  return newMultiOut;
}


item.connectMultiIn = function (diagram,edge) {
  //let multiIn = pj.selectedNode;
  let inEnds = edge.inEnds;  
  let inEnd0 = inEnds[0];
  let toRight = inEnd0.x < edge.end1.x;
  let tr = edge.__getTranslation();
  let outEnd =tr.plus(edge.end1);
  let nearest = ui.findNearestVertex(outEnd,toRight?'right':'left');
  if (nearest) {
    edge.outVertex = nearest.__name;
    edge.outConnection = 'periphery';
    edge.nowConnected = true;
  }
  let inVertices = edge.set('inVertices',pj.Array.mk());
  let inConnections = edge.set('inConnections',pj.Array.mk());
  inEnds.forEach(function (inEnd) {
      let nearest = ui.findNearestVertex(tr.plus(inEnd),toRight?'left':'right');
      if (nearest) {
        inVertices.push(nearest.__name);
        inConnections.push('periphery');
        edge.nowConnected = true;
      }
  });
  edge.includeEndControls = false;
  diagram.updateMultiInEnds(edge);
  edge.update();
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
  let nearest = ui.findNearestVertex(inEnd,toRight?'left':'right');
  if (nearest) {
    edge.inVertex = nearest.__name;
    edge.inConnection = 'periphery';
    edge.nowConnected = true;
  }
  let outVertices = edge.set('outVertices',pj.Array.mk());
  let outConnections = edge.set('outConnections',pj.Array.mk());
  outEnds.forEach(function (outEnd) {
      let nearest = ui.findNearestVertex(tr.plus(outEnd),toRight?'right':'left');
      if (nearest) {
        outVertices.push(nearest.__name);
        outConnections.push('periphery');
        edge.nowConnected = true;
      }
  });
  edge.includeEndControls = false;
  diagram.updateMultiOutEnds(edge);
  edge.update();
  edge.__draw();
  ui.unselect();
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
  let firstVertexDiagram =  pj.ancestorWithProperty(vertex,'__activeTop');
  let connectToVertex = vertex;
  let secondVertexDiagram;
  let errorMessage = '';
  const onSelectFirst = function (itm) {
    if (itm.__role === 'vertex') {
      connectToVertex = pj.selectedNode;
      firstVertexDiagram =  pj.ancestorWithProperty(connectToVertex,'__activeTop');
      //pj.selectCallbacks.pop();
      ui.setActionPanelForSelect('<p style="text-align:center">Select other<br/> end of connection</p>',onSelectSecond);
    } else {
      ui.unselect();
    }
  }
  const selectOtherEnd= function () {
    ui.disableTopbarButtons();
    ui.setActionPanelForSelect('<p style="text-align:center">'+errorMessage+'Select other<br/> end of connection</p>',onSelectSecond);
    errorMessage = '';
  }
  
  const onSelectSecond   = function (itm) {
    debugger;
    console.log('ZZZZZ'+itm.__name);
    if (connectToVertex === itm) {
      //pj.selectCallbacks.pop();
      selectOtherEnd();
      return;
    }
    if (itm.__role === 'vertex') {
      secondVertexDiagram =  pj.ancestorWithProperty(itm,'__activeTop');
      if (firstVertexDiagram !==  secondVertexDiagram) {
        errorMessage = '<span style="color:red">Nodes are from different diagrams; cannot be connected</span><br/>'
      } else if (diagram.connected(connectToVertex,itm)) {
        errorMessage = '<span style="color:red">Already connected</span><br/>';
      } else {
        let newEdge = firstVertexDiagram.addEdge();
        //delete this.connectToVertex ;
        //diagram.connect(newEdge,0,connectToVertex,'periphery');
        //diagram.connect(newEdge,1,itm,'periphery');
        let type0 = (newEdge.__connectEnd0EW)?'EastWest':'periphery';
        let type1 = (newEdge.__connectEnd1EW)?'EastWest':'periphery';
        firstVertexDiagram.connect(newEdge,0,connectToVertex,type0);
        firstVertexDiagram.connect(newEdge,1,itm,type1);
        firstVertexDiagram.update();
        firstVertexDiagram.__draw();
      }
      ui.unselect();
      //pj.selectCallbacks.pop();
      ui.setActionPanelForSelect('<p style="text-align:center">'+errorMessage+'Select another pair of nodes to connect</p>',onSelectFirst);
      return;
    } else {
      errorMessage = '<span style="color:red">Not a connectable node. </span>';
      ui.setActionPanelForSelect('<p style="text-align:center">'+errorMessage+'Select other<br/> end of connection</p>',onSelectSecond);
    }
    errorMessage = '';
  }
  selectOtherEnd();
  //ui.disableTopbarButtons();
  //ui.setActionPanelForSelect('<p style="text-align:center">'+errorMessage+'Select other<br/> end of connection</p>',onSelectSecond);
  //errorMessage = '';
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


item.updateMultiOutEnds = function (edge) {
  let inConnection = edge.inConnection;
  let vertexName = edge.inVertex;
  let vertex;
  if (vertexName) {
    vertex = this.vertices[vertexName];
    edge.updateConnectedEnd('in',vertex,inConnection);
  }
 // this.updateEnd(edge,'out',geom.Point.mk(-1,0),outConnection);
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
  if (this.vertexP && !this.vertexP.__nonRevertable) {
     this.vertexP.set('__nonRevertable',pj.lift({incomingEdge:1}));
  }
  let edges = this.edges;
  let vertices = this.vertices;
  pj.forEachTreeProperty(vertices,(vertex) => {
    vertex.__update();
    vertex.update();
  });
  pj.forEachTreeProperty(edges,(edge) => {
     this.updateEnds(edge);
     edge.update();
  });
  let multiIns= this.multiIns;
  pj.forEachTreeProperty(multiIns,(edge) => {
     this.updateMultiInEnds(edge);
     edge.update();
  });
  let multiOuts= this.multiOuts;
  pj.forEachTreeProperty(multiOuts,(edge) => {
     this.updateMultiOutEnds(edge);
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

item.multiOutActions = () =>    [{title:'Multi Connect',action:'connectMultiOut'}];


item.dragVertex = function (vertex,pos) { // pos in global coordinates
  let localPos =  geom.toLocalCoords(this,pos); 
  vertex.__moveto(localPos);
  this.update();
}


item.__activeTop = true;

//item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
