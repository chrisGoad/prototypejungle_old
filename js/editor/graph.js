
// graph support
ui.vertexDragStep =  function (pos) {
  var topActive = pj.ancestorWithProperty(this,'__activeTop');
  if (topActive && topActive.dragVertex) {
    topActive.dragVertex(this,pos);
  }
}

ui.vertexDelete = function () {
  var topActive = pj.ancestorWithProperty(this,'__activeTop');
  if (topActive && topActive.deleteVertex) {
    topActive.deleteVertex(this);
  } else {
    ui.standardDelete(this);
  }
}

ui.vertexActions =  function () {
  console.log('VERTEX ACTIONS');
  var topActive = pj.ancestorWithProperty(this,'__activeTop');
  if (topActive && topActive.vertexActions) {
    return topActive.vertexActions(this);
  }
}


ui.multiInActions =  function () {
  console.log('VERTEX ACTIONS');
  var topActive = pj.ancestorWithProperty(this,'__activeTop');
  if (topActive && topActive.multiInActions) {
    return topActive.multiInActions(this);
  }
}
  
  
ui.setupAsVertex= function (item) {
  item.__role = 'vertex';
  item.__transferredProperties = ['stroke','stroke-width','fill'];

  //item.__transferredProperties = ['stroke','fill'];
  //item.__isVertex = true;
  item.__transferExtent = true;
  item.__dragStep = ui.vertexDragStep;
  item.__delete = ui.vertexDelete;
  item.__actions = ui.vertexActions;
  
}

ui.edgeInstanceTransferFunction = function (dest,src) {
  dest.setEnds(src.end0,src.end1);
}


ui.setupAsEdge = function (item) {
  item.__role = 'edge';
  item.__transferredProperties = ['stroke','end0vertex','end1vertex','end0connection','end1connection'];
  item.__instanceTransferFunction = ui.edgeInstanceTransferFunction;

}


ui.multiInInstanceTransferFunction = function (dest,src) {
  // @todo implement this. Not needed until there is more than one kind of multiIn
}

ui.setupAsMultiIn = function (item) {
  item.__role = 'multiIn';
  item.__transferredProperties = ['stroke','inVertices','outVertex','inConnections','outConnection'];
  item.__instanceTransferFunction = ui.multiInInstanceTransferFunction;
  item.__actions = ui.multiInActions;
}

// direction is up,down,left,right . This computes where a ray running in the given direction from pos first intersects the bounds of the item
// only one number need be return (for up and down, the y coordinate, for left and right, the x)

var boundsHit = function (item,pos,direction) {
  var bnds = item.__bounds(pj.root);
  var px = pos.x;
  var py = pos.y;
  var corner = bnds.corner;
  var extent = bnds.extent;
  var minx = corner.x;
  var maxx = corner.x + extent.x;
  var miny = corner.y;
  var maxy = corner.y + extent.y;
  if ((direction === 'right') || (direction === 'left')) {
    if ((py > maxy) || (py < miny)) {
       return undefined;
    }
    if (direction === 'right') {
      if (px < minx) {
        return minx
      } else {
        return undefined;
      }
    } else { // direction == 'left'
      if (px > maxx) {
        return maxx
      } else {
        return undefined;
      }
    }
  } else { // diretion === 'up' or 'down'
    if ((px > maxx) || (px < minx)) {
       return undefined;
    }
    if (direction === 'down') { // recall, down is increasing y
      if (py < miny) {
        return miny;
      } else {
        return undefined;
      }
    } else { // direction == 'down'
      if (py > maxy) {
        return maxy;
      } else {
        return undefined;
      }
    }
  }
}
ui.findNearestVertex = function (pos,direction) {
  var vertices = ui.graph.vertices;
  var increasing = (direction === 'right') || (direction === 'down');
  var bestHit;
  var nearestSoFar;
  pj.forEachTreeProperty(vertices,function (vertex) {
    var hit = boundsHit(vertex,pos,direction);
    if (hit) {
      if (increasing) {
        if ((bestHit === undefined) || (hit < bestHit)) {
          bestHit = hit;
          nearestSoFar = vertex;
        }
      } else {
         if ((bestHit === undefined) || (hit > bestHit)) {
          bestHit = hit;
          nearestSoFar = vertex;
        }
      }
    }
  });
  return nearestSoFar;
}