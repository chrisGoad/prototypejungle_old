core.require(function () {


// Section: connection support
//data structure for tree
/*
{k:"v",id:<string>,d:[v0,v1,v2...] }

where each di is a descendant descriptor having the form of a vertex, or an edge
{k:"e",id:<string>,end1:<vertex>,....}
*/
/*
 
let d = {d:[{},{d:[{},{}]}]};

core.root.main.layoutTree(d,7,20);

let g = core.root.main.toGraphData(d);

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
      //let ap = core.ArrayNode.mk([cp[0] + rp[0],cp[1] + rp[1]]);
      let ap = cp.plus(rp);
      //let ap = core.ArrayNode.mk([cp[0] + rp[0],cp[1] + rp[1]]);
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
         
//kit.asPoint = (vertical,x,y) => vertical? Point.mk(x,y):Point.mk(y,x);
    


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
 
  
  

item.layout = function (vertical,data,hSpacing,vSpacing) {
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
         console.log('bbbb');
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
     //([pos[0],pos[1]]));
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
   debugger;
   this.layout2(root,vertical,hSpacing,vSpacing);
  //this.positionRelative(root);
  this.positionvertices(root);
  graph.graphUpdate();
  dom.svgMain.fitContentsIfNeeded();
}

item.addSiblinggg = function (vertex,doUpdate=true) {
  debugger;
  let parent = vertex.parentVertex;
  if (parent) {
    let idx = this.descendants(parent).indexOf(vertex);
    this.addDescendant(parent,idx+1,doUpdate);
    core.saveState();
    vertex.__select('svg');
  }
}


item.addChildggg = function (vertex) {
  this.addDescendant(vertex,-1);
  graph.graphUpdate();
  core.saveState();
  vertex.__select('svg');
}

     
  return item;
});
 