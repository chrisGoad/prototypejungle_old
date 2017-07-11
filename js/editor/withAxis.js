
// graph support; the basic operations on vertices are dispatched to the containing diagram
// support for drawings with axes, in which shapes may have associated data

ui.findAxis = function () {
  let rs;
  pj.forEachTreeProperty(pj.root,
    (node) => {if (node.__role === 'axis') rs = node});
}

ui.imagePositionRelAxis = function (data,iaxis) {
  let axis = iaxis?iaxis:ui.findAxis();
  if (!axis) {
    return;
  }
  let width = axis.width;
  let center = axis.__getTranslation().x;
  let fractionAlong = (data - axis.dataLower)/(axis.dataUpper - axis.dataLower);
  return (center - 0.5*width) + fractionAlong * width;
}

ui.positionNodeWithSingleDatumRelAxis = function (node) {
  let data = node.dataX;
  if (data) {
    let x = imagePositionRelAxis(node);
    if (x !== undefined) {
       node.__moveto(x);
       node.__dragVertically = true;
    }
  }
}

ui.vertexDragStep =  function (pos) {
  debugger;
  var topActive = pj.ancestorWithProperty(this,'__diagram');
  if (topActive && topActive.vertexDragStep) {
    topActive.vertexDragStep(this,pos);
  }
}

ui.vertexDragStart =  function (pos) {
  debugger;
  var topActive = pj.ancestorWithProperty(this,'__diagram');
  if (topActive && topActive.vertexDragStart) {
    topActive.vertexDragStart(this,pos);
  }
}
ui.vertexDelete = function () {
  debugger;
  var topActive = pj.ancestorWithProperty(this,'__diagram');
  if (topActive && topActive.vertexDelete) {
    topActive.vertexDelete(this);
  } else {
    ui.standardDelete(this);
  }
}

ui.vertexActions =  function () {
  console.log('VERTEX ACTIONS');
  debugger;
  var topActive = pj.ancestorWithProperty(this,'__diagram');
  if (topActive && topActive.vertexActions) {
    var vertexActions = topActive.vertexActions;
    return (typeof vertexActions === 'function')?vertexActions():vertexActions;
  }
}


ui.multiInActions =  function () {
  var topActive = pj.ancestorWithProperty(this,'__diagram');
  if (topActive && topActive.multiInActions && !this.nowConnected) {
    return topActive.multiInActions(this);
  }
}



ui.multiOutActions =  function () {
  var topActive = pj.ancestorWithProperty(this,'__diagram');
  if (topActive && topActive.multiOutActions && !this.nowConnected) {
    return topActive.multiOutActions(this);
  }
}
  
  
//ui.vertexTransferredProperties = ['stroke','stroke-width','fill','__transferredProperties'];
ui.setupAsVertex= function (item) {
  item.__role = 'vertex';
  //item.set('__transferredProperties',pj.lift(ui.vertexTransferredProperties));

  //item.__transferredProperties = ['stroke','fill'];
  //item.__isVertex = true;
  item.__transferExtent = true;
  //item.__dragStep = ui.vertexDragStep;
  //item.__dragStart = ui.vertexDragStart;
  //item.__delete = ui.vertexDelete;
 // item.__actions = ui.vertexActions;
  
}

ui.edgeInstanceTransferFunction = function (dest,src) {
  dest.setEnds(src.end0,src.end1);
}


ui.setupAsEdge = function (item) {
  item.__role = 'edge';
  //item.set('__transferredProperties', pj.lift(['stroke','stroke-width','end0vertex','end1vertex','end0connection','end1connection']));
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
  //item.set('__transferredProperties',pj.lift(['stroke','inVertices','outVertex','inConnections','outConnection']));
  item.__instanceTransferFunction = ui.multiInInstanceTransferFunction;
  item.__actions = ui.multiInActions;
}


ui.setupAsMultiOut= function (item) {
  item.__role = 'multiOut';
  //item.set('__transferredProperties',pj.lift(['stroke','outVertices','inVertex','outConnections','inConnection']));
  item.__instanceTransferFunction = ui.multiOutInstanceTransferFunction;
  item.__actions = ui.multiOutActions;
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

ui.uiHideEdgeProperties = function (item) {
  ui.hide(item,['end0connection','end1connection','end0vertex','end1vertex']);
}

/*
ui.initConnectors = function () {
  //ui.graph.set('edgeP',ui.connectors['/shape/arrow.js']);
  var edges = ui.graph.edges;
  pj.forEachTreeProperty(edges,function (edge) {
    var srcUrl = edge.__sourceUrl;
    if (!ui.connectors[srcUrl]) {
      var proto = Object.getPrototypeOf(edge);
     console.log('source url',srcUrl);
     ui.connectors[srcUrl] = proto;
    }
  });
}
*/
