pj.require('/diagram/graph2.js','/shape/circle.js','/shape/arrow.js',function (graphP,circlePP,arrowPP) {
  debugger;
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
//ar item = graphP.instantiate();
let item = pj.svg.Element.mk('<g/>');

item.hSpacing = 50;
item.vSpacing = 50;
item.set('graph',graphP.instantiate());

var edgeP = pj.ui.installPrototype('arrow',arrowPP);
item.graph.edgeP = edgeP;

var vertexP = pj.ui.installPrototype('circle',circlePP);
item.graph.vertexP = vertexP;
item.graph.vertexP.__dimension = 15;



var vertexInstanceTransferFunction = function (dest,src) {
  if (src.relPosition__) {
    if (dest.relPosition__) {
      dest.relPosition__.copyto(src.relPosition__);
    } else {
      dest.set('relPosition__',src.relPosition__.copy());
    }
  }
}

item.graph.vertexP.set('__transferredProperties',pj.lift(ui.vertexTransferredProperties . concat(
                                                  ['descendants__','relPosition__','vertexActions','__delete','__dragStep'])));

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


item.graph.vertexP.__dragStep = function (pos) {
 var localPos = geom.toLocalCoords(this,pos);
 this.__moveto(localPos);
 debugger;
 var tree = this.__parent.__parent.__parent;
  tree.positionvertices(this);
  tree.update();
}

item.graph.vertexP.__dragStart = function () {
  debugger;
 var tree = this.__parent.__parent.__parent;
 tree.computeRelativePositions(this);
}
 
// needs to be a method of the graph, since that is the topActive
item.addDescendant = function (diagram,vertex) {
  debugger;
  var graph = diagram.graph;
  var edges = graph.edges;
  var newEdge = graph.addEdge();
  var newVertex=  graph.addVertex(graph.vertexP);
  var vertexPos = vertex.__getTranslation();
  var newPos = vertexPos.plus(geom.Point.mk(0,diagram.vSpacing));
  newVertex.__moveto(newPos);
  graph.connect(newEdge,0,vertex);
  graph.connect(newEdge,1,newVertex);
  descendants(vertex).push(newEdge.end1vertex);
  newVertex.parentVertex = vertex.__name;
  newVertex.incomingEdge = newEdge.__name;
  diagram.positionRelative(vertex);
  diagram.positionvertices(vertex);
  diagram.update();
  vertex.__select('svg');
}

item.positionRelative = function (root) {
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
    var edge = edges[vertex.incomingEdge];
    edge.remove();
    var parent = this.vertices[vertex.parentVertex];
    var descendants = parent.descendants__;
    var idx = descendants.indexOf(nm);
    descendants.splice(idx,1);
  } 
  vertex.remove();
}

item.update = function () {
 
  this.graph.__activeTop = undefined;
  this.graph.update();
}

item.vertexActions = [{title:'add child',action:'addDescendant'},{title:'connect',action:'connectAction'},
                            {title:'Reposition Subtree',action:'reposition'}];

item.__activeTop = true;

//item.graph.__activeTop = false;
//item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
