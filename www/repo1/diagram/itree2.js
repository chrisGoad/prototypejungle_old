pj.require('/diagram/graph2.js','/shape/arrow.js',function (graphP,arrowPP) {
  debugger;
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
//ar item = graphP.instantiate();
let item = pj.svg.Element.mk('<g/>');

item.hSpacing = 50;
item.vSpacing = 50;
item.set('graph',graphP.instantiate());

var edgeP = pj.ui.installPrototype('arrow',arrowPP);
ui.setupAsEdge(edgeP);
item.graph.edgeP = edgeP;
/*
var vertexP = pj.ui.installPrototype('circle',circlePP);
ui.setupAsVertex(vertexP);
item.graph.vertexP = vertexP;
item.graph.vertexP.__dimension = 15;

*/

var vertexInstanceTransferFunction = function (dest,src) {
  if (src.relPosition__) {
    if (dest.relPosition__) {
      dest.relPosition__.copyto(src.relPosition__);
    } else {
      dest.set('relPosition__',src.relPosition__.copy());
    }
  }
}

//item.set('__diagramTransferredProperties', pj.lift(['end0vertex','end1vertex','end0connection','end1connection']));
debugger;
item.set('__diagramTransferredProperties',graphP.__diagramTransferredProperties.concat(pj.lift(
                ['incomingEdge','parentVertex','descendants__','relPosition__','vertexActions','__delete','__dragStep'])));
item.__diagramTransferredProperties.__const = true;


var descendants = function (vertex) {
  var d = vertex.descendants__;
  if (!d) {
    d = vertex.set('descendants__',pj.Array.mk());
  }
  return d;
}


item.computeDescendants = function () {
  var vertices = this.graph.vertices;
  var edges = this.graph.edges;
  //  because of deletions, some vertices may have been set to null. Fix up vertices accordingly
  pj.forEachTreeProperty(vertices,function (vertex) {
    vertex.descendants__ = undefined;
  });
  pj.forEachTreeProperty(edges,function (edge) {
    var toVertexName = edge.end1vertex;
    var fromVertexName = edge.end0vertex;
    var fromVertex = vertices[fromVertexName];
    var toVertex = vertices[toVertexName];
    descendants(fromVertex).push(toVertexName);
    toVertex.parentVertex = fromVertexName;
    toVertex.incomingEdge = edge.__name;
  });
}


item.buildSimpleTree = function () {
  debugger;
  var graph = this.graph;
var i;
for (i=0;i<3;i++) {
  graph.addVertex(this.vertexP);
}
for (i=0;i<2;i++) {
  graph.addEdge();
}

graph.vertices.V1.__moveto(geom.Point.mk(-0.5 * this.hSpacing,this.vSpacing));
graph.vertices.V2.__moveto(geom.Point.mk(0.5 * this.hSpacing,this.vSpacing));

graph.connect('E0',0,'V0');
graph.connect('E0',1,'V1');
graph.connect('E1',0,'V0');
graph.connect('E1',1,'V2');

this.computeDescendants();
this.update();
this.positionRelative();
this.positionvertices();

}



item.buildFromData = function () {
  var root = this.addRoot();
  
}


item.__delete = function (vertex) {
  if (vertex.__role !== 'vertex') {
    ui.alert('Only nodes, not connectors, can be deleted');
    return;
  }
  var thisHere = this;
  var graph = this.graph;
  ui.confirm('Are you sure you wish to delete this subtree?',function () {
    var root = graph.vertices.V0;
    if (root === vertex) {
      thisHere.remove();
      ui.setSaved(false);
      return;
    }
    thisHere.deleteSubtree(vertex,true);
    thisHere.positionRelative();
    thisHere.positionvertices();
    thisHere.update();
    ui.setSaved(false);
    thisHere.__draw();
});
}

/*
item.graph.vertexP.__delete = function () {
  var thisHere = this;
  ui.confirm('Are you sure you wish to delete this subtree?',function () {
    var diagram = thisHere.__parent.__parent._parent;
    var root = diagram.vertices.V0;
    if (root === thisHere) {
      diagram.remove();
      ui.setSaved(false);
      return;
    }
    diagram.deleteSubtree(thisHere,true);
    diagram.positionRelative();
    diagram.positionvertices();
    diagram.update();
    ui.setSaved(false);
    diagram.__draw();
  });
}
*/

item.__dragStep = function (vertex,pos) {
 var localPos = geom.toLocalCoords(this,pos);
 vertex.__moveto(localPos);
 debugger;
 this.positionvertices(vertex);
 this.update();
}
/*
item.graph.vertexP.__dragStep = function (pos) {
 var localPos = geom.toLocalCoords(this,pos);
 this.__moveto(localPos);
 debugger;
 var tree = this.__parent.__parent.__parent;
  tree.positionvertices(this);
  tree.update();
}
*/
item.__dragStart = function () {
  this.computeRelativePositions();
}
/*
item.graph.vertexP.__dragStart = function () {
  debugger;
 var tree = this.__parent.__parent.__parent;
 tree.computeRelativePositions(this);
}*/
 
item.addDescendant = function (diagram,vertex,doUpdate=true) {
  debugger;
  var graph = diagram.graph;
  var edges = graph.edges;
  var vertices = graph.vertices;
  var newEdge = graph.addEdge();
  var vertexP = Object.getPrototypeOf(vertices.V0);// use proto of V0 as the prototype for new nodes
  var newVertex=  graph.addVertex(vertexP);
  if (1 || doUpdate) {
    var vertexPos = vertex.__getTranslation();
    var newPos = vertexPos.plus(geom.Point.mk(0,diagram.vSpacing));
    newVertex.__moveto(newPos);
  }
  graph.connect(newEdge,0,vertex);
  graph.connect(newEdge,1,newVertex);
  descendants(vertex).push(newEdge.end1vertex);
  newVertex.parentVertex = vertex.__name;
  newVertex.incomingEdge = newEdge.__name;
  if (doUpdate) {
    diagram.positionRelative(vertex);
    diagram.positionvertices(vertex);
    diagram.update();
    vertex.__select('svg');
  }
  return newVertex;
}


item.addRoot = function () {
  debugger;
  var graph = this.graph;
  return this.graph.addVertex(this.vertexP);
}


item.buildFromDataR = function (node,data) {
  let d = data.d;
  let thisHere = this;
  if (d) {
    d.forEach(function (childData) {
      let child = thisHere.addDescendant(thisHere,node,false);
      child.__setText(childData.text);
      thisHere.buildFromDataR(child,childData);
    });
  }
}

item.buildFromData = function (data) {
  let root = this.addRoot();
  root.__setText(data.text);
  this.buildFromDataR(root,data);
  this.positionRelative(root);
  this.positionvertices(root);
  this.update();
}


item.positionRelative = function (root) {
  debugger;
  var vertices = this.graph.vertices;
  var edges = this.graph.edges
  var rootVertex = vertices.V0;
  rootVertex.set('relPosition__',geom.Point.mk(0,0));
  var hSpacing = this.hSpacing;
  var vSpacing = this.vSpacing;
  var recurse = function (rootLabel) {
    var vertex = vertices[rootLabel];
    if (vertex.descendants) {
      vertex.set('descendants__',vertex.descendants);
    }
    var children = vertex.descendants__;
    if (!children || (children.length === 0)) {
       vertex.treeWidth = (vertex.__element)?vertex.__bounds().extent.x:0;
       return vertex.treeWidth;
    }
    var totalWidth = 0;
    children.forEach(function (child) {
      var wd = recurse(child);
      totalWidth += wd + hSpacing;
    });
    totalWidth -= hSpacing;
    vertex.treeWidth = totalWidth;
    var xpos = -0.5*totalWidth;
    var ypos = vSpacing;
    children.forEach(function (child) {
      var childVertex = vertices[child];
      var childWidth = childVertex.treeWidth;
      var vxpos = xpos + 0.5 * childWidth;
      childVertex.set('relPosition__',geom.Point.mk(vxpos,ypos));
      xpos += childWidth + hSpacing;
    });
    return totalWidth;
  }
  recurse(root?root.__name:'V0');
  
}


item.computeRelativePositions = function (root) {
  debugger;
  var vertices = this.graph.vertices;
  var edges = this.graph.edges;
  var recurse = function (rootLabel) {
    var vertex = vertices[rootLabel];
    var rootPosition = vertex.__getTranslation();
    var children = vertex.descendants__;
    if (!children || (children.length === 0)) {
      return;
    }
    children.forEach(function (child) {
      recurse(child);
      var childVertex = vertices[child];
      childVertex.set('relPosition__',childVertex.__getTranslation().difference(rootPosition));
    });
  }
  recurse(root?root.__name:'V0');  
}


item.positionvertices = function (root) {
  // now generate absolute  positions
  debugger;
  var vertices = this.graph.vertices;
  var edges = this.graph.edges;
  var recurse  = function (rootLabel,position) {
    console.log('positioning',rootLabel,' at ',position);
    var vertex = vertices[rootLabel];
    if (position) {
      var myPosition = position.plus(vertex.relPosition__);
      vertex.__moveto(myPosition);
    } else {
      myPosition = vertex.__getTranslation()
    }
    var children = vertex.descendants__;
    if  (!children || (children.length === 0)) {
      return;
    }
    children.forEach(function (childIndex) {
      recurse(childIndex,myPosition);
    });
  }
  if (root) {
    recurse(root.__name);
  } else {
    recurse('V0',geom.Point.mk(0,0));
  }
}

item.reposition = function (diagram,root) {
  diagram.positionRelative(root);
  diagram.positionvertices(root);
  diagram.update();
}

item.connectAction = function (diagram,vertex) {
  debugger;
  diagram.graph.connectAction(diagram.graph,vertex);
}
item.deleteSubtree = function (vertex,topCall) {
  debugger;
  var children = vertex.descendants__;
  var vertices = this.graph.vertices;
  var edges = this.graph.edges;
  var nm = vertex.__name;
  var thisHere = this;
  if  (children && (children.length > 0)) {
    children.forEach(function (childIndex) {
      var child = vertices[childIndex];
      var edge = edges[child.incomingEdge];
      edge.remove();
      thisHere.deleteSubtree(child);
    });
  }
  if (topCall) {
    var parent = this.graph.vertices[vertex.parentVertex];
    var descendants = parent.descendants__;
    var idx = descendants.indexOf(nm);
    descendants.splice(idx,1);
    var edge = edges[vertex.incomingEdge];
    edge.remove();
  
  } 
  vertex.remove();
}

item.update = function () {
 
  this.graph.__diagram = undefined;
  this.graph.update();
}

item.__actions = function (item) {
  if (item.__role === 'vertex') {
    return [{title:'add child',action:'addDescendant'},{title:'connect',action:'connectAction'},
                            {title:'Reposition Subtree',action:'reposition'}];
  }
}

item.__diagram = true;

//item.graph.__activeTop = false;
//item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
