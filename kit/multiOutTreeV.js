
core.require('/kit/tree_utils.js',function (treeLib) {
let kit = svg.Element.mk('<g/>');

kit.hSpacing = 50;
kit.vSpacing = 50;

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

kit.positionRelative = function () {
  let root = this.root;//vertices.V0;
  root.set('__relPosition',geom.Point.mk(0,0));
  let hSpacing = this.hSpacing;
  let vSpacing = this.vSpacing;
  let recurse = function (vertex) {
    let children = vertex.__descendants;
    if (!children || (children.length === 0)) {
       vertex.treeWidth = 0;//(vertex.__element)?vertex.bounds().extent.x:0;
       return vertex.treeWidth;
    }
    let totalWidth = 0;
    children.forEach(function (child) {
      let wd = recurse(child);
      totalWidth += wd + hSpacing;
    });
    totalWidth -= hSpacing;
    vertex.treeWidth = totalWidth;
    let xpos = -0.5*totalWidth;
    let ypos = vSpacing;
    children.forEach(function (child) {
      let childWidth = child.treeWidth;
      let vxpos =  0.5 * childWidth + xpos;
      child.set('__relPosition',geom.Point.mk(vxpos,ypos));
      xpos += childWidth + hSpacing;
    });
    return totalWidth;
  }
  recurse(root);
  
}


kit.computeRelativePositions = function () {

  let recurse = function (vertex) {
    let rootPosition = vertex.getTranslation();
    let children = vertex.__descendants;
    if (!children || (children.length === 0)) {
      return;
    }
    children.forEach(function (child) {
      recurse(child);
      child.set('__relPosition',child.getTranslation().difference(rootPosition));
    });
  }
  recurse(this.root);  
}



kit.positionvertices = function (root) {
  // now generate absolute  positions
  let recurse  = function (vertex,position) {
    let myPosition;
    if (position) {
      myPosition = position.plus(vertex.__relPosition);
      vertex.moveto(myPosition);
    } else {
      myPosition = vertex.getTranslation();
    }
    let children = vertex.__descendants;
    if  (!children || (children.length === 0)) {
      return;
    }
    children.forEach(function (child) {
      recurse(child,myPosition);
    });
  };
  recurse(root);
}



/* end section: basic mechanics */
/* Section: deletion */

kit.deleteSubtree = function (vertex,topCall) {
  let children = vertex.__descendants;
  let thisHere = this;
  let outMulti = this.outMulti;
  
  if  (children && (children.length > 0)) {
    children.forEach(function (child) {
      thisHere.deleteSubtree(child);
    });
  }
  if (outMulti) {
    outMulti.remove();
  }
  let parent = vertex.parentVertex;
  if (parent) {
    let connectedEdges = vertex.connectedEdges;
      connectedEdges.forEach((edge) =>
        {
          if (edge.end0vertex === parent) {
            edge.remove();
          }
        });
    if (topCall) {
      let descendants = parent.__descendants;
      let idx = descendants.indexOf(vertex);
      descendants.splice(idx,1);
    }
  }
  graph.disconnectVertex(vertex);
  vertex.remove();
}


kit.__delete = function (vertex) {
  if (core.hasRole(vertex,'edge')) {
    if (vertex.__treeEdge) {
      ui.alert('Edges that are part of the tree cannot be deleted');
    } else {
      ui.standardDelete(vertex);
    }
    return;
  }
  if (!core.hasRole(vertex,'vertex')) {
    ui.standardDelete(vertex);
    return;
  }
  editor.confirm('Are you sure you wish to delete this subtree?', () => {
    if (this.root === vertex) {
      ui.standardDelete(this);
      return;
    }
    this.deleteSubtree(vertex,true);
    this.positionRelative();
    //this.update();
    ui.vars.setSaved(false);
    this.draw();
});
}

/* end section :deletion  */

/* begin section: constructing trees */
//index = index at which to insert the descendant
 
kit.addDescendant = function (vertex,index=0,doUpdate=true,addMulti=true) {
  debugger;
  /*
  let multiP = this.multiP;
  let newMulti = multiP.instantiate().show();
  this.multis.add(newMulti,'e');
  newMulti.__treeEdge = true;
  */
  let vertexP = this.vertexP;
  let newVertex=  vertexP.instantiate().show();
  this.vertices.add(newVertex,'x');
 
    
  if (doUpdate) {
    let vertexPos = vertex.getTranslation();
    let newPos = vertexPos.plus(geom.Point.mk(0,this.vSpacing));
    newVertex.moveto(newPos);
    newVertex.update();
    newVertex.draw();
  }
 // graph.connectVertices(newEdge,vertex,newVertex);
  let ds = descendants(vertex);
  if (index === -1) {
    ds.plainPush(newVertex);
  } else {
    ds.plainSplice(index,0,newVertex);
  }
  newVertex.parentVertex = vertex;
  let multi = vertex.outMulti;
  let ln = ds.length;
  if (multi) {
    multi.outCount = ln;
    multi.initializeNewEnds();

    graph.connectMultiVertex(multi,ln-1,newVertex,'top');
    
    if (doUpdate) {
      multi.update();
      multi.draw();
    }
  } else {
    this.addMultis(vertex);
  }
  vertex.outMulti.ends[ln-1] = geom.Point.mk(0,-10000); // so that connection will be made from the top

  if (doUpdate) {
    this.positionRelative(vertex);
    this.positionvertices(vertex);
    let ends = this.ends;
    newVertexPos = newVertex.toGlobalCoords();
    debugger;
    //this.update();
    //this.draw();
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
  this.addDescendant(vertex,-1);
  core.saveState();
  vertex.__select('svg');
}


kit.addVertices = function (parent,childrenData) {
  childrenData.forEach( (cd) => {
    let newVertex = this.addDescendant(parent,-1,false);
    let rpos = cd.relPos;
    newVertex.set('__relPosition', rpos.copy());
    newVertex.parentVertex = parent;
    if (cd.d) {
      this.addVertices(newVertex,cd.d);
    }
  });
}

kit.addMultis = function (vertex) {
  debugger;
  let ds = vertex.__descendants;
  if ((!vertex.outMulti) && ds && (ds.length > 0)) {
    let newMulti = this.multiP.instantiate().show();
    newMulti.outCount = ds.length;
    newMulti.initializeNewEnds();
    newMulti.singleEnd = geom.Point.mk(0,10000); // so that connection will be made from the bottom

    this.multis.add(newMulti,'m');
    vertex.outMulti = newMulti;
    debugger;
    graph.connectMultiSingleVertex(newMulti,vertex,'bottom');
    let idx = 0;
    //graph.connectMultiVertex(newMulti,idx++,ds[0]);
    //return;
    ds.forEach((child) => {
      graph.connectMultiVertex(newMulti,idx++,child,'top');
    });
   //ds.forEach(this.addMultis);
  }
}
  
  
  
  
kit.buildFromData = function (data) {
  let vertexP = this.vertexP;
  let edgeP = this.edgeP;
  if (vertexP) {
    vertexP.draggableInKit = true;
  }
  let node = this;
 // let  data = core.getData(node);
  if (!data) {
    return;
  }
  treeLib.layout(data,this.hSpacing,this.vSpacing);
  //let gdata = treeLib.toGraphData(data);
  //graph.buildFromData(this,gdata);
  //now add the descendants relation on the built graph
  let root =  vertexP.instantiate().show();
  this.set("vertices",svg.Element.mk('<g/>'))
  this.set("multis",svg.Element.mk('<g/>'))
  this.vertices.set('x',root);
  this.root = root;
  data.id = 'x';
  let vertices = this.vertices;  
  //node.root = vertices[data.id];
  if (data.d) {
    this.addVertices(root,data.d);
  }
  let recurse = function (dataForVertex,parent) { 
    let parentDescendants;
    if (parent) {
      parentDescendants = descendants(parent); // creates the descendant array
    }
    let vid = dataForVertex.id;
    let vertex = vertices[vid];
    vertex.parentVertex = parent;
    let rpos = dataForVertex.relPos;
    vertex.set('__relPosition', rpos.copy());
    if (0 && parentDescendants) { // only the root lacks these
      parentDescendants.plainPush(vertex);
    }
    let descendantsInData = dataForVertex.d;
    if (descendantsInData) {
      descendantsInData.forEach(function (v) {
        recurse(v,vertex);
      });
    }
  }
//  recurse(data);
//  this.computeRelativePositions();
  this.positionvertices(root);
  debugger;
  graph.graphUpdate();
  //this.addMultis(root);


}


/* end section: constructing trees */

/* section: drag support */

kit.dragStep = function (vertex,pos) {
 let localPos = this.vertices.toLocalCoords(pos,true);
 vertex.moveto(localPos);
 /* move all the descendants of vertex to the relative
    positions they had prior to the move of vertex
 */
 this.positionvertices(vertex);
 graph.graphUpdate();
}

kit.dragStart = function () {
  this.computeRelativePositions();
}

/* end section: drag support */

/* begin section: action panel */



kit.reposition = function (root) {
  this.positionRelative(root);
  this.positionvertices(root);
  graph.graphUpdate();
  dom.svgMain.fitContentsIfNeeded();

}


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

/* end section : action panel */

/* section: misc */



kit.transferElementState = function (dst,src,own) {
  if (core.hasRole(src,'vertex')) {
    core.setProperties(dst,src, ['draggableInKit','__descendants',
                    '__relPosition'],own,true);       // dontCopy = true
  } 
}
kit.isKit = true;
/* end section: misc */
ui.hide(kit,['edges','vertices']);

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
