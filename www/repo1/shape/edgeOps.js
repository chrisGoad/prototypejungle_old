'use strict';

pj.require(function () {
const  geom =  pj.geom,ui = pj.ui;

let item = pj.Object.mk();



// an edge has properties endN endNVertex, endNSide endNsideFraction  for N = 0,1. The periphery of a vertex has a series
// of sides (which are currently regarded as straight, but might be arcs in future). The sides are numbered from the top in
// clockwise order. endOSide = 3 and endNsideFraction = 0.2 means 20% of the way along the 3rd side.
// later: multiedges

item.updateConnectedEnds = function (vertex0,vertex1,connectionType0,connectionType1) {
  debugger;
  let edgeConnectionType = this.__connectionType; // some edges, eg elbow edges, mandate a connection type.
  let tr = this.__getTranslation();
  let end0 = this.end0;
  let end1 = this.end1;
  let vertex0pos = vertex0.__getTranslation();
  let vertex1pos = vertex1.__getTranslation();
  let direction0 = vertex0pos.directionTo(vertex1pos);
  let direction1 = direction0.minus();
  const updateEnd = function (end,vertex,direction,connectionType) {
    let pnt,ppnt;
    if ((connectionType === 'periphery') || (connectionType === 'EastWest')) {
      ppnt = vertex.peripheryAtDirection(direction);
      let dist = ppnt.intersection.distance(vertex.__getTranslation());
      console.log('DIST',dist);
      end.copyto(ppnt.intersection.difference(tr));
    } else {
      let split = connectionType.split(',');
      let side = Number(split[1]);
      let fractionAlong = Number(split[2]);
      pnt = vertex.alongPeriphery(side,fractionAlong);
      end.copyto(pnt);
    }
  }
  let dirPositive = direction0.x > 0;
  if ((connectionType0 === 'EastWest') || (edgeConnectionType === 'EastWest') ) {
    direction0 = geom.Point.mk(dirPositive?1:-1,0);
  }
  if ((connectionType1 === 'EastWest') ||  (edgeConnectionType === 'EastWest')) {
    direction1 = geom.Point.mk(dirPositive?-1:1,0);
  }
  updateEnd(end0,vertex0,direction0,connectionType0);
  updateEnd(end1,vertex1,direction1,connectionType1);
}


/* the next three functions are duplicated in /diagram/graph.js */

const edgeInstanceTransferFunction = function (dest,src) {
  if (dest.setEnds) {
    dest.setEnds(src.end0,src.end1);
  }
}

const uiHideEdgeProperties = function (item) {
  ui.hide(item,['end0connection','end1connection','end0vertex','end1vertex','__connectionType','__connectEnd0EW',
                '__connectEnd1EW']);
}

item.setupAsEdge = function (e) {
  e.__role = 'edge';
  e.__instanceTransferFunction = edgeInstanceTransferFunction;
  uiHideEdgeProperties(e);
  return e;
}

item.installOps = function(where) {
  where.updateConnectedEnds = this.updateConnectedEnds;
  where.setupAsEdge = this.setupAsEdge;
}
return item;
});