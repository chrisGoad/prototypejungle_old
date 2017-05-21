'use strict';

pj.require(function () {
const  geom =  pj.geom;

let item = pj.Object.mk();

item.updateConnectedEnds = function (vertex0,vertex1,connectionType0,connectionType1) {
  debugger;
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
  if (connectionType0 === 'EastWest') {
    direction0 = geom.Point.mk(dirPositive?1:-1,0);
  }
  if (connectionType1 === 'EastWest') {
    direction1 = geom.Point.mk(dirPositive?-1:1,0);
  }
  updateEnd(end0,vertex0,direction0,connectionType0);
  updateEnd(end1,vertex1,direction1,connectionType1);
}

item.installOps = function(where) {
  where.updateConnectedEnds = this.updateConnectedEnds;
}
return item;
});