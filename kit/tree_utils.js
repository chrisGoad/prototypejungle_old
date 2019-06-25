core.require(function () {

/* this supports both vertical and horizontal trees, but variable names are chosen for the vertical case.
For the horizontal case, for example, totalWidth actually signifies total height. Only when we hit the level of points
do the "logical" positions (where width means "across the tree" turn into x,y positions, which take into account verticality*/


// Section: connection support
//data structure for tree
/*
{k:"v",id:<string>,d:[v0,v1,v2...] }

where each di is a descendant descriptor having the form of a vertex, or an edge
{k:"e",id:<string>,end1:<vertex>,....}
*/

let item = core.ObjectNode.mk();


item.descendants = function (vertex) {
  let d = vertex.__descendants;
  if (!d) {
    d = vertex.set('__descendants',core.ArrayNode.mk());
  }
  return d;
}

const relativeToAbsolutePositions = function (vertex,cp) {
  vertex.set('position',cp.copy());
  let descendants = vertex.d;
  if (descendants) {
    descendants.forEach(function (vertex) {
      let rp = vertex.relPos;
      let ap = cp.plus(rp);
      relativeToAbsolutePositions(vertex,ap);
    });
  }
}

item.addIds = function (vertex) {
  let cnt = 0;
  const recurse = function (v) {
     if (!v.id) {
       v.id = 'x'+(cnt++);
     }
     let descendants = v.d;
     if (descendants) {
       descendants.forEach(recurse);
     }
  }
  recurse(vertex);
}    


item.positionvertices = function (root) {
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


item.layout2 = function (root,vertical,hSpacing,vSpacing) {
  let recurse = function (vertex) {
    let children = vertex.__descendants;
    if (!children || (children.length === 0)) {
       let xt = (vertex.__element)?vertex.bounds().extent:undefined;
       vertex.treeWidth =  xt?(this.vertical?xt.x:xt.y):0;
       return vertex.treeWidth;
    }
    let totalWidth = 0;
    let firstChild = children[0];
    let lastChild = children[children.length - 1];
    children.forEach(function (child) {
      let wd = recurse(child);
      totalWidth += wd +  hSpacing;
    });
    totalWidth -= hSpacing;
    vertex.treeWidth = totalWidth;
    let xpos = -0.5*totalWidth;
    let ypos = vSpacing;
    children.forEach(function (child) {
      let childWidth = child.treeWidth;
      let vxpos =  0.5 * childWidth + xpos;
      child.set('__relPosition',vertical?Point.mk(vxpos,ypos):Point.mk(ypos,vxpos));
      xpos += childWidth + hSpacing;
    });
    return totalWidth;
  }
  recurse(root);
}



item.computeRelativePositions = function (root) {
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
  recurse(root);  
}
 
  
  

item.layoutttt = function (vertical,data,hSpacing,vSpacing) {
  addIds(data);
  var cy = 0;
  var recurseV = function (vertex) {
    let descendants = vertex.d;
    let  tw = 0;
    if (descendants) {
      let cw  = 0;
      let widths = [];
      let nmd = descendants.length;
      descendants.forEach((descendant) => {
         let w = recurseV(descendant);
         widths.push(w);
         cw += w;
      });
      tw = cw + (nmd-1) * hSpacing;
      let cx = -tw/2;
      for (let i=0;i<nmd;i++) {
         let w = widths[i];
         let cp = cx + w/2;
         cx = cx + w + hSpacing;
         descendants[i].set('relPos',vertical?Point.mk(cp,vSpacing):Point.mk(vSpacing,cp));
      }
    }
    return tw;
  }
  recurseV(data);
  data.set('relPos',geom.Point.mk(0,0));
  relativeToAbsolutePositions(data,geom.Point.mk(0,0));
}
 
item.toGraphData = function (vertex) {
  let vertices = [];
  let edges = [];
  let collect = function (vertex) {
    let vid = vertex.id;
    let newVertex = core.lift({id:vid});
    let pos = vertex.position;
    if (pos) {
     newVertex.set('position',pos.copy());
    }
    let txt = vertex.text;
    if (txt) {
      newVertex.text = txt;
    }
    vertices.push(newVertex);
    let descendants = vertex.d;
    if (descendants) {
      descendants.forEach(function (descendantVertex) {
        let dvid = descendantVertex.id;
        let newEdge = {end0:vid,end1:dvid};
        edges.push(newEdge);
        collect(descendantVertex);
      });
    }
  }
  collect(vertex);
  let rs = {vertices:vertices,edges:edges};
  return rs;
}


item.reposition = function (root,vertical,hSpacing,vSpacing) {
  this.layout2(root,vertical,hSpacing,vSpacing);
  this.positionvertices(root);
  graph.graphUpdate();
  dom.svgMain.fitContentsIfNeeded();
}

item.deleteSubtree = function (vertex) {
  let edgeToRemoveFromConnectedEdges;
  let verticesToRemove = [];
  const recurse = function (vertex,topCall) {
    let children = vertex.__descendants;
    let thisHere = this;
    if  (children && (children.length > 0)) {
      children.forEach((child) => {
        recurse(child);
      });
    }
    let parent = vertex.__parentVertex;
    let connectedEdges = vertex.connectedEdges;
    connectedEdges.forEach((edge) => {
      let isMulti = edge.__sourceUrl === '/arrow/multiOut.js';
      if (isMulti) {
        let isIncoming = edge.singleVertex === parent;
        if (topCall && isIncoming) {
          if (edge.outCount === 1) {
            edge.remove();
            edgeToRemoveFromConnectedEdges = edge;
          } else {
            let idx = edge.vertices.indexOf(vertex);
            edge.removeEnd(idx);
          }
        } else if (!isIncoming) {
          edge.remove(); 
        }
      } else {
        let isIncoming = edge.end1vertex === vertex;
        if (topCall && isIncoming) {
          edgeToRemoveFromConnectedEdges = edge;
          edge.remove();
        } else {
          if (!isIncoming) {
            edge.remove();
          }
        }
      }
    });
    if (topCall) {
      let descendants = parent.__descendants;
      let idx = descendants.indexOf(vertex);
      descendants.splice(idx,1);
      if (edgeToRemoveFromConnectedEdges) {
        let connectedEdges = parent.connectedEdges;
        let idx = connectedEdges.indexOf(edgeToRemoveFromConnectedEdges);
        connectedEdges.splice(idx,1);
        if (parent.outMulti) {
          parent.outMulti = undefined;
        }
      }
    }
    verticesToRemove.push(vertex);
  }
  recurse(vertex,true);
  graph.disconnectVertices(verticesToRemove);
  verticesToRemove.forEach( (vertex) => vertex.remove());
}

item.deleteVertex = function (vertex) {
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
  if (this.root === vertex) {
    ui.standardDelete(this);
    return;
  }
  this.deleteSubtree(vertex);
  this.layout2(vertex,this.vertical,this.hSpacing,this.vSpacing);
  ui.vars.setSaved(false);
  core.saveState();
}

     
  return item;
});
 