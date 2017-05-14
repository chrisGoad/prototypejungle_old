'use strict';

pj.require(function () {
let  geom =  pj.geom;

let item = pj.Object.mk();

item.updateConnectedEnds = function (vertex0,vertex1,connectionType0,connectionType1) {
  debugger;
  let tr = this.__getTranslation();
  let end0 = this.end0;
  let end1 = this.end1;
  var vertex0pos = vertex0.__getTranslation();
  var vertex1pos = vertex1.__getTranslation();
  var direction0 = vertex0pos.directionTo(vertex1pos);
  var direction1 = direction0.minus();
  var updateEnd = function (end,vertex,direction,connectionType) {
    let pnt,ppnt;
    if (connectionType === 'periphery') {
      ppnt = vertex.peripheryAtDirection(direction);
      var dist = ppnt.intersection.distance(vertex.__getTranslation());
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
  updateEnd(end0,vertex0,direction0,connectionType0);
  updateEnd(end1,vertex1,direction1,connectionType1);
}

item.installOps = function(where) {
  where.updateConnectedEnds = this.updateConnectedEnds;
}
return item;
});