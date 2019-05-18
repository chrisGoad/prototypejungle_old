
core.require('/kit/tree_utils.js',function (treeLib) {
let kit = svg.Element.mk('<g/>');

kit.hSpacing = 50;
kit.vSpacing = 50;

/* a tree is a special kind of graph, of course, and is so implemented*/

kit.resizable = true;

let descendants = function (vertex) {
  let d = vertex.__descendants;
  if (!d) {
    d = vertex.set('__descendants',core.ArrayNode.mk());
  }
  return d;
}

kit.__delete = function (vertex) {
  treeLib.deleteVertex(vertex);
}

//index = index at which to insert the descendant
 
kit.addDescendant = function (vertex,index=0,doUpdate=true) {
  let edgeP = this.edgeP;
  let newEdge = edgeP.instantiate().show();
  this.edges.add(newEdge,'e');
  newEdge.__treeEdge = true;
  let vertexP = this.vertexP;
  let newVertex=  vertexP.instantiate().show();
  this.vertices.add(newVertex,'x');
  if (doUpdate) {
    let vertexPos = vertex.getTranslation();
    let newPos = vertexPos.plus(this.vertical?geom.Point.mk(0,this.vSpacing):geom.Point.mk(this.vSpacing,0));
    newVertex.moveto(newPos);
  }
  graph.connectVertices(newEdge,vertex,newVertex);
  descendants(vertex).plainSplice(index,0,newVertex);
  newVertex.parentVertex = vertex;
  if (doUpdate) {
    treeLib.layout2(vertex,this.vertical,this.hSpacing,this.vSpacing);
    treeLib.positionvertices(vertex);
    graph.graphUpdate();
    vertex.__select('svg');
    dom.svgMain.fitContentsIfNeeded();
  }
  return newVertex;
}


kit.addSibling = function (vertex,doUpdate=true) {
  let parent = vertex.parentVertex;
  if (parent) {
    let idx = descendants(parent).indexOf(vertex);
    this.addDescendant(parent,idx+1,doUpdate);
    vertex.__select('svg');
  }
}


kit.addChild = function (vertex) {
  this.addDescendant(vertex,0);
  core.saveState();
  vertex.__select('svg');
}

kit.buildFromData = function (data) {
  let vertexP = this.vertexP;
  let edgeP = this.edgeP;
  if (vertexP) {
    vertexP.draggableInKit = true;
  }
  let node = this;
  if (!data) {
    return;
  }
  treeLib.addIds(data);
  let gdata = treeLib.toGraphData(data);
  graph.buildFromData(this,gdata,false);
  //now add the descendants relation on the built graph
  let vertices = this.vertices;  
  node.root = vertices[data.id];
  let recurse = function (dataForVertex,parent) { 
    let parentDescendants;
    if (parent) {
      parentDescendants = descendants(parent); // creates the descendant array
    }
    let vid = dataForVertex.id;
    let vertex = vertices[vid];
    vertex.parentVertex = parent;
    if (parentDescendants) { // only the root lacks these
      parentDescendants.plainPush(vertex);
    }
    let descendantsInData = dataForVertex.d;
    if (descendantsInData) {
      descendantsInData.forEach(function (v) {
        recurse(v,vertex);
      });
    }
  }  
  recurse(data);
  node.root.set('__relPosition',Point.mk(0,0));
  treeLib.layout2(node.root,this.vertical,this.hSpacing,this.vSpacing);
  treeLib.positionvertices(node.root);
  graph.graphUpdate();
}

kit.dragStep = function (vertex,pos) {
 let localPos = this.vertices.toLocalCoords(pos,true);
 vertex.moveto(localPos);
 /* move all the descendants of vertex to the relative
    positions they had prior to the move of vertex
 */
 treeLib.positionvertices(vertex);
 graph.graphUpdate();
}

kit.dragStart = function () {
  treeLib.computeRelativePositions(this.root);
}

kit.reposition = function (root) { treeLib.reposition(root,this.vertical,this.hSpacing,this.vSpacing);}

kit.repositionTree = function () {
  this.reposition(this.root);
}

kit.selectTree = function () {
  this.__select('svg');
}
 
kit.actions = function (node) {
  let rs = [];
  if (!node) return;
  if (node.role === 'vertex') {
     rs.push({title:'Select Kit Root',action:'selectTree'},
               {title:'Add Child',action:'addChild'});
    if (node.parentVertex) {
      rs.push({title:'Add Sibling',action:'addSibling'});
    }
    rs.push({title:'Reposition Subtree',action:'reposition'});
  }
  if (node === this) {
    rs.push({title:'Reposition Tree',action:'repositionTree'});
  }
  return rs;
}


kit.transferElementState = function (dst,src,own) {
  if (core.hasRole(src,'vertex')) {
    core.setProperties(dst,src, ['draggableInKit','__descendants',
                    '__relPosition'],own,true);       // dontCopy = true
  } 
}
kit.isKit = true;
ui.hide(kit,['edges','vertices']);

return kit;
});
