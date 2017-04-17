pj.require('/diagram/graph2.js',function (graphP,edgePP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = graphP.instantiate();
item.vertexP.dimension = 15;

var descendants = function (vertex) {
  var d = vertex.descendants;
  if (!d) {
    d = vertex.set('descendants',pj.Array.mk());
  }
  return d;
}


item.computeDescendants = function () {
  debugger;
  var vertices = this.vertices;
  var edges = this.edges;
  //  because of deletions, some vertices may have been set to null. Fix up vertices accordingly
  pj.forEachTreeProperty(edges,function (edge) {
    var toVertexName = edge.end1vertex;
    var fromVertexName = edge.end0vertex;
    var fromVertex = vertices[fromVertexName];
    var toVertex = vertices[toVertexName];
    descendants(fromVertex).push(toVertexName);
    toVertex.parentVertex = fromVertexName;
    toVertex.incomingEdge = edge.__name;
    //toVertex.myIndex = toVertexIndex;
  });
}

item.buildSimpleTree = function () {
  debugger;
var i;
for (i=0;i<3;i++) {
  this.addVertex();
}
for (i=0;i<2;i++) {
  this.addEdge();
}

this.vertices.V1.__moveto(geom.Point.mk(-0.5 * this.hSpacing,this.vSpacing));
this.vertices.V2.__moveto(geom.Point.mk(0.5 * this.hSpacing,this.vSpacing));


this.connect('E0',0,'V0');
this.connect('E0',1,'V1');

this.connect('E1',0,'V0');
this.connect('E1',1,'V2');

this.computeDescendants();
this.update();
}

//item.buildSimpleTree();


item.vertexP.__delete = function () {
  var thisHere = this;
  ui.confirm('Are you sure you wish to delete this subtree?',function () {
    debugger;
    var diagram = thisHere.__parent.__parent;
    var root = diagram.vertices.V0;
    if (root === thisHere) {
      diagram.remove();
      ui.setSaved(false);
      pj.root.__draw();
      return;
    }
    diagram.deleteSubtree(thisHere,true);
    diagram.positionvertices();
    diagram.update();
    ui.setSaved(false);
    diagram.__draw();
  });
}

item.addDescendant = function (diagram,vertex) {
  //var vertex = pj.selectedVertex;
  debugger;
  var edges = diagram.edges;
  var newEdge = diagram.addEdge();
  var newVertex=  diagram.addVertex();
  var vertexPos = vertex.__getTranslation();
  var newPos = vertexPos.plus(geom.Point.mk(0,diagram.vSpacing));
  newVertex.__moveto(newPos);
  debugger;
  diagram.connect(newEdge,0,vertex);
  diagram.connect(newEdge,1,newVertex);
  descendants(vertex).push(newEdge.end1vertex);
  newVertex.parentVertex = vertex.__name;
  newVertex.incomingEdge = newEdge.__name;
  diagram.positionvertices();
  diagram.update();
  debugger;
  vertex.__select('svg');
}

item.positionRelative = function () {
  var vertices = this.vertices;
  var edges = this.edges
  var rootVertex = vertices.V0;
  rootVertex.set('relPosition',geom.Point.mk(0,0));
  var hSpacing = this.hSpacing;
  var vSpacing = this.vSpacing;
  var recurse = function (rootLabel) {
    var vertex = vertices[rootLabel];
    var children = vertex.descendants;
    if (!children || (children.length === 0)) {
       vertex.width = 0;
       return 0;
    }
    var totalWidth = 0;
    children.forEach(function (child) {
      var wd = recurse(child);
      totalWidth += wd + hSpacing;
    });
    totalWidth -= hSpacing;
    vertex.width = totalWidth;
    var xpos = -0.5*totalWidth;
    var ypos = vSpacing;
    children.forEach(function (child) {
      var childVertex = vertices[child];
      var childWidth = childVertex.width;
      var vxpos = xpos + 0.5 * childWidth;
      childVertex.set('relPosition',geom.Point.mk(vxpos,ypos));
      xpos += childWidth + hSpacing;
    });
    return totalWidth;
  }
  recurse('V0');
  
}

item.positionvertices = function () {
  debugger;
  this.positionRelative();
  // now generate absolute  positions
  var vertices = this.vertices;
  var edges = this.edges;
  var recurse  = function (rootLabel,position) {
    var vertex = vertices[rootLabel];
    var myPosition = position.plus(vertex.relPosition);
    debugger;
    vertex.__moveto(myPosition.x);
    var children = vertex.descendants;
    if  (!children || (children.length === 0)) {
      return;
    }
    children.forEach(function (childIndex) {
      recurse(childIndex,myPosition);
    });
  }
  recurse('V0',geom.Point.mk(0,0));
}

item.deleteSubtree = function (vertex,topCall) {
  debugger;
  var children = vertex.descendants;
  var vertices = this.vertices;
  var edges = this.edges;
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
    var descendants = parent.descendants;
    var idx = descendants.indexOf(nm);
    descendants.splice(idx,1);
  } 
  vertex.remove();
}

item.vertexP.__actions = [{title:'add descendant',action:'addDescendant'},{title:'connect',action:'connectAction'}];


item.__activeTop = true;

item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
