
core.require('/kit/tree_utils.js',function (treeLib) {
let kit = svg.Element.mk('<g/>');



kit.vertical = false;
kit.hSpacing = 50;
kit.vSpacing = 50;
kit.includeArrows = false; 
kit.hideAdvancedButtons = true;
kit.resizable = true;

// the layout operator takes across tree and out tree spacing arguments, and these little functions generate those parameters from orientation
kit.acrossSpacing = function () {
  return this.vertical?this.hSpacing:this.vSpacing;
}

kit.outSpacing = function () {
  return  this.vertical?this.vSpacing:this.hSpacing;
}

/* a tree is a special kind of graph, of course, and is so implemented*/

kit.resizable = true;
/* Section: basic mechanics */


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
 
kit.addDescendant = function (vertex,index=0,doUpdate=true,addMulti=true) {
  let vertexP = this.vertexP;
  let newVertex=  vertexP.instantiate().show();
  this.vertices.add(newVertex,'x');
  if (doUpdate) {
    let vertexPos = vertex.getTranslation();
    let newPos = vertexPos.plus(this.vertical?Point.mk(0,this.vSpacing):Point.mk(this.vSpacing,0));
    newVertex.moveto(newPos);
    newVertex.update();
    newVertex.draw();
  }
  let ds = descendants(vertex);
  if (index === -1) {
    ds.plainPush(newVertex);
  } else {
    ds.plainSplice(index,0,newVertex);
  }
  newVertex.__parentVertex = vertex;
  let multi = vertex.outMulti;
  let ln = ds.length;
  if (multi) {
    multi.outCount = ln;
    multi.initializeNewEnds();
    graph.connectMultiVertex(multi,ln-1,newVertex,this.vertical?'top':'right');
    if (doUpdate) {
      multi.update();
      multi.draw();
    }
  } else {
    this.addMultis(vertex);
  }
  vertex.outMulti.ends[ln-1].copyto(this.vertical?Point.mk(0,-10000):Point.mk(-10000,0)); // so that connection will be made from the top
  if (doUpdate) {
    
    treeLib.layout2(vertex,this.vertical,this.acrossSpacing(),this.outSpacing());
    treeLib.positionvertices(vertex);
    newVertexPos = newVertex.toGlobalCoords();
    graph.graphUpdate();
    vertex.__select('svg');
    dom.svgMain.fitContentsIfNeeded();
  }
  return newVertex;
}


kit.addSibling = function (vertex,toLeft,doUpdate=true) {
  let parent = vertex.__parentVertex;
  if (parent) {
    let idx = descendants(parent).indexOf(vertex);
    this.addDescendant(parent,toLeft?idx:idx+1,doUpdate);
    core.saveState();
    vertex.__select('svg');
  }
}

kit.addSiblingLeft = function (vertex) {
   this.addSibling(vertex,true);
}


kit.addSiblingRight = function (vertex) {
   this.addSibling(vertex,false);
}


kit.addChild = function (vertex) {
  this.addDescendant(vertex,-1);
  graph.graphUpdate();
  core.saveState();
  vertex.__select('svg');
}



kit.addVertices = function (parent,childrenData) {
  childrenData.forEach( (cd) => {
    let newVertex = this.addDescendant(parent,-1,false);
    newVertex.set('__relPosition', Point.mk(0,0));
    if (cd.text) {
      newVertex.text = cd.text;
    }
    newVertex.__parentVertex = parent;
    newVertex.updateAndDraw();
    if (cd.d) {
      this.addVertices(newVertex,cd.d);
    }
  });
}

kit.addMultis = function (vertex) {
  let ds = vertex.__descendants;
  let vertical = this.vertical;
  if ((!vertex.outMulti) && ds && (ds.length > 0)) {
    this.multiP.vertical = this.vertical;
    this.multiP.includeArrows = this.includeArrows;
    let newMulti = this.multiP.instantiate().show();
    newMulti.outCount = ds.length;
    newMulti.initializeNewEnds();
    newMulti.set('singleEnd',this.vertical?Point.mk(0,10000):Point.mk(10000,0)); // so that connection will be made from the bottom
    this.multis.add(newMulti,'m');
    vertex.outMulti = newMulti;
    graph.connectMultiSingleVertex(newMulti,vertex,vertical?'bottom':'left');
    let idx = 0;
    ds.forEach((child) => {
      graph.connectMultiVertex(newMulti,idx++,child,vertical?'top':'right');
    });
  }
}
  
kit.buildFromData = function (data) {
  let vertical = this.vertical;
  let vertexP = this.vertexP;
  let edgeP = this.edgeP;
  if (vertexP) {
    vertexP.draggableInKit = true;
  }
  let node = this;
  if (!data) {
    return;
  }
  //now add the descendants relation on the built graph
  let root =  vertexP.instantiate().show();
  root.text = data.text?data.text:'';
  this.set("vertices",svg.Element.mk('<g/>'))
  this.set("multis",svg.Element.mk('<g/>'))
  this.vertices.set('x',root);
  this.isGraph = true;
  this.vertices.unselectable = true;
  //node.edges.unselectable = true;
  this.__setExtent = (xt) => {
    graph.graphSetExtent(this,xt);
  }
  this.root = root;
  data.id = 'x';
  let vertices = this.vertices;  
  if (data.d) {
    this.addVertices(root,data.d);
  }
  root.update();
  this.draw();
  treeLib.layout2(root,this.vertical,this.acrossSpacing(),this.outSpacing());
  treeLib.positionvertices(root);
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


kit.reposition = function (root) { 
   treeLib.reposition(root,this.vertical,this.acrossSpacing(),this.outSpacing());
   this.update();}

kit.repositionTree = function () {
  this.reposition(this.root);
}


kit.selectTree = function () {
  this.__select('svg');
}
 
kit.actions = function (node) {
  let vertical = this.vertical
  let rs = [];
  if (!node) return;
  if (node.role === 'vertex') {
     rs.push({title:'Add Child',action:'addChild'});
    if (node.__parentVertex) {
      rs.push({title:`Add Sibling ${vertical?'Left':'Above'}`,action:'addSiblingLeft'});
      rs.push({title:`Add Sibling ${vertical?'Right':'Below'}`,action:'addSiblingRight'});
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

kit.afterLoad = function () {
  //this.layoutTree(person.nodeOf);
  editor.setSaved(true);
  //this.root.__select('svg');
  dom.svgMain.fitContents(0.5);

}
kit.update = function () {
  this.multiP.includeArrows = this.includeArrows;
  graph.graphUpdate();
}


kit.hideProperties = function () {
  this.vertexP.set('hiddenProperties',core.ObjectNode.mk());
  this.vertexP.hiddenProperties.treeWidth  = 1;
}

kit.setFieldType('includeArrows','boolean');
ui.hide(kit,['hideAdvancedButtons','multis','vertical','includeArrows']);// Not sure if includeArrows is confusing, so left it out of UI

return kit;
});

// for placing labels or determining clockwise status of arcs; not in use since needs work for new graph structure
// mothballed - will resurrect (cg  7/4/18)
/*
kit.computeSides = function () {
  return;
  let graph = this.getGraph();
  let edges = graph.edges;
  //  because of deletions, some vertices may have been set to null. Fix up vertices accordingly
  core.forEachTreeProperty(edges,function (edge) {
    if (!edge.setSide) {
      return;
    }
    let toVertexName = edge.end1vertex;
    let fromVertexName = edge.end0vertex;
    let fromVertex = vertices[fromVertexName];
    
    let des = descendants(fromVertex);
    if (!des) {
      return;
    }
    let numDescendants = des.length;
    let index = des.indexOf(toVertexName);
    if (index<0) {
      return;
    }
    edge.childIndex = index;
    let twiceIndex = 2*index;
    let whichSide;
    if (numDescendants === (twiceIndex+1)) {
      whichSide = 'middle';
    } else if (twiceIndex >= numDescendants) {
      whichSide = 'right';
    } else {
      whichSide = 'left';
    }
    edge.setSide(whichSide);
  });
}
*/
