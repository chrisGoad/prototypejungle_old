'use strict';

pj.require(function () {
var  geom =  pj.geom;

var item = pj.Object.mk();

item.peripheryAtDirection = function (direction) {
  var center = this.__getTranslation();
  console.log('dimension',this.__dimension);
  var intersection = center.plus(direction.times(0.5 * this.__dimension));
  var angle = Math.atan2(direction.y,direction.x);
  var fraction = angle/(Math.PI * 2);
  return {intersection:intersection,side:0,sideFraction:fraction}; //todo get the side fraction right
}

item.alongPeriphery = function (edge,fraction) {
  var center = this.__getTranslation();
  var a = 2 * Math.PI * fraction;
  var d = geom.Point.mk(Math.cos(a),Math.sin(a));
  return center.plus(d.times(0.5 * this.__dimension));
}

item.installOps = function(where) {
  where.peripheryAtDirection = this.peripheryAtDirection;
  where.alongPeriphery  = this.alongPeriphery;
}
return item;
});