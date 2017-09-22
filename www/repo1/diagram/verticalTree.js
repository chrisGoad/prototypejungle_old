'use strict';
pj.require('/diagram/graph.js',function (graphP) {
  debugger;
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
let item = pj.svg.Element.mk('<g/>');

item.hSpacing = 50;
item.vSpacing = 50;
item.set('graph',graphP.instantiate());

/* a tree is a special kind of graph, of course, and is so implemented*/

/* Section: basic mechanics */

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



var descendants = function (vertex) {
  var d = vertex.descendants__;
  if (!d) {
    d = vertex.set('descendants__',pj.Array.mk());
  }
  return d;
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

item.update = function () {
 
  this.graph.__diagram = undefined;
  this.graph.update();
}


/* end section: basic mechanics */
/* Section: deletion */

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
    var parent = this.graph.vertices[vertex.parentVertex];
    var descendants = parent.descendants__;
    var idx = descendants.indexOf(nm);
    descendants.splice(idx,1);
    var edge = edges[vertex.incomingEdge];
    edge.remove();
  
  } 
  vertex.remove();
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

/* end section :deletion  */

/* begin section: constructing trees */

 
item.addDescendant = function (diagram,vertex,doUpdate=true) {
  var graph = diagram.graph;
  var edges = graph.edges;
  var vertices = graph.vertices;
  var edgeP = edges.E0?Object.getPrototypeOf(edges.E0):undefined;// use proto of E0 as the prototype for new nodes
  var newEdge = graph.addEdge(edgeP);
  var vertexP = Object.getPrototypeOf(vertices.V0);// use proto of V0 as the prototype for new nodes
  //ui.hide(vertexP,['descendants']);
  var newVertex=  graph.addVertex(vertexP);
  if (doUpdate) {
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
    svg.main.fitContentsIfNeeded();
  }
  return newVertex;
}


item.addRoot = function () {
  var graph = this.graph;
  ui.hide(graph.vertexP,['descendants__','relPosition__','parentVertex']);

  return this.graph.addVertex();
}


item.buildFromDataR = function (node,data) {
  let d = data.d;
  let thisHere = this;
  if (d) {
    d.forEach(function (childData) {
      let child = thisHere.addDescendant(thisHere,node,false);
      if (childData.text) {
        child.__setText(childData.text);
      }
      thisHere.buildFromDataR(child,childData);
    });
  }
}

item.buildFromData = function (data) {
  let root = this.addRoot();
  if (data.text) {
    root.__setText(data.text);
  }
  this.buildFromDataR(root,data);
  this.positionRelative(root);
  this.positionvertices(root);
  this.update();
}


/* end section: constructing trees */

/* section: drag support */



item.__dragStep = function (vertex,pos) {
 var localPos = geom.toLocalCoords(this,pos);
 vertex.__moveto(localPos);
 debugger;
 this.positionvertices(vertex);
 this.update();
}

item.__dragStart = function () {
  this.computeRelativePositions();
}

/* end section: drag support */

/* begin section: action panel */



item.reposition = function (diagram,root) {
  diagram.positionRelative(root);
  diagram.positionvertices(root);
  diagram.update();
  svg.main.fitContentsIfNeeded();

}

item.connectAction = function (diagram,vertex) {
  diagram.graph.connectAction(diagram.graph,vertex);
}


item.__actions = function (item) {
  if (item.__role === 'vertex') {
    return [{title:'Add Child',action:'addDescendant'},{title:'Connect',action:'connectAction'},
                            {title:'Reposition Subtree',action:'reposition'}];
  }
}

/* end section : action panel */

/* section: misc */


var vertexInstanceTransferFunction = function (dest,src) {
  if (src.relPosition__) {
    if (dest.relPosition__) {
      dest.relPosition__.copyto(src.relPosition__);
    } else {
      dest.set('relPosition__',src.relPosition__.copy());
    }
  }
}

item.set('__diagramTransferredProperties',graphP.__diagramTransferredProperties.concat(pj.lift(
                ['incomingEdge','parentVertex','descendants__','relPosition__','vertexActions','__delete','__dragStep'])));
item.__diagramTransferredProperties.__const = true;

item.__diagram = true;
/* end section: misc */

return item;
});
