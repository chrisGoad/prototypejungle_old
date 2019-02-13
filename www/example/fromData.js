core.require('/container/circle.js',function (circlePP) {

// simple example of buildFromData
let item = svg.Element.mk('<g/>');

let dataString = '["a","b","c"]';
item.separation = 50;

item.buildFromData = function (data) {
  // buildFromData is responsible for emptying  out the former state, 
  // which is held in this.circles in this case
  if (this.circles) {
    this.circles.remove();
  }
  this.set('circles',svg.Element.mk('<g/>'));
  let ln = data.length;
  let circleP = this.circleP;
  let sep = this.separation;
  for (let i=0;i<ln;i++) {
    let circle = this.circles.add(circleP.instantiate()).show();
    circle.text = data[i];
    circle.moveto(geom.Point.mk(sep*i,0));
  }
}

item.initialize = function () {
  this.circleP = core.installPrototype(circlePP);
  let data = item.initializeData(dataString);
  this.buildFromData(data);
}

return item;
});
