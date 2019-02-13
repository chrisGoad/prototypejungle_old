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

const relativeToAbsolutePositions = function (vertex,cp) {
  vertex.position  = cp;
  let descendants = vertex.d;
  if (descendants) {
    descendants.forEach(function (vertex) {
      let rp = vertex.relPos;
      let ap = [cp[0] + rp[0],cp[1] + rp[1]];
      relativeToAbsolutePositions(vertex,ap);
    });
  }
}

const addIds = function (vertex) {
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
         
    
  
item.layout = function (data,hSpacing,vSpacing) {
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
         descendants[i].relPos = [cp,vSpacing];
      }
    }
    return tw;
  }
  recurseV(data);
  data.relPos = [0,0];
  relativeToAbsolutePositions(data,[0,0]);
}
 
item.toGraphData = function (vertex) {
  let vertices = [];
  let edges = [];
  let collect = function (vertex) {
    let vid = vertex.id;
    let newVertex = {id:vid};
    let pos = vertex.position;
    if (pos) {
     newVertex.position = [pos[0],pos[1]];
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
     
  return item;
});
     

