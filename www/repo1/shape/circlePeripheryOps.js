'use strict';

pj.require(function () {
let  geom =  pj.geom;

let item = pj.Object.mk();

item.peripheryAtDirection = function (direction) {
  var center = this.__getTranslation();
  var intersection = center.plus(direction.times(0.5 * this.dimension));
  var angle = Math.atan2(direction.y,direction.x);
  var fraction = angle/(Math.PI * 2);
  return {intersection:intersection,side:0,sideFraction:fraction}; //todo get the side fraction right
}

item.alongPeriphery = function (edge,fraction) {
  var center = this.__getTranslation();
  var a = 2 * Math.PI * fraction;
  var d = geom.Point.mk(Math.cos(a),Math.sin(a));
  return center.plus(d.times(0.5 * this.dimension));
}

item.installOps = function(where) {
  where.peripheryAtDirection = this.peripheryAtDirection;
  where.alongPeriphery  = this.alongPeriphery;
}
return item;
});