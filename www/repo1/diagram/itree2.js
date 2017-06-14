pj.require('/diagram/graph2.js','/shape/circle.js','/shape/arrow.js',function (graphP,circlePP,arrowPP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = graphP.instantiate();

var edgeP = pj.ui.installPrototype('arrow',arrowPP);
item.edgeP = edgeP;

var vertexP = pj.ui.installPrototype('circle',circlePP);
item.vertexP = vertexP;
item.vertexP.__dimension = 15;



var vertexInstanceTransferFunction = function (dest,src) {
  if (src.relPosition__) {
    if (dest.relPosition__) {
      dest.relPosition__.copyto(src.relPosition__);
    } else {
      dest.set('relPosition__',src.relPosition__.copy());
    }
  }
}

item.vertexP.set('__transferredProperties',pj.lift(ui.vertexTransferredProperties . concat(
                                                  ['descendants__','relPosition__','vertexActions','__delete','__dragStep'])));

var descendants = function (vertex) {
  var d = vertex.descendants__;
  if (!d) {
    d = vertex.set('descendants__',pj.Array.mk());
  }
  return d;
}


item.computeDescendants = function () {
  var vertices = this.vertices;
  var edges = this.edges;
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
var i;
for (i=0;i<3;i++) {
  this.addVertex(this.vertexP);
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
this.positionRelative();
this.positionvertices();

}



item.vertexP.__delete = function () {
  var thisHere = this;
  ui.confirm('Are you sure you wish to delete this subtree?',function () {
    var diagram = thisHere.__parent.__parent;
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


item.vertexP.__dragStep = function (pos) {
 debugger;
 var localPos = geom.toLocalCoords(this,pos);
 this.__moveto(localPos);
 var tree = this.__parent.__parent;
  tree.positionvertices(this);
  tree.update();
}

item.vertexP.__dragStart = function () {
 var tree = this.__parent.__parent;
 tree.computeRelativePositions(this);
}
 

item.addDescendant = function (diagram,vertex) {
  debugger;
  var edges = diagram.edges;
  var newEdge = diagram.addEdge();
  var newVertex=  diagram.addVertex(diagram.vertexP);
  var vertexPos = vertex.__getTranslation();
  var newPos = vertexPos.plus(geom.Point.mk(0,diagram.vSpacing));
  newVertex.__moveto(newPos);
  diagram.connect(newEdge,0,vertex);
  diagram.connect(newEdge,1,newVertex);
  descendants(vertex).push(newEdge.end1vertex);
  newVertex.parentVertex = vertex.__name;
  newVertex.incomingEdge = newEdge.__name;
  diagram.positionRelative(vertex);
  diagram.positionvertices(vertex);
  debugger;
  diagram.update();
  vertex.__select('svg');
}

item.positionRelative = function (root) {
  debugger;
  var vertices = this.vertices;
  var edges = this.edges
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
       debugger;
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
  debugger;
  
}


item.computeRelativePositions = function (root) {
  //debugger;
  var vertices = this.vertices;
  var edges = this.edges;
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
  var vertices = this.vertices;
  var edges = this.edges;
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
  debugger;
  diagram.positionRelative(root);
  diagram.positionvertices(root);
  diagram.update();
}
item.deleteSubtree = function (vertex,topCall) {
  var children = vertex.descendants__;
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
    var descendants = parent.descendants__;
    var idx = descendants.indexOf(nm);
    descendants.splice(idx,1);
  } 
  vertex.remove();
}

item.vertexActions = () => [{title:'add child',action:'addDescendant'},{title:'connect',action:'connectAction'},
                            {title:'Reposition Subtree',action:'reposition'}];

item.__activeTop = true;

//item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
