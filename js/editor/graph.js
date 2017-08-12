
// graph support; the basic operations on vertices are dispatched to the containing diagram

ui.setupAsVertex= function (item) {
  item.__role = 'vertex';
  item.__transferExtent = true;
}

ui.edgeInstanceTransferFunction = function (dest,src) {
  if (dest.setEnds) {
    dest.setEnds(src.end0,src.end1);
  }
}


ui.setupAsEdge = function (item) {
  item.__role = 'edge';
  item.__instanceTransferFunction = ui.edgeInstanceTransferFunction;
  ui.hide(item,['end0vertex','end1vertex','end0connection','end1connection']);

}


ui.multiInInstanceTransferFunction = function (dest,src) {
  // @todo implement this. Not needed until there is more than one kind of multiIn
}


ui.multiOutInstanceTransferFunction = function (dest,src) {
  // @todo implement this. Not needed until there is more than one kind of multiIn
}

ui.setupAsMultiIn = function (item) {
  item.__role = 'multiIn';
  item.__instanceTransferFunction = ui.multiInInstanceTransferFunction;
}


ui.setupAsMultiOut= function (item) {
  item.__role = 'multiOut';
  item.__instanceTransferFunction = ui.multiOutInstanceTransferFunction;
}

// direction is up,down,left,right . This computes where a ray running in the given direction from way out first intersects the bounds of the item,
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
      if (px < maxx) {
        return minx
      } else {
        return undefined;
      }
    } else { // direction == 'left'
      if (px > minx) {
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
      if (py < maxy) {
        return miny;
      } else {
        return undefined;
      }
    } else { // direction == 'down'
      if (py > miny) {
        return maxy;
      } else {
        return undefined;
      }
    }
  }
}
ui.findNearestVertex = function (pos,direction) {
  if (!pj.root.diagram) {
    return;
  }
  var vertices = pj.root.diagram.vertices;
  if (!vertices) {
    return;
  }
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

ui.uiHideEdgeProperties = function (item) {
  ui.hide(item,['end0connection','end1connection','end0vertex','end1vertex']);
}

